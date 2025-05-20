import HeroSection from "../components/HeroSection.jsx";
import Features from "../components/Features.jsx";
import Testimonial from "../components/Testimonial.jsx";
import Start from "../components/Start.jsx";
import { useState } from "react";
import { Link } from "react-router";
export default function LandingPage() {
  const [mobileOpen, setMobileOpen] = useState(false);

  const navlinks = [
    { name: "Home", href: "#home" },
    { name: "Features", href: "#features" },
    { name: "Testimonial", href: "#testimonial" },
    { name: "Start now", href: "#start" },
  ];

  return (
    <>
      {/* Header */}
      <div className="fixed h-[60px] top-0 right-0 left-0 z-20 bg-[rgb(12,10,18)] font-Poppins w-full">
        <div className="max-w-[1200px] mx-auto flex items-center justify-between h-full px-4">
          {/* Logo */}
          <h1 className="text-xl font-bold text-[rgb(100,59,188)]">Link up</h1>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            {navlinks.map((navlink) => (
              <a
                key={navlink.name}
                href={navlink.href}
                className="text-white hover:text-[rgb(100,59,188)]"
              >
                {navlink.name}
              </a>
            ))}
            <Link to={'/login'}> 
              <button className="rounded-xl bg-[rgb(100,59,188)] text-white px-4 py-2 cursor-pointer">
                Login
              </button>
            
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden text-white focus:outline-none"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              {mobileOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Navigation Menu */}
        {mobileOpen && (
          <div className="md:hidden bg-[rgb(12,10,18)]  px-4 pt-4 pb-6 space-y-4 z-20 ">
            {navlinks.map((navlink) => (
              <a
                key={navlink.name}
                href={navlink.href}
                className="block text-white hover:text-[rgb(100,59,188)]"
              >
                {navlink.name}
              </a>
            ))}
            <Link to={'/login'}>
              <button className="w-full rounded-xl bg-[rgb(100,59,188)] text-white py-2 cursor-pointer">
                Login
              </button>

            </Link>
          </div>
        )}
      </div>
      <div id="home">
        <HeroSection/>

      </div>
      <div id="features" className="">
        <Features/>
      </div>
      <div id="testimonial" className="">
        <Testimonial/>
      </div>
      <div className="" id="start">
        <Start/>
      </div>
      <footer className="footer sm:footer-horizontal footer-center bg-base-300 text-base-content p-4">
      <aside>
        <p>Copyright © {new Date().getFullYear()} - All right reserved by Link up</p>
      </aside>
    </footer>
    </>
  );
}
