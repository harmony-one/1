import axios from 'axios';
import config from '../config';

export async function speechToText(filePath: string): Promise<string> {
  const filename = filePath.split('recordings/')[1];
  const formData = new FormData();
  formData.append('data', {
    uri: filePath,
    name: filename,
    type: 'audio/wav',
  });
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
  return response.data;
}
