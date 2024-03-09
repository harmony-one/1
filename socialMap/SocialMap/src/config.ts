import Config from 'react-native-config';

export default {
  openai_url: Config.OPENAI_URL ?? '', //
  googleMap_api_key: Config.GOOGLE_MAPS_API_KEY ?? 'N/A',
};
