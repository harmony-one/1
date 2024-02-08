import * as FileSystem from 'expo-file-system'
import axios from 'axios' 

export async function speechToText (filePath) {
  const blobfile = await (await fetch(filePath)).blob()
  const formData = new FormData()
  const filename = filePath.split('recordings/')[1]
  const file = new File([blobfile], filename, { lastModified: Date.now(), type: 'audio/wav' })
  formData.append('data', file)
  let config = {
    method: "post",
    maxBodyLength: Infinity,
    url: "http://localhost:8080/openai/upload-audio",
    headers: {
      "Content-Type": "audio/wav"
    },
    data: formData,
  };
  const response = await axios.request(config)
  console.log(response.data)
  return response.data
}