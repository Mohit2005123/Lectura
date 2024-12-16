import { NextResponse } from "next/server";
import getTranscript from "./generateTranscript";
import generateNotes from "./groqGenerate";
const GroqApiKey=process.env.GROQ_API_KEY;
export async function POST(request) {
  try{
    const {link} = await request.json();
    if(!link){
      return NextResponse.json({message:'Link not given'}, {status:500});
    }
    const transcript= await getTranscript(link);
    if(!transcript){
      return NextResponse.json({message:'Transcript generation failed'},{status:'500'});
    };
    // console.log(transcript);
    // console.log(typeof transcript);
    // return NextResponse.json({transcript});
    const notes=await  generateNotes(GroqApiKey, transcript);
    if(!notes){
      return NextResponse.json({message:'Notes generation from AI failed'}, {status:500});
    }
    return NextResponse.json({message:'Successfull', notes:notes, link:link}, {status:200});
  }
  catch(err){
    console.log(err);
    return NextResponse.json({message:'Internal Server Error', error:err}, {status:500});
  }
  }