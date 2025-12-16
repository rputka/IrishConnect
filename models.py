from database import db
from datetime import datetime, timezone
from sqlalchemy.sql import func

# defining database models
class Student(db.Model):
    __tablename__ = 'Student'
    NDID = db.Column(db.CHAR(9), primary_key=True, nullable=False)
    first_name = db.Column(db.String(30), nullable=False)
    last_name = db.Column(db.String(50), nullable=False)
    email = db.Column(db.String(20), unique=True, nullable=False)
    grad_year = db.Column(db.CHAR(4))
    hometown = db.Column(db.String(30))
    homestate = db.Column(db.String(50))
    home_country = db.Column(db.String(30))
    dorm = db.Column(db.String(30))
    profile_photo_url = db.Column(db.String(255))
    major = db.Column(db.String(60))
    minor = db.Column(db.String(60))
    password = db.Column(db.String(30), nullable=False) 

class Course(db.Model):
    __tablename__ = 'Course'
    CRN = db.Column(db.CHAR(5), primary_key=True, nullable=False)
    name = db.Column(db.String(100))
    prof_name = db.Column(db.String(100))

class StudentTakesCourse(db.Model):
    __tablename__ = 'StudentTakesCourse'
    fk_NDID = db.Column(db.CHAR(9), db.ForeignKey('Student.NDID'), primary_key=True, nullable=False)
    fk_crn = db.Column(db.CHAR(5), db.ForeignKey('Course.CRN'), primary_key=True, nullable=False)
    semester_year = db.Column(db.CHAR(4))

class Club(db.Model):
    __tablename__ = 'Club'
    club_name = db.Column(db.String(50), primary_key=True, nullable=False)
    category = db.Column(db.String(50))

class StudentInClub(db.Model):
    __tablename__ = 'StudentInClub'
    fk_NDID = db.Column(db.CHAR(9), db.ForeignKey('Student.NDID'), primary_key=True, nullable=False)
    fk_club_name = db.Column(db.String(50), db.ForeignKey('Club.club_name'), primary_key=True, nullable=False)

class Internship(db.Model):
    __tablename__ = 'Internship'
    fk_NDID = db.Column(db.CHAR(9), db.ForeignKey('Student.NDID'), primary_key=True, nullable=False)
    company = db.Column(db.String(50), primary_key=True, nullable=False)
    position = db.Column(db.String(60))
    year = db.Column(db.CHAR(4))

class SocialMedia(db.Model):
    __tablename__ = 'SocialMedia'
    fk_NDID = db.Column(db.CHAR(9), db.ForeignKey('Student.NDID'), primary_key=True, nullable=False)
    platform_name = db.Column(db.String(20), primary_key=True, nullable=False)
    user_handle = db.Column(db.String(30))


# chat models
class GroupChat(db.Model):
    __tablename__ = 'GroupChat'
    groupID = db.Column(db.Integer, primary_key=True, nullable=False)
    group_name = db.Column(db.String(50))
    FK_NDID_created_by = db.Column(db.CHAR(9), db.ForeignKey('Student.NDID'))
    created_at = db.Column(db.DateTime, default=datetime.now(timezone.utc))

class StudentInGroupChat(db.Model):
    __tablename__ = 'StudentInGroupChat'
    FK_group_ID = db.Column(db.Integer, db.ForeignKey('GroupChat.groupID'), primary_key=True, nullable=False)
    FK_NDID = db.Column(db.CHAR(9), db.ForeignKey('Student.NDID'), primary_key=True, nullable=False)
    join_date = db.Column(db.DateTime, default=datetime.now(timezone.utc))

class Messages(db.Model):
    __tablename__ = 'Messages'
    FK_group_ID    = db.Column(db.Integer, db.ForeignKey('GroupChat.groupID'), primary_key=True, nullable=False)
    FK_sender_NDID = db.Column(db.CHAR(9),   db.ForeignKey('Student.NDID'),   primary_key=True, nullable=False)
    timestamp      = db.Column(db.DateTime,  primary_key=True, nullable=False, server_default=func.now())
    message_text   = db.Column(db.String(255))

    __table_args__ = (
        # helpful for ordered fetches
        db.Index('ix_msg_group_ts_sender', 'FK_group_ID', 'timestamp', 'FK_sender_NDID'),
    )