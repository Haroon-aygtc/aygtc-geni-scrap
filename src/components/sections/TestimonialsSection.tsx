import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Star, Quote } from "lucide-react";
import { GlassContainer } from "@/components/ui/glass-container";
import { GradientText } from "@/components/ui/gradient-text";

interface Testimonial {
  name: string;
  role: string;
  image: string;
  quote: string;
  rating: number;
}

const testimonials: Testimonial[] = [
  {
    name: "Ahmed Al Mansouri",
    role: "CEO, Dubai Ventures",
    image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Ahmed",
    quote:
      "Al Yalayis Business Hub has streamlined all our government transactions, saving us valuable time and resources. Their professional team makes complex processes simple.",
    rating: 5,
  },
  {
    name: "Sarah Johnson",
    role: "Property Investor",
    image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah",
    quote:
      "The property division at Al Yalayis helped me find the perfect investment opportunity in Dubai. Their market knowledge and personalized service exceeded my expectations.",
    rating: 5,
  },
  {
    name: "Mohammed Al Hashimi",
    role: "Operations Director, Gulf Enterprises",
    image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Mohammed",
    quote:
      "We've been using Al Yalayis Labor Supply services for over three years. Their reliable workforce solutions have been instrumental in our company's growth and success.",
    rating: 5,
  },
  {
    name: "Fatima Al Zaabi",
    role: "Marketing Director, Emirates Group",
    image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Fatima",
    quote:
      "Super Wheel's luxury transport services have consistently impressed our VIP clients. The attention to detail and professionalism is unmatched in the industry.",
    rating: 5,
  },
];

const TestimonialsSection = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [width, setWidth] = useState(0);
  const carousel = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (carousel.current) {
      setWidth(carousel.current.scrollWidth - carousel.current.offsetWidth);
    }
  }, []);

  const nextTestimonial = () => {
    setActiveIndex((prev) => (prev === testimonials.length - 1 ? 0 : prev + 1));
  };

  const prevTestimonial = () => {
    setActiveIndex((prev) => (prev === 0 ? testimonials.length - 1 : prev - 1));
  };

  return (
    <section className="py-20 relative overflow-hidden">
      {/* Background with gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
        <div className="absolute inset-0 bg-[url('/public/images/grid.svg')] bg-center opacity-5"></div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            What Our{" "}
            <GradientText
              text="Clients"
              from="from-blue-600"
              to="to-purple-600"
            />{" "}
            Say
          </h2>
          <div className="w-20 h-1 bg-gradient-to-r from-blue-600 to-purple-600 mx-auto mb-6"></div>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Hear from businesses and individuals who have experienced our
            premium services.
          </p>
        </motion.div>

        <div className="relative max-w-5xl mx-auto">
          <motion.div ref={carousel} className="overflow-hidden">
            <motion.div
              drag="x"
              dragConstraints={{ right: 0, left: -width }}
              animate={{ x: -activeIndex * 100 + "%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="flex"
            >
              {testimonials.map((testimonial, index) => (
                <motion.div
                  key={index}
                  className="min-w-full px-4"
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5 }}
                  viewport={{ once: true }}
                >
                  <GlassContainer
                    intensity="low"
                    borderLight
                    className="p-8 md:p-10 relative"
                  >
                    <div className="absolute top-6 right-8 text-gray-300 dark:text-gray-600 opacity-30">
                      <Quote className="w-16 h-16" />
                    </div>

                    <div className="flex flex-col md:flex-row gap-6 items-center md:items-start">
                      <div className="flex-shrink-0">
                        <div className="w-20 h-20 md:w-24 md:h-24 rounded-full overflow-hidden border-2 border-blue-200 dark:border-blue-900">
                          <img
                            src={testimonial.image}
                            alt={testimonial.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      </div>

                      <div className="flex-1 text-center md:text-left">
                        <p className="text-gray-700 dark:text-gray-300 text-lg md:text-xl italic mb-6">
                          "{testimonial.quote}"
                        </p>

                        <div>
                          <h4 className="font-semibold text-lg text-gray-900 dark:text-white">
                            {testimonial.name}
                          </h4>
                          <p className="text-gray-600 dark:text-gray-400 mb-3">
                            {testimonial.role}
                          </p>

                          <div className="flex justify-center md:justify-start">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`w-5 h-5 ${i < testimonial.rating ? "text-yellow-500 fill-yellow-500" : "text-gray-300"}`}
                              />
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </GlassContainer>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>

          {/* Navigation Buttons */}
          <div className="flex justify-center mt-8 gap-4">
            <button
              onClick={prevTestimonial}
              className="w-12 h-12 rounded-full bg-white dark:bg-gray-800 shadow-md flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              aria-label="Previous testimonial"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            <div className="flex gap-2 items-center">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setActiveIndex(index)}
                  className={`w-3 h-3 rounded-full transition-all ${activeIndex === index ? "bg-blue-600 w-6" : "bg-gray-300 dark:bg-gray-600"}`}
                  aria-label={`Go to testimonial ${index + 1}`}
                />
              ))}
            </div>

            <button
              onClick={nextTestimonial}
              className="w-12 h-12 rounded-full bg-white dark:bg-gray-800 shadow-md flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              aria-label="Next testimonial"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
