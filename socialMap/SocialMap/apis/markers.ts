import axios from 'axios';
import markers from '../assets/locations/tf.json';
export async function getMapMarkers(mapType = 'tf') {
  try {
    switch (mapType) {
      case 'tf':
      case 'rh':
      case 'af':
        const response = await axios.get(
          `https://raw.githubusercontent.com/harmony-one/1/main/${mapType}/map.json`,
        );
        return response.data;
      default:
        return markers;
    }
  } catch (error) {
    console.error('Error fetching data:', error);
  }
}
