import axios from 'axios';
export default async function getTranscript(videoUrl, Transcript_api_key) {
    try{
        const options = {
            method: 'GET',
            url: 'https://youtube-transcripts.p.rapidapi.com/youtube/transcript',
            params: {
              url: videoUrl,
              chunkSize: '500'
            },
            headers: {
              'x-rapidapi-key': Transcript_api_key,
              'x-rapidapi-host': 'youtube-transcripts.p.rapidapi.com'
            }
          };
          const response = await axios.request(options);
          // console.log(response.data.content);
          return response.data.content;
    }
    catch(err){
        console.error(err);
        return '';
    }
}

// import axios from 'axios';

// const options = {
//   method: 'GET',
//   url: 'https://youtube-transcripts.p.rapidapi.com/youtube/transcript',
//   params: {
//     url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
//     videoId: 'dQw4w9WgXcQ',
//     chunkSize: '500'
//   },
//   headers: {
//     'x-rapidapi-key': '602005c5a1msh37392ce6489a5d3p1264e8jsna4cbaf21730b',
//     'x-rapidapi-host': 'youtube-transcripts.p.rapidapi.com'
//   }
// };

// try {
// 	const response = await axios.request(options);
// 	console.log(response.data);
// } catch (error) {
// 	console.error(error);
// }