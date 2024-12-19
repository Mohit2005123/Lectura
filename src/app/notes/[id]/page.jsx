'use client';
import { useRef, useState, useEffect } from 'react';
import html2pdf from 'html2pdf.js';
import { FaDownload, FaFilePdf, FaTrash, FaSave } from 'react-icons/fa';
import Navbar from '../../../components/landingpage/Navbar';
import { db, auth } from '../../../lib/firebase';
import { doc, getDoc, updateDoc, collection, addDoc, query, where, getDocs, setDoc, arrayUnion } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { useParams } from 'next/navigation';
import ExpandableChatBox from '@/components/ExpandableChatbox'
export default function VideoPage() {
  const params = useParams();
  const contentRef = useRef(null);
  const hiddenContentRef = useRef(null);
  const [isSaving, setIsSaving] = useState(false);
  const [user, setUser] = useState(null);
  const [noteTitle, setNoteTitle] = useState("Untitled Note");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [videoData, setVideoData] = useState([]);
  const [currentNoteId, setCurrentNoteId] = useState(null);
  const [videoLink, setVideoLink] = useState("");
  const [isVideoVisible, setIsVideoVisible] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const fetchNote = async () => {
      if (!params.id) return;

      try {
        setIsLoading(true);
        const noteRef = doc(db, 'notes', params.id);
        const noteSnap = await getDoc(noteRef);

        if (noteSnap.exists()) {
          const noteData = noteSnap.data();
          setVideoData(noteData.content);
          setNoteTitle(noteData.title);
          setVideoLink(noteData.link || "");
          setCurrentNoteId(params.id);
        } else {
          setError('Note not found');
        }
      } catch (err) {
        console.error('Error fetching note:', err);
        setError('Failed to load note');
      } finally {
        setIsLoading(false);
      }
    };

    fetchNote();
  }, [params.id]);

  const handleHeadingChange = (index, newHeading) => {
    const updatedData = [...videoData];
    updatedData[index] = { ...updatedData[index], heading: newHeading };
    setVideoData(updatedData);
  };
  
  const handleContentChange = (index, newContent) => {
    const updatedData = [...videoData];
    updatedData[index] = { ...updatedData[index], content: newContent };
    setVideoData(updatedData);
  };

  const handleAddNewSection = () => {
    const newSection = {
      heading: "New Section",
      content: "Add your content here..."
    };
    setVideoData([...videoData, newSection]);
  };

  const handleDeleteSection = (indexToDelete) => {
    const updatedData = videoData.filter((_, index) => index !== indexToDelete);
    setVideoData(updatedData);
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

      if (currentNoteId) {
        // Update existing note
        const noteRef = doc(db, 'notes', currentNoteId);
        await updateDoc(noteRef, {
            title:noteTitle,
          content: videoData,
          updatedAt: new Date()
        });
      } else {
        // Create new note
        const notesCollection = collection(db, 'notes');
        const noteDoc = await addDoc(notesCollection, {
          title: noteTitle,
          content: videoData,
          createdAt: new Date(),
          updatedAt: new Date(),
          userId: userId
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

  if (isLoading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen flex items-center justify-center bg-black">
          <div className="text-white">Loading...</div>
        </div>
        <ExpandableChatBox />
      </>
    );
  }

  if (error) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen flex items-center justify-center bg-black">
          <div className="text-red-500">{error}</div>
        </div>
        
      </>
    );
  }

  if (!videoData || videoData.length === 0) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen flex items-center justify-center bg-black">
          <div className="text-center p-8 bg-black rounded-lg shadow-lg border border-gray-800">
            <FaFilePdf className="text-red-500 text-5xl mx-auto mb-4" />
            <p className="text-white">No video data available. Please upload a video first.</p>
          </div>
        </div>
      </>
    );
  }

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

  const getYoutubeVideoId = (url) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  return (
    <>
      <style jsx>{`
        .pdf-mode {
        
          background-color: white !important;
          color: black !important;
          padding: 20px !important;
        }
        
        .pdf-mode h2 {
          color: black !important;
          font-weight: bold !important;
        }
        
        .pdf-mode div[contenteditable] {
          color: black !important;
        }
        
        .pdf-mode .text-gray-300 {
          color: #1f2937 !important;
        }
        
        .pdf-mode span.w-8 {
          background-color: #1e40af !important;
          color: white !important;
        }
        
        .pdf-mode .border-gray-700 {
          border-color: #e5e7eb !important;
        }
        
        .pdf-mode .border-gray-800 {
          border-color: #d1d5db !important;
        }
      `}</style>

      <Navbar />
      <div className="min-h-screen bg-black py-8 pt-20">
        <div className={`mx-auto ${isVideoVisible ? 'px-1 sm:px-2 lg:px-4' : 'px-4 sm:px-6 lg:px-8 max-w-7xl'}`}>
          {/* Header Section - now with both Download and Save buttons */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-white mb-4">
                Generated Notes
              </h1>
              <input
                type="text"
                value={noteTitle}
                onChange={(e) => setNoteTitle(e.target.value)}
                placeholder="Enter note title..."
                className="bg-gray-800 text-white px-4 py-2 rounded-lg w-64"
              />
            </div>
            <div className="flex gap-4">
              {videoLink && (
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
                className={`flex items-center gap-2 ${
                  isSaving ? 'bg-gray-600' : 'bg-green-600 hover:bg-green-700'
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

          {/* Main Content with Video Section */}
          <div className={`flex ${isVideoVisible ? 'gap-2' : 'gap-4'}`}>
            {/* Video Section */}
            {isVideoVisible && videoLink && (
              <div className="w-2/5 sticky top-24 h-[calc(100vh-6rem)]">
                <div className="rounded-xl overflow-hidden h-full">
                  <iframe
                    src={`https://www.youtube.com/embed/${getYoutubeVideoId(videoLink)}`}
                    title="YouTube video player"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="w-full h-full"
                  ></iframe>
                </div>
              </div>
            )}

            {/* Notes Section */}
            <div className={`${isVideoVisible ? 'w-3/5' : 'w-full'}`}>
              <div
                ref={contentRef}
                className={`bg-black rounded-xl shadow-lg border border-gray-800 ${
                  isVideoVisible ? 'p-6' : 'p-8'
                } mb-4`}
              >
                <div className="space-y-8">
                  {videoData.map((section, index) => (
                    <div 
                      key={index}
                      className="pb-6 border-b border-gray-700 last:border-0 relative group"
                    >
                      <div className="absolute right-0 top-0">
                        <button
                          onClick={() => handleDeleteSection(index)}
                          className="text-red-500 hover:text-red-600 p-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                          title="Delete section"
                        >
                          <FaTrash />
                        </button>
                      </div>
                      <h2 className="text-2xl font-semibold text-white mb-4 flex items-center gap-2">
                        <span className="w-8 h-8 flex items-center justify-center bg-blue-900 text-blue-200 rounded-full text-sm">
                          {index + 1}
                        </span>
                        <div
                          contentEditable
                          suppressContentEditableWarning
                          onBlur={(e) => handleHeadingChange(index, e.target.textContent)}
                          className="outline-none focus:ring-2 focus:ring-blue-500 rounded px-2 w-full"
                        >
                          {section.heading}
                        </div>
                      </h2>
                      <div className="pl-10">
                        <div
                          contentEditable
                          suppressContentEditableWarning
                          onBlur={(e) => handleContentChange(index, e.target.innerHTML)}
                          dangerouslySetInnerHTML={{ __html: section.content }}
                          className="text-gray-300 leading-relaxed whitespace-pre-wrap outline-none focus:ring-2 focus:ring-blue-500 rounded px-2"
                        >
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Add Section button */}
              <div className={`flex justify-center ${isVideoVisible ? 'mb-6' : 'mb-8'}`}>
                <button
                  onClick={handleAddNewSection}
                  className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg transition-colors duration-200 text-lg"
                >
                  + Add New Section
                </button>
              </div>
            </div>
          </div>
          <ExpandableChatBox />

          {/* Footer */}
          <div className="text-center text-gray-400 text-sm">
            Generated by Lectura • {new Date().toLocaleDateString()}
          </div>
        </div>
      </div>

      {/* Hidden container for generating PDF */}
      <div
        ref={hiddenContentRef}
        className="hidden"
        style={{ position: 'absolute', top: 0, left: 0 }}
      ></div>
    </>
  );
}