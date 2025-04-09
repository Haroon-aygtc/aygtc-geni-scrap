import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

import AlYalayisHeader from "@/components/layout/AlYalayisHeader";
import AlYalayisHero from "@/components/sections/AlYalayisHero";
import AlYalayisGovernment from "@/components/sections/AlYalayisGovernment";
import AlYalayisProperty from "@/components/sections/AlYalayisProperty";
import SuperWheel from "@/components/sections/SuperWheel";
import AlYalayisLaborSupplier from "@/components/sections/AlYalayisLaborSupplier";
import AlYalayisFooter from "@/components/layout/AlYalayisFooter";

const AlYalayisLandingPage = () => {
  // State for customization options
  const [theme, setTheme] = useState("light");
  const [fontSize, setFontSize] = useState("medium");
  const [colorScheme, setColorScheme] = useState("blue");

  // Apply theme when it changes
  useEffect(() => {
    document.documentElement.classList.remove("light", "dark");
    document.documentElement.classList.add(theme);
  }, [theme]);

  // Apply font size when it changes
  useEffect(() => {
    document.documentElement.style.fontSize = {
      small: "14px",
      medium: "16px",
      large: "18px",
    }[fontSize];
  }, [fontSize]);

  return (
    <div
      className={`min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300`}
    >
      <AlYalayisHeader
        theme={theme}
        setTheme={setTheme}
        fontSize={fontSize}
        setFontSize={setFontSize}
        colorScheme={colorScheme}
        setColorScheme={setColorScheme}
      />

      <main>
        {/* Hero Section */}
        <section id="hero">
          <AlYalayisHero />
        </section>

        {/* Services Section */}
        <section id="services" className="py-20 bg-gray-50 dark:bg-gray-900">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900 dark:text-white">
                Our Business Divisions
              </h2>
              <div className="w-20 h-1 bg-blue-600 mx-auto mb-6"></div>
              <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
                Explore our comprehensive range of services designed to meet all
                your business and personal needs in the UAE.
              </p>
            </motion.div>

            <div className="grid grid-cols-1 gap-16">
              {/* Government Transaction Center */}
              <section id="government">
                <AlYalayisGovernment />
              </section>

              {/* Al Yalayis Property */}
              <section id="property">
                <AlYalayisProperty />
              </section>

              {/* Super Wheel */}
              <section id="transport">
                <SuperWheel />
              </section>

              {/* Al Yalayis Labor Supplier */}
              <section id="labor">
                <AlYalayisLaborSupplier />
              </section>
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section className="py-20 bg-gray-100 dark:bg-gray-800">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900 dark:text-white">
                What Our Clients Say
              </h2>
              <div className="w-20 h-1 bg-blue-600 mx-auto mb-6"></div>
              <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
                Hear from businesses and individuals who have experienced our
                premium services.
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[
                {
                  name: "Ahmed Al Mansouri",
                  role: "CEO, Dubai Ventures",
                  image:
                    "https://api.dicebear.com/7.x/avataaars/svg?seed=Ahmed",
                  quote:
                    "Al Yalayis Business Hub has streamlined all our government transactions, saving us valuable time and resources. Their professional team makes complex processes simple.",
                },
                {
                  name: "Sarah Johnson",
                  role: "Property Investor",
                  image:
                    "https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah",
                  quote:
                    "The property division at Al Yalayis helped me find the perfect investment opportunity in Dubai. Their market knowledge and personalized service exceeded my expectations.",
                },
                {
                  name: "Mohammed Al Hashimi",
                  role: "Operations Director, Gulf Enterprises",
                  image:
                    "https://api.dicebear.com/7.x/avataaars/svg?seed=Mohammed",
                  quote:
                    "We've been using Al Yalayis Labor Supply services for over three years. Their reliable workforce solutions have been instrumental in our company's growth and success.",
                },
              ].map((testimonial, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="bg-white dark:bg-gray-900 p-8 rounded-2xl shadow-lg"
                >
                  <div className="flex items-center mb-6">
                    <img
                      src={testimonial.image}
                      alt={testimonial.name}
                      className="w-16 h-16 rounded-full mr-4"
                    />
                    <div>
                      <h4 className="font-semibold text-lg text-gray-900 dark:text-white">
                        {testimonial.name}
                      </h4>
                      <p className="text-gray-600 dark:text-gray-400">
                        {testimonial.role}
                      </p>
                    </div>
                  </div>
                  <p className="text-gray-700 dark:text-gray-300 italic">
                    "{testimonial.quote}"
                  </p>
                  <div className="mt-4 flex">
                    {[...Array(5)].map((_, i) => (
                      <svg
                        key={i}
                        className="w-5 h-5 text-yellow-500 fill-current"
                        viewBox="0 0 24 24"
                      >
                        <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                      </svg>
                    ))}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
              {[
                { value: "10+", label: "Years of Excellence" },
                { value: "5,000+", label: "Satisfied Clients" },
                { value: "20,000+", label: "Transactions Completed" },
                { value: "4", label: "Business Divisions" },
              ].map((stat, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                >
                  <div className="text-4xl md:text-5xl font-bold mb-2">
                    {stat.value}
                  </div>
                  <div className="text-blue-200">{stat.label}</div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-gray-50 dark:bg-gray-900">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden"
            >
              <div className="grid grid-cols-1 lg:grid-cols-2">
                <div className="p-12 lg:p-16 flex flex-col justify-center">
                  <h2 className="text-3xl md:text-4xl font-bold mb-6 text-gray-900 dark:text-white">
                    Ready to Experience Premium Business Services?
                  </h2>
                  <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
                    Contact us today to discover how Al Yalayis Business Hub can
                    support your business needs and personal requirements in the
                    UAE.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-medium"
                    >
                      Schedule a Consultation
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="bg-transparent border border-blue-600 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 px-8 py-3 rounded-lg font-medium"
                    >
                      Learn More
                    </motion.button>
                  </div>
                </div>
                <div className="relative hidden lg:block">
                  <img
                    src="https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=800&q=80"
                    alt="Business Meeting"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-purple-600/20"></div>
                </div>
              </div>
            </motion.div>
          </div>
        </section>
      </main>

      <AlYalayisFooter />

      {/* Back to top button */}
      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="fixed bottom-8 right-8 bg-blue-600 hover:bg-blue-700 text-white w-12 h-12 rounded-full flex items-center justify-center shadow-lg z-50"
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M5 15l7-7 7 7"
          />
        </svg>
      </motion.button>
    </div>
  );
};

export default AlYalayisLandingPage;
