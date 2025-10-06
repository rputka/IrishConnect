/**
 * Tutorial and help page explaining how to use the IrishConnect platform.
 * This file provides user guidance on the application's key features including
 * advanced filtering, the similarity algorithm, and group chat functionality.
 * Features visual cards with images and detailed explanations.
 */
import Link from "next/link";
import Image from "next/image";

export default function TutorialPage() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="relative flex items-center justify-center mb-8">
        <Link href="/" className="absolute left-0 inline-flex items-center gap-2 rounded-md bg-[#0C2340] px-4 py-2 text-sm font-semibold text-white hover:brightness-110">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5"/>
            <path d="M12 19l-7-7 7-7"/>
          </svg>
          Back to Student Search
        </Link>
        <h1 className="text-3xl font-semibold text-gray-800 tracking-tight">Tutorial & Help</h1>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {/* Advanced Filters Card */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden max-w-md mx-auto">
          <div className="bg-purple-600 px-6 pt-8 pb-0">
            <div className="relative h-40 overflow-hidden">
              <Image 
                src="/Data-Filtering.jpg" 
                alt="Advanced Filters Interface" 
                width={400} 
                height={200}
                className="rounded-t-lg w-full h-full object-cover"
              />
            </div>
          </div>
          <div className="p-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-3">Filtering</h1>
            <p className="text-gray-600 mb-4 leading-relaxed">
              Our advanced filtering system helps you find exactly who you're looking for with precision. You can narrow down your search by combining a variety of criteria - such as major, class year, residence hall, and clubs - to connect with specific groups of students.
            </p>
            <p className="text-gray-600 mb-4 leading-relaxed">
              To get started, just open the "More filters" button on the Student Search page, select your desired criteria from the dropdown menus, and the directory will update in real-time to show you the results.
            </p>
          </div>
        </div>
        {/* Similarity Algorithm Card */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden max-w-md mx-auto">
          {/* Blue Header with Algorithm Image */}
          <div className="bg-blue-800 px-6 pt-8 pb-0">
            <div className="relative h-40 overflow-hidden">
              <Image 
                src="/algorithm.jpg" 
                alt="Similarity Algorithm Interface" 
                width={400} 
                height={200}
                className="rounded-t-lg w-full h-full object-cover"
              />
            </div>
          </div>
          
          {/* White Content Area */}
          <div className="p-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-3">Similarity Algorithm</h1>
            <p className="text-gray-600 mb-4 leading-relaxed">
              Our complex similarity algorithm identifies the ten students most similar to you by calculating a similarity score based on a number of shared attributes, including academics, extracurriculars, and personal interests.
            </p>
            <p className="text-gray-600 mb-4 leading-relaxed">
              Just click the "Find Similar Students" button in the filters section and the algorithm will automatically analyze your profile and return like-minded peers.
            </p>
          </div>
        </div>

        {/* Chat & Groups Card */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden max-w-md mx-auto">
          <div className="bg-orange-500 px-6 pt-8 pb-0">
            <div className="relative h-40 overflow-hidden">
              <Image 
                src="/groupchat2.png" 
                alt="Group Chat Interface" 
                width={400} 
                height={200}
                className="rounded-t-lg w-full h-full object-cover object-top"
              />
            </div>
          </div>
          <div className="p-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-3">Group Chats</h1>
            <p className="text-gray-600 mb-4 leading-relaxed">
              Connect with classmates by creating or joining spontaneous groups for any activity, from a last-minute “Calculus III study session” to “pickup basketball tonight.” Each group has its own lightweight chat room so members can coordinate in real time.
            </p>
            <p className="text-gray-600 mb-4 leading-relaxed">
              To join a conversation, simply click on a group from the list and confirm you want to join. To start your own, click the “Create New Group” button and wait for others to join.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
