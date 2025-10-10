"use client";
import React, { useState, useEffect } from "react";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { doc, getDoc, updateDoc, deleteDoc, arrayRemove } from "firebase/firestore";
import { db } from "../../lib/firebase";
import Navbar from "../../components/landingpage/Navbar";
import Footer from '../../components/Footer';
import { SparklesCore } from "../../components/ui/sparkles";
import FlashCardModal from "@/components/dashboard/flashcard_modal";
import { useRouter } from "next/navigation";
import NoteCard from "@/components/dashboard/NoteCard";

const DashboardPage = () => {
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCard, setSelectedCard] = useState(null);
  const [notes, setNotes] = useState([]);
  const [userId, setUserId] = useState(null);
  const [userName, setUserName] = useState('User');  // Set default value
  const [isLoading, setIsLoading] = useState(true);
  const [isMounted, setIsMounted] = useState(false);

  // Handle hydration
  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isMounted) return;

    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUserId(user.uid);
        setUserName(user.displayName || 'User');
      } else {
        setUserId(null);
        setUserName('User');
        setNotes([]);
      }
    });

    return () => unsubscribe();
  }, [isMounted]);

  useEffect(() => {
    const fetchUserNotes = async () => {
      if (!userId) return;

      setIsLoading(true);
      try {
        const userDoc = await getDoc(doc(db, "users", userId));

        if (userDoc.exists()) {
          const userData = userDoc.data();
          const userNotes = userData.notes || [];

          const notesPromises = userNotes.map(async (noteId) => {
            const noteDoc = await getDoc(doc(db, "notes", noteId));
            if (noteDoc.exists()) {
              return {
                id: noteDoc.id,
                ...noteDoc.data(),
              };
            }
            return null;
          });

          const notesData = await Promise.all(notesPromises);
          setNotes(notesData.filter((note) => note !== null));
        }
      } catch (error) {
        console.error("Error fetching notes:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserNotes();
  }, [userId]);

  const openModal = async (note) => {
    setIsLoading(true);
    setSelectedCard(null); // Clear previous modal data

    try {
      const noteRef = doc(db, "notes", note.id);
      const noteSnap = await getDoc(noteRef);

      if (noteSnap.exists()) {
        const noteData = noteSnap.data();

        // Check if flashcards already exist
        if (noteData.flash_card && noteData.flash_card.length > 0) {
          setSelectedCard(noteData.flash_card); // Use existing flashcards
        } else {
          // Fetch flashcards from the API if they don't exist
          const response = await fetch("/api/generateFlashcards", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ noteId: note.id }), // Send note.id in the request body
          });

          const data = await response.json();
          console.log("Flashcard API Response:", data);

          if (response.ok && data.success) {
            const flashcards = data.flashcards;

            // Update Firestore with new flashcards
            await updateDoc(noteRef, {
              flash_card: flashcards.map((flashcard) => ({
                flashcard_id: crypto.randomUUID(), // Unique ID for each flashcard
                heading: flashcard.heading,
                content: flashcard.content,
              })),
            });

            // Fetch updated note data
            const updatedNote = await getDoc(noteRef);
            if (updatedNote.exists()) {
              setSelectedCard(updatedNote.data().flash_card);
            }
          } else {
            console.error("Failed to generate flashcards:", data.error);
          }
        }
      }
    } catch (error) {
      console.error("Error loading flashcards:", error);
    } finally {
      setIsModalOpen(true);
      setIsLoading(false);
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedCard(null);
  };

  const handleCardClick = (noteId) => {
    router.push(`/notes/${noteId}`);
  };

  const handleQuizGeneration = (noteId) => {
    // Implement quiz generation logic here
    router.push(`/quiz/${noteId}`);
  };

  const handleDeleteNote = async (noteId) => {
    if (window.confirm("Are you sure you want to delete this note? This action cannot be undone.")) {
      try {
        // Delete the note document
        await deleteDoc(doc(db, "notes", noteId));

        // Remove the note reference from user's notes array
        if (userId) {
          const userRef = doc(db, "users", userId);
          await updateDoc(userRef, {
            notes: arrayRemove(noteId)
          });
        }

        // Update the local state
        setNotes(notes.filter(note => note.id !== noteId));
      } catch (error) {
        console.error("Error deleting note:", error);
      }
    }
  };

  // Prevent hydration mismatch by not rendering until mounted
  if (!isMounted) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      <div className="fixed top-0 left-0 right-0 z-50">
        <Navbar />
      </div>

      <div className="container mx-auto px-8 py-8 pt-24 max-w-[1200px] relative">
        <div className="h-[15rem] w-full bg-black flex flex-col items-center justify-center overflow-hidden rounded-md">
          <h1 className="md:text-5xl text-5xl lg:text-6xl font-bold text-center text-white relative z-20">
            Hello {isMounted ? userName : 'User'}
          </h1>
          <div className="w-[40rem] h-40 relative">
            {/* Gradients */}
            <div className="absolute inset-x-20 top-0 bg-gradient-to-r from-transparent via-indigo-500 to-transparent h-[2px] w-3/4 blur-sm" />
            <div className="absolute inset-x-20 top-0 bg-gradient-to-r from-transparent via-indigo-500 to-transparent h-px w-3/4" />
            <div className="absolute inset-x-60 top-0 bg-gradient-to-r from-transparent via-sky-500 to-transparent h-[5px] w-1/4 blur-sm" />
            <div className="absolute inset-x-60 top-0 bg-gradient-to-r from-transparent via-sky-500 to-transparent h-px w-1/4" />

            {/* Core component */}
            <SparklesCore
              background="transparent"
              minSize={0.4}
              maxSize={1}
              particleDensity={1200}
              className="w-full h-full"
              particleColor="#FFFFFF"
            />

            {/* Radial Gradient to prevent sharp edges */}
            <div className="absolute inset-0 w-full h-full bg-black [mask-image:radial-gradient(350px_200px_at_top,transparent_20%,white)]"></div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-12 mt-0 relative z-20">
          {isLoading ? (
            <div className="col-span-full flex justify-center items-center min-h-[400px]">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
            </div>
          ) : notes.length === 0 ? (
            <div className="col-span-full text-center text-gray-400">
              <p>No flashcards found. Create your first set of flashcards!</p>
            </div>
          ) : (
            notes.map((note) => (
              <div className="h-[28rem] my-8" key={note.id}>
                <NoteCard
                  title={note.title}
                  content={note.content || []}
                  onClick={() => handleCardClick(note.id)}
                  onFlashcardClick={() => openModal(note)}
                  onQuizClick={() => handleQuizGeneration(note.id)}
                  onDelete={() => handleDeleteNote(note.id)}
                />
              </div>
            ))
          )}
        </div>

        <FlashCardModal
          isOpen={isModalOpen}
          onClose={closeModal}
          card={selectedCard}
        />
      </div>

      <Footer />
    </div>
  );
};

export default DashboardPage;