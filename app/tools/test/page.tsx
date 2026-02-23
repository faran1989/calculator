'use client';
import React from 'react';
import { Facebook, Instagram, Twitter, Menu } from 'lucide-react';


export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-700 to-blue-500 flex items-center justify-center p-8">
      {/* Main Container */}
      <div className="w-full max-w-7xl bg-gradient-to-br from-blue-600/40 to-blue-400/40 backdrop-blur-sm rounded-lg shadow-2xl relative overflow-hidden">
        {/* Abstract Background Patterns */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-400/20 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl"></div>
        </div>

        {/* Content */}
        <div className="relative z-10">
          {/* Navigation */}
          <nav className="flex items-center justify-between px-12 py-8">
            <div className="text-xl font-bold text-gray-900">YOUR COMPANY</div>
            <div className="flex items-center gap-8">
              <a href="#" className="text-gray-900 hover:text-gray-700 font-medium">HOME</a>
              <a href="#" className="text-gray-900 hover:text-gray-700 font-medium">SERVICE</a>
              <a href="#" className="text-gray-900 hover:text-gray-700 font-medium">PORTFOLIO</a>
              <a href="#" className="text-gray-900 hover:text-gray-700 font-medium">CONTACT US</a>
              <button className="text-gray-900 hover:text-gray-700">
                <Menu size={24} />
              </button>
            </div>
          </nav>

          {/* Hero Section */}
          <div className="flex flex-col items-center justify-center px-12 py-24 text-center">
            <h1 className="text-7xl font-bold text-white mb-4 tracking-wider">
              LADING PAGE
            </h1>
            <h2 className="text-4xl font-light text-white mb-8 tracking-widest">
              ABSTRACT BACKGROUD
            </h2>
            
            {/* Description Text */}
            <div className="max-w-3xl mb-12">
              <p className="text-white/80 text-sm leading-relaxed tracking-wide">
                LOREM IPSUM IS SIMPLY DUMMY TEXT OF THE PRINTING AND TYPESETTING INDUSTRY.
              </p>
              <p className="text-white/80 text-sm leading-relaxed tracking-wide">
                LOREM IPSUM HAS BEEN THE INDUSTRY'S STANDARD DUMMY TEXT EVER SINCE THE 1500S, WHEN AN
              </p>
              <p className="text-white/80 text-sm leading-relaxed tracking-wide">
                UNKNOWN PRINTER TOOK A GALLEY OF TYPE AND SCRAMBLED
              </p>
              <p className="text-white/80 text-sm leading-relaxed tracking-wide">
                IT TO MAKE A TYPE SPECIMEN BOOK
              </p>
            </div>

            {/* CTA Button */}
            <button className="px-12 py-4 bg-transparent border-2 border-gray-900 text-gray-900 font-bold rounded-md hover:bg-gray-900 hover:text-white transition-colors text-sm tracking-wider">
              LEARN MORE
            </button>

            {/* Social Media Icons */}
            <div className="flex gap-4 mt-16">
              <a href="#" className="w-10 h-10 bg-white rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors">
                <Facebook size={20} className="text-blue-600" fill="currentColor" />
              </a>
              <a href="#" className="w-10 h-10 bg-white rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors">
                <Instagram size={20} className="text-blue-600" />
              </a>
              <a href="#" className="w-10 h-10 bg-white rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors">
                <Twitter size={20} className="text-blue-600" fill="currentColor" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}