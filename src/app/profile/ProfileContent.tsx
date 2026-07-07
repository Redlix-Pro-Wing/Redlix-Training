"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/DashboardLayout";
import { IconEdit, IconExternalLink, IconLoader, IconLogout } from "@tabler/icons-react";

interface UserProfile {
  fullName: string;
  email: string;
  selectedRole: string;
  otherRoleText: string;
  goals: string[];
  profileImage: string;
  collegeStudying: string;
  branch: string;
  year: string;
  dob: string;
  portfolioLink: string;
  linkedinLink: string;
  about: string;
  shareWithNetworking: boolean;
  isPremium: boolean;
}

interface ProfileContentProps {
  user: UserProfile;
}

export default function ProfileContent({ user }: ProfileContentProps) {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  
  // Local form state
  const [formData, setFormData] = useState<UserProfile>({ ...user });

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/login");
      router.refresh();
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        setErrorMessage("Image size must be less than 2MB");
        return;
      }
      setErrorMessage("");
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData((prev) => ({ ...prev, profileImage: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage("");

    try {
      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to update profile");
      }

      setIsEditing(false);
      router.refresh();
    } catch (err: any) {
      setErrorMessage(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({ ...user });
    setErrorMessage("");
    setIsEditing(false);
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();
  };

  return (
    <DashboardLayout user={user}>
      <div className="flex h-full w-full flex-col justify-between rounded-2xl border border-slate-300 bg-white shadow-sm overflow-hidden animate-fadeIn">
        
        {/* Error message */}
        {errorMessage && (
          <div className="m-6 p-3 bg-red-50 border border-red-200 text-red-600 rounded-xl text-xs font-medium">
            {errorMessage}
          </div>
        )}

        {/* Content body */}
        <div className="flex-1 overflow-y-auto">
          {!isEditing ? (
            /* View State: Matching user mockup reference */
            <div>
              {/* Top Banner Wave Hero area */}
              <div className="relative w-full h-36 bg-gradient-to-r from-blue-100 via-sky-100 to-indigo-100 rounded-t-2xl" />

              {/* Avatar overlapping section */}
              <div className="relative px-6 md:px-10 pb-6">
                <div className="flex justify-between items-end -mt-16 mb-4">
                  <div className="relative w-32 h-32 rounded-full overflow-hidden border-4 border-white shadow-md flex items-center justify-center bg-blue-150">
                    {user.profileImage ? (
                      <img
                        src={user.profileImage}
                        alt={user.fullName}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-3xl font-extrabold text-blue-600">
                        {getInitials(user.fullName)}
                      </span>
                    )}
                  </div>
                  <button
                    onClick={() => setIsEditing(true)}
                    className="bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 font-semibold px-4 py-2 rounded-xl text-sm transition duration-150 shadow-sm cursor-pointer"
                  >
                    Edit profile
                  </button>
                </div>

                {/* User Header Details */}
                <div className="mt-4">
                  <div className="flex items-center gap-1.5">
                    <h3 className="text-2xl font-bold text-slate-900">{user.fullName}</h3>
                    {/* Instagram-style verified tick mark - adjusted alignment */}
                    <svg className="w-5 h-5 shrink-0 self-center mt-1" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path
                        d="M22.25 12c0-1.43-.88-2.67-2.19-3.34.16-.43.25-.9.25-1.4 0-2.13-1.73-3.86-3.86-3.86-.5 0-.97.1-1.4.25-.67-1.3-1.91-2.19-3.34-2.19s-2.67.89-3.34 2.19c-.43-.15-.9-.25-1.4-.25C4.83 3.4 3.1 5.13 3.1 7.26c0 .5.1.97.25 1.4C2.04 9.33 1.15 10.57 1.15 12c0 1.43.89 2.67 2.2 3.34-.15.43-.25.9-.25 1.4 0 2.13 1.73 3.86 3.86 3.86.5 0 .97-.1 1.4-.25.67 1.3 1.91 2.19 3.34 2.19s2.67-.89 3.34-2.19c.43.15.9.25 1.4.25 2.13 0 3.86-1.73 3.86-3.86 0-.5-.1-.97-.25-1.4 1.31-.67 2.2-1.91 2.2-3.34z"
                        fill="#0095f6"
                      />
                      <path
                        d="M10.54 15.25L7.04 11.75l1.41-1.42 2.09 2.08 5.59-5.59 1.42 1.42-7.01 7.01z"
                        fill="white"
                      />
                    </svg>
                    {user.isPremium && (
                      <span className="ml-2 inline-flex items-center gap-1 bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full border border-amber-300 shadow-2xs">
                        <span className="material-symbols-outlined text-[12px] font-bold">workspace_premium</span>
                        Premium
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-slate-500">{user.email}</p>
                </div>

                {/* Grid Metadata highlight block (Mockup 4 items row) */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-6 border-b border-slate-300 mt-6">
                  <div className="flex flex-col">
                    <span className="text-xs text-slate-600 font-bold">College Studying</span>
                    <span className="text-sm font-semibold text-slate-800 mt-1">{user.collegeStudying || "Not Specified"}</span>
                  </div>
                  <div className="flex flex-col md:border-l md:border-slate-300 md:pl-4">
                    <span className="text-xs text-slate-600 font-bold">Branch</span>
                    <span className="text-sm font-semibold text-slate-800 mt-1">{user.branch || "Not Specified"}</span>
                  </div>
                  <div className="flex flex-col border-l border-slate-300 pl-4">
                    <span className="text-xs text-slate-600 font-bold">Year of Study</span>
                    <span className="text-sm font-semibold text-slate-800 mt-1">{user.year || "Not Specified"}</span>
                  </div>
                  <div className="flex flex-col border-l border-slate-300 pl-4">
                    <span className="text-xs text-slate-600 font-bold">Date of Birth</span>
                    <span className="text-sm font-semibold text-slate-800 mt-1">{user.dob || "Not Specified"}</span>
                  </div>
                </div>

                {/* Detailed Settings blocks below */}
                {/* 1. Public Profile info block */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 py-6 border-b border-slate-300">
                  <div>
                    <h4 className="text-sm font-bold text-slate-800">Public profile</h4>
                    <p className="text-xs text-slate-500 mt-0.5">This will be displayed on your profile.</p>
                  </div>
                  <div className="md:col-span-2 space-y-3">
                    <div className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-sm text-black font-medium">
                      {user.fullName}
                    </div>
                    {user.linkedinLink && (
                      <div className="flex border border-slate-300 rounded-xl overflow-hidden text-sm bg-white">
                        <a
                          href={user.linkedinLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-4 py-2.5 text-blue-600 hover:text-blue-700 hover:underline font-normal flex-1 truncate flex items-center justify-between gap-1.5"
                        >
                          <span>{user.linkedinLink}</span>
                          <IconExternalLink className="w-4 h-4 shrink-0 text-blue-500" />
                        </a>
                      </div>
                    )}
                    {user.portfolioLink && (
                      <div className="flex border border-slate-300 rounded-xl overflow-hidden text-sm bg-white">
                        <a
                          href={user.portfolioLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-4 py-2.5 text-blue-600 hover:text-blue-700 hover:underline font-normal flex-1 truncate flex items-center justify-between gap-1.5"
                        >
                          <span>{user.portfolioLink}</span>
                          <IconExternalLink className="w-4 h-4 shrink-0 text-blue-500" />
                        </a>
                      </div>
                    )}
                  </div>
                </div>

                {/* 2. About Me biography block */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 py-6 border-b border-slate-300">
                  <div>
                    <h4 className="text-sm font-bold text-slate-800">About Me</h4>
                    <p className="text-xs text-slate-500 mt-0.5">Your biography or profile description.</p>
                  </div>
                  <div className="md:col-span-2">
                    <div className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-3 text-sm text-slate-800 leading-relaxed whitespace-pre-wrap min-h-[80px]">
                      {user.about || "No description provided."}
                    </div>
                  </div>
                </div>

                {/* 3. Preferred track block */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 py-6 border-b border-slate-300">
                  <div>
                    <h4 className="text-sm font-bold text-slate-800">Preferred Track</h4>
                    <p className="text-xs text-slate-500 mt-0.5">Your tailored training track.</p>
                  </div>
                  <div className="md:col-span-2">
                    <div className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-sm text-slate-800 font-medium">
                      {user.selectedRole} {user.otherRoleText && `(${user.otherRoleText})`}
                    </div>
                  </div>
                </div>

                {/* Share settings block */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 py-6 border-b border-slate-300">
                  <div>
                    <h4 className="text-sm font-bold text-slate-800">Networking Sharing</h4>
                    <p className="text-xs text-slate-500 mt-0.5">Control your profile visibility in the Networking directory.</p>
                  </div>
                  <div className="md:col-span-2">
                    <div className="flex items-center gap-2">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                        user.shareWithNetworking 
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-100" 
                          : "bg-slate-100 text-slate-600 border border-slate-200"
                      }`}>
                        {user.shareWithNetworking ? "Sharing Enabled" : "Sharing Disabled (Private Details)"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* 4. Log out block */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 py-6">
                  <div>
                    <h4 className="text-sm font-bold text-slate-800">Log out of all devices</h4>
                    <p className="text-xs text-slate-500 mt-0.5">Log out of all active sessions besides this one.</p>
                  </div>
                  <div className="md:col-span-2 flex justify-end md:justify-start items-center">
                    <button
                      onClick={handleLogout}
                      className="bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 font-semibold px-4 py-2 rounded-xl text-sm transition duration-150 cursor-pointer shadow-sm"
                    >
                      Log out
                    </button>
                  </div>
                </div>

              </div>
            </div>
          ) : (
            /* Edit State Form */
            <form onSubmit={handleSubmit} className="p-6 md:p-10 space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-slate-150">
                <h3 className="text-xl font-bold text-slate-800">Edit Your Profile</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Photo Upload Column */}
                <div className="flex flex-col items-center p-6 border border-slate-100 rounded-2xl bg-slate-50/50">
                  <div className="relative w-32 h-32 rounded-full overflow-hidden border-4 border-white shadow-md flex items-center justify-center bg-blue-150 mb-4">
                    {formData.profileImage ? (
                      <img
                        src={formData.profileImage}
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-3xl font-extrabold text-blue-600">
                        {getInitials(formData.fullName)}
                      </span>
                    )}
                  </div>
                  <label className="bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 px-4 py-2 rounded-xl text-xs font-semibold shadow-sm cursor-pointer transition duration-150">
                    Upload Photo
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                  </label>
                  <p className="text-[10px] text-slate-600 mt-2 text-center">
                    Max size: 2MB. Supports PNG, JPG, or GIF.
                  </p>
                </div>

                {/* Edit Form Fields Grid */}
                <div className="md:col-span-2 space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Full Name
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.fullName}
                      onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                      className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm bg-slate-50/50 focus:bg-white focus:border-blue-500 focus:outline-none transition duration-150 text-slate-800"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      About Me
                    </label>
                    <textarea
                      value={formData.about}
                      onChange={(e) => setFormData({ ...formData, about: e.target.value })}
                      rows={3}
                      className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm bg-slate-50/50 focus:bg-white focus:border-blue-500 focus:outline-none transition duration-150 text-slate-800"
                      placeholder="Tell us about yourself..."
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        College Studying
                      </label>
                      <input
                        type="text"
                        value={formData.collegeStudying}
                        onChange={(e) => setFormData({ ...formData, collegeStudying: e.target.value })}
                        className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm bg-slate-50/50 focus:bg-white focus:border-blue-500 focus:outline-none transition duration-150 text-slate-800"
                        placeholder="e.g. Stanford University"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Branch
                      </label>
                      <input
                        type="text"
                        value={formData.branch}
                        onChange={(e) => setFormData({ ...formData, branch: e.target.value })}
                        className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm bg-slate-50/50 focus:bg-white focus:border-blue-500 focus:outline-none transition duration-150 text-slate-800"
                        placeholder="e.g. Computer Science"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Year of Study
                      </label>
                      <select
                        value={formData.year}
                        onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                        className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm bg-slate-50/50 focus:bg-white focus:border-blue-500 focus:outline-none transition duration-150 text-slate-800"
                      >
                        <option value="">Select Year</option>
                        <option value="1st Year">1st Year</option>
                        <option value="2nd Year">2nd Year</option>
                        <option value="3rd Year">3rd Year</option>
                        <option value="4th Year">4th Year</option>
                        <option value="Graduate">Graduate</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Date of Birth
                      </label>
                      <input
                        type="date"
                        value={formData.dob}
                        onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
                        className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm bg-slate-50/50 focus:bg-white focus:border-blue-500 focus:outline-none transition duration-150 text-slate-800"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Portfolio Link
                      </label>
                      <input
                        type="url"
                        value={formData.portfolioLink}
                        onChange={(e) => setFormData({ ...formData, portfolioLink: e.target.value })}
                        className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm bg-slate-50/50 focus:bg-white focus:border-blue-500 focus:outline-none transition duration-150 text-slate-800"
                        placeholder="https://myportfolio.com"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        LinkedIn Profile
                      </label>
                      <input
                        type="url"
                        value={formData.linkedinLink}
                        onChange={(e) => setFormData({ ...formData, linkedinLink: e.target.value })}
                        className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm bg-slate-50/50 focus:bg-white focus:border-blue-500 focus:outline-none transition duration-150 text-slate-800"
                        placeholder="https://linkedin.com/in/username"
                      />
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-100">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.shareWithNetworking}
                        onChange={(e) => setFormData({ ...formData, shareWithNetworking: e.target.checked })}
                        className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                      />
                      <div>
                        <span className="block text-xs font-bold text-slate-800">
                          Share your details with networking
                        </span>
                        <span className="block text-[11px] text-slate-500 mt-0.5 font-normal">
                          Allow other trainees to view your college, year of study, dob, portfolio, and linkedin links in the chat directory.
                        </span>
                      </div>
                    </label>
                  </div>

                </div>
              </div>

              {/* Form Controls */}
              <div className="flex justify-end gap-3 pt-6 border-t border-slate-100">
                <button
                  type="button"
                  onClick={handleCancel}
                  className="bg-white border border-slate-200 text-slate-755 hover:bg-slate-50 px-5 py-2.5 rounded-xl text-sm font-semibold transition duration-150 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition duration-150 shadow-md shadow-blue-100 cursor-pointer"
                >
                  {loading ? (
                    <>
                      <IconLoader className="w-4 h-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    "Save Changes"
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
