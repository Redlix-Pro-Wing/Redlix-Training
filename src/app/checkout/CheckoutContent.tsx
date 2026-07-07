"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/DashboardLayout";

interface CheckoutContentProps {
  user: {
    fullName: string;
    email: string;
    profileImage?: string | null;
    isPremium: boolean;
  };
  plan: string;
}

export default function CheckoutContent({ user, plan }: CheckoutContentProps) {
  const router = useRouter();
  const [name, setName] = useState(user.fullName);
  const [referenceNo, setReferenceNo] = useState("");
  const [utrNo, setUtrNo] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const isMonthly = plan.toLowerCase() === "monthly";
  const cost = isMonthly ? "₹49" : "₹499";
  const planLabel = isMonthly ? "Monthly Premium Track" : "Yearly Premium Track";

  const handleCheckoutSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !referenceNo.trim() || !utrNo.trim() || submitting) return;

    setSubmitting(true);
    setError("");

    try {
      const res = await fetch("/api/payment-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          plan: isMonthly ? "monthly" : "yearly",
          referenceNo,
          name,
          utrNo,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setSuccess(true);
      } else {
        setError(data.error || "Failed to submit checkout details.");
      }
    } catch (err) {
      setError("An unexpected network error occurred.");
    } finally {
      setSubmitting(false);
    }
  };

  if (success) {
    return (
      <DashboardLayout user={user}>
        <div className="flex h-fit w-full flex-col items-center justify-center rounded-2xl border border-slate-350 bg-white p-8 md:p-16 shadow-sm text-center max-w-2xl mx-auto animate-fadeIn mt-10">
          <div className="w-16 h-16 rounded-full bg-emerald-50 border border-emerald-250 text-emerald-600 flex items-center justify-center shadow-xs animate-pulse">
            <span className="material-symbols-outlined text-[36px]">check_circle</span>
          </div>
          <h3 className="text-2xl font-black text-slate-800 mt-6 leading-tight">
            Checkout Submitted!
          </h3>
          <p className="text-sm text-slate-600 mt-3 max-w-md leading-relaxed">
            Your payment reference and UTR details have been logged. The administrator will verify the receipt and enable your Premium access shortly.
          </p>
          <div className="border-t border-slate-200/80 w-full my-6" />
          <button
            onClick={() => {
              router.push("/dashboard");
              router.refresh();
            }}
            className="bg-black hover:bg-slate-900 text-white rounded-xl px-8 py-3 text-xs font-bold transition shadow-xs cursor-pointer select-none"
          >
            Go to Dashboard
          </button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout user={user}>
      <div className="w-full px-4 md:px-8 py-6 space-y-6 animate-fadeIn">
        
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-slate-500 font-medium select-none">
          <a href="/plans" className="hover:text-indigo-600 transition">
            Plans
          </a>
          <span className="text-slate-350">/</span>
          <span className="text-slate-800 font-semibold">Checkout</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-start max-w-5xl">
          
          {/* Left panel: Form details (Col Span 3) */}
          <div className="lg:col-span-3 bg-white rounded-3xl border border-slate-200 shadow-2xs overflow-hidden">
            
            {/* Header banner */}
            <div className="bg-gradient-to-r from-amber-400 to-amber-500 p-6 border-b border-amber-300 text-slate-950">
              <h2 className="text-base font-extrabold flex items-center gap-2">
                <span className="material-symbols-outlined text-[20px] font-bold">payments</span>
                Verify UTR Payment Details
              </h2>
              <p className="text-[11px] text-slate-900 font-semibold mt-1 leading-relaxed">
                Provide transfer credentials to log your subscription request with the academy administrator.
              </p>
            </div>

            <div className="p-6 space-y-4">
              {error && (
                <div className="text-xs text-red-600 bg-red-50 border border-red-100 p-3 rounded-xl font-bold leading-relaxed">
                  {error}
                </div>
              )}

              <form onSubmit={handleCheckoutSubmit} className="space-y-4">
                
                {/* Plan details */}
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
                  <div>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Selected Plan</p>
                    <p className="text-xs font-bold text-slate-800 mt-0.5">{planLabel}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] text-slate-450 font-bold uppercase tracking-wider">Subtotal</p>
                    <p className="text-sm font-black text-slate-800">{cost}</p>
                  </div>
                </div>

                {/* Name */}
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-slate-700">
                    Payer Name
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your full name"
                    className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-xs font-medium focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition text-slate-850 bg-white"
                  />
                </div>

                {/* Reference Number */}
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-slate-700">
                    Payment Reference / UPI Transaction ID
                  </label>
                  <input
                    type="text"
                    required
                    value={referenceNo}
                    onChange={(e) => setReferenceNo(e.target.value)}
                    placeholder="e.g. UPI Ref ID or Bank Ref Number"
                    className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-xs font-medium focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition text-slate-850 bg-white"
                  />
                </div>

                {/* UTR Number */}
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-slate-700 flex items-center justify-between">
                    <span>UTR Number (12 Digits)</span>
                    <span className="text-[9px] text-slate-400 font-semibold lowercase">Required for manual banking audit</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={utrNo}
                    onChange={(e) => setUtrNo(e.target.value)}
                    placeholder="12-digit UTR bank number"
                    className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-xs font-medium focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition text-slate-850 bg-white"
                    maxLength={24}
                  />
                </div>

                <div className="flex justify-end gap-2.5 pt-4 border-t border-slate-100 mt-2">
                  <button
                    type="button"
                    onClick={() => router.push("/plans")}
                    className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold px-4 py-2.5 rounded-lg text-xs transition cursor-pointer select-none"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting || !referenceNo.trim() || !utrNo.trim()}
                    className="bg-slate-950 hover:bg-slate-900 disabled:bg-slate-100 disabled:text-slate-400 text-white font-bold px-5 py-2.5 rounded-lg text-xs shadow-xs transition duration-150 cursor-pointer flex items-center gap-1.5"
                  >
                    {submitting ? "Logging transaction..." : "Submit Receipt details"}
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Right panel: Payment Instructions (Col Span 2) */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Instruction Card */}
            <div className="p-5 rounded-3xl border border-slate-200 bg-slate-50 flex flex-col gap-4">
              <h4 className="text-xs font-black text-slate-500 uppercase tracking-widest">
                Payment Instructions
              </h4>
              
              <div className="text-xs text-slate-600 space-y-3 font-medium leading-relaxed">
                <p>
                  To upgrade your account, send exactly <strong className="text-slate-850">{cost}</strong> to our verified academy UPI merchant identifier:
                </p>
                <div className="bg-white p-3 border border-slate-200 rounded-xl text-center select-all font-mono font-bold text-slate-800 text-sm">
                  upi@redlixacademy
                </div>
                
                <p className="border-t border-slate-200/80 pt-3">
                  Once the transfer completes in your banking application:
                </p>
                <ol className="list-decimal pl-4 space-y-1 text-slate-500 font-medium">
                  <li>Find the 12-digit UTR/Ref number.</li>
                  <li>Copy Payer Name & credentials.</li>
                  <li>Fill out the form on the left.</li>
                </ol>
              </div>

              <div className="border-t border-slate-200/80 pt-3 flex items-start gap-2 text-[10px] text-slate-400 font-semibold">
                <span className="material-symbols-outlined text-[16px] text-slate-400 shrink-0">info</span>
                <span>The administrator will confirm transactions with bank servers and approve access.</span>
              </div>
            </div>

            {/* Support Widget */}
            <div className="p-4 rounded-2xl border border-dashed border-slate-300 bg-white text-center">
              <p className="text-[11px] text-slate-450 font-bold uppercase tracking-wider">Having issues?</p>
              <p className="text-xs text-slate-600 mt-1">Contact accounts at <strong>support@redlixacademy.com</strong></p>
            </div>

          </div>

        </div>

      </div>
    </DashboardLayout>
  );
}
