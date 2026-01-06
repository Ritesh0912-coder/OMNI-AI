"use client";

import { ArrowRight, MessageSquare, History, Settings, Plus, Bot, User, LogOut, Trash2, Copy, RotateCcw } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import LightRays from "@/components/ui/LightRays";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import TextDecode from "@/components/ui/TextDecode";

const businessHeadlines = [
    "Dominance Through Neural Intelligence",
    "Scale Your Empire With Apex Logic",
    "Architecting the Future of Global Trade",
    "Unleashing Superior Strategic Vision",
    "Precision Engineering for Every System"
];

export default function ChatPage() {
    const { data: session } = useSession();
    const [input, setInput] = useState("");
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [settings, setSettings] = useState({
        persona: 'business', // 'business' | 'creative' | 'technical'
        encryption: true,
        highLowRes: 'high'
    });
    const [promptsRemaining, setPromptsRemaining] = useState(50);
    const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);
    const [isChatting, setIsChatting] = useState(false);
    const [chatId, setChatId] = useState<string | null>(null);
    const [messages, setMessages] = useState<{ role: 'ai' | 'user', content: string }[]>([]);
    const [history, setHistory] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [placeholder, setPlaceholder] = useState("Ask anything");
    const [headline, setHeadline] = useState(businessHeadlines[0]);
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(true);
    const chatEndRef = useRef<HTMLDivElement>(null);

    const searchQualities = [
        "Analyze market disruption patterns",
        "Optimize neural business logic",
        "Identify apex strategic advantages",
        "Evaluate global trade scalability",
        "Bridge technical and corporate vision"
    ];

    useEffect(() => {
        const randomPlaceholder = searchQualities[Math.floor(Math.random() * searchQualities.length)];
        setPlaceholder(randomPlaceholder);
        const randomHeadline = businessHeadlines[Math.floor(Math.random() * businessHeadlines.length)];
        setHeadline(randomHeadline);
    }, []);

    const scrollToBottom = () => {
        chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        if (isChatting) scrollToBottom();
    }, [messages, isChatting]);

    // Fetch history on load
    useEffect(() => {
        if (session?.user?.email) {
            fetchHistory();
        }
    }, [session]);

    const fetchHistory = async () => {
        try {
            const res = await fetch('/api/chats');
            const contentType = res.headers.get("content-type");

            if (contentType && contentType.includes("application/json")) {
                const data = await res.json();
                if (res.ok) {
                    if (data.chats) setHistory(data.chats);
                } else {
                    console.error("History API Error:", data.error);
                }
            } else if (!res.ok) {
                throw new Error("Database link offline.");
            }
        } catch (err) {
            console.error("Failed to fetch history:", err);
        }
    };

    const handleSend = async (e?: React.FormEvent) => {
        e?.preventDefault();
        if (promptsRemaining <= 0) {
            setIsUpgradeModalOpen(true);
            return;
        }

        const userMsg = input;
        setInput("");
        setIsChatting(true);
        setIsLoading(true);

        // Decrement prompt count
        setPromptsRemaining(prev => Math.max(0, prev - 1));

        // Optimistically add user message
        setMessages(prev => [...prev, { role: 'user', content: userMsg }]);

        try {
            const res = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: userMsg,
                    chatId,
                    settings: {
                        persona: settings.persona,
                        encryption: settings.encryption
                    }
                }),
            });

            const contentType = res.headers.get("content-type");

            if (contentType && contentType.includes("application/json")) {
                const data = await res.json();
                if (res.ok) {
                    setMessages(data.messages);
                    setChatId(data.chatId);
                    fetchHistory(); // Refresh sidebar history
                } else {
                    alert(data.error || "Neural link failed.");
                }
            } else {
                throw new Error("System transmission offline.");
            }
        } catch (error: any) {
            console.error("Chat Error:", error);
            alert(error.message || "Critical failure.");
        } finally {
            setIsLoading(false);
        }
    };

    const startNewChat = () => {
        setIsChatting(false);
        setMessages([]);
        setChatId(null);
    };

    const loadChat = async (id: string) => {
        setIsLoading(true);
        try {
            const res = await fetch(`/api/chat/${id}`);
            const contentType = res.headers.get("content-type");

            if (contentType && contentType.includes("application/json")) {
                const data = await res.json();
                if (res.ok) {
                    setMessages(data.messages);
                    setChatId(data.chatId);
                    setIsChatting(true);
                } else {
                    throw new Error(data.error || "Neural log corrupted.");
                }
            } else {
                throw new Error("Neural link unreachable.");
            }
        } catch (error: any) {
            console.error("Load Chat Error:", error);
            alert(error.message || "System failure.");
        } finally {
            setIsLoading(false);
        }
    };

    const deleteChat = async (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        if (!confirm("Are you sure you want to delete this neural log?")) return;

        try {
            const res = await fetch(`/api/chat/${id}`, { method: 'DELETE' });
            if (res.ok) {
                if (chatId === id) {
                    startNewChat();
                }
                fetchHistory();
            } else {
                const data = await res.json();
                alert(data.error || "Failed to delete chat.");
            }
        } catch (error) {
            console.error("Delete Chat Error:", error);
            alert("Critical system failure during deletion.");
        }
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
    };

    const revertMessage = async (index: number) => {
        const messageToRevert = messages[index];
        if (messageToRevert.role !== 'user') return;

        const newMessages = messages.slice(0, index);
        setMessages(newMessages);
        setInput(messageToRevert.content);
        setIsChatting(true);

        if (chatId) {
            try {
                await fetch(`/api/chat/${chatId}`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ messages: newMessages }),
                });
            } catch (error) {
                console.error("Failed to sync revert with backend:", error);
            }
        }
    };

    return (
        <main className="h-screen bg-black text-white selection:bg-primary/30 overflow-hidden flex relative">
            <motion.div
                initial={false}
                animate={{ width: isSidebarCollapsed ? 80 : 320 }}
                transition={{
                    type: "spring",
                    stiffness: 400,
                    damping: 40,
                    mass: 0.8
                }}
                onMouseEnter={() => setIsSidebarCollapsed(false)}
                onMouseLeave={() => setIsSidebarCollapsed(true)}
                className="fixed left-0 top-0 h-full bg-[#050505] border-r border-white/10 z-50 flex flex-col backdrop-blur-3xl shadow-[20px_0_50px_-20px_rgba(0,0,0,0.5)] overflow-hidden"
            >
                {/* Mathematical Center Rail Container */}
                <div className={`flex flex-col h-full items-center py-8 ${isSidebarCollapsed ? 'w-20' : 'w-80'}`}>

                    {/* Logo: Neural Centerpiece with Dynamic Glow */}
                    <Link href="/" className={`w-full flex items-center justify-center ${isSidebarCollapsed ? '' : 'px-6'} transition-all mb-12 relative`}>
                        <div className="relative w-12 h-12 rounded-2xl overflow-hidden bg-[#0c0c0c] border border-white/10 transition-all duration-500 flex items-center justify-center shadow-[0_0_20px_rgba(0,0,0,1)] flex-shrink-0">
                            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                            <Image
                                src="/synapse-logo.png"
                                alt="SYNAPSE AI"
                                width={32}
                                height={32}
                                className="object-contain relative z-10 group-hover:scale-110 transition-transform duration-500 brightness-110"
                                priority
                            />
                            <div className="absolute inset-0 border border-primary/30 rounded-2xl animate-pulse" />
                        </div>

                        {!isSidebarCollapsed && (
                            <motion.div
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="ml-5 whitespace-nowrap flex flex-col"
                            >
                                <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-white leading-tight">SYNAPSE AI</h2>
                                <span className="text-[7px] font-bold uppercase tracking-[0.2em] text-primary mt-1">Back To Home</span>
                            </motion.div>
                        )}
                    </Link>

                    {/* Content Section: Precision Spacing */}
                    <div className={`w-full flex-1 flex flex-col px-3 ${isSidebarCollapsed ? '' : 'px-6'} gap-8 scrollbar-hide overflow-y-auto overflow-x-hidden`}>

                        {/* Action: High-Tech "New Chat" */}
                        <button
                            onClick={startNewChat}
                            className="w-full h-14 rounded-2xl flex items-center justify-start transition-all duration-500 group/item relative overflow-hidden bg-white/[0.04] border border-white/10 shadow-lg"
                        >
                            <div className="absolute inset-0 bg-gradient-to-r from-primary/30 to-transparent opacity-0 group-hover/item:opacity-100 transition-opacity" />
                            <div className="w-14 h-14 flex items-center justify-center flex-shrink-0 relative z-10">
                                <Plus className="w-7 h-7 text-primary group-hover/item:text-black transition-all duration-300 drop-shadow-[0_0_10px_rgba(0,255,102,0.6)]" />
                            </div>
                            {!isSidebarCollapsed && (
                                <span className="text-[11px] font-black uppercase tracking-[0.25em] text-white group-hover/item:text-black transition-all duration-500 whitespace-nowrap relative z-10">
                                    New Chat
                                </span>
                            )}
                        </button>

                        {/* Laser Divider */}
                        <div className="relative w-full h-[1px] flex items-center justify-center">
                            <div className={`h-full bg-gradient-to-r from-transparent via-white/10 to-transparent transition-all duration-700 ${isSidebarCollapsed ? 'w-8' : 'w-full'}`} />
                        </div>

                        {/* Rail Items: Neural History */}
                        <div className="flex flex-col gap-3">
                            {history.length > 0 ? history.map((chat) => (
                                <div
                                    key={chat._id}
                                    onClick={() => loadChat(chat._id)}
                                    className={`w-full h-12 rounded-xl flex items-center justify-start transition-all group/item relative cursor-pointer ${chatId === chat._id ? 'bg-white/[0.05] border-white/10' : 'hover:bg-white/[0.03] border-transparent'}`}
                                >
                                    <div className="w-14 h-12 flex items-center justify-center flex-shrink-0 relative z-10">
                                        <MessageSquare className={`w-6 h-6 transition-colors drop-shadow-[0_0_10px_rgba(0,255,102,0.4)] ${chatId === chat._id ? 'text-primary' : 'text-primary/50 group-hover/item:text-primary'}`} />
                                    </div>
                                    {!isSidebarCollapsed && (
                                        <div className="flex flex-col overflow-hidden relative z-10 flex-1">
                                            <span className="text-[11px] font-bold text-gray-300 group-hover/item:text-white truncate">
                                                {chat.title}
                                            </span>
                                        </div>
                                    )}
                                    {!isSidebarCollapsed && (
                                        <button
                                            onClick={(e) => deleteChat(e, chat._id)}
                                            className="p-2 hover:text-red-500 transition-all relative z-20 mr-2"
                                            title="Delete neural log"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    )}
                                    {chatId === chat._id && (
                                        <div className="absolute left-0 w-[2px] h-6 bg-primary rounded-full shadow-[0_0_10px_#00ff66]" />
                                    )}
                                </div>
                            )) : (
                                <div className="w-full py-8 flex flex-col items-center group-hover:items-start gap-5 text-primary/20">
                                    <div className="w-12 flex justify-center">
                                        <History className="w-8 h-8 opacity-40" />
                                    </div>
                                    <div className="flex flex-col">
                                        <div className="flex gap-1">
                                            <div className="w-1 h-1 rounded-full bg-primary/40" />
                                            <div className="w-2 h-1 rounded-full bg-white/5" />
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Bottom: User Profile HUD Component */}
                    <div className="w-full px-3 group-hover:px-6 pt-8 mt-auto border-t border-white/[0.03] bg-gradient-to-t from-black to-transparent">
                        <div className="w-full group/user relative">
                            <div
                                onClick={() => setIsMenuOpen(!isMenuOpen)}
                                className="flex items-center justify-center group-hover:justify-start gap-4 h-16 rounded-2xl hover:bg-white/[0.03] transition-all duration-500 relative overflow-hidden cursor-pointer"
                            >
                                <div className="relative flex-shrink-0">
                                    {/* Scan Ring */}
                                    <div className="absolute -inset-2 border border-primary/0 group-hover/user:border-primary/20 rounded-full animate-[spin_4s_linear_infinite] transition-all" />
                                    <div className="relative w-11 h-11 rounded-full border-2 border-white/5 bg-[#0a0a0a] overflow-hidden flex items-center justify-center shadow-2xl group-hover/user:border-primary/40 transition-all ring-offset-2 ring-offset-black group-hover/user:ring-1 ring-primary/20">
                                        {session?.user?.image ? (
                                            <img src={session.user.image} alt="Avatar" className="w-full h-full object-cover grayscale group-hover/user:grayscale-0 transition-all" />
                                        ) : (
                                            <User className="w-6 h-6 text-gray-500 group-hover/user:text-primary transition-colors" />
                                        )}
                                    </div>
                                    <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-primary rounded-full border-2 border-black shadow-[0_0_10px_#00ff66]" />
                                </div>
                                {!isSidebarCollapsed && (
                                    <motion.div
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        className="transition-all duration-700 flex-1 overflow-hidden text-left"
                                    >
                                        <p className="text-[11px] font-black uppercase tracking-widest text-white truncate leading-none mb-1">
                                            {session?.user?.name || "Neural Ghost"}
                                        </p>
                                        <div className="flex items-center gap-2">
                                            <div className="flex gap-0.5">
                                                {[1, 2, 3].map(i => <div key={i} className="w-[2px] h-[2px] bg-primary/40 rounded-full" />)}
                                            </div>
                                        </div>
                                    </motion.div>
                                )}
                            </div>

                            {/* Menu Overlay: HUD Style */}
                            <AnimatePresence>
                                {isMenuOpen && (
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.95, y: 10, x: 20 }}
                                        animate={{ opacity: 1, scale: 1, y: 0, x: 0 }}
                                        exit={{ opacity: 0, scale: 0.95, y: 10, x: 20 }}
                                        className="absolute bottom-20 left-0 w-64 bg-black/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.8)] overflow-hidden z-[60] p-1.5"
                                    >
                                        <div className="px-4 py-2 mb-2 border-b border-white/5">
                                            <p className="text-[8px] font-black text-gray-500 uppercase tracking-[0.2em]">System Commands</p>
                                        </div>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setIsMenuOpen(false);
                                                setIsSettingsOpen(true);
                                            }}
                                            className="w-full flex items-center gap-4 px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-gray-400 hover:text-white hover:bg-white/5 transition-all rounded-xl group/cmd"
                                        >
                                            <Settings className="w-4 h-4 group-hover/cmd:rotate-90 transition-transform" />
                                            Core Settings
                                        </button>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                signOut();
                                            }}
                                            className="w-full flex items-center gap-4 px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-red-500/70 hover:text-red-400 hover:bg-red-500/10 transition-all rounded-xl"
                                        >
                                            <LogOut className="w-4 h-4" />
                                            Terminate Session
                                        </button>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>
                </div>
            </motion.div>


            <div className="flex-1 flex flex-col items-center relative overflow-hidden ml-20">
                {/* Navbar removed as per request */}

                {/* Dynamic Background */}
                <div className="absolute inset-0 z-0">
                    <LightRays
                        raysOrigin="top-center"
                        raysColor="#00ff66"
                        raysSpeed={1.2}
                        lightSpread={0.6}
                        rayLength={1.5}
                        followMouse={true}
                        mouseInfluence={0.05}
                        noiseAmount={0.05}
                        distortion={0.03}
                    />
                </div>

                {/* Content Area */}
                <div className="relative z-10 w-full h-full flex flex-col items-center justify-center px-6">
                    <AnimatePresence mode="wait">
                        {!isChatting ? (
                            <motion.div
                                key="welcome"
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, y: -50 }}
                                className="flex flex-col items-center text-center max-w-4xl"
                            >
                                <h1 className="text-2xl md:text-3xl lg:text-4xl font-black mb-10 tracking-tight leading-tight uppercase text-white/90">
                                    {headline === "Dominance Through Neural Intelligence" ? (
                                        <>
                                            <span className="text-primary">Dominance</span> Through Neural Intelligence
                                        </>
                                    ) : headline === "Scale Your Empire With Apex Logic" ? (
                                        <>
                                            Scale Your <span className="text-primary">Empire</span> With Apex Logic
                                        </>
                                    ) : headline === "Architecting the Future of Global Trade" ? (
                                        <>
                                            Architecting the <span className="text-primary">Future</span> of Global Trade
                                        </>
                                    ) : headline === "Unleashing Superior Strategic Vision" ? (
                                        <>
                                            Unleashing Superior <span className="text-primary">Strategic</span> Vision
                                        </>
                                    ) : headline === "Precision Engineering for Every System" ? (
                                        <>
                                            Precision <span className="text-primary">Engineering</span> for Every System
                                        </>
                                    ) : (
                                        headline
                                    )}
                                </h1>
                            </motion.div>
                        ) : (
                            <motion.div
                                key="chat-history"
                                initial={{ opacity: 0, y: 50 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="w-full max-w-[95%] flex-1 mt-20 mb-32 overflow-y-auto scrollbar-hide p-6 space-y-10"
                                style={{
                                    scrollbarWidth: 'none',
                                    msOverflowStyle: 'none'
                                }}
                            >
                                {messages.map((msg, i) => (
                                    <motion.div
                                        key={i}
                                        initial={{ opacity: 0, x: msg.role === 'user' ? 20 : -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        className={`flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
                                    >
                                        <div className={`w-9 h-9 rounded-lg flex-shrink-0 flex items-center justify-center border transition-all overflow-hidden ${msg.role === 'ai' ? 'bg-[#0a0a0a] border-primary/30' : 'bg-[#0a0a0a] border-white/10'}`}>
                                            {msg.role === 'ai' ? (
                                                <img src="/ai-avatar.png" alt="AI" className="w-full h-full object-cover" />
                                            ) : (
                                                session?.user?.image ? (
                                                    <img src={session.user.image} alt="User" className="w-full h-full object-cover" />
                                                ) : (
                                                    <User className="w-4 h-4 text-white" />
                                                )
                                            )}
                                        </div>
                                        <div className={`p-5 rounded-3xl border leading-[1.8] text-[14px] md:text-[15px] max-w-[92%] relative group/msg shadow-2xl ${msg.role === 'ai' ? 'bg-white/[0.03] border-white/10 text-gray-300 rounded-tl-none' : 'bg-primary/10 border-primary/20 text-white rounded-tr-none'}`}>
                                            <FormattedMessage content={msg.content} />

                                            {/* Action Buttons */}
                                            <div className={`absolute -bottom-6 flex gap-2 transition-opacity duration-300 opacity-0 group-hover/msg:opacity-100 ${msg.role === 'user' ? 'left-0' : 'right-0'}`}>
                                                {msg.role === 'ai' ? (
                                                    <button
                                                        onClick={() => copyToClipboard(msg.content)}
                                                        className="p-1 hover:text-primary transition-colors text-gray-500"
                                                        title="Copy message"
                                                    >
                                                        <Copy className="w-3 h-3" />
                                                    </button>
                                                ) : (
                                                    <div className="flex gap-2">
                                                        <button
                                                            onClick={() => copyToClipboard(msg.content)}
                                                            className="p-1 hover:text-primary transition-colors text-gray-500"
                                                            title="Copy message"
                                                        >
                                                            <Copy className="w-3 h-3" />
                                                        </button>
                                                        <button
                                                            onClick={() => revertMessage(i)}
                                                            className="p-1 hover:text-primary transition-colors text-gray-500"
                                                            title="Revert and Edit"
                                                        >
                                                            <RotateCcw className="w-3 h-3" />
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                                {isLoading && (
                                    <motion.div
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className="flex gap-4"
                                    >
                                        <div className="w-9 h-9 rounded-lg flex-shrink-0 flex items-center justify-center border bg-[#0a0a0a] border-primary/30 animate-pulse overflow-hidden">
                                            <img src="/ai-avatar.png" alt="AI" className="w-full h-full object-cover" />
                                        </div>
                                        <div className="p-4 rounded-2xl border bg-white/5 border-white/10 text-gray-500 rounded-tl-none italic text-[12px]">
                                            SYNAPSE AI is thinking...
                                        </div>
                                    </motion.div>
                                )}
                                <div ref={chatEndRef} />
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Animated Chat Box */}
                    <div className={`w-full max-w-2xl group transition-all duration-700 ${isChatting ? 'absolute bottom-8' : 'relative'}`}>
                        <form onSubmit={handleSend} className="relative">
                            <div className="absolute -inset-1 bg-white/10 rounded-[2rem] blur-xl opacity-0 group-focus-within:opacity-100 transition-opacity duration-500" />
                            <div className="relative bg-white rounded-full flex items-center p-1.5 shadow-2xl transition-all duration-300">
                                <input
                                    type="text"
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    disabled={isLoading}
                                    placeholder={isLoading ? "Please wait..." : placeholder}
                                    className="flex-1 bg-transparent px-6 py-3 text-black text-base focus:outline-none placeholder:text-gray-400 font-medium disabled:opacity-50"
                                />
                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="w-10 h-10 rounded-full bg-black flex items-center justify-center group-hover:scale-105 transition-transform duration-300 disabled:opacity-50"
                                >
                                    <ArrowRight className="text-white w-5 h-5" />
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>

            {/* Subtle Gradient Glows */}
            <div className="absolute top-1/4 -left-1/4 w-96 h-96 bg-primary/10 blur-[120px] rounded-full pointer-events-none" />
            <div className="absolute bottom-1/4 -right-1/4 w-96 h-96 bg-purple-600/10 blur-[120px] rounded-full pointer-events-none" />
            {/* Settings Modal Overlay */}
            <AnimatePresence>
                {isSettingsOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/80 backdrop-blur-md"
                        onClick={() => setIsSettingsOpen(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            onClick={(e) => e.stopPropagation()}
                            className="w-full max-w-2xl bg-[#0a0a0a] border border-white/10 rounded-3xl overflow-hidden shadow-[0_0_100px_rgba(0,255,102,0.1)] relative"
                        >
                            {/* Modal Header */}
                            <div className="px-8 py-6 border-b border-white/10 flex items-center justify-between bg-gradient-to-r from-primary/5 to-transparent">
                                <div>
                                    <h3 className="text-xl font-black uppercase tracking-[0.2em] text-white">Core Settings</h3>
                                    <p className="text-[10px] font-bold text-primary/60 tracking-widest uppercase mt-1">System Configuration v4.0</p>
                                </div>
                                <button
                                    onClick={() => setIsSettingsOpen(false)}
                                    className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 transition-all border border-white/10"
                                >
                                    <Plus className="w-5 h-5 text-white rotate-45" />
                                </button>
                            </div>

                            {/* Modal Content */}
                            <div className="p-8 space-y-8">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    {/* AI Persona Selection */}
                                    <div className="space-y-4">
                                        <h4 className="text-[12px] font-black uppercase tracking-widest text-gray-400">Neutral Processor</h4>
                                        <button
                                            onClick={() => setSettings(prev => ({ ...prev, persona: prev.persona === 'business' ? 'technical' : 'business' }))}
                                            className="w-full text-left p-4 rounded-2xl bg-white/[0.02] border border-white/5 hover:bg-white/5 transition-all space-y-3 group/opt"
                                        >
                                            <div className="flex items-center justify-between">
                                                <span className="text-[11px] font-bold text-white uppercase tracking-tighter">
                                                    {settings.persona === 'business' ? 'Business Intelligence' : 'Technical Analysis'}
                                                </span>
                                                <div className={`w-8 h-4 rounded-full relative border transition-all ${settings.persona === 'business' ? 'bg-primary/20 border-primary/30' : 'bg-blue-500/20 border-blue-500/30'}`}>
                                                    <div className={`absolute top-0.5 w-2.5 h-2.5 rounded-full shadow-lg transition-all ${settings.persona === 'business' ? 'right-0.5 bg-primary shadow-[#00ff66]' : 'left-0.5 bg-blue-500 shadow-blue-500'}`} />
                                                </div>
                                            </div>
                                            <p className="text-[9px] text-gray-500 leading-relaxed italic group-hover/opt:text-gray-400 transition-colors">
                                                {settings.persona === 'business' ? 'Currently optimized for high-stakes corporate strategy and world-class deals.' : 'Switched to technical mode for deep code and engineering analysis.'}
                                            </p>
                                        </button>
                                    </div>

                                    {/* Security Protocols */}
                                    <div className="space-y-4">
                                        <h4 className="text-[12px] font-black uppercase tracking-widest text-gray-400">Security Layer</h4>
                                        <button
                                            onClick={() => setSettings(prev => ({ ...prev, encryption: !prev.encryption }))}
                                            className="w-full text-left p-4 rounded-2xl bg-white/[0.02] border border-white/5 hover:bg-white/5 transition-all space-y-3 group/opt"
                                        >
                                            <div className="flex items-center justify-between">
                                                <span className="text-[11px] font-bold text-white uppercase tracking-tighter">AES-256 Encryption</span>
                                                <div className={`w-8 h-4 rounded-full relative border transition-all ${settings.encryption ? 'bg-primary/20 border-primary/30' : 'bg-red-500/20 border-red-500/30'}`}>
                                                    <div className={`absolute top-0.5 w-2.5 h-2.5 rounded-full shadow-lg transition-all ${settings.encryption ? 'right-0.5 bg-primary shadow-[#00ff66]' : 'left-0.5 bg-red-500 shadow-red-500'}`} />
                                                </div>
                                            </div>
                                            <p className="text-[9px] text-gray-500 leading-relaxed group-hover/opt:text-gray-400 transition-colors">
                                                {settings.encryption ? 'All transmissions are encrypted via multi-layered quantum-safe protocols.' : 'Encryption disabled. Warning: Transmission is now visible in the neural clear-net.'}
                                            </p>
                                        </button>
                                    </div>

                                    {/* Token/Prompt Management */}
                                    <div className="space-y-4">
                                        <h4 className="text-[12px] font-black uppercase tracking-widest text-gray-400">Quota Allocation</h4>
                                        <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 space-y-4">
                                            <div className="justify-between items-end flex">
                                                <div className="space-y-1">
                                                    <span className="text-[11px] font-bold text-white uppercase tracking-tighter block">Free Tier Quota</span>
                                                    <p className="text-[8px] text-gray-500 uppercase tracking-widest">Resets in 22:14:05</p>
                                                </div>
                                                <span className="text-[14px] font-black text-primary tracking-tighter">{promptsRemaining} <span className="text-[8px] text-gray-500">/ 50 PROMPTS</span></span>
                                            </div>
                                            <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                                                <motion.div
                                                    initial={{ width: 0 }}
                                                    animate={{ width: `${(promptsRemaining / 50) * 100}%` }}
                                                    className="h-full bg-gradient-to-r from-primary to-primary/50 shadow-[0_0_10px_#00ff66]"
                                                />
                                            </div>
                                            <Link href="/premium" className="w-full flex items-center justify-center py-2 bg-primary/10 hover:bg-primary/20 border border-primary/30 rounded-lg text-[9px] font-black text-primary uppercase tracking-[0.2em] transition-all">
                                                Unlock Unlimited Access
                                            </Link>
                                        </div>
                                    </div>

                                    {/* User Profile Setting */}
                                    <div className="space-y-4">
                                        <h4 className="text-[12px] font-black uppercase tracking-widest text-gray-400">User Identification</h4>
                                        <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 flex items-center justify-between group/user">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 rounded-full border border-white/10 overflow-hidden bg-black relative">
                                                    {session?.user?.image ? (
                                                        <img src={session.user.image} alt="Profile" className="w-full h-full object-cover" />
                                                    ) : (
                                                        <User className="w-6 h-6 text-gray-600 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                                                    )}
                                                </div>
                                                <div>
                                                    <p className="text-[12px] font-black text-white uppercase tracking-widest">{session?.user?.name || "Anonymous User"}</p>
                                                    <p className="text-[9px] font-bold text-gray-500 uppercase tracking-widest">{session?.user?.email || "No email linked"}</p>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => {
                                                    // Add sign out logic here if needed
                                                    setIsSettingsOpen(false);
                                                }}
                                                className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center hover:bg-red-500/20 transition-all text-red-500"
                                            >
                                                <LogOut className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>

                                </div>

                                {/* Footer Note */}
                                <div className="pt-6 border-t border-white/5 flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <div className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse shadow-[0_0_5px_#00ff66]" />
                                        <span className="text-[9px] font-bold text-gray-500 uppercase tracking-[0.2em]">All Systems Nominal</span>
                                    </div>
                                    <button
                                        onClick={() => setIsSettingsOpen(false)}
                                        className="px-6 py-2.5 rounded-full bg-white/5 hover:bg-white/10 transition-all border border-white/10 text-[10px] font-black uppercase tracking-[0.2em] text-white"
                                    >
                                        Close Configuration
                                    </button>
                                </div>
                            </div>

                            {/* Decorative Elements */}
                            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 blur-[50px] -z-10" />
                            <div className="absolute bottom-0 left-0 w-32 h-32 bg-primary/5 blur-[50px] -z-10" />
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Upgrade Modal */}
            <AnimatePresence>
                {isUpgradeModalOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[110] flex items-center justify-center p-6 bg-black/90 backdrop-blur-xl"
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            className="w-full max-w-lg bg-[#0a0a0a] border border-primary/20 rounded-3xl p-10 text-center relative overflow-hidden shadow-[0_0_100px_rgba(0,255,102,0.1)]"
                        >
                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary to-transparent animate-pulse" />

                            <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-8 border border-primary/20">
                                <Bot className="w-10 h-10 text-primary" />
                            </div>

                            <h2 className="text-3xl font-black text-white uppercase tracking-tighter mb-4">Quota Exhausted</h2>
                            <p className="text-gray-400 text-sm mb-8 leading-relaxed px-4">
                                You&apos;ve reached the limit for the <span className="text-primary font-bold">Neural Free Tier</span>.
                                Upgrade to <span className="text-primary font-bold">SYNAPSE PRO</span> to unlock unlimited neural bandwidth and apex processing.
                            </p>

                            <div className="flex flex-col gap-4">
                                <Link
                                    href="/premium"
                                    className="w-full py-4 bg-primary text-black font-black uppercase tracking-widest rounded-xl hover:bg-white transition-all shadow-[0_0_30px_rgba(0,255,102,0.3)]"
                                >
                                    Unlock Unlimited Access
                                </Link>
                                <button
                                    onClick={() => setIsUpgradeModalOpen(false)}
                                    className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.3em] hover:text-white transition-colors"
                                >
                                    Dismiss Transmission
                                </button>
                            </div>

                            {/* Decorative background glow */}
                            <div className="absolute -bottom-20 -right-20 w-40 h-40 bg-primary/10 blur-[60px] rounded-full" />
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </main >
    );
}

// Simple Markdown-style and link formatter
function FormattedMessage({ content }: { content: string }) {
    // Basic bolding and bullet point scaling
    const formatted = content
        .replace(/\*\*(.*?)\*\*/g, '<strong class="text-white font-black">$1</strong>')
        .replace(/^\d\.\s/gm, '<br/><strong>$&</strong>')
        .replace(/^[\-\*]\s/gm, '<br/>• ');

    return <div className="whitespace-pre-wrap break-words" dangerouslySetInnerHTML={{ __html: formatted }} />;
}
