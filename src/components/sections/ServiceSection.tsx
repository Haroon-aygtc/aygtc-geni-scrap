import { motion } from "framer-motion";
import { ParallaxSection } from "@/components/ui/parallax-section";
import { GlassContainer } from "@/components/ui/glass-container";
import { ThreeDCard } from "@/components/ui/3d-card";
import { GradientText } from "@/components/ui/gradient-text";

interface ServiceSectionProps {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  features: {
    icon: React.ReactNode;
    title: string;
    description: string;
  }[];
  image: string;
  gradient: string;
  buttonText: string;
  buttonIcon: React.ReactNode;
  reverse?: boolean;
}

const ServiceSection = ({
  id,
  title,
  description,
  icon,
  features,
  image,
  gradient,
  buttonText,
  buttonIcon,
  reverse = false,
}: ServiceSectionProps) => {
  return (
    <section id={id} className="py-20">
      <div className="container mx-auto px-4">
        <div
          className={`grid grid-cols-1 lg:grid-cols-2 gap-12 items-center ${reverse ? "lg:flex-row-reverse" : ""}`}
        >
          <ParallaxSection
            speed={0.2}
            direction="up"
            className="flex justify-center"
          >
            <ThreeDCard className="w-full max-w-lg overflow-hidden rounded-2xl">
              <div className="relative">
                <div
                  className={`absolute inset-0 ${gradient} opacity-80 mix-blend-multiply z-10`}
                ></div>
                <img
                  src={image}
                  alt={title}
                  className="w-full aspect-video object-cover"
                />
                <div className="absolute inset-0 z-20 flex items-center justify-center p-8">
                  <div className="text-center">
                    <motion.div
                      initial={{ scale: 0.8, opacity: 0 }}
                      whileInView={{ scale: 1, opacity: 1 }}
                      transition={{ delay: 0.2, duration: 0.5 }}
                      viewport={{ once: true }}
                      className="flex flex-col items-center"
                    >
                      <div className="mb-4 p-3 rounded-full bg-white/10 backdrop-blur-sm">
                        {icon}
                      </div>
                      <h3 className="text-3xl font-bold text-white mb-2">
                        {title}
                      </h3>
                      <div className="w-20 h-1 bg-white/30 mx-auto mb-4"></div>
                      <p className="text-white/90 text-lg max-w-md">
                        {description}
                      </p>
                    </motion.div>
                  </div>
                </div>
              </div>
            </ThreeDCard>
          </ParallaxSection>

          <div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
              className="mb-8"
            >
              <h2 className="text-3xl font-bold mb-4">
                <GradientText
                  text={title}
                  from={gradient.split(" ")[1]}
                  to={gradient.split(" ")[2]}
                  direction="to-r"
                />
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-300">
                {description}
              </p>
            </motion.div>

            <div className="grid gap-6">
              {features.map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: reverse ? 20 : -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 * index, duration: 0.5 }}
                  viewport={{ once: true }}
                >
                  <GlassContainer
                    intensity="low"
                    className="p-6 hover:bg-white/5 transition-colors duration-300"
                  >
                    <div className="flex gap-4 items-start">
                      <div className="flex-shrink-0">
                        <div
                          className={`w-12 h-12 rounded-xl ${gradient} flex items-center justify-center`}
                        >
                          {feature.icon}
                        </div>
                      </div>
                      <div>
                        <h4 className="text-lg font-semibold mb-2">
                          {feature.title}
                        </h4>
                        <p className="text-gray-600 dark:text-gray-300">
                          {feature.description}
                        </p>
                      </div>
                    </div>
                  </GlassContainer>
                </motion.div>
              ))}
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7, duration: 0.5 }}
              viewport={{ once: true }}
              className="mt-8"
            >
              <button
                className={`${gradient} text-white px-6 py-3 rounded-xl flex items-center gap-2 hover:opacity-90 transition-opacity`}
              >
                {buttonText}
                {buttonIcon}
              </button>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ServiceSection;
