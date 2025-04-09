import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Calendar, Clock, Award, Users, FileText, Building2, Home, MapPin, TrendingUp, Car, Shield, Star, Briefcase, Headphones, CheckCircle } from "lucide-react";

import ModernHeader from "@/components/layout/ModernHeader";
import ModernHero from "@/components/sections/ModernHero";
import ServiceSection from "@/components/sections/ServiceSection";
import TestimonialsSection from "@/components/sections/TestimonialsSection";
import StatsSection from "@/components/sections/StatsSection";
import CTASection from "@/components/sections/CTASection";
import ModernFooter from "@/components/sections/ModernFooter";
import FloatingChatWidget from "@/components/chat/FloatingChatWidget";

type Theme = "light" | "dark" | "system";

const ModernLandingPage = () => {
  // State for customization options
  const [theme, setTheme] = useState<Theme>("light");
  const [fontSize, setFontSize] = useState("medium");
  const [colorScheme, setColorScheme] = useState("azure");

  // Apply theme when it changes
  useEffect(() => {
    // Check system preference
    if (theme === "system") {
      const systemPrefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      document.documentElement.classList