"use client";

import { useMemo, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import SearchableMultiSelect from "../components/SearchableMultiSelect";
import SimpleSelect from "../components/SimpleSelect";
import Link from "next/link";
import { Student, STUDENTS } from "../data/students";
import { Group, GROUPS } from "../data/groups";

const getPaginationItems = (
  currentPage: number,
  totalPages: number,
  siblingCount = 1
) => {
  const totalPageNumbers = siblingCount + 5;

  if (totalPageNumbers >= totalPages) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  const leftSiblingIndex = Math.max(currentPage - siblingCount, 1);
  const rightSiblingIndex = Math.min(
    currentPage + siblingCount,
    totalPages
  );

  const shouldShowLeftDots = leftSiblingIndex > 2;
  const shouldShowRightDots = rightSiblingIndex < totalPages - 2;

  const firstPageIndex = 1;
  const lastPageIndex = totalPages;

  if (!shouldShowLeftDots && shouldShowRightDots) {
    let leftItemCount = 3 + 2 * siblingCount;
    let leftRange = Array.from({ length: leftItemCount }, (_, i) => i + 1);
    return [...leftRange, '...', totalPages];
  }

  if (shouldShowLeftDots && !shouldShowRightDots) {
    let rightItemCount = 3 + 2 * siblingCount;
    let rightRange = Array.from({ length: rightItemCount }, (_, i) => totalPages - rightItemCount + 1 + i);
    return [firstPageIndex, '...', ...rightRange];
  }

  if (shouldShowLeftDots && shouldShowRightDots) {
    let middleRange = Array.from({ length: rightSiblingIndex - leftSiblingIndex + 1 }, (_, i) => leftSiblingIndex + i);
    return [firstPageIndex, '...', ...middleRange, '...', lastPageIndex];
  }

  return []; // Should not happen with the logic above
};

const dorms = Array.from(new Set(STUDENTS.map((s) => s.dorm))).sort();
const majors = Array.from(new Set(STUDENTS.map((s) => s.major))).sort();
const classYears = Array.from(new Set(STUDENTS.map((s) => s.classYear))).sort(
  (a, b) => b - a
);
const minors = Array.from(new Set(
  STUDENTS.map((s) => s.minor).filter(Boolean) as string[]
)).sort();
const hometowns = Array.from(new Set(STUDENTS.map((s) => s.hometown))).sort();
const courses = Array.from(new Set(STUDENTS.flatMap((s) => s.courses.flatMap(c => c.classes)))).sort();
const companies = Array.from(new Set(STUDENTS.flatMap((s) => s.internships.map(i => i.company)))).sort();
const clubs = Array.from(new Set(STUDENTS.flatMap((s) => s.clubs))).sort();
const sportsOptions = Array.from(new Set(STUDENTS.flatMap((s) => s.sports))).sort();
const interests = Array.from(new Set(STUDENTS.flatMap((s) => s.careerInterests))).sort();

export default function Home() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const auth = localStorage.getItem("isAuthenticated");
    if (auth !== "true") {
      router.push("/login");
    } else {
      setIsLoading(false);
    }
  }, [router]);

  const [peopleQuery, setPeopleQuery] = useState("");
  const [years, setYears] = useState<string[]>([]);
  const [majorsSelected, setMajorsSelected] = useState<string[]>([]);
  const [minorsSelected, setMinorsSelected] = useState<string[]>([]);
  const [dormsSelected, setDormsSelected] = useState<string[]>([]);
  const [hometownsSelected, setHometownsSelected] = useState<string[]>([]);
  const [classesSelected, setClassesSelected] = useState<string[]>([]);
  const [companiesSelected, setCompaniesSelected] = useState<string[]>([]);
  const [clubsSelected, setClubsSelected] = useState<string[]>([]);
  const [sportsSelected, setSportsSelected] = useState<string[]>([]);
  const [interestsSelected, setInterestsSelected] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState("first_az");
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [profilesPerPage, setProfilesPerPage] = useState(24);
  const [activeTab, setActiveTab] = useState("directory");
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
  const [joinedGroups, setJoinedGroups] = useState<string[]>([]);
  const [groupSearchQuery, setGroupSearchQuery] = useState("");

  // Use imported groups data

  const filteredGroups = useMemo(() => {
    const q = groupSearchQuery.trim().toLowerCase();
    if (!q) return GROUPS;
    return GROUPS.filter(group => 
      group.name.toLowerCase().includes(q)
    );
  }, [groupSearchQuery]);

  const myGroups = useMemo(() => {
    return filteredGroups.filter(group => joinedGroups.includes(group.id));
  }, [filteredGroups, joinedGroups]);

  const allGroups = useMemo(() => {
    return filteredGroups.filter(group => !joinedGroups.includes(group.id));
  }, [filteredGroups, joinedGroups]);

  const clearAll = () => {
    setPeopleQuery("");
    setYears([]);
    setMajorsSelected([]);
    setMinorsSelected([]);
    setDormsSelected([]);
    setHometownsSelected([]);
    setClassesSelected([]);
    setCompaniesSelected([]);
    setClubsSelected([]);
    setSportsSelected([]);
    setInterestsSelected([]);
    setSortBy("first_az");
    setCurrentPage(1);
  };

  const activeFilterCount = [
    years.length,
    majorsSelected.length,
    minorsSelected.length,
    dormsSelected.length,
    hometownsSelected.length,
    classesSelected.length,
    companiesSelected.length,
    clubsSelected.length,
    sportsSelected.length,
    interestsSelected.length,
  ].reduce((a, b) => a + (b > 0 ? 1 : 0), 0);

  const filtered = useMemo(() => {
    const q = peopleQuery.trim().toLowerCase();
    return STUDENTS.filter((s) => {
      const matchesQuery = q
        ? s.name.toLowerCase().includes(q)
        : true;
      const matchesYear = years.length
        ? years.includes(String(s.classYear))
        : true;
      const matchesMajor = majorsSelected.length
        ? majorsSelected.includes(s.major)
        : true;
      const matchesMinor = minorsSelected.length
        ? !!s.minor && minorsSelected.includes(s.minor)
        : true;
      const matchesDorm = dormsSelected.length
        ? dormsSelected.includes(s.dorm)
        : true;
      const matchesHometown = hometownsSelected.length
        ? hometownsSelected.includes(s.hometown)
        : true;
      const matchesClass = classesSelected.length
        ? classesSelected.every((t) =>
            s.courses.some((semester) => semester.classes.some((c) => c.toLowerCase().includes(t.toLowerCase())))
          )
        : true;
      const matchesCompanies = companiesSelected.length
        ? companiesSelected.every((t) =>
            s.internships.some((c) => c.company.toLowerCase().includes(t.toLowerCase()))
          )
        : true;
      const matchesClubs = clubsSelected.length
        ? clubsSelected.every((t) =>
            s.clubs.some((c) => c.toLowerCase().includes(t.toLowerCase()))
          )
        : true;
      const matchesSports = sportsSelected.length
        ? sportsSelected.every((t) =>
            s.sports.some((sp) => sp.toLowerCase().includes(t.toLowerCase()))
          )
        : true;
      const matchesInterests = interestsSelected.length
        ? interestsSelected.every((t) =>
            s.careerInterests.some((i) => i.toLowerCase().includes(t.toLowerCase()))
          )
        : true;
      return (
        matchesQuery &&
        matchesYear &&
        matchesMajor &&
        matchesMinor &&
        matchesDorm &&
        matchesHometown &&
        matchesClass &&
        matchesCompanies &&
        matchesClubs &&
        matchesSports &&
        matchesInterests
      );
    }).sort((a, b) => {
      if (sortBy === "first_az") return a.name.localeCompare(b.name);
      if (sortBy === "first_za") return b.name.localeCompare(a.name);
      if (sortBy === "last_az")
        return lastName(a.name).localeCompare(lastName(b.name));
      if (sortBy === "last_za")
        return lastName(b.name).localeCompare(lastName(a.name));
      return 0; // default fallback
    });
  }, [
    peopleQuery,
    years,
    majorsSelected,
    minorsSelected,
    dormsSelected,
    hometownsSelected,
    classesSelected,
    companiesSelected,
    clubsSelected,
    sportsSelected,
    interestsSelected,
    sortBy,
  ]);

  // Pagination logic
  const indexOfLastProfile = currentPage * profilesPerPage;
  const indexOfFirstProfile = indexOfLastProfile - profilesPerPage;
  const currentProfiles = filtered.slice(indexOfFirstProfile, indexOfLastProfile);
  const totalPages = Math.ceil(filtered.length / profilesPerPage);

  const paginate = (pageNumber: number) => {
    setCurrentPage(pageNumber);
  };

  // Scroll to top when page changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [currentPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [
    peopleQuery,
    years,
    majorsSelected,
    minorsSelected,
    dormsSelected,
    hometownsSelected,
    classesSelected,
    companiesSelected,
    clubsSelected,
    sportsSelected,
    interestsSelected,
    sortBy,
    profilesPerPage, // Reset page when profiles per page changes
  ]);

  function lastName(fullName: string): string {
    const parts = fullName.trim().split(/\s+/);
    return parts[parts.length - 1] || "";
  }

  if (isLoading) {
    return null;
  }

  return (
    <div className="space-y-4">
      {/* Tab Navigation */}
      <div className="flex border-b border-gray-200">
        <button
          onClick={() => setActiveTab("directory")}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            activeTab === "directory"
              ? "border-[#0C2340] text-[#0C2340]"
              : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
        >
          Student Search
        </button>
        <button
          onClick={() => setActiveTab("chat")}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            activeTab === "chat"
              ? "border-[#0C2340] text-[#0C2340]"
              : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
        >
          Chat & Groups
        </button>
      </div>

      {activeTab === "directory" && (
        <>
      <div className="flex items-center gap-x-3 gap-y-0 flex-wrap">
        <div className="flex-1 min-w-[260px]">
          <label className="block text-sm font-bold text-gray-700">Search for people</label>
          <div className="mt-1 relative">
            <input
              value={peopleQuery}
              onChange={(e) => setPeopleQuery(e.target.value)}
              placeholder="Type and select a name"
              className="h-11 w-full rounded-md border border-[#0C2340] bg-white px-3 py-2 pl-9 pr-8 shadow-sm outline-none ring-0 focus:border-[#0C2340]"
            />
            <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><path d="M21 21l-4.3-4.3"></path></svg>
            </span>
            {peopleQuery && (
              <button aria-label="Clear" onClick={() => setPeopleQuery("")} className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600">×</button>
            )}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-transparent select-none">Actions</label>
          <div className="mt-1 flex items-center gap-2">
            <button onClick={() => setShowFilters((v) => !v)} className="inline-flex h-11 items-center gap-2 rounded-md bg-[#0C2340] px-3 text-sm font-bold text-white hover:brightness-110">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon></svg>
              More filters{activeFilterCount ? ` - ${activeFilterCount}` : ""}
            </button>
            <button onClick={clearAll} className="inline-flex h-11 items-center rounded-md border px-3 text-sm font-bold hover:bg-gray-50 border-[#0C2340] text-[#0C2340]">Clear all filters</button>
          </div>
        </div>
      </div>

      {showFilters && (
        <div className="rounded-lg border border-[#E5E7EB] bg-white p-4 shadow-sm">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <SearchableMultiSelect
              label="Class year"
              options={classYears.map(String)}
              values={years}
              onChange={setYears}
            />
            <SearchableMultiSelect
              label="Major(s)"
              options={majors}
              values={majorsSelected}
              onChange={setMajorsSelected}
            />
            <SearchableMultiSelect
              label="Minor(s)"
              options={minors}
              values={minorsSelected}
              onChange={setMinorsSelected}
            />
            <SearchableMultiSelect
              label="Residence hall"
              options={dorms}
              values={dormsSelected}
              onChange={setDormsSelected}
            />
            <SearchableMultiSelect
              label="Hometown"
              options={hometowns}
              values={hometownsSelected}
              onChange={setHometownsSelected}
            />
            <SearchableMultiSelect
              label="Specific class(es)"
              options={courses}
              values={classesSelected}
              onChange={setClassesSelected}
            />
            <SearchableMultiSelect
              label="Companies worked for"
              options={companies}
              values={companiesSelected}
              onChange={setCompaniesSelected}
            />
            <SearchableMultiSelect
              label="Clubs/organizations"
              options={clubs}
              values={clubsSelected}
              onChange={setClubsSelected}
            />
            <SearchableMultiSelect
              label="Sports"
              options={sportsOptions}
              values={sportsSelected}
              onChange={setSportsSelected}
            />
            <SearchableMultiSelect
              label="Hobbies/interests"
              options={interests}
              values={interestsSelected}
              onChange={setInterestsSelected}
            />
            <div className="flex flex-col">
              <div className="flex items-baseline">
                <label className="block text-sm font-medium text-gray-700">Similarity Algorithm</label>
                <span className="text-black text-xs ml-1">(</span>
                <Link
                  href="/tutorial"
                  className="text-xs text-blue-600 underline"
                >
                  More Info
                </Link>
                <span className="text-black text-xs">)</span>
              </div>
              <button
                onClick={() => {
                  // Add similarity algorithm logic here
                  console.log('Similarity algorithm clicked');
                }}
                className="mt-1 flex h-11 items-center justify-center rounded-md border border-gray-300 bg-white px-3 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#0C2340] focus:ring-offset-2"
              >
                Find Similar Students
              </button>
            </div>
          </div>
        </div>
      )}

        <div className="flex items-center justify-between mb-4">
          <div className="text-2xl font-bold text-gray-800">Users ({filtered.length})</div>
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-700">Sort by</label>
            <div className="w-[200px]">
              <SimpleSelect
                value={sortBy}
                onChange={setSortBy}
                options={[
                  { label: "A–Z first name", value: "first_az" },
                  { label: "Z–A first name", value: "first_za" },
                  { label: "A–Z last name", value: "last_az" },
                  { label: "Z–A last name", value: "last_za" },
                ]}
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {currentProfiles.map((s) => (
            <article key={s.id} className="flex flex-col rounded-xl border border-gray-200 bg-white p-6 shadow-sm hover:shadow-lg transition-shadow duration-200">
              <div className="flex-grow flex flex-col">
                <div className="flex-grow">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-4">
                      <div className="h-14 w-14 shrink-0 rounded-full bg-gray-100 flex items-center justify-center text-lg font-semibold text-gray-700">
                        {s.profilePhotoUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={s.profilePhotoUrl} alt={s.name} className="h-14 w-14 rounded-full object-cover" />
                        ) : (
                          s.name.split(" ").map((n) => n[0]).slice(0, 2).join("")
                        )}
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          {s.name}
                        </h3>
                        <div className="text-sm text-gray-500">{s.hometown}</div>
                      </div>
                    </div>
                    <div className="h-8 w-8 shrink-0 flex items-center justify-center">
                      <img 
                        src="/Notre_Dame_Leprechaun_logo.svg" 
                        alt="Notre Dame Leprechaun" 
                        className="h-6 w-6 object-contain"
                      />
                    </div>
                  </div>

                </div>
                <div className="mt-4 space-y-2 text-sm">
                  <div>
                    <span className="font-bold text-gray-800">Major:</span>{" "}
                    <span className="text-gray-600">{s.major}{s.minor && `, ${s.minor}`}</span>
                  </div>
                  <div>
                    <span className="font-bold text-gray-800">Class year:</span>{" "}
                    <span className="text-gray-600">{s.classYear}</span>
                  </div>
                  <div>
                    <span className="font-bold text-gray-800">Residence hall:</span>{" "}
                    <span className="text-gray-600">{s.dorm}</span>
                  </div>
                </div>
              </div>
              <div className="mt-4">
                <Link href={`/profile/${s.id}`}>
                  <button className="h-11 w-full rounded-md bg-[#0C2340] px-4 text-sm font-semibold text-white hover:brightness-110">
                    Go to profile
                  </button>
                </Link>
              </div>
            </article>
          ))}
        </div>

        {filtered.length > 0 && (
          <div className="mt-8 flex items-center justify-between">
            <div className="w-44" /> {/* Spacer */}

            {/* Pagination Controls */}
            <div className="flex items-center justify-center gap-4">
              <button
                onClick={() => paginate(currentPage - 1)}
                disabled={currentPage === 1}
                className="h-10 w-10 flex items-center justify-center rounded-lg bg-white shadow-sm border border-gray-200 text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label="Previous Page"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M15 18l-6-6 6-6"/>
                </svg>
              </button>
              <div className="flex items-center gap-2">
                {getPaginationItems(currentPage, totalPages).map((item, index) => {
                  if (typeof item === 'string') {
                    return <span key={index} className="px-2 py-1 text-sm font-bold text-gray-500">...</span>
                  }
                  return (
                    <button
                      key={index}
                      onClick={() => paginate(item)}
                      className={`h-10 w-10 flex items-center justify-center rounded-lg text-sm font-bold transition-colors ${
                        currentPage === item 
                          ? 'bg-white shadow-sm border-2 border-[#0C2340] text-[#0C2340]' 
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      {item}
                    </button>
                  )
                })}
              </div>
              <button
                onClick={() => paginate(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="h-10 w-10 flex items-center justify-center rounded-lg bg-white shadow-sm border border-gray-200 text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label="Next Page"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 18l6-6-6-6"/>
                </svg>
              </button>
            </div>

            {/* Profiles per page dropdown */}
            <div className="flex items-center gap-2 w-44 justify-end">
              <label className="text-sm font-medium text-gray-700">Show</label>
              <div className="w-20">
                <SimpleSelect
                  value={String(profilesPerPage)}
                  onChange={(value) => setProfilesPerPage(Number(value))}
                  options={[
                    { label: "24", value: "24" },
                    { label: "48", value: "48" },
                    { label: "96", value: "96" },
                  ]}
                  direction="up"
                />
              </div>
              <label className="text-sm font-medium text-gray-700">per page</label>
            </div>
          </div>
        )}
        </>
      )}

      {activeTab === "chat" && (
        <div className="flex h-[calc(100vh-180px)] bg-white rounded-lg shadow-lg overflow-hidden border border-[#0C2340]">
          {/* Left Sidebar - Group List */}
          <div className="w-1/3 border-r border-[#0C2340] bg-gray-50 flex flex-col">
            {/* Search Bar */}
            <div className="p-4 border-b border-[#0C2340] bg-white flex items-center" style={{ height: '65px' }}>
              <div className="relative w-full">
                <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><path d="M21 21l-4.3-4.3"></path></svg>
                </span>
                <input
                  type="text"
                  placeholder="Search groups"
                  value={groupSearchQuery}
                  onChange={(e) => setGroupSearchQuery(e.target.value)}
                  className="h-11 w-full rounded-md border border-[#0C2340] bg-white px-3 py-2 pl-9 pr-8 shadow-sm outline-none ring-0 focus:border-[#0C2340]"
                />
              </div>
            </div>

            {/* Group List */}
            <div className="flex-1 overflow-y-auto bg-white">
              {/* My Groups Section */}
              {myGroups.length > 0 && (
                <>
                  <div className="px-3 py-2 bg-gray-100 border-b border-gray-200">
                    <h3 className="text-xs font-semibold text-gray-700 uppercase tracking-wide">My Groups</h3>
                  </div>
                  {myGroups.map((group) => (
                    <div
                      key={group.id}
                      className={`p-3 border-b border-gray-100 cursor-pointer transition-colors ${
                        selectedGroup?.id === group.id 
                          ? 'bg-blue-50 border-l-4 border-l-blue-500' 
                          : 'hover:bg-gray-50'
                      }`}
                      onClick={() => {
                        setSelectedGroup(group);
                      }}
                    >
                      <div className="flex items-center space-x-3">
                        <div className="relative">
                          <div className="w-12 h-12 bg-[#0C2340]/10 rounded-full flex items-center justify-center text-sm font-semibold text-[#0C2340]">
                            {group.avatar}
                          </div>
                          {group.unread && (
                            <div className="absolute -top-1 -right-1 w-4 h-4 bg-[#0C2340] rounded-full flex items-center justify-center">
                              <div className="w-2 h-2 bg-white rounded-full"></div>
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <h3 className="text-sm font-semibold text-gray-900 truncate">{group.name}</h3>
                            <span className="text-xs text-gray-500 font-medium">{group.time}</span>
                          </div>
                          <p className="text-xs text-gray-600 truncate">{group.description}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </>
              )}

              {/* All Groups Section */}
              {allGroups.length > 0 && (
                <>
                  <div className="px-3 py-2 bg-gray-100 border-b border-gray-200">
                    <h3 className="text-xs font-semibold text-gray-700 uppercase tracking-wide">All Groups</h3>
                  </div>
                  {allGroups.map((group) => (
                    <div
                      key={group.id}
                      className={`p-3 border-b border-gray-100 cursor-pointer transition-colors ${
                        selectedGroup?.id === group.id 
                          ? 'bg-blue-50 border-l-4 border-l-blue-500' 
                          : 'hover:bg-gray-50'
                      }`}
                      onClick={() => {
                        setSelectedGroup(group);
                      }}
                    >
                      <div className="flex items-center space-x-3">
                        <div className="relative">
                          <div className="w-12 h-12 bg-[#0C2340]/10 rounded-full flex items-center justify-center text-sm font-semibold text-[#0C2340]">
                            {group.avatar}
                          </div>
                          {group.unread && (
                            <div className="absolute -top-1 -right-1 w-4 h-4 bg-[#0C2340] rounded-full flex items-center justify-center">
                              <div className="w-2 h-2 bg-white rounded-full"></div>
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <h3 className="text-sm font-semibold text-gray-900 truncate">{group.name}</h3>
                            <span className="text-xs text-gray-500 font-medium">{group.time}</span>
                          </div>
                          <p className="text-xs text-gray-600 truncate">{group.description}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </>
              )}

              {/* No groups message */}
              {myGroups.length === 0 && allGroups.length === 0 && (
                <div className="p-4 text-center text-gray-500">
                  <p className="text-sm">No groups found</p>
                </div>
              )}
            </div>

          </div>

          {/* Right Side - Chat Area */}
          <div className="flex-1 flex flex-col">
            {selectedGroup ? (
              joinedGroups.includes(selectedGroup.id) ? (
                <>
                  {/* Chat Header */}
                  <div className="p-4 border-b border-[#0C2340] bg-white flex items-center justify-between" style={{ height: '65px' }}>
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center text-sm font-medium text-gray-700">
                        {selectedGroup.avatar}
                      </div>
                      <div>
                        <h2 className="text-lg font-semibold text-gray-900">To: {selectedGroup.name}</h2>
                      </div>
                    </div>
                    <button className="inline-flex h-11 items-center gap-2 rounded-md bg-[#0C2340] px-3 text-sm font-bold text-white hover:brightness-110">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                        <circle cx="8.5" cy="7" r="4"/>
                        <line x1="20" y1="8" x2="20" y2="14"/>
                        <line x1="23" y1="11" x2="17" y2="11"/>
                      </svg>
                      Create New Group
                    </button>
                  </div>

                  {/* Messages Area */}
                  <div className="flex-1 bg-gray-100 p-4 overflow-y-auto">
                    <div className="space-y-4">
                      {/* Messages will appear here */}
                    </div>
                  </div>

                  {/* Message Input */}
                  <div className="p-4 border-t border-[#0C2340] bg-white">
                    <div className="flex items-center space-x-2">
                      <div className="flex-1 relative">
                        <input
                          type="text"
                          placeholder="Type a message..."
                          className="h-11 w-full rounded-md border border-[#0C2340] bg-white px-3 py-2 pr-12 shadow-sm outline-none ring-0 focus:border-[#0C2340]"
                        />
                        <button className="absolute right-2 top-1/2 transform -translate-y-1/2 h-7 w-7 rounded-md bg-[#0C2340] text-white hover:brightness-110 flex items-center justify-center">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="22" y1="2" x2="11" y2="13"/>
                            <polygon points="22,2 15,22 11,13 2,9 22,2"/>
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex-1 flex flex-col">
                  {/* Header with Create Button */}
                  <div className="p-4 border-b border-[#0C2340] bg-white flex items-center justify-end" style={{ height: '65px' }}>
                    <button className="inline-flex h-11 items-center gap-2 rounded-md bg-[#0C2340] px-3 text-sm font-bold text-white hover:brightness-110">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                        <circle cx="8.5" cy="7" r="4"/>
                        <line x1="20" y1="8" x2="20" y2="14"/>
                        <line x1="23" y1="11" x2="17" y2="11"/>
                      </svg>
                      Create New Group
                    </button>
                  </div>
                  {/* Join Group Prompt */}
                  <div className="flex-1 flex items-center justify-center bg-gray-100">
                    <div className="text-center p-8">
                      <div className="mx-auto w-16 h-16 bg-gray-300 rounded-full flex items-center justify-center text-2xl font-medium text-gray-700 mb-4">
                        {selectedGroup.avatar}
                      </div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">
                        You are about to join "{selectedGroup.name}"
                      </h3>
                      <p className="text-gray-500 max-w-md mx-auto mb-6">
                        {selectedGroup.description}
                      </p>
                      <button 
                        onClick={() => setJoinedGroups([...joinedGroups, selectedGroup.id])}
                        className="h-11 w-full max-w-xs mx-auto rounded-md bg-[#0C2340] px-4 text-sm font-bold text-white hover:brightness-110"
                      >
                        Join Group
                      </button>
                    </div>
                  </div>
                </div>
              )
            ) : (
              /* No Group Selected */
              <div className="flex-1 flex flex-col">
                {/* Header with Create Button */}
                <div className="p-4 border-b border-[#0C2340] bg-white flex items-center justify-end" style={{ height: '65px' }}>
                  <button className="inline-flex h-11 items-center gap-2 rounded-md bg-[#0C2340] px-3 text-sm font-bold text-white hover:brightness-110">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                      <circle cx="8.5" cy="7" r="4"/>
                      <line x1="20" y1="8" x2="20" y2="14"/>
                      <line x1="23" y1="11" x2="17" y2="11"/>
                    </svg>
                    Create New Group
                  </button>
                </div>
                
                {/* No Group Message */}
                <div className="flex-1 flex items-center justify-center bg-gray-100">
                  <div className="text-center">
                    <div className="mx-auto w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mb-4">
                      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400">
                        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                      </svg>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Click on a group to join the conversation</h3>
                    <p className="text-gray-500 max-w-md mx-auto">
                      Select a group from the left sidebar to start chatting with your classmates.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
      </div>
  );
}
