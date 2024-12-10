"use client";
import React from "react";
import {
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalTrigger,
} from '@/components/ui/animated-modal'
import { FileUploadDemo } from "@/components/FileUpload";

export default function NoteUploadModal() {
  return (
    <div className="py-40 flex items-center justify-center">
      <Modal>
        <ModalTrigger className="bg-black dark:bg-white dark:text-black text-white flex justify-center group/modal-btn">
          <span className="group-hover/modal-btn:translate-x-40 text-center transition duration-500">
            Upload File
          </span>
          <div className="-translate-x-40 group-hover/modal-btn:translate-x-0 flex items-center justify-center absolute inset-0 transition duration-500 text-white z-20">
            📄
          </div>
        </ModalTrigger>
        <ModalBody className="bg-black">
          <ModalContent className="bg-black">
            <FileUploadDemo />
          </ModalContent>
        </ModalBody>
      </Modal>
    </div>
  );
}



