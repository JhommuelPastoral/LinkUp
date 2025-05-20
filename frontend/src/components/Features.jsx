import React from 'react';
import { MessageCircle, UserCheck, Bell, Search } from 'lucide-react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';

const features = [
  {
    icon: <MessageCircle className="h-6 w-6" />,
    title: "Real-time Messaging",
    description: "Chat instantly with friends through our lightning-fast messaging system.",
  },
  {
    icon: <UserCheck className="h-6 w-6" />,
    title: "Friend Networks",
    description: "Build your social circle with our intuitive friend suggestion system.",
  },
  {
    icon: <Bell className="h-6 w-6" />,
    title: "Smart Notifications",
    description: "Stay updated with real-time alerts customized to your activity.",
  },
  {
    icon: <Search className="h-6 w-6" />,
    title: "Advanced Discovery",
    description: "Find new content and connections with our powerful search algorithms.",
  },
];

const cardVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.2,
      duration: 0.6,
      ease: 'easeOut',
    },
  }),
};

export default function Features() {
  return (
    <section className="relative font-Poppins py-20 bg-gradient-to-br from-[#1e1e2f] via-[#11111a] to-[#0b0b14] text-white overflow-hidden">
      {/* Glows */}
      <div className="absolute -top-[30%] -right-[10%] w-[60%] h-[60%] bg-purple-600/20 rounded-full blur-[120px] opacity-60 animate-pulse-glow z-0" />
      <div className="absolute -bottom-[30%] -left-[10%] w-[60%] h-[60%] bg-blue-500/20 rounded-full blur-[120px] opacity-60 animate-pulse-glow z-0" style={{ animationDelay: "1s" }} />

      {/* Heading */}
      <div className="relative z-10 max-w-5xl mx-auto px-4 text-center">
        <h2 className="text-4xl md:text-5xl font-bold mb-3">Features</h2>
        <p className="text-lg text-foreground/80 max-w-2xl mx-auto font-light">
          Discover the power of a truly social experience with our innovative features
        </p>
      </div>

      {/* Feature Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 max-w-7xl mx-auto mt-10">
        {features.map((item, i) => {
          const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.2 });
          return (
            <motion.div
              key={i}
              ref={ref}
              custom={i}
              initial="hidden"
              animate={inView ? "visible" : "hidden"}
              variants={cardVariants}
              className="p-6 rounded-xl transition-all hover:-translate-y-1 hover:shadow-lg 
                        bg-white/10 backdrop-blur-lg border border-white/10"
            >
              <div className="w-12 h-12 rounded-full flex items-center justify-center mb-4 bg-[rgb(46,30,72)]">
                {item.icon}
              </div>
              <h3 className="text-xl font-bold mb-2">{item.title}</h3>
              <p className="text-foreground/70">{item.description}</p>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
