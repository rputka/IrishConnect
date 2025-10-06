/**
 * Individual student profile page displaying detailed information about a specific student.
 * This file shows comprehensive student details including basic information, academics,
 * professional experience, and social activities. For profile owners, it includes
 * edit and delete functionality with confirmation modals.
 */
"use client";

import { useMemo, useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
// NOTE: We are importing the `STUDENTS` mock data from the data file.
// In a real app, you'd fetch this data based on the `id` param.
import { STUDENTS } from "../../../data/students";
import Modal from "../../../components/Modal";
import Image from "next/image";

export default function ProfilePage() {
  const params = useParams<{ id: string }>();
  const [showClasses, setShowClasses] = useState(false);
  const [isOwnProfile, setIsOwnProfile] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    const currentUserId = localStorage.getItem('currentUserId');
    if (currentUserId && currentUserId === params.id) {
      setIsOwnProfile(true);
    }
  }, [params.id]);

  const student = useMemo(() => {
    return STUDENTS.find((s) => s.id === params.id);
  }, [params.id]);

  if (!student) {
    return (
      <div className="text-center py-10">
        <h2 className="text-2xl font-bold">Student not found</h2>
        <p className="mt-2 text-gray-600">
          Could not find a profile for this student.
        </p>
        <Link href="/" className="mt-6 inline-block rounded-md bg-[#0C2340] px-4 py-2 text-white">
          Back to Student Search
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-4">
        <Link href="/" className="inline-flex items-center gap-2 rounded-md bg-[#0C2340] px-4 py-2 text-sm font-semibold text-white hover:brightness-110">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5"></path><path d="M12 19l-7-7 7-7"></path></svg>
          Back to Student Search
        </Link>
        {isOwnProfile && (
          <div className="flex items-center gap-2">
            <button 
              onClick={() => console.log('Edit profile clicked')}
              className="inline-flex items-center gap-2 rounded-md bg-gray-100 px-3 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-200"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
              Edit Profile
            </button>
            <button 
              onClick={() => setShowDeleteConfirm(true)}
              className="inline-flex items-center gap-2 rounded-md bg-red-50 px-3 py-2 text-sm font-semibold text-red-600 hover:bg-red-100"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
              Delete Profile
            </button>
          </div>
        )}
      </div>

      {/* Banner */}
      <div className="relative rounded-xl overflow-hidden border shadow-sm h-64 sm:h-72">
        <Image
          src="/sunrisenotredame.jpg"
          alt="Notre Dame sunrise"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-black/30" />
        <div className="relative z-10 h-full flex flex-col items-center justify-center text-white text-center px-4">
          <div className="h-24 w-24 shrink-0 rounded-full bg-white/20 backdrop-blur flex items-center justify-center border-4 border-white overflow-hidden">
            {student.profilePhotoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={student.profilePhotoUrl} alt={student.name} className="h-full w-full object-cover" />
            ) : (
              <span className="text-3xl font-bold">{student.name.split(" ").map((n) => n[0]).slice(0, 2).join("")}</span>
            )}
          </div>
          <h1 className="mt-3 text-2xl font-semibold">{student.name}</h1>
          <a href={`mailto:${student.email}`} className="text-sm text-white/90 hover:underline">
            {student.email}
          </a>
        </div>
      </div>

      {/* Sections */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white rounded-lg border shadow-sm p-6">
          <h2 className="text-xl font-bold border-b pb-2">Basic Information</h2>
          <ul className="mt-4 space-y-2 text-sm">
            <li><strong>Name:</strong> {student.name}</li>
            <li><strong>Class Year:</strong> {student.classYear}</li>
            <li><strong>Residence Hall:</strong> {student.dorm}</li>
            <li><strong>Hometown:</strong> {student.hometown}</li>
          </ul>
        </div>

        <div className="bg-white rounded-lg border shadow-sm p-6">
          <h2 className="text-xl font-bold border-b pb-2">Academics</h2>
          <div className="mt-4 space-y-3 text-sm">
            <div>
              <strong>Major(s):</strong>
              <p>{student.major}</p>
            </div>
            {student.minor && (
              <div>
                <strong>Minor(s):</strong>
                <p>{student.minor}</p>
              </div>
            )}
            <div>
              <strong>Classes:</strong>
              <button
                onClick={() => setShowClasses(true)}
                className="block mt-0 text-sm text-blue-600 hover:underline"
              >
                View here
              </button>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border shadow-sm p-6">
          <h2 className="text-xl font-bold border-b pb-2">Professional</h2>
          <div className="mt-4 space-y-3 text-sm">
            <div>
              <strong>Past Internships:</strong>
              <div className="space-y-0 mt-0">
                {student.internships.map(i => <div key={i.company}>{i.role} at <span className="font-normal">{i.company}</span></div>)}
              </div>
            </div>
            <div>
              <strong>Career Interests:</strong>
              <p>{student.careerInterests.join(", ")}</p>
            </div>
            {student.social?.linkedin && (
              <div>
                <strong>LinkedIn:</strong>
                <a href={student.social.linkedin} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline block truncate">
                  {student.social.linkedin}
                </a>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-lg border shadow-sm p-6">
          <h2 className="text-xl font-bold border-b pb-2">Social</h2>
          <div className="mt-4 space-y-3 text-sm">
            <div>
              <strong>Clubs/Organizations:</strong>
              <p>{student.clubs.join(", ")}</p>
            </div>
            <div>
              <strong>Sports:</strong>
              <p>{student.sports.join(", ")}</p>
            </div>
            <div>
              <strong>Hobbies & Interests:</strong>
              <p>{student.hobbies.join(", ")}</p>
            </div>
            {student.social && (
              <div>
                <strong>Social Media:</strong>
                <div className="flex items-center gap-3 mt-0">
                  {student.social.twitter && (
                    <a href={student.social.twitter} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Twitter</a>
                  )}
                  {student.social.instagram && (
                    <a href={student.social.instagram} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Instagram</a>
                  )}
                  {student.social.snapchat && (
                    <a href={student.social.snapchat} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Snapchat</a>
                  )}
                  {student.social.facebook && (
                    <a href={student.social.facebook} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Facebook</a>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <Modal
        open={showClasses}
        onClose={() => setShowClasses(false)}
        title={`Classes taken by ${student?.name}`}
      >
        <div className="space-y-4">
          {student?.courses.map(courseGroup => (
            <div key={courseGroup.semester}>
              <h3 className="font-semibold text-gray-800">{courseGroup.semester}</h3>
              <ul className="mt-1 space-y-1 list-disc pl-5 text-sm text-gray-600">
                {courseGroup.classes.map(c => <li key={c}>{c}</li>)}
              </ul>
            </div>
          ))}
        </div>
      </Modal>

      <Modal
        open={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        title="Delete Profile"
      >
        <div className="space-y-4">
          <p className="text-gray-700">
            Are you sure you want to delete your profile? This action cannot be undone.
          </p>
          <div className="flex items-center justify-end gap-3">
            <button
              onClick={() => setShowDeleteConfirm(false)}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                // In a real app, this would delete the profile and redirect
                console.log('Profile deleted');
                setShowDeleteConfirm(false);
                // Could redirect to home page or show success message
              }}
              className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 transition-colors"
            >
              Delete Profile
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
