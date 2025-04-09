import { motion } from "framer-motion";
import {
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
  Mail,
  Phone,
  MapPin,
  ArrowRight,
} from "lucide-react";
import { GlassContainer } from "@/components/ui/glass-container";
import { GradientText } from "@/components/ui/gradient-text";
import { Button } from "@/components/ui/button";

const ModernFooter = () => {
  return (
    <footer className="relative overflow-hidden" id="contact">
      {/* Background with gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-gray-900 to-black">
        <div className="absolute inset-0 bg-[url('/public/images/grid.svg')] bg-center opacity-20"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 pt-20 pb-10">
        {/* Contact Form Section */}
        <div className="mb-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-white">
              Get in{" "}
              <GradientText
                text="Touch"
                from="from-blue-400"
                to="to-purple-400"
              />
            </h2>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Have questions or need assistance? Reach out to our team.
            </p>
          </motion.div>

          <div className="max-w-4xl mx-auto">
            <GlassContainer
              intensity="low"
              borderLight
              className="p-8 rounded-2xl"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-xl font-semibold text-white mb-6">
                    Send us a message
                  </h3>
                  <form>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">
                          Name
                        </label>
                        <input
                          type="text"
                          className="w-full px-4 py-2 bg-white/5 border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white"
                          placeholder="Your name"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">
                          Email
                        </label>
                        <input
                          type="email"
                          className="w-full px-4 py-2 bg-white/5 border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white"
                          placeholder="your@email.com"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">
                          Message
                        </label>
                        <textarea
                          className="w-full px-4 py-2 bg-white/5 border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white h-32"
                          placeholder="Your message"
                        ></textarea>
                      </div>
                      <Button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-2 rounded-lg">
                        Send Message
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </div>
                  </form>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-white mb-6">
                    Contact Information
                  </h3>
                  <ul className="space-y-6">
                    <li className="flex items-start gap-4">
                      <div className="flex-shrink-0 w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center">
                        <MapPin className="w-5 h-5 text-blue-400" />
                      </div>
                      <div>
                        <h4 className="text-white font-medium">Address</h4>
                        <p className="text-gray-400 mt-1">
                          Al Yalayis Business Hub, Sheikh Zayed Road, Dubai, UAE
                        </p>
                      </div>
                    </li>
                    <li className="flex items-start gap-4">
                      <div className="flex-shrink-0 w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center">
                        <Phone className="w-5 h-5 text-purple-400" />
                      </div>
                      <div>
                        <h4 className="text-white font-medium">Phone</h4>
                        <p className="text-gray-400 mt-1">+971 4 123 4567</p>
                      </div>
                    </li>
                    <li className="flex items-start gap-4">
                      <div className="flex-shrink-0 w-10 h-10 rounded-full bg-pink-500/20 flex items-center justify-center">
                        <Mail className="w-5 h-5 text-pink-400" />
                      </div>
                      <div>
                        <h4 className="text-white font-medium">Email</h4>
                        <p className="text-gray-400 mt-1">info@alyalayis.ae</p>
                      </div>
                    </li>
                  </ul>

                  <div className="mt-8">
                    <h4 className="text-white font-medium mb-4">Follow Us</h4>
                    <div className="flex space-x-4">
                      <a
                        href="#"
                        className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors"
                      >
                        <Facebook className="w-5 h-5 text-white" />
                      </a>
                      <a
                        href="#"
                        className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors"
                      >
                        <Twitter className="w-5 h-5 text-white" />
                      </a>
                      <a
                        href="#"
                        className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors"
                      >
                        <Instagram className="w-5 h-5 text-white" />
                      </a>
                      <a
                        href="#"
                        className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors"
                      >
                        <Linkedin className="w-5 h-5 text-white" />
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </GlassContainer>
          </div>
        </div>

        {/* Footer Links */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
          >
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 overflow-hidden rounded-xl relative">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-600 to-purple-600 animate-gradient-xy"></div>
                <div className="absolute inset-0 flex items-center justify-center font-bold text-white text-xl">
                  AY
                </div>
              </div>
              <span className="text-xl font-bold text-white">Al Yalayis</span>
            </div>
            <p className="text-gray-400 mb-6">
              A premier business hub offering comprehensive services across
              government transactions, real estate, transportation, and
              workforce solutions.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            viewport={{ once: true }}
          >
            <h3 className="text-lg font-semibold text-white mb-4">
              Our Divisions
            </h3>
            <ul className="space-y-3">
              <li>
                <a
                  href="#government"
                  className="text-gray-400 hover:text-white transition-colors flex items-center gap-1"
                >
                  <ArrowRight className="h-3 w-3" /> Government Transaction
                  Center
                </a>
              </li>
              <li>
                <a
                  href="#property"
                  className="text-gray-400 hover:text-white transition-colors flex items-center gap-1"
                >
                  <ArrowRight className="h-3 w-3" /> Al Yalayis Property
                </a>
              </li>
              <li>
                <a
                  href="#transport"
                  className="text-gray-400 hover:text-white transition-colors flex items-center gap-1"
                >
                  <ArrowRight className="h-3 w-3" /> Super Wheel
                </a>
              </li>
              <li>
                <a
                  href="#labor"
                  className="text-gray-400 hover:text-white transition-colors flex items-center gap-1"
                >
                  <ArrowRight className="h-3 w-3" /> Al Yalayis Labor Supplier
                </a>
              </li>
            </ul>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            viewport={{ once: true }}
          >
            <h3 className="text-lg font-semibold text-white mb-4">
              Quick Links
            </h3>
            <ul className="space-y-3">
              <li>
                <a
                  href="#"
                  className="text-gray-400 hover:text-white transition-colors flex items-center gap-1"
                >
                  <ArrowRight className="h-3 w-3" /> About Us
                </a>
              </li>
              <li>
                <a
                  href="#services"
                  className="text-gray-400 hover:text-white transition-colors flex items-center gap-1"
                >
                  <ArrowRight className="h-3 w-3" /> Services
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-gray-400 hover:text-white transition-colors flex items-center gap-1"
                >
                  <ArrowRight className="h-3 w-3" /> Careers
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-gray-400 hover:text-white transition-colors flex items-center gap-1"
                >
                  <ArrowRight className="h-3 w-3" /> News & Events
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-gray-400 hover:text-white transition-colors flex items-center gap-1"
                >
                  <ArrowRight className="h-3 w-3" /> Privacy Policy
                </a>
              </li>
            </ul>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            viewport={{ once: true }}
          >
            <h3 className="text-lg font-semibold text-white mb-4">
              Newsletter
            </h3>
            <p className="text-gray-400 mb-4">
              Subscribe to our newsletter for the latest updates and offers.
            </p>
            <div className="flex">
              <input
                type="email"
                placeholder="Your email"
                className="flex-grow px-4 py-2 bg-white/5 border border-gray-700 rounded-l-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white"
              />
              <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-r-lg">
                <ArrowRight className="h-5 w-5" />
              </button>
            </div>
          </motion.div>
        </div>

        <div className="border-t border-gray-800 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-500 text-sm mb-4 md:mb-0">
              © {new Date().getFullYear()} Al Yalayis Business Hub. All rights
              reserved.
            </p>
            <div className="flex space-x-6">
              <a
                href="#"
                className="text-gray-500 hover:text-white text-sm transition-colors"
              >
                Terms of Service
              </a>
              <a
                href="#"
                className="text-gray-500 hover:text-white text-sm transition-colors"
              >
                Privacy Policy
              </a>
              <a
                href="#"
                className="text-gray-500 hover:text-white text-sm transition-colors"
              >
                Sitemap
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Floating gradient orbs */}
      <div className="absolute bottom-0 left-1/4 w-64 h-64 bg-blue-500/10 rounded-full filter blur-3xl"></div>
      <div className="absolute top-1/3 right-1/4 w-72 h-72 bg-purple-500/10 rounded-full filter blur-3xl"></div>
    </footer>
  );
};

export default ModernFooter;
