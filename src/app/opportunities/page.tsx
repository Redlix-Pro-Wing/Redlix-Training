import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import prisma from "@/lib/db";
import DashboardLayout from "@/components/DashboardLayout";

interface Opportunity {
  id: string;
  title: string;
  company: string;
  location: string;
  type: string;
  compensation: string;
  category: string;
  description: string;
  logoBg: string;
  logoLetter: string;
  tags: string[];
  link: string;
  postedDate: string;
}

export default async function OpportunitiesPage() {
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
    },
  });

  if (!user) {
    redirect("/login");
  }

  const opportunities: Opportunity[] = [
    {
      id: "opp-1",
      title: "Frontend Engineer Intern",
      company: "Vercel",
      location: "Remote (Global)",
      type: "Internship",
      compensation: "$4,500 / month",
      category: "Frontend",
      description: "Join the Next.js team to build premium user experiences and developer tools. Experience with React 19 and Tailwind v4 preferred.",
      logoBg: "bg-black text-white",
      logoLetter: "V",
      tags: ["React", "Next.js", "Tailwind"],
      link: "https://vercel.com/careers",
      postedDate: "2 days ago",
    },
    {
      id: "opp-2",
      title: "Database Systems Architect",
      company: "Neon Database",
      location: "San Francisco, CA (Hybrid)",
      type: "Full-Time",
      compensation: "$140k - $170k",
      category: "Database",
      description: "Design and implement scalable control plane systems for serverless Postgres. Strong knowledge of PostgreSQL internals required.",
      logoBg: "bg-emerald-600 text-white",
      logoLetter: "N",
      tags: ["PostgreSQL", "Go", "Rust"],
      link: "https://neon.tech/careers",
      postedDate: "3 days ago",
    },
    {
      id: "opp-3",
      title: "Developer Advocate",
      company: "Prisma",
      location: "Berlin, Germany / Remote",
      type: "Full-Time",
      compensation: "€90k - €110k",
      category: "Developer Relations",
      description: "Create engaging content, build sample applications, and represent developer feedback back to the Prisma core ORM product teams.",
      logoBg: "bg-indigo-600 text-white",
      logoLetter: "P",
      tags: ["TypeScript", "ORM", "Technical Writing"],
      link: "https://prisma.io/careers",
      postedDate: "1 week ago",
    },
    {
      id: "opp-4",
      title: "AI Research Assistant",
      company: "DeepMind",
      location: "London, UK (Hybrid)",
      type: "Contract",
      compensation: "£75k / year",
      category: "AI & Research",
      description: "Support reinforcement learning research pipelines and evaluations for large multimodal models. Knowledge of PyTorch is essential.",
      logoBg: "bg-blue-600 text-white",
      logoLetter: "D",
      tags: ["PyTorch", "Python", "Deep Learning"],
      link: "https://deepmind.google/careers",
      postedDate: "5 days ago",
    },
    {
      id: "opp-5",
      title: "Full-Stack Software Engineer",
      company: "Linear",
      location: "Remote (EU/US)",
      type: "Full-Time",
      compensation: "$130k - $160k + Equity",
      category: "Full-Stack",
      description: "Help craft the future of issue tracking and project management. Experience with high-performance real-time syncing client architectures.",
      logoBg: "bg-slate-950 text-white",
      logoLetter: "L",
      tags: ["TypeScript", "React", "Node.js"],
      link: "https://linear.app/careers",
      postedDate: "Just now",
    },
  ];

  return (
    <DashboardLayout user={user}>
      <div className="flex h-fit w-full flex-col rounded-2xl border border-slate-300 bg-white p-6 md:p-10 shadow-sm animate-fadeIn">
        
        {/* Header */}
        <div className="pb-6 border-b border-slate-300 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <span className="text-xs font-bold text-blue-600 bg-blue-50/60 px-2.5 py-1 rounded-md">
              Careers & Projects
            </span>
            <h3 className="text-2xl font-bold text-slate-800 mt-2">
              Opportunities Board
            </h3>
            <p className="text-sm text-slate-600 mt-1">
              Explore curated jobs, internships, hackathons, and remote contracts selected for Redlix Trainees.
            </p>
          </div>
          <button className="self-start md:self-auto bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-4 py-2.5 rounded-lg shadow-xs hover:shadow-sm transition flex items-center gap-1.5 cursor-pointer">
            <span className="material-symbols-outlined text-[16px]">add_circle</span>
            Post an Opportunity
          </button>
        </div>

        {/* Filter bar summary */}
        <div className="flex flex-wrap items-center justify-between gap-4 mt-6 p-4 rounded-xl bg-slate-50 border border-slate-200">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-slate-500 text-[20px]">filter_list</span>
            <span className="text-xs font-bold text-slate-700">Quick Filters:</span>
            <div className="flex flex-wrap gap-1.5 ml-2">
              <span className="text-xs font-medium px-2.5 py-1 bg-white border border-slate-300 rounded-md hover:bg-slate-50 cursor-pointer transition select-none">Remote</span>
              <span className="text-xs font-medium px-2.5 py-1 bg-white border border-slate-300 rounded-md hover:bg-slate-50 cursor-pointer transition select-none">Full-Time</span>
              <span className="text-xs font-medium px-2.5 py-1 bg-white border border-slate-300 rounded-md hover:bg-slate-50 cursor-pointer transition select-none">Internship</span>
            </div>
          </div>
          <div className="text-xs text-slate-500 font-medium">
            Showing <strong className="text-slate-800">{opportunities.length}</strong> available roles
          </div>
        </div>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 gap-4 mt-6">
          {opportunities.map((opp) => (
            <div
              key={opp.id}
              className="flex flex-col md:flex-row md:items-center justify-between p-5 rounded-2xl border border-slate-200 bg-white hover:border-slate-300 hover:shadow-xs transition duration-150 gap-4"
            >
              {/* Left Column: Logo & Text info */}
              <div className="flex items-start gap-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-extrabold text-lg shrink-0 ${opp.logoBg}`}>
                  {opp.logoLetter}
                </div>
                <div className="flex flex-col">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4 className="text-base font-extrabold text-slate-850 leading-tight">
                      {opp.title}
                    </h4>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full border border-blue-100 bg-blue-50/60 text-blue-700">
                      {opp.category}
                    </span>
                  </div>
                  <p className="text-xs text-slate-550 font-bold mt-1">
                    {opp.company} • <span className="font-semibold text-slate-500">{opp.location}</span>
                  </p>
                  <p className="text-xs text-slate-600 mt-2 max-w-2xl leading-relaxed">
                    {opp.description}
                  </p>
                  
                  {/* Tags */}
                  <div className="flex flex-wrap gap-1.5 mt-3">
                    {opp.tags.map((tag, i) => (
                      <span key={i} className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 border border-slate-200 text-slate-600">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right Column: Meta details and action */}
              <div className="flex flex-row md:flex-col items-center md:items-end justify-between md:justify-center border-t border-dashed border-slate-200 md:border-0 pt-4 md:pt-0 shrink-0 gap-3">
                <div className="flex flex-col md:items-end">
                  <span className="text-xs font-bold text-slate-700">{opp.compensation}</span>
                  <span className="text-[10px] font-semibold text-slate-400 mt-0.5 flex items-center gap-1">
                    <span className="material-symbols-outlined text-[12px]">schedule</span>
                    {opp.postedDate}
                  </span>
                </div>
                
                <a
                  href={opp.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-black hover:bg-slate-900 text-white rounded-lg px-4 py-2 text-xs font-bold transition duration-150 flex items-center gap-1 cursor-pointer"
                >
                  Apply Now
                  <span className="material-symbols-outlined text-[14px]">arrow_outward</span>
                </a>
              </div>
            </div>
          ))}
        </div>

      </div>
    </DashboardLayout>
  );
}
