// MapViewComponent.jsx
import React, { useEffect, useRef, useState } from 'react';
import { View, Text, Button, StyleSheet, Dimensions, Platform, TouchableOpacity, Alert, CheckmarkBox } from 'react-native';
import MapView, { Marker, Callout } from 'react-native-maps';
import { AudioRecorder, AudioUtils } from 'react-native-audio';
import Sound from 'react-native-sound';
import Clipboard from '@react-native-clipboard/clipboard';
import { getMapMarkers } from '../apis/markers';
import { speechToText } from '../apis/openai';
import Toast from 'react-native-toast-message';
import Geolocation from '@react-native-community/geolocation';
import Icon from 'react-native-vector-icons/MaterialIcons';


const windowWidth = Dimensions.get('window').width;
const windowHeight = Dimensions.get('window').height;

const MapViewComponent = () => {
  // State for managing recording
  const [markers, setMarkers] = useState([])
  const [isRecording, setIsRecording] = useState(false);
  const [hasPermission, setHasPermission] = useState(false);
  const mapRef = useRef(null);
  const [checkedIn, setCheckedIn] = useState({});
  const [items, setItems] = useState([]);
  const [recordings, setRecordings] = useState([]);
  const [audioPath, setAudioPath] = useState(AudioUtils.DocumentDirectoryPath + `/voiceMemo_${Date.now()}.mp4`);
  
  // Function to add data to the array
  const addItem = (id, text) => {
    const newItem = { id, text };
    setItems(currentItems => [...currentItems, newItem]);
  };

  const copyToClipboard = (text) => {
    Clipboard.setString(text);
    Toast.show({
      type: 'success',
      text1: 'Copied address',
    });
  };
  

  useEffect(() => {
    const getMarkers = async () => {
      const markers = await getMapMarkers()
      setMarkers(markers)
    }
    getMarkers()
  }, [])

  useEffect(() => {
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
  }, [])

  useEffect(() => {
    if (mapRef.current) {
      mapRef.current.fitToSuppliedMarkers(markers.map(marker => marker.id), {
        edgePadding: { top: 50, right: 50, bottom: 50, left: 50 },
        animated: true,
      });
    }
  }, [markers]);

  // Handle recording start
  const startRecording = async () => {
    if (!hasPermission) {
      console.warn("Can't record, no permission granted!");
      return;
    }
    setIsRecording(true);
    if (recordings.length > 0) {
      const audio = AudioUtils.DocumentDirectoryPath + `/voiceMemo_${Date.now()}.mp4`
      setAudioPath(audio)
      AudioRecorder.prepareRecordingAtPath(audio, {
        SampleRate: 22050,
        Channels: 1,
        AudioQuality: 'High',
        AudioEncoding: 'aac',
      });
    }
    await AudioRecorder.startRecording();
  };

  // Handle recording stop and playback
  const stopRecordingAndPlayBack = async (id) => {
    if (!isRecording) return;
    await AudioRecorder.stopRecording();
    setIsRecording(false);
    // Playback the recording
    try {
      console.log(audioPath)
      const result = await speechToText(audioPath);
      if (result) {
        console.log('Transcription result:', result);
        Toast.show({
          type: 'success',
          text1: result,
        });
        addItem(id, result);
        setRecordings(prevRecordings => [...prevRecordings, audioPath]);
        // setAudioPath(AudioUtils.DocumentDirectoryPath + `/voiceMemo_${Date.now()}.mp4`)
        console.log('Current data store in array', items);
      } else {
        Toast.show({
          type: 'error',
          text1: 'The voice memo could not be processed',
        });
      }
    } catch (error) {
      console.error('Error processing audio:', error);
    }
  };

  const handlePress = (marker) => {
    console.log('Button pressed for:', marker.name);
  };

  const toggleCheckIn = (id) => {
    setCheckedIn(prev => ({
      ...prev,
      [id]: !prev[id],
    }));
  };
  
  const handleCheckIn = (marker) => {
    console.log('marker checked in', marker)
  }

  const getCurrentLocation = () => {
    console.log('Attempting to get current position...');
    Geolocation.getCurrentPosition(
      (position) => {
        console.log('Current position:', position);
        const { latitude, longitude } = position.coords;
        const newRegion = {
          latitude,
          longitude,
          latitudeDelta: 0.01, // Optionally adjust the latitudeDelta and longitudeDelta
          longitudeDelta: 0.01,
        };
        mapRef.current.animateToRegion(newRegion);
      },
      (error) => {
        console.error('Error getting current position:', error);
        Alert.alert('Error', error.message);
      },
      { enableHighAccuracy: true }
    );
  };
  

  const CheckmarkBox = ({ isChecked, onPress }) => (
    <TouchableOpacity onPress={onPress} style={styles.checkboxContainer}>
      {isChecked && <Text style={styles.checkboxCheck}>✓</Text>}
    </TouchableOpacity>
  );

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
        {markers.length > 0 && markers.map((marker, index) => (
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
              <TouchableOpacity onPress={() => copyToClipboard(marker.address)}>
                <Text style={styles.calloutTitle}>{marker.name}</Text>
              </TouchableOpacity>
                <View style={styles.buttonContainer}>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <CheckmarkBox
                      isChecked={!!checkedIn[marker]}
                      onPress={() => toggleCheckIn(marker)}
                    />
                    <Button title="Check-In" onPress={() => handleCheckIn(marker)} />
                  </View>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }} onPress={() => {
                        if (isRecording) {
                          stopRecordingAndPlayBack(marker.id);
                        } else {
                          startRecording();
                        }
                      }}>
                    <Button
                      title={isRecording ? "Stop" : "Memo"}
                      onPress={() => {
                        if (isRecording) {
                          stopRecordingAndPlayBack(marker.id);
                        } else {
                          startRecording();
                        }
                      }}
                    />
                    <Icon name="mic" size={20} color="#00ace8" />
                  </View>
                </View>
              </View>
            </Callout>
          </Marker>
        ))}

      </MapView>
      <View style={styles.locationButton}>
        <TouchableOpacity onPress={getCurrentLocation}>
         {/* // <Text style={styles.buttonText}>My Location</Text>
          <ion-icon name="locate-outline"></ion-icon> */}
          <Icon name="my-location" size={30} color="#00ace8" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: windowHeight,
    width: windowWidth,
  },
  map: {
    ...StyleSheet.absoluteFill,
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
    alignItems: 'center',
  },
  locationButton: {
    position: 'absolute', // Position the button over the map
    bottom: 25, // Distance from the bottom of the container
    right: 10, // Distance from the right of the container
    padding: 10, // Add some padding for visual appeal (optional)
    backgroundColor: 'white', // Set the background color (optional)
    borderRadius: 20, // Round the corners (optional)
  },
  checkboxContainer: {
    width: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: "#00ace8",
    marginRight: 8,
  },
  checkboxCheck: {
    fontSize: 18,
  },
});

export default MapViewComponent;
