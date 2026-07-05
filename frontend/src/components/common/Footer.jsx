import React from 'react';
import { FaGithub, FaTwitter, FaDiscord } from 'react-icons/fa';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-[#eef2f6] bg-white/80 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Left Section */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-[#0a0a0a] rounded flex items-center justify-center">
                <span className="text-white font-bold text-[10px] tracking-tight">TF</span>
              </div>
              <span className="text-sm font-medium text-[#1a1a1a]">TaskFlow</span>
            </div>
            <span className="text-xs text-[#94a3b8]">·</span>
            <span className="text-xs text-[#94a3b8]">v2.0.0</span>
            <span className="hidden sm:inline text-xs text-[#94a3b8]">·</span>
            <span className="hidden sm:inline text-xs text-[#94a3b8]">© {currentYear}</span>
          </div>

          {/* Center - Version tag */}
          <div className="hidden md:block">
            <span className="text-[10px] font-medium text-[#94a3b8] bg-[#f1f5f9] px-2.5 py-1 rounded-full">
              Stable
            </span>
          </div>

          {/* Right Section */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <a 
                href="#" 
                className="p-1.5 text-[#94a3b8] hover:text-[#1a1a1a] transition-colors rounded-md hover:bg-[#f1f5f9]"
                aria-label="GitHub"
              >
                <FaGithub className="w-3.5 h-3.5" />
              </a>
              <a 
                href="#" 
                className="p-1.5 text-[#94a3b8] hover:text-[#1a1a1a] transition-colors rounded-md hover:bg-[#f1f5f9]"
                aria-label="Twitter"
              >
                <FaTwitter className="w-3.5 h-3.5" />
              </a>
              <a 
                href="#" 
                className="p-1.5 text-[#94a3b8] hover:text-[#1a1a1a] transition-colors rounded-md hover:bg-[#f1f5f9]"
                aria-label="Discord"
              >
                <FaDiscord className="w-3.5 h-3.5" />
              </a>
            </div>
            <span className="text-[#e2e8f0]">|</span>
            <div className="flex items-center gap-3">
              <a href="#" className="text-xs text-[#94a3b8] hover:text-[#1a1a1a] transition-colors">Docs</a>
              <a href="#" className="text-xs text-[#94a3b8] hover:text-[#1a1a1a] transition-colors">Support</a>
              <a href="#" className="text-xs text-[#94a3b8] hover:text-[#1a1a1a] transition-colors hidden sm:inline">Status</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;