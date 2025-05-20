import { useEffect, useState } from "react";
import { Link } from "react-router";
export default function HeroSection() {
    const [isVisible, setIsVisible] = useState(false);
  
    useEffect(() => {
      setIsVisible(true);
    }, []);
  
  return (
    <section className="relative min-h-screen pt-24 pb-20 flex items-center overflow-hidden bg-gradient-to-br from-[#1e1e2f] via-[#11111a] to-[#0b0b14]">
      {/* Gradient glows */}
      <div className="absolute -top-[30%] -right-[10%] w-[60%] h-[60%] bg-purple-600/20 rounded-full blur-[120px] opacity-60 animate-pulse-glow z-0" />
      <div className="absolute -bottom-[30%] -left-[10%] w-[60%] h-[60%] bg-blue-500/20 rounded-full blur-[120px] opacity-60 animate-pulse-glow z-0" style={{ animationDelay: "1s" }} />

      <div className="container mx-auto px-4 grid md:grid-cols-2 gap-12 items-center relative z-10">
        {/* Left Side */}
        <div className={`space-y-8 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}>
          <h1 className="text-4xl md:text-6xl font-bold leading-tight text-white">
            Connect with friends in a whole new way
          </h1>
          <p className="text-lg text-foreground/80 max-w-lg">
            Experience social media reimagined. Share moments, connect with friends, and discover content that matters to you in a seamless dark mode interface.
          </p>

          <div className="flex flex-wrap gap-4">
            <button className="bg-accent hover:bg-accent/90 text-white font-medium px-8 py-4 rounded-xl shadow-md transition">
              Get Started
            </button>
            <Link to={'features'}>
              <button className="border border-white/20 hover:border-white/40 text-white font-medium px-8 py-4 rounded-xl transition">
                Learn More
              </button>
            </Link>
          </div>

          <div className="flex items-center gap-4 pt-4">
            <div className="flex -space-x-2">
              <div className="w-8 h-8 rounded-full bg-purple-500 border-2 border-background"></div>
              <div className="w-8 h-8 rounded-full bg-blue-500 border-2 border-background"></div>
              <div className="w-8 h-8 rounded-full bg-pink-500 border-2 border-background"></div>
            </div>
            <p className="text-sm text-foreground/70">Join thousands of users worldwide</p>
          </div>
        </div>

        {/* Right Side - Mockup */}
        <div className={`transition-all duration-1000 delay-300 ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-12'}`}>
          <div className="relative rounded-3xl p-1 max-w-md mx-auto bg-gradient-to-br from-white/10 via-white/5 to-transparent shadow-xl backdrop-blur-md border border-white/10">
            <div className="rounded-2xl overflow-hidden bg-secondary/80">
              {/* Top Bar */}
              <div className="h-12 bg-secondary flex items-center px-4 border-b border-white/5">
                <div className="flex space-x-2">
                  <div className="w-3 h-3 rounded-full bg-red-400"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                  <div className="w-3 h-3 rounded-full bg-green-400"></div>
                </div>
              </div>
              {/* UI Mockup */}
              <div className="h-96 bg-secondary/40 px-4 py-6">
                <div className="space-y-4">
                  <div className="h-8 bg-muted rounded-full w-3/4"></div>
                  <div className="h-20 bg-muted/60 rounded-xl"></div>
                  <div className="h-16 bg-muted/60 rounded-xl"></div>
                  <div className="h-16 bg-muted/60 rounded-xl"></div>
                  <div className="h-12 bg-accent/40 rounded-xl"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
    )  
}
