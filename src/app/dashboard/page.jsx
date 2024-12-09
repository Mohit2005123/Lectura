"use client";
import React from "react";
import { SparklesPreview } from "@/components/dashboard/SparklesPreview";
import { AnimatedPinDemo } from "@/components/dashboard/AnimatedPinDemo";
// import { PinContainer } from "@/components/ui/3d-pin";

const DashboardPage = () => {
  return (
    <div className="relative p-4">
      <SparklesPreview />
      <div className="flex justify-center">
        <AnimatedPinDemo heading="Vid 1" title="pdf 1"/>
        <AnimatedPinDemo heading="Vid 2" title="pdf 2"/>
        <AnimatedPinDemo heading="Vid 3" title="pdf 3"/>
      </div>
    </div>
  );
};

export default DashboardPage;
