"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/DashboardLayout";
import AppLayout from "@/components/AppLayout";
import {
  IconMessage,
  IconMessages,
  IconChecklist,
  IconBulb,
  IconLock,
  IconSend,
  IconCopy,
  IconCheck,
  IconDoorExit,
  IconTrash,
  IconUserCircle,
  IconPlus,
  IconX,
  IconMoodSmile,
  IconPhoto,
  IconPaperclip,
} from "@tabler/icons-react";

interface StudyPod {
  id: string;
  name: string;
  creatorName: string;
  creatorId: string;
  approvedUserIds?: any;
  waitingUserIds?: any;
}

interface Message {
  id: string;
  content: string;
  userId: string;
  fullName: string;
  email: string;
  createdAt: string;
  profileImage?: string | null;
}

interface Todo {
  id: string;
  title: string;
  completed: boolean;
  creatorName: string;
  createdAt: string;
}

interface Idea {
  id: string;
  title: string;
  description: string;
  creatorName: string;
  createdAt: string;
}

interface StudyRoomContentProps {
  user: {
    id: string;
    fullName: string;
    email: string;
    profileImage?: string | null;
    selectedRole: string;
  } | null;
  studyPod: StudyPod;
  roomId: string;
}

export default function StudyRoomContent({ user, studyPod, roomId }: StudyRoomContentProps) {
  const router = useRouter();

  // Authentication gate states
  const [authMode, setAuthMode] = useState<"login" | "signup">("login");
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [signupName, setSignupName] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [signupRole, setSignupRole] = useState("New / Aspiring Developer");
  const [authError, setAuthError] = useState("");
  const [authLoading, setAuthLoading] = useState(false);

  // Lobby Waiting Room and drawer states
  const [lobbyStatus, setLobbyStatus] = useState<"loading" | "waiting" | "approved">("loading");
  const [roomPod, setRoomPod] = useState<StudyPod>(studyPod);
  const [showParticipantsDrawer, setShowParticipantsDrawer] = useState(false);
  const [approvingUserId, setApprovingUserId] = useState<string | null>(null);
  
  // Mounted flag to fix SSR hydration mismatch on width styles
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  // Host Action: Approve or decline pending lobby requests
  const handleApproveUser = async (targetUserId: string, action: "accept" | "decline") => {
    setApprovingUserId(targetUserId);
    try {
      const res = await fetch(`/api/studypods/${roomId}/approve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetUserId, action }),
      });
      if (res.ok) {
        const data = await res.json();
        // Update local lobby lists in state
        setRoomPod((prev) => ({
          ...prev,
          approvedUserIds: data.approvedUserIds,
          waitingUserIds: data.waitingUserIds,
        }));
      }
    } catch (err) {
      console.error("Error approving member:", err);
    } finally {
      setApprovingUserId(null);
    }
  };

  // Workspace states
  const [messages, setMessages] = useState<Message[]>([]);
  const [todos, setTodos] = useState<Todo[]>([]);
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [activeTab, setActiveTab] = useState<"tasks" | "ideas">("tasks");
  const [mobileActiveTab, setMobileActiveTab] = useState<"chat" | "tasks" | "ideas" | "info">("chat");

  // Custom adjustable resizable panel states
  const [panel1Width, setPanel1Width] = useState(260); // default width for Left Sidebar (px)
  const [panel3Width, setPanel3Width] = useState(360); // default width for Right Board (px)
  const [isDraggingP1, setIsDraggingP1] = useState(false);
  const [isDraggingP3, setIsDraggingP3] = useState(false);

  React.useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDraggingP1) {
        const container = document.getElementById("workspace-container");
        if (container) {
          const rect = container.getBoundingClientRect();
          // Constrain width between 200px and 400px
          const newWidth = Math.max(200, Math.min(400, e.clientX - rect.left));
          setPanel1Width(newWidth);
        }
      } else if (isDraggingP3) {
        const container = document.getElementById("workspace-container");
        if (container) {
          const rect = container.getBoundingClientRect();
          // Constrain width between 260px and 480px
          const newWidth = Math.max(260, Math.min(480, rect.right - e.clientX));
          setPanel3Width(newWidth);
        }
      }
    };

    const handleMouseUp = () => {
      setIsDraggingP1(false);
      setIsDraggingP3(false);
    };

    if (isDraggingP1 || isDraggingP3) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
    }

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDraggingP1, isDraggingP3]);

  // Form submission states
  const [chatText, setChatText] = useState("");
  const [todoText, setTodoText] = useState("");
  const [ideaTitle, setIdeaTitle] = useState("");
  const [ideaDesc, setIdeaDesc] = useState("");
  const [submittingChat, setSubmittingChat] = useState(false);
  const [submittingTodo, setSubmittingTodo] = useState(false);
  const [submittingIdea, setSubmittingIdea] = useState(false);

  // Utility states
  const [copiedLink, setCopiedLink] = useState(false);
  const [workspaceLoading, setWorkspaceLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Message input attachments and emoji picker states
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  const roles = [
    "Experienced Software Engineer / Lead",
    "Product / Project Manager",
    "New / Aspiring Developer",
    "Academic Trainer / Instructor",
    "Other"
  ];

  // Stable hashing function for participant color tags
  const getParticipantColor = (email: string) => {
    let hash = 0;
    for (let i = 0; i < email.length; i++) {
      hash = email.charCodeAt(i) + ((hash << 5) - hash);
    }
    const colors = [
      { bg: "bg-blue-50 text-blue-700 border-blue-100" },
      { bg: "bg-emerald-50 text-emerald-700 border-emerald-100" },
      { bg: "bg-indigo-50 text-indigo-700 border-indigo-100" },
      { bg: "bg-purple-50 text-purple-700 border-purple-100" },
      { bg: "bg-sky-50 text-sky-700 border-sky-100" },
      { bg: "bg-rose-50 text-rose-700 border-rose-100" },
      { bg: "bg-amber-50 text-amber-700 border-amber-100" },
    ];
    return colors[Math.abs(hash) % colors.length];
  };

  // Dynamic soft pastel background colors for member card list items
  const getParticipantSoftCardColor = (email: string) => {
    let hash = 0;
    for (let i = 0; i < email.length; i++) {
      hash = email.charCodeAt(i) + ((hash << 5) - hash);
    }
    const softColors = [
      "bg-blue-100/85 text-blue-950 shadow-[0_2px_8px_rgba(219,234,254,0.4)]",
      "bg-emerald-100/85 text-emerald-950 shadow-[0_2px_8px_rgba(209,250,229,0.4)]",
      "bg-indigo-100/85 text-indigo-950 shadow-[0_2px_8px_rgba(224,231,255,0.4)]",
      "bg-purple-100/85 text-purple-950 shadow-[0_2px_8px_rgba(243,232,255,0.4)]",
      "bg-sky-100/85 text-sky-950 shadow-[0_2px_8px_rgba(224,242,254,0.4)]",
      "bg-rose-100/85 text-rose-950 shadow-[0_2px_8px_rgba(255,228,230,0.4)]",
      "bg-amber-100/85 text-amber-950 shadow-[0_2px_8px_rgba(254,243,199,0.4)]",
    ];
    return softColors[Math.abs(hash) % softColors.length];
  };

  // Scroll chat to bottom
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  // Workspace Polling Loop (High frequency 1-second refresh)
  useEffect(() => {
    if (!user) return;

    const fetchWorkspaceData = async () => {
      try {
        const res = await fetch(`/api/studypods/${roomId}?t=${Date.now()}`, {
          cache: "no-store",
          headers: {
            "Pragma": "no-cache",
            "Cache-Control": "no-cache",
          },
        });
        if (res.ok) {
          const data = await res.json();
          if (data.authenticated) {
            setLobbyStatus(data.status);
            setRoomPod(data.studyPod);
            if (data.status === "approved") {
              setMessages(data.messages || []);
              setTodos(data.todos || []);
              setIdeas(data.ideas || []);
            }
          }
        }
      } catch (err) {
        console.error("Workspace polling error:", err);
      } finally {
        setWorkspaceLoading(false);
      }
    };

    fetchWorkspaceData();
    const interval = setInterval(fetchWorkspaceData, 1000);
    return () => clearInterval(interval);
  }, [user, roomId]);

  // Guest Onboarding Authentication Form Handler
  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError("");
    setAuthLoading(true);

    try {
      if (authMode === "login") {
        const res = await fetch("/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: loginEmail, password: loginPassword }),
        });
        const data = await res.json();
        if (res.ok && data.success) {
          window.location.reload();
        } else {
          setAuthError(data.error || "Authentication failed.");
        }
      } else {
        // Register account
        const signupRes = await fetch("/api/auth/signup", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            fullName: signupName,
            email: signupEmail,
            password: signupPassword,
            selectedRole: signupRole,
          }),
        });
        const signupData = await signupRes.json();
        if (!signupRes.ok) {
          setAuthError(signupData.error || "Registration failed.");
          setAuthLoading(false);
          return;
        }

        // Auto Login after successful signup
        const loginRes = await fetch("/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: signupEmail, password: signupPassword }),
        });
        const loginData = await loginRes.json();
        if (loginRes.ok && loginData.success) {
          window.location.reload();
        } else {
          setAuthError("Registration succeeded but autologin failed. Please login manually.");
        }
      }
    } catch (err) {
      setAuthError("An unexpected system error occurred.");
    } finally {
      setAuthLoading(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setSelectedImage(null);
    }
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      setSelectedFile(null);
    }
  };

  // Chat message sending (Supports attachments)
  const handleSendChat = async (e: React.FormEvent) => {
    e.preventDefault();
    const hasAttachment = selectedFile || selectedImage;
    if ((!chatText.trim() && !hasAttachment) || submittingChat) return;

    setSubmittingChat(true);
    try {
      let finalContent = chatText;
      if (selectedImage) {
        finalContent = chatText.trim()
          ? `🖼️ Shared image: ${selectedImage.name}\n\n${chatText.trim()}`
          : `🖼️ Shared image: ${selectedImage.name}`;
      } else if (selectedFile) {
        finalContent = chatText.trim()
          ? `📁 Shared file: ${selectedFile.name}\n\n${chatText.trim()}`
          : `📁 Shared file: ${selectedFile.name}`;
      }

      const res = await fetch(`/api/studypods/${roomId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "message", content: finalContent }),
      });
      if (res.ok) {
        const data = await res.json();
        setMessages((prev) => [...prev, data.message]);
        setChatText("");
        setSelectedFile(null);
        setSelectedImage(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
        if (imageInputRef.current) imageInputRef.current.value = "";
      }
    } catch (err) {
      console.error("Failed to send message:", err);
    } finally {
      setSubmittingChat(false);
    }
  };

  // Todo Task adding
  const handleAddTodo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!todoText.trim() || submittingTodo) return;

    setSubmittingTodo(true);
    try {
      const res = await fetch(`/api/studypods/${roomId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "todo", title: todoText }),
      });
      if (res.ok) {
        const data = await res.json();
        setTodos((prev) => [...prev, data.todo]);
        setTodoText("");
      }
    } catch (err) {
      console.error("Failed to add todo:", err);
    } finally {
      setSubmittingTodo(false);
    }
  };

  // Toggle completed status of todo
  const handleToggleTodo = async (todoId: string, currentCompleted: boolean) => {
    try {
      const targetCompleted = !currentCompleted;
      setTodos((prev) =>
        prev.map((t) => (t.id === todoId ? { ...t, completed: targetCompleted } : t))
      );

      const res = await fetch(`/api/studypods/${roomId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ todoId, completed: targetCompleted }),
      });
      if (!res.ok) {
        // Rollback state on api error
        setTodos((prev) =>
          prev.map((t) => (t.id === todoId ? { ...t, completed: currentCompleted } : t))
        );
      }
    } catch (err) {
      console.error("Failed to toggle todo:", err);
    }
  };

  // Delete todo task
  const handleDeleteTodo = async (todoId: string) => {
    try {
      setTodos((prev) => prev.filter((t) => t.id !== todoId));
      await fetch(`/api/studypods/${roomId}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "todo", id: todoId }),
      });
    } catch (err) {
      console.error("Failed to delete todo:", err);
    }
  };

  // Sticky idea submission
  const handleAddIdea = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ideaTitle.trim() || !ideaDesc.trim() || submittingIdea) return;

    setSubmittingIdea(true);
    try {
      const res = await fetch(`/api/studypods/${roomId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "idea", title: ideaTitle, description: ideaDesc }),
      });
      if (res.ok) {
        const data = await res.json();
        setIdeas((prev) => [data.idea, ...prev]);
        setIdeaTitle("");
        setIdeaDesc("");
      }
    } catch (err) {
      console.error("Failed to post idea:", err);
    } finally {
      setSubmittingIdea(false);
    }
  };

  // Delete idea card
  const handleDeleteIdea = async (ideaId: string) => {
    try {
      setIdeas((prev) => prev.filter((i) => i.id !== ideaId));
      await fetch(`/api/studypods/${roomId}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "idea", id: ideaId }),
      });
    } catch (err) {
      console.error("Failed to delete idea:", err);
    }
  };

  // Copy Room Link to clipboard
  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  // Extract unique active participants list from existing messages
  const getUniqueParticipants = () => {
    const participants = new Map<string, { fullName: string; email: string; profileImage?: string | null }>();
    messages.forEach((msg) => {
      if (!participants.has(msg.email)) {
        participants.set(msg.email, {
          fullName: msg.fullName,
          email: msg.email,
          profileImage: msg.profileImage || null
        });
      }
    });
    return Array.from(participants.values());
  };

  // --- RENDER 1: UNAUTHENTICATED ONBOARDING GATEWAY ---
  if (!user) {
    return (
      <AppLayout mode="login">
        <div className="min-h-[85vh] flex items-center justify-center p-4">
          <div className="bg-white/80 backdrop-blur-md rounded-3xl w-full max-w-md border border-slate-200/80 shadow-2xl p-6 md:p-8 space-y-6 animate-fadeIn">
            
            {/* Header info */}
            <div className="text-center space-y-2">
              <span className="p-3 bg-indigo-50 border border-indigo-150 text-indigo-650 rounded-2xl inline-flex">
                <IconLock className="w-6 h-6 animate-pulse" />
              </span>
              <h1 className="text-xl font-extrabold text-slate-800 tracking-tight">
                Authentication Required
              </h1>
              <p className="text-xs text-slate-500 leading-relaxed max-w-xs mx-auto">
                You are entering Study Pod: <span className="font-bold text-indigo-650">{studyPod.name}</span>. Please sign in or create an account below.
              </p>
            </div>

            {/* Selector tabs */}
            <div className="flex bg-slate-100 p-1 rounded-xl">
              <button
                onClick={() => {
                  setAuthMode("login");
                  setAuthError("");
                }}
                className={`flex-1 text-center py-2 text-xs font-bold rounded-lg transition ${
                  authMode === "login"
                    ? "bg-white text-slate-900 shadow-xs"
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                Sign In
              </button>
              <button
                onClick={() => {
                  setAuthMode("signup");
                  setAuthError("");
                }}
                className={`flex-1 text-center py-2 text-xs font-bold rounded-lg transition ${
                  authMode === "signup"
                    ? "bg-white text-slate-900 shadow-xs"
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                Create Account
              </button>
            </div>

            {authError && (
              <div className="text-xs text-red-650 bg-red-50 border border-red-100 p-3 rounded-xl font-semibold leading-relaxed">
                {authError}
              </div>
            )}

            {/* Auth Form */}
            <form onSubmit={handleAuthSubmit} className="space-y-4">
              {authMode === "signup" && (
                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wider">
                    Full Name
                  </label>
                  <input
                    type="text"
                    required
                    value={signupName}
                    onChange={(e) => setSignupName(e.target.value)}
                    placeholder="Enter your name"
                    className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-xs focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition text-slate-800"
                  />
                </div>
              )}

              <div className="space-y-1">
                <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wider">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  value={authMode === "login" ? loginEmail : signupEmail}
                  onChange={(e) =>
                    authMode === "login" ? setLoginEmail(e.target.value) : setSignupEmail(e.target.value)
                  }
                  placeholder="name@example.com"
                  className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-xs focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition text-slate-800"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wider">
                  Password
                </label>
                <input
                  type="password"
                  required
                  value={authMode === "login" ? loginPassword : signupPassword}
                  onChange={(e) =>
                    authMode === "login" ? setLoginPassword(e.target.value) : setSignupPassword(e.target.value)
                  }
                  placeholder="••••••••"
                  className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-xs focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition text-slate-800"
                />
              </div>

              {authMode === "signup" && (
                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wider">
                    Role / Position
                  </label>
                  <select
                    value={signupRole}
                    onChange={(e) => setSignupRole(e.target.value)}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-xs focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-white transition text-slate-850"
                  >
                    {roles.map((role) => (
                      <option key={role} value={role}>
                        {role}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <button
                type="submit"
                disabled={authLoading}
                className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-100 disabled:text-slate-400 text-white font-bold py-3 px-4 rounded-xl text-xs shadow-xs transition duration-150 cursor-pointer flex items-center justify-center"
              >
                {authLoading ? "Please wait..." : authMode === "login" ? "Log In & Enter Pod" : "Register & Join Pod"}
              </button>
            </form>

          </div>
        </div>
      </AppLayout>
    );
  }

  // --- RENDER 2: COLLABORATIVE WORKSPACE VIEW ---
  const participants = getUniqueParticipants();

  // Parse lobby list arrays safely
  let approvedList: string[] = [];
  try {
    if (roomPod.approvedUserIds) {
      approvedList = typeof roomPod.approvedUserIds === "string"
        ? JSON.parse(roomPod.approvedUserIds)
        : (roomPod.approvedUserIds as string[]);
    }
  } catch {
    // Empty
  }

  let waitingList: any[] = [];
  try {
    if (roomPod.waitingUserIds) {
      waitingList = typeof roomPod.waitingUserIds === "string"
        ? JSON.parse(roomPod.waitingUserIds)
        : (roomPod.waitingUserIds as any[]);
    }
  } catch {
    // Empty
  }

  const isHost = user && user.id === roomPod.creatorId;
  const waitingUserCount = waitingList.length;

  // Gating Check: Show Waiting Hall Lobby screen if user has not been approved by the host yet
  if (lobbyStatus === "waiting" && !isHost) {
    return (
      <DashboardLayout user={user}>
        <div className="w-full min-h-[80vh] flex flex-col items-center justify-center p-6 space-y-6 text-center animate-fadeIn">
          
          {/* Animated Loader/Wait Lottie Animation */}
          <div className="w-64 h-64 pointer-events-none overflow-hidden select-none">
            <iframe
              src="https://lottie.host/embed/029367a4-ed8a-4196-a11d-9b436b202595/DzlCazBv2F.lottie"
              className="w-full h-full border-0 bg-transparent"
              title="Waiting animation"
            />
          </div>

          {/* Content */}
          <div className="max-w-md space-y-2.5">
            <span className="text-[10px] bg-indigo-50 border border-indigo-100 text-indigo-750 font-extrabold px-3 py-1 rounded-full uppercase tracking-wider select-none">
              Waiting Room
            </span>
            <h2 className="text-xl font-extrabold text-slate-850">
              Waiting for the host to let you in...
            </h2>
            <p className="text-xs text-slate-500 leading-relaxed">
              You are currently in the waiting hall for study room <span className="font-bold text-slate-800">"{roomPod.name}"</span>. The host <span className="font-semibold text-indigo-650">{roomPod.creatorName}</span> has been notified to accept your request.
            </p>
          </div>

          {/* Meta Card details */}
          <div className="bg-white border border-slate-200/60 rounded-2xl px-6 py-4 text-xs text-slate-500 max-w-sm flex items-center justify-between w-full shadow-md">
            <div className="text-left">
              <span className="block text-[8px] text-slate-400 font-extrabold uppercase tracking-wider">Your Profile</span>
              <span className="font-bold text-slate-700">{user?.fullName}</span>
            </div>
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 shrink-0"></span>
            <div className="text-right">
              <span className="block text-[8px] text-slate-400 font-extrabold uppercase tracking-wider">Status</span>
              <span className="font-bold text-indigo-600">Waiting for Host Approval</span>
            </div>
          </div>

        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout user={user}>
      <div className="flex-1 flex flex-col h-[calc(100vh-2rem)] md:h-[calc(100vh-4rem)] -m-4 md:-m-8 overflow-hidden bg-slate-50 relative">
        
        {/* Navigation Menu Bar */}
        <div className="flex items-center justify-between text-xs text-slate-500 py-3.5 px-6 bg-white border-b border-slate-200 shrink-0 select-none">
          <div className="flex items-center gap-2">
            <a href="/studypod" className="hover:text-indigo-650 transition font-medium">
              Study Pods
            </a>
            <span className="text-slate-355 font-bold">/</span>
            <span className="text-slate-800 font-semibold">{roomPod.name}</span>
          </div>

          <button
            onClick={() => setShowParticipantsDrawer(!showParticipantsDrawer)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-white font-semibold transition hover:scale-102 active:scale-98 text-[10px] cursor-pointer bg-indigo-600 hover:bg-indigo-750 shadow-[0_0_15px_rgba(79,70,229,0.4)] border-t border-indigo-500/25"
          >
            <span className="material-symbols-outlined text-[15px] text-white select-none">group</span>
            Participants
            {isHost && waitingUserCount > 0 && (
              <span className="h-4 min-w-4 bg-white text-indigo-750 rounded-full flex items-center justify-center text-[8px] font-extrabold px-1">
                {waitingUserCount}
              </span>
            )}
          </button>
        </div>

        {/* Mobile active panel switcher */}
        <div className="flex lg:hidden border-b border-slate-200 bg-white p-2 shrink-0 gap-1.5 shadow-2xs">
          {(["chat", "tasks", "ideas", "info"] as const).map((tab) => {
            const labels = { chat: "Chat", tasks: "Tasks", ideas: "Ideas", info: "Room Info" };
            return (
              <button
                key={tab}
                onClick={() => {
                  setMobileActiveTab(tab);
                  if (tab === "tasks" || tab === "ideas") {
                    setActiveTab(tab);
                  }
                }}
                className={`flex-1 text-center py-2 text-[10px] font-semibold rounded-lg transition cursor-pointer ${
                  mobileActiveTab === tab
                    ? "bg-slate-900 text-white shadow-xs"
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                {labels[tab]}
              </button>
            );
          })}
        </div>

        {/* Dynamic 3-panel collaborative grid workspace */}
        <div id="workspace-container" className="flex-1 flex flex-col lg:flex-row bg-white overflow-hidden animate-fadeIn">
          
          {/* PANEL 1: Left Room Sidebar Panel */}
          <div 
            style={mounted && typeof window !== "undefined" && window.innerWidth >= 1024 ? { width: `${panel1Width}px` } : {}}
            className={`border-b lg:border-b-0 lg:border-r border-slate-200 bg-slate-50/50 flex-col shrink-0 lg:max-h-full ${mobileActiveTab === "info" ? "flex flex-1 animate-fadeIn" : "hidden lg:flex"}`}
          >
          {/* Header metadata */}
          <div className="p-5 border-b border-slate-200 bg-white space-y-2 select-none">
            <div>
              <span className="inline-block text-[9px] bg-emerald-50 text-emerald-700 font-semibold px-2.5 py-0.5 rounded-full border border-emerald-100/60 shadow-3xs">
                Study pod workspace
              </span>
            </div>
            <h2 className="text-base font-bold text-slate-800 tracking-tight leading-none truncate">
              {studyPod.name}
            </h2>
            <p className="text-[11px] text-slate-550 flex items-center gap-1">
              <span className="text-slate-400">Host:</span>
              <span className="font-medium text-slate-700">{studyPod.creatorName}</span>
            </p>
          </div>

          {/* Active room participants list */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            <div className="space-y-2">
              <span className="block text-[8px] text-slate-450 font-extrabold uppercase tracking-wider select-none pl-0.5">
                Room Members ({participants.length || 1})
              </span>
              <div className="space-y-2.5 pt-1">
                {/* Current logged in user is always in room */}
                {(() => {
                  const softColorClass = getParticipantSoftCardColor(user.email);
                  return (
                    <div className={`flex items-center gap-3 p-2.5 rounded-xl transition hover:scale-[1.01] duration-150 ${softColorClass}`}>
                      {user.profileImage ? (
                        <img
                          src={user.profileImage}
                          alt={user.fullName}
                          className="w-7.5 h-7.5 rounded-lg object-cover border border-white/20 shadow-3xs shrink-0"
                        />
                      ) : (
                        <div className="w-7.5 h-7.5 rounded-lg bg-indigo-600 text-white flex items-center justify-center text-[10px] font-bold shadow-2xs shrink-0">
                          Me
                        </div>
                      )}
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-bold text-slate-900 truncate leading-none flex items-center gap-1">
                          {user.fullName}
                          <span className="inline-block text-[7px] font-extrabold bg-slate-900 text-white px-1 py-0.5 rounded shrink-0">
                            Me
                          </span>
                        </p>
                        <p className="text-[9px] text-slate-550 truncate leading-none mt-1">
                          {user.email}
                        </p>
                      </div>
                    </div>
                  );
                })()}

                {/* Other members derived from messages stream */}
                {participants
                  .filter((p) => p.email.toLowerCase() !== user.email.toLowerCase())
                  .map((p) => {
                    const colorStyle = getParticipantColor(p.email);
                    const softColorClass = getParticipantSoftCardColor(p.email);
                    return (
                      <div key={p.email} className={`flex items-center gap-3 p-2.5 rounded-xl transition hover:scale-[1.01] duration-150 animate-fadeIn ${softColorClass}`}>
                        {p.profileImage ? (
                          <img
                            src={p.profileImage}
                            alt={p.fullName}
                            className="w-7.5 h-7.5 rounded-lg object-cover border border-white/20 shadow-3xs shrink-0"
                          />
                        ) : (
                          <div className={`w-7.5 h-7.5 rounded-lg flex items-center justify-center text-[10px] font-bold border shadow-2xs shrink-0 ${colorStyle.bg}`}>
                            {p.fullName.substring(0, 2).toUpperCase()}
                          </div>
                        )}
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-bold text-slate-900 truncate leading-none">
                            {p.fullName}
                          </p>
                          <p className="text-[9px] text-slate-550 truncate leading-none mt-1">
                            {p.email}
                          </p>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          </div>

          {/* Room bottom actions */}
          <div className="p-4 border-t border-slate-200/85 bg-white space-y-2 shrink-0">
            <button
              onClick={handleCopyLink}
              className="w-full bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 font-bold py-2.5 px-3 rounded-xl text-xs transition duration-150 cursor-pointer flex items-center justify-center gap-1.5 shadow-3xs"
            >
              {copiedLink ? (
                <>
                  <IconCheck className="w-4 h-4 text-emerald-600" />
                  Copied Link!
                </>
              ) : (
                <>
                  <IconCopy className="w-4 h-4 text-slate-400" />
                  Share Invite Link
                </>
              )}
            </button>
            <button
              onClick={() => router.push("/studypod")}
              className="w-full bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-100/60 font-bold py-2.5 px-3 rounded-xl text-xs transition duration-150 cursor-pointer flex items-center justify-center gap-1.5 shadow-3xs"
            >
              <IconDoorExit className="w-4 h-4 text-rose-500" />
              Leave Room
            </button>
          </div>          </div>

        {/* Custom Resizable Column Divider 1 */}
        <div
          onMouseDown={(e) => { e.preventDefault(); setIsDraggingP1(true); }}
          className={`hidden lg:block w-1 hover:w-1.5 hover:bg-indigo-500 cursor-col-resize transition-all self-stretch relative z-30 shrink-0 ${
            isDraggingP1 ? "bg-indigo-600 w-1.5 shadow-sm" : "bg-slate-200/60"
          }`}
          title="Drag to resize Left Panel"
        />

        {/* PANEL 2: Center Workspace Chat stream */}
        <div className={`flex-1 flex-col h-full overflow-hidden border-b lg:border-b-0 lg:border-r border-slate-200 ${mobileActiveTab === "chat" ? "flex" : "hidden lg:flex"}`}>
          <div className="p-4 border-b border-slate-200 flex items-center gap-2.5 bg-white shrink-0">
            <span className="p-2 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-650 shrink-0">
              <IconMessages className="w-4 h-4" />
            </span>
            <div>
              <h3 className="text-xs font-semibold text-slate-800 leading-none">
                Room discussion
              </h3>
              <p className="text-[10px] text-slate-400 mt-1">
                Collaborative public chat with all study partners.
              </p>
            </div>
          </div>

          {/* Chat message stream container */}
          <div className="flex-1 overflow-y-auto p-4 md:p-6 bg-slate-50/20 space-y-4">
            {workspaceLoading ? (
              <div className="flex flex-col items-center justify-center h-full gap-2">
                <div className="w-6 h-6 border-2 border-slate-200 border-t-indigo-600 rounded-full animate-spin"></div>
                <p className="text-[11px] text-slate-400 font-medium">Entering Room...</p>
              </div>
            ) : messages.length > 0 ? (
              messages.map((msg) => {
                const isCurrentUser = msg.email.trim().toLowerCase() === user.email.trim().toLowerCase();
                const colorStyle = getParticipantColor(msg.email);

                return (
                  <div
                    key={msg.id}
                    className={`flex items-start gap-2.5 max-w-[85%] md:max-w-[75%] ${
                      isCurrentUser ? "ml-auto flex-row-reverse" : "mr-auto"
                    }`}
                  >
                    {/* Participant Avatar Initials */}
                    <div className="shrink-0">
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-extrabold border shadow-2xs ${colorStyle.bg}`}>
                        {msg.fullName.substring(0, 2).toUpperCase()}
                      </div>
                    </div>

                    {/* Chat Bubble card */}
                    <div className="space-y-0.5">
                      <div className={`flex items-center gap-1.5 text-[9px] ${
                        isCurrentUser ? "justify-end text-slate-500" : "text-slate-650"
                      }`}>
                        <span className="font-bold">{msg.fullName}</span>
                      </div>
                      <div className={`rounded-2xl px-3.5 py-2 text-xs shadow-2xs break-words whitespace-pre-wrap leading-relaxed ${
                        isCurrentUser ? "bg-indigo-600 text-white rounded-tr-none" : "bg-white text-slate-800 border border-slate-200 rounded-tl-none"
                      }`}>
                        {msg.content}
                      </div>
                      <div className={`text-[8px] text-slate-400 font-medium ${
                        isCurrentUser ? "text-right" : ""
                      }`}>
                        {new Date(msg.createdAt).toLocaleTimeString(undefined, {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-8 select-none pt-16 pb-12">
                <div className="w-72 h-72 mb-4 pointer-events-none overflow-hidden">
                  <iframe
                    src="https://lottie.host/embed/ea8bc4c7-442b-48c1-95b4-c7d02afd2cca/ebPEadNeIk.lottie"
                    className="w-full h-full border-0 bg-transparent"
                    title="Empty state animation"
                  />
                </div>
                <h4 className="text-xs font-semibold text-slate-800 mt-2">Workspace chat active</h4>
                <p className="text-[11px] text-slate-500 max-w-xs mt-1 leading-normal">
                  Send a message below to start collaborating with members in the study pod.
                </p>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Message input sender (Supports image upload, file sharing, and emojis picker) */}
          <div className="border-t border-slate-200 bg-white shrink-0 relative">
            
            {/* Emojis selection drawer popup */}
            {showEmojiPicker && (
              <div className="absolute bottom-full left-4 mb-2 z-40 bg-white border border-slate-200 shadow-xl rounded-2xl p-3 grid grid-cols-6 gap-2 w-56 animate-fadeIn select-none">
                {["😀", "😂", "👍", "🔥", "🎉", "🙌", "💡", "📚", "🚀", "✍️", "💻", "💯"].map((emoji) => (
                  <button
                    key={emoji}
                    type="button"
                    onClick={() => {
                      setChatText((prev) => prev + emoji);
                      setShowEmojiPicker(false);
                    }}
                    className="text-lg hover:bg-slate-100 p-1.5 rounded-lg transition text-center cursor-pointer"
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            )}

            {/* Selected attachments preview panel indicator */}
            {(selectedFile || selectedImage) && (
              <div className="flex items-center justify-between bg-slate-50 border-b border-slate-100 px-4 py-2 text-[10px] text-slate-650 animate-fadeIn shrink-0 select-none">
                <div className="flex items-center gap-1.5 font-semibold truncate">
                  <span className="material-symbols-outlined text-[14px] text-indigo-650 shrink-0">
                    {selectedImage ? "image" : "description"}
                  </span>
                  <span className="truncate max-w-[240px]">
                    {selectedImage ? selectedImage.name : selectedFile?.name}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedFile(null);
                    setSelectedImage(null);
                    if (fileInputRef.current) fileInputRef.current.value = "";
                    if (imageInputRef.current) imageInputRef.current.value = "";
                  }}
                  className="text-slate-400 hover:text-slate-600 p-0.5 rounded-full hover:bg-slate-200 transition shrink-0 cursor-pointer"
                >
                  <IconX className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {/* Hidden upload inputs */}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileSelect}
              className="hidden"
            />
            <input
              type="file"
              accept="image/*"
              ref={imageInputRef}
              onChange={handleImageSelect}
              className="hidden"
            />

            <form onSubmit={handleSendChat} className="flex gap-2 items-center p-4">
              
              {/* Emojis Trigger */}
              <button
                type="button"
                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                className={`p-2.5 rounded-xl border text-slate-450 hover:bg-slate-50 hover:text-slate-700 transition cursor-pointer shrink-0 flex items-center justify-center h-9.5 w-9.5 ${
                  showEmojiPicker ? "bg-slate-50 border-indigo-200 text-indigo-650" : "border-slate-200"
                }`}
                title="Add emoji"
              >
                <IconMoodSmile className="w-4.5 h-4.5" />
              </button>

              {/* Image Upload Trigger */}
              <button
                type="button"
                onClick={() => imageInputRef.current?.click()}
                className={`p-2.5 rounded-xl border text-slate-450 hover:bg-slate-50 hover:text-slate-700 transition cursor-pointer shrink-0 flex items-center justify-center h-9.5 w-9.5 ${
                  selectedImage ? "bg-indigo-50 border-indigo-200 text-indigo-650" : "border-slate-200"
                }`}
                title="Share image"
              >
                <IconPhoto className="w-4.5 h-4.5" />
              </button>

              {/* File Attachment Trigger */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className={`p-2.5 rounded-xl border text-slate-450 hover:bg-slate-50 hover:text-slate-700 transition cursor-pointer shrink-0 flex items-center justify-center h-9.5 w-9.5 ${
                  selectedFile ? "bg-indigo-50 border-indigo-200 text-indigo-650" : "border-slate-200"
                }`}
                title="Share file attachment"
              >
                <IconPaperclip className="w-4.5 h-4.5" />
              </button>

              <input
                type="text"
                value={chatText}
                onChange={(e) => setChatText(e.target.value)}
                placeholder="Type a message to share..."
                required={!selectedFile && !selectedImage}
                maxLength={400}
                className="flex-1 px-4 py-2.5 border border-slate-200 hover:border-slate-350 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 rounded-xl text-slate-800 text-xs transition"
              />

              <button
                type="submit"
                disabled={(!chatText.trim() && !selectedFile && !selectedImage) || submittingChat}
                className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-100 disabled:text-slate-400 text-white p-2.5 rounded-xl transition duration-150 cursor-pointer shrink-0 flex items-center justify-center h-9.5 w-9.5 shadow-2xs"
              >
                <IconSend className="w-4.5 h-4.5" />
              </button>
            </form>
          </div>
        </div>

        {/* Custom Resizable Column Divider 2 */}
        <div
          onMouseDown={(e) => { e.preventDefault(); setIsDraggingP3(true); }}
          className={`hidden lg:block w-1 hover:w-1.5 hover:bg-indigo-500 cursor-col-resize transition-all self-stretch relative z-30 shrink-0 ${
            isDraggingP3 ? "bg-indigo-600 w-1.5 shadow-sm" : "bg-slate-200/60"
          }`}
          title="Drag to resize Right Panel"
        />

        {/* PANEL 3: Right Tabbed Workspace Board (Todos & Ideas) */}
        <div 
          style={mounted && typeof window !== "undefined" && window.innerWidth >= 1024 ? { width: `${panel3Width}px` } : {}}
          className={`flex-col h-full bg-slate-50/30 shrink-0 ${mobileActiveTab === "tasks" || mobileActiveTab === "ideas" ? "flex flex-1" : "hidden lg:flex"}`}
        >
          
          {/* Header tabs selector */}
          <div className="flex border-b border-slate-200 bg-white p-3 shrink-0 gap-2 select-none">
            <button
              onClick={() => setActiveTab("tasks")}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-bold rounded-xl transition cursor-pointer shadow-3xs hover:scale-101 active:scale-99 ${
                activeTab === "tasks"
                  ? "bg-indigo-600 text-white shadow-md border-t border-indigo-500/30"
                  : "bg-slate-50 text-slate-600 hover:text-slate-800 hover:bg-slate-100 border border-slate-200/50"
              }`}
            >
              <IconChecklist className="w-4 h-4" />
              Tasks Checklist
            </button>
            <button
              onClick={() => setActiveTab("ideas")}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-bold rounded-xl transition cursor-pointer shadow-3xs hover:scale-101 active:scale-99 ${
                activeTab === "ideas"
                  ? "bg-indigo-600 text-white shadow-md border-t border-indigo-500/30"
                  : "bg-slate-50 text-slate-600 hover:text-slate-800 hover:bg-slate-100 border border-slate-200/50"
              }`}
            >
              <IconBulb className="w-4 h-4" />
              Ideation Board
            </button>
          </div>

          {/* Tab contents panel */}
          <div className="flex-1 overflow-y-auto p-4">
            
            {/* TAB 1: Tasks Checklist Board */}
            {activeTab === "tasks" && (
              <div className="space-y-4">
                
                {/* Todo creation form */}
                <form onSubmit={handleAddTodo} className="flex gap-2 p-1">
                  <input
                    type="text"
                    required
                    value={todoText}
                    onChange={(e) => setTodoText(e.target.value)}
                    placeholder="Create a shared task..."
                    maxLength={100}
                    className="flex-1 px-4 py-2.5 border border-slate-200 hover:border-slate-350 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 rounded-xl text-slate-800 text-xs bg-white transition shadow-3xs"
                  />
                  <button
                    type="submit"
                    disabled={!todoText.trim() || submittingTodo}
                    className="bg-slate-900 hover:bg-slate-800 disabled:bg-slate-100 disabled:text-slate-400 text-white px-4 py-2.5 rounded-xl transition duration-150 cursor-pointer flex items-center gap-1 shrink-0 text-xs font-semibold shadow-3xs"
                  >
                    <IconPlus className="w-4 h-4" /> Add
                  </button>
                </form>

                {/* Todo listings */}
                <div className="space-y-2.5">
                  <span className="text-[10px] text-slate-450 font-bold uppercase tracking-wider block pl-0.5 select-none">
                    Shared task checklist ({todos.length})
                  </span>
                  {todos.length > 0 ? (
                    <div className="space-y-2">
                      {todos.map((todo) => (
                        <div
                          key={todo.id}
                          className={`flex items-start gap-3 p-3.5 border rounded-2xl transition hover:scale-[1.01] duration-150 shadow-3xs animate-fadeIn ${
                            todo.completed 
                              ? "bg-slate-50/70 border-slate-200/50 opacity-65" 
                              : "bg-white border-slate-200 hover:border-indigo-300 hover:shadow-2xs"
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={todo.completed}
                            onChange={() => handleToggleTodo(todo.id, todo.completed)}
                            className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer mt-0.5 shrink-0"
                          />
                          <div className="flex-1 min-w-0">
                            <p className={`text-xs font-medium break-words leading-snug ${
                              todo.completed ? "text-slate-450 line-through" : "text-slate-850"
                            }`}>
                              {todo.title}
                            </p>
                            <span className="block text-[8px] text-slate-400 mt-1 select-none">
                              By: {todo.creatorName}
                            </span>
                          </div>
                          <button
                            onClick={() => handleDeleteTodo(todo.id)}
                            className="text-slate-400 hover:text-red-650 p-1 rounded-lg hover:bg-slate-50 transition cursor-pointer shrink-0"
                          >
                            <IconTrash className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="border border-dashed border-slate-200 bg-white/50 rounded-2xl p-6 text-center select-none">
                      <p className="text-[11px] text-slate-500">
                        No tasks active in this room. Add a task above to align goals.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* TAB 2: Ideation Sticky Board */}
            {activeTab === "ideas" && (
              <div className="space-y-4">
                
                {/* Idea card creation form */}
                <form onSubmit={handleAddIdea} className="bg-white border border-slate-200/80 rounded-2xl p-4.5 space-y-3.5 shadow-3xs">
                  <span className="text-[10px] text-slate-455 font-bold uppercase tracking-wider block leading-none pl-0.5 select-none">
                    Post an idea card
                  </span>
                  <div className="space-y-2">
                    <input
                      type="text"
                      required
                      value={ideaTitle}
                      onChange={(e) => setIdeaTitle(e.target.value)}
                      placeholder="Title of your idea..."
                      maxLength={80}
                      className="w-full border border-slate-200 hover:border-slate-350 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 rounded-xl px-3.5 py-2.5 text-xs transition text-slate-800 shadow-3xs"
                    />
                    <textarea
                      required
                      value={ideaDesc}
                      onChange={(e) => setIdeaDesc(e.target.value)}
                      placeholder="Describe your design or strategy..."
                      maxLength={300}
                      rows={3}
                      className="w-full border border-slate-200 hover:border-slate-350 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 rounded-xl px-3.5 py-2.5 text-xs transition text-slate-800 resize-none shadow-3xs"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={!ideaTitle.trim() || !ideaDesc.trim() || submittingIdea}
                    className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-2.5 rounded-xl text-xs transition duration-150 cursor-pointer flex items-center justify-center gap-1 shadow-3xs"
                  >
                    <IconPlus className="w-4 h-4" /> Share Idea
                  </button>
                </form>

                {/* Ideas stack */}
                <div className="space-y-2.5">
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block pl-0.5 select-none">
                    Room ideas stack ({ideas.length})
                  </span>
                  {ideas.length > 0 ? (
                    <div className="space-y-3">
                      {ideas.map((idea) => (
                        <div
                          key={idea.id}
                          className="bg-gradient-to-br from-amber-50/80 to-orange-50/30 border border-amber-200/70 hover:border-amber-300 rounded-2xl p-4.5 shadow-3xs hover:shadow-2xs transition hover:scale-[1.01] duration-150 space-y-2.5 relative overflow-hidden animate-fadeIn"
                        >
                          <div className="flex justify-between items-start gap-2">
                            <h4 className="text-xs font-bold text-amber-950 leading-snug">
                              {idea.title}
                            </h4>
                            <button
                              onClick={() => handleDeleteIdea(idea.id)}
                              className="text-amber-700 hover:text-red-655 p-1.5 rounded-lg hover:bg-amber-100/40 transition cursor-pointer shrink-0"
                            >
                              <IconTrash className="w-3.5 h-3.5" />
                            </button>
                          </div>
                          
                          <p className="text-xs text-amber-900/90 leading-relaxed break-words whitespace-pre-wrap">
                            {idea.description}
                          </p>

                          <div className="pt-2 border-t border-amber-200/40 flex justify-between items-center text-[8px] text-amber-800/80 select-none">
                            <span>Author: {idea.creatorName}</span>
                            <span>
                              {new Date(idea.createdAt).toLocaleDateString("en-US", {
                                month: "short",
                                day: "numeric",
                              })}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="border border-dashed border-slate-200 bg-white/50 rounded-2xl p-6 text-center select-none">
                      <p className="text-[11px] text-slate-550">
                        No ideas shared yet. Post your first card to start brainstorming!
                      </p>
                    </div>
                  )}
                </div>

              </div>
            )}

          </div>
        </div>

        {/* Right Drawer Overlay Panel showing participants and lobby list */}
        {showParticipantsDrawer && (
          <>
            {/* Backdrop layer to close drawer on click outside */}
            <div 
              className="fixed inset-0 z-40 bg-slate-900/10 lg:bg-transparent" 
              onClick={() => setShowParticipantsDrawer(false)}
            />
            
            {/* Drawer Body container */}
            <div className="absolute lg:relative top-0 right-0 h-full w-80 z-50 bg-white border-l border-slate-200 flex flex-col shrink-0 animate-slideLeft shadow-lg lg:shadow-none">
              
              {/* Drawer Header */}
              <div className="p-4 border-b border-slate-200 flex items-center justify-between shrink-0">
                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5 select-none">
                  <span className="material-symbols-outlined text-[18px] text-slate-400">group</span>
                  Room Members
                </h3>
                <button
                  onClick={() => setShowParticipantsDrawer(false)}
                  className="text-slate-400 hover:text-slate-600 cursor-pointer p-0.5 rounded-full hover:bg-slate-100 transition shrink-0"
                >
                  <IconX className="w-4 h-4" />
                </button>
              </div>

              {/* Drawer Content */}
              <div className="flex-1 overflow-y-auto p-4 space-y-5">
                
                {/* 1. Host Creator details */}
                <div className="space-y-1.5">
                  <span className="block text-[8px] text-slate-450 font-extrabold uppercase tracking-wider pl-0.5">Host Creator</span>
                  <div className="flex items-center gap-2.5 p-2 rounded-xl bg-slate-50 border border-slate-200/50">
                    <div className="w-8 h-8 rounded-lg bg-indigo-650 text-white flex items-center justify-center text-xs font-extrabold shadow-2xs shrink-0">
                      {roomPod.creatorName.substring(0, 2).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-slate-800 truncate leading-none">
                        {roomPod.creatorName}
                      </p>
                      <span className="inline-block text-[8px] font-extrabold bg-indigo-50 text-indigo-750 px-1.5 py-0.5 rounded mt-1.5 select-none border border-indigo-100">
                        Host
                      </span>
                    </div>
                  </div>
                </div>

                {/* 2. Pending Requests List (Lobby queue) - visible to Host only */}
                {isHost && (
                  <div className="space-y-2">
                    <span className="block text-[8px] text-slate-450 font-extrabold uppercase tracking-wider pl-0.5">
                      Waiting Room Requests ({waitingList.length})
                    </span>
                    {waitingList.length === 0 ? (
                      <p className="text-[10px] text-slate-400 italic pl-1.5 font-medium">
                        No pending join requests
                      </p>
                    ) : (
                      <div className="space-y-2">
                        {waitingList.map((w: any) => (
                          <div key={w.id} className="flex flex-col gap-2 p-2.5 rounded-xl border border-amber-150 bg-amber-50/20 animate-fadeIn">
                            <div className="flex items-center gap-2">
                              {w.profileImage ? (
                                <img
                                  src={w.profileImage}
                                  alt={w.fullName}
                                  className="w-7 h-7 rounded-lg object-cover border border-slate-200 shrink-0"
                                />
                              ) : (
                                <div className="w-7 h-7 rounded-lg bg-amber-100 text-amber-900 flex items-center justify-center text-xs font-extrabold shadow-2xs shrink-0">
                                  {w.fullName.substring(0, 2).toUpperCase()}
                                </div>
                              )}
                              <div className="min-w-0 flex-1">
                                <p className="text-xs font-bold text-slate-800 truncate leading-none">{w.fullName}</p>
                                <p className="text-[9px] text-slate-450 truncate mt-1 leading-none">{w.selectedRole || "Learner"}</p>
                              </div>
                            </div>
                            
                            {/* Host action buttons */}
                            <div className="flex items-center gap-1.5 mt-0.5">
                              <button
                                disabled={approvingUserId !== null}
                                onClick={() => handleApproveUser(w.id, "accept")}
                                className="flex-1 py-1 rounded-lg bg-indigo-650 hover:bg-indigo-750 text-white text-[9px] font-bold transition shadow-3xs cursor-pointer flex items-center justify-center h-6.5"
                              >
                                {approvingUserId === w.id ? "..." : "Accept"}
                              </button>
                              <button
                                disabled={approvingUserId !== null}
                                onClick={() => handleApproveUser(w.id, "decline")}
                                className="flex-1 py-1 rounded-lg bg-white hover:bg-slate-50 border border-slate-200 text-slate-500 hover:text-slate-800 text-[9px] font-bold transition shadow-3xs cursor-pointer flex items-center justify-center h-6.5"
                              >
                                Decline
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* 3. Joined Room Members List */}
                <div className="space-y-2">
                  <span className="block text-[8px] text-slate-450 font-extrabold uppercase tracking-wider pl-0.5">
                    Joined Members ({participants.length})
                  </span>
                  <div className="space-y-1.5">
                    {/* Logged in member (You) */}
                    <div className="flex items-center gap-2.5 p-1.5 rounded-lg hover:bg-slate-50">
                      <div className="w-6.5 h-6.5 rounded bg-slate-900 text-white flex items-center justify-center text-[9px] font-extrabold shadow-3xs shrink-0">
                        Me
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-slate-800 truncate leading-none">{user?.fullName}</p>
                        <p className="text-[9px] text-slate-400 truncate leading-none mt-1">{user?.selectedRole || "Academy Learner"}</p>
                      </div>
                    </div>

                    {/* Other joined members */}
                    {participants
                      .filter((p) => p.email.toLowerCase() !== user?.email.toLowerCase())
                      .map((p) => {
                        const colorStyle = getParticipantColor(p.email);
                        return (
                          <div key={p.email} className="flex items-center gap-2.5 p-1.5 rounded-lg hover:bg-slate-50">
                            <div className={`w-6.5 h-6.5 rounded flex items-center justify-center text-[9px] font-extrabold shadow-3xs shrink-0 border ${colorStyle.bg}`}>
                              {p.fullName.substring(0, 2).toUpperCase()}
                            </div>
                            <div className="min-w-0">
                              <p className="text-xs font-bold text-slate-805 truncate leading-none">{p.fullName}</p>
                              <p className="text-[9px] text-slate-400 truncate leading-none mt-1">Joined member</p>
                            </div>
                          </div>
                        );
                      })}
                  </div>
                </div>

              </div>
            </div>
          </>
        )}

      </div>
      </div>
    </DashboardLayout>
  );
}
