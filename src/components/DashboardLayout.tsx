"use client";

import React, { useState, useEffect } from "react";
import { Sidebar, SidebarBody, SidebarLink } from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";

// Logo Components
export const Logo = () => (
  <a href="/dashboard" className="relative z-20 flex items-center py-1">
    <img
      src="https://ik.imagekit.io/dypkhqxip/logotraining"
      className="h-8 w-auto object-contain"
      alt="Full Logo"
    />
  </a>
);

export const LogoIcon = () => (
  <a href="/dashboard" className="relative z-20 flex items-center py-1">
    <img
      src="https://ik.imagekit.io/dypkhqxip/dashside"
      className="h-8 w-auto object-contain"
      alt="Logo Icon"
    />
  </a>
);

interface DashboardLayoutProps {
  children: React.ReactNode;
  user: {
    fullName: string;
    email: string;
    profileImage?: string | null;
  };
}

export default function DashboardLayout({ children, user }: DashboardLayoutProps) {
  const [open, setOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const isAdmin = user.email.trim().toLowerCase() === "webstrixx@gmail.com";

  // Sidebar notifications calculation
  useEffect(() => {
    const isNetworkingPage = typeof window !== "undefined" && window.location.pathname === "/networking";

    const fetchUnreadCount = async () => {
      try {
        const res = await fetch(`/api/messages?t=${Date.now()}`, {
          cache: "no-store",
          headers: {
            "Pragma": "no-cache",
            "Cache-Control": "no-cache",
          },
        });
        if (res.ok) {
          const data = await res.json();
          const messages = data.messages || [];

          if (isNetworkingPage) {
            // Update last seen to the latest message time
            if (messages.length > 0) {
              const latestTime = messages[messages.length - 1].createdAt;
              localStorage.setItem("lastSeenMessageTime", latestTime);
            } else {
              localStorage.setItem("lastSeenMessageTime", new Date().toISOString());
            }
            setUnreadCount(0);
          } else {
            const lastSeen = localStorage.getItem("lastSeenMessageTime") || new Date(0).toISOString();
            const unread = messages.filter((msg: any) => {
              // Only count messages sent by OTHER users
              return (
                msg.email.trim().toLowerCase() !== user.email.trim().toLowerCase() &&
                msg.createdAt > lastSeen
              );
            });
            setUnreadCount(unread.length);
          }
        }
      } catch (err) {
        console.error("Failed to fetch notification count:", err);
      }
    };

    fetchUnreadCount();
    // Poll every 8 seconds for notifications
    const interval = setInterval(fetchUnreadCount, 8000);

    return () => clearInterval(interval);
  }, [user.email]);

  const links = isAdmin
    ? [
        {
          label: "Learners",
          href: "/admin",
          icon: (
            <span className="material-symbols-outlined shrink-0 text-[20px] text-amber-200 group-hover/sidebar:text-amber-100 transition-colors duration-150 select-none">
              shield_person
            </span>
          ),
        },
        {
          label: "Networking",
          href: "/networking",
          icon: (
            <div className="relative flex items-center shrink-0">
              <span className="material-symbols-outlined text-[20px] text-amber-200 group-hover/sidebar:text-amber-100 transition-colors duration-150 select-none">
                forum
              </span>
              {unreadCount > 0 && (
                <span className="absolute -top-1.5 -right-2 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-red-500 text-[8px] font-bold text-white shadow-xs animate-pulse">
                  {unreadCount}
                </span>
              )}
            </div>
          ),
        },
        {
          label: "Study Pods",
          href: "/studypod",
          icon: (
            <span className="material-symbols-outlined shrink-0 text-[20px] text-amber-200 group-hover/sidebar:text-amber-100 transition-colors duration-150 select-none">
              groups
            </span>
          ),
        },
      ]
    : [
        {
          label: "Dashboard",
          href: "/dashboard",
          icon: (
            <span className="material-symbols-outlined shrink-0 text-[20px] text-blue-100 group-hover/sidebar:text-white transition-colors duration-150 select-none">
              team_dashboard
            </span>
          ),
        },
        {
          label: "Networking",
          href: "/networking",
          icon: (
            <div className="relative flex items-center shrink-0">
              <span className="material-symbols-outlined text-[20px] text-blue-100 group-hover/sidebar:text-white transition-colors duration-150 select-none">
                forum
              </span>
              {unreadCount > 0 && (
                <span className="absolute -top-1.5 -right-2 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-red-500 text-[8px] font-bold text-white shadow-xs">
                  {unreadCount}
                </span>
              )}
            </div>
          ),
        },
        {
          label: "Study Pods",
          href: "/studypod",
          icon: (
            <span className="material-symbols-outlined shrink-0 text-[20px] text-blue-100 group-hover/sidebar:text-white transition-colors duration-150 select-none">
              groups
            </span>
          ),
        },
        {
          label: "Video Lectures",
          href: "/lectures",
          icon: (
            <span className="material-symbols-outlined shrink-0 text-[20px] text-blue-100 group-hover/sidebar:text-white transition-colors duration-150 select-none">
              books_movies_and_music
            </span>
          ),
        },
        {
          label: "Resources",
          href: "/resources",
          icon: (
            <span className="material-symbols-outlined shrink-0 text-[20px] text-blue-100 group-hover/sidebar:text-white transition-colors duration-150 select-none">
              library_books
            </span>
          ),
        },
        {
          label: "Courses",
          href: "/courses",
          icon: (
            <span className="material-symbols-outlined shrink-0 text-[20px] text-blue-100 group-hover/sidebar:text-white transition-colors duration-150 select-none">
              school
            </span>
          ),
        },
        {
          label: "Certificates",
          href: "/certificates",
          icon: (
            <span className="material-symbols-outlined shrink-0 text-[20px] text-blue-100 group-hover/sidebar:text-white transition-colors duration-150 select-none">
              workspace_premium
            </span>
          ),
        },
      ];

  // Profile link appended at the very end to ensure it is always last
  links.push({
    label: "Profile",
    href: "/profile",
    icon: user.profileImage ? (
      <img
        src={user.profileImage}
        alt="Profile"
        className="h-5 w-5 rounded-full object-cover border border-blue-200/50 shrink-0"
      />
    ) : (
      <span className="material-symbols-outlined shrink-0 text-[20px] text-blue-100 group-hover/sidebar:text-white transition-colors duration-150 select-none">
        recent_patient
      </span>
    ),
  });

  return (
    <div className="flex h-screen w-screen bg-slate-50 overflow-hidden md:flex-row flex-col">
      <Sidebar open={open} setOpen={setOpen}>
        <SidebarBody className="justify-between gap-10">
          <div className="flex flex-1 flex-col overflow-x-hidden overflow-y-auto">
            <div className={cn("flex w-full items-center transition-all duration-150", open ? "justify-start px-2" : "justify-center")}>
              {open ? <Logo /> : <LogoIcon />}
            </div>
            <div className="mt-8 flex flex-col gap-2">
              {links.map((link, idx) => (
                <SidebarLink key={idx} link={link} />
              ))}
            </div>
          </div>
          <div>
            <SidebarLink
              link={{
                label: user.fullName,
                href: "/profile",
                icon: user.profileImage ? (
                  <img
                    src={user.profileImage}
                    alt={user.fullName}
                    className="h-6 w-6 rounded-full object-cover border border-blue-200/50 shrink-0"
                  />
                ) : (
                  <span className="material-symbols-outlined shrink-0 text-[20px] text-blue-100 group-hover/sidebar:text-white transition-colors duration-150 select-none">
                    recent_patient
                  </span>
                ),
              }}
            />
          </div>
        </SidebarBody>
      </Sidebar>

      {/* Main Dashboard Panel Content */}
      <div className="flex flex-1 overflow-y-auto bg-slate-50 p-4 md:p-8">
        {children}
      </div>
    </div>
  );
}
