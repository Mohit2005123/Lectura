"use client";
import React from "react";
import {
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalTrigger,
} from '@/components/ui/animated-modal'
import Image from "next/image";
import { motion } from "framer-motion";

export default function VideoUploadModal() {
  return (
    <div className="py-40 flex items-center justify-center">
      <Modal>
        <ModalTrigger className="bg-black dark:bg-white dark:text-black text-white flex justify-center group/modal-btn">
          <span className="group-hover/modal-btn:translate-x-40 text-center transition duration-500">
            Upload Video
          </span>
          <div className="-translate-x-40 group-hover/modal-btn:translate-x-0 flex items-center justify-center absolute inset-0 transition duration-500 text-white z-20">
            🎥
          </div>
        </ModalTrigger>
        <ModalBody className="bg-black">
          <ModalContent className="bg-black">
            <h4 className="text-lg md:text-2xl text-white font-bold text-center mb-8">
              Add Your <span className="text-blue-500">Video</span> Link
            </h4>
            
            <div className="space-y-6 max-w-md mx-auto">
              <div className="relative">
                <input 
                  type="text"
                  placeholder="Paste video URL here"
                  className="w-full px-6 py-4 bg-black border border-neutral-800 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white placeholder:text-neutral-400 transition-all text-lg"
                />
              </div>
            </div>
          </ModalContent>
          <ModalFooter className="gap-4 bg-black">
            <button className="px-4 py-2 bg-black text-white border border-neutral-700 rounded-lg text-sm w-28 hover:bg-neutral-900 transition-all">
              Cancel
            </button>
            <button className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg border border-blue-600 w-28 hover:bg-blue-700 transition-all">
              Submit
            </button>
          </ModalFooter>
        </ModalBody>
      </Modal>
    </div>
  );
}



