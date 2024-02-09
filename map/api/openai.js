import axios from 'axios' 
import { config } from '../config';

export async function speechToText (filePath) {
  const filename = filePath.split('recordings/')[1]
  const formData = new FormData();
    formData.append('data', {
      uri: filePath,
      name: filename,
      type: 'audio/wav',
    });
  let request = {
    method: "post",
    maxBodyLength: Infinity,
    url: config.openai_url,
    headers: {
      "Content-Type": "audio/wav"
    },
    data: formData,
  };
  console.log(request)
  const response = await axios.request(request)
  console.log(response.data)
  return response.data
}