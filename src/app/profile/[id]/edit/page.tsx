"use client";

import { useEffect, useMemo, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { STUDENTS } from "../../../../data/students";

interface Course { name: string; crn: string; professor: string }
interface Internship { company: string; role: string }

export default function EditProfilePage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const existing = useMemo(() => STUDENTS.find((s) => s.id === id), [id]);

  const [ndId, setNdId] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [ndEmail, setNdEmail] = useState("");
  const [graduationYear, setGraduationYear] = useState("");
  const [hometown, setHometown] = useState("");
  const [dorm, setDorm] = useState("");
  const [profilePhoto, setProfilePhoto] = useState<File | null>(null);
  const [photoPreviewUrl, setPhotoPreviewUrl] = useState<string | null>(null);
  const objectUrlRef = useRef<string | null>(null);
  const [majors, setMajors] = useState<string[]>([""]);
  const [minors, setMinors] = useState<string[]>([""]);
  const [courses, setCourses] = useState<Course[]>([{ name: "", crn: "", professor: "" }]);
  const [internships, setInternships] = useState<Internship[]>([{ company: "", role: "" }]);
  const [clubs, setClubs] = useState<string[]>([""]);
  const [sports, setSports] = useState<string[]>([""]);
  const [hobbies, setHobbies] = useState<string[]>([""]);
  const [careerInterests, setCareerInterests] = useState<string[]>([""]);
  const [linkedIn, setLinkedIn] = useState("");
  const [socials, setSocials] = useState({ twitter: "", instagram: "", snapchat: "", facebook: "" });

  useEffect(() => {
    const auth = localStorage.getItem("isAuthenticated");
    const userId = localStorage.getItem("currentUserId");
    if (auth !== "true" || !userId) {
      router.push("/login");
      return;
    }
    if (userId !== id) {
      router.push(`/profile/${id}`);
      return;
    }
    setNdId(userId);

    if (existing) {
      const nameParts = existing.name.split(" ");
      setFirstName(nameParts[0] || "");
      setLastName(nameParts.slice(1).join(" ") || "");
      setNdEmail(existing.email);
      setGraduationYear(String(existing.classYear));
      setHometown(existing.hometown);
      setDorm(existing.dorm);
      setPhotoPreviewUrl(existing.profilePhotoUrl || null);
      setMajors(existing.major ? [existing.major] : [""]);
      setMinors(existing.minor ? [existing.minor] : [""]);
      setClubs(existing.clubs.length ? existing.clubs : [""]);
      setSports(existing.sports.length ? existing.sports : [""]);
      setHobbies(existing.hobbies.length ? existing.hobbies : [""]);
      setCareerInterests(existing.careerInterests.length ? existing.careerInterests : [""]);
      setLinkedIn(existing.social?.linkedin || "");
      setSocials({
        twitter: existing.social?.twitter || "",
        instagram: existing.social?.instagram || "",
        snapchat: existing.social?.snapchat || "",
        facebook: existing.social?.facebook || "",
      });
    }
  }, [id, existing, router]);

  useEffect(() => {
    // Clean up the object URL on unmount to prevent memory leaks
    return () => {
      if (objectUrlRef.current) {
        URL.revokeObjectURL(objectUrlRef.current);
      }
    };
  }, []);

  function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setProfilePhoto(file);

      // Revoke the old object URL if it exists
      if (objectUrlRef.current) {
        URL.revokeObjectURL(objectUrlRef.current);
      }

      // Create and set a new object URL for the preview
      const newUrl = URL.createObjectURL(file);
      objectUrlRef.current = newUrl;
      setPhotoPreviewUrl(newUrl);
    }
  }

  function handleRemovePhoto() {
    setProfilePhoto(null);
    setPhotoPreviewUrl(null);
    if (objectUrlRef.current) {
        URL.revokeObjectURL(objectUrlRef.current);
        objectUrlRef.current = null;
    }
    if (fileInputRef.current) {
        fileInputRef.current.value = "";
    }
  }

  function handleListChange<T>(list: T[], setter: React.Dispatch<React.SetStateAction<T[]>>, index: number, field: keyof T, value: string) {
    const newList = [...list];
    newList[index] = { ...(newList[index] as object), [field]: value } as T;
    setter(newList);
  }
  function handleStringListChange(setter: React.Dispatch<React.SetStateAction<string[]>>, index: number, value: string) {
    setter((prev) => {
      const copy = [...prev];
      copy[index] = value;
      return copy;
    });
  }
  function addToList<T>(setter: React.Dispatch<React.SetStateAction<T[]>>, newItem: T) {
    setter((prev) => [...prev, newItem]);
  }
  function removeFromList<T>(list: T[], setter: React.Dispatch<React.SetStateAction<T[]>>, index: number) {
    const newList = list.filter((_, i) => i !== index);
    setter(newList);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    // TODO: Replace with API call to update profile in DB (PUT /api/profiles/{id})
    const updated = {
      ndId,
      firstName,
      lastName,
      ndEmail,
      graduationYear,
      hometown,
      dorm,
      profilePhoto,
      majors,
      minors,
      courses,
      internships,
      clubs,
      sports,
      hobbies,
      careerInterests,
      linkedIn,
      socials,
    };
    console.log("Update profile:", updated);
    router.push(`/profile/${id}`);
  }

  return (
    <div className="py-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-xl p-8 border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-2xl font-bold text-gray-800">Edit Your Profile</h1>
          </div>
          <p className="text-gray-600 text-sm mb-6 max-w-2xl">
            Update your profile to keep your information current. The more details you share, the stronger your connections will be.
          </p>

            <form onSubmit={handleSubmit} className="space-y-8 pt-4">
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
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Profile Photo</label>
                    <div className="mt-1 flex items-center gap-2">
                      <label htmlFor="file-upload" className="cursor-pointer rounded-md border-0 text-sm font-semibold bg-[#0C2340] text-white hover:bg-[#0C2340]/90 px-4 h-11 inline-flex items-center shrink-0">
                        Choose File
                      </label>
                      <input 
                        id="file-upload"
                        name="file-upload"
                        type="file" 
                        className="sr-only"
                        ref={fileInputRef}
                        onChange={handlePhotoChange} 
                        accept="image/*"
                      />
                      {photoPreviewUrl ? (
                        <div className="flex items-center gap-2 min-w-0">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={photoPreviewUrl} alt="Profile preview" className="object-cover w-11 h-11" />
                          <span className="text-sm text-gray-600 truncate">
                            {profilePhoto ? profilePhoto.name : (existing?.profilePhotoUrl?.split('/').pop() || 'profile_image.jpg')}
                          </span>
                          <button type="button" onClick={handleRemovePhoto} className="h-9 rounded-md border border-gray-300 bg-gray-50 px-3 text-red-600 hover:bg-red-100 text-sm">Remove</button>
                        </div>
                      ) : (
                        <span className="text-sm text-gray-500">No file selected</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h2 className="text-lg font-semibold border-b pb-2 text-gray-800">Academics</h2>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Major(s)</label>
                  {majors.map((major, index) => (
                    <div key={index} className="flex items-center gap-2 mb-2">
                      <input type="text" placeholder="Major" value={major} onChange={e => handleStringListChange(setMajors, index, e.target.value)} className="flex-grow h-11 w-full rounded-md border border-gray-300 bg-white px-3 py-2 shadow-sm outline-none ring-0 focus:border-[#0C2340]"/>
                      <button type="button" onClick={() => removeFromList(majors, setMajors, index)} className="h-11 rounded-md border border-gray-300 bg-gray-50 px-3 text-red-600 hover:bg-red-100 text-sm">Remove</button>
                    </div>
                  ))}
                   <button type="button" onClick={() => addToList<string>(setMajors, "")} className="mt-2 text-sm font-semibold text-blue-600 hover:text-blue-800">+ Add another major</button>
                 </div>
                 <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Minor(s)</label>
                  {minors.map((minor, index) => (
                    <div key={index} className="flex items-center gap-2 mb-2">
                      <input type="text" placeholder="Minor" value={minor} onChange={e => handleStringListChange(setMinors, index, e.target.value)} className="flex-grow h-11 w-full rounded-md border border-gray-300 bg-white px-3 py-2 shadow-sm outline-none ring-0 focus:border-[#0C2340]"/>
                      <button type="button" onClick={() => removeFromList(minors, setMinors, index)} className="h-11 rounded-md border border-gray-300 bg-gray-50 px-3 text-red-600 hover:bg-red-100 text-sm">Remove</button>
                    </div>
                  ))}
                   <button type="button" onClick={() => addToList<string>(setMinors, "")} className="mt-2 text-sm font-semibold text-blue-600 hover:text-blue-800">+ Add another minor</button>
                 </div>
                {/* Keeping courses/internships simple, like create page */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Courses</label>
                  {courses.map((course, index) => (
                    <div key={index} className="grid grid-cols-1 md:grid-cols-7 gap-2 items-center mb-2">
                      <input type="text" placeholder="Course Name" value={course.name} onChange={e => handleListChange(courses, setCourses, index, 'name', e.target.value)} className="md:col-span-3 h-11 w-full rounded-md border border-gray-300 bg-white px-3 py-2 shadow-sm outline-none ring-0 focus:border-[#0C2340]"/>
                      <input type="text" placeholder="CRN" value={course.crn} onChange={e => handleListChange(courses, setCourses, index, 'crn', e.target.value)} className="md:col-span-1 h-11 w-full rounded-md border border-gray-300 bg-white px-3 py-2 shadow-sm outline-none ring-0 focus:border-[#0C2340]"/>
                      <input type="text" placeholder="Professor" value={course.professor} onChange={e => handleListChange(courses, setCourses, index, 'professor', e.target.value)} className="md:col-span-2 h-11 w-full rounded-md border border-gray-300 bg-white px-3 py-2 shadow-sm outline-none ring-0 focus:border-[#0C2340]"/>
                      <button type="button" onClick={() => removeFromList(courses, setCourses, index)} className="md:col-span-1 h-11 w-full rounded-md border border-gray-300 bg-gray-50 text-red-600 hover:bg-red-100 text-sm">Remove</button>
                    </div>
                  ))}
                  <button type="button" onClick={() => addToList(setCourses, { name: "", crn: "", professor: "" })} className="mt-2 text-sm font-semibold text-blue-600 hover:text-blue-800">+ Add another course</button>
                </div>
              </div>

              <div className="space-y-4">
                <h2 className="text-lg font-semibold border-b pb-2 text-gray-800">Professional Experience</h2>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Internships</label>
                  {internships.map((internship, index) => (
                    <div key={index} className="grid grid-cols-1 md:grid-cols-5 gap-2 items-center mb-2">
                      <input type="text" placeholder="Company" value={internship.company} onChange={e => handleListChange(internships, setInternships, index, 'company', e.target.value)} className="md:col-span-2 h-11 w-full rounded-md border border-gray-300 bg-white px-3 py-2 shadow-sm outline-none ring-0 focus:border-[#0C2340]"/>
                      <input type="text" placeholder="Role" value={internship.role} onChange={e => handleListChange(internships, setInternships, index, 'role', e.target.value)} className="md:col-span-2 h-11 w-full rounded-md border border-gray-300 bg-white px-3 py-2 shadow-sm outline-none ring-0 focus:border-[#0C2340]"/>
                      <button type="button" onClick={() => removeFromList(internships, setInternships, index)} className="md:col-span-1 h-11 w-full rounded-md border border-gray-300 bg-gray-50 text-red-600 hover:bg-red-100 text-sm">Remove</button>
                    </div>
                  ))}
                  <button type="button" onClick={() => addToList(setInternships, { company: "", role: "" })} className="mt-2 text-sm font-semibold text-blue-600 hover:text-blue-800">+ Add another internship</button>
                </div>
                <div className="flex items-end gap-2">
                  <div className="flex-grow">
                    <TextInput label="LinkedIn Profile URL" value={linkedIn} onChange={(e) => setLinkedIn(e.target.value)} placeholder="https://linkedin.com/in/..."/>
                  </div>
                  <button type="button" onClick={() => setLinkedIn("")} className="h-11 rounded-md border border-gray-300 bg-gray-50 px-3 text-red-600 hover:bg-red-100 text-sm">Remove</button>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Career Interests</label>
                  {careerInterests.map((interest, index) => (
                    <div key={index} className="flex items-center gap-2 mb-2">
                      <input type="text" placeholder="e.g., Product Management" value={interest} onChange={e => handleStringListChange(setCareerInterests, index, e.target.value)} className="flex-grow h-11 w-full rounded-md border border-gray-300 bg-white px-3 py-2 shadow-sm outline-none ring-0 focus:border-[#0C2340]"/>
                      <button type="button" onClick={() => removeFromList(careerInterests, setCareerInterests, index)} className="h-11 rounded-md border border-gray-300 bg-gray-50 px-3 text-red-600 hover:bg-red-100 text-sm">Remove</button>
                    </div>
                  ))}
                  <button type="button" onClick={() => addToList<string>(setCareerInterests, "")} className="mt-2 text-sm font-semibold text-blue-600 hover:text-blue-800">+ Add another interest</button>
                </div>
              </div>

              <div className="space-y-4">
                <h2 className="text-lg font-semibold border-b pb-2 text-gray-800">Social</h2>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Clubs</label>
                  {clubs.map((club, index) => (
                    <div key={index} className="flex items-center gap-2 mb-2">
                      <input type="text" placeholder="Club Name" value={club} onChange={e => handleStringListChange(setClubs, index, e.target.value)} className="flex-grow h-11 w-full rounded-md border border-gray-300 bg-white px-3 py-2 shadow-sm outline-none ring-0 focus:border-[#0C2340]"/>
                      <button type="button" onClick={() => removeFromList(clubs, setClubs, index)} className="h-11 rounded-md border border-gray-300 bg-gray-50 px-3 text-red-600 hover:bg-red-100 text-sm">Remove</button>
                    </div>
                  ))}
                  <button type="button" onClick={() => addToList<string>(setClubs, "")} className="mt-2 text-sm font-semibold text-blue-600 hover:text-blue-800">+ Add another club</button>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Sports</label>
                  {sports.map((sport, index) => (
                    <div key={index} className="flex items-center gap-2 mb-2">
                      <input type="text" placeholder="Sport Name" value={sport} onChange={e => handleStringListChange(setSports, index, e.target.value)} className="flex-grow h-11 w-full rounded-md border border-gray-300 bg-white px-3 py-2 shadow-sm outline-none ring-0 focus:border-[#0C2340]"/>
                      <button type="button" onClick={() => removeFromList(sports, setSports, index)} className="h-11 rounded-md border border-gray-300 bg-gray-50 px-3 text-red-600 hover:bg-red-100 text-sm">Remove</button>
                    </div>
                  ))}
                  <button type="button" onClick={() => addToList<string>(setSports, "")} className="mt-2 text-sm font-semibold text-blue-600 hover:text-blue-800">+ Add another sport</button>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Hobbies & Interests</label>
                  {hobbies.map((hobby, index) => (
                    <div key={index} className="flex items-center gap-2 mb-2">
                      <input type="text" placeholder="Hobby or Interest" value={hobby} onChange={e => handleStringListChange(setHobbies, index, e.target.value)} className="flex-grow h-11 w-full rounded-md border border-gray-300 bg-white px-3 py-2 shadow-sm outline-none ring-0 focus:border-[#0C2340]"/>
                      <button type="button" onClick={() => removeFromList(hobbies, setHobbies, index)} className="h-11 rounded-md border border-gray-300 bg-gray-50 px-3 text-red-600 hover:bg-red-100 text-sm">Remove</button>
                    </div>
                  ))}
                  <button type="button" onClick={() => addToList<string>(setHobbies, "")} className="mt-2 text-sm font-semibold text-blue-600 hover:text-blue-800">+ Add another hobby</button>
                </div>

                <div className="mt-2 space-y-3">
                  <div className="flex items-end gap-2">
                    <div className="flex-grow">
                      <TextInput label="Twitter URL" value={socials.twitter} onChange={(e) => setSocials({...socials, twitter: e.target.value})} placeholder="https://twitter.com/username"/>
                    </div>
                    <button type="button" onClick={() => setSocials({...socials, twitter: ""})} className="h-11 rounded-md border border-gray-300 bg-gray-50 px-3 text-red-600 hover:bg-red-100 text-sm">Remove</button>
                  </div>
                  <div className="flex items-end gap-2">
                    <div className="flex-grow">
                      <TextInput label="Instagram URL" value={socials.instagram} onChange={(e) => setSocials({...socials, instagram: e.target.value})} placeholder="https://instagram.com/username"/>
                    </div>
                    <button type="button" onClick={() => setSocials({...socials, instagram: ""})} className="h-11 rounded-md border border-gray-300 bg-gray-50 px-3 text-red-600 hover:bg-red-100 text-sm">Remove</button>
                  </div>
                  <div className="flex items-end gap-2">
                    <div className="flex-grow">
                      <TextInput label="Snapchat Username" value={socials.snapchat} onChange={(e) => setSocials({...socials, snapchat: e.target.value})} placeholder="username"/>
                    </div>
                    <button type="button" onClick={() => setSocials({...socials, snapchat: ""})} className="h-11 rounded-md border border-gray-300 bg-gray-50 px-3 text-red-600 hover:bg-red-100 text-sm">Remove</button>
                  </div>
                  <div className="flex items-end gap-2">
                    <div className="flex-grow">
                      <TextInput label="Facebook URL" value={socials.facebook} onChange={(e) => setSocials({...socials, facebook: e.target.value})} placeholder="https://facebook.com/username"/>
                    </div>
                    <button type="button" onClick={() => setSocials({...socials, facebook: ""})} className="h-11 rounded-md border border-gray-300 bg-gray-50 px-3 text-red-600 hover:bg-red-100 text-sm">Remove</button>
                  </div>
                </div>
              </div>

          <div className="pt-4 flex justify-end">
            <Link href={`/profile/${id}`}>
              <button
                type="button"
                className="mr-3 inline-flex items-center justify-center rounded-md border px-6 py-3 text-base font-bold border-[#0C2340] text-[#0C2340] hover:bg-gray-50"
              >
                Cancel
              </button>
            </Link>
            <button
              type="submit"
              className="inline-flex items-center justify-center rounded-md border border-transparent bg-[#0C2340] px-6 py-3 text-base font-bold text-white shadow-sm hover:brightness-110"
            >
              Update Profile
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
  );
}

interface TextInputProps {
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
}

function TextInput({ label, value, onChange, placeholder }: TextInputProps) {
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


