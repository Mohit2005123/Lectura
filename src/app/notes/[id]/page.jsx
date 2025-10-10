'use client';
import { useRef, useState, useEffect } from 'react';
import html2pdf from 'html2pdf.js';
import { 
  FaDownload, FaFilePdf, FaTrash, FaSave, FaRobot, FaProjectDiagram,
  FaBold, FaItalic, FaUnderline, FaStrikethrough, FaSuperscript, FaSubscript,
  FaLink, FaUnlink, FaUndo, FaRedo, FaHighlighter, FaPalette, FaFont, FaTextHeight, FaMinus,
  FaAlignLeft, FaAlignCenter, FaAlignRight, FaAlignJustify
} from 'react-icons/fa';
import Navbar from '../../../components/landingpage/Navbar';
import Footer from '../../../components/Footer';
import MindMapModal from '../../../components/MindMap/MindMapModal';
import RichTextEditor from '../../../components/RichTextEditor';
import { db, auth } from '../../../lib/firebase';
import { doc, getDoc, updateDoc, collection, addDoc, setDoc, arrayUnion } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { useParams } from 'next/navigation';
import axios from 'axios';
import { Toaster, toast } from 'react-hot-toast';

// Modern Button styling object - More rounded
const BTN = {
  primary: "group relative flex items-center gap-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-4 py-2 rounded-2xl font-medium transition-all duration-300 ease-out shadow-lg hover:shadow-xl hover:shadow-blue-500/25 hover:-translate-y-0.5 active:translate-y-0 active:shadow-md border border-blue-500/20 backdrop-blur-sm",
  secondary: "group relative flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white px-4 py-2 rounded-2xl font-medium transition-all duration-300 ease-out shadow-lg hover:shadow-xl hover:shadow-emerald-500/25 hover:-translate-y-0.5 active:translate-y-0 active:shadow-md border border-emerald-400/20 backdrop-blur-sm",
  accent: "group relative flex items-center gap-2 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white px-4 py-2 rounded-2xl font-medium transition-all duration-300 ease-out shadow-lg hover:shadow-xl hover:shadow-purple-500/25 hover:-translate-y-0.5 active:translate-y-0 active:shadow-md border border-purple-500/20 backdrop-blur-sm",
  warning: "group relative flex items-center gap-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white px-4 py-2 rounded-2xl font-medium transition-all duration-300 ease-out shadow-lg hover:shadow-xl hover:shadow-amber-500/25 hover:-translate-y-0.5 active:translate-y-0 active:shadow-md border border-amber-400/20 backdrop-blur-sm",
  disabled: "group relative flex items-center gap-2 bg-gradient-to-r from-gray-500 to-gray-600 text-white px-4 py-2 rounded-2xl font-medium transition-all duration-300 ease-out shadow-md cursor-not-allowed opacity-60 border border-gray-400/20"
};

export default function VideoPage() {
  const params = useParams();
  const contentRef = useRef(null);
  const hiddenContentRef = useRef(null);
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
        /* Modern button effects */
        button.group {
          position: relative;
          overflow: hidden;
        }
        
        /* Shimmer effect for modern buttons */
        button.group::before {
          content: "";
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
          transition: left 0.5s ease;
        }
        
        button.group:hover::before {
          left: 100%;
        }
        
        /* Icon animations */
        button.group svg {
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        button.group:hover svg {
          transform: scale(1.1) rotate(2deg);
        }
        
        /* Ripple effect */
        button.group::after {
          content: "";
          position: absolute;
          top: 50%;
          left: 50%;
          width: 0;
          height: 0;
          border-radius: 50%;
          background: rgba(255,255,255,0.3);
          transform: translate(-50%, -50%);
          transition: width 0.6s, height 0.6s;
        }
        
        button.group:active::after {
          width: 300px;
          height: 300px;
        }
        
        /* Focus ring for accessibility */
        button.group:focus {
          outline: none;
          ring: 2px;
          ring-color: rgba(59, 130, 246, 0.5);
          ring-offset: 2px;
        }
        
        /* Loading state animation */
        button.group.loading svg {
          animation: spin 1s linear infinite;
        }
        
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        
        /* Pulse animation for important actions */
        button.group.pulse {
          animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
        
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.8; }
        }
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
        .chat-message-user {
          background-color: #2b6cb0;
          color: #ffffff;
        }
        .chat-message-ai {
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
            <div className="flex gap-4 flex-wrap justify-end">
              {videoLink && (
                <button
                  onClick={() => setIsVideoVisible(!isVideoVisible)}
                  className={`${BTN.accent} ${isVideoVisible ? 'pulse' : ''}`}
                >
                  <FaFilePdf className="w-5 h-5" />
                  {isVideoVisible ? 'Hide Video' : 'Play Video'}
                </button>
              )}
              <button
                onClick={handleSave}
                disabled={isSaving}
                className={`${isSaving ? BTN.disabled : BTN.secondary} ${isSaving ? 'loading' : ''}`}
              >
                <FaSave className="w-5 h-5" />
                {isSaving ? 'Saving...' : 'Save Notes'}
              </button>
              <button
                onClick={handleDownload}
                className={BTN.primary}
              >
                <FaDownload className="w-5 h-5" />
                Download PDF
              </button>
              <button
                onClick={generateMindMap}
                disabled={isGeneratingMindMap}
                className={`${isGeneratingMindMap ? BTN.disabled : BTN.warning} ${isGeneratingMindMap ? 'loading' : ''}`}
              >
                <FaProjectDiagram className="w-5 h-5" />
                {isGeneratingMindMap ? 'Generating...' : 'Create Mind Map'}
              </button>
              <button
                onClick={() => setIsChatOpen(!isChatOpen)}
                className={`${BTN.accent} ${isChatOpen ? 'pulse' : ''}`}
              >
                <FaRobot className="w-5 h-5" />
                {isChatOpen ? 'Close Chat' : 'Chat with AI'}
              </button>
            </div>
          </div>

          {/* Modern formatting toolbar */}
          <div className="flex items-center flex-wrap gap-3 mb-6 mt-4 p-4 bg-gray-900/50 rounded-xl border border-gray-700/50 backdrop-blur-sm">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-300 mr-2">Format:</span>
              <button
                onClick={() => execOnActive('bold')}
                className="group flex items-center justify-center w-8 h-8 rounded-xl bg-gray-800/80 hover:bg-gray-700 text-gray-300 hover:text-white transition-all duration-200 border border-gray-600/50 hover:border-gray-500 hover:shadow-lg"
                title="Bold"
              >
                <FaBold className="w-3 h-3" />
              </button>
              <button
                onClick={() => execOnActive('italic')}
                className="group flex items-center justify-center w-8 h-8 rounded-xl bg-gray-800/80 hover:bg-gray-700 text-gray-300 hover:text-white transition-all duration-200 border border-gray-600/50 hover:border-gray-500 hover:shadow-lg italic"
                title="Italic"
              >
                <FaItalic className="w-3 h-3" />
              </button>
              <button
                onClick={() => execOnActive('underline')}
                className="group flex items-center justify-center w-8 h-8 rounded-xl bg-gray-800/80 hover:bg-gray-700 text-gray-300 hover:text-white transition-all duration-200 border border-gray-600/50 hover:border-gray-500 hover:shadow-lg underline"
                title="Underline"
              >
                <FaUnderline className="w-3 h-3" />
              </button>
              <button
                onClick={() => execOnActive('strikeThrough')}
                className="group flex items-center justify-center w-8 h-8 rounded-xl bg-gray-800/80 hover:bg-gray-700 text-gray-300 hover:text-white transition-all duration-200 border border-gray-600/50 hover:border-gray-500 hover:shadow-lg"
                title="Strikethrough"
              >
                <FaStrikethrough className="w-3 h-3" />
              </button>
              <button
                onClick={() => execOnActive('superscript')}
                className="group flex items-center justify-center w-8 h-8 rounded-xl bg-gray-800/80 hover:bg-gray-700 text-gray-300 hover:text-white transition-all duration-200 border border-gray-600/50 hover:border-gray-500 hover:shadow-lg"
                title="Superscript"
              >
                <FaSuperscript className="w-3 h-3" />
              </button>
              <button
                onClick={() => execOnActive('subscript')}
                className="group flex items-center justify-center w-8 h-8 rounded-xl bg-gray-800/80 hover:bg-gray-700 text-gray-300 hover:text-white transition-all duration-200 border border-gray-600/50 hover:border-gray-500 hover:shadow-lg"
                title="Subscript"
              >
                <FaSubscript className="w-3 h-3" />
              </button>
            </div>

            {/* Heading selector removed as requested */}

            {/* Font controls */}
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-300 mr-2">Font:</span>
              <div className="flex items-center gap-2">
                <FaTextHeight className="w-4 h-4 text-gray-400" title="Font size" />
                <select
                  onChange={(e) => {
                    const size = e.target.value;
                    execOnActive('fontSize', size);
                  }}
                  defaultValue="3"
                  className="px-2 py-1 rounded-xl border border-gray-600/50 bg-gray-800/80 text-white text-sm focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all duration-200"
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
              <div className="flex items-center gap-2">
                <FaFont className="w-4 h-4 text-gray-400" title="Font family" />
                <select
                  onChange={(e) => execOnActive('fontName', e.target.value)}
                  defaultValue="inherit"
                  className="px-2 py-1 rounded-xl border border-gray-600/50 bg-gray-800/80 text-white text-sm focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all duration-200"
                  title="Font family"
                >
                  <option value="inherit">Default</option>
                  <option value="Arial">Arial</option>
                  <option value="Times New Roman">Times</option>
                  <option value="Courier New">Monospace</option>
                  <option value="Georgia">Georgia</option>
                </select>
              </div>
            </div>

            {/* Color controls */}
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-300 mr-2">Colors:</span>
              <div className="flex items-center gap-2">
                <FaPalette className="w-4 h-4 text-gray-400" title="Text color" />
                <input
                  type="color"
                  onChange={(e) => {
                    const color = e.target.value;
                    execOnActive('foreColor', color);
                  }}
                  className="h-8 w-10 rounded-xl border border-gray-600/50 bg-gray-800/80 cursor-pointer hover:scale-105 transition-transform duration-200"
                  title="Text color"
                />
              </div>
              <div className="flex items-center gap-2">
                <FaHighlighter className="w-4 h-4 text-gray-400" title="Highlight color" />
                <input
                  type="color"
                  onChange={(e) => {
                    const color = e.target.value;
                    execOnActive('hiliteColor', color);
                  }}
                  className="h-8 w-10 rounded-xl border border-gray-600/50 bg-gray-800/80 cursor-pointer hover:scale-105 transition-transform duration-200"
                  title="Highlight color"
                />
              </div>
            </div>

            {/* Link controls */}
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-300 mr-2">Links:</span>
              <button
                onClick={() => {
                  const url = prompt('Enter URL');
                  if (!url) return;
                  execOnActive('createLink', url);
                }}
                className="group flex items-center justify-center w-8 h-8 rounded-xl bg-gray-800/80 hover:bg-gray-700 text-gray-300 hover:text-white transition-all duration-200 border border-gray-600/50 hover:border-gray-500 hover:shadow-lg"
                title="Insert link"
              >
                <FaLink className="w-3 h-3" />
              </button>
              <button
                onClick={() => execOnActive('unlink')}
                className="group flex items-center justify-center w-8 h-8 rounded-xl bg-gray-800/80 hover:bg-gray-700 text-gray-300 hover:text-white transition-all duration-200 border border-gray-600/50 hover:border-gray-500 hover:shadow-lg"
                title="Remove link"
              >
                <FaUnlink className="w-3 h-3" />
              </button>
            </div>

            {/* Alignment */}
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-300 mr-2">Align:</span>
              <div className="flex items-center gap-2">
                <FaAlignLeft className="w-4 h-4 text-gray-400" title="Align" />
                <select
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val === 'left') execOnActive('justifyLeft');
                    if (val === 'center') execOnActive('justifyCenter');
                    if (val === 'right') execOnActive('justifyRight');
                    if (val === 'justify') execOnActive('justifyFull');
                  }}
                  defaultValue="left"
                  className="px-2 py-1 rounded-xl border border-gray-600/50 bg-gray-800/80 text-white text-sm focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all duration-200"
                  title="Align"
                >
                  <option value="left">Left</option>
                  <option value="center">Center</option>
                  <option value="right">Right</option>
                  <option value="justify">Justify</option>
                </select>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-300 mr-2">Actions:</span>
              <button
                onClick={() => execOnActive('insertHorizontalRule')}
                className="group flex items-center justify-center w-8 h-8 rounded-xl bg-gray-800/80 hover:bg-gray-700 text-gray-300 hover:text-white transition-all duration-200 border border-gray-600/50 hover:border-gray-500 hover:shadow-lg"
                title="Insert horizontal rule"
              >
                <FaMinus className="w-3 h-3" />
              </button>
              <button
                onClick={() => execOnActive('removeFormat')}
                className="px-2 py-1 rounded-xl bg-gray-800/80 hover:bg-gray-700 text-gray-300 hover:text-white transition-all duration-200 border border-gray-600/50 hover:border-gray-500 hover:shadow-lg text-sm font-medium"
                title="Clear formatting"
              >
                Clear
              </button>
              <button
                onClick={() => execOnActive('undo')}
                className="group flex items-center justify-center w-8 h-8 rounded-xl bg-gray-800/80 hover:bg-gray-700 text-gray-300 hover:text-white transition-all duration-200 border border-gray-600/50 hover:border-gray-500 hover:shadow-lg"
                title="Undo"
              >
                <FaUndo className="w-3 h-3" />
              </button>
              <button
                onClick={() => execOnActive('redo')}
                className="group flex items-center justify-center w-8 h-8 rounded-xl bg-gray-800/80 hover:bg-gray-700 text-gray-300 hover:text-white transition-all duration-200 border border-gray-600/50 hover:border-gray-500 hover:shadow-lg"
                title="Redo"
              >
                <FaRedo className="w-3 h-3" />
              </button>
            </div>
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
                className={`bg-black rounded-xl shadow-lg border border-gray-800 ${isVideoVisible ? 'p-6' : 'p-8'
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
                          className="group/delete opacity-0 group-hover:opacity-100 transition-all duration-300 hover:scale-110"
                          title="Delete section"
                        >
                          <span className="inline-flex items-center justify-center w-10 h-10 rounded-2xl bg-gradient-to-r from-red-500/10 to-red-600/10 text-red-400 hover:from-red-500/20 hover:to-red-600/20 hover:text-red-300 ring-1 ring-inset ring-red-500/20 hover:ring-red-500/40 transition-all duration-200 shadow-lg hover:shadow-red-500/25">
                            <FaTrash className="w-4 h-4" />
                          </span>
                        </button>
                      </div>
                      <h2 className="text-2xl font-semibold text-white mb-4 flex items-center gap-3">
                        <span className="w-10 h-10 flex items-center justify-center bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-2xl text-sm font-bold shadow-lg ring-1 ring-blue-500/20">
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
                  className={`${BTN.secondary} text-lg`}
                >
                  <span className="text-xl">+</span>
                  Add New Section
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
                className="h-[80vh] sticky top-24 bg-gray-900/90 rounded-xl border border-gray-700 p-4 backdrop-blur-sm"
              >
                <div className="flex flex-col h-full max-h-[calc(80vh-2rem)]">
                  <div className="text-lg font-semibold mb-4 text-white">Chat with AI</div>
                  <div className="flex-grow overflow-y-auto mb-4 space-y-4 max-h-[calc(80vh-10rem)] chat-messages-container">
                    {messages.length === 0 && (
                      <div className="text-center text-gray-400 py-8">
                        <div className="text-4xl mb-2">🤖</div>
                        <div className="text-sm">Start a conversation with AI about your notes!</div>
                      </div>
                    )}
                    {messages.map((msg, idx) => (
                      <div
                        key={idx}
                        className={`p-4 rounded-2xl max-w-[80%] ${
                          msg.sender === 'user' 
                            ? 'ml-auto bg-gradient-to-r from-blue-600 to-blue-700 text-white' 
                            : 'bg-gray-800/80 text-gray-100 border border-gray-600/50'
                        } ${msg.sender === 'ai' && isTyping && idx === messages.length - 1
                          ? 'border-l-4 border-blue-500'
                          : ''
                        }`}
                      >
                        <div className="text-sm leading-relaxed">
                          {msg.text}
                          {msg.sender === 'ai' && isTyping && idx === messages.length - 1 && (
                            <span className="inline-block w-1 h-4 bg-blue-500 ml-1 animate-pulse">|</span>
                          )}
                        </div>
                      </div>
                    ))}
                    <div ref={chatEndRef} />
                  </div>
                  <div className="flex gap-3">
                    <input
                      value={inputMessage}
                      onChange={(e) => setInputMessage(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && sendMessage(inputMessage)}
                      placeholder="Type your message..."
                      className="flex-grow px-4 py-3 rounded-2xl bg-gray-800/80 border border-gray-600/50 text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all duration-200 backdrop-blur-sm"
                      disabled={chatLoading}
                    />
                    <button
                      onClick={() => sendMessage(inputMessage)}
                      disabled={chatLoading}
                      className={`${chatLoading ? BTN.disabled : BTN.primary} ${chatLoading ? 'loading' : ''}`}
                    >
                      <FaRobot className="w-4 h-4" />
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

