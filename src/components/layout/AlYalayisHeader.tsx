import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sun, Moon, Menu, X, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetClose,
} from "@/components/ui/sheet";

interface AlYalayisHeaderProps {
  theme: string;
  setTheme: (theme: string) => void;
  fontSize: string;
  setFontSize: (size: string) => void;
  colorScheme: string;
  setColorScheme: (scheme: string) => void;
}

const AlYalayisHeader = ({
  theme,
  setTheme,
  fontSize,
  setFontSize,
  colorScheme,
  setColorScheme,
}: AlYalayisHeaderProps) => {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  const navLinks = [
    { name: "Home", href: "#" },
    { name: "Government Services", href: "#government" },
    { name: "Property", href: "#property" },
    { name: "Transport", href: "#transport" },
    { name: "Labor Supply", href: "#labor" },
    { name: "Contact", href: "#contact" },
  ];

  return (
    <header
      className={`fixed w-full z-50 transition-all duration-300 ${
        scrolled
          ? "bg-white/90 dark:bg-gray-900/90 backdrop-blur-md py-3 shadow-md"
          : "bg-transparent py-5"
      }`}
    >
      <div className="container mx-auto px-4 flex justify-between items-center">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="flex items-center"
        >
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xl">AY</span>
            </div>
            <span className="text-xl font-bold text-gray-900 dark:text-white">
              Al Yalayis
            </span>
          </div>
        </motion.div>

        {/* Desktop Navigation */}
        <motion.nav
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="hidden md:flex items-center space-x-8"
        >
          {navLinks.map((link, index) => (
            <a
              key={index}
              href={link.href}
              className="text-gray-700 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400 transition-colors font-medium"
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
          className="flex items-center gap-3"
        >
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            className="rounded-full"
          >
            {theme === "dark" ? (
              <Sun className="h-5 w-5" />
            ) : (
              <Moon className="h-5 w-5" />
            )}
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="rounded-full hidden md:flex"
              >
                <Settings className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <div className="p-2">
                <div className="mb-4">
                  <p className="text-sm font-medium mb-2">Font Size</p>
                  <div className="flex gap-2">
                    <Button
                      variant={fontSize === "small" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setFontSize("small")}
                      className="text-xs"
                    >
                      Small
                    </Button>
                    <Button
                      variant={fontSize === "medium" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setFontSize("medium")}
                      className="text-sm"
                    >
                      Medium
                    </Button>
                    <Button
                      variant={fontSize === "large" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setFontSize("large")}
                      className="text-base"
                    >
                      Large
                    </Button>
                  </div>
                </div>

                <div>
                  <p className="text-sm font-medium mb-2">Color Scheme</p>
                  <div className="flex gap-2">
                    <Button
                      variant={colorScheme === "blue" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setColorScheme("blue")}
                      className="bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      Blue
                    </Button>
                    <Button
                      variant={colorScheme === "purple" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setColorScheme("purple")}
                      className="bg-purple-600 hover:bg-purple-700 text-white"
                    >
                      Purple
                    </Button>
                    <Button
                      variant={colorScheme === "amber" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setColorScheme("amber")}
                      className="bg-amber-600 hover:bg-amber-700 text-white"
                    >
                      Amber
                    </Button>
                  </div>
                </div>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Mobile Menu */}
          <Sheet>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden rounded-full"
              >
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] sm:w-[400px]">
              <div className="flex flex-col h-full">
                <div className="flex justify-between items-center mb-8 mt-2">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                      <span className="text-white font-bold text-sm">AY</span>
                    </div>
                    <span className="text-lg font-bold">Al Yalayis</span>
                  </div>
                </div>

                <nav className="flex flex-col space-y-4">
                  {navLinks.map((link, index) => (
                    <SheetClose asChild key={index}>
                      <a
                        href={link.href}
                        className="text-lg font-medium py-2 px-4 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                      >
                        {link.name}
                      </a>
                    </SheetClose>
                  ))}
                </nav>

                <div className="mt-auto mb-8">
                  <div className="mb-4">
                    <p className="text-sm font-medium mb-2">Appearance</p>
                    <div className="flex gap-2">
                      <Button
                        variant={theme === "light" ? "default" : "outline"}
                        size="sm"
                        onClick={() => setTheme("light")}
                        className="flex-1"
                      >
                        <Sun className="h-4 w-4 mr-2" /> Light
                      </Button>
                      <Button
                        variant={theme === "dark" ? "default" : "outline"}
                        size="sm"
                        onClick={() => setTheme("dark")}
                        className="flex-1"
                      >
                        <Moon className="h-4 w-4 mr-2" /> Dark
                      </Button>
                    </div>
                  </div>

                  <div className="mb-4">
                    <p className="text-sm font-medium mb-2">Font Size</p>
                    <div className="flex gap-2">
                      <Button
                        variant={fontSize === "small" ? "default" : "outline"}
                        size="sm"
                        onClick={() => setFontSize("small")}
                        className="flex-1 text-xs"
                      >
                        Small
                      </Button>
                      <Button
                        variant={fontSize === "medium" ? "default" : "outline"}
                        size="sm"
                        onClick={() => setFontSize("medium")}
                        className="flex-1 text-sm"
                      >
                        Medium
                      </Button>
                      <Button
                        variant={fontSize === "large" ? "default" : "outline"}
                        size="sm"
                        onClick={() => setFontSize("large")}
                        className="flex-1 text-base"
                      >
                        Large
                      </Button>
                    </div>
                  </div>

                  <div>
                    <p className="text-sm font-medium mb-2">Color Scheme</p>
                    <div className="flex gap-2">
                      <Button
                        variant={colorScheme === "blue" ? "default" : "outline"}
                        size="sm"
                        onClick={() => setColorScheme("blue")}
                        className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                      >
                        Blue
                      </Button>
                      <Button
                        variant={
                          colorScheme === "purple" ? "default" : "outline"
                        }
                        size="sm"
                        onClick={() => setColorScheme("purple")}
                        className="flex-1 bg-purple-600 hover:bg-purple-700 text-white"
                      >
                        Purple
                      </Button>
                      <Button
                        variant={
                          colorScheme === "amber" ? "default" : "outline"
                        }
                        size="sm"
                        onClick={() => setColorScheme("amber")}
                        className="flex-1 bg-amber-600 hover:bg-amber-700 text-white"
                      >
                        Amber
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </motion.div>
      </div>
    </header>
  );
};

export default AlYalayisHeader;
