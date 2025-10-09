'use client';
import { useRef, useState, useEffect, useMemo } from 'react';
import html2pdf from 'html2pdf.js';
import { 
  FaDownload, FaFilePdf, FaTrash, FaSave, FaRobot, FaProjectDiagram,
  FaBold, FaItalic, FaUnderline, FaStrikethrough, FaSuperscript, FaSubscript,
  FaLink, FaUnlink, FaUndo, FaRedo, FaHighlighter, FaPalette, FaFont, FaTextHeight, FaMinus,
  FaAlignLeft, FaAlignCenter, FaAlignRight, FaAlignJustify
} from 'react-icons/fa';
import Navbar from '../../../components/landingpage/Navbar';
import Footer from '../../../components/Footer';
import RichTextEditor from '../../../components/RichTextEditor';
import { MindMapModal } from '../../../components/MindMap';
import { db, auth } from '../../../lib/firebase';
import { doc, getDoc, updateDoc, collection, addDoc, query, where, getDocs, setDoc, arrayUnion } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { useParams } from 'next/navigation';
import axios from 'axios';
import { Toaster, toast } from 'react-hot-toast';

export default function VideoPage() {
  const params = useParams();
  const contentRef = useRef(null);
  const hiddenContentRef = useRef(null);
  // Modern button style constants (fixed classes so Tailwind can tree-shake correctly)
  const btnBase = "group relative inline-flex items-center gap-2 px-4 py-2 rounded-xl text-white shadow-lg transition-all duration-200 focus:outline-none focus:ring-2 ring-offset-2 ring-offset-black active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed overflow-hidden btn-shine btn-aura ring-1 ring-white/10";
  const BTN = {
    purple: `${btnBase} bg-gradient-to-br from-purple-500 to-purple-700 hover:from-purple-400 hover:to-purple-700 focus:ring-purple-400/50 shadow-purple-900/30 hover:shadow-2xl`,
    emerald: `${btnBase} bg-gradient-to-br from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-600 focus:ring-emerald-400/50 shadow-emerald-900/30 hover:shadow-2xl`,
    blue: `${btnBase} bg-gradient-to-br from-blue-500 to-blue-600 hover:from-blue-400 hover:to-blue-600 focus:ring-blue-400/50 shadow-blue-900/30 hover:shadow-2xl`,
    amber: `${btnBase} bg-gradient-to-br from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-600 focus:ring-amber-400/50 shadow-amber-900/30 hover:shadow-2xl`,
    indigo: `${btnBase} bg-gradient-to-br from-indigo-500 to-indigo-700 hover:from-indigo-400 hover:to-indigo-700 focus:ring-indigo-400/50 shadow-indigo-900/30 hover:shadow-2xl`,
    softGray: `${btnBase} bg-gray-700 hover:brightness-110 focus:ring-gray-400/40 hover:shadow-xl`
  };
  
  const chatEndRef = useRef(null);
  const [isSaving, setIsSaving] = useState(false);
  const [user, setUser] = useState(null);
  const [noteTitle, setNoteTitle] = useState("Untitled Note");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [videoData, setVideoData] = useState([]);
  const [currentNoteId, setCurrentNoteId] = useState(null);
  const [videoLink, setVideoLink] = useState("");
  const [isVideoVisible, setIsVideoVisible] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [videoWidth, setVideoWidth] = useState(40); // Initial width percentage for video section
  const [chatWidth, setChatWidth] = useState(30); // Initial width percentage for chat section
  const [isMindMapOpen, setIsMindMapOpen] = useState(false);
  const [mindMapData, setMindMapData] = useState(null);
  const [isGeneratingMindMap, setIsGeneratingMindMap] = useState(false);
  const [activeEditor, setActiveEditor] = useState({ type: null, index: null });
  const contentEditorRefs = useRef([]);
  const headingEditorRefs = useRef([]);

  const execOnActive = (cmd, value = null) => {
    const { type, index } = activeEditor || {};
    let ref = null;
    if (type === 'content') ref = contentEditorRefs.current[index];
    if (type === 'heading') ref = headingEditorRefs.current[index];
    if (!ref) {
      toast.error('Click into a section first');
      return;
    }
    try {
      ref.focus();
      ref.exec(cmd, value);
    } catch (e) {}
  };

  const [activeResizer, setActiveResizer] = useState(null);
  const [initialWidth, setInitialWidth] = useState({ video: 40, chat: 30 });
  const [initialX, setInitialX] = useState(0);
  const containerRef = useRef(null);

  const MIN_WIDTH = 20;
  const MAX_VIDEO_WIDTH = 60;
  const MAX_CHAT_WIDTH = 50;

  const startResize = (event, type) => {
    event.preventDefault();
    setActiveResizer(type);
    setInitialX(event.clientX);
    setInitialWidth({
      video: videoWidth,
      chat: chatWidth
    });

    // Add the resizing class to the body
    document.body.classList.add('resizing');
  };

  useEffect(() => {
    const handleResize = (event) => {
      if (!activeResizer || !containerRef.current) return;

      const containerWidth = containerRef.current.offsetWidth;
      const deltaX = event.clientX - initialX;
      const deltaPercentage = (deltaX / containerWidth) * 100;

      if (activeResizer === 'video') {
        const newWidth = Math.max(MIN_WIDTH, Math.min(MAX_VIDEO_WIDTH, initialWidth.video + deltaPercentage));
        setVideoWidth(newWidth);

        // Adjust chat width if needed
        if (isChatOpen) {
          const remainingWidth = 100 - newWidth - chatWidth;
          if (remainingWidth < MIN_WIDTH) {
            setChatWidth(100 - newWidth - MIN_WIDTH);
          }
        }
      } else if (activeResizer === 'chat') {
        const deltaChatPercentage = (-deltaX / containerWidth) * 100;
        const newChatWidth = Math.max(MIN_WIDTH, Math.min(MAX_CHAT_WIDTH, initialWidth.chat + deltaChatPercentage));
        setChatWidth(newChatWidth);

        // Adjust video width if needed
        if (isVideoVisible) {
          const remainingWidth = 100 - videoWidth - newChatWidth;
          if (remainingWidth < MIN_WIDTH) {
            setVideoWidth(100 - newChatWidth - MIN_WIDTH);
          }
        }
      }
    };

    const stopResize = () => {
      if (activeResizer) {
        setActiveResizer(null);
        document.body.classList.remove('resizing');
      }
    };

    if (activeResizer) {
      window.addEventListener('mousemove', handleResize);
      window.addEventListener('mouseup', stopResize);
      window.addEventListener('mouseleave', stopResize);
    }

    return () => {
      window.removeEventListener('mousemove', handleResize);
      window.removeEventListener('mouseup', stopResize);
      window.removeEventListener('mouseleave', stopResize);
    };
  }, [activeResizer, initialWidth, initialX, isChatOpen, isVideoVisible]);

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

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }, [messages]);
  

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
      toast.error('Please login to save notes');
      return;
    }

    if (!noteTitle.trim()) {
      toast.error('Please enter a title for your note');
      return;
    }

    try {
      setIsSaving(true);
      toast.loading('Saving notes...', { id: 'saving' });
      const userId = user.uid;

      if (currentNoteId) {
        // Update existing note
        const noteRef = doc(db, 'notes', currentNoteId);
        await updateDoc(noteRef, {
          title: noteTitle,
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

      toast.success('Notes saved successfully!', { id: 'saving' });
    } catch (error) {
      console.error('Error saving notes:', error);
      toast.error('Failed to save notes. Please try again.', { id: 'saving' });
    } finally {
      setIsSaving(false);
    }
  };

  const typeMessage = async (message, delay = 20) => {
    setIsTyping(true);
    let visibleText = '';
    const messageLength = message.length;
    
    for (let i = 0; i < messageLength; i++) {
      visibleText += message[i];
      setMessages(prev => [
        ...prev.slice(0, -1),
        { text: visibleText, sender: 'ai' }
      ]);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
    setIsTyping(false);
  };

  const sendMessage = async (message) => {
    if (!message.trim() || chatLoading) return;

    try {
      setChatLoading(true);
      const newUserMessage = { text: message, sender: 'user' };
      setMessages(prev => [...prev, newUserMessage, { text: '', sender: 'ai' }]);
      
      const response = await axios.post('/api/chat', {
        message,
        videoData,
      });

      // Start typewriter effect for AI response
      await typeMessage(response.data.response);
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
      // Remove the empty AI message if there's an error
      setMessages(prev => prev.slice(0, -1));
    } finally {
      setChatLoading(false);
    }
  };

  const generateMindMap = async () => {
    if (!videoData || videoData.length === 0) {
      toast.error('No notes available to generate mind map');
      return;
    }

    try {
      setIsGeneratingMindMap(true);
      toast.loading('Generating mind map...', { id: 'mindmap' });

      const response = await axios.post('/api/generateMindMap', {
        videoData,
        title: noteTitle,
      });

      setMindMapData(response.data.mindMap);
      setIsMindMapOpen(true);
      toast.success('Mind map generated successfully!', { id: 'mindmap' });
    } catch (error) {
      console.error('Error generating mind map:', error);
      toast.error('Failed to generate mind map. Please try again.', { id: 'mindmap' });
    } finally {
      setIsGeneratingMindMap(false);
    }
  };
  if (isLoading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen flex items-center justify-center bg-black">
          <div className="text-white">Loading...</div>
        </div>
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

  // Calculate main content width based on video and chat visibility
  const getMainContentStyle = () => {
    let width = 100;
    if (isVideoVisible) width -= videoWidth;
    if (isChatOpen) width -= chatWidth;
    return {
      width: `${Math.max(width, 20)}%`,
      transition: 'width 0.3s ease-in-out'
    };
  };

  return (
    <>
      <Toaster
        position="top-center"
        reverseOrder={false}
        toastOptions={{
          duration: 3000,
          style: {
            background: '#333',
            color: '#fff',
          },
        }}
      />
      <style jsx global>{`
        body.resizing {
          cursor: col-resize !important;
          user-select: none !important;
          -webkit-user-select: none !important;
        }
        
        body.resizing * {
          cursor: col-resize !important;
        }
        
        body.resizing iframe {
          pointer-events: none;
        }
      `}</style>
      <style jsx>{`
        /* Shimmer line that sweeps across buttons */
        .btn-shine::after {
          content: "";
          position: absolute;
          inset: 0;
          background: linear-gradient(120deg, transparent 0%, rgba(255,255,255,0.12) 20%, transparent 40%);
          transform: translateX(-100%);
          transition: transform 0.6s ease;
          pointer-events: none;
        }
        .btn-shine:hover::after {
          transform: translateX(100%);
        }

        /* Soft glowing aura around buttons */
        .btn-aura::before {
          content: "";
          position: absolute;
          inset: -1px;
          border-radius: 0.75rem;
          background: radial-gradient(120px 60px at var(--mx,50%) 10%, rgba(255,255,255,0.2), transparent 60%);
          opacity: 0;
          transition: opacity 0.2s ease;
          filter: blur(12px);
          pointer-events: none;
        }
        .btn-aura:hover::before {
          opacity: 1;
        }

        /* Icon hover nudge */
        .btn-icon-move svg { transition: transform .2s ease; }
        .btn-icon-move:hover svg { transform: translateX(2px) translateY(-1px) scale(1.05); }
      `}</style>
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
        .chat-container {
          background-color: #1a202c;
          color: #cbd5e0;
        }
        .chat-message {
          background-color: #2d3748;
          color: #cbd5e0;
        }
        .chat-messages-container {
          scrollbar-width: none; /* Firefox */
          -ms-overflow-style: none;  /* IE and Edge */
          -webkit-overflow-scrolling: touch;
        }
        .chat-messages-container::-webkit-scrollbar {
          width: 0;
          display: none; /* Chrome, Safari and Opera */
        }
        /* Remove the hover states that were showing the scrollbar */
        .chat-messages-container:hover {
          scrollbar-width: none;
          -ms-overflow-style: none;
        }
        .chat-messages-container:hover::-webkit-scrollbar {
          display: none;
          width: 0;
        }
        .chat-input {
          background-color: #2d3748;
          color: #cbd5e0;
        }
        .chat-button {
          background-color: #2b6cb0;
          color: #cbd5e0;
        }
        .chat-button:hover {
          background-color: #2c5282;
        }
        .drag-handle {
          position: relative;
          cursor: col-resize;
          background-color: #374151;
          transition: background-color 0.2s;
        }
        
        .drag-handle:hover,
        .drag-handle:active {
          background-color: #4a5568;
        }
        
        .drag-handle::after {
          content: "";
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 4px;
          height: 20px;
          background-color: #718096;
          border-radius: 2px;
        }
        
        /* Mind Map Styles */
        .mind-map-container {
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
        }
        
        .mind-map-node {
          position: relative;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        .mind-map-node:hover {
          transform: translateY(-2px);
        }
        
        .mind-map-node::before {
          content: '';
          position: absolute;
          top: -2px;
          left: -2px;
          right: -2px;
          bottom: -2px;
          background: linear-gradient(45deg, transparent, rgba(255,255,255,0.3), transparent);
          border-radius: inherit;
          opacity: 0;
          transition: opacity 0.3s ease;
          pointer-events: none;
        }
        
        .mind-map-node:hover::before {
          opacity: 1;
        }
        
        /* Hand-drawn effect for nodes */
        .mind-map-node > div {
          position: relative;
          box-shadow: 
            0 4px 8px rgba(0,0,0,0.1),
            0 2px 4px rgba(0,0,0,0.06),
            inset 0 1px 0 rgba(255,255,255,0.2);
        }
        
        .mind-map-node > div::after {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          border-radius: inherit;
          background: linear-gradient(135deg, rgba(255,255,255,0.1) 0%, transparent 50%);
          pointer-events: none;
        }
        
        /* Smooth animations */
        .mind-map-container * {
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        /* Custom scrollbar for mind map */
        .mind-map-container::-webkit-scrollbar {
          width: 8px;
        }
        
        .mind-map-container::-webkit-scrollbar-track {
          background: #f1f5f9;
          border-radius: 4px;
        }
        
        .mind-map-container::-webkit-scrollbar-thumb {
          background: linear-gradient(45deg, #c084fc, #3b82f6);
          border-radius: 4px;
        }
        
        .mind-map-container::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(45deg, #a855f7, #2563eb);
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
            <div className="flex gap-3 flex-wrap justify-end">
              {videoLink && (
                <button
                  onClick={() => setIsVideoVisible(!isVideoVisible)}
                  className={`${BTN.purple} btn-icon-move`}
                >
                  {isVideoVisible ? 'Hide Video' : 'Play Video'}
                </button>
              )}
              <button
                onClick={handleSave}
                disabled={isSaving}
                className={`${isSaving ? BTN.softGray : BTN.emerald} btn-icon-move`}
              >
                <FaSave />
                {isSaving ? 'Saving...' : 'Save Notes'}
              </button>
              <button
                onClick={handleDownload}
                className={`${BTN.blue} btn-icon-move`}
              >
                <FaDownload />
                Download PDF
              </button>
              {/* <button
                onClick={() => setIsChatOpen(!isChatOpen)}
                className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors duration-200"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd" />
                </svg>
                {isChatOpen ? 'Close Chat' : 'Chat with AI'}
              </button> */}
              <button
                onClick={generateMindMap}
                disabled={isGeneratingMindMap}
                className={`${isGeneratingMindMap ? BTN.softGray : BTN.amber} btn-icon-move`}
              >
                <FaProjectDiagram />
                {isGeneratingMindMap ? 'Generating...' : 'Create Mind Map'}
              </button>
              <button
                onClick={()=>setIsChatOpen(!isChatOpen)}
                className={`${BTN.indigo} btn-icon-move`}
              >
                <FaRobot />
                {isChatOpen ? 'Close Chat' : 'Chat with AI'}
              </button>
            </div>
          </div>

          {/* Global formatting toolbar positioned below header */}
          <div className="flex items-center flex-wrap gap-2 mb-4 mt-2">
            <button
              onClick={() => execOnActive('bold')}
              className="px-3 py-2 rounded border border-gray-700 text-white bg-gray-800 hover:bg-gray-700"
              title="Bold"
            >
              <FaBold className="w-4 h-4" />
            </button>
            <button
              onClick={() => execOnActive('italic')}
              className="px-3 py-2 rounded border border-gray-700 text-white bg-gray-800 hover:bg-gray-700 italic"
              title="Italic"
            >
              <FaItalic className="w-4 h-4" />
            </button>
            <button
              onClick={() => execOnActive('underline')}
              className="px-3 py-2 rounded border border-gray-700 text-white bg-gray-800 hover:bg-gray-700 underline"
              title="Underline"
            >
              <FaUnderline className="w-4 h-4" />
            </button>
            <button
              onClick={() => execOnActive('strikeThrough')}
              className="px-3 py-2 rounded border border-gray-700 text-white bg-gray-800 hover:bg-gray-700"
              title="Strikethrough"
            >
              <FaStrikethrough className="w-4 h-4" />
            </button>
            <button
              onClick={() => execOnActive('superscript')}
              className="px-3 py-2 rounded border border-gray-700 text-white bg-gray-800 hover:bg-gray-700"
              title="Superscript"
            >
              <FaSuperscript className="w-4 h-4" />
            </button>
            <button
              onClick={() => execOnActive('subscript')}
              className="px-3 py-2 rounded border border-gray-700 text-white bg-gray-800 hover:bg-gray-700"
              title="Subscript"
            >
              <FaSubscript className="w-4 h-4" />
            </button>

            {/* Heading selector removed as requested */}

            {/* Font size */}
            <div className="flex items-center gap-2">
              <FaTextHeight className="w-4 h-4 text-gray-300" title="Font size" />
              <select
              onChange={(e) => {
                const size = e.target.value; // 1..7 legacy sizes
                execOnActive('fontSize', size);
              }}
              defaultValue="3"
              className="px-2 py-2 rounded border border-gray-700 bg-gray-800 text-white"
              title="Font size"
            >
              <option value="1">XS</option>
              <option value="2">SM</option>
              <option value="3">MD</option>
              <option value="4">LG</option>
              <option value="5">XL</option>
              <option value="6">2XL</option>
              <option value="7">3XL</option>
              </select>
            </div>

            {/* Font family */}
            <div className="flex items-center gap-2">
              <FaFont className="w-4 h-4 text-gray-300" title="Font family" />
              <select
                onChange={(e) => execOnActive('fontName', e.target.value)}
                defaultValue="inherit"
                className="px-2 py-2 rounded border border-gray-700 bg-gray-800 text-white"
                title="Font family"
              >
                <option value="inherit">Default</option>
                <option value="Arial">Arial</option>
                <option value="Times New Roman">Times</option>
                <option value="Courier New">Monospace</option>
                <option value="Georgia">Georgia</option>
              </select>
            </div>

            {/* Text color */}
            <div className="flex items-center gap-2">
              <FaPalette className="w-4 h-4 text-gray-300" title="Text color" />
              <input
              type="color"
              onChange={(e) => {
                const color = e.target.value;
                execOnActive('foreColor', color);
              }}
              className="h-9 w-10 p-1 rounded border border-gray-700 bg-gray-800"
              title="Text color"
              />
            </div>

            {/* Highlight color */}
            <div className="flex items-center gap-2">
              <FaHighlighter className="w-4 h-4 text-gray-300" title="Highlight color" />
              <input
              type="color"
              onChange={(e) => {
                const color = e.target.value;
                execOnActive('hiliteColor', color);
              }}
              className="h-9 w-10 p-1 rounded border border-gray-700 bg-gray-800"
              title="Highlight color"
              />
            </div>

            {/* Link controls */}
            <button
              onClick={() => {
                const url = prompt('Enter URL');
                if (!url) return;
                execOnActive('createLink', url);
              }}
              className="px-3 py-2 rounded border border-gray-700 text-white bg-gray-800 hover:bg-gray-700"
              title="Insert link"
            >
              <FaLink className="w-4 h-4" />
            </button>
            <button
              onClick={() => execOnActive('unlink')}
              className="px-3 py-2 rounded border border-gray-700 text-white bg-gray-800 hover:bg-gray-700"
              title="Remove link"
            >
              <FaUnlink className="w-4 h-4" />
            </button>

            {/* Lists removed as requested */}

            {/* Alignment */}
            <div className="flex items-center gap-2">
              <FaAlignLeft className="w-4 h-4 text-gray-300" title="Align" />
              <select
              onChange={(e) => {
                const val = e.target.value;
                if (val === 'left') execOnActive('justifyLeft');
                if (val === 'center') execOnActive('justifyCenter');
                if (val === 'right') execOnActive('justifyRight');
                if (val === 'justify') execOnActive('justifyFull');
              }}
              defaultValue="left"
              className="px-2 py-2 rounded border border-gray-700 bg-gray-800 text-white"
              title="Align"
            >
              <option value="left">Left</option>
              <option value="center">Center</option>
              <option value="right">Right</option>
              <option value="justify">Justify</option>
              </select>
            </div>

            {/* Horizontal rule */}
            <button
              onClick={() => execOnActive('insertHorizontalRule')}
              className="px-3 py-2 rounded border border-gray-700 text-white bg-gray-800 hover:bg-gray-700"
              title="Insert horizontal rule"
            >
              <FaMinus className="w-4 h-4" />
            </button>

            {/* Clear formatting */}
            <button
              onClick={() => execOnActive('removeFormat')}
              className="px-3 py-2 rounded border border-gray-700 text-white bg-gray-800 hover:bg-gray-700"
              title="Clear formatting"
            >
              Clear
            </button>

            {/* Undo/Redo */}
            <button
              onClick={() => execOnActive('undo')}
              className="px-3 py-2 rounded border border-gray-700 text-white bg-gray-800 hover:bg-gray-700"
              title="Undo"
            >
              <FaUndo className="w-4 h-4" />
            </button>
            <button
              onClick={() => execOnActive('redo')}
              className="px-3 py-2 rounded border border-gray-700 text-white bg-gray-800 hover:bg-gray-700"
              title="Redo"
            >
              <FaRedo className="w-4 h-4" />
            </button>
          </div>

          {/* Main Content with Video Section */}
          <div ref={containerRef} className="flex gap-0 relative">
            {/* Video Section */}
            {isVideoVisible && videoLink && (
              <>
                <div 
                  style={{ 
                    width: `${videoWidth}%`,
                    transition: activeResizer ? 'none' : 'width 0.3s ease-in-out'
                  }} 
                  className="sticky top-24 h-[calc(100vh-6rem)]"
                >
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

                {/* Video Resizer */}
                <div
                  className="w-1 drag-handle"
                  onMouseDown={(e) => startResize(e, 'video')}
                  style={{ cursor: 'col-resize' }}
                ></div>
              </>
            )}

            {/* Notes Section */}
            <div 
              style={{
                ...getMainContentStyle(),
                transition: activeResizer ? 'none' : 'width 0.3s ease-in-out'
              }}
            >
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
                          className="opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                          title="Delete section"
                        >
                          <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 hover:text-red-300 ring-1 ring-inset ring-red-500/20">
                            <FaTrash />
                          </span>
                        </button>
                      </div>
                      <h2 className="text-2xl font-semibold text-white mb-4 flex items-center gap-2">
                        <span className="w-8 h-8 flex items-center justify-center bg-blue-900 text-blue-200 rounded-full text-sm">
                          {index + 1}
                        </span>
                        <div className="w-full">
                          <RichTextEditor
                            ref={(el) => (headingEditorRefs.current[index] = el)}
                            value={section.heading}
                            onChange={(html) => handleHeadingChange(index, html)}
                            onFocus={() => setActiveEditor({ type: 'heading', index })}
                            showToolbar={false}
                            placeholder="Section title"
                          />
                        </div>
                      </h2>
                      <div className="pl-10">
                        <RichTextEditor
                          ref={(el) => (contentEditorRefs.current[index] = el)}
                          value={section.content}
                          onChange={(html) => handleContentChange(index, html)}
                          onFocus={() => setActiveEditor({ type: 'content', index })}
                          showToolbar={false}
                          placeholder="Add your content here..."
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Add Section button */}
              <div className={`flex justify-center ${isVideoVisible ? 'mb-6' : 'mb-8'}`}>
                <button
                  onClick={handleAddNewSection}
                  className={`${BTN.emerald} px-6 py-3 text-lg btn-icon-move`}
                >
                  + Add New Section
                </button>
              </div>
            </div>

            {/* Chat Divider Line */}
            {isChatOpen && (
              <div
                className="w-1 drag-handle"
                onMouseDown={(e) => startResize(e, 'chat')}
                style={{ cursor: 'col-resize' }}
              ></div>
            )}

            {/* Chat Interface */}
            {isChatOpen && (
              <div 
                style={{ 
                  width: `${chatWidth}%`,
                  transition: activeResizer ? 'none' : 'width 0.3s ease-in-out'
                }} 
                className="h-[80vh] sticky top-24 chat-container rounded-xl border border-gray-800 p-4"
              >
                <div className="flex flex-col h-full max-h-[calc(80vh-2rem)]">
                  <div className="text-lg font-semibold mb-4">Chat with AI</div>
                  <div className="flex-grow overflow-y-auto mb-4  space-y-4 max-h-[calc(80vh-10rem)] chat-messages-container">
                    {messages.map((msg, idx) => (
                      <div 
                        key={idx} 
                        className={`p-3 rounded-lg chat-message ${
                          msg.sender === 'user' ? 'ml-auto' : ''
                        } max-w-[80%] ${
                          msg.sender === 'ai' && isTyping && idx === messages.length - 1
                            ? 'border-l-4 border-blue-500'
                            : ''
                        }`}
                      >
                        {msg.text}
                        {msg.sender === 'ai' && isTyping && idx === messages.length - 1 && (
                          <span className="inline-block w-1 h-4 bg-blue-500 ml-1 animate-pulse">|</span>
                        )}
                      </div>
                    ))}
                    <div ref={chatEndRef} />
                  </div>
                  <div className="flex gap-2">
                    <input
                      value={inputMessage}
                      onChange={(e) => setInputMessage(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && sendMessage(inputMessage)}
                      placeholder="Type your message..."
                      className="flex-grow chat-input rounded-lg px-4 py-2"
                      disabled={chatLoading}
                    />
                    <button
                      onClick={() => sendMessage(inputMessage)}
                      disabled={isLoading}
                      className="chat-button px-4 py-2 rounded-lg"
                    >
                      {chatLoading ? 'Sending...' : 'Send'}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

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

      {/* Mind Map Modal */}
      <MindMapModal
        isOpen={isMindMapOpen}
        onClose={() => setIsMindMapOpen(false)}
        mindMapData={mindMapData}
        title={noteTitle}
      />
      
      <Footer />
    </>
  );
}

