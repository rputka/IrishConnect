from flask import Flask, render_template, request, redirect, url_for, session, jsonify, abort
from datetime import datetime, timezone
import os
import re
from database import db
from sqlalchemy import or_, and_, create_engine, case
import models
from alg import rebuild_on_new_user, return_similarities_weighted, load_user_weights, save_user_weights
from urllib.parse import urlparse

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'mysql+pymysql://jrelling:bananas@localhost/jrelling' 
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['SECRET_KEY'] = 'irishconnect-secret-key-change-in-production'

db.init_app(app)

# Create a SQLAlchemy Core engine for alg.py
engine = create_engine(app.config['SQLALCHEMY_DATABASE_URI'], future=True)

# Jinja2 filter to convert Google Drive URLs to thumbnail format
@app.template_filter('drive_thumbnail')
def drive_thumbnail(url):
    """Convert Google Drive open URL to thumbnail URL for direct image display"""
    if not url:
        return url
    # Match Google Drive open URL format: https://drive.google.com/open?id=FILE_ID
    match = re.search(r'drive\.google\.com/open\?id=([^&\s]+)', url)
    if match:
        file_id = match.group(1)
        return f'https://drive.google.com/thumbnail?id={file_id}&sz=w1000'
    # If already in thumbnail format or other format, return as-is
    return url


def get_most_recent_semester(stc_entries):
    """
    Find the most recent semester from StudentTakesCourse entries.
    Semester format: FA25, SP26, etc. (2 letters + 2 digits)
    Sorting: FA25 < SP26 < FA26 < SP27 (year first, then SP < FA within same year)
    Returns the most recent semester string or None if no valid semesters found.
    """
    if not stc_entries:
        return None
    
    semesters = set()
    for stc, course in stc_entries:
        sem = (stc.semester_year or '').strip()
        if sem and len(sem) >= 4:
            semesters.add(sem)
    
    if not semesters:
        return None
    
    def semester_key(sem):
        """Sort key: (year, semester_code) where SP=1, FA=2"""
        if len(sem) >= 4:
            try:
                year = int(sem[2:4])
                # SP (Spring) = 1, FA (Fall) = 2 (Spring comes before Fall in same year)
                sem_code = 1 if sem[:2].upper() == 'SP' else 2
                return (year, sem_code)
            except ValueError:
                return (0, 0)
        return (0, 0)
    
    return max(semesters, key=semester_key)

@app.route("/")
def index():
    return redirect(url_for('login'))

@app.route("/login", methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        ndid = request.form.get('email', '').strip() 
        password = request.form.get('password', '').strip()
        
        if ndid and password:
            student = models.Student.query.filter_by(NDID=ndid, password=password).first()
            if student:
                session['NDID'] = ndid
                return redirect(url_for('home'))
            else:
                return render_template('login.html', error='Invalid login')
    
    return render_template('login.html')

@app.route("/register", methods=['GET', 'POST'])
def register():
    if request.method == 'POST':
        ndid = request.form.get('NDID', '').strip()
        first_name = request.form.get('first_name', '').strip()
        last_name = request.form.get('last_name', '').strip()
        email = request.form.get('email', '').strip()
        password = request.form.get('password', '').strip()
        grad_year = request.form.get('grad_year', '').strip() or None
        hometown = request.form.get('hometown', '').strip() or None
        homestate = request.form.get('homestate', '').strip() or None
        home_country = request.form.get('home_country', '').strip() or None
        dorm = request.form.get('dorm', '').strip() or None
        
        # Handle file upload
        profile_photo_url = None
        if 'profile_photo' in request.files:
            file = request.files['profile_photo']
            if file and file.filename:
                # TODO: implement file upload and storage
                profile_photo_url = None  # placeholder
        
        # Handle multiple majors/minors - combine into comma-separated string
        majors = request.form.getlist('major')
        major = ', '.join([m.strip() for m in majors if m.strip()]) or None
        
        minors = request.form.getlist('minor')
        minor = ', '.join([m.strip() for m in minors if m.strip()]) or None
        
        # Check if user already exists
        existing_student = models.Student.query.filter_by(NDID=ndid).first()
        if existing_student:
            return render_template('register.html', error='ND ID already registered')
        
        # Create new student
        try:
            new_student = models.Student(
                NDID=ndid,
                first_name=first_name,
                last_name=last_name,
                email=email,
                password=password,
                grad_year=grad_year,
                hometown=hometown,
                homestate=homestate,
                home_country=home_country,
                dorm=dorm,
                profile_photo_url=profile_photo_url,
                major=major,
                minor=minor
            )
            db.session.add(new_student)
            db.session.commit()
            
            # Handle courses
            course_names = request.form.getlist('course_name')
            course_crns = request.form.getlist('course_crn')
            course_profs = request.form.getlist('course_prof')
            semester_year = request.form.get('course_semester', '').upper()
            
            for i, crn in enumerate(course_crns):
                crn = crn.strip()
                if crn:
                    course_name = course_names[i].strip() if i < len(course_names) else None
                    course_prof = course_profs[i].strip() if i < len(course_profs) else None
                    
                    # Create course if it doesn't exist
                    course = models.Course.query.filter_by(CRN=crn).first()
                    if not course:
                        course = models.Course(CRN=crn, name=course_name, prof_name=course_prof)
                        db.session.add(course)
                        db.session.commit()
                    
                    # Add student-course association
                    stc = models.StudentTakesCourse(fk_NDID=ndid, fk_crn=crn, semester_year=semester_year)
                    db.session.add(stc)
                    db.session.commit()
            
            # Handle internships
            internship_companies = request.form.getlist('internship_company')
            internship_roles = request.form.getlist('internship_role')
            
            for i, company in enumerate(internship_companies):
                company = company.strip()
                if company:
                    role = internship_roles[i].strip() if i < len(internship_roles) else None
                    internship = models.Internship(fk_NDID=ndid, company=company, position=role)
                    db.session.add(internship)
                    db.session.commit()
            
            # Handle clubs
            clubs = request.form.getlist('club')
            for club_name in clubs:
                club_name = club_name.strip()
                if club_name:
                    # Create club if it doesn't exist
                    club = models.Club.query.filter_by(club_name=club_name).first()
                    if not club:
                        club = models.Club(club_name=club_name, category=None)
                        db.session.add(club)
                        db.session.commit()
                    
                    # Add student-club association
                    sic = models.StudentInClub(fk_NDID=ndid, fk_club_name=club_name)
                    db.session.add(sic)
                    db.session.commit()
            
            # Handle social media
            instagram = request.form.get('instagram', '').strip()
            snapchat = request.form.get('snapchat', '').strip()
            linkedin = request.form.get('linkedin', '').strip()
            
            if instagram:
                sm = models.SocialMedia(fk_NDID=ndid, platform_name='Instagram', user_handle=instagram)
                db.session.add(sm)
                db.session.commit()
            
            if snapchat:
                sm = models.SocialMedia(fk_NDID=ndid, platform_name='Snapchat', user_handle=snapchat)
                db.session.add(sm)
                db.session.commit()
            
            if linkedin:
                sm = models.SocialMedia(fk_NDID=ndid, platform_name='LinkedIn', user_handle=linkedin)
                db.session.add(sm)
                db.session.commit()

            try:
                rebuild_on_new_user(engine)
            except Exception as e:
                app.logger.warning("Embedding rebuild failed after registration: %s", e)
            
            session['NDID'] = ndid
            return redirect(url_for('home'))
            
        except Exception as e:
            db.session.rollback()
            return render_template('register.html', error=f'Registration failed: {str(e)}')
    
    return render_template('register.html')

@app.route("/logout")
def logout():
    session.clear()
    return redirect(url_for('login'))

# Applies optional filters from query string to the Student query on home page.
# Supports both a global 'q' search and individual field filters.
def apply_student_filters(query):
    q = request.args.get('q', type=str)
    grad_year = request.args.get('grad_year', type=str)
    hometown = request.args.get('hometown', type=str)
    homestate = request.args.get('homestate', type=str)
    dorm = request.args.get('dorm', type=str)
    major = request.args.get('major', type=str)
    minor = request.args.get('minor', type=str)
    course = request.args.get('course', type=str)
    professor = request.args.get('professor', type=str)
    club = request.args.get('club', type=str)
    company = request.args.get('company', type=str)
    role = request.args.get('role', type=str)

    if q:
        like = f"%{q}%"
        query = query.filter(or_(
            models.Student.first_name.ilike(like),
            models.Student.last_name.ilike(like),
        ))

    # field-specific filters (case-insensitive, partial matches)
    def add_like(field_val, column):
        nonlocal query
        if field_val:
            query = query.filter(column.ilike(f"%{field_val}%"))

    add_like(grad_year, models.Student.grad_year)
    add_like(hometown, models.Student.hometown)
    add_like(homestate, models.Student.homestate)
    add_like(dorm, models.Student.dorm)
    add_like(major, models.Student.major)
    add_like(minor, models.Student.minor)

    # Course filter - join with Course and StudentTakesCourse
    if course:
        query = query.join(models.StudentTakesCourse, models.Student.NDID == models.StudentTakesCourse.fk_NDID).join(
            models.Course, models.StudentTakesCourse.fk_crn == models.Course.CRN
        ).filter(models.Course.name.ilike(f"%{course}%")).distinct()

    # Professor filter - join with Course (prof_name) via StudentTakesCourse
    if professor:
        query = query.join(models.StudentTakesCourse, models.Student.NDID == models.StudentTakesCourse.fk_NDID).join(
            models.Course, models.StudentTakesCourse.fk_crn == models.Course.CRN
        ).filter(models.Course.prof_name.ilike(f"%{professor}%")).distinct()

    # Club filter - join with Club and StudentInClub
    if club:
        query = query.join(models.StudentInClub, models.Student.NDID == models.StudentInClub.fk_NDID).join(
            models.Club, models.StudentInClub.fk_club_name == models.Club.club_name
        ).filter(models.Club.club_name.ilike(f"%{club}%")).distinct()

    # Company filter - join with Internship
    if company:
        query = query.join(models.Internship, models.Student.NDID == models.Internship.fk_NDID).filter(
            models.Internship.company.ilike(f"%{company}%")
        ).distinct()

    # Role filter - join with Internship
    if role:
        query = query.join(models.Internship, models.Student.NDID == models.Internship.fk_NDID).filter(
            models.Internship.position.ilike(f"%{role}%")
        ).distinct()

    return query

@app.route("/home", methods=['GET'])
def home():
    try:
        ndid = session['NDID']
    except KeyError:
        return redirect(url_for('login'))
    
    # pagination params
    page = request.args.get('page', default=1, type=int)
    per_page = request.args.get('per_page', default=12, type=int)
    per_page = max(1, min(per_page, 100))  # sanity cap

    # base query
    base_q = models.Student.query.order_by(models.Student.last_name.asc(), models.Student.first_name.asc())

    # apply filters
    filtered_q = apply_student_filters(base_q)

    # remove yourself from results
    filtered_q = filtered_q.filter(models.Student.NDID != ndid)

    # pagination (Flask-SQLAlchemy 3.x style)
    pagination = filtered_q.paginate(page=page, per_page=per_page, error_out=False)

    # get current user's student object for profile icon
    current_user = models.Student.query.filter_by(NDID=ndid).first()

    return render_template(
        'home.html',
        dbrows=pagination.items,
        pagination=pagination,
        my_ndid=ndid,
        current_user=current_user
    )


# view another user's profile
@app.route("/user/<ndid>", methods=['GET'])
def view_user(ndid):
    student = models.Student.query.filter_by(NDID=ndid).first_or_404()

    # Getting logged in user NDID to display in banner
    active_ndid = session["NDID"]
    active_user = models.Student.query.filter_by(NDID=active_ndid).first()
    is_own_profile = ('NDID' in session and active_user.NDID == ndid)

    internships = models.Internship.query.filter_by(fk_NDID=ndid).all()

    # Get Course objects for courses the student takes (join via StudentTakesCourse)
    stc_entries = db.session.query(models.StudentTakesCourse, models.Course).join(
        models.Course, models.StudentTakesCourse.fk_crn == models.Course.CRN
    ).filter(models.StudentTakesCourse.fk_NDID == ndid).all()

    # Find the most recent semester
    current_semester = get_most_recent_semester(stc_entries)

    current_courses = []
    past_courses = []
    for stc, course in stc_entries:
        sem = (stc.semester_year or '').strip()
        if sem == current_semester:
            current_courses.append(course)
        else:
            past_courses.append(course)

    clubs = db.session.query(models.Club).join(
        models.StudentInClub, models.Club.club_name == models.StudentInClub.fk_club_name
    ).filter(models.StudentInClub.fk_NDID == ndid).all()
    
    # Query for social media handles and attach them to the student object
    socials = models.SocialMedia.query.filter_by(fk_NDID=ndid).all()
    student.instagram_url = next((s.user_handle for s in socials if s.platform_name == 'Instagram'), None)
    student.snapchat_url = next((s.user_handle for s in socials if s.platform_name == 'Snapchat'), None)
    student.linkedin_url = next((s.user_handle for s in socials if s.platform_name == 'LinkedIn'), None)

    # Get current user for header (logged-in user)
    current_user = None
    if 'NDID' in session:
        current_user = models.Student.query.get(session['NDID'])

    # Build back URL (default is home)
    next_url = request.args.get('next') or ''
    back_url = None
    if isinstance(next_url, str) and next_url.startswith('/') and not re.match(r'^[a-zA-z]+://', next_url):
        back_url = next_url
    if not back_url:
        # try same-origin
        try:
            ref = request.referrer or ''
            p = urlparse(ref)
            if p.scheme in ('http', 'https') and p.netloc == request.host and p.path.startswith('/'):
                back_url = p.path + (f'?{p.query}' if p.query else '')
        except Exception:
            pass
    if not back_url:
        back_url = url_for('home')

    # print(f"Before Check: {back_url}")

    if re.match(r'^/user/\d{9}\?next=/home', back_url):
        back_url = url_for('home')
    elif re.match(r'^/user/\d{9}\?next=/algorithm', back_url):
        back_url = url_for('algorithm')

    # print(f"After Check: {back_url}")

    return render_template(
        'profile.html',
        student=student,
        current_user=current_user,
        internships=internships,
        current_courses=current_courses,
        past_courses=past_courses,
        clubs=clubs,
        is_own_profile=is_own_profile,
        active_user=active_user,
        back_url=back_url
    )

# edit profile
@app.route("/editprofile/<ndid>", methods=['GET', 'POST'])
def edit_profile(ndid):
    student = models.Student.query.filter_by(NDID=ndid).first()
    # gather existing profile-linked data to render edit page (and to use identifiers for deletes)
    internships = models.Internship.query.filter_by(fk_NDID=ndid).all()

    # Get Course objects and their StudentTakesCourse rows for this student
    stc_entries = db.session.query(models.StudentTakesCourse, models.Course).join(
        models.Course, models.StudentTakesCourse.fk_crn == models.Course.CRN
    ).filter(models.StudentTakesCourse.fk_NDID == ndid).all()

    # Find the most recent semester
    current_semester = get_most_recent_semester(stc_entries)

    current_courses = []
    past_courses = []
    # keep the StudentTakesCourse row together with course so we can delete by crn
    for stc, course in stc_entries:
        sem = (stc.semester_year or '').strip()
        if sem == current_semester:
            current_courses.append((stc, course))
        else:
            past_courses.append((stc, course))

    clubs = db.session.query(models.Club).join(
        models.StudentInClub, models.Club.club_name == models.StudentInClub.fk_club_name
    ).filter(models.StudentInClub.fk_NDID == ndid).all()
    
    social_media = models.SocialMedia.query.filter_by(fk_NDID=ndid).all()

    if request.method == 'POST':

        # Delete profile/user info
        if 'delete_profile' in request.form:
            
            try:
                # delete internships (ORM objects)
                internships_to_del = models.Internship.query.filter_by(fk_NDID=ndid).all()
                for inst in internships_to_del:
                    db.session.delete(inst)

                # delete student-course associations (ORM objects)
                stc_entries_to_del = models.StudentTakesCourse.query.filter_by(fk_NDID=ndid).all()
                for stc in stc_entries_to_del:
                    db.session.delete(stc)

                # delete student-club associations (ORM objects)
                sic_entries_to_del = models.StudentInClub.query.filter_by(fk_NDID=ndid).all()
                for sic in sic_entries_to_del:
                    db.session.delete(sic)

                # delete social media (ORM objects)
                sm_entries_to_del = models.SocialMedia.query.filter_by(fk_NDID=ndid).all()
                for sm in sm_entries_to_del:
                    db.session.delete(sm)

                # delete the student row via ORM
                student_obj = models.Student.query.filter_by(NDID=ndid).first()
                if student_obj:
                    db.session.delete(student_obj)

                db.session.commit()
            except Exception:
                db.session.rollback()
            
            return redirect(url_for('logout'))

        # Save profile changes (full form submission)
        if 'save_profile' in request.form:
            try:
                # Update basic student info
                student.first_name = request.form.get('first_name', student.first_name)
                student.last_name = request.form.get('last_name', student.last_name)
                student.email = request.form.get('email', student.email)
                student.grad_year = request.form.get('grad_year', student.grad_year) or None
                student.hometown = request.form.get('hometown', student.hometown) or None
                student.homestate = request.form.get('homestate', student.homestate) or None
                student.home_country = request.form.get('home_country', student.home_country) or None
                student.dorm = request.form.get('dorm', student.dorm) or None
                student.profile_photo_url = request.form.get('profile_photo_url', student.profile_photo_url) or None
                
                # Handle password update if provided
                password = request.form.get('password', '').strip()
                if password:
                    student.password = password
                
                # Handle multiple majors/minors - combine into comma-separated string
                majors = request.form.getlist('major')
                student.major = ', '.join([m.strip() for m in majors if m.strip()]) or None
                
                minors = request.form.getlist('minor')
                student.minor = ', '.join([m.strip() for m in minors if m.strip()]) or None
                
                # Handle courses
                course_names = request.form.getlist('course_name')
                course_crns = request.form.getlist('course_crn')
                course_profs = request.form.getlist('course_prof')
                semester_year_str = request.form.get('course_semester', '').strip()
                semester_year = semester_year_str.upper() if semester_year_str else None
                
                # Get existing course CRNs for the current semester only (to identify which are updates vs new)
                # Only delete courses from the current semester, keep courses from other semesters
                existing_stc_current_semester = models.StudentTakesCourse.query.filter_by(
                    fk_NDID=ndid, 
                    semester_year=semester_year
                ).all() if semester_year else []
                existing_crns_current_semester = set([stc.fk_crn for stc in existing_stc_current_semester])
                submitted_crns = set()
                
                for i, crn in enumerate(course_crns):
                    crn = crn.strip()
                    if crn:
                        submitted_crns.add(crn)
                        course_name = course_names[i].strip() if i < len(course_names) else None
                        course_prof = course_profs[i].strip() if i < len(course_profs) else None
                        
                        # Update or create course
                        course = models.Course.query.filter_by(CRN=crn).first()
                        if course:
                            if course_name:
                                course.name = course_name
                            if course_prof:
                                course.prof_name = course_prof
                        else:
                            course = models.Course(CRN=crn, name=course_name, prof_name=course_prof)
                            db.session.add(course)
                        
                        # Update or create StudentTakesCourse for current semester
                        stc = models.StudentTakesCourse.query.filter_by(fk_NDID=ndid, fk_crn=crn, semester_year=semester_year).first()
                        if stc:
                            # Update existing entry (semester already matches)
                            pass
                        else:
                            # Check if there's an existing entry for this CRN but different semester
                            # If so, create a new entry for the new semester (don't update the old one)
                            stc = models.StudentTakesCourse(fk_NDID=ndid, fk_crn=crn, semester_year=semester_year)
                            db.session.add(stc)
                
                # Remove courses that were deleted from the current semester only
                # This preserves courses from previous semesters
                for crn in existing_crns_current_semester - submitted_crns:
                    stc = models.StudentTakesCourse.query.filter_by(fk_NDID=ndid, fk_crn=crn, semester_year=semester_year).first()
                    if stc:
                        db.session.delete(stc)
                
                # Handle internships
                internship_companies = request.form.getlist('internship_company')
                internship_roles = request.form.getlist('internship_role')
                
                # Get existing internships (company is part of primary key)
                existing_companies = set([inst.company for inst in models.Internship.query.filter_by(fk_NDID=ndid).all()])
                submitted_companies = set()
                
                for i, company in enumerate(internship_companies):
                    company = company.strip()
                    if company:
                        submitted_companies.add(company)
                        role = internship_roles[i].strip() if i < len(internship_roles) else None
                        existing = models.Internship.query.filter_by(fk_NDID=ndid, company=company).first()
                        if existing:
                            # Update existing internship
                            if role:
                                existing.position = role
                        else:
                            # Create new internship
                            internship = models.Internship(fk_NDID=ndid, company=company, position=role)
                            db.session.add(internship)
                
                # Remove internships that were deleted
                for company in existing_companies - submitted_companies:
                    inst = models.Internship.query.filter_by(fk_NDID=ndid, company=company).first()
                    if inst:
                        db.session.delete(inst)
                
                # Handle clubs
                clubs = request.form.getlist('club')
                existing_clubs = set([sic.fk_club_name for sic in models.StudentInClub.query.filter_by(fk_NDID=ndid).all()])
                submitted_clubs = set()
                
                for club_name in clubs:
                    club_name = club_name.strip()
                    if club_name:
                        submitted_clubs.add(club_name)
                        # Create club if it doesn't exist
                        club = models.Club.query.filter_by(club_name=club_name).first()
                        if not club:
                            club = models.Club(club_name=club_name, category=None)
                            db.session.add(club)
                            db.session.commit()
                        
                        # Add student-club association if not exists
                        existing = models.StudentInClub.query.filter_by(fk_NDID=ndid, fk_club_name=club_name).first()
                        if not existing:
                            sic = models.StudentInClub(fk_NDID=ndid, fk_club_name=club_name)
                            db.session.add(sic)
                
                # Remove clubs that were deleted
                for club_name in existing_clubs - submitted_clubs:
                    sic = models.StudentInClub.query.filter_by(fk_NDID=ndid, fk_club_name=club_name).first()
                    if sic:
                        db.session.delete(sic)
                
                # Handle social media
                instagram = request.form.get('instagram', '').strip()
                snapchat = request.form.get('snapchat', '').strip()
                linkedin = request.form.get('linkedin', '').strip()
                
                # Update or create Instagram
                sm_insta = models.SocialMedia.query.filter_by(fk_NDID=ndid, platform_name='Instagram').first()
                if instagram:
                    if sm_insta:
                        sm_insta.user_handle = instagram
                    else:
                        sm_insta = models.SocialMedia(fk_NDID=ndid, platform_name='Instagram', user_handle=instagram)
                        db.session.add(sm_insta)
                elif sm_insta:
                    db.session.delete(sm_insta)
                
                # Update or create Snapchat
                sm_snap = models.SocialMedia.query.filter_by(fk_NDID=ndid, platform_name='Snapchat').first()
                if snapchat:
                    if sm_snap:
                        sm_snap.user_handle = snapchat
                    else:
                        sm_snap = models.SocialMedia(fk_NDID=ndid, platform_name='Snapchat', user_handle=snapchat)
                        db.session.add(sm_snap)
                elif sm_snap:
                    db.session.delete(sm_snap)
                
                # Update or create LinkedIn
                sm_linkedin = models.SocialMedia.query.filter_by(fk_NDID=ndid, platform_name='LinkedIn').first()
                if linkedin:
                    if sm_linkedin:
                        sm_linkedin.user_handle = linkedin
                    else:
                        sm_linkedin = models.SocialMedia(fk_NDID=ndid, platform_name='LinkedIn', user_handle=linkedin)
                        db.session.add(sm_linkedin)
                elif sm_linkedin:
                    db.session.delete(sm_linkedin)
                
                db.session.commit()
                return redirect(url_for('view_user', ndid=ndid))
            except Exception as e:
                db.session.rollback()
                all_courses = current_courses + past_courses
                return render_template('edit.html', 
                    student=student,
                    internships=internships,
                    current_courses=current_courses,
                    past_courses=past_courses,
                    all_courses=all_courses,
                    clubs=clubs,
                    social_media=social_media,
                    error='Failed to update profile. Please try again.')
    
    # Combine all courses for the edit form (we'll show them all together)
    all_courses = current_courses + past_courses
    
    return render_template(
        'edit.html',
        student=student,
        internships=internships,
        current_courses=current_courses,
        past_courses=past_courses,
        all_courses=all_courses,
        clubs=clubs,
        social_media=social_media,
    )

# -- CHAT FUNCTIONALITY --

# helper for chat func
def ensure_member_or_404(group_id: int, ndid: str):
    is_member = models.StudentInGroupChat.query.filter_by(FK_group_ID=group_id, FK_NDID=ndid).first()
    if not is_member:
        abort(404)  # hide existence if not a member
    
# base route for chat
@app.route("/chat", methods=['GET'])
def chat():
    if 'NDID' not in session:
        return redirect(url_for('login'))
    ndid = session['NDID']

    current_user = models.Student.query.get(ndid)
    # preload user’s groups for sidebar
    groups = db.session.query(models.GroupChat).join(
        models.StudentInGroupChat, models.GroupChat.groupID == models.StudentInGroupChat.FK_group_ID
    ).filter(models.StudentInGroupChat.FK_NDID == ndid).order_by(models.GroupChat.group_name.asc()).all()
    return render_template("chat.html", my_ndid=ndid, current_user=current_user, groups=groups)

# create a group
@app.route("/groupchat/create", methods=['POST'])
def create_group():
    if 'NDID' not in session:
        return redirect(url_for('login'))
    NDID = session['NDID']
    name = (request.form.get('group_name') or "").strip()
    if not name:
        return jsonify({"error": "Group name required"}), 400

    gc = models.GroupChat(group_name=name, FK_NDID_created_by=NDID)
    db.session.add(gc)
    db.session.flush()  # get groupID
    # add creator as member
    db.session.add(models.StudentInGroupChat(FK_group_ID=gc.groupID, FK_NDID=NDID))
    db.session.commit()
    return redirect(url_for('chat', _anchor=f"group-{gc.groupID}"))


# delete a group (only creator)
@app.route("/groupchat/<int:group_id>/delete", methods=['POST'])
def delete_group(group_id):
    if 'NDID' not in session:
        return redirect(url_for('login'))
    NDID = session['NDID']

    gc = models.GroupChat.query.get(group_id)
    if not gc:
        return jsonify({"error": "Group not found"}), 404
    if gc.FK_NDID_created_by != NDID:
        return jsonify({"error": "Not authorized"}), 403

    try:
        # remove messages and memberships before deleting the group
        models.Messages.query.filter_by(FK_group_ID=group_id).delete()
        models.StudentInGroupChat.query.filter_by(FK_group_ID=group_id).delete()
        db.session.delete(gc)
        db.session.commit()
        return jsonify({"ok": True})
    except Exception:
        db.session.rollback()
        return jsonify({"error": "Failed to delete group"}), 500

# Add a member by NDID
@app.route("/groupchat/<int:group_id>/add_member", methods=['POST'])
def add_member(group_id):
    if 'NDID' not in session:
        return redirect(url_for('login'))
    NDID = session['NDID']

    ensure_member_or_404(group_id, NDID)  # only members can add others

    new_NDID = (request.form.get('NDID') or "").strip()
    if not new_NDID:
        return jsonify({"error": "NDID required"}), 400
    # must exist
    if not models.Student.query.get(new_NDID):
        return jsonify({"error": "Student not found"}), 404

    exists = models.StudentInGroupChat.query.filter_by(FK_group_ID=group_id, FK_NDID=new_NDID).first()
    if exists:
        return jsonify({"ok": True, "message": "Already a member"})
    db.session.add(models.StudentInGroupChat(FK_group_ID=group_id, FK_NDID=new_NDID))
    db.session.commit()
    return jsonify({"ok": True})


# List members of a group (names + NDID)
@app.route("/api/group/<int:group_id>/members", methods=['GET'])
def api_group_members(group_id):
    if 'NDID' not in session:
        return redirect(url_for('login'))
    NDID = session['NDID']

    ensure_member_or_404(group_id, NDID)

    rows = db.session.query(models.Student).join(
        models.StudentInGroupChat, models.Student.NDID == models.StudentInGroupChat.FK_NDID
    ).filter(models.StudentInGroupChat.FK_group_ID == group_id).order_by(models.Student.last_name.asc(), models.Student.first_name.asc()).all()

    return jsonify([
        {
            "NDID": s.NDID,
            "name": f"{s.first_name} {s.last_name}".strip() or s.NDID
        } for s in rows
    ])

# List user’s groups (JSON for sidebar refresh if needed)
@app.route("/api/groups", methods=['GET'])
def api_groups():
    if 'NDID' not in session:
        return redirect(url_for('login'))
    NDID = session['NDID']

    rows = db.session.query(models.GroupChat).join(
        models.StudentInGroupChat, models.GroupChat.groupID == models.StudentInGroupChat.FK_group_ID
    ).filter(models.StudentInGroupChat.FK_NDID == NDID).order_by(models.GroupChat.group_name.asc()).all()
    return jsonify([{"groupID": g.groupID, "group_name": g.group_name} for g in rows])


# Messages
# helper function for parsing datetime
def _parse_iso(ts):
    if not ts:
        return None
    ts = ts.strip()
    # we emit "YYYY-MM-DDTHH:MM:SS" from the API
    for fmt in ("%Y-%m-%dT%H:%M:%S", "%Y-%m-%dT%H:%M:%S.%f"):
        try:
            return datetime.strptime(ts, fmt)
        except ValueError:
            continue
    return None

# getting previous messages
@app.route("/api/group/<int:group_id>/messages", methods=['GET'])
def api_messages(group_id):
    if 'NDID' not in session:
        return redirect(url_for('login'))
    NDID = session['NDID']

    ensure_member_or_404(group_id, NDID)

    after_ts = _parse_iso(request.args.get('after_ts'))
    after_sender = request.args.get('after_sender')

    q = models.Messages.query.filter_by(FK_group_ID=group_id)

    if after_ts:
        # (ts > after_ts) OR (ts = after_ts AND sender > after_sender)
        if after_sender:
            q = q.filter(
                or_(
                    models.Messages.timestamp > after_ts,
                    and_(models.Messages.timestamp == after_ts, models.Messages.FK_sender_NDID > after_sender)
                )
            )
        else:
            q = q.filter(models.Messages.timestamp > after_ts)

    q = q.order_by(models.Messages.timestamp.asc(), models.Messages.FK_sender_NDID.asc()).limit(200)

    msgs = q.all()

    # join sender names
    senders = {m.FK_sender_NDID for m in msgs}
    sender_map = {s.NDID: f"{s.first_name} {s.last_name}"
                  for s in models.Student.query.filter(models.Student.NDID.in_(senders)).all()}

    return jsonify([
        {
            "sender": m.FK_sender_NDID,
            "sender_name": sender_map.get(m.FK_sender_NDID, m.FK_sender_NDID),
            "text": m.message_text or "",
            "ts": m.timestamp.strftime("%Y-%m-%dT%H:%M:%S"),
        } for m in msgs
    ])

# sending a message
@app.route("/api/group/<int:group_id>/messages", methods=['POST'])
def api_send_message(group_id):
    if 'NDID' not in session:
        return redirect(url_for('login'))
    NDID = session['NDID']

    ensure_member_or_404(group_id, NDID)

    text = (request.form.get('text') or "").strip()
    if not text:
        return jsonify({"error": "Empty message"}), 400

    # explicitly set timestamp so the client immediately knows it
    now = datetime.now(timezone.utc)
    m = models.Messages(FK_group_ID=group_id, FK_sender_NDID=NDID, timestamp=now, message_text=text)
    db.session.add(m)
    db.session.commit()

    return jsonify({"ok": True, "ts": now.isoformat() + "Z", "sender": NDID})

# Algorithm route
@app.route("/algorithm", methods=['GET'])
def algorithm():
    if 'NDID' not in session:
        return redirect(url_for('login'))
    
    ndid = session['NDID']
    n = request.args.get('n', default=None, type=int)

    try:
        # sim_scores = return_similarities(NDID, engine, n=n)
        weights = load_user_weights(ndid, engine)
        sim_scores = return_similarities_weighted(ndid, engine, weights, n=n)
        print(f"[Algorithm] Found {len(sim_scores)} similar students for {ndid}")
    except Exception as e:
        print(f"[Algorithm] Error for {ndid}: {e}")
        current_user = models.Student.query.get(ndid)
        return render_template(
            'home.html',
            dbrows=[],
            pagination=None,
            my_ndid=ndid,
            current_user=current_user,
            error="Error loading similar profiles."
        )
    
    ordered_ndids = [ix for ix, _ in sim_scores]
    rank_map = {ix: rank for rank, (ix, _) in enumerate(sim_scores)}

    ordering = case(rank_map, value=models.Student.NDID)

    query = models.Student.query.filter(models.Student.NDID.in_(ordered_ndids)).order_by(ordering)

    # pagination params
    page = request.args.get('page', default=1, type=int)
    per_page = request.args.get('per_page', default=12, type=int)
    per_page = max(1, min(per_page, 100))  # sanity cap

    pagination = db.paginate(query, page=page, per_page=per_page)

    score_lookup = dict(sim_scores)
    for student in pagination.items:
        student.similarity_score = score_lookup.get(student.NDID, 0)
    
    current_user = models.Student.query.get(ndid)

    return render_template(
        'home.html',
        dbrows=pagination.items,
        pagination=pagination,
        my_ndid=ndid,
        current_user=current_user
    )

@app.route("/api/similarity-preferences", methods=["GET", "POST"])
def similarity_preferences():
    if "NDID" not in session:
        abort(401)

    NDID = session["NDID"]

    if request.method == "GET":
        return jsonify(load_user_weights(NDID, engine))

    data = request.json or {}
    save_user_weights(NDID, data, engine)
    return jsonify({"ok": True})

# Server 
if __name__ == '__main__':
    app.debug = True
    app.run(host='0.0.0.0', port=5068) # try ports between 5001-5100
