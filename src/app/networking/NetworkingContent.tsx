"use client";

import React, { useState, useEffect, useRef } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import {
  IconSend,
  IconBrandTelegram,
  IconUsers,
  IconUser,
  IconLock,
  IconMessage,
  IconMessageCircle,
  IconX,
} from "@tabler/icons-react";

interface UserCompact {
  id: string;
  fullName: string;
  email: string;
  selectedRole: string;
  profileImage: string | null;
  collegeStudying?: string | null;
  branch?: string | null;
  year?: string | null;
  dob?: string | null;
  portfolioLink?: string | null;
  linkedinLink?: string | null;
  about?: string | null;
  shareWithNetworking?: boolean;
}

interface ChatMessage {
  id: string;
  content: string;
  userId: string;
  fullName: string;
  email: string;
  role: string;
  recipientId: string | null;
  reactions?: any;
  createdAt: string;
}

interface NetworkingContentProps {
  user: UserCompact;
  allUsers: UserCompact[];
}

// Visual premium colors matching the resources page card header gradients/themes
const bubbleColors = [
  { bg: "#4f46e5", text: "#ffffff", border: "transparent" }, // Indigo
  { bg: "#059669", text: "#ffffff", border: "transparent" }, // Emerald
  { bg: "#db2777", text: "#ffffff", border: "transparent" }, // Pink
  { bg: "#e11d48", text: "#ffffff", border: "transparent" }, // Rose
  { bg: "#0284c7", text: "#ffffff", border: "transparent" }, // Sky
  { bg: "#0891b2", text: "#ffffff", border: "transparent" }, // Cyan
  { bg: "#f97316", text: "#ffffff", border: "transparent" }, // Orange
  { bg: "#0d9488", text: "#ffffff", border: "transparent" }, // Teal
  { bg: "#d97706", text: "#ffffff", border: "transparent" }, // Amber
  { bg: "#7c3aed", text: "#ffffff", border: "transparent" }, // Violet
  { bg: "#e2f952", text: "#0f172a", border: "transparent" }  // Neon Yellow/Lime
];

export default function NetworkingContent({ user, allUsers }: NetworkingContentProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessageText, setNewMessageText] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  
  // Direct Messaging Selected User ID. If null, it is public group chat.
  const [activeChatUserId, setActiveChatUserId] = useState<string | null>(null);

  // Controls visibility of the profile inspector panel
  const [showProfilePanel, setShowProfilePanel] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Stable hashing function to get consistent color for a user ID
  const getUserColor = (userId: string) => {
    let hash = 0;
    for (let i = 0; i < userId.length; i++) {
      hash = userId.charCodeAt(i) + ((hash << 5) - hash);
    }
    const index = Math.abs(hash) % bubbleColors.length;
    return bubbleColors[index];
  };

  // Fetch messages from API
  const fetchMessages = async (showLoading = false) => {
    if (showLoading) setLoading(true);
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
        setMessages(data.messages);
      }
    } catch (err) {
      console.error("Error fetching messages:", err);
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  // Poll for messages every 3 seconds
  useEffect(() => {
    fetchMessages(true);
    
    const interval = setInterval(() => {
      fetchMessages(false);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  // Auto scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, activeChatUserId]);

  // Handle message sending
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessageText.trim() || sending) return;

    setSending(true);
    setError("");

    try {
      const res = await fetch("/api/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content: newMessageText.trim(),
          recipientId: activeChatUserId, // Send to selected user, or null for public group
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setMessages((prev) => [...prev, data.message]);
        setNewMessageText("");
      } else {
        const errData = await res.json();
        setError(errData.error || "Failed to send message.");
      }
    } catch (err) {
      console.error("Send message error:", err);
      setError("Network error. Please try again.");
    } finally {
      setSending(false);
    }
  };

  // Handle message reaction (add, update, or toggle/delete)
  const handleReactMessage = async (messageId: string, emoji: string) => {
    try {
      const msg = messages.find((m) => m.id === messageId);
      let currentReactions = msg?.reactions || {};
      if (typeof currentReactions === "string") {
        try {
          currentReactions = JSON.parse(currentReactions);
        } catch {
          currentReactions = {};
        }
      }
      const existingReaction = currentReactions[user.id];
      // If clicking same emoji, remove reaction. Else toggle/replace reaction.
      const targetEmoji = existingReaction?.emoji === emoji ? null : emoji;

      // Optimistically update reactions on local state
      setMessages((prev) =>
        prev.map((m) => {
          if (m.id === messageId) {
            const updatedReactions = { ...currentReactions };
            if (!targetEmoji) {
              delete updatedReactions[user.id];
            } else {
              updatedReactions[user.id] = { emoji: targetEmoji, fullName: user.fullName };
            }
            return { ...m, reactions: updatedReactions };
          }
          return m;
        })
      );

      // Save reaction to database
      const res = await fetch(`/api/messages/${messageId}/react`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ emoji: targetEmoji }),
      });

      if (!res.ok) {
        throw new Error("Failed to react to message");
      }

      const data = await res.json();
      // Sync client state with database snapshot response
      setMessages((prev) =>
        prev.map((m) => (m.id === messageId ? data.message : m))
      );
    } catch (err) {
      console.error("React message error:", err);
    }
  };

  const getGroupedReactions = (reactionsObj: any) => {
    const reactionCounts: { [emoji: string]: number } = {};
    const userReacted: { [emoji: string]: string[] } = {};
    let totalReactions = 0;

    Object.entries(reactionsObj || {}).forEach(([uid, react]: [string, any]) => {
      if (react && react.emoji) {
        reactionCounts[react.emoji] = (reactionCounts[react.emoji] || 0) + 1;
        if (!userReacted[react.emoji]) userReacted[react.emoji] = [];
        userReacted[react.emoji].push(react.fullName);
        totalReactions++;
      }
    });

    return { reactionCounts, userReacted, totalReactions };
  };

  const getInitials = (name: string) => {
    if (!name) return "?";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .substring(0, 2)
      .toUpperCase();
  };

  const formatMessageTime = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleTimeString(undefined, {
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch (e) {
      return "";
    }
  };

  // Filter other users for private chat list (excluding current user)
  const directoryUsers = allUsers.filter((u) => u.id !== user.id);

  // Filter messages based on active conversation selection
  const filteredMessages = messages.filter((msg) => {
    if (activeChatUserId === null) {
      // Group chat stream (no recipient)
      return msg.recipientId === null;
    } else {
      // Private direct message between current user and activeChatUserId
      return (
        (msg.userId === user.id && msg.recipientId === activeChatUserId) ||
        (msg.userId === activeChatUserId && msg.recipientId === user.id)
      );
    }
  });

  const getActiveChatUser = () => {
    return allUsers.find((u) => u.id === activeChatUserId);
  };

  const activeUserObj = getActiveChatUser();

  const isAdminEmail = (email: string) => email.trim().toLowerCase() === "webstrixx@gmail.com";

  return (
    <DashboardLayout user={user}>
      {/* Taller right side container (h-[88vh] lg:h-[92vh]) */}
      <div className="flex h-[88vh] lg:h-[92vh] w-full flex-col lg:flex-row rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden animate-fadeIn">
        
        {/* Left Side: Users Directory & Channel List */}
        <div className="w-full lg:w-80 border-b lg:border-b-0 lg:border-r border-slate-200 bg-slate-50/50 flex flex-col shrink-0 max-h-[35%] lg:max-h-full">
          
          <div className="p-4 border-b border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <IconUsers className="w-5 h-5 text-indigo-600" />
              <h3 className="font-bold text-slate-800 text-sm uppercase tracking-wider">
                Conversations
              </h3>
            </div>
            <span className="text-[10px] bg-slate-200 text-slate-600 font-bold px-2 py-0.5 rounded-full">
              {allUsers.length} Users
            </span>
          </div>

          <div className="flex-1 overflow-y-auto p-3 space-y-1.5">
            {/* 1. Public Chat Group Selection Button */}
            <button
              onClick={() => setActiveChatUserId(null)}
              className={`w-full flex items-center gap-3 p-3 rounded-xl border transition text-left cursor-pointer ${
                activeChatUserId === null
                  ? "bg-indigo-600 border-indigo-600 text-white shadow-sm font-semibold"
                  : "bg-white border-slate-200/80 hover:border-slate-350 text-slate-700"
              }`}
            >
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-xs font-bold shrink-0 ${
                activeChatUserId === null ? "bg-white/20 text-white" : "bg-indigo-50 text-indigo-600"
              }`}>
                <IconMessageCircle className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold truncate">Public Chat Hub</p>
                <p className={`text-[9px] mt-0.5 ${activeChatUserId === null ? "text-indigo-100" : "text-slate-400"}`}>
                  Everyone in academy
                </p>
              </div>
            </button>

            {/* Divider line */}
            <div className="py-1 flex items-center gap-2">
              <span className="h-[1px] bg-slate-200 flex-1"></span>
              <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Direct Messages</span>
              <span className="h-[1px] bg-slate-200 flex-1"></span>
            </div>

            {/* 2. Registered trainees and admins private conversations */}
            {directoryUsers.map((u) => {
              const isSelected = activeChatUserId === u.id;
              const isUserAdmin = isAdminEmail(u.email);
              const userColor = getUserColor(u.id);

              return (
                <button
                  key={u.id}
                  onClick={() => setActiveChatUserId(u.id)}
                  className={`w-full flex items-center gap-3 p-3 rounded-xl border transition text-left cursor-pointer ${
                    isSelected
                      ? "bg-indigo-600 border-indigo-600 text-white shadow-sm font-semibold"
                      : "bg-white border-slate-200/80 hover:border-slate-350 text-slate-700"
                  }`}
                >
                  <div className="relative shrink-0">
                    {u.profileImage ? (
                      <img
                        src={u.profileImage}
                        alt={u.fullName}
                        className="w-9 h-9 rounded-xl object-cover"
                      />
                    ) : (
                      <div 
                        style={isSelected ? {} : { backgroundColor: userColor.bg, color: userColor.text }}
                        className={`w-9 h-9 rounded-xl flex items-center justify-center text-xs font-bold transition duration-150 ${
                          isSelected ? "bg-white/20 text-white" : ""
                        }`}
                      >
                        {getInitials(u.fullName)}
                      </div>
                    )}
                    <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 border-2 border-white rounded-full"></span>
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold truncate">{u.fullName}</p>
                    <span className={`inline-block text-[8px] font-bold px-1.5 py-0.5 rounded-md mt-0.5 ${
                      isSelected
                        ? "bg-white/25 text-white"
                        : isUserAdmin
                        ? "bg-amber-50 text-amber-700 border border-amber-100"
                        : "bg-slate-100 text-slate-500 border border-slate-200"
                    }`}>
                      {isUserAdmin ? "Admin" : u.selectedRole}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Side: Dynamic Chat Window */}
        <div className="flex-1 flex flex-col h-full overflow-hidden">
          
          {/* Chat Header Block */}
          <div 
            onClick={() => {
              if (activeChatUserId !== null) {
                setShowProfilePanel(true);
              }
            }}
            className={`p-4 border-b border-slate-200 flex items-center justify-between bg-white z-10 shrink-0 ${
              activeChatUserId !== null ? "hover:bg-slate-50/80 cursor-pointer transition" : ""
            }`}
          >
            <div className="flex items-center gap-3">
              {activeChatUserId === null ? (
                <span className="p-2.5 rounded-xl border bg-indigo-55 text-indigo-700 border-indigo-100">
                  <IconBrandTelegram className="w-5 h-5" />
                </span>
              ) : (
                // Display profile photo or initials
                activeUserObj?.profileImage ? (
                  <img
                    src={activeUserObj.profileImage}
                    alt={activeUserObj.fullName}
                    className="w-10 h-10 rounded-xl object-cover border border-slate-100"
                  />
                ) : (() => {
                  const activeColor = getUserColor(activeChatUserId);
                  return (
                    <div 
                      style={{ backgroundColor: activeColor.bg, color: activeColor.text }}
                      className="w-10 h-10 rounded-xl flex items-center justify-center text-xs font-bold shadow-2xs"
                    >
                      {getInitials(activeUserObj?.fullName || "")}
                    </div>
                  );
                })()
              )}
              <div>
                <h3 className="text-sm font-bold text-slate-800 leading-snug flex items-center gap-1.5">
                  {activeChatUserId === null ? (
                    "Public Chat Hub"
                  ) : (
                    <>
                      {activeUserObj?.fullName}
                      <span className="text-[9px] bg-emerald-50 text-emerald-700 border border-emerald-100 px-1.5 py-0.5 rounded-md flex items-center gap-0.5">
                        <IconLock className="w-3 h-3 shrink-0" /> Private
                      </span>
                    </>
                  )}
                </h3>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  {activeChatUserId === null
                    ? "Share thoughts and queries publicly with all group members"
                    : "Click to inspect profile & training details"}
                </p>
              </div>
            </div>

            {activeChatUserId !== null && (
              <button className="text-[11px] text-indigo-650 bg-indigo-50 hover:bg-indigo-100 font-bold px-3 py-1.5 rounded-xl transition duration-150 cursor-pointer">
                View Profile
              </button>
            )}
          </div>

          {/* Messages stream view */}
          <div className="flex-1 overflow-y-auto p-4 md:p-6 bg-slate-50/20 space-y-4">
            {loading ? (
              <div className="flex flex-col items-center justify-center h-full gap-2">
                <div className="w-8 h-8 border-3 border-slate-200 border-t-indigo-600 rounded-full animate-spin"></div>
                <p className="text-xs text-slate-400 font-semibold">Loading conversation...</p>
              </div>
            ) : filteredMessages.length > 0 ? (
              filteredMessages.map((msg) => {
                const isCurrentUser = msg.userId === user.id;
                const isMsgAdmin = isAdminEmail(msg.email);
                const senderColor = getUserColor(msg.userId);
                
                return (
                  <div
                    key={msg.id}
                    className={`flex items-start gap-3 max-w-[85%] md:max-w-[70%] ${
                      isCurrentUser ? "ml-auto flex-row-reverse" : "mr-auto"
                    }`}
                  >
                    {/* User Avatar Initials with custom user-specific color */}
                    <div className="shrink-0">
                      <div 
                        style={{ backgroundColor: senderColor.bg, color: senderColor.text }}
                        className="w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold shadow-2xs"
                      >
                        {getInitials(msg.fullName)}
                      </div>
                    </div>

                    {/* Chat Bubble card */}
                    <div className="space-y-1 group relative">
                      
                      {/* Emoji Reaction Hover Bar */}
                      <div className={`absolute -top-7 ${isCurrentUser ? "left-0" : "right-0"} z-30 bg-slate-950 border border-slate-800 shadow-md rounded-full px-2.5 py-1.5 flex gap-2 items-center transition-all duration-150 opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100 pointer-events-none group-hover:pointer-events-auto`}>
                        {["👍", "❤️", "😂", "😮", "😢", "🙏"].map((emoji) => {
                          const currentReactions = msg.reactions || {};
                          const userReact = currentReactions[user.id];
                          const hasReacted = userReact?.emoji === emoji;
                          return (
                            <button
                              key={emoji}
                              onClick={() => handleReactMessage(msg.id, emoji)}
                              className={`hover:scale-130 transition duration-100 text-sm cursor-pointer select-none ${
                                hasReacted ? "bg-slate-800 p-0.5 rounded-full scale-110" : ""
                              }`}
                            >
                              {emoji}
                            </button>
                          );
                        })}
                      </div>

                      {/* Sender details header */}
                      <div className={`flex items-center gap-1.5 text-[10px] ${
                        isCurrentUser ? "justify-end text-slate-500" : "text-slate-600"
                      }`}>
                        <span className="font-bold">{msg.fullName}</span>
                        <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded-md ${
                          isMsgAdmin 
                            ? "bg-amber-100 text-amber-850" 
                            : "bg-slate-100 text-slate-600"
                        }`}>
                          {isMsgAdmin ? "Admin" : msg.role}
                        </span>
                      </div>

                      {/* Content bubble with resource-style colorful backgrounds */}
                      <div className="relative">
                        <div 
                          style={{ backgroundColor: senderColor.bg, color: senderColor.text }}
                          className={`rounded-2xl px-4 py-2.5 shadow-2xs text-sm break-words whitespace-pre-wrap leading-relaxed ${
                            isCurrentUser ? "rounded-tr-none" : "rounded-tl-none"
                          } font-medium`}
                        >
                          {msg.content}
                        </div>

                        {/* Reactions Pill Display */}
                        {(() => {
                          const reactionsObj = msg.reactions || {};
                          const { reactionCounts, userReacted, totalReactions } = getGroupedReactions(reactionsObj);

                          if (totalReactions === 0) return null;

                          return (
                            <div 
                              onClick={() => {
                                const myReact = reactionsObj[user.id];
                                if (myReact && myReact.emoji) {
                                  handleReactMessage(msg.id, myReact.emoji);
                                }
                              }}
                              className={`absolute -bottom-2 ${isCurrentUser ? "left-2.5" : "right-2.5"} z-20 bg-white border border-slate-200/90 shadow-2xs rounded-full px-1.5 py-0.5 flex gap-1 items-center select-none text-[9px] text-slate-650 font-bold hover:bg-slate-50 cursor-pointer transition`}
                              title={Object.entries(userReacted)
                                .map(([emoji, names]) => `${emoji} : ${names.join(", ")}`)
                                .join("\n")}
                            >
                              <div className="flex -space-x-0.5">
                                {Object.keys(reactionCounts).map((emoji) => (
                                  <span key={emoji} className="text-xs leading-none">{emoji}</span>
                                ))}
                              </div>
                              {totalReactions > 1 && <span className="leading-none text-slate-500">{totalReactions}</span>}
                            </div>
                          );
                        })()}
                      </div>

                      {/* Timestamp */}
                      <div className={`text-[9px] text-slate-400 font-medium ${
                        isCurrentUser ? "text-right" : ""
                      }`}>
                        {formatMessageTime(msg.createdAt)}
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              (() => {
                const isChattingWithAdminPrivately = activeChatUserId !== null && activeUserObj && isAdminEmail(activeUserObj.email);
                const isChattingWithTraineePrivately = activeChatUserId !== null && activeUserObj && !isAdminEmail(activeUserObj.email);
                
                if (isChattingWithAdminPrivately) {
                  return (
                    <div className="flex flex-col items-center justify-center h-full text-center p-8">
                      <div className="w-[300px] h-[300px] flex items-center justify-center overflow-hidden">
                        <iframe
                          src="https://lottie.host/embed/ed9443d8-2a36-4272-aa49-23f10b3bdc9f/Lr8kSnUjpu.lottie"
                          style={{ width: "300px", height: "300px", border: "none" }}
                          title="Admin Private Consultation"
                        />
                      </div>
                      <h4 className="text-sm font-bold text-slate-700 mt-1">
                        Private Chat with {activeUserObj?.fullName}
                      </h4>
                      <p className="text-xs text-slate-500 max-w-sm mt-1">
                        Send a secure message below to initiate your private consultation with the administrator.
                      </p>
                    </div>
                  );
                }

                if (isChattingWithTraineePrivately) {
                  return (
                    <div className="flex flex-col items-center justify-center h-full text-center p-8">
                      <div className="w-[300px] h-[300px] flex items-center justify-center overflow-hidden">
                        <iframe
                          src="https://lottie.host/embed/ea8bc4c7-442b-48c1-95b4-c7d02afd2cca/ebPEadNeIk.lottie"
                          style={{ width: "300px", height: "300px", border: "none" }}
                          title="Trainee Private Chat"
                        />
                      </div>
                      <h4 className="text-sm font-bold text-slate-700 mt-1">
                        Private Chat with {activeUserObj?.fullName}
                      </h4>
                      <p className="text-xs text-slate-500 max-w-sm mt-1">
                        Send a secure message below to start chatting privately with {activeUserObj?.fullName}.
                      </p>
                    </div>
                  );
                }

                return (
                  <div className="flex flex-col items-center justify-center h-full text-center p-8">
                    <div className="w-14 h-14 rounded-full flex items-center justify-center bg-indigo-55 text-indigo-650">
                      <IconMessage className="w-7 h-7" />
                    </div>
                    <h4 className="text-sm font-bold text-slate-700 mt-3">
                      Welcome to the Public Hub!
                    </h4>
                    <p className="text-xs text-slate-500 max-w-sm mt-1">
                      No group messages yet. Send a message to start sharing engineering ideas publicly.
                    </p>
                  </div>
                );
              })()
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Form message input sender */}
          <div className="p-4 border-t border-slate-200 bg-white z-10 shrink-0">
            {error && (
              <div className="mb-3 text-xs text-red-600 font-semibold bg-red-50 border border-red-150 p-2.5 rounded-lg">
                {error}
              </div>
            )}
            
            <form onSubmit={handleSendMessage} className="flex gap-2 items-center">
              <input
                type="text"
                value={newMessageText}
                onChange={(e) => setNewMessageText(e.target.value)}
                placeholder={
                  activeChatUserId === null
                    ? "Type your message to share with everyone..."
                    : `Send a private message to ${activeUserObj?.fullName}...`
                }
                maxLength={500}
                required
                className="flex-1 px-4 py-3 border border-slate-200 hover:border-slate-350 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 rounded-xl text-slate-800 text-sm transition placeholder-slate-400"
              />
              <button
                type="submit"
                disabled={!newMessageText.trim() || sending}
                className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-100 disabled:text-slate-400 text-white p-3 rounded-xl transition duration-200 cursor-pointer flex items-center justify-center shadow-xs shrink-0"
              >
                {sending ? (
                  <div className="w-5 h-5 border-2 border-slate-355 border-t-white rounded-full animate-spin"></div>
                ) : (
                  <IconSend className="w-5 h-5" />
                )}
              </button>
            </form>
          </div>

        </div>

        {/* Rightmost Side Panel: Profile Inspector */}
        {showProfilePanel && activeUserObj && (
          <div className="w-full lg:w-80 border-t lg:border-t-0 lg:border-l border-slate-200 bg-white flex flex-col shrink-0 h-[45%] lg:h-full overflow-hidden animate-fadeIn">
            {/* Header banner area */}
            <div className="relative w-full h-20 bg-gradient-to-r from-blue-100 via-sky-100 to-indigo-100 shrink-0">
              <button
                onClick={() => setShowProfilePanel(false)}
                className="absolute top-3 right-3 bg-white hover:bg-slate-50 text-slate-700 w-8 h-8 rounded-full shadow-xs transition cursor-pointer flex items-center justify-center border border-slate-200/50"
              >
                <IconX className="w-4 h-4 text-slate-600" />
              </button>
            </div>

            {/* Profile Content */}
            <div className="p-5 flex flex-col flex-1 overflow-y-auto">
              {/* Avatar block with initials and text side-by-side */}
              <div className="flex items-center gap-3.5 mb-5 shrink-0">
                <div className="relative w-16 h-16 rounded-full overflow-hidden border-2 border-white shadow-sm flex items-center justify-center bg-blue-150 shrink-0">
                  {activeUserObj.profileImage ? (
                    <img
                      src={activeUserObj.profileImage}
                      alt={activeUserObj.fullName}
                      className="w-full h-full object-cover"
                    />
                  ) : (() => {
                    const activeColor = getUserColor(activeUserObj.id);
                    return (
                      <div 
                        style={{ backgroundColor: activeColor.bg, color: activeColor.text }}
                        className="w-full h-full flex items-center justify-center text-base font-extrabold"
                      >
                        {getInitials(activeUserObj.fullName)}
                      </div>
                    );
                  })()}
                </div>
                
                <div className="min-w-0">
                  <h3 className="text-base font-extrabold text-slate-900 truncate leading-snug">{activeUserObj.fullName}</h3>
                  <p className="text-[11px] text-slate-500 truncate mt-0.5">{activeUserObj.email}</p>
                  <span className="inline-block text-[9px] font-bold bg-blue-50 text-blue-700 border border-blue-100 px-2 py-0.5 rounded-md mt-1.5">
                    {isAdminEmail(activeUserObj.email) ? "Admin" : activeUserObj.selectedRole}
                  </span>
                </div>
              </div>

              {/* Inspector Details block */}
              <div className="flex-1">
                {activeUserObj.shareWithNetworking ? (
                  /* Public details display */
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3.5 rounded-2xl border border-slate-200/50">
                      <div>
                        <span className="block text-[9px] text-slate-600 font-bold uppercase tracking-wider">College</span>
                        <span className="text-xs font-semibold text-slate-800 leading-tight mt-0.5 block">{activeUserObj.collegeStudying || "Not Specified"}</span>
                      </div>
                      <div>
                        <span className="block text-[9px] text-slate-600 font-bold uppercase tracking-wider">Branch</span>
                        <span className="text-xs font-semibold text-slate-800 leading-tight mt-0.5 block">{activeUserObj.branch || "Not Specified"}</span>
                      </div>
                      <div className="mt-1">
                        <span className="block text-[9px] text-slate-600 font-bold uppercase tracking-wider">Year</span>
                        <span className="text-xs font-semibold text-slate-800 leading-tight mt-0.5 block">{activeUserObj.year || "Not Specified"}</span>
                      </div>
                      <div className="mt-1">
                        <span className="block text-[9px] text-slate-600 font-bold uppercase tracking-wider">DOB</span>
                        <span className="text-xs font-semibold text-slate-800 leading-tight mt-0.5 block">{activeUserObj.dob || "Not Specified"}</span>
                      </div>
                    </div>

                    <div>
                      <span className="block text-[9px] text-slate-600 font-bold uppercase tracking-wider mb-1">Biography</span>
                      <p className="text-xs text-slate-700 bg-slate-50/50 p-3 rounded-xl border border-slate-200/50 leading-relaxed whitespace-pre-wrap">
                        {activeUserObj.about || "No biography provided."}
                      </p>
                    </div>

                    <div className="flex flex-col gap-2 pt-1">
                      {activeUserObj.linkedinLink && (
                        <a
                          href={activeUserObj.linkedinLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-between text-xs text-blue-600 bg-blue-50/50 hover:bg-blue-50 p-2.5 rounded-xl border border-blue-100/50 transition"
                        >
                          <span className="truncate">LinkedIn Profile</span>
                          <span className="text-[10px] font-bold">Visit ↗</span>
                        </a>
                      )}
                      {activeUserObj.portfolioLink && (
                        <a
                          href={activeUserObj.portfolioLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-between text-xs text-indigo-600 bg-indigo-50/50 hover:bg-indigo-50 p-2.5 rounded-xl border border-indigo-100/50 transition"
                        >
                          <span className="truncate">Portfolio Link</span>
                          <span className="text-[10px] font-bold">Visit ↗</span>
                        </a>
                      )}
                    </div>
                  </div>
                ) : (
                  /* Private details alert */
                  <div className="flex flex-col items-center justify-center py-8 px-4 border border-dashed border-slate-200 rounded-2xl bg-slate-50/50 text-center">
                    <IconLock className="w-8 h-8 text-slate-400 mb-2 shrink-0" />
                    <h4 className="text-xs font-bold text-slate-700">Private Details</h4>
                    <p className="text-[10px] text-slate-500 mt-1 leading-relaxed max-w-[200px]">
                      This user has chosen to keep their profile details private. Visibility is restricted under networking sharing settings.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

      </div>
    </DashboardLayout>
  );
}
