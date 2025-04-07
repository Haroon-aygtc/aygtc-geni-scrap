import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowRight, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { GlassContainer } from "@/components/ui/glass-container";
import { GradientText } from "@/components/ui/gradient-text";
import { AnimatedGradientBorder } from "@/components/ui/animated-gradient-border";
import { ThreeDCard } from "@/components/ui/3d-card";

const ModernHero = () => {
  const targetRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: targetRef,
    offset: ["start start", "end start"],
  });

  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.5], [1, 0.8]);
  const y = useTransform(scrollYProgress, [0, 0.5], [0, 100]);

  const divisionCards = [
    {
      title: "Government",
      icon: "https://api.dicebear.com/7.x/shapes/svg?seed=government&backgroundColor=0284c7",
      color: "from-blue-600 to-indigo-600",
    },
    {
      title: "Property",
      icon: "https://api.dicebear.com/7.x/shapes/svg?seed=property&backgroundColor=059669",
      color: "from-emerald-600 to-teal-600",
    },
    {
      title: "Transport",
      icon: "https://api.dicebear.com/7.x/shapes/svg?seed=transport&backgroundColor=7c3aed",
      color: "from-purple-600 to-violet-600",
    },
    {
      title: "Labor",
      icon: "https://api.dicebear.com/7.x/shapes/svg?seed=labor&backgroundColor=d97706",
      color: "from-amber-600 to-orange-600",
    },
  ];

  return (
    <div
      ref={targetRef}
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
    >
      {/* Background with particles */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-b from-gray-900 via-gray-900 to-gray-800 dark:from-black dark:via-gray-900 dark:to-gray-800"></div>
        <div className="absolute inset-0 bg-[url('/public/images/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-blue-500/10 backdrop-blur-[1px]"></div>
        </div>
        <div className="absolute inset-0 overflow-hidden">
          {Array.from({ length: 20 }).map((_, i) => (
            <div
              key={i}
              className="absolute rounded-full bg-white/10 backdrop-blur-md"
              style={{
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
                width: `${Math.random() * 300 + 50}px`,
                height: `${Math.random() * 300 + 50}px`,
                opacity: Math.random() * 0.5,
                transform: `scale(${Math.random() * 0.5 + 0.5})`,
                animation: `float ${Math.random() * 10 + 10}s ease-in-out infinite`,
                animationDelay: `${Math.random() * 5}s`,
              }}
            />
          ))}
        </div>
      </div>

      {/* Content */}
      <motion.div
        style={{ opacity, scale, y }}
        className="container mx-auto px-4 relative z-10 pt-20"
      >
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="text-center lg:text-left"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
            >
              <h1 className="text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold text-white leading-tight mb-6">
                <span className="block mb-2">Al Yalayis</span>
                <GradientText
                  text="Business Hub"
                  from="from-blue-400"
                  via="via-purple-400"
                  to="to-pink-400"
                />
              </h1>
            </motion.div>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.6 }}
              className="text-xl text-gray-300 mb-8 max-w-xl mx-auto lg:mx-0"
            >
              A premier business ecosystem offering comprehensive services
              across government transactions, real estate, transportation, and
              workforce solutions.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.6 }}
              className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start"
            >
              <AnimatedGradientBorder
                gradientClassName="bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"
                borderWidth={2}
                glowIntensity="medium"
              >
                <Button className="bg-gray-900 hover:bg-gray-800 text-white px-8 py-6 rounded-xl text-lg">
                  Explore Services
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </AnimatedGradientBorder>

              <GlassContainer
                intensity="medium"
                borderLight
                className="px-8 py-6 rounded-xl"
              >
                <Button
                  variant="ghost"
                  className="text-white hover:text-white hover:bg-transparent p-0 text-lg"
                >
                  Contact Us
                </Button>
              </GlassContainer>
            </motion.div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3, duration: 0.8 }}
            className="hidden lg:block"
          >
            <div className="relative">
              <ThreeDCard className="bg-gray-900/50 backdrop-blur-md p-6 rounded-2xl border border-white/10">
                <div className="grid grid-cols-2 gap-4">
                  {divisionCards.map((card, index) => (
                    <motion.div
                      key={index}
                      whileHover={{ y: -5, scale: 1.02 }}
                      className="relative overflow-hidden rounded-xl"
                    >
                      <div
                        className={`absolute inset-0 bg-gradient-to-br ${card.color} opacity-20 rounded-xl`}
                      ></div>
                      <GlassContainer
                        intensity="low"
                        className="p-6 text-center h-full flex flex-col items-center justify-center transition-colors hover:bg-white/5"
                      >
                        <img
                          src={card.icon}
                          alt={card.title}
                          className="w-16 h-16 mb-4"
                        />
                        <h3 className="font-semibold text-white">
                          {card.title}
                        </h3>
                      </GlassContainer>
                    </motion.div>
                  ))}
                </div>
                <div className="mt-4 p-4 text-center">
                  <a
                    href="#services"
                    className="text-white flex items-center justify-center gap-1 font-medium"
                  >
                    Discover All Services <ArrowRight className="w-4 h-4" />
                  </a>
                </div>
              </ThreeDCard>
            </div>
          </motion.div>
        </div>
      </motion.div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2, duration: 1 }}
        className="absolute bottom-10 left-1/2 transform -translate-x-1/2 z-10"
      >
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ repeat: Infinity, duration: 1.5 }}
          className="flex flex-col items-center"
        >
          <span className="text-white/80 text-sm mb-2">Scroll to explore</span>
          <GlassContainer
            intensity="low"
            className="w-10 h-16 flex justify-center items-center rounded-full"
          >
            <motion.div
              animate={{ y: [0, 12, 0] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
            >
              <ChevronDown className="h-5 w-5 text-white/70" />
            </motion.div>
          </GlassContainer>
        </motion.div>
      </motion.div>

      {/* Add floating gradient orbs */}
      <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-blue-500/20 rounded-full filter blur-3xl animate-blob"></div>
      <div className="absolute top-1/3 right-1/4 w-72 h-72 bg-purple-500/20 rounded-full filter blur-3xl animate-blob animation-delay-2000"></div>
      <div className="absolute bottom-1/4 right-1/3 w-80 h-80 bg-pink-500/20 rounded-full filter blur-3xl animate-blob animation-delay-4000"></div>

      <style jsx global>{`
        @keyframes float {
          0%,
          100% {
            transform: translateY(0) rotate(0deg);
          }
          50% {
            transform: translateY(-20px) rotate(5deg);
          }
        }
        @keyframes blob {
          0% {
            transform: scale(1) translate(0, 0);
          }
          33% {
            transform: scale(1.1) translate(30px, -50px);
          }
          66% {
            transform: scale(0.9) translate(-20px, 20px);
          }
          100% {
            transform: scale(1) translate(0, 0);
          }
        }
        .animate-blob {
          animation: blob 15s infinite alternate;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
        .animate-gradient-xy {
          animation: gradient-xy 10s ease infinite;
        }
        @keyframes gradient-xy {
          0%,
          100% {
            background-position: 0% 0%;
          }
          50% {
            background-position: 100% 100%;
          }
        }
      `}</style>
    </div>
  );
};

export default ModernHero;
