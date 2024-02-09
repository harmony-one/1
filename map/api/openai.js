import * as FileSystem from 'expo-file-system'
import axios from 'axios' 

export async function speechToText (filePath) {
  const filename = filePath.split('recordings/')[1]
  const formData = new FormData();
    formData.append('data', {
      uri: filePath,
      name: filename,
      type: 'audio/wav',
    });
  let config = {
    method: "post",
    maxBodyLength: Infinity,
    url: "https://harmony-llm-api.fly.dev/openai/upload-audio",
    headers: {
      "Content-Type": "audio/wav"
    },
    data: formData,
  };
  const response = await axios.request(config)
  console.log(response.data)
  return response.data
}