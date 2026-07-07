import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import prisma from "@/lib/db";
import DashboardLayout from "@/components/DashboardLayout";

interface Mentor {
  id: string;
  name: string;
  avatar: string;
  role: string;
  company: string;
  rating: number;
  reviewsCount: number;
  specialties: string[];
  bio: string;
  slots: string[];
  gradientBg: string;
}

export default async function MentorshipPage() {
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

  const mentors: Mentor[] = [
    {
      id: "mnt-1",
      name: "Sophia Martinez",
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=120&h=120",
      role: "Staff Product Engineer",
      company: "Stripe",
      rating: 4.9,
      reviewsCount: 38,
      specialties: ["API Design", "React", "System Architecture"],
      bio: "Former tech lead at Figma, currently architecting billing systems at Stripe. I love helping junior devs navigate careers and system design.",
      slots: ["Thur 3:00 PM", "Fri 10:00 AM"],
      gradientBg: "from-purple-500 to-indigo-650",
    },
    {
      id: "mnt-2",
      name: "Marcus Chen",
      avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=120&h=120",
      role: "Senior Backend Developer",
      company: "Netflix",
      rating: 4.8,
      reviewsCount: 24,
      specialties: ["PostgreSQL", "Node.js", "Redis"],
      bio: "Database tuning specialist. I can teach you everything you need to know about indexing, connection pooling, and Postgres scaling issues.",
      slots: ["Mon 4:30 PM", "Wed 2:00 PM"],
      gradientBg: "from-blue-500 to-cyan-600",
    },
    {
      id: "mnt-3",
      name: "Elena Rostova",
      avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=120&h=120",
      role: "Principal UI Engineer",
      company: "Vercel",
      rating: 5.0,
      reviewsCount: 52,
      specialties: ["Tailwind CSS", "Next.js", "A11y"],
      bio: "Core contributor to next/font and Tailwind UI packages. Passionate about micro-interactions, layout performance, and user accessibility.",
      slots: ["Tue 1:00 PM", "Thu 11:30 AM"],
      gradientBg: "from-rose-500 to-pink-600",
    },
  ];

  return (
    <DashboardLayout user={user}>
      <div className="flex h-fit w-full flex-col rounded-2xl border border-slate-300 bg-white p-6 md:p-10 shadow-sm animate-fadeIn">
        
        {/* Header */}
        <div className="pb-6 border-b border-slate-300 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <span className="text-xs font-bold text-blue-600 bg-blue-50/60 px-2.5 py-1 rounded-md">
              1-on-1 Mentorship
            </span>
            <h3 className="text-2xl font-bold text-slate-800 mt-2">
              Find a Mentor
            </h3>
            <p className="text-sm text-slate-600 mt-1">
              Connect with top engineers and designers from leading tech teams. Schedule direct sessions for code review, design critique, or career advice.
            </p>
          </div>
          <button className="bg-slate-900 hover:bg-black text-white font-bold text-xs px-4 py-2.5 rounded-lg shadow-xs transition flex items-center gap-1.5 cursor-pointer">
            <span className="material-symbols-outlined text-[16px]">school</span>
            Apply as Mentor
          </button>
        </div>

        {/* Mentorship Stats Summary */}
        {!user.isPremium ? (
          <div className="relative mt-8 p-8 md:p-12 rounded-3xl border border-slate-300 bg-linear-to-b from-slate-50/50 to-slate-100/50 backdrop-blur-md flex flex-col items-center text-center max-w-2xl mx-auto shadow-xs overflow-hidden animate-fadeIn">
            {/* Background elements */}
            <div className="absolute -right-10 -top-10 w-40 h-40 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />
            <div className="absolute -left-10 -bottom-10 w-40 h-40 bg-pink-500/10 rounded-full blur-2xl pointer-events-none" />

            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-400 to-amber-500 text-slate-900 border border-amber-300 flex items-center justify-center shadow-md animate-pulse">
              <span className="material-symbols-outlined text-[32px]">workspace_premium</span>
            </div>
            
            <h4 className="text-xl font-extrabold text-slate-850 mt-6 leading-tight">
              Unlock Premium 1-on-1 Mentorship
            </h4>
            <p className="text-sm text-slate-600 mt-2 max-w-md leading-relaxed">
              Gain access to industry specialists from Stripe, Netflix, and Vercel. Get code reviews, resume critiques, and direct career acceleration.
            </p>
            
            <div className="border-t border-slate-200/80 w-full my-6" />

            <div className="flex flex-col sm:flex-row gap-3 w-full justify-center">
              <div className="px-4 py-3 bg-white border border-slate-200 rounded-xl flex items-center gap-2">
                <span className="material-symbols-outlined text-indigo-600">reviews</span>
                <span className="text-xs font-bold text-slate-700">Expert Reviews</span>
              </div>
              <div className="px-4 py-3 bg-white border border-slate-200 rounded-xl flex items-center gap-2">
                <span className="material-symbols-outlined text-rose-500">calendar_month</span>
                <span className="text-xs font-bold text-slate-700">Flexible Booking</span>
              </div>
            </div>

            <button className="mt-8 bg-black hover:bg-slate-900 text-white rounded-xl px-8 py-3.5 text-sm font-bold shadow-md hover:shadow-lg transition-all duration-150 flex items-center gap-2 cursor-pointer">
              <span className="material-symbols-outlined text-[18px] text-amber-300">workspace_premium</span>
              Contact Admin to Upgrade
            </button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center">
                  <span className="material-symbols-outlined text-[20px]">groups</span>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Active Mentors</p>
                  <h5 className="text-base font-extrabold text-slate-800">12 Specialists</h5>
                </div>
              </div>
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
                  <span className="material-symbols-outlined text-[20px]">check_circle</span>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Completed Sessions</p>
                  <h5 className="text-base font-extrabold text-slate-800">148 Sessions</h5>
                </div>
              </div>
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center">
                  <span className="material-symbols-outlined text-[20px]">star</span>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Average Rating</p>
                  <h5 className="text-base font-extrabold text-slate-800">4.9 / 5.0</h5>
                </div>
              </div>
            </div>

            {/* Mentors Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
              {mentors.map((mnt) => (
                <div 
                  key={mnt.id} 
                  className="flex flex-col rounded-2xl border border-slate-200 overflow-hidden hover:border-slate-350 hover:shadow-xs transition duration-150 bg-white"
                >
                  {/* Gradient Banner */}
                  <div className={`h-3 bg-gradient-to-r ${mnt.gradientBg} w-full`} />

                  {/* Card Body */}
                  <div className="p-5 flex-1 flex flex-col justify-between">
                    <div>
                      {/* Avatar & Basic Details */}
                      <div className="flex items-start gap-3">
                        <img 
                          src={mnt.avatar} 
                          alt={mnt.name} 
                          className="w-12 h-12 rounded-full border border-slate-100 object-cover shrink-0" 
                        />
                        <div className="flex flex-col">
                          <h4 className="text-base font-extrabold text-slate-800 leading-tight">
                            {mnt.name}
                          </h4>
                          <p className="text-xs text-slate-500 font-semibold mt-0.5">
                            {mnt.role}
                          </p>
                          <p className="text-[11px] text-slate-700 font-bold mt-0.5">
                            {mnt.company}
                          </p>
                        </div>
                      </div>

                      {/* Rating / Review count */}
                      <div className="flex items-center gap-1 mt-2.5 text-xs text-slate-600 bg-slate-50 self-start px-2 py-0.5 border border-slate-200 rounded-md">
                        <span className="material-symbols-outlined text-[14px] text-amber-500">star</span>
                        <strong className="text-slate-800">{mnt.rating}</strong>
                        <span className="text-slate-400 font-medium">({mnt.reviewsCount} reviews)</span>
                      </div>

                      <p className="text-xs text-slate-600 mt-4 leading-relaxed italic">
                        "{mnt.bio}"
                      </p>

                      {/* Specialties */}
                      <div className="flex flex-wrap gap-1.5 mt-4">
                        {mnt.specialties.map((spec, i) => (
                          <span key={i} className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50/60 border border-blue-100 text-blue-700">
                            {spec}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="mt-5 pt-4 border-t border-slate-100">
                      {/* Slots info */}
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Available Slots</p>
                      <div className="flex flex-wrap gap-1.5">
                        {mnt.slots.map((slot, i) => (
                          <span key={i} className="text-[10px] font-bold px-2.5 py-1 rounded-md bg-emerald-50 border border-emerald-150 text-emerald-700 hover:bg-emerald-100/50 cursor-pointer transition">
                            {slot}
                          </span>
                        ))}
                      </div>

                      {/* Primary CTA */}
                      <button className="w-full mt-4 bg-black hover:bg-slate-900 text-white rounded-lg py-2 text-center text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer shadow-sm">
                        <span className="material-symbols-outlined text-[16px]">calendar_month</span>
                        Book Session
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

      </div>
    </DashboardLayout>
  );
}
