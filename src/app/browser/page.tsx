"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Search,
    ArrowLeft,
    ArrowRight,
    RotateCcw,
    Plus,
    X,
    Bookmark,
    History,
    Download,
    Settings,
    Shield,
    Bot,
    Mic,
    MoreVertical,
    Star,
    Home,
    Ghost,
    Trash2,
    Image as ImageIcon,
    List
} from "lucide-react";

import Link from "next/link";
import { cn } from "@/lib/utils";
import { synapseAI, SearchSuggestion, SearchResponse } from "@/lib/synapse";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface Tab {
    id: string;
    title: string;
    url: string;
    favicon?: string;
    searchResponse?: SearchResponse;
    activeSearchSection?: 'ai' | 'images' | 'links';
}

export default function BrowserPage() {
    const [tabs, setTabs] = useState<Tab[]>([
        { id: '1', title: 'New Tab', url: 'about:blank' }
    ]);
    const [activeTabId, setActiveTabId] = useState('1');
    const [input, setInput] = useState("");
    const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
    const [isDarkMode, setIsDarkMode] = useState(true);
    const [isPrivateMode, setIsPrivateMode] = useState(false);
    const [isMounted, setIsMounted] = useState(false);
    const [isSearching, setIsSearching] = useState(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [isControlsVisible, setIsControlsVisible] = useState(true);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [history, setHistory] = useState<string[]>([]);
    const [bookmarks, setBookmarks] = useState<string[]>([]);

    useEffect(() => {
        setIsMounted(true);
        const savedHistory = localStorage.getItem('omni_history');
        const savedBookmarks = localStorage.getItem('omni_bookmarks');
        if (savedHistory) setHistory(JSON.parse(savedHistory));
        if (savedBookmarks) setBookmarks(JSON.parse(savedBookmarks));
    }, []);

    const activeTab = tabs.find(t => t.id === activeTabId) || tabs[0];

    const handleNavigate = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        if (!input.trim()) return;

        let url = input.trim();
        const isUrl = url.includes('.') && !url.includes(' ');

        if (isUrl) {
            if (!url.startsWith('http')) {
                url = 'https://' + url;
            }
            updateTab(activeTabId, { url, title: url, searchResponse: undefined });
        } else {
            setIsSearching(true);
            updateTab(activeTabId, { url: 'omni://search', title: `Search: ${url}`, activeSearchSection: 'ai' });
            try {
                const response = await synapseAI.performSearch(url);
                updateTab(activeTabId, { searchResponse: response });
                setHistory(prev => {
                    const newHistory = [url, ...prev].slice(0, 50);
                    localStorage.setItem('omni_history', JSON.stringify(newHistory));
                    return newHistory;
                });
            } catch (error) {
                console.error('Search failed:', error);
            } finally {
                setIsSearching(false);
            }
        }
        setInput("");
        setSuggestions([]);
    };

    const updateTab = (id: string, updates: Partial<Tab>) => {
        setTabs(tabs.map(t => t.id === id ? { ...t, ...updates } : t));
    };

    const addTab = () => {
        const newId = Math.random().toString(36).substr(2, 9);
        const newTab: Tab = { id: newId, title: 'New Tab', url: 'about:blank' };
        setTabs([...tabs, newTab]);
        setActiveTabId(newId);
    };

    const closeTab = (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        if (tabs.length === 1) return;
        const newTabs = tabs.filter(t => t.id !== id);
        setTabs(newTabs);
        if (activeTabId === id) {
            setActiveTabId(newTabs[newTabs.length - 1].id);
        }
    };

    const saveBookmark = (url: string) => {
        setBookmarks(prev => {
            const newBookmarks = prev.includes(url) ? prev.filter(b => b !== url) : [...prev, url];
            localStorage.setItem('omni_bookmarks', JSON.stringify(newBookmarks));
            return newBookmarks;
        });
    };

    useEffect(() => {
        if (input.trim()) {
            synapseAI.getSuggestions(input).then(setSuggestions);
        } else {
            setSuggestions([]);
        }
    }, [input]);

    if (!isMounted) return (
        <div className="h-screen w-full bg-black flex items-center justify-center">
            <div className="text-primary font-black uppercase tracking-[0.5em] animate-pulse">Initializing Neural Link...</div>
        </div>
    );

    return (
        <div className={cn(
            "h-screen w-full flex overflow-hidden transition-colors duration-500",
            isDarkMode ? "bg-[#050505] text-white" : "bg-gray-50 text-black"
        )}>
            {/* Neural Sidebar: Left Vertical Tabs */}
            <motion.div
                initial={false}
                animate={{ width: isSidebarOpen ? 240 : 80 }}
                className={cn(
                    "h-full border-r relative z-[60] flex flex-col py-6 gap-6 transition-all duration-500 overflow-hidden backdrop-blur-3xl",
                    isDarkMode ? "bg-black/40 border-white/5 shadow-2xl" : "bg-white/40 border-gray-200"
                )}
            >
                <div className={cn("flex items-center gap-3 px-4 mb-4", isSidebarOpen ? "justify-start" : "justify-center")}>
                    <Link href="/">
                        <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-primary/20 to-transparent flex items-center justify-center border border-primary/20 hover:scale-110 transition-transform flex-shrink-0">
                            <img src="/synapse-logo.png" alt="OMNI" className="w-6 h-6 object-contain drop-shadow-[0_0_8px_rgba(0,255,102,0.4)]" />
                        </div>
                    </Link>
                    {isSidebarOpen && (
                        <motion.span
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="font-black tracking-[0.2em] text-sm text-primary uppercase whitespace-nowrap"
                        >
                            OMNI Browser
                        </motion.span>
                    )}
                </div>

                <div className="flex-1 flex flex-col gap-2 overflow-y-auto scrollbar-hide px-3 py-2">
                    {tabs.map((tab) => (
                        <div
                            key={tab.id}
                            onClick={() => setActiveTabId(tab.id)}
                            className={cn(
                                "h-12 rounded-2xl flex items-center cursor-pointer transition-all duration-500 group relative flex-shrink-0 overflow-hidden",
                                isSidebarOpen ? "px-3 gap-3 w-full" : "w-12 justify-center",
                                activeTabId === tab.id
                                    ? (isDarkMode ? "bg-primary/10 text-primary border border-primary/30" : "bg-primary text-white shadow-lg shadow-primary/20")
                                    : (isDarkMode ? "bg-white/5 text-gray-500 hover:bg-white/10 hover:text-white" : "bg-gray-100 text-gray-500 hover:bg-gray-200 hover:text-black")
                            )}
                        >
                            <Search size={20} className={cn("transition-transform flex-shrink-0", (activeTabId === tab.id && !isSidebarOpen) ? "scale-110" : "")} />

                            {isSidebarOpen && (
                                <motion.span
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="text-xs font-bold truncate tracking-wide"
                                >
                                    {tab.title || "New Tab"}
                                </motion.span>
                            )}

                            <AnimatePresence>
                                {activeTabId === tab.id && !isSidebarOpen && (
                                    <motion.div
                                        layoutId="sidebar-active-dot"
                                        className="absolute -right-3 w-1 h-6 bg-primary rounded-full shadow-[0_0_15px_#00ff66]"
                                    />
                                )}
                            </AnimatePresence>

                            {isSidebarOpen && activeTabId === tab.id && (
                                <button
                                    onClick={(e) => closeTab(tab.id, e)}
                                    className="ml-auto p-1 hover:bg-white/10 rounded-full"
                                >
                                    <X size={14} />
                                </button>
                            )}
                        </div>
                    ))}
                    <button
                        onClick={addTab}
                        className={cn(
                            "h-12 rounded-2xl border border-dashed border-white/10 flex items-center justify-center text-gray-500 hover:border-primary/50 hover:text-primary transition-all duration-300 flex-shrink-0",
                            isSidebarOpen ? "w-full gap-2" : "w-12"
                        )}
                    >
                        <Plus size={20} />
                        {isSidebarOpen && <span className="text-xs font-bold uppercase tracking-wider">New Tab</span>}
                    </button>
                </div>

                <div className={cn("mt-auto flex flex-col gap-4 px-3", isSidebarOpen ? "w-full" : "items-center")}>
                    <button
                        onClick={() => setIsSettingsOpen(!isSettingsOpen)}
                        className={cn(
                            "h-10 rounded-xl bg-white/5 flex items-center text-gray-500 hover:bg-white/10 hover:text-white transition-all overflow-hidden",
                            isSidebarOpen ? "w-full px-3 gap-3" : "w-10 justify-center"
                        )}
                    >
                        <Settings size={18} className="flex-shrink-0" />
                        {isSidebarOpen && <span className="text-xs font-bold uppercase tracking-wider">Config</span>}
                    </button>
                    <button
                        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                        className={cn(
                            "h-10 rounded-xl bg-white/5 flex items-center justify-center text-gray-500 hover:bg-white/10 hover:text-white transition-all",
                            isSidebarOpen ? "w-full" : "w-10",
                            !isSidebarOpen && "transform rotate-90 md:rotate-0"
                        )}
                    >
                        {isSidebarOpen ? <ArrowLeft size={18} /> : <List size={18} />}
                    </button>
                </div>
            </motion.div>

            {/* Settings Modal */}
            <AnimatePresence>
                {isSettingsOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 z-[100] bg-black/60 backdrop-blur-md flex items-center justify-center p-8"
                        onClick={() => setIsSettingsOpen(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.9, y: 20 }}
                            className={cn(
                                "w-full max-w-2xl rounded-[2.5rem] p-12 relative overflow-hidden",
                                isDarkMode ? "bg-[#0a0a0a] border border-white/10 shadow-2xl" : "bg-white shadow-xl"
                            )}
                            onClick={e => e.stopPropagation()}
                        >
                            <div className="absolute top-0 right-0 p-8">
                                <button
                                    onClick={() => setIsSettingsOpen(false)}
                                    className="p-2 rounded-full hover:bg-white/10 transition-all text-gray-500 hover:text-white"
                                >
                                    <X size={24} />
                                </button>
                            </div>

                            <h2 className="text-3xl font-black uppercase tracking-tighter mb-2 text-white">Neural Configuration</h2>
                            <p className="text-primary font-bold uppercase tracking-widest text-xs mb-12">System Parameters & Preferences</p>

                            <div className="grid grid-cols-2 gap-8">
                                <div className="space-y-6">
                                    <h3 className="text-sm font-black uppercase tracking-widest text-gray-500 border-b border-white/10 pb-2">Appearance</h3>
                                    <div className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/5">
                                        <span className="font-bold text-gray-300">Flux Theme</span>
                                        <button
                                            onClick={() => setIsDarkMode(!isDarkMode)}
                                            className="px-4 py-2 rounded-xl bg-primary/20 text-primary text-xs font-black uppercase"
                                        >
                                            {isDarkMode ? "Dark Mode" : "Light Mode"}
                                        </button>
                                    </div>
                                    <div className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/5">
                                        <span className="font-bold text-gray-300">Interface Scale</span>
                                        <div className="flex gap-1">
                                            {[1, 2, 3].map(i => <div key={i} className="w-2 h-6 bg-white/20 rounded-full" />)}
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-6">
                                    <h3 className="text-sm font-black uppercase tracking-widest text-gray-500 border-b border-white/10 pb-2">Data & Privacy</h3>
                                    <div className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/5">
                                        <span className="font-bold text-gray-300">History</span>
                                        <button
                                            onClick={() => { setHistory([]); localStorage.removeItem('omni_history'); }}
                                            className="px-4 py-2 rounded-xl bg-red-500/20 text-red-400 text-xs font-black uppercase hover:bg-red-500/30 transition-colors"
                                        >
                                            Purge
                                        </button>
                                    </div>
                                    <div className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/5">
                                        <span className="font-bold text-gray-300">Neural Cache</span>
                                        <span className="text-xs font-mono text-primary">14.2 MB</span>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-12 pt-8 border-t border-white/5 flex justify-between items-center">
                                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-600">OMNI OS v4.0.2 // Build 742</span>
                                <div className="flex gap-2">
                                    <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                                    <span className="text-[10px] font-bold text-primary uppercase">System Nominal</span>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Main Center Area */}
            <div className="flex-1 flex flex-col relative overflow-hidden h-full">
                {/* Floating Command Hub: Top Center */}
                <motion.div
                    initial={{ y: -100 }}
                    animate={{ y: isControlsVisible ? 24 : -100 }}
                    className="absolute top-0 left-1/2 -translate-x-1/2 z-50 pointer-events-none"
                >
                    <div className={cn(
                        "flex items-center gap-2 p-1.5 rounded-full border shadow-2xl backdrop-blur-3xl pointer-events-auto transition-all duration-500 group",
                        isDarkMode ? "bg-black/60 border-white/10 hover:border-primary/40" : "bg-white/80 border-gray-200"
                    )}>
                        <div className="flex items-center bg-white/5 rounded-full p-1 gap-1">
                            <button onClick={() => window.history.back()} className="p-2 hover:bg-white/10 rounded-full text-gray-400 hover:text-primary transition-colors cursor-pointer">
                                <ArrowLeft size={16} />
                            </button>
                            <button onClick={() => window.history.forward()} className="p-2 hover:bg-white/10 rounded-full text-gray-400 hover:text-primary transition-colors cursor-pointer">
                                <ArrowRight size={16} />
                            </button>
                            <button onClick={() => window.location.reload()} className="p-2 hover:bg-white/10 rounded-full text-gray-400 hover:text-primary transition-colors cursor-pointer">
                                <RotateCcw size={16} />
                            </button>
                        </div>

                        <div className="px-6 py-2 flex items-center gap-3 border-x border-white/10">
                            <Shield className={cn("w-3.5 h-3.5", isPrivateMode ? "text-purple-400" : "text-primary")} />
                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">
                                {activeTab.url === 'about:blank' ? 'Neural Blank' : (activeTab.url === 'omni://search' ? 'OMNI Search' : new URL(activeTab.url).hostname)}
                            </span>
                        </div>

                        <div className="flex items-center gap-1 pr-2">
                            <button onClick={() => updateTab(activeTabId, { url: 'about:blank', title: 'New Tab', searchResponse: undefined })} className="p-2 hover:bg-white/10 rounded-full text-gray-400 hover:text-white transition-colors">
                                <Home size={16} />
                            </button>
                            <button onClick={() => setIsPrivateMode(!isPrivateMode)} className={cn("p-2 rounded-full transition-all", isPrivateMode ? "bg-purple-500/20 text-purple-400" : "text-gray-400 hover:text-white")}>
                                <Ghost size={16} />
                            </button>
                        </div>
                    </div>
                </motion.div>

                {/* Main Viewport Container */}
                <div className="flex-1 relative flex flex-col pt-12 overflow-hidden">
                    <div className="flex-1 bg-white relative overflow-hidden">
                        {activeTab.url === 'about:blank' ? (
                            <div className={cn(
                                "absolute inset-0 flex flex-col items-center justify-center p-6 text-center space-y-8 transition-colors duration-500",
                                isDarkMode ? "bg-[#050505]" : "bg-white"
                            )}>
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ duration: 0.8, ease: "easeOut" }}
                                    className="relative z-10"
                                >
                                    <div className="absolute -inset-32 bg-primary/20 blur-[120px] rounded-full animate-pulse opacity-40 mix-blend-screen" />
                                    <div className="relative flex flex-col items-center">
                                        <div className="w-40 h-40 rounded-[3rem] bg-gradient-to-b from-[#1a1a1a] to-black border border-white/10 flex items-center justify-center shadow-[0_0_80px_rgba(0,255,102,0.15)] mb-10 group overflow-hidden relative">
                                            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(0,255,102,0.1),transparent_70%)] animate-pulse" />
                                            <img src="/synapse-logo.png" className="w-20 h-20 object-contain drop-shadow-[0_0_25px_rgba(0,255,102,0.8)] group-hover:scale-110 transition-transform duration-700 relative z-10" alt="OMNI" />

                                            {/* Scanning Line Effect */}
                                            <div className="absolute top-0 left-0 w-full h-[2px] bg-primary/50 shadow-[0_0_10px_#00ff66] animate-[scan_3s_linear_infinite] opacity-50" />
                                        </div>

                                        <h1 className={cn(
                                            "text-5xl font-black tracking-tighter mb-4 select-none",
                                            isDarkMode ? "text-white drop-shadow-[0_0_30px_rgba(0,255,102,0.2)]" : "text-black"
                                        )}>OMNI <span className="text-primary">Browser Brain</span></h1>

                                        <div className="flex items-center gap-3 opacity-60">
                                            <div className="h-[1px] w-8 bg-primary/50" />
                                            <p className="text-primary font-bold uppercase tracking-[0.4em] text-[10px]">Quantum-Secured • OMNI OS v4.0</p>
                                            <div className="h-[1px] w-8 bg-primary/50" />
                                        </div>
                                    </div>
                                </motion.div>
                            </div>
                        ) : activeTab.url === 'omni://search' ? (
                            <div className={cn(
                                "absolute inset-0 overflow-y-auto transition-colors duration-500",
                                isDarkMode ? "bg-[#050505]" : "bg-white"
                            )}>
                                <div className="max-w-4xl mx-auto px-8 py-16 space-y-12">
                                    <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-white/[0.03] border border-white/5 w-fit">
                                        {[
                                            { id: 'ai', label: 'AI Synthesis', icon: Bot },
                                            { id: 'images', label: 'Nodes (Images)', icon: ImageIcon },
                                            { id: 'links', label: 'Technical Links', icon: List },
                                        ].map((section) => (
                                            <button
                                                key={section.id}
                                                onClick={() => updateTab(activeTabId, { activeSearchSection: section.id as any })}
                                                className={cn(
                                                    "flex items-center gap-3 px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all duration-300",
                                                    activeTab.activeSearchSection === section.id
                                                        ? "bg-primary text-black shadow-[0_0_15px_rgba(0,255,102,0.3)]"
                                                        : (isDarkMode ? "text-gray-500 hover:text-white hover:bg-white/5" : "text-gray-500 hover:text-black hover:bg-black/5")
                                                )}
                                            >
                                                <section.icon size={14} />
                                                {section.label}
                                            </button>
                                        ))}
                                    </div>

                                    <AnimatePresence mode="wait">
                                        {isSearching ? (
                                            <motion.div
                                                key="loading"
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                exit={{ opacity: 0 }}
                                                className="flex flex-col items-center justify-center py-20 space-y-8 relative"
                                            >
                                                <div className="relative overflow-hidden p-2">
                                                    <div className="w-24 h-24 rounded-full border-2 border-primary border-t-transparent animate-spin relative z-10" />
                                                    <Bot className="absolute inset-0 m-auto w-10 h-10 text-primary animate-pulse z-10" />

                                                    {/* Scanning Line Effect */}
                                                    <div className="absolute top-0 left-0 w-full h-full border-x border-primary/20 rounded-full animate-pulse" />
                                                    <div className="absolute top-0 left-0 w-full h-[2px] bg-primary shadow-[0_0_15px_#00ff66] animate-[scan_1.5s_linear_infinite] opacity-80 z-0" />
                                                </div>
                                                <div className="space-y-2 text-center relative">
                                                    <div className="text-primary font-black uppercase tracking-[0.5em] text-sm animate-pulse">Neural Synthesis Active</div>
                                                    <div className="text-xs text-gray-500 font-bold uppercase tracking-widest">Decrypting Web Nodes • Validating Sources</div>

                                                    {/* Scanning Text Underscore */}
                                                    <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-3/4 h-[1px] bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
                                                </div>
                                            </motion.div>
                                        ) : activeTab.activeSearchSection === 'ai' ? (
                                            <motion.div
                                                key="ai-section"
                                                initial={{ opacity: 0, y: 20 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, y: -20 }}
                                                className="grid grid-cols-1 gap-8"
                                            >
                                                <div className={cn(
                                                    "p-10 rounded-[3rem] border transition-all relative overflow-hidden group decorated-grid",
                                                    isDarkMode ? "bg-white/[0.02] border-white/5 shadow-2xl" : "bg-gray-50 border-gray-100 shadow-xl"
                                                )}>
                                                    {/* Continuous Scan Effect */}
                                                    <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-primary/40 to-transparent shadow-[0_0_20px_#00ff66] animate-[scan_4s_linear_infinite] opacity-30 pointer-events-none z-10" />

                                                    <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
                                                        <Bot size={120} className="text-primary" />
                                                    </div>
                                                    <div className="flex items-center gap-6 mb-8">
                                                        <div className="w-20 h-20 rounded-2xl bg-black border border-white/10 flex items-center justify-center shadow-[0_0_30px_rgba(0,255,102,0.3)] overflow-hidden relative group-hover:scale-105 transition-transform duration-500">
                                                            <div className="absolute inset-0 bg-primary/20 animate-pulse mix-blend-overlay" />
                                                            <img src="/creator.png" className="w-full h-full object-cover" alt="Creator" />
                                                            <div className="absolute bottom-1 right-1 w-3 h-3 bg-primary rounded-full border-2 border-black animate-pulse" />
                                                        </div>
                                                        <div>
                                                            <div className="flex items-center gap-2 mb-1">
                                                                <div className="px-2 py-0.5 rounded-full bg-primary/10 border border-primary/20 text-[8px] font-black uppercase tracking-widest text-primary animate-pulse">Neural Signal Lock</div>
                                                            </div>
                                                            <h3 className={cn("text-xl font-black tracking-tight", isDarkMode ? "text-white" : "text-black")}>Creator Intelligence</h3>
                                                            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Identity Verified • OMNI Architecture</p>
                                                        </div>
                                                    </div>
                                                    <div className={cn(
                                                        "prose prose-sm max-w-none font-medium leading-[1.8] tracking-tight",
                                                        isDarkMode ? "prose-invert text-white/90" : "prose-slate text-slate-800"
                                                    )}>
                                                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                                            {activeTab.searchResponse?.aiResponse || ""}
                                                        </ReactMarkdown>
                                                    </div>
                                                    <div className="mt-12 pt-8 border-t border-white/5 flex items-center justify-between">
                                                        <div className="flex gap-2">
                                                            {['verified', 'encrypted', 'real-time'].map(tag => (
                                                                <span key={tag} className="px-3 py-1 rounded-full bg-white/5 text-[8px] font-black uppercase tracking-widest text-gray-500">{tag}</span>
                                                            ))}
                                                        </div>
                                                        <div className="flex items-center gap-4">
                                                            <div className="flex gap-1">
                                                                {[1, 2, 3, 4].map(i => <div key={i} className="w-1 h-3 bg-primary/20 rounded-full" />)}
                                                            </div>
                                                            <span className="text-[8px] font-black uppercase tracking-tight text-primary/60">Processing Layer v4.0</span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="grid md:grid-cols-2 gap-6">
                                                    <div className="p-8 rounded-[2.5rem] bg-primary/5 border border-primary/10 flex flex-col justify-between group hover:bg-primary/10 transition-all cursor-pointer">
                                                        <div className="space-y-4">
                                                            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                                                                <RotateCcw size={18} className="text-primary" />
                                                            </div>
                                                            <h4 className="text-sm font-black uppercase tracking-widest">Refine Analysis</h4>
                                                        </div>
                                                        <span className="text-[10px] text-primary/60 font-black uppercase mt-6 tracking-widest group-hover:translate-x-2 transition-transform inline-flex items-center gap-2">
                                                            Initiate_Recalibration <ArrowRight size={12} />
                                                        </span>
                                                    </div>
                                                    <div className="p-8 rounded-[2.5rem] bg-white/5 border border-white/5 flex flex-col justify-between group hover:bg-white/10 transition-all cursor-pointer">
                                                        <div className="space-y-4">
                                                            <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white">
                                                                <Download size={18} />
                                                            </div>
                                                            <h4 className="text-sm font-black uppercase tracking-widest">Archive Insight</h4>
                                                        </div>
                                                        <span className="text-[10px] text-gray-500 font-black uppercase mt-6 tracking-widest group-hover:translate-x-2 transition-transform inline-flex items-center gap-2">
                                                            Secure_Export <ArrowRight size={12} />
                                                        </span>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        ) : activeTab.activeSearchSection === 'images' ? (
                                            <motion.div
                                                key="images-section"
                                                initial={{ opacity: 0, scale: 0.95 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                exit={{ opacity: 0, scale: 0.95 }}
                                                className="grid grid-cols-1 md:grid-cols-2 gap-8"
                                            >
                                                {activeTab.searchResponse?.images.map((img, i) => (
                                                    <motion.div
                                                        key={i}
                                                        className={cn(
                                                            "group rounded-[2.5rem] overflow-hidden border transition-all duration-500 relative",
                                                            isDarkMode ? "bg-white/[0.02] border-white/5 hover:border-primary/50" : "bg-gray-100 border-gray-200 hover:border-primary"
                                                        )}
                                                    >
                                                        <div className="aspect-[16/10] overflow-hidden relative">
                                                            <img src={img.url} alt="" className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700 group-hover:scale-105" />
                                                            <div className="absolute top-4 left-4">
                                                                <div className="px-3 py-1.5 rounded-full bg-black/60 backdrop-blur-md border border-white/10 text-[8px] font-black text-primary uppercase tracking-[0.3em]">
                                                                    Node Image-0{i + 1}
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div className="p-6 space-y-2">
                                                            <h4 className={cn("text-sm font-black uppercase tracking-widest", isDarkMode ? "text-white" : "text-black")}>Visual Cryptograph {i + 1}</h4>
                                                            <p className="text-xs text-gray-500 font-medium leading-relaxed">{img.description}</p>
                                                        </div>
                                                    </motion.div>
                                                ))}
                                            </motion.div>
                                        ) : (
                                            <motion.div
                                                key="links-section"
                                                initial={{ opacity: 0, x: 20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                exit={{ opacity: 0, x: -20 }}
                                                className="grid gap-6 max-w-4xl"
                                            >
                                                {activeTab.searchResponse?.links.map((link, i) => (
                                                    <div
                                                        key={i}
                                                        onClick={() => updateTab(activeTabId, { url: link.url, title: link.title, searchResponse: undefined })}
                                                        className={cn(
                                                            "flex items-start gap-6 p-8 rounded-[2.5rem] border transition-all group cursor-pointer relative overflow-hidden",
                                                            isDarkMode ? "bg-white/[0.02] border-white/5 hover:border-primary/40 hover:bg-white/[0.04]" : "bg-gray-50 border-gray-100 hover:border-primary/40 hover:bg-white"
                                                        )}
                                                    >
                                                        <div className={cn(
                                                            "w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 transition-all duration-500",
                                                            isDarkMode ? "bg-white/5 group-hover:bg-primary/20" : "bg-white border border-gray-100 group-hover:border-primary/50 shadow-sm"
                                                        )}>
                                                            <img src={`https://www.google.com/s2/favicons?sz=64&domain=${new URL(link.url).hostname}`} alt="" className="w-6 h-6 rounded-md opacity-80" />
                                                        </div>
                                                        <div className="space-y-2 flex-1 pt-1">
                                                            <h4 className={cn("text-xl font-black tracking-tight group-hover:text-primary", isDarkMode ? "text-white" : "text-black")}>{link.title}</h4>
                                                            <p className="text-[10px] text-primary font-black uppercase tracking-[0.2em]">{new URL(link.url).hostname}</p>
                                                            <p className="text-sm text-gray-500 font-medium leading-relaxed">{link.description}</p>
                                                        </div>
                                                    </div>
                                                ))}
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            </div>
                        ) : (
                            <div className="w-full h-full relative">
                                {isSearching && (
                                    <div className="absolute inset-0 z-50 bg-black/60 backdrop-blur-md flex flex-col items-center justify-center space-y-6 text-center">
                                        <div className="relative">
                                            <div className="w-20 h-20 rounded-full border-2 border-primary border-t-transparent animate-spin" />
                                            <Bot className="absolute inset-0 m-auto w-8 h-8 text-primary animate-pulse" />
                                        </div>
                                        <div className="space-y-2">
                                            <div className="text-primary font-black uppercase tracking-[0.5em] text-xs">Accessing Neural Lattice</div>
                                            <div className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Decrypting Web Nodes • Please Wait</div>
                                        </div>
                                    </div>
                                )}
                                <iframe src={activeTab.url} className="w-full h-full border-none" title="Browser" />
                            </div>
                        )}
                    </div>
                </div>

                {/* Persistent Bottom Search Bar */}
                <div className="absolute bottom-12 left-0 right-0 z-[70] px-6 pointer-events-none">
                    <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="max-w-4xl mx-auto w-full pointer-events-auto">
                        <form
                            onSubmit={handleNavigate}
                            className={cn(
                                "flex items-center gap-4 p-2 rounded-[2.5rem] border shadow-2xl backdrop-blur-3xl transition-all duration-500 group relative overflow-hidden",
                                isDarkMode ? "bg-black/80 border-white/10 focus-within:border-primary/50" : "bg-white/90 border-gray-200 focus-within:border-primary"
                            )}
                        >
                            {/* Scanning Effect on Input */}
                            <div className="absolute inset-0 rounded-[2.5rem] bg-gradient-to-r from-transparent via-primary/20 to-transparent opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 animate-scan pointer-events-none z-0" />
                            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 group-focus-within:bg-primary transition-all duration-500">
                                <Search className={cn("w-5 h-5 transition-colors duration-500", isDarkMode ? "text-primary group-focus-within:text-black" : "text-primary group-focus-within:text-white")} />
                            </div>
                            <input
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                placeholder="Neural Discovery: Ask anything or enter URL..."
                                className={cn("flex-1 bg-transparent text-sm focus:outline-none font-medium", isDarkMode ? "text-white placeholder:text-gray-500" : "text-black placeholder:text-gray-400")}
                            />
                        </form>
                    </motion.div>
                </div>

                {/* HUD Status Bar */}
                <div className={cn(
                    "px-6 py-2 border-t text-[8px] font-black uppercase tracking-[0.4em] flex items-center justify-between transition-all backdrop-blur-md relative",
                    isDarkMode ? "bg-black/80 border-white/5 text-gray-500" : "bg-gray-100/80 border-gray-200 text-gray-400"
                )}>
                    <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.1)_50%),linear-gradient(90deg,rgba(255,0,0,0.02),rgba(0,255,0,0.01),rgba(0,0,255,0.02))] bg-[length:100%_2px,3px_100%] pointer-events-none opacity-20" />
                    <div className="flex items-center gap-8 relative">
                        <div className="flex items-center gap-3">
                            <div className="relative flex items-center justify-center">
                                <div className="w-1.5 h-1.5 rounded-full bg-primary animate-ping absolute" />
                                <div className="w-1.5 h-1.5 rounded-full bg-primary shadow-[0_0_8px_#00ff66]" />
                            </div>
                            <span className="text-primary/70">Neural Node: SY-742</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="flex gap-0.5">
                                {[1, 2, 3, 4].map(i => <div key={i} className="w-1 h-3 bg-primary/20 rounded-full" />)}
                            </div>
                            <span>Core Load: 14%</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-6 relative">
                        <button onClick={() => setIsDarkMode(!isDarkMode)} className={cn("transition-all duration-300 border px-3 py-1 rounded-md hover:bg-primary/10 hover:text-primary", isDarkMode ? "border-white/10" : "border-gray-200 text-slate-800")}>
                            {isDarkMode ? "Light_Flux" : "Dark_Neural"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
