'use client';
import { useVideoContext } from '../../context/VideoContext';
import { useRef, useState, useEffect } from 'react';
import html2pdf from 'html2pdf.js';
import { FaDownload, FaFilePdf, FaTrash, FaSave } from 'react-icons/fa';
import Navbar from '../../components/landingpage/Navbar';
import { db, auth } from '../../lib/firebase';
import { collection, addDoc, doc, updateDoc, arrayUnion, getDoc, setDoc, query, where, getDocs } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import ExpandableChatBox from '../../components/ExpandableChatBox'; // Assuming this is the chat component

export default function VideoPage() {
  const { videoData, setVideoData } = useVideoContext();
  const contentRef = useRef(null);
  const hiddenContentRef = useRef(null);
  const [isSaving, setIsSaving] = useState(false);
  const [user, setUser] = useState(null);
  const [currentNoteId, setCurrentNoteId] = useState(null);
  const [noteTitle, setNoteTitle] = useState("Untitled Note");
  const [isVideoVisible, setIsVideoVisible] = useState(false);
  const [notes, setNotes] = useState([]); // Store notes for chat box

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });

    return () => unsubscribe();
  }, []);

  const handleHeadingChange = (index, newHeading) => {
    const updatedNotes = [...videoData.notes];
    updatedNotes[index] = { ...updatedNotes[index], heading: newHeading };
    setVideoData({ ...videoData, notes: updatedNotes });
  };

  const handleContentChange = (index, newContent) => {
    const updatedNotes = [...videoData.notes];
    updatedNotes[index] = { ...updatedNotes[index], content: newContent };
    setVideoData({ ...videoData, notes: updatedNotes });
  };

  const handleAddNewSection = () => {
    const newSection = {
      heading: "New Section",
      content: "Add your content here..."
    };
    setVideoData({ ...videoData, notes: [...videoData.notes, newSection] });
  };

  const handleDeleteSection = (indexToDelete) => {
    const updatedNotes = videoData.notes.filter((_, index) => index !== indexToDelete);
    setVideoData({ ...videoData, notes: updatedNotes });
  };

  const handleSave = async () => {
    if (!user) {
      alert('Please login to save notes');
      return;
    }

    if (!noteTitle.trim()) {
      alert('Please enter a title for your note');
      return;
    }

    try {
      setIsSaving(true);
      const userId = user.uid;

      // Query to check if a note with the same title exists
      const notesRef = collection(db, 'notes');
      const q = query(
        notesRef,
        where('userId', '==', userId),
        where('title', '==', noteTitle)
      );
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        // Update existing note
        const existingNote = querySnapshot.docs[0];
        const noteRef = doc(db, 'notes', existingNote.id);
        await updateDoc(noteRef, {
          content: videoData.notes,
          updatedAt: new Date()
        });
        setCurrentNoteId(existingNote.id);
      } else {
        // Create new note
        const notesCollection = collection(db, 'notes');
        const noteDoc = await addDoc(notesCollection, {
          title: noteTitle,
          content: videoData.notes,
          createdAt: new Date(),
          updatedAt: new Date(),
          userId: userId,
          link: videoData.link
        });

        setCurrentNoteId(noteDoc.id);

        // Update user's notes array with the new note ID
        const userRef = doc(db, 'users', userId);
        const userDoc = await getDoc(userRef);

        if (!userDoc.exists()) {
          await setDoc(userRef, {
            notes: [noteDoc.id]
          });
        } else {
          await updateDoc(userRef, {
            notes: arrayUnion(noteDoc.id)
          });
        }
      }

      alert('Notes saved successfully!');
    } catch (error) {
      console.error('Error saving notes:', error);
      alert('Failed to save notes. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const getYoutubeVideoId = (url) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  const handleDownload = () => {
    // Create a temporary copy of the content for PDF generation
    const clonedContent = contentRef.current.cloneNode(true);
    clonedContent.classList.add('pdf-mode');

    // Append the cloned content to a hidden container
    hiddenContentRef.current.innerHTML = ''; // Clear previous content
    hiddenContentRef.current.appendChild(clonedContent);

    const opt = {
      margin: 1,
      filename: 'video-analysis.pdf',
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
    };

    html2pdf()
      .set(opt)
      .from(clonedContent)
      .save()
      .finally(() => {
        hiddenContentRef.current.innerHTML = '';
      });
  };

  // Function to prepare the notes for the chat box
  const prepareNotesForChat = (videoData) => {
    if (!videoData?.notes || videoData.notes.length === 0) {
      console.log("Mapping notes:", videoData.notes);
      console.log("No notes available or notes are empty");
      return []; // Return an empty array if no notes are available
    }
    
    // Map videoData.notes into the expected structure
    return videoData.notes.map((section) => ({
      role: "assistant", // Assuming the notes are provided by the assistant
      content: `${section.heading}: ${section.content}`, // Format the note's heading and content
    }));
  };
  

  return (
    <>
      <style jsx>{`
        .pdf-mode {
          background-color: white !important;
          color: black !important;
          padding: 20px !important;
        }
      `}</style>

      <Navbar />
      <div className="min-h-screen bg-black py-8 pt-20">
        <div className={`mx-auto ${isVideoVisible ? 'px-1 sm:px-2 lg:px-4' : 'px-4 sm:px-6 lg:px-8 max-w-7xl'}`}>
          {/* Header Section */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-white mb-4">Generated Notes</h1>
              <input
                type="text"
                value={noteTitle}
                onChange={(e) => setNoteTitle(e.target.value)}
                placeholder="Enter note title..."
                className="bg-gray-800 text-white px-4 py-2 rounded-lg w-64"
              />
            </div>
            <div className="flex gap-4">
              {videoData.link && (
                <button
                  onClick={() => setIsVideoVisible(!isVideoVisible)}
                  className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors duration-200"
                >
                  {isVideoVisible ? 'Hide Video' : 'Play Video'}
                </button>
              )}
              <button
                onClick={handleSave}
                disabled={isSaving}
                className={`flex items-center gap-2 ${isSaving ? 'bg-gray-600' : 'bg-green-600 hover:bg-green-700'
                  } text-white px-4 py-2 rounded-lg transition-colors duration-200`}
              >
                <FaSave />
                {isSaving ? 'Saving...' : 'Save Notes'}
              </button>
              <button
                onClick={handleDownload}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors duration-200"
              >
                <FaDownload />
                Download PDF
              </button>
            </div>
          </div>

          {/* Video Section */}
          {isVideoVisible && videoData.link && (
            <div className="mb-8">
              <iframe
                width="100%"
                height="500"
                src={`https://www.youtube.com/embed/${getYoutubeVideoId(videoData.link)}`}
                frameBorder="0"
                allowFullScreen
              />
            </div>
          )}

          {/* Notes Section */}
          <div className="bg-gray-800 rounded-lg p-6 text-white">
            {videoData.notes.map((section, index) => (
              <div key={index} className="mb-4">
                <div className="flex justify-between">
                  <input
                    type="text"
                    value={section.heading}
                    onChange={(e) => handleHeadingChange(index, e.target.value)}
                    className="bg-gray-700 text-white px-4 py-2 rounded-lg w-full mb-2"
                  />
                  <button
                    onClick={() => handleDeleteSection(index)}
                    className="ml-4 text-red-600 hover:text-red-800"
                  >
                    <FaTrash />
                  </button>
                </div>
                <textarea
                  value={section.content}
                  onChange={(e) => handleContentChange(index, e.target.value)}
                  rows="4"
                  className="bg-gray-700 text-white px-4 py-2 rounded-lg w-full"
                />
              </div>
            ))}
            <button
              onClick={handleAddNewSection}
              className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors duration-200"
            >
              Add New Section
            </button>
          </div>

          {/* Chat Box */}
          <div className="mt-8">
            <ExpandableChatBox messages={prepareNotesForChat(videoData)} />
          </div>

        </div>
      </div>
      <div ref={hiddenContentRef} className="hidden"></div>
    </>
  );
}

