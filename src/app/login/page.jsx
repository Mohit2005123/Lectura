'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { auth } from '../../lib/firebase';
import { GoogleAuthProvider, signInWithPopup, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { Checkbox } from "@/components/ui/checkbox"
import { db } from '../../lib/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import Navbar from '../../components/landingpage/Navbar';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const checkUserExists = async (email) => {
    try {
      const usersRef = collection(db, 'users');
      const q = query(usersRef, where("email", "==", email));
      const querySnapshot = await getDocs(q);
      return !querySnapshot.empty;
    } catch (error) {
      console.error("Error checking user existence:", error);
      throw new Error('Unable to verify account status');
    }
  };

  const handleEmailLogin = async (e) => {
    e.preventDefault();
    try {
      setError('');
      

      await signInWithEmailAndPassword(auth, email, password);
      router.push('/');
    } catch (error) {
      if (error.code === 'auth/invalid-credential') {
        setError('Invalid email or password');
      } else if (error.code === 'auth/too-many-requests') {
        setError('Too many failed attempts. Please try again later');
      } 
      else if(error.code === 'auth/user-not-found') {
        setError('No account found with this email. Please sign up first.');
      }
      else {
        setError('An error occurred. Please try again');
      }
      console.error("Error logging in with email and password", error);
    }
  };

  const handleGoogleLogin = async () => {
    const provider = new GoogleAuthProvider();
    try {
      setError('');
      
      // First authenticate with Google
      const result = await signInWithPopup(auth, provider);
      
      // Check if user exists in database
      const userExists = await checkUserExists(result.user.email);
      if (!userExists) {
        // Sign out the user since they don't have an account
        await signOut(auth);
        setError('No account found with this email. Please sign up first.');
        return;
      }

      router.push('/');
    } catch (error) {
      setError('Failed to login with Google. Please try again');
      console.error("Error logging in with Google", error);
    }
  };

  return (
    <div className="min-h-screen bg-[#111111]">
      <Navbar />
      <div className="flex items-center justify-center py-8 pt-24">
        <div className="max-w-6xl w-full bg-[#1A1A1A] shadow-xl rounded-lg flex my-2">
          <div className="w-3/5 p-16">
            <h1 className="text-4xl font-poppins mb-8 text-[50px] font-semibold text-white">
              Welcome Back
            </h1>
            <p className="text-[#9CA3AF] mb-8 font-poppins font-light text-[20px]">
              Log in to access your personalized study materials and tools.
            </p>
            <button
              onClick={handleGoogleLogin}
              className="w-full py-5 px-4 mb-8 bg-[#2A2A2A] border border-[#333333] text-white rounded-full flex items-center justify-center shadow-sm hover:shadow-xl transition duration-300"
            >
              <img
                src="/signup/google-icon.svg"
                alt="Google Icon"
                className="h-6 mr-2"
              />
              Continue with Google
            </button>
            <div className="flex items-center justify-between mb-4">
              <hr className="w-1/3 border-[#333333]" />
              <span className="text-[#9CA3AF]">OR</span>
              <hr className="w-1/3 border-[#333333]" />
            </div>
            <form className="space-y-8" onSubmit={handleEmailLogin}>
              <input
                type="email"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full py-4 px-4 border border-[#333333] bg-[#2A2A2A] text-white rounded-lg focus:outline-none focus:ring focus:ring-[#4B5563] placeholder-[#9CA3AF]"
              />
              <div className="space-y-2">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full py-4 px-4 border border-[#333333] bg-[#2A2A2A] text-white rounded-lg focus:outline-none focus:ring focus:ring-[#4B5563] placeholder-[#9CA3AF]"
                />
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="showPassword"
                    checked={showPassword}
                    onCheckedChange={setShowPassword}
                    className="border-[#333333] data-[state=checked]:bg-white data-[state=checked]:text-black transition-all duration-200 hover:scale-110 data-[state=checked]:scale-105 hover:border-white"
                  />
                  <label
                    htmlFor="showPassword"
                    className="text-sm font-medium leading-none text-[#9CA3AF] peer-disabled:cursor-not-allowed peer-disabled:opacity-70 transition-colors duration-200 hover:text-white"
                  >
                    Show password
                  </label>
                </div>
              </div>
              <button
                type="submit"
                className="w-full py-4 px-4 bg-white text-black font-bold rounded-lg hover:bg-gray-100 transition duration-300"
              >
                Log In
              </button>
            </form>
            {error && (
              <div className="mt-4 p-3 bg-red-500/10 border border-red-500/50 rounded-lg">
                <p className="text-red-500 text-sm text-center">{error}</p>
              </div>
            )}
            <p className="text-sm text-[#9CA3AF] mt-4">
              Don’t have an account?{' '}
              <a href="/signup" className="underline hover:text-white transition duration-300">
                Sign Up
              </a>
            </p>
          </div>
          <div className="w-2/5 bg-[#1A1A1A] flex items-center justify-center p-14 overflow-hidden">
            <img
              src="/signup/illustration.svg"
              alt="Illustration"
              className="w-full scale-125 object-contain"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
