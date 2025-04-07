import { motion } from "framer-motion";
import { Home, Building, MapPin, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";

const AlYalayisProperty = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      viewport={{ once: true }}
      className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl overflow-hidden"
    >
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-600/80 to-teal-700/80 mix-blend-multiply z-10"></div>
        <img
          src="https://images.unsplash.com/photo-1582407947304-fd86f028f716?w=1200&q=80"
          alt="UAE Real Estate"
          className="w-full h-64 object-cover"
        />
        <div className="absolute inset-0 z-20 flex items-center justify-center">
          <div className="text-center px-6">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              whileInView={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              viewport={{ once: true }}
            >
              <h3 className="text-3xl font-bold text-white mb-2">
                Al Yalayis Property
              </h3>
              <div className="w-20 h-1 bg-amber-400 mx-auto mb-4"></div>
              <p className="text-white/90 text-lg max-w-2xl">
                Premier real estate and land transactions throughout the UAE
              </p>
            </motion.div>
          </div>
        </div>
      </div>

      <div className="p-8">
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            viewport={{ once: true }}
            className="flex gap-4"
          >
            <div className="flex-shrink-0">
              <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                <Home className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
              </div>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">
                Residential Properties
              </h4>
              <p className="text-gray-600 dark:text-gray-300">
                Luxury villas, apartments, and townhouses in prime locations
                across the UAE.
              </p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            viewport={{ once: true }}
            className="flex gap-4"
          >
            <div className="flex-shrink-0">
              <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                <Building className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
              </div>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">
                Commercial Real Estate
              </h4>
              <p className="text-gray-600 dark:text-gray-300">
                Office spaces, retail outlets, and industrial properties for
                business needs.
              </p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5, duration: 0.5 }}
            viewport={{ once: true }}
            className="flex gap-4"
          >
            <div className="flex-shrink-0">
              <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                <MapPin className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
              </div>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">
                Land Development
              </h4>
              <p className="text-gray-600 dark:text-gray-300">
                Strategic land acquisition and development opportunities across
                the Emirates.
              </p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6, duration: 0.5 }}
            viewport={{ once: true }}
            className="flex gap-4"
          >
            <div className="flex-shrink-0">
              <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
              </div>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">
                Investment Advisory
              </h4>
              <p className="text-gray-600 dark:text-gray-300">
                Expert guidance on real estate investments and portfolio
                management.
              </p>
            </div>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 0.5 }}
          viewport={{ once: true }}
          className="flex justify-center"
        >
          <Button className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2 rounded-full">
            View Properties
          </Button>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default AlYalayisProperty;
