"use client";

import { Brain, Cpu, Network } from "lucide-react";
import ScrollReveal from "@/components/ui/ScrollReveal";
import Link from "next/link";

const solutions = [
    {
        icon: <Brain className="w-8 h-8 text-primary" />,
        title: "Intelligent Core",
        desc: "Self-learning algorithms that adapt to your unique business data.",
    },
    {
        icon: <Cpu className="w-8 h-8 text-white" />,
        title: "Predictive Analytics",
        desc: "Forecast trends and outcomes with our advanced modeling engine.",
    },
    {
        icon: <Network className="w-8 h-8 text-primary" />,
        title: "Seamless Integration",
        desc: "Drop-in API solutions for your existing enterprise systems.",
    },
];

export default function SmartSolutions() {
    return (
        <section id="about" className="py-24 relative overflow-hidden">
            {/* Background Decorations */}
            <div className="absolute inset-0 z-0 decorated-grid opacity-10" />
            <div className="absolute right-0 top-1/4 w-[600px] h-[600px] bg-primary/10 rounded-full blur-[140px] -z-10 animate-pulse" />

            <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-16 items-center relative z-10">
                {/* Left: Text Content */}
                <ScrollReveal className="space-y-8">
                    <div className="relative inline-block">
                        <div className="text-primary text-sm font-bold tracking-[0.4em] uppercase mb-4">Why SYNAPSE AI</div>
                        <div className="absolute -bottom-1 left-0 w-12 h-0.5 bg-primary/50" />
                    </div>

                    <h2 className="text-3xl lg:text-5xl font-black text-white mb-6 leading-tight uppercase tracking-tight">
                        Business <span className="text-primary">Intelligence</span>. <br />
                        <span className="text-white/40">Strategic Advantage.</span>
                    </h2>

                    <p className="text-sm md:text-base text-gray-400 mb-8 leading-relaxed max-w-lg tracking-wide">
                        We deliver AI-powered business intelligence that transforms raw data into strategic decisions. From automating complex operational workflows to providing predictive market insights, SYNAPSE AI is the competitive edge your enterprise needs to achieve market leadership.
                    </p>

                    <Link href="/about" className="group inline-flex items-center gap-3 text-white border-b border-white/10 hover:border-primary transition-all pb-2 text-xs font-black uppercase tracking-[0.2em]">
                        Explore Our Vision
                        <div className="w-8 h-px bg-white/20 group-hover:bg-primary group-hover:w-12 transition-all" />
                    </Link>
                </ScrollReveal>

                {/* Right: Feature Cards */}
                <div className="grid gap-6">
                    {solutions.map((item, index) => (
                        <ScrollReveal
                            key={index}
                            delay={index * 0.1}
                            className="glass-card p-8 rounded-2xl flex items-start gap-6 border-white/5 hover:border-primary/40 transition-all duration-500 group relative overflow-hidden"
                        >
                            {/* Animated Background Line */}
                            <div className="absolute top-0 left-0 w-1 h-full bg-primary/0 group-hover:bg-primary/50 transition-all duration-500" />

                            <div className="p-4 rounded-xl bg-white/5 border border-white/10 group-hover:border-primary/50 transition-colors relative">
                                {item.icon}
                                {/* Pulse Indicator for Card */}
                                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-primary animate-pulse shadow-[0_0_8px_rgba(0,255,102,0.6)]" />
                            </div>

                            <div className="space-y-2">
                                <h3 className="text-xl font-black text-white uppercase tracking-tight group-hover:text-primary transition-colors">{item.title}</h3>
                                <p className="text-sm text-gray-400 leading-relaxed font-medium">{item.desc}</p>
                                <div className="pt-2 flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-primary/30" />
                                    <span className="text-[10px] text-primary/50 font-bold uppercase tracking-widest">Active System</span>
                                </div>
                            </div>
                        </ScrollReveal>
                    ))}
                </div>
            </div>
        </section>
    );
}
