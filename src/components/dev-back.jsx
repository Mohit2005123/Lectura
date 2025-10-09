"use client";
import React from "react";
import { BackgroundGradient } from "@/components/ui/background-gradient";
import Image from "next/image";
import { FloatingDockDemo } from "./dock";

export function BackgroundGradientDemo({ imgSrc, description, githubLink, linkedinLink, instagramLink }) {
  return (
    <div className="flex justify-center items-center min-h-screen">
      <BackgroundGradient className="flex flex-col items-center justify-center rounded-[22px] max-w-[30rem] max-h-[35rem] p-4 sm:p-10 bg-black dark:bg-zinc-900">
        <Image
          src={imgSrc}
          alt="Content Image"
          height="300"
          width="300"
          className="object-contain"
        />
        <p className="md:text-2xl sm:text-xl text-white mt-4 mb-4 font-normal text-center">
          {description}
        </p>

        <div className="w-full">
          <FloatingDockDemo
            githubLink={githubLink}
            linkedinLink={linkedinLink}
            instagramLink={instagramLink}
          />
        </div>
      </BackgroundGradient>
    </div>
  );
}
