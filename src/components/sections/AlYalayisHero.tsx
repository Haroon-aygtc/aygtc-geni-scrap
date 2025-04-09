import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ChevronRight } from "lucide-react";

const AlYalayisHero = () => {
  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background with overlay */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-900/90 to-purple-900/90 mix-blend-multiply z-10"></div>
        <video
          autoPlay
          loop
          muted
          playsInline
          className="w-full h-full object-cover"
        >
          <source
            src="https://assets.mixkit.co/videos/preview/mixkit-aerial-view-of-city-buildings-at-night-11-large.mp4"
            type="video/mp4"
          />
          Your browser does not support the video tag.
        </video>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 relative z-10 pt-20">
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
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight mb-6">
                <span className="block">Al Yalayis</span>
                <span className="text-blue-400">Business Hub</span>
              </h1>
            </motion.div>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.6 }}
              className="text-xl text-gray-200 mb-8 max-w-xl mx-auto lg:mx-0"
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
              <Button className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-6 rounded-full text-lg">
                Explore Services
              </Button>
              <Button
                variant="outline"
                className="bg-transparent border-white text-white hover:bg-white/10 px-8 py-6 rounded-full text-lg"
              >
                Contact Us
              </Button>
            </motion.div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3, duration: 0.8 }}
            className="hidden lg:block"
          >
            <div className="relative">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl blur opacity-75"></div>
              <div className="relative bg-white dark:bg-gray-900 rounded-2xl overflow-hidden shadow-2xl">
                <div className="grid grid-cols-2 gap-0.5">
                  <div className="bg-blue-100 dark:bg-blue-900/30 p-6 text-center hover:bg-blue-200 dark:hover:bg-blue-800/50 transition-colors">
                    <motion.div
                      whileHover={{ y: -5 }}
                      className="flex flex-col items-center"
                    >
                      <img
                        src="https://api.dicebear.com/7.x/shapes/svg?seed=government"
                        alt="Government Services"
                        className="w-16 h-16 mb-4"
                      />
                      <h3 className="font-semibold text-gray-900 dark:text-white">
                        Government Services
                      </h3>
                    </motion.div>
                  </div>
                  <div className="bg-emerald-100 dark:bg-emerald-900/30 p-6 text-center hover:bg-emerald-200 dark:hover:bg-emerald-800/50 transition-colors">
                    <motion.div
                      whileHover={{ y: -5 }}
                      className="flex flex-col items-center"
                    >
                      <img
                        src="https://api.dicebear.com/7.x/shapes/svg?seed=property"
                        alt="Property"
                        className="w-16 h-16 mb-4"
                      />
                      <h3 className="font-semibold text-gray-900 dark:text-white">
                        Property
                      </h3>
                    </motion.div>
                  </div>
                  <div className="bg-purple-100 dark:bg-purple-900/30 p-6 text-center hover:bg-purple-200 dark:hover:bg-purple-800/50 transition-colors">
                    <motion.div
                      whileHover={{ y: -5 }}
                      className="flex flex-col items-center"
                    >
                      <img
                        src="https://api.dicebear.com/7.x/shapes/svg?seed=transport"
                        alt="Transport"
                        className="w-16 h-16 mb-4"
                      />
                      <h3 className="font-semibold text-gray-900 dark:text-white">
                        Transport
                      </h3>
                    </motion.div>
                  </div>
                  <div className="bg-amber-100 dark:bg-amber-900/30 p-6 text-center hover:bg-amber-200 dark:hover:bg-amber-800/50 transition-colors">
                    <motion.div
                      whileHover={{ y: -5 }}
                      className="flex flex-col items-center"
                    >
                      <img
                        src="https://api.dicebear.com/7.x/shapes/svg?seed=labor"
                        alt="Labor Supply"
                        className="w-16 h-16 mb-4"
                      />
                      <h3 className="font-semibold text-gray-900 dark:text-white">
                        Labor Supply
                      </h3>
                    </motion.div>
                  </div>
                </div>
                <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-4 text-center">
                  <a
                    href="#services"
                    className="text-white flex items-center justify-center gap-1 font-medium"
                  >
                    Discover All Services <ChevronRight className="w-4 h-4" />
                  </a>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

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
          <div className="w-6 h-10 border-2 border-white/50 rounded-full flex justify-center p-1">
            <motion.div
              animate={{ y: [0, 12, 0] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
              className="w-1.5 h-1.5 bg-white rounded-full"
            ></motion.div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default AlYalayisHero;
