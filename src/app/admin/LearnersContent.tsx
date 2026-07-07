"use client";

import React from "react";
import Link from "next/link";
import DashboardLayout from "@/components/DashboardLayout";
import {
  IconShieldLock,
  IconUsers,
} from "@tabler/icons-react";

interface UserProfile {
  id: string;
  email: string;
  fullName: string;
  selectedRole: string;
  otherRoleText: string | null;
  goals: string[];
  profileImage: string | null;
  collegeStudying: string | null;
  branch: string | null;
  year: string | null;
  dob: string | null;
  portfolioLink: string | null;
  linkedinLink: string | null;
  about: string | null;
  isPremium: boolean;
  createdAt: Date | string;
  updatedAt: Date | string;
}

interface PaymentRequestInfo {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  plan: string;
  referenceNo: string;
  name: string;
  utrNo: string;
  status: string;
  createdAt: Date | string;
  updatedAt: Date | string;
}

interface LearnersContentProps {
  adminUser: {
    fullName: string;
    email: string;
    profileImage?: string | null;
  };
  allUsers: UserProfile[];
  paymentRequests: PaymentRequestInfo[];
}

export default function LearnersContent({ adminUser, allUsers, paymentRequests }: LearnersContentProps) {
  const [users, setUsers] = React.useState<UserProfile[]>(allUsers);
  const [requests, setRequests] = React.useState<PaymentRequestInfo[]>(paymentRequests);
  const [togglingIds, setTogglingIds] = React.useState<Record<string, boolean>>({});
  const [approvingIds, setApprovingIds] = React.useState<Record<string, boolean>>({});

  const handleApprovePayment = async (requestId: string, userId: string) => {
    if (approvingIds[requestId]) return;
    setApprovingIds((prev) => ({ ...prev, [requestId]: true }));

    try {
      const res = await fetch(`/api/admin/payment-requests/${requestId}/approve`, {
        method: "POST",
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          // Update the specific request status to APPROVED
          setRequests((prev) =>
            prev.map((req) =>
              req.id === requestId ? { ...req, status: "APPROVED" } : req
            )
          );
          // Upgrade the corresponding user's isPremium status locally
          setUsers((prev) =>
            prev.map((user) =>
              user.id === userId ? { ...user, isPremium: true } : user
            )
          );
        }
      }
    } catch (err) {
      console.error("Failed to approve payment request:", err);
    } finally {
      setApprovingIds((prev) => ({ ...prev, [requestId]: false }));
    }
  };

  const formatDate = (dateValue: Date | string | null) => {
    if (!dateValue) return "—";
    const date = new Date(dateValue);
    return date.toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const handleTogglePremium = async (userId: string) => {
    if (togglingIds[userId]) return;

    setTogglingIds((prev) => ({ ...prev, [userId]: true }));

    try {
      const res = await fetch(`/api/admin/users/${userId}/premium`, {
        method: "POST",
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setUsers((prev) =>
            prev.map((user) =>
              user.id === userId ? { ...user, isPremium: data.user.isPremium } : user
            )
          );
        }
      }
    } catch (err) {
      console.error("Failed to toggle premium status:", err);
    } finally {
      setTogglingIds((prev) => ({ ...prev, [userId]: false }));
    }
  };

  return (
    <DashboardLayout user={adminUser}>
      <div className="flex h-fit w-full flex-col justify-between rounded-2xl border border-slate-200 bg-white p-6 md:p-10 shadow-sm animate-fadeIn relative">
        <div>
          {/* Header Block (Styled matching the user dashboard) */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-6 border-b border-slate-100 gap-4">
            <div>
              <span className="text-xs font-bold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-md flex items-center gap-1 w-fit">
                <IconShieldLock className="w-3.5 h-3.5" />
                Learners Console Active
              </span>
              <h3 className="text-2xl font-bold text-slate-800 mt-2">
                Welcome, {adminUser.fullName}!
              </h3>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 flex items-center gap-3">
              <span className="bg-amber-100 text-amber-800 p-2 rounded-lg">
                <IconUsers className="w-5 h-5" />
              </span>
              <div>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Total Learners</p>
                <p className="text-lg font-extrabold text-slate-800 leading-none mt-0.5">{allUsers.length}</p>
              </div>
            </div>
          </div>

          {/* Database Table Section */}
          <div className="mt-8">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-sm font-bold text-slate-700 uppercase tracking-wider">
                Learners List
              </h4>
              <p className="text-xs text-slate-400">Click on a name to inspect full profile details</p>
            </div>
            
            <div className="w-full overflow-x-auto border border-slate-200 rounded-xl">
              <table className="w-full min-w-[950px] text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50">
                    <th className="py-3 px-4 text-xs font-bold text-slate-600 uppercase tracking-wider whitespace-nowrap">Full Name</th>
                    <th className="py-3 px-4 text-xs font-bold text-slate-600 uppercase tracking-wider whitespace-nowrap">Email Address</th>
                    <th className="py-3 px-4 text-xs font-bold text-slate-600 uppercase tracking-wider whitespace-nowrap">Role Track</th>
                    <th className="py-3 px-4 text-xs font-bold text-slate-600 uppercase tracking-wider whitespace-nowrap">College</th>
                    <th className="py-3 px-4 text-xs font-bold text-slate-600 uppercase tracking-wider whitespace-nowrap">Branch</th>
                    <th className="py-3 px-4 text-xs font-bold text-slate-600 uppercase tracking-wider whitespace-nowrap">Joined Date</th>
                    <th className="py-3 px-4 text-xs font-bold text-slate-600 uppercase tracking-wider text-center whitespace-nowrap">Premium Access</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {users.length > 0 ? (
                    users.map((u) => (
                      <tr key={u.id} className="hover:bg-slate-50/50 transition duration-150">
                        <td className="py-4 px-4 text-sm font-bold whitespace-nowrap">
                          <Link
                            href={`/admin/learner/${u.id}`}
                            className="text-indigo-600 hover:text-indigo-800 hover:underline text-left cursor-pointer transition font-bold"
                          >
                            {u.fullName}
                          </Link>
                        </td>
                        <td className="py-4 px-4 text-sm text-slate-600 whitespace-nowrap">{u.email}</td>
                        <td className="py-4 px-4 text-sm whitespace-nowrap">
                          <span className="inline-block bg-blue-50 text-blue-700 text-xs font-semibold px-2.5 py-0.5 rounded-full border border-blue-100">
                            {u.selectedRole}
                            {u.selectedRole === "Other" && u.otherRoleText && ` (${u.otherRoleText})`}
                          </span>
                        </td>
                        <td className="py-4 px-4 text-sm text-slate-600 font-medium truncate max-w-[200px]" title={u.collegeStudying || ""}>{u.collegeStudying || "—"}</td>
                        <td className="py-4 px-4 text-sm text-slate-600 truncate max-w-[150px]" title={u.branch || ""}>{u.branch || "—"}</td>
                        <td className="py-4 px-4 text-xs text-slate-500 font-mono whitespace-nowrap">
                          {formatDate(u.createdAt)}
                        </td>
                        <td className="py-4 px-4 text-sm text-center whitespace-nowrap">
                          <button
                            onClick={() => handleTogglePremium(u.id)}
                            disabled={togglingIds[u.id]}
                            className={`px-3 py-1.5 rounded-lg text-xs font-extrabold cursor-pointer transition select-none flex items-center justify-center gap-1 mx-auto border ${
                              u.isPremium
                                ? "bg-amber-50 border-amber-200 text-amber-700 hover:bg-amber-100"
                                : "bg-slate-50 border-slate-200 text-slate-500 hover:text-slate-800 hover:bg-slate-100"
                            }`}
                          >
                            <span className="material-symbols-outlined text-[14px]">
                              {u.isPremium ? "workspace_premium" : "lock"}
                            </span>
                            {togglingIds[u.id] ? "Updating..." : u.isPremium ? "Premium (Revoke)" : "Free (Upgrade)"}
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-sm text-slate-500 font-medium">
                        No learners registered in database.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Section: Premium Upgrade Requests */}
          <div className="bg-white border border-slate-300 rounded-2xl p-6 mt-10">
            <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h4 className="text-sm font-bold text-slate-700 uppercase tracking-wider">
                  Premium Upgrade Requests
                </h4>
                <p className="text-xs text-slate-400">
                  Review reference numbers and UTR details from banking transactions.
                </p>
              </div>
            </div>

            <div className="w-full overflow-x-auto border border-slate-200 rounded-xl">
              <table className="w-full min-w-[950px] text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50">
                    <th className="py-3 px-4 text-xs font-bold text-slate-600 uppercase tracking-wider whitespace-nowrap">Learner Name</th>
                    <th className="py-3 px-4 text-xs font-bold text-slate-600 uppercase tracking-wider whitespace-nowrap">Email Address</th>
                    <th className="py-3 px-4 text-xs font-bold text-slate-600 uppercase tracking-wider whitespace-nowrap">Selected Plan</th>
                    <th className="py-3 px-4 text-xs font-bold text-slate-600 uppercase tracking-wider whitespace-nowrap">Reference No</th>
                    <th className="py-3 px-4 text-xs font-bold text-slate-600 uppercase tracking-wider whitespace-nowrap">Payer Name</th>
                    <th className="py-3 px-4 text-xs font-bold text-slate-600 uppercase tracking-wider whitespace-nowrap">UTR Number</th>
                    <th className="py-3 px-4 text-xs font-bold text-slate-600 uppercase tracking-wider whitespace-nowrap">Status</th>
                    <th className="py-3 px-4 text-xs font-bold text-slate-600 uppercase tracking-wider text-center whitespace-nowrap">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 text-xs">
                  {requests.length > 0 ? (
                    requests.map((req) => (
                      <tr key={req.id} className="hover:bg-slate-50/50 transition duration-150">
                        <td className="py-4 px-4 font-bold text-slate-800 whitespace-nowrap">{req.userName}</td>
                        <td className="py-4 px-4 text-slate-600 whitespace-nowrap">{req.userEmail}</td>
                        <td className="py-4 px-4 whitespace-nowrap">
                          <span className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-md ${
                            req.plan === "YEARLY"
                              ? "bg-amber-100 text-amber-900 border border-amber-200"
                              : "bg-blue-50 text-blue-800 border border-blue-100"
                          }`}>
                            {req.plan}
                          </span>
                        </td>
                        <td className="py-4 px-4 text-slate-600 font-mono whitespace-nowrap">{req.referenceNo}</td>
                        <td className="py-4 px-4 text-slate-800 font-semibold whitespace-nowrap">{req.name}</td>
                        <td className="py-4 px-4 text-slate-650 font-mono whitespace-nowrap">{req.utrNo}</td>
                        <td className="py-4 px-4 whitespace-nowrap">
                          <span className={`inline-block font-extrabold text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                            req.status === "APPROVED"
                              ? "bg-emerald-50 text-emerald-700 border-emerald-250"
                              : "bg-yellow-50 text-yellow-700 border-yellow-250 animate-pulse"
                          }`}>
                            {req.status}
                          </span>
                        </td>
                        <td className="py-4 px-4 text-center whitespace-nowrap">
                          {req.status === "PENDING" ? (
                            <button
                              onClick={() => handleApprovePayment(req.id, req.userId)}
                              disabled={approvingIds[req.id]}
                              className="bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-100 disabled:text-slate-400 text-white rounded-lg px-3 py-1.5 font-bold transition select-none flex items-center justify-center gap-1 mx-auto cursor-pointer"
                            >
                              <span className="material-symbols-outlined text-[14px]">done_all</span>
                              {approvingIds[req.id] ? "Approving..." : "Approve Premium"}
                            </button>
                          ) : (
                            <span className="text-slate-400 font-semibold flex items-center justify-center gap-1">
                              <span className="material-symbols-outlined text-[16px] text-emerald-600">check_circle</span>
                              Verified
                            </span>
                          )}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={8} className="py-8 text-center text-slate-450 font-medium">
                        No premium payment logs submitted.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      </div>
    </DashboardLayout>
  );
}
