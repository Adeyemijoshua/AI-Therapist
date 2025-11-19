"use client";

import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import {
  Brain,
  Shield,
  Sparkles,
  Activity,
  Bot,
  LineChart,
  Clock,
  Users,
  Zap,
  HeartPulse,
  MessageCircle,
  Target,
  Heart,
} from "lucide-react";

const features = [
  {
    icon: <MessageCircle className="w-10 h-10 text-primary" />,
    title: "Always There to Listen",
    description:
      "Have real conversations with compassionate AI that understands your feelings and provides meaningful support anytime you need it.",
  },
  {
    icon: <Shield className="w-10 h-10 text-primary" />,
    title: "Your Safe Space",
    description:
      "Share freely knowing every word is protected with military-grade encryption. Your privacy is our highest priority.",
  },
  {
    icon: <Brain className="w-10 h-10 text-primary" />,
    title: "Emotion Intelligence",
    description:
      "Our advanced technology recognizes emotional patterns and offers insights to help you understand yourself better.",
  },
  {
    icon: <HeartPulse className="w-10 h-10 text-primary" />,
    title: "Wellness Guardian",
    description:
      "We gently check in during tough moments and provide immediate coping strategies when you need them most.",
  },
  {
    icon: <Clock className="w-10 h-10 text-primary" />,
    title: "Daily Wellness Rituals",
    description:
      "Start and end your day with guided reflections and mindfulness practices that fit perfectly into your routine.",
  },
  {
    icon: <Target className="w-10 h-10 text-primary" />,
    title: "Your Growth Journey",
    description:
      "See how far you've come with beautiful visualizations of your progress and celebrate every step forward.",
  },
  {
    icon: <Users className="w-10 h-10 text-primary" />,
    title: "Together Stronger",
    description:
      "Find comfort in shared experiences through our supportive community spaces where everyone understands.",
  },
  {
    icon: <Sparkles className="w-10 h-10 text-primary" />,
    title: "Instant Relief Tools",
    description:
      "Quick breathing exercises, calming techniques, and grounding methods for when anxiety strikes unexpectedly.",
  },
];

export default function FeaturesPage() {
  return (
    <div className="container mx-auto px-4 py-24">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center mb-16"
      >
        <motion.div
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2 }}
          className="inline-flex items-center px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6"
        >
          <Sparkles className="w-4 h-4 mr-2 text-primary" />
          <span className="text-sm font-medium text-primary">Transform Your Mental Wellness</span>
        </motion.div>
        
        <h1 className="text-4xl font-bold mb-6 bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
          Platform Features
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Discover how our platform provides compassionate mental health support 
          with cutting-edge technology and unwavering privacy protection.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {features.map((feature, index) => (
          <motion.div
            key={feature.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
          >
            <Card className="p-6 h-full hover:shadow-lg transition-shadow duration-300 bg-card/50 backdrop-blur supports-[backdrop-filter]:bg-background/60">
              <div className="mb-4">{feature.icon}</div>
              <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
              <p className="text-muted-foreground">{feature.description}</p>
            </Card>
          </motion.div>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.8 }}
        className="text-center mt-16"
      >
        <h2 className="text-2xl font-semibold mb-4">Ready to Get Started?</h2>
        <p className="text-muted-foreground mb-8">
          Join thousands of users benefiting from compassionate mental health support.
        </p>
        <a
          href="/login"
          className="inline-flex items-center px-6 py-3 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          Start Your Journey
          <Heart className="ml-2 w-5 h-5" />
        </a>
      </motion.div>
    </div>
  );
}