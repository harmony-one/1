import Config from 'react-native-config';

export default {
  openai_url: 'http://127.0.0.1:5000/openai/upload-audio', // Config.OPENAI_URL ?? '',
  googleMap_api_key: Config.GOOGLE_MAPS_API_KEY ?? 'N/A',
};
