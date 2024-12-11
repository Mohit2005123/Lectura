// dashboard/layout.jsx
import React from "react";
import Navbar from "@/components/landingpage/Navbar";

const DashboardLayout = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col">
      {/* navbar */}
      <Navbar></Navbar>

      {/* Main Content */}
      <main className="flex-1 p-4 bg-black">{children}</main>
    </div>
  );
};

export default DashboardLayout;
