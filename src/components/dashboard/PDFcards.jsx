"use client";
import React from "react";
import { PinContainer } from "../ui/3d-pin";

export  default function PDFcards({
  title = "/ui.aceternity.com",
  href = "/",
  heading = "Aceternity UI",
  description = "Customizable Tailwind CSS and Framer Motion Components.",
  gradientClasses = "bg-gradient-to-br from-violet-500 via-purple-500 to-blue-500",
  imageSrc = "",
  imageAlt = "Image",
}) {
  return (
    <div>
      <PinContainer title={title} href={href}>
        <div className="flex basis-full flex-col p-4 tracking-tight text-slate-100/50 sm:basis-1/2 w-[20rem] h-[20rem]">
          <h3 className="max-w-xs !pb-2 !m-0 font-bold text-base text-slate-100">
            {heading}
          </h3>
          <div className="text-base !m-0 !p-0 font-normal">
            <span className="text-slate-500">{description}</span>
          </div>
          <div className="flex flex-1 w-full rounded-lg mt-4 overflow-hidden">
            {imageSrc ? (
              <img
                src={imageSrc}
                alt={imageAlt}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className={`flex flex-1 w-full ${gradientClasses}`} />
            )}
          </div>
        </div>
      </PinContainer>
    </div>
  );
}
