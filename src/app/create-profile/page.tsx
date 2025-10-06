/**
 * Profile creation page for new users to complete their student profile.
 * This file contains a comprehensive form for users to enter their personal information,
 * academic details, professional experience, courses, internships, clubs, sports,
 * hobbies, and social media links. The form includes dynamic list management for
 * adding/removing multiple entries in various sections.
 */
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

// Define interfaces for our dynamic list items
interface Course {
  name: string;
  crn: string;
  professor: string;
}

interface Internship {
  company: string;
  role: string;
}

export default function CreateProfilePage() {
  const router = useRouter();
  const [ndId, setNdId] = useState("");

  // State for all form fields
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [ndEmail, setNdEmail] = useState("");
  const [graduationYear, setGraduationYear] = useState("");
  const [hometown, setHometown] = useState("");
  const [dorm, setDorm] = useState("");
  const [profilePhotoUrl, setProfilePhotoUrl] = useState("");
  const [major, setMajor] = useState("");
  const [minor, setMinor] = useState("");
  
  const [courses, setCourses] = useState<Course[]>([{ name: "", crn: "", professor: "" }]);
  const [internships, setInternships] = useState<Internship[]>([{ company: "", role: "" }]);
  const [clubs, setClubs] = useState<string[]>([""]);
  const [sports, setSports] = useState<string[]>([""]);
  const [hobbies, setHobbies] = useState<string[]>([""]);
  const [careerInterests, setCareerInterests] = useState<string[]>([""]);
  const [linkedIn, setLinkedIn] = useState("");
  const [socials, setSocials] = useState({ twitter: "", instagram: "", snapchat: "", facebook: "" });

  useEffect(() => {
    // Protect this page and get user ID
    const auth = localStorage.getItem("isAuthenticated");
    const userId = localStorage.getItem("currentUserId");
    if (auth !== "true" || !userId) {
      router.push("/login");
    } else {
      setNdId(userId);
    }
  }, [router]);

  // --- Handlers for dynamic lists ---
  // Generic handler for updating object arrays (courses, internships)
  function handleListChange<T>(
    list: T[],
    setter: React.Dispatch<React.SetStateAction<T[]>>,
    index: number,
    field: keyof T,
    value: string
  ) {
    const newList = [...list];
    newList[index] = { ...newList[index], [field]: value };
    setter(newList);
  }

  // Handler for updating string arrays (clubs, sports, hobbies, etc.)
  function handleStringListChange(
    setter: React.Dispatch<React.SetStateAction<string[]>>,
    index: number, 
    value: string
  ) {
    setter((prevList) => {
      const newList = [...prevList];
      newList[index] = value;
      return newList;
    });
  }

  // Generic functions for adding/removing items from dynamic lists
  function addToList<T>(setter: React.Dispatch<React.SetStateAction<T[]>>, newItem: T) {
    setter((prevList) => [...prevList, newItem]);
  }

  function removeFromList<T>(
    list: T[],
    setter: React.Dispatch<React.SetStateAction<T[]>>,
    index: number
  ) {
    // Prevent removing the last item (keep at least one)
    if (list.length > 1) {
      const newList = list.filter((_, i) => i !== index);
      setter(newList);
    }
  }
  
  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    
    // Collect all form data
    const profileData = {
      ndId,
      firstName,
      lastName,
      ndEmail,
      graduationYear,
      hometown,
      dorm,
      profilePhotoUrl,
      major,
      minor,
      courses,
      internships,
      clubs,
      sports,
      hobbies,
      careerInterests,
      linkedIn,
      socials
    };
    
    console.log("Profile data:", profileData);
    // TODO: In a real app, save this to your database
    router.push("/");
  }

  // --- Helper to create a styled text input ---
  interface TextInputProps {
    label: string;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    placeholder?: string;
  }

  function TextInput({ 
    label, 
    value, 
    onChange, 
    placeholder 
  }: TextInputProps) {
    return (
      <div>
        <label className="block text-sm font-medium text-gray-700">{label}</label>
        <input
          type="text"
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className="mt-1 h-11 w-full rounded-md border border-gray-300 bg-white px-3 py-2 shadow-sm outline-none ring-0 focus:border-[#0C2340]"
        />
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      <header className="bg-[#0C2340] text-white py-4 shadow-md">
        <div className="max-w-4xl mx-auto flex items-center justify-center gap-3">
          <span className="font-serif tracking-wide text-2xl">IrishConnect</span>
          <Image src="/shamrock.webp" alt="Shamrock" width={32} height={32} className="object-contain" />
        </div>
      </header>

      <main className="py-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-xl p-8 border border-gray-200">
            <h1 className="text-2xl font-bold text-gray-800 mb-2">Complete Your Profile</h1>
            <p className="text-gray-600 text-sm mb-6 max-w-2xl">
              Your profile is your digital handshake on campus. Filling it out with your classes, internships, and interests helps others with similar paths find you. The more details you share, the stronger your connections will be.
            </p>

            <form onSubmit={handleSubmit} className="space-y-8 pt-4">
              
              {/* --- Basic Information Section --- */}
              <div className="space-y-4">
                <h2 className="text-lg font-semibold border-b pb-2 text-gray-800">Basic Information</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">ND ID</label>
                    <input type="text" value={ndId} readOnly className="mt-1 h-11 w-full rounded-md border border-gray-200 bg-gray-100 px-3 py-2 shadow-sm cursor-not-allowed" />
                  </div>
                  <TextInput label="First Name" value={firstName} onChange={(e) => setFirstName(e.target.value)} />
                  <TextInput label="Last Name" value={lastName} onChange={(e) => setLastName(e.target.value)} />
                  <TextInput label="ND Email" value={ndEmail} onChange={(e) => setNdEmail(e.target.value)} placeholder="name@nd.edu"/>
                  <TextInput label="Graduation Year" value={graduationYear} onChange={(e) => setGraduationYear(e.target.value)} placeholder="e.g., 2025"/>
                  <TextInput label="Hometown" value={hometown} onChange={(e) => setHometown(e.target.value)} placeholder="e.g., South Bend, IN"/>
                  <TextInput label="Dorm" value={dorm} onChange={(e) => setDorm(e.target.value)} />
                  <TextInput label="Profile Photo URL" value={profilePhotoUrl} onChange={(e) => setProfilePhotoUrl(e.target.value)} placeholder="https://example.com/photo.jpg"/>
                </div>
              </div>

              {/* --- Academics Section --- */}
               <div className="space-y-4">
                <h2 className="text-lg font-semibold border-b pb-2 text-gray-800">Academics</h2>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <TextInput label="Major" value={major} onChange={(e) => setMajor(e.target.value)} />
                    <TextInput label="Minor (optional)" value={minor} onChange={(e) => setMinor(e.target.value)} />
                 </div>
                 {/* Dynamic list for adding courses */}
                 <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Courses</label>
                    {courses.map((course, index) => (
                      <div key={index} className="grid grid-cols-1 md:grid-cols-7 gap-2 items-center mb-2">
                        <input type="text" placeholder="Course Name" value={course.name} onChange={e => handleListChange(courses, setCourses, index, 'name', e.target.value)} className="md:col-span-3 h-11 w-full rounded-md border border-gray-300 bg-white px-3 py-2 shadow-sm outline-none ring-0 focus:border-[#0C2340]"/>
                        <input type="text" placeholder="CRN" value={course.crn} onChange={e => handleListChange(courses, setCourses, index, 'crn', e.target.value)} className="md:col-span-1 h-11 w-full rounded-md border border-gray-300 bg-white px-3 py-2 shadow-sm outline-none ring-0 focus:border-[#0C2340]"/>
                        <input type="text" placeholder="Professor" value={course.professor} onChange={e => handleListChange(courses, setCourses, index, 'professor', e.target.value)} className="md:col-span-2 h-11 w-full rounded-md border border-gray-300 bg-white px-3 py-2 shadow-sm outline-none ring-0 focus:border-[#0C2340]"/>
                        <button type="button" onClick={() => removeFromList(courses, setCourses, index)} className="md:col-span-1 h-11 w-full rounded-md border border-gray-300 bg-gray-50 text-red-600 hover:bg-red-100 text-sm disabled:opacity-50" disabled={courses.length === 1}>Remove</button>
                      </div>
                    ))}
                    <button type="button" onClick={() => addToList(setCourses, { name: "", crn: "", professor: "" })} className="mt-2 text-sm font-semibold text-blue-600 hover:text-blue-800">+ Add another course</button>
                 </div>
              </div>

              {/* --- Professional Experience Section --- */}
              <div className="space-y-4">
                <h2 className="text-lg font-semibold border-b pb-2 text-gray-800">Professional Experience</h2>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Internships</label>
                  {internships.map((internship, index) => (
                    <div key={index} className="grid grid-cols-1 md:grid-cols-5 gap-2 items-center mb-2">
                      <input type="text" placeholder="Company" value={internship.company} onChange={e => handleListChange(internships, setInternships, index, 'company', e.target.value)} className="md:col-span-2 h-11 w-full rounded-md border border-gray-300 bg-white px-3 py-2 shadow-sm outline-none ring-0 focus:border-[#0C2340]"/>
                      <input type="text" placeholder="Role" value={internship.role} onChange={e => handleListChange(internships, setInternships, index, 'role', e.target.value)} className="md:col-span-2 h-11 w-full rounded-md border border-gray-300 bg-white px-3 py-2 shadow-sm outline-none ring-0 focus:border-[#0C2340]"/>
                      <button type="button" onClick={() => removeFromList(internships, setInternships, index)} className="md:col-span-1 h-11 w-full rounded-md border border-gray-300 bg-gray-50 text-red-600 hover:bg-red-100 text-sm disabled:opacity-50" disabled={internships.length === 1}>Remove</button>
                    </div>
                  ))}
                  <button type="button" onClick={() => addToList(setInternships, { company: "", role: "" })} className="mt-2 text-sm font-semibold text-blue-600 hover:text-blue-800">+ Add another internship</button>
                </div>
                <TextInput label="LinkedIn Profile URL" value={linkedIn} onChange={(e) => setLinkedIn(e.target.value)} placeholder="https://linkedin.com/in/..."/>
                 <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Career Interests</label>
                  {careerInterests.map((interest, index) => (
                    <div key={index} className="flex items-center gap-2 mb-2">
                      <input type="text" placeholder="e.g., Product Management" value={interest} onChange={e => handleStringListChange(setCareerInterests, index, e.target.value)} className="flex-grow h-11 w-full rounded-md border border-gray-300 bg-white px-3 py-2 shadow-sm outline-none ring-0 focus:border-[#0C2340]"/>
                      <button type="button" onClick={() => removeFromList(careerInterests, setCareerInterests, index)} className="h-11 rounded-md border border-gray-300 bg-gray-50 px-3 text-red-600 hover:bg-red-100 text-sm disabled:opacity-50" disabled={careerInterests.length === 1}>Remove</button>
                    </div>
                  ))}
                   <button type="button" onClick={() => addToList<string>(setCareerInterests, "")} className="mt-2 text-sm font-semibold text-blue-600 hover:text-blue-800">+ Add another interest</button>
                 </div>
              </div>

              {/* --- Social & Extracurriculars Section --- */}
              <div className="space-y-4">
                <h2 className="text-lg font-semibold border-b pb-2 text-gray-800">Social</h2>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Clubs</label>
                  {clubs.map((club, index) => (
                    <div key={index} className="flex items-center gap-2 mb-2">
                      <input type="text" placeholder="Club Name" value={club} onChange={e => handleStringListChange(setClubs, index, e.target.value)} className="flex-grow h-11 w-full rounded-md border border-gray-300 bg-white px-3 py-2 shadow-sm outline-none ring-0 focus:border-[#0C2340]"/>
                      <button type="button" onClick={() => removeFromList(clubs, setClubs, index)} className="h-11 rounded-md border border-gray-300 bg-gray-50 px-3 text-red-600 hover:bg-red-100 text-sm disabled:opacity-50" disabled={clubs.length === 1}>Remove</button>
                    </div>
                  ))}
                   <button type="button" onClick={() => addToList<string>(setClubs, "")} className="mt-2 text-sm font-semibold text-blue-600 hover:text-blue-800">+ Add another club</button>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Sports</label>
                  {sports.map((sport, index) => (
                    <div key={index} className="flex items-center gap-2 mb-2">
                      <input type="text" placeholder="Sport Name" value={sport} onChange={e => handleStringListChange(setSports, index, e.target.value)} className="flex-grow h-11 w-full rounded-md border border-gray-300 bg-white px-3 py-2 shadow-sm outline-none ring-0 focus:border-[#0C2340]"/>
                      <button type="button" onClick={() => removeFromList(sports, setSports, index)} className="h-11 rounded-md border border-gray-300 bg-gray-50 px-3 text-red-600 hover:bg-red-100 text-sm disabled:opacity-50" disabled={sports.length === 1}>Remove</button>
                    </div>
                  ))}
                   <button type="button" onClick={() => addToList<string>(setSports, "")} className="mt-2 text-sm font-semibold text-blue-600 hover:text-blue-800">+ Add another sport</button>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Hobbies & Interests</label>
                  {hobbies.map((hobby, index) => (
                    <div key={index} className="flex items-center gap-2 mb-2">
                      <input type="text" placeholder="Hobby or Interest" value={hobby} onChange={e => handleStringListChange(setHobbies, index, e.target.value)} className="flex-grow h-11 w-full rounded-md border border-gray-300 bg-white px-3 py-2 shadow-sm outline-none ring-0 focus:border-[#0C2340]"/>
                      <button type="button" onClick={() => removeFromList(hobbies, setHobbies, index)} className="h-11 rounded-md border border-gray-300 bg-gray-50 px-3 text-red-600 hover:bg-red-100 text-sm disabled:opacity-50" disabled={hobbies.length === 1}>Remove</button>
                    </div>
                  ))}
                   <button type="button" onClick={() => addToList<string>(setHobbies, "")} className="mt-2 text-sm font-semibold text-blue-600 hover:text-blue-800">+ Add another hobby</button>
                </div>

                <div className="mt-2 space-y-3">
                  <TextInput label="Twitter URL" value={socials.twitter} onChange={(e) => setSocials({...socials, twitter: e.target.value})} placeholder="https://twitter.com/username"/>
                  <TextInput label="Instagram URL" value={socials.instagram} onChange={(e) => setSocials({...socials, instagram: e.target.value})} placeholder="https://instagram.com/username"/>
                  <TextInput label="Snapchat Username" value={socials.snapchat} onChange={(e) => setSocials({...socials, snapchat: e.target.value})} placeholder="username"/>
                  <TextInput label="Facebook URL" value={socials.facebook} onChange={(e) => setSocials({...socials, facebook: e.target.value})} placeholder="https://facebook.com/username"/>
                </div>
              </div>

              {/* --- Submit Button --- */}
              <div className="pt-4 flex justify-end">
                <button
                  type="submit"
                  className="inline-flex items-center justify-center rounded-md border border-transparent bg-[#0C2340] px-6 py-3 text-base font-medium text-white shadow-sm hover:brightness-110"
                >
                  Save Profile
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}
