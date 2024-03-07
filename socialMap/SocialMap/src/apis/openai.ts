import axios from 'axios';
import config from '../config';

export async function speechToText(filePath: string): Promise<string> {
  try {

    // Check if filePath is prorvided
    if (!filePath) {
      throw new Error('File path is required');
    }
    const formData = new FormData();
    formData.append('data', {
      uri: filePath,
      type: 'audio/mp4', // Adjust based on your audio file's format, e.g., 'audio/wav' for WAV files
      name: 'openai.mp3', // The file name doesn't impact the API request but is required for FormData
    });

    console.log('URL data', config.openai_url);
    const request = {
      method: 'post',
      maxBodyLength: Infinity,
      url: config.openai_url,
      headers: {
        'Content-Type': 'audio/wav',
      },
      data: formData,
    };
   // Send request and await response
   const response = await axios.request(request);

   // Check if response is successful
   if (response.status === 200) {
     return response.data; // Return the text extracted from speech
   } else {
     throw new Error(`Unexpected response status: ${response.status}`);
   }
 } catch (error) {
   // Handle errors
   console.error('Error processing speech to text:', error);
   return ''; // Return empty string if there's an error
 }
}

