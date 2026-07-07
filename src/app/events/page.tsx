import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import prisma from "@/lib/db";
import DashboardLayout from "@/components/DashboardLayout";

interface TechEvent {
  id: string;
  title: string;
  description: string;
  day: string;
  month: string;
  time: string;
  duration: string;
  speakerName: string;
  speakerTitle: string;
  speakerCompany: string;
  speakerImage: string;
  category: string;
  badgeBg: string;
  badgeText: string;
  joinLink: string;
  registered: boolean;
}

export default async function EventsPage() {
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

  const events: TechEvent[] = [
    {
      id: "evt-1",
      title: "Mastering Database Migrations & Prisma Workflows",
      description: "Learn best practices for running zero-downtime schema migrations on PostgreSQL databases with Prisma ORM. Ideal for intermediate full-stack trainees.",
      day: "12",
      month: "JULY",
      time: "6:00 PM IST",
      duration: "60 mins",
      speakerName: "Nikolas Burk",
      speakerTitle: "Developer Advocate",
      speakerCompany: "Prisma",
      speakerImage: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=120&h=120",
      category: "Webinar",
      badgeBg: "bg-indigo-50 text-indigo-700 border-indigo-150",
      badgeText: "Prisma Tech",
      joinLink: "https://zoom.us",
      registered: true,
    },
    {
      id: "evt-2",
      title: "Building Real-time Applications with Next.js Server Actions",
      description: "A deep dive into Next.js 15+ streaming, Server Actions, and real-time state synchronization with serverless Postgres backends.",
      day: "18",
      month: "JULY",
      time: "4:00 PM IST",
      duration: "90 mins",
      speakerName: "Lee Robinson",
      speakerTitle: "VP of Product",
      speakerCompany: "Vercel",
      speakerImage: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=120&h=120",
      category: "Workshop",
      badgeBg: "bg-amber-50 text-amber-800 border-amber-200",
      badgeText: "Next.js Dev",
      joinLink: "https://zoom.us",
      registered: false,
    },
    {
      id: "evt-3",
      title: "Redlix Academy Summer Hackathon 2026",
      description: "Our flagship 48-hour hackathon! Build innovative apps using serverless stacks. Mentors will be present live in study pods. Over $5k in prizes.",
      day: "25",
      month: "JULY",
      time: "9:00 AM IST",
      duration: "3 days",
      speakerName: "Redlix Pro Wing Team",
      speakerTitle: "Community Admins",
      speakerCompany: "Redlix Academy",
      speakerImage: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=120&h=120",
      category: "Hackathon",
      badgeBg: "bg-purple-50 text-purple-700 border-purple-150",
      badgeText: "Hackathon",
      joinLink: "https://discord.gg",
      registered: true,
    },
    {
      id: "evt-4",
      title: "Scaling Serverless Database Backends with Neon Postgres",
      description: "Learn how autoscaling databases, branch-based workflows, and edge pooling can increase performance while keeping hosting costs near zero.",
      day: "02",
      month: "AUG",
      time: "7:30 PM IST",
      duration: "60 mins",
      speakerName: "Mahmoud Abdelwahab",
      speakerTitle: "Solutions Engineer",
      speakerCompany: "Neon Database",
      speakerImage: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=120&h=120",
      category: "Webinar",
      badgeBg: "bg-emerald-50 text-emerald-800 border-emerald-200",
      badgeText: "Database Stack",
      joinLink: "https://zoom.us",
      registered: false,
    },
  ];

  return (
    <DashboardLayout user={user}>
      <div className="flex h-fit w-full flex-col rounded-2xl border border-slate-300 bg-white p-6 md:p-10 shadow-sm animate-fadeIn">
        
        {/* Header */}
        <div className="pb-6 border-b border-slate-300 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <span className="text-xs font-bold text-blue-600 bg-blue-50/60 px-2.5 py-1 rounded-md">
              Events & Masterclasses
            </span>
            <h3 className="text-2xl font-bold text-slate-800 mt-2">
              Academy Schedule
            </h3>
            <p className="text-sm text-slate-600 mt-1">
              Join live workshops, industry tech talks, hackathons, and interactive guest lectures.
            </p>
          </div>
          <div className="flex gap-2">
            <button className="bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 font-bold text-xs px-4 py-2.5 rounded-lg shadow-2xs transition flex items-center gap-1.5 cursor-pointer">
              <span className="material-symbols-outlined text-[16px]">history</span>
              Past Events
            </button>
            <button className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-4 py-2.5 rounded-lg shadow-xs transition flex items-center gap-1.5 cursor-pointer">
              <span className="material-symbols-outlined text-[16px]">calendar_add_on</span>
              Sync Calendar
            </button>
          </div>
        </div>

        {/* Calendar / Events Schedule List */}
        <div className="flex flex-col gap-6 mt-8">
          {events.map((evt) => (
            <div 
              key={evt.id} 
              className="flex flex-col lg:flex-row items-stretch rounded-2xl border border-slate-200 overflow-hidden hover:border-slate-300 transition duration-150 bg-white"
            >
              {/* Date Box Column (Left) */}
              <div className="bg-slate-50 border-r border-slate-200 w-full lg:w-36 flex flex-row lg:flex-col justify-center items-center p-4 lg:py-6 text-center gap-3 lg:gap-1 shrink-0">
                <span className="text-xs font-extrabold text-slate-400 tracking-widest uppercase">{evt.month}</span>
                <span className="text-3xl lg:text-4xl font-black text-slate-800 font-sans leading-none">{evt.day}</span>
                <span className="text-[10px] font-bold text-slate-500 bg-slate-200/50 px-2 py-0.5 rounded-md mt-0 lg:mt-2">
                  {evt.duration}
                </span>
              </div>

              {/* Event Details Content (Middle) */}
              <div className="p-6 flex flex-col justify-between flex-1 gap-4">
                <div>
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${evt.badgeBg}`}>
                      {evt.category}
                    </span>
                    <span className="text-[10px] font-semibold text-slate-400 font-mono">{evt.badgeText}</span>
                  </div>
                  <h4 className="text-lg font-extrabold text-slate-850 mt-2 leading-snug">
                    {evt.title}
                  </h4>
                  <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                    {evt.description}
                  </p>
                </div>

                {/* Speaker details & Meta time */}
                <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-slate-100 mt-1">
                  {/* Speaker profile */}
                  <div className="flex items-center gap-2.5">
                    <img 
                      src={evt.speakerImage} 
                      alt={evt.speakerName} 
                      className="w-8 h-8 rounded-full border border-slate-200 object-cover" 
                    />
                    <div className="flex flex-col">
                      <span className="text-xs font-bold text-slate-800">{evt.speakerName}</span>
                      <span className="text-[10px] text-slate-500 font-medium">
                        {evt.speakerTitle} • <strong className="text-slate-650 font-semibold">{evt.speakerCompany}</strong>
                      </span>
                    </div>
                  </div>

                  {/* Time and timezone */}
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-lg">
                    <span className="material-symbols-outlined text-[16px] text-slate-500">schedule</span>
                    <span>Starts at {evt.time}</span>
                  </div>
                </div>
              </div>

              {/* Register / CTA Area (Right) */}
              <div className="p-6 lg:border-l border-slate-200 bg-slate-50/50 flex flex-col justify-center items-stretch w-full lg:w-48 gap-2.5 shrink-0">
                {evt.registered ? (
                  <>
                    <div className="bg-emerald-50 border border-emerald-250 text-emerald-700 text-center py-2 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 select-none">
                      <span className="material-symbols-outlined text-[16px]">check_circle</span>
                      Registered
                    </div>
                    <a
                      href={evt.joinLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-black hover:bg-slate-900 text-white rounded-lg py-2 px-3 text-center text-xs font-bold transition flex items-center justify-center gap-1 cursor-pointer"
                    >
                      Join Session
                      <span className="material-symbols-outlined text-[14px]">arrow_outward</span>
                    </a>
                  </>
                ) : (
                  <>
                    <button className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg py-2.5 px-3 text-center text-xs font-bold transition shadow-2xs hover:shadow-xs flex items-center justify-center gap-1.5 cursor-pointer">
                      <span className="material-symbols-outlined text-[16px]">how_to_reg</span>
                      Register Now
                    </button>
                    <button className="bg-white border border-slate-350 hover:bg-slate-50 text-slate-700 rounded-lg py-2 px-3 text-center text-xs font-bold transition flex items-center justify-center gap-1 cursor-pointer">
                      <span className="material-symbols-outlined text-[16px]">notifications</span>
                      Remind Me
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>

      </div>
    </DashboardLayout>
  );
}
