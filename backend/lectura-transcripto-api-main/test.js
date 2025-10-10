import axios from "axios";

async function run() {
  try {
    const requestBody = {
      link:"https://www.youtube.com/watch?v=lZ3bPUKo5zc"
    };

    const response = await axios.post('http://localhost:3000/api/generate', requestBody, {
      headers: {
        'Content-Type': 'application/json'
      }
    });

    console.log('Response:', response.data);
  } catch (error) {
    console.error('Error:', error.message);
  }
}

// Call the function
run();
