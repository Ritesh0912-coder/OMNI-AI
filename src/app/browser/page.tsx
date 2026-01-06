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
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isDarkMode, setIsDarkMode] = useState(true);
    const [isPrivateMode, setIsPrivateMode] = useState(false);
    const [isMounted, setIsMounted] = useState(false);
    const [isSearching, setIsSearching] = useState(false);



    // Persistent State
    const [history, setHistory] = useState<string[]>([]);
    const [bookmarks, setBookmarks] = useState<string[]>([]);

    const activeTab = tabs.find(t => t.id === activeTabId) || tabs[0];

    // Persistence Logic
    useEffect(() => {
        setIsMounted(true);
        console.log("Synapse AI Browser Mounted");

        const savedBookmarks = localStorage.getItem('synapse_bookmarks');
        if (savedBookmarks) setBookmarks(JSON.parse(savedBookmarks));

        const savedHistory = localStorage.getItem('synapse_history');
        if (savedHistory) setHistory(JSON.parse(savedHistory));
    }, []);

    const saveBookmark = (url: string) => {
        const newBookmarks = [...bookmarks, url];
        setBookmarks(newBookmarks);
        localStorage.setItem('synapse_bookmarks', JSON.stringify(newBookmarks));
    };

    const addToHistory = (url: string) => {
        if (isPrivateMode) return;
        const newHistory = [url, ...history].slice(0, 100);
        setHistory(newHistory);
        localStorage.setItem('synapse_history', JSON.stringify(newHistory));
    };


    const addTab = () => {
        const newTab = { id: Math.random().toString(36).substr(2, 9), title: 'New Tab', url: 'about:blank' };
        setTabs([...tabs, newTab]);
        setActiveTabId(newTab.id);
        setInput("");
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

    const handleNavigate = async (e?: React.FormEvent) => {
        e?.preventDefault();
        if (!input) return;

        let targetUrl = input;
        const isSearch = !input.startsWith('http') && !input.includes('.');

        if (isSearch) {
            setIsSearching(true);

            // OPTIMISTIC UPDATE: Switch to search view immediately
            setTabs(tabs.map(t => t.id === activeTabId
                ? { ...t, url: 'synapse://search', title: input, searchResponse: undefined, activeSearchSection: 'ai' }
                : t));

            // Perform search in background then update
            const response = await synapseAI.performSearch(input);
            setTabs(prevTabs => prevTabs.map(t => t.id === activeTabId
                ? { ...t, searchResponse: response }
                : t));

            setIsSearching(false);
        } else {
            if (!targetUrl.startsWith('http')) {
                targetUrl = `https://${targetUrl}`;
            }
            setTabs(tabs.map(t => t.id === activeTabId ? { ...t, url: targetUrl, title: input, searchResponse: undefined } : t));
        }

        setSuggestions([]);
        addToHistory(targetUrl);
    };



    useEffect(() => {
        if (input.length > 1) {

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
            "h-screen w-full flex flex-col overflow-hidden transition-colors duration-500",
            isDarkMode ? "bg-[#050505] text-white" : "bg-gray-50 text-black"
        )}>
            {/* Browser Chrome: Top Section */}
            <div className={cn(
                "flex flex-col border-b transition-all duration-300 backdrop-blur-3xl relative z-50",
                isDarkMode
                    ? "bg-[#050505]/60 border-white/5 shadow-[0_4px_30px_rgba(0,0,0,0.5)]"
                    : "bg-white/80 border-gray-200 shadow-sm"
            )}>
                {/* Visual Accent Line */}
                <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-primary/50 to-transparent opacity-30" />

                {/* Tabs Bar */}
                <div className="flex items-center px-4 pt-2 gap-2 overflow-x-auto scrollbar-hide">
                    <Link href="/" className="flex items-center gap-2 px-3 mr-2 group">
                        <div className="relative w-6 h-6 transform group-hover:scale-110 transition-transform duration-500">
                            <img src="/synapse-logo.png" alt="SYNAPSE AI" className="object-contain" />
                        </div>
                    </Link>
                    {tabs.map((tab) => (
                        <div
                            key={tab.id}
                            onClick={() => setActiveTabId(tab.id)}
                            className={cn(
                                "flex items-center gap-2 px-4 py-2 rounded-t-2xl min-w-[180px] max-w-[260px] cursor-pointer transition-all duration-500 group relative overflow-hidden",
                                activeTabId === tab.id
                                    ? (isDarkMode
                                        ? "bg-white/[0.03] text-primary shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)]"
                                        : "bg-gray-100 text-blue-600")
                                    : (isDarkMode
                                        ? "hover:bg-white/[0.02] text-gray-500"
                                        : "hover:bg-gray-200 text-gray-500")
                            )}
                        >
                            <div className={cn(
                                "w-5 h-5 rounded-lg flex items-center justify-center flex-shrink-0 transition-transform duration-300 group-hover:scale-110",
                                activeTabId === tab.id ? "bg-primary/20" : "bg-white/5"
                            )}>
                                <Search className={cn("w-3 h-3", activeTabId === tab.id ? "text-primary" : "text-gray-500")} />
                            </div>
                            <span className="text-[10px] font-black truncate flex-1 uppercase tracking-[0.15em]">{tab.title}</span>
                            <button
                                onClick={(e) => closeTab(tab.id, e)}
                                className="opacity-0 group-hover:opacity-100 hover:bg-white/10 rounded-full p-1 transition-all"
                            >
                                <X className="w-3 h-3" />
                            </button>

                            {/* Active Tab Glow */}
                            {activeTabId === tab.id && (
                                <>
                                    <motion.div
                                        layoutId="tab-underline"
                                        className="absolute bottom-0 left-2 right-2 h-[2px] bg-primary shadow-[0_0_15px_#00ff66]"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent pointer-events-none" />
                                </>
                            )}
                        </div>

                    ))}
                    <button
                        onClick={addTab}
                        className="p-2 hover:bg-white/5 rounded-full transition-colors"
                    >
                        <Plus className="w-4 h-4 text-gray-400" />
                    </button>
                </div>

                {/* Toolbar */}
                <div className="flex items-center gap-4 px-4 py-2">
                    <div className="flex items-center gap-1">
                        <button
                            onClick={() => window.history.back()}
                            className={cn(
                                "p-2 rounded-full transition-all",
                                isDarkMode ? "hover:bg-white/5 text-gray-400 hover:text-white" : "hover:bg-gray-100 text-gray-500 hover:text-black"
                            )}
                        >
                            <ArrowLeft className="w-4 h-4" />
                        </button>
                        <button
                            onClick={() => window.history.forward()}
                            className={cn(
                                "p-2 rounded-full transition-all",
                                isDarkMode ? "hover:bg-white/5 text-gray-400 hover:text-white" : "hover:bg-gray-100 text-gray-500 hover:text-black"
                            )}
                        >
                            <ArrowRight className="w-4 h-4" />
                        </button>
                        <button
                            onClick={() => window.location.reload()}
                            className={cn(
                                "p-2 rounded-full transition-all",
                                isDarkMode ? "hover:bg-white/5 text-gray-400 hover:text-white" : "hover:bg-gray-100 text-gray-500 hover:text-black"
                            )}
                        >
                            <RotateCcw className="w-4 h-4" />
                        </button>
                        <button
                            onClick={() => setTabs(tabs.map(t => t.id === activeTabId ? { ...t, url: 'about:blank', title: 'New Tab', searchResponse: undefined } : t))}
                            className={cn(
                                "p-2 rounded-full transition-all",
                                isDarkMode ? "hover:bg-white/5 text-gray-400 hover:text-white" : "hover:bg-gray-100 text-gray-500 hover:text-black"
                            )}
                        >
                            <Home className="w-4 h-4" />
                        </button>
                        <button
                            onClick={() => setIsPrivateMode(!isPrivateMode)}
                            className={cn(
                                "p-2 rounded-full transition-all",
                                isPrivateMode ? "bg-purple-500/20 text-purple-400" : (isDarkMode ? "text-gray-400 hover:text-white hover:bg-white/5" : "text-gray-500 hover:text-black hover:bg-gray-100")
                            )}
                            title="Toggle Private Mode"
                        >
                            <Ghost className="w-4 h-4" />
                        </button>
                    </div>


                    <form
                        onSubmit={handleNavigate}
                        className="flex-1 relative group"
                    >
                        <div className={cn(
                            "flex items-center gap-3 px-5 py-2.5 rounded-2xl border transition-all duration-500 group-focus-within:shadow-[0_0_25px_rgba(0,255,102,0.15)]",
                            isDarkMode
                                ? "bg-white/[0.03] border-white/5 focus-within:border-primary/40 focus-within:bg-white/[0.05]"
                                : "bg-gray-100 border-transparent focus-within:bg-white focus-within:shadow-xl"
                        )}>
                            <div className="flex items-center gap-2 border-r border-white/10 pr-3">
                                <Shield className={cn("w-3.5 h-3.5", isPrivateMode ? "text-purple-400" : "text-primary")} />
                                <span className="text-[9px] font-black uppercase text-gray-500 tracking-[0.1em]">
                                    {isPrivateMode ? "Ghost" : "Secure"}
                                </span>
                            </div>

                            <input
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                placeholder="Search with Synapse AI or enter URL"
                                className={cn(
                                    "bg-transparent flex-1 text-xs focus:outline-none font-medium placeholder:text-gray-500",
                                    isDarkMode ? "text-white" : "text-black"
                                )}
                            />
                            <div className="flex items-center gap-2">
                                <Star
                                    className={cn(
                                        "w-4 h-4 cursor-pointer transition-colors",
                                        bookmarks.includes(activeTab.url) ? "text-yellow-500 fill-yellow-500" : "text-gray-500 hover:text-yellow-500"
                                    )}
                                    onClick={() => saveBookmark(activeTab.url)}
                                />
                                <Mic className="w-4 h-4 text-gray-500 hover:text-primary cursor-pointer" />
                            </div>

                        </div>

                        {/* Search Suggestions */}
                        <AnimatePresence>
                            {(suggestions.length > 0 && input) && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: 10 }}
                                    className={cn(
                                        "absolute top-full left-0 right-0 mt-2 rounded-2xl border shadow-2xl z-50 overflow-hidden backdrop-blur-3xl",
                                        isDarkMode ? "bg-black/90 border-white/10" : "bg-white border-gray-200"
                                    )}
                                >
                                    {suggestions.map((s) => (
                                        <div
                                            key={s.id}
                                            onClick={() => {
                                                setInput(s.text);
                                                handleNavigate();
                                            }}
                                            className={cn(
                                                "flex items-center gap-3 px-6 py-3 cursor-pointer transition-colors",
                                                isDarkMode ? "hover:bg-white/5" : "hover:bg-gray-50"
                                            )}
                                        >
                                            {s.type === 'ai' ? <Bot className="w-4 h-4 text-primary" /> : <Search className="w-4 h-4 text-gray-500" />}
                                            <span className="text-sm font-medium">{s.text}</span>
                                            {s.type === 'ai' && <span className="text-[8px] font-black uppercase tracking-widest text-primary ml-auto">AI Suggested</span>}
                                        </div>
                                    ))}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </form>

                    <div className="flex items-center gap-2">


                        <div className="relative">
                            <button
                                onClick={() => setIsMenuOpen(!isMenuOpen)}
                                className={cn(
                                    "p-2 rounded-full transition-all",
                                    isDarkMode ? "hover:bg-white/5 text-gray-400 hover:text-white" : "hover:bg-gray-100 text-gray-500 hover:text-black",
                                    isMenuOpen && "bg-primary/20 text-primary"
                                )}
                            >
                                <MoreVertical className="w-4 h-4" />
                            </button>
                            <AnimatePresence>
                                {isMenuOpen && (
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.9, y: 10 }}
                                        animate={{ opacity: 1, scale: 1, y: 0 }}
                                        exit={{ opacity: 0, scale: 0.9, y: 10 }}
                                        className={cn(
                                            "absolute top-full right-0 mt-2 w-48 rounded-2xl border shadow-2xl z-50 overflow-hidden py-2 backdrop-blur-xl",
                                            isDarkMode ? "bg-black/90 border-white/10" : "bg-white border-gray-200"
                                        )}
                                    >
                                        {[
                                            { label: 'New Window', icon: Plus },
                                            { label: 'History', icon: History },
                                            { label: 'Bookmarks', icon: Bookmark },
                                            { label: 'Settings', icon: Settings },
                                            { label: 'Clear Cache', icon: Trash2 },
                                        ].map((item, i) => (
                                            <button
                                                key={i}
                                                className={cn(
                                                    "w-full flex items-center gap-3 px-4 py-2 text-[10px] font-black uppercase tracking-widest transition-colors",
                                                    isDarkMode ? "text-gray-400 hover:bg-white/5 hover:text-white" : "text-gray-500 hover:bg-gray-50 hover:text-black"
                                                )}
                                                onClick={() => setIsMenuOpen(false)}
                                            >
                                                <item.icon size={14} />
                                                {item.label}
                                            </button>
                                        ))}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>

                </div>
            </div>

            {/* Main Content: Iframe + Side Panel */}
            <div className="flex-1 flex overflow-hidden relative">
                {/* Browser Viewport */}
                <div className="flex-1 bg-white relative">
                    {activeTab.url === 'about:blank' ? (
                        <div className={cn(
                            "absolute inset-0 flex flex-col items-center justify-center p-6 text-center space-y-8 transition-colors duration-500",
                            isDarkMode ? "bg-[#050505]" : "bg-white"
                        )}>
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.8, ease: "easeOut" }}
                                className="relative"
                            >
                                <div className="absolute -inset-24 bg-primary/20 blur-[100px] rounded-full animate-pulse opacity-50" />
                                <div className="relative flex flex-col items-center">
                                    <div className="w-32 h-32 rounded-[2.5rem] bg-gradient-to-br from-[#0c0c0c] to-black border border-white/10 flex items-center justify-center shadow-[0_0_50px_rgba(0,0,0,0.8)] mb-8 group overflow-hidden">
                                        <div className="absolute inset-0 bg-gradient-to-tr from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                                        <img src="/synapse-logo.png" className="w-16 h-16 object-contain drop-shadow-[0_0_20px_rgba(0,255,102,0.6)] group-hover:scale-110 transition-transform duration-500" alt="Logo" />
                                    </div>
                                    <h1 className={cn(
                                        "text-5xl font-black uppercase tracking-[-0.05em] mb-3 bg-clip-text text-transparent",
                                        isDarkMode ? "bg-gradient-to-b from-white to-white/40" : "bg-gradient-to-b from-black to-black/60"
                                    )}>Synapse Neural Link</h1>

                                    <p className="text-primary font-black uppercase tracking-[0.5em] text-[9px] mb-8 opacity-80">Quantum-Secured • Synapse OS v4.0</p>
                                </div>
                            </motion.div>


                        </div>
                    ) : activeTab.url === 'synapse://search' ? (
                        <div className={cn(
                            "absolute inset-0 overflow-y-auto transition-colors duration-500",
                            isDarkMode ? "bg-[#050505]" : "bg-white"
                        )}>
                            <div className="max-w-4xl mx-auto px-8 py-16 space-y-12">

                                {/* Custom Tab Navigation */}
                                <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-white/[0.03] border border-white/5 w-fit">
                                    {[
                                        { id: 'ai', label: 'AI Synthesis', icon: Bot },
                                        { id: 'images', label: 'Nodes (Images)', icon: ImageIcon },
                                        { id: 'links', label: 'Technical Links', icon: List },
                                    ].map((section) => (
                                        <button
                                            key={section.id}
                                            onClick={() => setTabs(tabs.map(t => t.id === activeTabId ? { ...t, activeSearchSection: section.id as any } : t))}
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

                                {/* Tab Content */}
                                <AnimatePresence mode="wait">
                                    {activeTab.activeSearchSection === 'ai' ? (
                                        <motion.div
                                            key="ai-section"
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -20 }}
                                            className="space-y-12"
                                        >
                                            {/* AI Synthesis Content (Chat Screen Style) */}
                                            <div className="space-y-6 w-full pt-4">
                                                <div className="flex items-start gap-4">
                                                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-1">
                                                        <Bot size={20} className="text-primary" />
                                                    </div>
                                                    <p className={cn(
                                                        "text-xl font-light leading-relaxed tracking-wide flex-1",
                                                        isDarkMode ? "text-white/90" : "text-slate-800"
                                                    )}>
                                                        {activeTab.searchResponse?.aiResponse}
                                                    </p>
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
                                                    initial={{ opacity: 0, y: 20 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    transition={{ delay: i * 0.1 }}
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
                                                        <p className="text-xs text-gray-500 font-medium leading-relaxed">
                                                            {img.description}
                                                        </p>
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
                                                <motion.div
                                                    key={i}
                                                    initial={{ opacity: 0, y: 15 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    transition={{ delay: i * 0.05 }}
                                                    onClick={() => setTabs(tabs.map(t => t.id === activeTabId ? { ...t, url: link.url, title: link.title, searchResponse: undefined } : t))}
                                                    className={cn(
                                                        "flex items-start gap-6 p-8 rounded-[2.5rem] border transition-all group cursor-pointer relative overflow-hidden",
                                                        isDarkMode ? "bg-white/[0.02] border-white/5 hover:border-primary/40 hover:bg-white/[0.04]" : "bg-gray-50 border-gray-100 hover:border-primary/40 hover:bg-white"
                                                    )}
                                                >
                                                    <div className={cn(
                                                        "w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 transition-all duration-500",
                                                        isDarkMode ? "bg-white/5 group-hover:bg-primary/20" : "bg-white border border-gray-100 group-hover:border-primary/50 shadow-sm"
                                                    )}>
                                                        <img
                                                            src={`https://www.google.com/s2/favicons?sz=64&domain=${new URL(link.url).hostname}`}
                                                            alt=""
                                                            className="w-6 h-6 rounded-md opacity-80 group-hover:opacity-100 transition-opacity"
                                                        />
                                                    </div>
                                                    <div className="space-y-2 flex-1 pt-1">
                                                        <div className="flex items-center justify-between">
                                                            <h4 className={cn("text-xl font-black tracking-tight transition-colors group-hover:text-primary", isDarkMode ? "text-white" : "text-black")}>{link.title}</h4>
                                                        </div>
                                                        <p className="text-[10px] text-primary font-black uppercase tracking-[0.2em] mb-2">{new URL(link.url).hostname}</p>
                                                        <p className="text-sm text-gray-500 font-medium leading-relaxed">
                                                            {link.description}
                                                        </p>
                                                    </div>
                                                </motion.div>
                                            ))}
                                        </motion.div>
                                    )}

                                </AnimatePresence>
                            </div>
                        </div>

                    ) : (
                        <div className="w-full h-full relative">
                            {isSearching && (
                                <div className="absolute inset-0 z-50 bg-black/60 backdrop-blur-md flex flex-col items-center justify-center space-y-6 text-center p-8">
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
                            <iframe
                                src={activeTab.url}
                                className="w-full h-full border-none"
                                title="Web Browser View"
                            />
                        </div>
                    )}

                </div>

            </div>

            {/* Persistent Bottom Search Bar */}
            <div className="absolute bottom-12 left-0 right-0 z-50 px-6 pointer-events-none">
                <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    className="max-w-4xl mx-auto w-full pointer-events-auto"
                >
                    <form
                        onSubmit={handleNavigate}
                        className={cn(
                            "flex items-center gap-4 p-2 rounded-[2.5rem] border shadow-2xl backdrop-blur-3xl transition-all duration-500 group",
                            isDarkMode
                                ? "bg-black/80 border-white/10 hover:border-primary/40 focus-within:border-primary/50"
                                : "bg-white/90 border-gray-200 hover:border-primary focus-within:border-primary"
                        )}
                    >
                        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 group-focus-within:bg-primary transition-all duration-500">
                            <Search className={cn("w-5 h-5 transition-colors duration-500", isDarkMode ? "text-primary group-focus-within:text-black" : "text-primary group-focus-within:text-white")} />
                        </div>
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Neural Discovery: Ask anything or enter URL..."
                            className={cn(
                                "flex-1 bg-transparent text-sm focus:outline-none font-medium",
                                isDarkMode ? "text-white placeholder:text-gray-500" : "text-black placeholder:text-gray-400"
                            )}
                        />
                        <div className="flex items-center gap-2 pr-4">
                            <Mic className="w-5 h-5 text-gray-500 hover:text-primary transition-colors cursor-pointer" />
                            <div className="w-[1px] h-6 bg-white/10 mx-2" />
                            <button className="text-[10px] font-black uppercase tracking-[0.2em] text-primary hover:text-white transition-colors">
                                Send_Link
                            </button>
                        </div>
                    </form>
                </motion.div>
            </div>

            {/* HUD Status Bar */}
            <div className={cn(
                "px-6 py-2 border-t text-[8px] font-black uppercase tracking-[0.4em] flex items-center justify-between transition-all backdrop-blur-md relative",
                isDarkMode ? "bg-black/80 border-white/5 text-gray-500" : "bg-gray-100/80 border-gray-200 text-gray-400"
            )}>
                {/* HUD Scanline Effect */}
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
                    <span className="hidden md:block">Protocol: E2E-SHIELD</span>
                </div>
                <div className="flex items-center gap-6 relative">
                    <Link href="/" className={cn("transition-all duration-300 flex items-center gap-2 group", isDarkMode ? "hover:text-primary" : "hover:text-primary text-slate-800")}>
                        <Home size={10} className="group-hover:scale-125 transition-transform" />
                        Term_Link
                    </Link>
                    <button
                        onClick={() => setIsDarkMode(!isDarkMode)}
                        className={cn(
                            "transition-all duration-300 border px-3 py-1 rounded-md hover:bg-primary/10 hover:text-primary",
                            isDarkMode ? "border-white/10 hover:bg-white/5" : "border-gray-200 text-slate-800"
                        )}
                    >
                        {isDarkMode ? "Light_Flux" : "Dark_Neural"}
                    </button>

                    <div className="flex items-center gap-1">
                        <div className="w-1 h-1 rounded-full bg-white/30 animate-[pulse_1s_infinite]" />
                        <span>Sync_Active</span>
                    </div>
                </div>
            </div>

        </div >
    );
}
