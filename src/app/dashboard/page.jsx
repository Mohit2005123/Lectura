'use client';
import React, { useState } from "react";
import Navbar from '../../components/landingpage/Navbar';
import PDFcards from '../../components/dashboard/PDFcards';
import { SparklesCore } from '../../components/ui/sparkles';
import FlashCardModal from "@/components/dashboard/flashcard_modal";

const DashboardPage = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCard, setSelectedCard] = useState(null);

  const openModal = (card) => {
    setSelectedCard(card);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedCard(null);
  };

  const cardData = [
    {
      heading: "Video 1",
      title: "Introduction to React",
      description: "Customizable Tailwind CSS and Framer Motion Components."
    },
    {
      heading: "Video 2",
      title: "JavaScript Basics",
      description: "Customizable Tailwind CSS and Framer Motion Components."
    },
    {
      heading: "Video 3",
      title: "CSS Fundamentals",
      description: "Customizable Tailwind CSS and Framer Motion Components."
    },
    {
      heading: "Video 4",
      title: "Advanced CSS",
      description: "Customizable Tailwind CSS and Framer Motion Components."
    },
    {
      heading: "Video 5",
      title: "React Hooks",
      description: "Customizable Tailwind CSS and Framer Motion Components."
    },
    {
      heading: "Video 6",
      title: "JavaScript ES6",
      description: "Customizable Tailwind CSS and Framer Motion Components."
    },
    {
      heading: "Video 7",
      title: "Frontend Frameworks",
      description: "Customizable Tailwind CSS and Framer Motion Components."
    },
  ];

  return (
    <div className="min-h-screen bg-black">
      <div className="fixed top-0 left-0 right-0 z-50">
        <Navbar />
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-8 py-8 pt-24 max-w-[1200px] relative">
        {/* Heading Section - Reduced height */}
        <div className="h-[10rem] w-full flex flex-col items-center p-5 mt-10 overflow-hidden rounded-md">
          <h1 className="md:text-7xl text-xl lg:text-6xl font-bold text-center text-white relative z-20">
            Dashboard
          </h1>
        </div>

        {/* Sparkles Background - Fixed position with adjusted top value */}
        <div className="fixed inset-0 w-full h-full" style={{ top: '200px', zIndex: 10 }}>
          <SparklesCore
            background="transparent"
            minSize={1}
            maxSize={2}
            particleDensity={1500}
            className="w-full h-full"
            particleColor="#FFFFFF"
          />
          {/* Radial Gradient to prevent sharp edges */}
          <div className="absolute inset-0 w-full h-full bg-black [mask-image:radial-gradient(350px_200px_at_top,transparent_20%,white)]"></div>
        </div>

        {/* Cards Grid - Positioned above sparkles */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-12 mt-10 relative z-20">
          {cardData.map((card, index) => (
            <div className="h-[28rem] flex flex-col justify-between" key={index}>
              <PDFcards 
                heading={card.heading} 
                title={card.title}
                description={card.description}
              />
              <button
                onClick={() => openModal(card)}
                className="w-full mt-12 mb-4 px-4 py-2 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-lg 
                hover:from-purple-600 hover:to-blue-600 transition-all duration-200 shadow-lg 
                font-medium text-sm flex items-center justify-center"
              >
                <span>Open Flashcards</span>
              </button>
            </div>
          ))}
        </div>

        <FlashCardModal
          isOpen={isModalOpen}
          onClose={closeModal}
          card={selectedCard}
        />
      </div>
    </div>
  );
};

export default DashboardPage;
