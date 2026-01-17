"use client";

import dynamic from 'next/dynamic';
import { motion } from 'framer-motion';

const TrueFocus = dynamic(() => import('./ui/TrueFocus'), { ssr: false });

export default function BusinessSignature() {
    return (
        <section className="relative h-[650px] w-full bg-black overflow-hidden flex flex-col items-center justify-center border-t border-white/5">
            {/* Futuristic Grid Pattern */}
            <div className="absolute inset-0 z-0 opacity-[0.15]" style={{ backgroundImage: 'linear-gradient(to right, #1a1a1a 1px, transparent 1px), linear-gradient(to bottom, #1a1a1a 1px, transparent 1px)', backgroundSize: '40px 40px' }} />

            {/* Radial glow background */}
            <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/20 rounded-full blur-[120px] animate-pulse" />
                <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
                <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
            </div>

            <div className="relative z-10 w-full max-w-5xl px-6 text-center">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 1.5, ease: "easeOut" }}
                    className="flex flex-col items-center justify-center"
                >
                    <TrueFocus
                        sentence="SYNAPSE BUSINESS INTELLIGENCE AI"
                        manualMode={false}
                        blurAmount={10}
                        borderColor="#00ff66"
                        glowColor="rgba(0, 255, 102, 0.4)"
                        animationDuration={0.8}
                        pauseBetweenAnimations={1.5}
                    />

                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.8, duration: 1.2 }}
                        className="mt-16 w-full"
                    >
                        <div className="flex items-center justify-center gap-4 mb-8">
                            <div className="h-px w-12 bg-gradient-to-r from-transparent to-white/20" />
                            <p className="text-[10px] md:text-xs font-black tracking-[1.2em] uppercase text-white/50">
                                Architecting the Apex of Intelligence
                            </p>
                            <div className="h-px w-12 bg-gradient-to-l from-transparent to-white/20" />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 py-10 border-y border-white/10 backdrop-blur-sm bg-white/[0.02] rounded-2xl">
                            <div className="space-y-3 relative group">
                                <div className="absolute -left-4 top-1/2 -translate-y-1/2 w-1 h-8 bg-primary/0 group-hover:bg-primary/50 transition-all duration-500" />
                                <h4 className="text-primary text-[11px] font-black uppercase tracking-widest flex items-center justify-center gap-2">
                                    <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                                    Global Scale
                                </h4>
                                <p className="text-gray-400 text-[10px] uppercase tracking-very-wide font-medium">Deploying intelligence across 40+ markets</p>
                            </div>
                            <div className="space-y-3 relative group">
                                <div className="absolute -left-4 top-1/2 -translate-y-1/2 w-1 h-8 bg-primary/0 group-hover:bg-primary/50 transition-all duration-500" />
                                <h4 className="text-primary text-[11px] font-black uppercase tracking-widest flex items-center justify-center gap-2">
                                    <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                                    Neural Precision
                                </h4>
                                <p className="text-gray-400 text-[10px] uppercase tracking-very-wide font-medium">99.9% Decision-Ready Data Accuracy</p>
                            </div>
                            <div className="space-y-3 relative group">
                                <div className="absolute -left-4 top-1/2 -translate-y-1/2 w-1 h-8 bg-primary/0 group-hover:bg-primary/50 transition-all duration-500" />
                                <h4 className="text-primary text-[11px] font-black uppercase tracking-widest flex items-center justify-center gap-2">
                                    <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                                    Deep Logic
                                </h4>
                                <p className="text-gray-400 text-[10px] uppercase tracking-very-wide font-medium">Proprietary logic-first neural architecture</p>
                            </div>
                        </div>
                    </motion.div>
                </motion.div>
            </div>
        </section>
    );
}
