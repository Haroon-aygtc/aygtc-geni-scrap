import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { GlassContainer } from "@/components/ui/glass-container";

interface Stat {
  value: string;
  label: string;
  icon: React.ReactNode;
  gradient: string;
}

const StatsSection = ({ stats }: { stats: Stat[] }) => {
  const targetRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: targetRef,
    offset: ["start end", "end start"],
  });

  const opacity = useTransform(scrollYProgress, [0, 0.5, 1], [0, 1, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.5, 1], [0.8, 1, 0.8]);

  return (
    <section ref={targetRef} className="py-20 relative overflow-hidden">
      {/* Background with gradient */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="absolute inset-0 bg-[url('/public/images/grid.svg')] bg-center opacity-10"></div>
      </div>

      {/* Floating gradient orbs */}
      <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-white/10 rounded-full filter blur-3xl"></div>
      <div className="absolute bottom-1/4 right-1/4 w-72 h-72 bg-white/10 rounded-full filter blur-3xl"></div>

      <motion.div
        style={{ opacity, scale }}
        className="container mx-auto px-4 relative z-10"
      >
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="flex justify-center"
            >
              <GlassContainer
                intensity="medium"
                borderLight
                className="p-6 text-center w-full max-w-xs"
              >
                <div
                  className={`w-16 h-16 mx-auto mb-4 rounded-2xl ${stat.gradient} flex items-center justify-center`}
                >
                  {stat.icon}
                </div>
                <div className="text-3xl md:text-4xl font-bold text-white mb-2">
                  {stat.value}
                </div>
                <div className="text-blue-100">{stat.label}</div>
              </GlassContainer>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </section>
  );
};

export default StatsSection;
