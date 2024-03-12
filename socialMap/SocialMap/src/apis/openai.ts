import axios from 'axios';
import config from '../config';


let cancelSpeechToText; // This will hold the cancel function

export const speechToText = async (filePath) => {
  const CancelToken = axios.CancelToken;
  const source = CancelToken.source();

  // Assign the cancel function to a broader scoped variable
  cancelSpeechToText = () => source.cancel('Operation canceled by the user.');

  if (!filePath) {
    throw new Error('File path is required');
  }

  const formData = new FormData();
  formData.append('data', {
    uri: filePath,
    type: 'audio/wav',
    name: `/voiceMemo_${Date.now()}.mp3`,
  });

  const request = {
    method: 'post',
    url: config.openai_url,
    headers: { 'Content-Type': 'multipart/form-data' },
    data: formData,
    cancelToken: source.token,
  };

  try {
    const response = await axios(request);
    if (response.status === 200) {
      return response.data; // Assuming the API returns the transcribed text
    } else {
      throw new Error(`Unexpected response status: ${response.status}`);
    }
  } catch (error) {
    if (axios.isCancel(error)) {
      console.log('Request canceled', error.message);
    } else {
      console.error('Error processing speech to text:', error);
    }
    throw error;
  }
};

export const cancelCurrentSpeechToTextOperation = () => {
  if (cancelSpeechToText) {
    cancelSpeechToText();
    console.log("Speech to text operation canceled.");
  }
};


// export async function speechToText(blob: Blob): Promise<string> {
//   try {
//     const filename = `/voiceMemo_${Date.now()}.mp3`;
//     const formData = new FormData();
//     formData.append('data', {
//       blob,
//       filename,
//     });
//     const request = {
//       method: 'post',
//       maxBodyLength: Infinity,
//       url: config.openai_url,
//       headers: {
//         'Content-Type': 'audio/wav',
//       },
//       data: formData,
//     };
//     const response = await axios.request(request);
//     if (response.status === 200) {
//       return response.data; // Return the text extracted from speech
//     } else {
//       throw new Error(`Unexpected response status: ${response.status}`);
//     }
//   } catch (error) {
//     // Handle errors
//     console.error('Error processing speech to text:', error);
//     return ''; // Return empty string if there's an error
//   }
// }
