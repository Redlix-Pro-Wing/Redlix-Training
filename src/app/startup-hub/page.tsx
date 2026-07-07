import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import prisma from "@/lib/db";
import DashboardLayout from "@/components/DashboardLayout";

interface Startup {
  id: string;
  name: string;
  oneLiner: string;
  description: string;
  founders: string[];
  logoBg: string;
  logoEmoji: string;
  category: string;
  stage: string;
  stageBadgeBg: string;
  stageBadgeText: string;
  fundingGoal: string;
  website: string;
}

export default async function StartupHubPage() {
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

  const startups: Startup[] = [
    {
      id: "stu-1",
      name: "DevPulse",
      oneLiner: "Real-time telemetry and health monitoring for local developer setups.",
      description: "DevPulse monitors CPU, memory, Docker logs, and database runtimes locally and pipes them into a unified, lightweight dashboard to accelerate local debugging.",
      founders: ["Rohan Kalapala", "Aarav Sharma"],
      logoBg: "bg-purple-100 border-purple-200 text-purple-700",
      logoEmoji: "⚡",
      category: "Developer Tools",
      stage: "Pre-seed",
      stageBadgeBg: "bg-purple-55 bg-purple-50/60 border border-purple-100 text-purple-700",
      stageBadgeText: "text-purple-750",
      fundingGoal: "$150k target",
      website: "https://github.com",
    },
    {
      id: "stu-2",
      name: "NeonSync",
      oneLiner: "Offline-first sync adapter for serverless Neon Postgres databases.",
      description: "NeonSync provides client-side SQLite replication that automatically queues local DB mutations and syncs them seamlessly with serverless Postgres clusters when online.",
      founders: ["Kofi Anan", "Sarah Jenkins"],
      logoBg: "bg-emerald-100 border-emerald-200 text-emerald-700",
      logoEmoji: "🔋",
      category: "Databases & Sync",
      stage: "Prototype",
      stageBadgeBg: "bg-emerald-50/60 border border-emerald-100 text-emerald-700",
      stageBadgeText: "text-emerald-750",
      fundingGoal: "Seeking Co-founder",
      website: "https://github.com",
    },
    {
      id: "stu-3",
      name: "LocoForms",
      oneLiner: "AI-assisted interactive forms that render adaptively per user.",
      description: "LocoForms reads standard JSON schemas and generates dynamic forms. It uses lightweight LLMs to adapt questions on-the-fly based on prior user responses.",
      founders: ["Jane Doe"],
      logoBg: "bg-amber-100 border-amber-200 text-amber-700",
      logoEmoji: "📝",
      category: "SaaS / AI",
      stage: "Active Beta",
      stageBadgeBg: "bg-amber-50/60 border border-amber-100 text-amber-700",
      stageBadgeText: "text-amber-750",
      fundingGoal: "$250k raised",
      website: "https://github.com",
    },
  ];

  const incubatorResources = [
    {
      title: "YC Application Guide (Summer 2026)",
      type: "PDF Guide",
      icon: "article",
    },
    {
      title: "Seed-stage Pitch Deck Template",
      type: "Figma Link",
      icon: "slideshow",
    },
    {
      title: "Safe Financing & Legal Incorporation",
      type: "Markdown Docs",
      icon: "gavel",
    },
  ];

  return (
    <DashboardLayout user={user}>
      <div className="flex h-fit w-full flex-col rounded-2xl border border-slate-300 bg-white p-6 md:p-10 shadow-sm animate-fadeIn">
        
        {/* Header */}
        <div className="pb-6 border-b border-slate-300 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <span className="text-xs font-bold text-blue-600 bg-blue-50/60 px-2.5 py-1 rounded-md">
              Incubator & Projects
            </span>
            <h3 className="text-2xl font-bold text-slate-800 mt-2">
              Startup Hub
            </h3>
            <p className="text-sm text-slate-600 mt-1">
              Showcase your projects, find co-founders, access startup templates, and pitches to investors.
            </p>
          </div>
          <button className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-4 py-2.5 rounded-lg shadow-xs transition flex items-center gap-1.5 cursor-pointer">
            <span className="material-symbols-outlined text-[16px]">rocket_launch</span>
            Register Startup
          </button>
        </div>

        {!user.isPremium ? (
          <div className="relative mt-8 p-8 md:p-12 rounded-3xl border border-slate-300 bg-linear-to-b from-slate-50/50 to-slate-100/50 backdrop-blur-md flex flex-col items-center text-center max-w-2xl mx-auto shadow-xs overflow-hidden animate-fadeIn">
            {/* Background elements */}
            <div className="absolute -right-10 -top-10 w-40 h-40 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />
            <div className="absolute -left-10 -bottom-10 w-40 h-40 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />

            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-400 to-amber-500 text-slate-900 border border-amber-300 flex items-center justify-center shadow-md animate-pulse">
              <span className="material-symbols-outlined text-[32px]">workspace_premium</span>
            </div>
            
            <h4 className="text-xl font-extrabold text-slate-850 mt-6 leading-tight">
              Unlock the Trainee Startup Hub
            </h4>
            <p className="text-sm text-slate-600 mt-2 max-w-md leading-relaxed">
              Showcase your early-stage products, find co-founders, obtain incorporation and legal guides, and pitch directly to our angel network.
            </p>
            
            <div className="border-t border-slate-200/80 w-full my-6" />

            <div className="flex flex-col sm:flex-row gap-3 w-full justify-center">
              <div className="px-4 py-3 bg-white border border-slate-200 rounded-xl flex items-center gap-2">
                <span className="material-symbols-outlined text-purple-600">rocket_launch</span>
                <span className="text-xs font-bold text-slate-700">Project Showcase</span>
              </div>
              <div className="px-4 py-3 bg-white border border-slate-200 rounded-xl flex items-center gap-2">
                <span className="material-symbols-outlined text-emerald-600">gavel</span>
                <span className="text-xs font-bold text-slate-700">Incubator Resources</span>
              </div>
            </div>

            <button className="mt-8 bg-black hover:bg-slate-900 text-white rounded-xl px-8 py-3.5 text-sm font-bold shadow-md hover:shadow-lg transition-all duration-150 flex items-center gap-2 cursor-pointer">
              <span className="material-symbols-outlined text-[18px] text-amber-300">workspace_premium</span>
              Contact Admin to Upgrade
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
            
            {/* Left Columns (Startups Showcase - Col Span 2) */}
            <div className="lg:col-span-2 flex flex-col gap-6">
              <div className="flex items-center justify-between">
                <h4 className="text-base font-extrabold text-slate-800">Trainee Startups</h4>
                <span className="text-xs font-semibold text-slate-400">Featured Products</span>
              </div>

              <div className="flex flex-col gap-4">
                {startups.map((stu) => (
                  <div 
                    key={stu.id} 
                    className="p-5 rounded-2xl border border-slate-200 hover:border-slate-350 hover:shadow-xs transition duration-150 bg-white flex flex-col gap-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center border text-xl shrink-0 ${stu.logoBg}`}>
                          {stu.logoEmoji}
                        </div>
                        <div>
                          <h5 className="text-base font-extrabold text-slate-800 leading-tight">
                            {stu.name}
                          </h5>
                          <p className="text-xs text-slate-500 font-semibold mt-0.5">
                            {stu.category}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${stu.stageBadgeBg}`}>
                          {stu.stage}
                        </span>
                        <span className="text-[10px] font-bold text-slate-500 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-md">
                          {stu.fundingGoal}
                        </span>
                      </div>
                    </div>

                    <div>
                      <h6 className="text-xs font-extrabold text-slate-700 leading-snug">
                        "{stu.oneLiner}"
                      </h6>
                      <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                        {stu.description}
                      </p>
                    </div>

                    <div className="flex items-center justify-between border-t border-slate-100 pt-3 mt-1">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Founders:</span>
                        <span className="text-xs font-bold text-slate-700">{stu.founders.join(", ")}</span>
                      </div>

                      <a 
                        href={stu.website} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1.5 transition cursor-pointer"
                      >
                        View GitHub / Website
                        <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Column (Incubator Resources & Tools - Col Span 1) */}
            <div className="flex flex-col gap-6">
              <h4 className="text-base font-extrabold text-slate-800">Academy Resources</h4>
              
              {/* Resources List */}
              <div className="flex flex-col gap-3">
                {incubatorResources.map((res, i) => (
                  <div 
                    key={i} 
                    className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 hover:border-slate-350 transition duration-150 flex items-center gap-3 cursor-pointer"
                  >
                    <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center shrink-0">
                      <span className="material-symbols-outlined text-[18px]">{res.icon}</span>
                    </div>
                    <div>
                      <h5 className="text-xs font-bold text-slate-850 leading-tight">
                        {res.title}
                      </h5>
                      <p className="text-[10px] text-slate-450 font-bold mt-1 uppercase tracking-wide">
                        {res.type}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Quick Box: Apply for incubator */}
              <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-900 to-blue-950 text-white border border-slate-950 shadow-md">
                <span className="text-[9px] font-bold tracking-widest bg-blue-500/30 text-blue-200 px-2 py-0.5 rounded-full uppercase border border-blue-500/20">
                  Cohort Autumn 2026
                </span>
                <h5 className="text-base font-extrabold mt-3 leading-snug">
                  Pitch to the Redlix VC network
                </h5>
                <p className="text-[11px] text-slate-300 mt-1.5 leading-relaxed">
                  Trainees with validated prototypes gain direct access to our VC partners and seed angel networks. Submission deadline is September 1st.
                </p>
                
                <button className="w-full mt-4 bg-white hover:bg-slate-100 text-slate-900 rounded-lg py-2 text-center text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer shadow-xs">
                  Submit Pitch Deck
                  <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                </button>
              </div>

            </div>

          </div>
        )}

      </div>
    </DashboardLayout>
  );
}
