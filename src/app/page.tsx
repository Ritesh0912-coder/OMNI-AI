import Navbar from "../components/Navbar";
import Hero from "../components/Hero";
import SmartSolutions from "../components/SmartSolutions";
import Services from "../components/Services";
import RealWorldStrategies from "../components/RealWorldStrategies";
import Contact from "../components/Contact";
import QuickContact from "../components/QuickContact";
import Footer from "../components/Footer";
import BusinessSignature from "../components/BusinessSignature";
import ScrollReveal from "@/components/ui/ScrollReveal";

export default function Home() {
  return (
    <main className="min-h-screen bg-black text-white overflow-x-hidden selection:bg-primary selection:text-black">
      <Navbar />
      <Hero />
      <ScrollReveal>
        <SmartSolutions />
      </ScrollReveal>
      <ScrollReveal delay={0.2}>
        <Services />
      </ScrollReveal>
      <ScrollReveal delay={0.3}>
        <RealWorldStrategies />
      </ScrollReveal>
      <ScrollReveal delay={0.4}>
        <QuickContact />
      </ScrollReveal>
      <ScrollReveal delay={0.5}>
        <Contact />
      </ScrollReveal>
      <Footer />
      <BusinessSignature />
    </main>
  );
}
