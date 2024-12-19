import React from "react";
import { FloatingDock } from "@/components/ui/floating-dock";
import {
  IconBrandGithub,
  IconBrandInstagram,
  IconBrandLinkedin,
} from "@tabler/icons-react";

export function FloatingDockDemo({ githubLink, linkedinLink, instagramLink }) {
  const links = [
    {
      title: "GitHub",
      icon: (
        <IconBrandGithub className=" text-neutral-500 dark:text-neutral-300" />
      ),
      href: githubLink,
    },
    {
      title: "LinkedIn",
      icon: (
        <IconBrandLinkedin className=" text-neutral-500 dark:text-neutral-300" />
      ),
      href: linkedinLink,
    },
    {
      title: "Instagram",
      icon: (
        <IconBrandInstagram className=" text-neutral-500 dark:text-neutral-300" />
      ),
      href: instagramLink,
    },
  ];

  return (
    <div className="flex items-center justify-center h-[5rem] w-full">
      <FloatingDock
        // only for demo, remove for production
        mobileClassName="translate-y-20"
        items={links}
      />
    </div>
  );
}
