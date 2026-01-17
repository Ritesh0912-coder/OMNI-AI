"use client";

import { ArrowRight } from "lucide-react";
import ScrollReveal from "@/components/ui/ScrollReveal";
import Image from "next/image";

const strategies = [
    {
        title: "Financial Growth",
        category: "Finance",
        desc: "AI-driven market predictions that outperform traditional analysts.",
        color: "from-blue-500/20 to-purple-500/20",
        image: "/strategies/finance.jpg",
    },
    {
        title: "Medical Diagnostics",
        category: "Healthcare",
        desc: "Early detection systems powering the next generation of patient care.",
        color: "from-emerald-500/20 to-teal-500/20",
        image: "/strategies/healthcare.jpg",
    },
    {
        title: "Smart Cities",
        category: "Infrastructure",
        desc: "Optimizing energy, traffic, and public services with real-time data.",
        color: "from-orange-500/20 to-red-500/20",
        image: "/strategies/infrastructure.jpg",
    },
];

export default function RealWorldStrategies() {
    return (
        <section className="py-24 md:py-32 relative overflow-hidden">
            {/* Background Decorations */}
            <div className="absolute inset-0 z-0 decorated-grid opacity-10" />
            <div className="absolute left-0 bottom-0 w-full h-24 bg-gradient-to-t from-black to-transparent z-10" />

            <div className="max-w-7xl mx-auto px-6 relative z-10">
                <div className="flex flex-col md:flex-row justify-between items-end mb-16 md:mb-24 gap-8">
                    <div className="space-y-4">
                        <div className="flex items-center gap-3">
                            <span className="w-12 h-[1px] bg-primary/50" />
                            <span className="text-primary text-xs font-black uppercase tracking-[0.4em]">Analytics Browser</span>
                        </div>
                        <h2 className="text-3xl md:text-5xl lg:text-6xl font-black text-white uppercase tracking-tight leading-tight">
                            Real World <span className="text-primary">Strategies</span> <br />
                            <span className="text-white/40">Delivering Results</span>
                        </h2>
                    </div>
                </div>

                <div className="grid lg:grid-cols-3 gap-8">
                    {strategies.map((item, i) => (
                        <ScrollReveal
                            key={i}
                            delay={i * 0.1}
                            className="group relative h-[450px] rounded-sm overflow-hidden bg-black/40 border border-white/10 hover:border-primary/50 transition-all duration-700 shadow-2xl"
                        >
                            {/* Technical Telemetry Accents */}
                            <div className="absolute top-4 left-4 z-20 text-[8px] font-mono text-primary/40 leading-tight uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity duration-700">
                                LOC: 51.5074° N, 0.1278° W <br />
                                DATA: SYNC_COMPLETE_V4 <br />
                                STATUS: OPTIMIZED
                            </div>



                            {/* Background Image */}
                            <div className="absolute inset-0">
                                <Image
                                    src={item.image}
                                    alt={item.title}
                                    fill
                                    className="object-cover opacity-30 group-hover:opacity-50 group-hover:scale-110 transition-all duration-1000"
                                />
                            </div>

                            {/* Gradient Overlay */}
                            <div className={`absolute inset-0 bg-gradient-to-br ${item.color} opacity-30 group-hover:opacity-50 transition-all duration-700`} />

                            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/80 to-transparent p-10 flex flex-col justify-end z-30">
                                <div className="relative mb-4">
                                    <span className="text-primary text-[10px] font-black uppercase tracking-[0.3em] bg-primary/10 px-3 py-1 border-l-2 border-primary">{item.category}</span>
                                </div>
                                <h3 className="text-2xl lg:text-3xl font-black text-white mb-4 group-hover:text-primary transition-colors uppercase tracking-tight">{item.title}</h3>
                                <p className="text-gray-400 text-xs md:text-sm mb-8 leading-relaxed font-medium line-clamp-2 uppercase tracking-wide">
                                    {item.desc}
                                </p>

                                <div className="flex items-center justify-between">
                                    <div className="w-12 h-12 rounded-sm bg-white/5 border border-white/10 flex items-center justify-center group-hover:bg-primary group-hover:text-black transition-all duration-500">
                                        <ArrowRight className="w-5 h-5 -rotate-45 group-hover:rotate-0 transition-transform" />
                                    </div>
                                    <span className="text-[10px] font-mono text-white/20 group-hover:text-primary/40 transition-colors uppercase">00{i + 1} / 012</span>
                                </div>
                            </div>
                        </ScrollReveal>
                    ))}
                </div>
            </div>
        </section>
    );
}
