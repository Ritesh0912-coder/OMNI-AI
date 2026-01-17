"use client";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import LightRays from "@/components/ui/LightRays";
import { TrendingUp, Globe, Award, Users, Target, Zap, Shield, BarChart3 } from "lucide-react";
import { motion } from "framer-motion";
import Image from "next/image";

export default function AboutPage() {
    return (
        <main className="min-h-screen bg-black text-white selection:bg-primary/30 relative overflow-x-hidden">
            <Navbar />

            <div className="absolute inset-0 z-0 opacity-20 pointer-events-none">
                <LightRays raysColor="#00ff66" raysSpeed={0.5} />
            </div>

            {/* Hero Section */}
            <div className="relative z-10 max-w-7xl mx-auto px-4 md:px-6 pt-32 md:pt-40 pb-16 md:pb-24">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-16 md:mb-24"
                >
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-primary/30 bg-primary/10 text-primary text-xs font-bold tracking-widest uppercase backdrop-blur-md mb-8">
                        <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                        Enterprise AI Solutions
                    </div>
                    <h1 className="text-4xl md:text-5xl lg:text-7xl font-black mb-6 md:mb-8 uppercase tracking-tight">
                        Transforming Business <br />
                        <span className="text-primary">Intelligence</span>
                    </h1>
                    <p className="text-base md:text-xl text-gray-400 max-w-3xl mx-auto leading-relaxed font-medium px-4">
                        SYNAPSE AI delivers cutting-edge artificial intelligence solutions that empower enterprises to make data-driven decisions, optimize operations, and achieve sustainable competitive advantage.
                    </p>
                </motion.div>

                {/* Stats Section */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8 mb-16 md:mb-24">
                    {[
                        { value: "500+", label: "Enterprise Clients" },
                        { value: "98%", label: "Client Retention" },
                        { value: "50M+", label: "Data Points Analyzed" },
                        { value: "24/7", label: "AI Operations" }
                    ].map((stat, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, scale: 0.9 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            transition={{ delay: i * 0.1 }}
                            className="bg-white/5 border border-white/10 rounded-2xl md:rounded-3xl p-4 md:p-8 text-center hover:border-primary/50 transition-colors"
                        >
                            <div className="text-2xl md:text-4xl font-black text-primary mb-2">{stat.value}</div>
                            <div className="text-xs md:text-sm text-gray-400 uppercase tracking-wider font-bold">{stat.label}</div>
                        </motion.div>
                    ))}
                </div>

                {/* Core Values */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 mb-16 md:mb-24">
                    {[
                        {
                            icon: <Target className="w-8 h-8" />,
                            title: "Strategic Vision",
                            desc: "We deliver AI solutions that align with your business objectives and drive measurable ROI across all operations."
                        },
                        {
                            icon: <TrendingUp className="w-8 h-8" />,
                            title: "Predictive Intelligence",
                            desc: "Our advanced analytics engines forecast market trends and business outcomes with industry-leading accuracy."
                        },
                        {
                            icon: <Shield className="w-8 h-8" />,
                            title: "Enterprise Security",
                            desc: "Bank-grade encryption and compliance with global data protection standards ensure your information stays secure."
                        },
                        {
                            icon: <Globe className="w-8 h-8" />,
                            title: "Global Scale",
                            desc: "Our infrastructure supports enterprises across 50+ countries with 99.99% uptime and multi-region deployment."
                        },
                        {
                            icon: <Zap className="w-8 h-8" />,
                            title: "Real-Time Processing",
                            desc: "Process millions of data points per second to deliver insights when they matter most for critical decisions."
                        },
                        {
                            icon: <Award className="w-8 h-8" />,
                            title: "Industry Leadership",
                            desc: "Recognized by Gartner and Forrester as a leader in AI-powered business intelligence platforms."
                        }
                    ].map((item, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: i * 0.1 }}
                            className="bg-white/5 border border-white/10 rounded-2xl md:rounded-3xl p-6 md:p-8 hover:border-primary/50 transition-all group"
                        >
                            <div className="w-14 h-14 md:w-16 md:h-16 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mb-4 md:mb-6 group-hover:scale-110 group-hover:bg-primary/20 transition-all border border-primary/20">
                                {item.icon}
                            </div>
                            <h3 className="text-lg md:text-xl font-black mb-3 md:mb-4 uppercase tracking-tight">{item.title}</h3>
                            <p className="text-sm md:text-base text-gray-400 leading-relaxed">{item.desc}</p>
                        </motion.div>
                    ))}
                </div>

                {/* Mission Statement */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="bg-gradient-to-br from-primary/10 to-transparent border border-primary/30 rounded-3xl md:rounded-[3rem] p-8 md:p-16 text-center mb-16 md:mb-24"
                >
                    <BarChart3 className="w-12 h-12 md:w-16 md:h-16 text-primary mx-auto mb-6 md:mb-8" />
                    <h2 className="text-2xl md:text-3xl lg:text-4xl font-black mb-4 md:mb-6 uppercase">Our Mission</h2>
                    <p className="text-base md:text-lg text-gray-300 max-w-3xl mx-auto leading-relaxed">
                        To empower global enterprises with AI-driven intelligence that transforms raw data into strategic advantage.
                        We believe every business decision should be backed by predictive insights, real-time analytics, and
                        actionable intelligence that drives sustainable growth and market leadership.
                    </p>
                </motion.div>

                {/* Team Section */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-center"
                >
                    <Users className="w-12 h-12 md:w-16 md:h-16 text-primary mx-auto mb-6 md:mb-8" />
                    <h2 className="text-2xl md:text-3xl lg:text-4xl font-black mb-4 md:mb-6 uppercase">World-Class Expertise</h2>
                    <p className="text-base md:text-lg text-gray-400 max-w-3xl mx-auto leading-relaxed mb-8 md:mb-12 px-4">
                        Our team comprises AI researchers, data scientists, and business strategists from leading institutions
                        including MIT, Stanford, and top Fortune 500 companies. Together, we deliver solutions that set
                        industry benchmarks.
                    </p>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 max-w-4xl mx-auto">
                        {[
                            "PhD Researchers",
                            "ML Engineers",
                            "Business Analysts",
                            "Enterprise Architects"
                        ].map((role, i) => (
                            <div key={i} className="bg-white/5 border border-white/10 rounded-xl md:rounded-2xl p-4 md:p-6 hover:border-primary/50 transition-colors">
                                <div className="text-xs md:text-sm font-bold text-primary uppercase tracking-wider">{role}</div>
                            </div>
                        ))}
                    </div>
                </motion.div>
            </div>

            <Footer />
        </main>
    );
}
