"use client";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import LightRays from "@/components/ui/LightRays";
import { Check, Zap, Crown, Flame } from "lucide-react";
import { motion } from "framer-motion";

const plans = [
    {
        name: "Free Tier",
        price: "$0",
        features: ["50 Daily Prompts", "Standard Neural Processing", "Basic Persona Access", "Community Support"],
        button: "Current Plan",
        highlight: false,
        icon: <Zap className="w-8 h-8" />
    },
    {
        name: "Pro Neural",
        price: "$29",
        features: ["Unlimited Prompts", "Apex Model Access (GPT-4o)", "All Strategy Personas", "Hyper-Fast Response", "Priority Security Enclaves"],
        button: "Upgrade Now",
        highlight: true,
        icon: <Crown className="w-8 h-8" />
    },
    {
        name: "Titan AI",
        price: "$99",
        features: ["Custom Neural Fine-tuning", "Dedicated Node Access", "24/7 Strategic Support", "Infinite Processing Nodes", "Enterprise Security Audit"],
        button: "Contact Sales",
        highlight: false,
        icon: <Flame className="w-8 h-8" />
    }
];

export default function PremiumPage() {
    return (
        <main className="min-h-screen bg-black text-white selection:bg-primary/30 relative overflow-x-hidden">
            <Navbar />

            <div className="absolute inset-0 z-0 opacity-20 pointer-events-none">
                <LightRays raysColor="#00ff66" raysSpeed={0.5} />
            </div>

            <div className="relative z-10 max-w-7xl mx-auto px-6 pt-40 pb-24">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-24"
                >
                    <h1 className="text-5xl md:text-7xl font-black mb-8 uppercase tracking-tighter">
                        Elevate Your <span className="text-primary tracking-[0.2em] font-black uppercase text-[14px]">Intelligence</span>
                    </h1>
                    <p className="text-xl text-gray-400 max-w-3xl mx-auto leading-relaxed font-bold">
                        Unlock the full potential of SYNAPSE AI. Choose the neural bandwidth that matches your strategic ambition.
                    </p>
                </motion.div>

                <div className="grid md:grid-cols-3 gap-8">
                    {plans.map((plan, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: i * 0.1 }}
                            className={`relative rounded-[2.5rem] p-10 flex flex-col h-full border transition-all duration-500 overflow-hidden ${plan.highlight
                                    ? "bg-primary/5 border-primary/50 shadow-[0_0_50px_rgba(0,255,102,0.1)] scale-105 z-20"
                                    : "bg-white/5 border-white/10 hover:border-white/20"
                                }`}
                        >
                            {plan.highlight && (
                                <div className="absolute top-0 right-10 bg-primary text-black px-6 py-2 rounded-b-2xl text-[10px] font-black uppercase tracking-widest shadow-[0_0_20px_#00ff66]">
                                    Most Popular
                                </div>
                            )}

                            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-8 ${plan.highlight ? 'bg-primary text-black' : 'bg-white/5 text-primary'}`}>
                                {plan.icon}
                            </div>

                            <h3 className="text-3xl font-black mb-2 uppercase">{plan.name}</h3>
                            <div className="flex items-baseline gap-2 mb-8">
                                <span className="text-4xl font-black">{plan.price}</span>
                                <span className="text-gray-500 font-bold uppercase text-xs tracking-widest">/ Month</span>
                            </div>

                            <div className="flex-1 space-y-5 mb-12">
                                {plan.features.map((feature, idx) => (
                                    <div key={idx} className="flex items-center gap-4 text-gray-300 font-bold text-sm">
                                        <div className={`flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center ${plan.highlight ? 'bg-primary/20 text-primary' : 'bg-white/10 text-gray-500'}`}>
                                            <Check className="w-3 h-3" />
                                        </div>
                                        {feature}
                                    </div>
                                ))}
                            </div>

                            <button className={`w-full py-5 rounded-2xl font-black uppercase tracking-widest transition-all ${plan.highlight
                                    ? "bg-primary text-black hover:bg-white hover:scale-[1.02] shadow-[0_0_10px_rgba(0,255,102,0.2)]"
                                    : "bg-white/10 text-white hover:bg-white/20"
                                }`}>
                                {plan.button}
                            </button>
                        </motion.div>
                    ))}
                </div>
            </div>

            <Footer />
        </main>
    );
}
