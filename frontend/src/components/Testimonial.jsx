import React from 'react';
import { Quote } from 'lucide-react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';

const testimonialVariants = {
  hidden: { opacity: 0, y: 50 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.2, duration: 0.6, ease: 'easeOut' },
  }),
};

const testimonials = [
  {
    quote: "SocialSync has completely transformed how I connect with friends. The dark mode is so easy on my eyes!",
    name: "Alex Johnson",
    title: "Designer"
  },
  {
    quote: "I've tried many social apps, but this one stands out with its clean interface and unique features.",
    name: "Samantha Lee",
    title: "Marketing Manager"
  },
  {
    quote: "The real-time messaging is lightning fast, and I love how easy it is to discover new content.",
    name: "Michael Chen",
    title: "Software Engineer"
  }
];

export default function Testimonial() {
  return (
    <section className="relative font-Poppins py-20 bg-gradient-to-br from-[#1e1e2f] via-[#11111a] to-[#0b0b14] text-white overflow-hidden">
      {/* Glowing effects */}
      <div className="absolute -top-[30%] -right-[10%] w-[60%] h-[60%] bg-purple-600/20 rounded-full blur-[120px] opacity-60 animate-pulse-glow z-0" />
      <div className="absolute -bottom-[30%] -left-[10%] w-[60%] h-[60%] bg-blue-500/20 rounded-full blur-[120px] opacity-60 animate-pulse-glow z-0" style={{ animationDelay: "1s" }} />

      {/* Section Heading */}
      <div className="relative z-10 max-w-5xl mx-auto px-4 text-center">
        <h2 className="text-4xl md:text-5xl font-bold mb-3">What our users say</h2>
        <p className="text-lg text-foreground/80 max-w-2xl mx-auto font-light">
          Join thousands of satisfied users who have transformed their social experience
        </p>
      </div>

      {/* Testimonials */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-7xl mx-auto mt-10">
        {testimonials.map((item, i) => {
          const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.2 });
          return (
            <motion.div
              key={i}
              ref={ref}
              custom={i}
              initial="hidden"
              animate={inView ? "visible" : "hidden"}
              variants={testimonialVariants}
              className="p-6 rounded-xl transition-all hover:-translate-y-1 hover:shadow-lg 
                         bg-white/10 backdrop-blur-lg border border-white/10"
            >
              <div className="w-12 h-12 rounded-full flex items-center justify-center mb-4 bg-[rgb(46,30,72)]">
                <Quote className="h-6 w-6" />
              </div>
              <p className="text-foreground/70">{item.quote}</p>
              <p className="font-semibold mt-2.5">{item.name}</p>
              <p className="font-light">{item.title}</p>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
