import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { generateFlashcards } from './groqGenerate';
export async function POST(request) {
  try {
    // Parse the request body to get the noteId
    const { noteId } = await request.json();

    if (!noteId) {
      return NextResponse.json(
        { error: 'Note ID is required' },
        { status: 400 }
      );
    }

    // Get the note document from Firebase
    const noteRef = doc(db, 'notes', noteId);
    const noteSnap = await getDoc(noteRef);
    if (!noteSnap.exists()) {
      return NextResponse.json(
        { error: 'Note not found' },
        { status: 404 }
      );
    }
    const noteData = noteSnap.data();
    const data= noteData.content;
    // console.log(data);
    const flashcards= await generateFlashcards(data);
    // Return the note data
    return NextResponse.json({ 
      success: true,
      flashcards 
    });

  } catch (error) {
    console.error('Error generating flashcards:', error);
    return NextResponse.json(
      { error: 'Failed to generate flashcards' },
      { status: 500 }
    );
  }
}
