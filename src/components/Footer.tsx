"use client";

import Link from "next/link";
import { Facebook, Twitter, Instagram, Linkedin, ArrowRight } from "lucide-react";
import Image from "next/image";

export default function Footer() {
    return (
        <footer className="relative pt-20 md:pt-32 pb-12 overflow-hidden px-4 md:px-6">
            {/* Background Decorations */}
            <div className="absolute inset-x-0 bottom-0 top-32 z-0 decorated-grid opacity-[0.05]" />

            {/* Curved Top Border Decoration */}
            <div className="absolute top-0 left-0 right-0 h-40 bg-black z-10" style={{ borderTopLeftRadius: '50% 120px', borderTopRightRadius: '50% 120px' }} />

            <div className="max-w-7xl mx-auto relative z-20 bg-white/[0.03] backdrop-blur-3xl rounded-2xl md:rounded-[4rem] border border-white/10 p-8 md:p-12 lg:p-20 shadow-2xl overflow-hidden">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 md:gap-16 mb-20">
                    <div className="col-span-1 lg:col-span-2 space-y-8">
                        <Link href="/" className="flex items-center gap-4 group">
                            <div className="relative w-10 h-10 md:w-12 md:h-12 transition-all group-hover:scale-110 group-hover:rotate-12">
                                <Image src="/synapse-logo.png" alt="SYNAPSE AI" fill className="object-contain opacity-80" />
                            </div>
                            <span className="text-[12px] md:text-[14px] font-black tracking-[0.6em] uppercase inline-block text-white/90">SYNAPSE AI</span>
                        </Link>
                        <p className="text-gray-500 text-sm md:text-base leading-relaxed max-w-sm font-medium">
                            World-class AI strategic intelligence for global business engineering and high-stakes corporate strategy. <span className="text-primary/40">Architecting the apex.</span>
                        </p>
                        <div className="flex gap-4">
                            {[Facebook, Twitter, Instagram, Linkedin].map((Icon, i) => (
                                <a key={i} href="#" className="w-10 h-10 md:w-12 md:h-12 rounded-sm bg-white/5 flex items-center justify-center text-gray-500 hover:bg-primary hover:text-black hover:scale-110 transition-all border border-white/5 hover:border-primary">
                                    <Icon className="w-4 h-4 md:w-5 md:h-5" />
                                </a>
                            ))}
                        </div>
                    </div>

                    <div>
                        <h4 className="font-black text-primary mb-8 md:mb-10 uppercase tracking-[0.3em] text-xs md:text-sm">Explore</h4>
                        <ul className="space-y-5 text-gray-400 font-medium text-sm">
                            {[
                                { name: 'Home', href: '/' },
                                { name: 'About', href: '/#about' },
                                { name: 'Services', href: '/#services' },
                                { name: 'Browser', href: '/browser' },
                            ].map((item) => (
                                <li key={item.name}>
                                    <Link href={item.href} className="hover:text-primary transition-all flex items-center gap-4 group">
                                        <div className="w-2 h-2 rounded-full border border-primary/20 group-hover:bg-primary group-hover:border-primary transition-all" />
                                        {item.name}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div>
                        <h4 className="font-black text-primary mb-8 md:mb-10 uppercase tracking-[0.3em] text-xs md:text-sm">Newsletter</h4>
                        <p className="text-gray-500 text-sm mb-8 leading-relaxed font-medium">Stay updated with our latest AI breakthroughs and strategic insights.</p>
                        <form className="relative flex bg-white/5 rounded-full p-2 border border-white/10 focus-within:border-primary/50 transition-all group overflow-hidden">
                            <input type="email" placeholder="ENTER_EMAIL_CORPUS" className="bg-transparent border-none text-white px-4 py-3 w-full focus:outline-none text-xs md:text-sm placeholder:text-gray-700 font-black tracking-widest uppercase" required />
                            <button type="submit" className="w-12 h-12 rounded-full bg-primary flex items-center justify-center text-black hover:bg-white hover:scale-105 transition-all shadow-[0_0_20px_rgba(0,255,102,0.3)]">
                                <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                            </button>
                        </form>
                    </div>
                </div>

                <div className="border-t border-white/5 pt-10 flex flex-col md:flex-row justify-between items-center gap-8 text-[10px] md:text-[11px] text-gray-600 font-black uppercase tracking-[0.4em]">
                    <p>&copy; 2026 SYNAPSE AI Intelligence. All rights reserved.</p>
                    <div className="flex gap-12">
                        <Link href="/privacy" className="hover:text-primary transition-colors">Privacy Policy</Link>
                        <Link href="/terms" className="hover:text-primary transition-colors">Terms of Service</Link>
                    </div>
                </div>
            </div>
        </footer>
    );
}
