import React from 'react';
import { Link } from 'react-router';
export default function Start() {
  return (
    <section className="bg-gradient-to-br from-[#1a102e] via-[#130f24] to-[#0c0a1e] py-24 flex justify-center items-center text-white font-Poppins">
      <div className="bg-[#1b132b]/80 backdrop-blur-md rounded-2xl border border-white/10 px-8 py-12 max-w-3xl w-full text-center shadow-lg">
        <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to get started?</h2>
        <p className="text-gray-300 mb-8 max-w-xl mx-auto">
          Join our community today and experience social media reimagined. Available on all your favorite platforms.
        </p>

        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <Link to='/login'>
            <button className="bg-violet-600 hover:bg-violet-700 text-white font-semibold py-2 px-6 rounded-lg transition-colors cursor-pointer w-full">
              Sign In
            </button>
          </Link>
          <Link to='/signup'>
            <button className="bg-violet-500 hover:bg-violet-600 text-white font-semibold py-2 px-6 rounded-lg transition-colors cursor-pointer w-full">
              Sign Up
            </button>
          
          </Link>

        </div>
      </div>
    </section>
  );
}
