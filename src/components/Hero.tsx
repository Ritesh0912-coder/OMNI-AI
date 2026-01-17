"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Play } from "lucide-react";
import TextDecode from "@/components/ui/TextDecode";
import Image from "next/image";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useSession } from "next-auth/react";

const Orb = dynamic(() => import("@/components/ui/Orb"), { ssr: false });

const businessHeadlines = [
    "Dominance Through Neural Intelligence",
    "Scale Your Empire With Apex Logic",
    "Architecting the Future of Global Trade",
    "Unleashing Superior Strategic Vision",
    "Precision Engineering for Every System"
];

export default function Hero() {
    const { status } = useSession();
    const [headline, setHeadline] = useState(businessHeadlines[0]);

    useEffect(() => {
        const randomHeadline = businessHeadlines[Math.floor(Math.random() * businessHeadlines.length)];
        setHeadline(randomHeadline);
    }, []);

    return (
        <section className="relative min-h-screen w-full overflow-hidden flex items-center justify-center py-20 md:py-0">
            {/* Full Screen Background Image */}
            <div className="absolute inset-0 z-0">
                <Image
                    src="/hero-chip.jpg"
                    alt="AI Neural Background"
                    fill
                    className="object-cover opacity-40"
                    priority
                />
                {/* Darker Overlay */}
                <div className="absolute inset-0 bg-black/60" />
            </div>

            {/* Background Orb - Centered behind text */}
            <div className="absolute inset-0 z-10 pointer-events-none overflow-hidden flex items-center justify-center">
                <div className="w-[400px] h-[400px] md:w-[600px] md:h-[600px] lg:w-[800px] lg:h-[800px] opacity-80 group-hover:scale-110 transition-transform duration-1000">
                    <Orb
                        hoverIntensity={0.8}
                        rotateOnHover={true}
                        hue={140}
                        forceHoverState={false}
                    />
                </div>
            </div>

            <div className="max-w-4xl mx-auto px-4 md:px-6 w-full relative z-20 text-center">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    className="space-y-6 md:space-y-10"
                >
                    <div className="inline-flex items-center gap-2 px-3 md:px-4 py-1.5 rounded-full border border-primary/30 bg-primary/10 text-primary text-[10px] md:text-xs font-bold tracking-widest uppercase backdrop-blur-md">
                        <span className="w-2 h-2 md:w-2.5 md:h-2.5 rounded-full bg-primary animate-pulse shadow-[0_0_10px_rgba(0,255,102,1)]" />
                        Intelligence Redefined
                    </div>

                    <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-black tracking-tight text-white leading-[1.1] md:leading-[1] uppercase">
                        {headline === "Dominance Through Neural Intelligence" ? (
                            <>
                                <span className="text-primary"><TextDecode text="Dominance" /></span> <TextDecode text="Through Neural Intelligence" />
                            </>
                        ) : headline === "Scale Your Empire With Apex Logic" ? (
                            <>
                                Scale Your <span className="text-primary"><TextDecode text="Empire" /></span> <TextDecode text="With Apex Logic" />
                            </>
                        ) : headline === "Architecting the Future of Global Trade" ? (
                            <>
                                Architecting the <span className="text-primary"><TextDecode text="Future" /></span> <TextDecode text="of Global Trade" />
                            </>
                        ) : headline === "Unleashing Superior Strategic Vision" ? (
                            <>
                                Unleashing Superior <span className="text-primary"><TextDecode text="Strategic" /></span> <TextDecode text="Vision" />
                            </>
                        ) : headline === "Precision Engineering for Every System" ? (
                            <>
                                Precision <span className="text-primary"><TextDecode text="Engineering" /></span> <TextDecode text="for Every System" />
                            </>
                        ) : (
                            <TextDecode text={headline} />
                        )}
                    </h1>

                    <p className="text-sm md:text-base lg:text-lg text-gray-300 max-w-2xl mx-auto leading-relaxed drop-shadow-lg font-medium px-4">
                        A new era of intelligence where technology understands, adapts, and evolves with you.
                        Empower your vision with our next-gen AI services.
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 md:gap-6 pt-4">
                        <Link
                            href={status === "authenticated" ? "/chat" : "/sign-in"}
                            className="w-full sm:w-auto px-8 md:px-10 py-4 md:py-5 rounded-full bg-primary text-black font-black text-base md:text-lg hover:bg-white transition-all duration-500 shadow-[0_0_40px_rgba(0,255,102,0.4)] flex items-center justify-center gap-2 group transform hover:scale-105 active:scale-95"
                        >
                            Get Started
                            <ArrowRight className="w-5 h-5 md:w-6 md:h-6 group-hover:translate-x-1 transition-transform" />
                        </Link>

                        <Link
                            href="/browser"
                            className="w-full sm:w-auto px-8 md:px-10 py-4 md:py-5 rounded-full border-2 border-white/20 text-white font-bold text-base md:text-lg hover:bg-white/10 transition-all duration-500 backdrop-blur-md flex items-center justify-center gap-2 group transform hover:scale-105 active:scale-95"
                        >
                            <span className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-white/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                                <Image
                                    src="/synapse-logo.png"
                                    alt="SYNAPSE AI"
                                    width={36}
                                    height={36}
                                    className="object-contain"
                                />
                            </span>
                            Explore Browser
                        </Link>
                    </div>
                </motion.div>
            </div>

            {/* Bottom Gradient Fade */}
            <div className="absolute bottom-0 left-0 right-0 h-48 bg-gradient-to-t from-black via-black/80 to-transparent z-10" />
        </section>
    );
}
