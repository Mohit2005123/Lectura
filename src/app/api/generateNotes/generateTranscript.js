import { YoutubeTranscript } from "youtube-transcript";
export default async function getTranscript(videoUrl){
    try{
        const transcript= await YoutubeTranscript.fetchTranscript(videoUrl)
        return transcript;
    }
    catch(err){
        console.log(err);
        return '';
    }
}