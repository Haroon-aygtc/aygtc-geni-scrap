import { motion } from "framer-motion";
import { Users, Briefcase, Award, Headphones } from "lucide-react";
import { Button } from "@/components/ui/button";

const AlYalayisLaborSupplier = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      viewport={{ once: true }}
      className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl overflow-hidden"
    >
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-amber-600/80 to-orange-700/80 mix-blend-multiply z-10"></div>
        <img
          src="https://images.unsplash.com/photo-1531482615713-2afd69097998?w=1200&q=80"
          alt="Workforce Solutions"
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
                Al Yalayis Labor Supplier
              </h3>
              <div className="w-20 h-1 bg-blue-400 mx-auto mb-4"></div>
              <p className="text-white/90 text-lg max-w-2xl">
                Comprehensive workforce solutions for various industries
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
              <div className="w-12 h-12 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                <Users className="w-6 h-6 text-amber-600 dark:text-amber-400" />
              </div>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">
                Skilled Workforce
              </h4>
              <p className="text-gray-600 dark:text-gray-300">
                Access to a diverse pool of skilled and semi-skilled workers
                across various sectors.
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
              <div className="w-12 h-12 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                <Briefcase className="w-6 h-6 text-amber-600 dark:text-amber-400" />
              </div>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">
                Industry Expertise
              </h4>
              <p className="text-gray-600 dark:text-gray-300">
                Specialized workforce solutions for construction, hospitality,
                retail, and more.
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
              <div className="w-12 h-12 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                <Award className="w-6 h-6 text-amber-600 dark:text-amber-400" />
              </div>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">
                Compliance Guaranteed
              </h4>
              <p className="text-gray-600 dark:text-gray-300">
                Full compliance with UAE labor laws and regulations for peace of
                mind.
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
              <div className="w-12 h-12 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                <Headphones className="w-6 h-6 text-amber-600 dark:text-amber-400" />
              </div>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">
                Dedicated Support
              </h4>
              <p className="text-gray-600 dark:text-gray-300">
                Ongoing assistance and management services for your workforce
                needs.
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
          <Button className="bg-amber-600 hover:bg-amber-700 text-white px-6 py-2 rounded-full">
            Request Staff
          </Button>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default AlYalayisLaborSupplier;
