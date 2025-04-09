import { motion } from "framer-motion";
import { Car, Shield, Clock, Star } from "lucide-react";
import { Button } from "@/components/ui/button";

const SuperWheel = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      viewport={{ once: true }}
      className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl overflow-hidden"
    >
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-600/80 to-indigo-700/80 mix-blend-multiply z-10"></div>
        <img
          src="https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=1200&q=80"
          alt="Luxury Transport"
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
                Super Wheel
              </h3>
              <div className="w-20 h-1 bg-amber-400 mx-auto mb-4"></div>
              <p className="text-white/90 text-lg max-w-2xl">
                Luxury VIP transport services across the UAE
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
              <div className="w-12 h-12 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                <Car className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">
                Premium Fleet
              </h4>
              <p className="text-gray-600 dark:text-gray-300">
                Exclusive selection of luxury vehicles including sedans, SUVs,
                and limousines.
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
              <div className="w-12 h-12 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                <Shield className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">
                Professional Chauffeurs
              </h4>
              <p className="text-gray-600 dark:text-gray-300">
                Highly trained, discreet, and professional drivers for a
                seamless experience.
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
              <div className="w-12 h-12 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                <Clock className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">
                24/7 Availability
              </h4>
              <p className="text-gray-600 dark:text-gray-300">
                Round-the-clock service for business travel, airport transfers,
                and special events.
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
              <div className="w-12 h-12 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                <Star className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">
                Tailored Experiences
              </h4>
              <p className="text-gray-600 dark:text-gray-300">
                Customized transportation solutions for corporate clients and
                VIP individuals.
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
          <Button className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-full">
            Book Service
          </Button>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default SuperWheel;
