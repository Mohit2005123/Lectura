'use client';
import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { auth } from '../../lib/firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { Home, Layout, Upload, LogOut, LogIn, User, Menu, X } from 'lucide-react';
import VideoUploadModal from '../VideoUploadModal';
import NoteUploadModal from '../NoteUploadModal';

export default function Navbar() {
  const [user, setUser] = useState(null);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
  const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isMounted) return;

    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });

    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);

    // Add click outside listener for dropdown
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      unsubscribe();
      window.removeEventListener('scroll', handleScroll);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMounted]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  const handleGenerateNotesClick = async () => {
    // First scroll to top instantly
    window.scrollTo(0, 0);
    await new Promise(resolve => setTimeout(resolve, 200));
    // Use requestAnimationFrame to ensure the scroll is complete before opening modal
    requestAnimationFrame(() => {
      setIsVideoModalOpen(true);
    });
  };

  const handleUploadNotesClick = async () => {
    window.scrollTo(0, 0);
    await new Promise(resolve => setTimeout(resolve, 200));
    // Use requestAnimationFrame to ensure the scroll is complete before opening modal
    requestAnimationFrame(() => {
      setIsNoteModalOpen(true);
    });
  };
  return (
    <nav
      className={`fixed w-full z-50 transition-all duration-300 ease-in-out 
        ${isScrolled
          ? 'bg-black/80 backdrop-blur-md shadow-2xl border-b border-zinc-800/50'
          : 'bg-black'}`}
    >
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-3 group">
            <div className="w-8 h-8 bg-gradient-to-br from-cyan-400 via-blue-500 to-purple-600 rounded-full 
              transform group-hover:rotate-[360deg] transition-transform duration-700 ease-in-out"></div>
            <span className="text-2xl font-semibold bg-gradient-to-r from-cyan-300 to-blue-500 
              text-transparent bg-clip-text tracking-tight">
              Lectura
            </span>
          </Link>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="lg:hidden text-zinc-400 hover:text-white"
          >
            {isMobileMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-6">
            <Link href="/dashboard" className="group flex items-center space-x-2 
              text-zinc-400 hover:text-white transition-all duration-300">
              <Layout className="w-5 h-5 text-zinc-500 group-hover:text-cyan-400 transition-colors" />
              <span className="text-sm font-medium">Dashboard</span>
            </Link>
            <button
              onClick={handleUploadNotesClick}
              className="group flex items-center space-x-2 text-zinc-400 hover:text-white transition-all duration-300"
            >
              <Upload className="w-5 h-5 text-zinc-500 group-hover:text-blue-400 transition-colors" />
              <span className="text-sm font-medium">Upload Notes</span>
            </button>
            <button
              onClick={handleGenerateNotesClick}
              className="group flex items-center space-x-2 text-zinc-400 hover:text-white transition-all duration-300"
            >
              <Home className="w-5 h-5 text-zinc-500 group-hover:text-purple-400 transition-colors" />
              <span className="text-sm font-medium">Generate Notes</span>
            </button>
          </div>

          {/* Desktop Auth Buttons */}
          <div className="hidden lg:flex items-center space-x-4">
            {!isMounted ? (
              <div className="w-10 h-10 rounded-full bg-zinc-800 animate-pulse"></div>
            ) : !user ? (
              <div className="flex items-center space-x-4">
                <Link href="/login" className="group flex items-center space-x-2 
                  text-zinc-400 hover:text-white transition-all duration-300">
                  <LogIn className="w-5 h-5 text-zinc-500 group-hover:text-emerald-400 transition-colors" />
                  <span className="text-sm font-medium">Login</span>
                </Link>
                <Link
                  href="/signup"
                  className="px-5 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 
                    text-white rounded-full text-sm font-semibold 
                    hover:from-cyan-600 hover:to-blue-700 
                    transition-all duration-300 
                    shadow-md hover:shadow-xl 
                    transform hover:-translate-y-1"
                >
                  Sign Up
                </Link>
              </div>
            ) : (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="w-10 h-10 rounded-full overflow-hidden border-2 border-zinc-700 hover:border-zinc-500 transition-all duration-300"
                >
                  {user?.photoURL ? (
                    <img
                      src={user.photoURL}
                      alt="Profile"
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center">
                      <User className="w-5 h-5 text-white" />
                    </div>
                  )}
                </button>

                {isDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 rounded-lg bg-zinc-900 border border-zinc-800 shadow-xl">
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center space-x-2 px-4 py-3 text-sm text-zinc-400 hover:text-white hover:bg-zinc-800 transition-all duration-300 rounded-lg"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Logout</span>
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="lg:hidden">
            <div className="pt-4 pb-3 space-y-3">
              <Link href="/dashboard" className="block px-3 py-2 rounded-md text-base font-medium 
                text-zinc-400 hover:text-white hover:bg-zinc-800 transition-all duration-300">
                <div className="flex items-center space-x-2">
                  <Layout className="w-5 h-5" />
                  <span>Dashboard</span>
                </div>
              </Link>
              <button
                onClick={handleUploadNotesClick}
                className="block w-full px-3 py-2 rounded-md text-base font-medium text-zinc-400 hover:text-white hover:bg-zinc-800 transition-all duration-300"
              >
                <div className="flex items-center space-x-2">
                  <Upload className="w-5 h-5" />
                  <span>Upload Notes</span>
                </div>
              </button>
              <button
                onClick={handleGenerateNotesClick}
                className="block w-full px-3 py-2 rounded-md text-base font-medium text-zinc-400 hover:text-white hover:bg-zinc-800 transition-all duration-300"
              >
                <div className="flex items-center space-x-2">
                  <Home className="w-5 h-5" />
                  <span>Generate Notes</span>

                </div>
              </button>

              {!isMounted ? (
                <div className="w-full h-10 bg-zinc-800 animate-pulse rounded-md"></div>
              ) : !user ? (
                <>
                  <Link href="/login" className="block px-3 py-2 rounded-md text-base font-medium 
                    text-zinc-400 hover:text-white hover:bg-zinc-800 transition-all duration-300">
                    <div className="flex items-center space-x-2">
                      <LogIn className="w-5 h-5" />
                      <span>Login</span>
                    </div>
                  </Link>
                  <Link href="/signup" className="block px-3 py-2 rounded-md text-base font-medium 
                    bg-gradient-to-r from-cyan-500 to-blue-600 text-white">
                    <div className="flex items-center space-x-2">
                      <span>Sign Up</span>
                    </div>
                  </Link>
                </>
              ) : (
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center space-x-2 px-3 py-2 text-base font-medium 
                    text-zinc-400 hover:text-white hover:bg-zinc-800 transition-all duration-300 rounded-md"
                >
                  <LogOut className="w-5 h-5" />
                  <span>Logout</span>
                </button>
              )}
            </div>
          </div>
        )}
      </div>
      <NoteUploadModal
        isOpen={isNoteModalOpen}
        onClose={() => setIsNoteModalOpen(false)}
      />
      <VideoUploadModal
        isOpen={isVideoModalOpen}
        onClose={() => setIsVideoModalOpen(false)}
      />
    </nav>
  );
}