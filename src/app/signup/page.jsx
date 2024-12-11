'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { auth, db } from '../../lib/firebase';
import { GoogleAuthProvider, signInWithPopup, createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc, collection, query, where, getDocs } from 'firebase/firestore';
import Link from 'next/link';
import { Checkbox } from "@/components/ui/checkbox"
import Navbar from '@/components/landingpage/Navbar';
export default function Signup() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const checkUserExists = async (email) => {
    try {
      const usersRef = collection(db, 'users');
      const q = query(usersRef, where("email", "==", email));
      const querySnapshot = await getDocs(q);
      return !querySnapshot.empty;
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error("Error checking user existence:", error);
      throw new Error('Unable to verify account status');
    }
  };

  const handleEmailSignup = async (e) => {
    e.preventDefault();
    if (!fullName.trim()) {
      setError('Please enter your full name');
      return;
    }

    try {
      setError(''); // Clear any existing errors
      setIsLoading(true); // Start loading
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      // Create user document in Firestore
      await setDoc(doc(db, 'users', userCredential.user.uid), {
        fullName: fullName,
        email: email,
        notes: [],
        createdAt: new Date().toISOString()
      });

      router.push('/');
    } catch (error) {
      if (error.code === 'auth/email-already-in-use') {
        setError('This email is already registered');
      } else if (error.code === 'auth/weak-password') {
        setError('Password should be at least 6 characters');
      } else if (error.code === 'auth/invalid-email') {
        setError('Please enter a valid email address');
      } else {
        setError('An error occurred. Please try again');
      }
      console.error("Error signing up with email and password", error);
    } finally {
      setIsLoading(false); // Stop loading
    }
  };

  const handleGoogleSignup = async () => {
    const provider = new GoogleAuthProvider();
    try {
      setError(''); // Clear any existing errors
      setIsLoading(true); // Start loading
      
      // First authenticate with Google
      const result = await signInWithPopup(auth, provider);
      
      try {
        // Then check if user exists
        const userExists = await checkUserExists(result.user.email);
        if (userExists) {
          setError('An account with this email already exists');
          // Sign out the user since we don't want to proceed
          await auth.signOut();
          return;
        }
        
        // Create user document in Firestore
        await setDoc(doc(db, 'users', result.user.uid), {
          fullName: result.user.displayName,
          email: result.user.email,
          notes: [],
          createdAt: new Date().toISOString()
        });

        router.push('/');
      } catch (dbError) {
        // If there's an error with Firestore operations, sign out the user
        await auth.signOut();
        setError('Failed to create account. Please try again');
        console.error("Error with database operations:", dbError);
      }
    } catch (error) {
      setError('Failed to sign up with Google. Please try again');
      console.error("Error signing up with Google", error);
    } finally {
      setIsLoading(false); // Stop loading
    }
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen flex items-center justify-center bg-[#111111] py-4 pt-20">
        <div className="max-w-6xl w-full bg-[#1A1A1A] shadow-xl rounded-lg flex my-1">
          <div className="w-3/5 p-12">
            <h1 className="text-4xl font-poppins mb-6 text-[50px] font-semibold text-white">
              Transform Your Study Experience
            </h1>
            <p className="text-[#9CA3AF] mb-6 font-poppins font-light text-[20px]">
              Upload videos or notes and let AI create personalized study materials tailored just for you.
            </p>
            <button
              onClick={handleGoogleSignup}
              className="w-full py-4 px-4 mb-6 bg-[#2A2A2A] border border-[#333333] text-white rounded-full flex items-center justify-center shadow-sm hover:shadow-xl transition duration-300"
            >
              <img
                src="/signup/google-icon.svg"
                alt="Google Icon"
                className="h-6 mr-2"
              />
              Continue with Google
            </button>
            <div className="flex items-center justify-between mb-3">
              <hr className="w-1/3 border-[#333333]" />
              <span className="text-[#9CA3AF]">OR</span>
              <hr className="w-1/3 border-[#333333]" />
            </div>
            {isLoading && (
              <div className="flex justify-center mb-4">
                <div className="loader"></div>
              </div>
            )}
            <form className="space-y-6" onSubmit={handleEmailSignup}>
              <input
                type="text"
                placeholder="Full Name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full py-3 px-4 border border-[#333333] bg-[#2A2A2A] text-white rounded-lg focus:outline-none focus:ring focus:ring-[#4B5563] placeholder-[#9CA3AF]"
              />
              <input
                type="email"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full py-3 px-4 border border-[#333333] bg-[#2A2A2A] text-white rounded-lg focus:outline-none focus:ring focus:ring-[#4B5563] placeholder-[#9CA3AF]"
              />
              <div className="space-y-2">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full py-3 px-4 border border-[#333333] bg-[#2A2A2A] text-white rounded-lg focus:outline-none focus:ring focus:ring-[#4B5563] placeholder-[#9CA3AF]"
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
                className="w-full py-3 px-4 bg-white text-black font-bold rounded-lg hover:bg-gray-100 transition duration-300"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="loader w-4 h-4 border-t-black border-solid animate-spin"></div>
                ) : (
                  "Sign Up"
                )}
              </button>
              
              {error && (
                <div className="mt-2 p-3 bg-red-500/10 border border-red-500/50 rounded-lg">
                  <p className="text-red-500 text-sm text-center">{error}</p>
                </div>
              )}
            </form>
            <p className="text-sm text-[#9CA3AF] mt-3">
              Already have an account? <Link href="/login" className="underline hover:text-gray-300 transition duration-300">Login</Link>
            </p>
          </div>
          <div className="w-2/5 bg-[#1A1A1A] flex items-center justify-center p-12 overflow-hidden">
            <img
              src="/signup/illustration.svg"
              alt="Illustration"
              className="w-full scale-125 object-contain"
            />
          </div>
        </div>
      </div>
    </>
  );
}
