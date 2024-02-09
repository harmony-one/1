import axios from 'axios';
import config from '../config';

export async function speechToText(filePath: string): Promise<string> {
  // const filename = filePath.split('recordings/')[1];
  const formData = new FormData();
  formData.append('data', {
    uri: filePath,
    type: 'audio/mp4', // Adjust based on your audio file's format, e.g., 'audio/wav' for WAV files
    name: 'openai.mp3', // The file name doesn't impact the API request but is required for FormData
  });
  console.log('HELLO +++++', formData);
  const request = {
    method: 'post',
    maxBodyLength: Infinity,
    url: config.openai_url,
    headers: {
      'Content-Type': 'audio/wav',
    },
    data: formData,
  };
  const response = await axios.request(request);
  // console.log(response);
  return response.data;
}
