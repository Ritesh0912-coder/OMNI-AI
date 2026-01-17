"use client";

import { ArrowUpRight, BarChart3, Bot, Code2, Database, Globe, Lock } from "lucide-react";
import ScrollReveal from "@/components/ui/ScrollReveal";
import Link from "next/link";
import { motion } from "framer-motion";

const services = [
    {
        icon: <Bot className="w-10 h-10 text-primary" />,
        title: "Autonomous Agents",
        desc: "Deploy intelligent agents that handle customer support, scheduling, and repetitive workflows with human-like understanding.",
    },
    {
        icon: <BarChart3 className="w-10 h-10 text-primary" />,
        title: "Predictive Analytics",
        desc: "Harness the power of historical data to forecast market trends, user behavior, and operational risks before they happen.",
    },
    {
        icon: <Code2 className="w-10 h-10 text-primary" />,
        title: "Neural Codeflow",
        desc: "Accelerate development cycles with AI-assisted coding and automated refactoring powered by advanced LLM models.",
    },
    {
        icon: <Database className="w-10 h-10 text-primary" />,
        title: "Intelligent Data",
        desc: "Transform unstructured raw data into actionable knowledge with automated categorization and semantics-aware search.",
    },
    {
        icon: <Globe className="w-10 h-10 text-primary" />,
        title: "Global Intelligence",
        desc: "Navigate international markets with real-time, context-aware translation that preserves cultural nuance and technical accuracy.",
    },
    {
        icon: <Lock className="w-10 h-10 text-primary" />,
        title: "Cyber Resilience",
        desc: "Anticipate threats with a security layer that adapts to new attack vectors in real-time, protecting your most critical assets.",
    },
];

export default function Services() {
    return (
        <section id="services" className="py-20 md:py-32 relative overflow-hidden bg-black/40">
            {/* Background Decorations */}
            <div className="absolute inset-0 z-0 decorated-grid opacity-[0.05]" />
            <motion.div
                className="scan-line-horizontal"
                animate={{ top: ['0%', '100%'] }}
                transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
            />

            <div className="max-w-7xl mx-auto px-4 md:px-6 relative z-10">

                <div className="text-center mb-16 md:mb-24">
                    <span className="text-primary text-xs md:text-sm font-black tracking-[0.4em] uppercase">Enterprise Solutions</span>
                    <h2 className="mt-6 text-2xl md:text-4xl lg:text-5xl font-black text-white uppercase tracking-tight">
                        Empower Your <span className="text-primary">Ecosystem</span> <br className="hidden sm:block" />
                        With Advanced AI
                    </h2>
                    <div className="mt-6 w-24 h-1 bg-gradient-to-r from-transparent via-primary to-transparent mx-auto" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                    {services.map((service, index) => (
                        <ScrollReveal
                            key={index}
                            delay={index * 0.1}
                            className="group glass-card p-8 md:p-10 rounded-2xl md:rounded-3xl relative overflow-hidden hover:-translate-y-2 transition-all duration-500 border-white/5 hover:border-primary/30"
                        >
                            {/* Scanning line for individual card on hover */}
                            <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-primary/0 group-hover:via-primary/50 to-transparent transition-all duration-700" />

                            <div className="absolute top-0 right-0 p-8 opacity-0 group-hover:opacity-100 transition-all transform translate-x-4 group-hover:translate-x-0">
                                <ArrowUpRight className="text-primary w-6 h-6" />
                            </div>

                            <div className="mb-6 md:mb-8 p-5 rounded-sm bg-white/5 w-fit border border-white/10 group-hover:border-primary/50 group-hover:bg-primary/5 transition-all relative">
                                {service.icon}
                            </div>

                            <h3 className="text-xl md:text-2xl font-black text-white mb-3 md:mb-4 uppercase tracking-tight group-hover:text-primary transition-colors">{service.title}</h3>
                            <p className="text-gray-400 mb-8 text-sm md:text-base leading-relaxed font-medium">
                                {service.desc}
                            </p>

                            <div className="mt-auto">
                                <Link href="/services" className="inline-flex items-center gap-3 text-xs md:text-sm font-black text-white/60 group-hover:text-primary transition-all uppercase tracking-[0.2em]">
                                    Initialize Service
                                    <div className="w-6 h-px bg-white/20 group-hover:bg-primary group-hover:w-10 transition-all" />
                                    <ArrowUpRight className="w-4 h-4 opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all" />
                                </Link>
                            </div>
                        </ScrollReveal>
                    ))}
                </div>

            </div>
        </section>
    );
}
