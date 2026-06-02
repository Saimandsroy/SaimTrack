"use client";

import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { motion, useScroll, useSpring, useMotionValue, useTransform, AnimatePresence, type MotionValue } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { SmoothScroll } from "@/components/app/smooth-scroll";

// Editorial cubic bezier: deliberate, confident
const ease = [0.16, 1, 0.3, 1] as const;

// Viewport-triggered reveal wrapper
function Reveal({ children, className, delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30, scale: 0.98 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.8, ease, delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// Line-by-line editorial text reveal
function TextReveal({ text, className, delay = 0 }: { text: string; className?: string; delay?: number }) {
  const lines = text.split("\n");
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-60px" }}
      variants={{
        hidden: {},
        visible: { transition: { staggerChildren: 0.15, delayChildren: delay } },
      }}
      className={className}
    >
      {lines.map((line, i) => (
        <span key={i} className="block overflow-hidden">
          <motion.span
            variants={{
              hidden: { opacity: 0, y: "100%" },
              visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease } },
            }}
            className="block"
          >
            {line}
          </motion.span>
        </span>
      ))}
    </motion.div>
  );
}

const modulesData = [
  { id: "03", title: "Study Sessions", desc: "Track deep work hours and daily learning consistency." },
  { id: "04", title: "DSA Progress", desc: "Measure coding growth topic by topic." },
  { id: "05", title: "Job Applications", desc: "Manage applications, interviews and opportunities." },
  { id: "06", title: "Habits & Fitness", desc: "Build routines that support long-term growth." },
  { id: "07", title: "Learning Journal", desc: "Capture ideas, notes and lessons." },
  { id: "08", title: "Goals", desc: "Track progress toward meaningful outcomes." }
];

// Premium Hero Headline Animation
function HeroHeadline() {
  const words = ["STUDY.", "BUILD.", "GROW."];
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const timeout = setTimeout(() => {
      const interval = setInterval(() => {
        setActiveIndex((prev) => (prev + 1) % words.length);
      }, 2000);
      return () => clearInterval(interval);
    }, 1200);
    return () => clearTimeout(timeout);
  }, []);

  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-60px" }}
      variants={{
        hidden: {},
        visible: { transition: { staggerChildren: 0.15 } },
      }}
      className="text-[5.5rem] md:text-[9.5rem] leading-[0.85] uppercase font-bold tracking-tighter mb-10 flex flex-col text-[#F5F2EC]"
    >
      {words.map((word, i) => {
        const isActive = i === activeIndex;
        return (
          <span key={word} className="block overflow-hidden">
            <motion.span
              variants={{
                hidden: { opacity: 0, y: "100%" },
                visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } },
              }}
              className="block relative w-fit"
            >
              <motion.span
                animate={{
                  opacity: isActive ? 1 : 0.3,
                  color: isActive ? "#FFF6E5" : "#F5F2EC",
                }}
                transition={{ duration: 0.6, ease: "easeInOut" }}
                className="block relative z-10"
              >
                {word}
              </motion.span>
              
              <motion.div
                initial={false}
                animate={{
                  scaleX: isActive ? 1 : 0,
                  opacity: isActive ? 1 : 0,
                }}
                transition={{ duration: 0.6, ease: "easeInOut" }}
                className="absolute bottom-[4%] md:bottom-[8%] left-0 right-0 h-[3px] md:h-[5px] bg-[#CBA365] origin-left z-20 rounded-full"
              />

              {isActive && (
                <motion.span
                  initial={{ x: "-100%" }}
                  animate={{ x: "200%" }}
                  transition={{ duration: 0.7, ease: "easeInOut" }}
                  className="absolute top-0 left-0 z-30 w-[60%] h-full bg-gradient-to-r from-transparent via-white to-transparent opacity-[0.08] skew-x-[-20deg] pointer-events-none"
                />
              )}
            </motion.span>
          </span>
        );
      })}
    </motion.div>
  );
}

// Premium Rotating Hero Visuals
function HeroImageRotation() {
  const visuals = [
    { id: "study", src: "/images/hero/custom_study.jpg", label: "Study" },
    { id: "build", src: "/images/hero/custom_dsa.jpg", label: "Build" },
    { id: "grow", src: "/images/hero/custom_goal.jpg", label: "Growth" },
    { id: "discipline", src: "/images/hero/custom_fitness.jpg", label: "Discipline" }
  ];

  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const timeout = setTimeout(() => {
      const interval = setInterval(() => {
        setActiveIndex((prev) => (prev + 1) % visuals.length);
      }, 2000);
      return () => clearInterval(interval);
    }, 1200);
    return () => clearTimeout(timeout);
  }, []);

  return (
    <>
      <div className="absolute inset-0 w-full h-full">
        <AnimatePresence>
          <motion.div
            key={activeIndex}
            initial={{ opacity: 0, scale: 1.05 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, transition: { duration: 0.8 } }}
            transition={{ duration: 0.8, ease: "easeInOut" }}
            className="absolute inset-0 w-full h-full"
          >
              <img 
                src={visuals[activeIndex].src} 
                alt={visuals[activeIndex].label}
                className="object-contain w-full h-full p-6"
              />
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="z-20 bg-[#2A2726] rounded-br-[2.5rem] p-4 absolute top-0 left-0">
        <Link href="/auth/sign-in" className="w-20 h-20 rounded-full border border-white/10 bg-[#1A1A1A] flex items-center justify-center text-[#F5F2EC] cursor-pointer hover:bg-black transition-colors group/btn">
          <ArrowUpRight className="w-8 h-8 group-hover/btn:translate-x-1 group-hover/btn:-translate-y-1 transition-transform duration-300" />
        </Link>
      </div>

      <div className="absolute bottom-16 left-10 origin-bottom-left -rotate-90 translate-x-4 pointer-events-none z-20">
        <div className="relative">
          <AnimatePresence>
            <motion.span
              key={activeIndex}
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.8 }}
              exit={{ opacity: 0, transition: { duration: 0.8 } }}
              transition={{ duration: 0.8, ease: "easeInOut" }}
              className="absolute bottom-0 left-0 uppercase text-5xl font-bold text-[#2A2726] tracking-widest mix-blend-hard-light whitespace-nowrap"
            >
              {visuals[activeIndex].label}
            </motion.span>
          </AnimatePresence>
        </div>
      </div>
    </>
  );
}

export default function HomePage() {
  // Lenis & Scroll Progress
  const { scrollY, scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 200, damping: 50, restDelta: 0.001 });

  // Depth-Based Parallax (Max 20px movement)
  const bgY = useTransform(scrollY, [0, 2000], [0, 20]); // Slowest
  const imgY = useTransform(scrollY, [0, 2000], [0, -15]); // Medium
  const decorY = useTransform(scrollY, [0, 2000], [0, -25]); // Faster

  // Mouse Parallax (Hero only)
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const parallaxX = useTransform(mouseX, [0, 1], [-8, 8]);
  const parallaxY = useTransform(mouseY, [0, 1], [-5, 5]);
  const smoothX = useSpring(parallaxX, { stiffness: 50, damping: 30 });
  const smoothY = useSpring(parallaxY, { stiffness: 50, damping: 30 });

  useEffect(() => {
    function handleMouse(e: MouseEvent) {
      mouseX.set(e.clientX / window.innerWidth);
      mouseY.set(e.clientY / window.innerHeight);
    }
    window.addEventListener("mousemove", handleMouse);
    return () => window.removeEventListener("mousemove", handleMouse);
  }, [mouseX, mouseY]);

  // Section 3 Sticky Storytelling
  const s3Ref = useRef(null);
  const { scrollYProgress: s3Progress } = useScroll({
    target: s3Ref,
    offset: ["start start", "end end"]
  });

  return (
    <main className="relative w-full bg-[#2A2726] text-[#F5F2EC] selection:bg-[#CBA365] selection:text-[#2A2726]">
      <SmoothScroll />
      
      {/* Premium Scroll Progress */}
      <motion.div
        style={{ scaleX }}
        className="fixed top-0 left-0 right-0 h-[2px] bg-[#CBA365] origin-left z-50"
      />

      {/* Premium Background Atmosphere */}
      
      {/* Noise Texture */}
      <div 
        className="fixed inset-0 z-0 pointer-events-none opacity-[0.02] mix-blend-overlay"
        style={{ 
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
        }}
      />

      {/* Ambient light behind typography */}
      <motion.div
        className="fixed top-0 left-0 w-[800px] h-[800px] pointer-events-none z-0 opacity-[0.03] -translate-x-1/2 -translate-y-1/4"
        style={{ 
          y: bgY,
          background: "radial-gradient(circle, #CBA365 0%, transparent 70%)" 
        }}
      />

      {/* Ambient glow behind hero image */}
      <motion.div
        className="fixed top-[20%] right-0 w-[1000px] h-[1000px] pointer-events-none z-0 opacity-[0.05] translate-x-1/3"
        style={{ 
          y: bgY,
          background: "radial-gradient(circle, #CBA365 0%, transparent 70%)" 
        }}
      />

      {/* ═══════════════════ SECTION 1: HERO ═══════════════════ */}
      <div className="relative z-10 min-h-screen flex items-center md:px-12 grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20 max-w-[1800px] mx-auto px-6 py-20">
        
        {/* Left Side: Typography */}
        <div className="lg:col-span-7 flex flex-col justify-center">
          <div className="absolute top-8 left-8 flex items-center gap-4 z-50">
            <span className="text-[#F5F2EC]/40 text-sm tracking-widest uppercase font-semibold">SaimTrack // 1.0</span>
          </div>

          <HeroHeadline />

          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease, delay: 0.6 }}
            className="text-xl md:text-2xl text-[#F5F2EC]/70 max-w-lg mb-14 font-medium leading-relaxed"
          >
            One focused system for tracking study, fitness, learning and career progress.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease, delay: 0.7 }}
            className="flex flex-col sm:flex-row items-start sm:items-center gap-8"
          >
            <motion.div whileHover={{ scale: 1.02, y: -2 }} whileTap={{ scale: 0.98 }} transition={{ duration: 0.2 }}>
              <Link 
                href="/auth/sign-up"
                className="bg-[#CBA365] text-[#2A2726] px-10 py-5 rounded-full font-bold text-lg shadow-[0_0_30px_rgba(203,163,101,0.15)] flex items-center gap-3 group"
              >
                Start Free
                <ArrowUpRight className="w-5 h-5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </Link>
            </motion.div>
            
            <Link 
              href="/auth/sign-in"
              className="text-[#F5F2EC]/60 hover:text-[#F5F2EC] font-semibold text-lg flex items-center gap-2 transition-colors"
            >
              View Demo
            </Link>
          </motion.div>
        </div>

        {/* Right Side: Visual Composition (Medium Parallax) */}
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.9, ease, delay: 0.3 }}
          style={{ x: smoothX, y: smoothY }}
          className="lg:col-span-5 relative"
        >


          <motion.div style={{ y: imgY }} className="overflow-hidden aspect-[4/5] md:aspect-[5/6] group shadow-black/40 bg-[#161616] rounded-[2.5rem] relative shadow-2xl border border-white/5">
            <HeroImageRotation />
          </motion.div>
        </motion.div>

      </div>

      {/* ═══════════════════ SECTION 2: WHAT IS CAREEROS ═══════════════════ */}
      <section className="relative z-10 w-full max-w-[1800px] mx-auto px-6 md:px-12 py-32 lg:py-48 grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20 border-t border-white/5">
        <Reveal className="lg:col-span-5 pt-4">
          <span className="text-[#F5F2EC]/40 text-sm tracking-widest uppercase font-semibold">02 // ABOUT</span>
        </Reveal>
        <div className="lg:col-span-7">
          <TextReveal 
            text={"Everything you need to grow.\nNothing you don't."} 
            className="text-5xl md:text-7xl font-bold text-[#F5F2EC] tracking-tighter leading-[1.05] mb-12" 
          />
          <Reveal delay={0.2}>
            <div className="text-xl md:text-2xl text-[#8E8B85] leading-relaxed max-w-4xl tracking-tight">
              <p>SaimTrack combines study tracking, DSA progress, job applications, habits, fitness and learning into a single operating system.</p>
              <p>Instead of managing multiple tools, everything lives in one focused workspace.</p>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ═══════════════════ SECTION 3: WHAT WE TRACK (STICKY STORYTELLING) ═══════════════════ */}
      <div ref={s3Ref} className="relative z-10 w-full h-[350vh] bg-[#2A2726] border-t border-white/5">
        <div className="sticky top-0 h-screen w-full overflow-hidden flex flex-col justify-center max-w-[1800px] mx-auto px-6 md:px-12">
          
          <div className="absolute top-[15vh] md:top-[20vh] left-6 md:left-12 z-20">
            <span className="text-[#F5F2EC]/40 text-sm tracking-widest uppercase font-semibold">03 // MODULES</span>
          </div>
          
          <div className="relative w-full h-[60vh] flex items-center justify-center">
            {modulesData.map((item, i) => (
              <ModuleItem key={i} item={item} index={i} total={modulesData.length} s3Progress={s3Progress} />
            ))}
          </div>
        </div>
      </div>

      {/* ═══════════════════ SECTION 4: ONE SYSTEM ═══════════════════ */}
      <section className="relative z-10 w-full max-w-[1800px] mx-auto px-6 md:px-12 py-40 lg:py-64 flex flex-col items-center justify-center text-center border-t border-white/5">
        <TextReveal 
          text={"Stop switching\nbetween five tools."} 
          className="text-6xl md:text-[8.5rem] leading-[0.9] font-bold text-[#F5F2EC] tracking-tighter mb-14" 
        />
        <Reveal delay={0.2}>
          <div className="col-span-1 md:col-span-1 flex flex-col justify-center">
            <h3 className="text-4xl font-bold tracking-tight text-[#F5F2EC] mb-6">Built for engineers.</h3>
            <p className="text-[#8E8B85] text-lg leading-relaxed">
            SaimTrack gives ambitious engineers one place to study, build and grow.
            </p>
          </div>
        </Reveal>
      </section>

      {/* ═══════════════════ SECTION 5: FOOTER ═══════════════════ */}
      <Reveal>
        <footer className="relative z-10 w-full max-w-[1800px] mx-auto px-6 md:px-12 py-16 border-t border-white/10">
          <div className="border-t border-white/5 py-12 flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 flex items-center justify-center">
                <img src="/logo.png" alt="SaimTrack Logo" className="w-full h-full object-contain" />
              </div>
              <h4 className="text-3xl font-bold tracking-tight text-[#F5F2EC] mb-2">SaimTrack</h4>
            </div>

            <div className="flex items-center gap-8 text-[#8E8B85] text-sm font-medium">
              <Link href="/auth/sign-in" className="hover:text-white transition-colors">Sign in</Link>
              <Link href="/auth/sign-up" className="hover:text-white transition-colors">Sign up</Link>
            </div>
          </div>

          <div className="pb-12 text-center text-[#8E8B85]/50 text-sm font-medium">
            <p>© 2026 SaimTrack</p>
          </div>
        </footer>
      </Reveal>
    </main>
  );
}

function ModuleItem({ item, index, total, s3Progress }: { item: { id: string; title: string; desc: string }; index: number; total: number; s3Progress: MotionValue<number> }) {
  const start = index / total;
  const end = (index + 1) / total;
  const center = (start + end) / 2;
  
  const opacity = useTransform(s3Progress, p => {
    const diff = Math.abs(p - center);
    return diff > 0.12 ? 0 : 1 - (diff / 0.12);
  });
  
  const y = useTransform(s3Progress, p => {
    const diff = p - center;
    const clamped = Math.max(-0.15, Math.min(0.15, diff));
    return clamped * -400;
  });
  
  const scale = useTransform(s3Progress, p => {
    const diff = Math.abs(p - center);
    return diff > 0.1 ? 0.96 : 1 - (diff / 0.1) * 0.04;
  });

  return (
    <motion.div
      style={{ opacity, y, scale }}
      className="absolute inset-0 flex flex-col lg:flex-row items-start lg:items-center justify-center gap-6 lg:gap-24 w-full pointer-events-none"
    >
      <span className="text-[6rem] md:text-[12rem] font-bold text-[#F5F2EC]/5 tracking-tighter leading-none">
        {item.id}
      </span>
      <div className="flex flex-col gap-4">
        <h3 className="text-4xl md:text-7xl font-bold text-[#F5F2EC] tracking-tighter leading-none">
          {item.title}
        </h3>
        <p className="text-xl md:text-3xl text-[#F5F2EC]/50 font-medium max-w-[400px]">
          {item.desc}
        </p>
      </div>
    </motion.div>
  );
}
