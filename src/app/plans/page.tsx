import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import prisma from "@/lib/db";
import DashboardLayout from "@/components/DashboardLayout";
import Link from "next/link";

export default async function PlansPage() {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get("session")?.value;

  if (!sessionToken) {
    redirect("/login");
  }

  // Fetch verified user details
  const user = await prisma.user.findUnique({
    where: { id: sessionToken },
    select: {
      fullName: true,
      email: true,
      profileImage: true,
      isPremium: true,
    },
  });

  if (!user) {
    redirect("/login");
  }

  const comparisonFeatures = [
    { name: "Curated Resources & Lectures", free: true, premium: true },
    { name: "Opportunities Board & Events", free: true, premium: true },
    { name: "Study Pod Creation Limit", free: "1 Study Pod max", premium: "Unlimited Pods" },
    { name: "1-on-1 Mentorship Sessions", free: false, premium: true },
    { name: "Startup Hub Product Showcase", free: false, premium: true },
    { name: "Investor Pitch Submissions", free: false, premium: true },
  ];

  return (
    <DashboardLayout user={user}>
      <div className="flex h-fit w-full flex-col rounded-2xl border border-slate-300 bg-white p-6 md:p-10 shadow-sm animate-fadeIn">
        
        {/* Header */}
        <div className="pb-6 border-b border-slate-300">
          <span className="text-xs font-bold text-blue-600 bg-blue-50/60 px-2.5 py-1 rounded-md">
            Premium Subscription
          </span>
          <h3 className="text-2xl font-bold text-slate-800 mt-2">
            Membership Plans
          </h3>
          <p className="text-sm text-slate-600 mt-1">
            Choose a plan that fits your learning style. Upgrade to gain access to expert mentorship and the trainee startup incubator.
          </p>
        </div>

        {/* Pricing Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
          
          {/* Card 1: Free */}
          <div className="flex flex-col rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-2xs hover:border-slate-300 transition duration-150 p-6 justify-between min-h-[350px]">
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest bg-slate-100 px-2.5 py-1 rounded-md">
                Starter Track
              </span>
              <h4 className="text-xl font-extrabold text-slate-800 mt-4">Free Plan</h4>
              <p className="text-xs text-slate-500 mt-1">Access to standard portal tracks.</p>
              
              <div className="mt-5 flex items-baseline text-slate-800">
                <span className="text-3xl font-black">₹0</span>
                <span className="ml-1 text-xs font-semibold text-slate-500">/ forever</span>
              </div>
              
              <ul className="mt-6 space-y-2.5 text-xs text-slate-650 font-medium">
                <li className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[16px] text-emerald-600 font-bold">check_circle</span>
                  <span>Video Lectures & Resources</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[16px] text-emerald-600 font-bold">check_circle</span>
                  <span>Opportunities & Events</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[16px] text-amber-600 font-bold">warning</span>
                  <span>Limit: Exactly 1 Study Pod</span>
                </li>
              </ul>
            </div>
            
            <button disabled className="mt-8 w-full bg-slate-100 text-slate-400 rounded-xl py-2.5 text-center text-xs font-bold transition select-none cursor-not-allowed">
              Default Tier
            </button>
          </div>

          {/* Card 2: Monthly Premium */}
          <div className="flex flex-col rounded-2xl border border-blue-200 bg-white overflow-hidden shadow-xs hover:border-blue-300 transition duration-150 p-6 justify-between min-h-[350px] relative">
            <div className="absolute top-4 right-4 bg-blue-50 text-blue-600 border border-blue-100 rounded-md text-[9px] font-bold px-2 py-0.5 uppercase tracking-wide">
              Popular
            </div>
            <div>
              <span className="text-[10px] font-bold text-blue-600 uppercase tracking-widest bg-blue-50/60 px-2.5 py-1 rounded-md">
                Professional
              </span>
              <h4 className="text-xl font-extrabold text-slate-800 mt-4">Monthly Premium</h4>
              <p className="text-xs text-slate-500 mt-1">Accelerate your training track monthly.</p>
              
              <div className="mt-5 flex items-baseline text-slate-800">
                <span className="text-3xl font-black">₹49</span>
                <span className="ml-1 text-xs font-semibold text-slate-500">/ month</span>
              </div>
              
              <ul className="mt-6 space-y-2.5 text-xs text-slate-650 font-medium">
                <li className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[16px] text-emerald-600 font-bold">check_circle</span>
                  <span><strong>Unlimited</strong> Study Pods</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[16px] text-emerald-600 font-bold">check_circle</span>
                  <span>1-on-1 Expert Mentorship</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[16px] text-emerald-600 font-bold">check_circle</span>
                  <span>Trainee Startup Hub Showcase</span>
                </li>
              </ul>
            </div>
            
            <Link href="/checkout?plan=monthly" className="mt-8 w-full bg-blue-600 hover:bg-blue-700 text-white rounded-xl py-2.5 text-center text-xs font-bold transition shadow-2xs hover:shadow-xs block select-none">
              Choose Monthly
            </Link>
          </div>

          {/* Card 3: Yearly Premium */}
          <div className="flex flex-col rounded-2xl border border-amber-300 bg-linear-to-b from-amber-50/30 to-white overflow-hidden shadow-2xs hover:border-amber-400 transition duration-150 p-6 justify-between min-h-[350px] relative">
            <div className="absolute top-4 right-4 bg-amber-100 text-amber-800 border border-amber-250 rounded-md text-[9px] font-bold px-2 py-0.5 uppercase tracking-wide">
              Best Value
            </div>
            <div>
              <span className="text-[10px] font-bold text-amber-700 uppercase tracking-widest bg-amber-50 px-2.5 py-1 rounded-md">
                Enterprise
              </span>
              <h4 className="text-xl font-extrabold text-slate-800 mt-4">Yearly Premium</h4>
              <p className="text-xs text-slate-500 mt-1">Get dedicated annual benefits & save.</p>
              
              <div className="mt-5 flex items-baseline text-slate-800">
                <span className="text-3xl font-black">₹499</span>
                <span className="ml-1 text-xs font-semibold text-slate-500">/ year</span>
              </div>
              
              <ul className="mt-6 space-y-2.5 text-xs text-slate-650 font-medium">
                <li className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[16px] text-emerald-600 font-bold">check_circle</span>
                  <span>All Monthly Premium Benefits</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[16px] text-emerald-600 font-bold">check_circle</span>
                  <span>Priority Booking with Mentors</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[16px] text-emerald-600 font-bold">check_circle</span>
                  <span>Exclusive Annual Project Badges</span>
                </li>
              </ul>
            </div>
            
            <Link href="/checkout?plan=yearly" className="mt-8 w-full bg-slate-900 hover:bg-black text-white border border-slate-950 rounded-xl py-2.5 text-center text-xs font-bold transition shadow-xs block select-none">
              Choose Yearly
            </Link>
          </div>

        </div>

        {/* Comparison Table */}
        <div className="mt-12 border-t border-slate-200 pt-10">
          <h4 className="text-base font-extrabold text-slate-800 mb-6">Compare Plans Features</h4>
          <div className="w-full overflow-x-auto border border-slate-200 rounded-xl">
            <table className="w-full text-left border-collapse min-w-[600px]">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                  <th className="py-3 px-4">Feature</th>
                  <th className="py-3 px-4">Free Track</th>
                  <th className="py-3 px-4">Premium Membership</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-xs">
                {comparisonFeatures.map((feat, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/50">
                    <td className="py-3 px-4 font-semibold text-slate-700">{feat.name}</td>
                    <td className="py-3 px-4 text-slate-600">
                      {typeof feat.free === "boolean" ? (
                        feat.free ? (
                          <span className="material-symbols-outlined text-[16px] text-emerald-600 font-bold">check</span>
                        ) : (
                          <span className="material-symbols-outlined text-[16px] text-red-500 font-bold">close</span>
                        )
                      ) : (
                        <span>{feat.free}</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-slate-850 font-semibold">
                      {typeof feat.premium === "boolean" ? (
                        feat.premium ? (
                          <span className="material-symbols-outlined text-[16px] text-emerald-600 font-bold">check</span>
                        ) : (
                          <span className="material-symbols-outlined text-[16px] text-red-500 font-bold">close</span>
                        )
                      ) : (
                        <span>{feat.premium}</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </DashboardLayout>
  );
}
