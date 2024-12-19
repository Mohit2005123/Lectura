'use client'
import React, { createContext, useState, useContext } from "react";
const NotesContext = createContext();
export const NotesProvider = ({ children }) => {
  const [notes, setNotes] = useState("");
  const [isNotesUploaded, setIsNotesUploaded] = useState(false);
  const uploadNotes = (uploadedNotes) => {
    setNotes(uploadedNotes);
    setIsNotesUploaded(true);
  };
  return (
    <NotesContext.Provider value={{ notes, isNotesUploaded, uploadNotes }}>
      {children}
    </NotesContext.Provider>
  );
};

export const useNotes = () => useContext(NotesContext);
