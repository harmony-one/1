import axios from 'axios';
import markers from '../assets/locations/tf.json';

export interface MapMarker {
  id: number;
  name: string;
  longitude: number;
  latitude: number;
  address: string;
  checked?: boolean;
  counter?: number;
  memoTranscription?: string;
}
export async function getMapMarkers(
  mapType = 'tf',
): Promise<MapMarker[] | undefined> {
  try {
    switch (mapType) {
      case 'tf':
      case 'rh':
      case 'af':
        const response = await axios.get(
          `https://raw.githubusercontent.com/harmony-one/1/main/${mapType}/map.json`,
        );
        if (response) {
          const markersList = response.data as MapMarker[];
          return markersList.map(m => ({
            ...m,
            checked: false,
            counter: 0,
            memoTranscription: '',
          }));
        } else {
          return markers;
        }
      // return response.data;
      default:
        const markersList = markers as MapMarker[];
        return markersList.map(m => ({
          ...m,
          checked: false,
          counter: 0,
          memoTranscription: '',
        }));
    }
  } catch (error) {
    console.error('Error fetching data:', error);
  }
}

export const hasTranscription = (markerList: MapMarker[]): boolean => {
  return !!markerList.find(marker => marker.memoTranscription !== '');
};
