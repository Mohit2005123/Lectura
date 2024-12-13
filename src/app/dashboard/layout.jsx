// dashboard/layout.jsx
"use client";

import React from "react";
import Navbar from "@/components/landingpage/Navbar";
import Flashcard from "./flashcard";

const DashboardLayout = ({ children }) => {
  return (
    <div className="w-[100%] bg-[#0f0f11] min-h-screen flex flex-col">
      {/* navbar */}
      <Navbar />

      {/* Main Content */}
      <main className="flex-1 p-4 bg-black">{children}</main>
      <div className="mt-[15rem]">
        <Flashcard />
      </div>
    </div>
  );
};

export default DashboardLayout;
