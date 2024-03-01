
import config from '../config';

export const getMarkerAddress = async (latitude: number, longitude: number): Promise<string | null> => {
  const apiKey = config.googleMap_api_key;
  console.log('apiKey:', apiKey);

  const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${apiKey}`;

  try {
    const response = await fetch(url);
    const json = await response.json();

    if (json.status === 'OK') {
      const address = json.results[0]?.formatted_address;
      return address;
    } else {
      console.log('Geocoding API error:', json.status);
      return null;
    }
  } catch (error) {
    console.error('Failed to fetch address:', error);
    return null;
  }
};
