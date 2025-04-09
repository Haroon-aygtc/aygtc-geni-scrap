import { motion } from "framer-motion";
import { Building2, FileText, Users, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

const AlYalayisGovernment = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      viewport={{ once: true }}
      className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl overflow-hidden"
    >
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/80 to-indigo-700/80 mix-blend-multiply z-10"></div>
        <img
          src="https://images.unsplash.com/photo-1577495508326-19a1b3cf65b9?w=1200&q=80"
          alt="UAE Government Services"
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
                Government Transaction Center
              </h3>
              <div className="w-20 h-1 bg-amber-400 mx-auto mb-4"></div>
              <p className="text-white/90 text-lg max-w-2xl">
                Comprehensive UAE government services under one roof
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
              <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                <FileText className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">
                Document Processing
              </h4>
              <p className="text-gray-600 dark:text-gray-300">
                Fast and efficient processing of all government documents and
                applications.
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
              <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                <Building2 className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">
                Business Licensing
              </h4>
              <p className="text-gray-600 dark:text-gray-300">
                Complete business setup and licensing services for all types of
                entities.
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
              <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                <Users className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">
                Visa Services
              </h4>
              <p className="text-gray-600 dark:text-gray-300">
                Comprehensive visa application and renewal services for
                residents and businesses.
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
              <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">
                Legal Attestation
              </h4>
              <p className="text-gray-600 dark:text-gray-300">
                Document attestation and legalization services for all official
                purposes.
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
          <Button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-full">
            Explore Services
          </Button>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default AlYalayisGovernment;
