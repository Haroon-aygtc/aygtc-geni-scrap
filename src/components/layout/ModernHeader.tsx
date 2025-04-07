import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, LogIn, UserPlus, MessageSquare } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { GlassContainer } from "@/components/ui/glass-container";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { FontSizeSelector } from "@/components/ui/font-size-selector";
import { ColorSchemeSelector } from "@/components/ui/color-scheme-selector";
import { GradientText } from "@/components/ui/gradient-text";

type Theme = "light" | "dark" | "system";

interface ModernHeaderProps {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  fontSize: string;
  setFontSize: (size: string) => void;
  colorScheme: string;
  setColorScheme: (scheme: string) => void;
}

const fontSizes = [
  { name: "Small", value: "small", scale: 0.875 },
  { name: "Medium", value: "medium", scale: 1 },
  { name: "Large", value: "large", scale: 1.125 },
];

const colorSchemes = [
  {
    name: "Azure",
    value: "azure",
    primary: "blue-600",
    secondary: "indigo-500",
    accent: "violet-500",
  },
  {
    name: "Emerald",
    value: "emerald",
    primary: "emerald-600",
    secondary: "teal-500",
    accent: "cyan-500",
  },
  {
    name: "Amber",
    value: "amber",
    primary: "amber-500",
    secondary: "orange-500",
    accent: "yellow-500",
  },
  {
    name: "Rose",
    value: "rose",
    primary: "rose-500",
    secondary: "pink-500",
    accent: "red-500",
  },
  {
    name: "Purple",
    value: "purple",
    primary: "purple-600",
    secondary: "violet-500",
    accent: "indigo-500",
  },
  {
    name: "Slate",
    value: "slate",
    primary: "slate-700",
    secondary: "slate-600",
    accent: "slate-500",
  },
];

const ModernHeader = ({
  theme,
  setTheme,
  fontSize,
  setFontSize,
  colorScheme,
  setColorScheme,
}: ModernHeaderProps) => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { name: "Home", href: "#" },
    { name: "Services", href: "#services" },
    { name: "About", href: "#about" },
    { name: "Contact", href: "#contact" },
  ];

  return (
    <header
      className={`fixed w-full z-50 transition-all duration-300 ${
        scrolled ? "py-2" : "py-4"
      }`}
    >
      <GlassContainer
        intensity={scrolled ? "medium" : "low"}
        borderLight
        className={`container mx-auto px-4 transition-all duration-300 ${scrolled ? "shadow-lg" : ""}`}
      >
        <div className="flex justify-between items-center h-16">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="flex items-center"
          >
            <Link to="/" className="flex items-center gap-2">
              <div className="relative w-10 h-10 overflow-hidden rounded-xl">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-600 to-purple-600 animate-gradient-xy"></div>
                <div className="absolute inset-0 flex items-center justify-center font-bold text-white text-xl">
                  AY
                </div>
              </div>
              <div className="font-bold text-xl">
                <GradientText
                  text="Al Yalayis"
                  from="from-blue-600"
                  to="to-purple-600"
                />
              </div>
            </Link>
          </motion.div>

          {/* Desktop Navigation */}
          <motion.nav
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="hidden md:flex items-center space-x-1"
          >
            {navLinks.map((link, index) => (
              <a
                key={index}
                href={link.href}
                className="px-4 py-2 rounded-full text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors font-medium"
              >
                {link.name}
              </a>
            ))}
          </motion.nav>

          {/* Actions */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="flex items-center gap-2"
          >
            <div className="hidden md:flex items-center gap-2">
              <ThemeToggle
                theme={theme as "light" | "dark" | "system"}
                setTheme={setTheme}
              />

              <FontSizeSelector
                value={fontSize}
                onChange={setFontSize}
                sizes={fontSizes}
              />

              <ColorSchemeSelector
                value={colorScheme}
                onChange={setColorScheme}
                schemes={colorSchemes}
              />

              <div className="h-6 w-px bg-gray-300 dark:bg-gray-700 mx-1"></div>

              <Link to="/login">
                <Button variant="ghost" size="sm" className="gap-1.5">
                  <LogIn className="h-4 w-4" />
                  <span>Login</span>
                </Button>
              </Link>

              <Link to="/signup">
                <Button variant="default" size="sm" className="gap-1.5">
                  <UserPlus className="h-4 w-4" />
                  <span>Register</span>
                </Button>
              </Link>

              <Button
                variant="outline"
                size="icon"
                className="ml-2 rounded-full"
              >
                <MessageSquare className="h-4 w-4" />
              </Button>
            </div>

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden rounded-full"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </Button>
          </motion.div>
        </div>
      </GlassContainer>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="md:hidden overflow-hidden"
          >
            <GlassContainer
              intensity="high"
              borderLight
              className="container mx-auto px-4 py-4 mt-2"
            >
              <nav className="flex flex-col space-y-2">
                {navLinks.map((link, index) => (
                  <a
                    key={index}
                    href={link.href}
                    className="px-4 py-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors font-medium"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {link.name}
                  </a>
                ))}
                <div className="h-px bg-gray-200 dark:bg-gray-700 my-2"></div>
                <div className="flex flex-wrap gap-2 justify-between items-center p-2">
                  <ThemeToggle
                    theme={theme as "light" | "dark" | "system"}
                    setTheme={setTheme}
                  />

                  <FontSizeSelector
                    value={fontSize}
                    onChange={setFontSize}
                    sizes={fontSizes}
                  />

                  <ColorSchemeSelector
                    value={colorScheme}
                    onChange={setColorScheme}
                    schemes={colorSchemes}
                  />
                </div>
                <div className="flex flex-col gap-2 mt-2">
                  <Link to="/login" className="w-full">
                    <Button
                      variant="outline"
                      className="w-full justify-center gap-1.5"
                    >
                      <LogIn className="h-4 w-4" />
                      <span>Login</span>
                    </Button>
                  </Link>

                  <Link to="/signup" className="w-full">
                    <Button
                      variant="default"
                      className="w-full justify-center gap-1.5"
                    >
                      <UserPlus className="h-4 w-4" />
                      <span>Register</span>
                    </Button>
                  </Link>

                  <Button
                    variant="secondary"
                    className="w-full justify-center gap-1.5 mt-2"
                  >
                    <MessageSquare className="h-4 w-4" />
                    <span>Open Chat</span>
                  </Button>
                </div>
              </nav>
            </GlassContainer>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default ModernHeader;
