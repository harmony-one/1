import React, { useEffect, useRef, useState } from 'react';
import { View, Text, Button, StyleSheet, Dimensions, Platform } from 'react-native';
import MapView, { Marker, Callout } from 'react-native-maps';
import { AudioRecorder, AudioUtils } from 'react-native-audio';
import Sound from 'react-native-sound';
import markers from '../assets/locations/tf.json';
import axios from 'axios';


const windowWidth = Dimensions.get('window').width;
const windowHeight = Dimensions.get('window').height;

const MapViewComponent = () => {
  // State for managing recording
  const [isRecording, setIsRecording] = useState(false);
  const [hasPermission, setHasPermission] = useState(false);
  const audioPath = AudioUtils.DocumentDirectoryPath + '/voiceMemo.mp4';
  const mapRef = useRef(null);

  const [items, setItems] = useState([]);

  // Function to add data to the array
  const addItem = (id, text) => {
    const newItem = { id, text };
    setItems(currentItems => [...currentItems, newItem]);
  };


  useEffect(() => {
    if (mapRef.current) {
      mapRef.current.fitToSuppliedMarkers(markers.map(marker => marker.id), {
        edgePadding: { top: 50, right: 50, bottom: 50, left: 50 },
        animated: true,
      });
    }
    AudioRecorder.requestAuthorization().then((isAuthorised) => {
      setHasPermission(isAuthorised);
      if (isAuthorised) {
        AudioRecorder.prepareRecordingAtPath(audioPath, {
          SampleRate: 22050,
          Channels: 1,
          AudioQuality: 'High',
          AudioEncoding: 'aac',
        });
      }
    });
  }, []);

  // Handle recording start
  const startRecording = async () => {
    if (!hasPermission) {
      console.warn("Can't record, no permission granted!");
      return;
    }
    setIsRecording(true);
    await AudioRecorder.startRecording();
  };

   // Function to convert speech to text using OpenAI's Whisper model
async function convertSpeechToText(audioUri) {
  // Prepare the form data
  const formData = new FormData();
  formData.append('file', {
    uri: audioUri,
    type: 'audio/mp4', // Adjust based on your audio file's format, e.g., 'audio/wav' for WAV files
    name: 'openai.mp3', // The file name doesn't impact the API request but is required for FormData
  });
  formData.append('model', 'whisper-1'); // Specify the model if required by the API, adjust based on availability and requirements

  // Configure the request headers
  const headers = {
    'Authorization': 'Bearer OpenAI_API_key', // Replace with your actual OpenAI API key
    'Content-Type': 'multipart/form-data',
  };

  try {
    // Make the POST request to OpenAI's Speech API
    const response = await axios.post('https://api.openai.com/v1/audio/transcriptions', formData, { headers });
    console.log('Response from OpenAI:', response.data);
    return response.data; // Adjust based on the API's response structure
  } catch (error) {
    console.error('Error converting speech to text:', error.response || error);
    throw error;
  }
}

  // Handle recording stop and playback
  const stopRecordingAndPlayBack = async (id) => {
    if (!isRecording) return;
    await AudioRecorder.stopRecording();
    setIsRecording(false);
    // Playback the recording
    try {
      const result = await convertSpeechToText(audioPath);
      console.log('Transcription result:', result);
      addItem(id, result.text);
      console.log('Current data store in array', items);
      // Process the transcription result as needed
    } catch (error) {
      console.error('Error processing audio:', error);
    }

    const sound = new Sound(audioPath, '', (error) => {
      if (error) {
        console.log('Failed to load the sound', error);
        return;
      }
      console.log('Current audio path', audioPath);
      sound.play(() => {
        sound.release();
      });
    });
  };

  const handlePress = (marker) => {
    console.log('Button pressed for:', marker.name);
  };

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={styles.map}
        initialRegion={{
          latitude: 39.739235,
          longitude: -104.990250,
          latitudeDelta: 40,
          longitudeDelta: 40,
        }}>
        {markers.map((marker, index) => (
          <Marker
            key={index}
            identifier={marker.id} // Use identifier for fitToSuppliedMarkers
            coordinate={{ latitude: marker.latitude, longitude: marker.longitude }}
            title={marker.name}
            description={marker.address}
          >
            <View style={styles.circle}>
              {/* change "1" to reflect count for number of checkins */}
              <Text style={styles.number}>{marker.id}</Text>
            </View>
            <Callout onPress={() => handlePress(marker)}>
              <View style={styles.calloutView}>
                <Text style={styles.calloutTitle}>{marker.name}</Text>
                <Text style={styles.calloutDescription}>{marker.address}</Text>
                <View style={styles.buttonContainer}>
                  <Button title="Check-in" onPress={() => handlePress(marker)} />
                  <Button
                    title={isRecording ? "Stop Recording" : "Voice Memo"}
                    onPress={() => {
                      if (isRecording) {
                        stopRecordingAndPlayBack(marker.id);
                      } else {
                        startRecording();
                      }
                    }}
                  />
                </View>
              </View>
            </Callout>
          </Marker>
        ))}
      </MapView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: windowHeight,
    width: windowWidth,
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  circle: {
    width: 40,
    height: 40,
    borderRadius: 30,
    backgroundColor: '#00ace8',
    justifyContent: 'center',
    alignItems: 'center',
  },
  number: {
    color: 'white',
    fontSize: 20,
  },
  calloutView: {
    width: 250,
    height: 'auto',
    borderRadius: 6,
  },
  calloutTitle: {
    fontWeight: 'bold',
    fontSize: 24,
    marginBottom: 5,
  },
  calloutDescription: {
    fontSize: 18,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
});

export default MapViewComponent;
