// MapViewComponent.jsx
import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  Button,
  StyleSheet,
  Dimensions,
  Platform,
  TouchableOpacity,
  Alert,
  CheckmarkBox,
  GestureResponderHandlers,
  Image

} from 'react-native';
import MapView, { Marker, Callout } from 'react-native-maps';
import { AudioRecorder, AudioUtils } from 'react-native-audio';
import { getMapMarkers, hasTranscription } from '../apis/markers';
import { speechToText } from '../apis/openai';
import Toast from 'react-native-toast-message';
import Geolocation from '@react-native-community/geolocation';
import Icon from 'react-native-vector-icons/MaterialIcons';
import openInAppBrowser from '../components/BrowserView';
import ActionSheet from 'react-native-actions-sheet';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import firestore from '@react-native-firebase/firestore';
import CheckInButton from '../components/CheckInButton';
import Carousel from 'react-native-reanimated-carousel';
import uuid from 'react-native-uuid';

const windowWidth = Dimensions.get('window').width;
const windowHeight = Dimensions.get('window').height;

const MapViewComponent = () => {
  // State for managing recording
  const [markers, setMarkers] = useState([]);
  const [isRecording, setIsRecording] = useState(false);
  const [hasPermission, setHasPermission] = useState(false);
  const [checkedIn, setCheckedIn] = useState({});
  const [markerCounts, setMarkerCounts] = useState({});
  const [showPosts, setShowPosts] = useState(false)
  const [audioPath, setAudioPath] = useState(
    AudioUtils.DocumentDirectoryPath + `/voiceMemo_${Date.now()}.mp4`,
  );
  const mapRef = useRef(null);
  const actionSheetRef = useRef(null);
  const actionSheetContainerRef = useRef(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const getMarkers = async () => {
      const markers = await getMapMarkers();
      setMarkers(markers);
    };
    getMarkers();
  }, []);

  useEffect(() => {
    AudioRecorder.requestAuthorization().then(isAuthorised => {
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

  useEffect(() => {
    if (mapRef.current) {
      mapRef.current.fitToSuppliedMarkers(
        markers.map(marker => marker.id),
        {
          edgePadding: { top: 50, right: 50, bottom: 50, left: 50 },
          animated: true,
        },
      );
    }
  }, [markers]);

  useEffect(() => {
    const fetchCounts = async () => {
      if (markers.length === 0) {
        return;
      }

      const countsMap = {};
      const fetchPromises = markers.map((marker) => {
        const documentId = `${marker.longitude}${marker.latitude}`;
        return firestore()
          .collection('checkins')
          .doc(documentId)
          .get()
          .then((docSnapshot) => {
            if (docSnapshot.exists) {
              countsMap[documentId] = docSnapshot.data().count;
            }
          })
          .catch((error) => {
            console.error(`Error fetching count for marker ${documentId}:`, error);
          });
      });

      await Promise.all(fetchPromises);
      setMarkerCounts(countsMap);
    };

    fetchCounts();
  }, [markers]);

  // Handle recording start
  const startRecording = async () => {
    if (!hasPermission) {
      console.warn("Can't record, no permission granted!");
      return;
    }
    setIsRecording(true);
      const audio =
        AudioUtils.DocumentDirectoryPath + `/voiceMemo_${Date.now()}.mp4`;
      setAudioPath(audio);
      AudioRecorder.prepareRecordingAtPath(audio, {
        SampleRate: 22050,
        Channels: 1,
        AudioQuality: 'High',
        AudioEncoding: 'aac',
      });
    await AudioRecorder.startRecording();
  };

  // Handle recording stop and playback
  const stopRecordingAndPlayBack = async () => {
    if (!isRecording) return;
    await AudioRecorder.stopRecording();
    setIsRecording(false);
    // Playback the recording
    try {
      console.log(audioPath);
      const result = await speechToText(audioPath);
      if (result) {
        console.log('Transcription result:', result);
        Toast.show({
          type: 'success',
          text1: result,
        });

        Geolocation.getCurrentPosition(
          position => {
            console.log('Current position:', position);
            const { latitude, longitude } = position.coords;
            const newRegion = {
              latitude,
              longitude,
              latitudeDelta: 0.01, // Optionally adjust the latitudeDelta and longitudeDelta
              longitudeDelta: 0.01,
            };

            const newMarker = {
              id: uuid.v4(),
              name: uuid.v4(),
              longitude: longitude,
              latitude: latitude,
              address: 'N/A',
              checked: true,
              counter: 1,
              memoTranscription: result
            }
        
            setMarkers(prevMarkers => [...prevMarkers, newMarker]);
            mapRef.current.animateToRegion(newRegion);
          },
          error => {
            console.error('Error getting current position:', error);
            Alert.alert('Error', error.message);
          },
          { enableHighAccuracy: true },
        );
         
       
        // const updatedMarkers = markers.map(marker =>
        //   marker.id === id
        //     ? {
        //       ...marker,
        //       memoTranscription: marker.memoTranscription
        //         ? `${marker.memoTranscription}\n${result}`
        //         : result,
        //     }
        //     : marker,
        // );
        // setMarkers(updatedMarkers);

        console.log('Current data store in array', markers);
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

  const handlePress = marker => {
    console.log('Button pressed for:', marker.name);

    const newRegion = {
      latitude: marker.latitude,
      longitude: marker.longitude,
      latitudeDelta: 0.01,
      longitudeDelta: 0.01,
    };
    mapRef.current.animateToRegion(newRegion, 1000); // Added duration for the animation
  };

  const toggleCheckIn = (markerId) => {
    setCheckedIn(prevCheckedIn => ({
      ...prevCheckedIn,
      [markerId]: !prevCheckedIn[markerId],
    }));
  };

  const handleCheckIn = async (marker) => {
    const documentId = `${marker.longitude}${marker.latitude}`;
    const currentlyCheckedIn = !!checkedIn[marker.id];
    const incrementValue = currentlyCheckedIn ? -1 : 1;
    const docRef = firestore().collection('checkins').doc(documentId);

    try {
      await docRef.update({
        count: firestore.FieldValue.increment(incrementValue)
      });

      setCheckedIn(prevCheckedIn => ({
        ...prevCheckedIn,
        [marker.id]: !currentlyCheckedIn,
      }));

      const doc = await docRef.get();
      if (doc.exists) {
        setMarkerCounts(prevCounts => ({
          ...prevCounts,
          [documentId]: doc.data().count,
        }));
      }
    } catch (error) {
      console.error("Error updating check-in status:", error);
    }
  };

  const getCurrentLocation = () => {
    console.log('Attempting to get current position...');
    Geolocation.getCurrentPosition(
      position => {
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
      error => {
        console.error('Error getting current position:', error);
        Alert.alert('Error', error.message);
      },
      { enableHighAccuracy: true },
    );
  };

  const actionSheet = () => {
    console.log('Action Sheet');
    // actionSheetRef.current?.show();

    actionSheetContainerRef.current?.show();
  };

  const CheckmarkBox = ({ isChecked, onPress }) => (
    <TouchableOpacity onPress={onPress} style={styles.checkboxContainer}>
      {isChecked && <Text style={styles.checkboxCheck}>✓</Text>}
    </TouchableOpacity>
  );

  function sanitizeURL(str) {
    return str.replace(/[^a-zA-Z0-9\-_\.!~*'()]/g, '');
  }
  return (
    <View style={styles.container}>
      {!showPosts ? (<MapView
        ref={mapRef}
        style={styles.map}
        initialRegion={{
          latitude: 39.739235,
          longitude: -104.99025,
          latitudeDelta: 40,
          longitudeDelta: 40,
        }}>
        {markers.length > 0 && markers.map((marker, index) => {
          const documentId = `${marker.longitude}${marker.latitude}`;
          const count = markerCounts[documentId];

          return (
            <Marker
              key={index}
              identifier={marker.id}
              coordinate={{
                latitude: marker.latitude,
                longitude: marker.longitude,
              }}
              title={marker.name}
              description={marker.address}>
              {/* <View style={styles.circle}>
                <Text style={styles.number}>{count !== undefined ? count : '...'}</Text>
            </View> */}
              <Callout onPress={() => handlePress(marker)}>
                <View style={styles.calloutView}>
                  <TouchableOpacity onPress={() => openInAppBrowser(`https://www.j.country/tag/${sanitizeURL(marker.name)}`)}>
                    <Text style={styles.calloutTitle}>{marker.name}</Text>
                  </TouchableOpacity>
                  <Text style={styles.calloutDescription}>{marker.address}</Text>
                  <View style={styles.buttonContainer}>
                    <CheckInButton
                      isChecked={!!checkedIn[marker.id]}
                      onPress={() => {
                        toggleCheckIn(marker.id);
                        handleCheckIn(marker);
                      }}
                    />
                    {/* Recording Button */}
                    {/* <TouchableOpacity
                      style={{ flexDirection: 'row', alignItems: 'center' }}
                      onPress={() => {
                        if (isRecording) {
                          stopRecordingAndPlayBack(marker.id);
                        } else {
                          startRecording(marker);
                        }
                      }}>
                      <Icon name={isRecording ? "mic" : "mic-none"} size={30} color={isRecording ? "red" : "#00ace8"} />
                    </TouchableOpacity> */}
                  </View>
                </View>
              </Callout>
            </Marker>
          );
        })}

      </MapView>) : (
        <View >
          {/* place PostsComponent */}
          <Text size={'44px'}>Showing Posts</Text>
        </View>
      )}
      <View style={styles.locationButton}>
        <TouchableOpacity onPress={getCurrentLocation}>
          <Icon name="near-me" size={25} color="#00ace8" />
        </TouchableOpacity>
      </View>
      <View style={styles.actionButton}>
        <TouchableOpacity onPress={actionSheet}>
          <Icon name="menu" size={25} color="#00ace8" />
        </TouchableOpacity>
      </View>
      <View style={styles.micButton}>
        <TouchableOpacity onPress={() => {
         
          if (isRecording) {
            stopRecordingAndPlayBack();
          } else {
            startRecording();
          }
        }}>
          <Icon name={isRecording ? "mic" : "mic-none"} size={25} color={isRecording ? "red" : "#00ace8"} />
        </TouchableOpacity>
      </View>
      <ActionSheet ref={actionSheetRef}>
        <View>
          {markers.map((marker, index) => (
            <TouchableOpacity key={index} onPress={() => handlePress(marker)} style={{ padding: 20 }}>
              <Text>{marker.name || 'Default Address'}</Text>
            </TouchableOpacity>

          ))}
        </View>
      </ActionSheet>

      <ActionSheet style={styles.containerAction} ref={actionSheetContainerRef}>
        <View style={styles.containerAction}>
          <Carousel
            //loop
            width={100} // Fixed width
            height={100} // Fixed height
            data={markers}
            layout={'stack-horizontal-right'}
            onSnapToItem={index => setCurrentIndex(index)}
            renderItem={({ item }) => (
              <Image source={require('../assets/photo.png')} style={styles.imageAction} />
            )}
          />
          <View style={styles.contentAction}>
            <Text style={styles.textAction}>{markers[currentIndex]?.memoTranscription}</Text>
            <Text style={styles.textAction}>{markers[currentIndex]?.latitude}</Text>
          </View>
        </View>
      </ActionSheet>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: windowHeight,
    width: windowWidth,
    backgroundColor: '#404040',
  },
  map: {
    ...StyleSheet.absoluteFill,
    backgroundColor: '#404040',

  },
  // circle: {
  //   width: 40,
  //   height: 40,
  //   borderRadius: 30,
  //   backgroundColor: '#00ace8',
  //   justifyContent: 'center',
  //   alignItems: 'center',
  // },
  containerAction: {
    flexDirection: 'row',
    padding: 10,
    alignItems: 'center',
    backgroundColor: '#404040',
    borderTopLeftRadius: 20, // Adjust the radius as needed
    borderTopRightRadius: 20,
  },
  contentAction: {
    flex: 1,
  },
  textAction: {
    fontSize: 12,
    marginBottom: 8, // Adjust based on your spacing needs
    marginLeft: 10, // Adjust the spacing between the text and the imag
    color: 'white',

  },
  imageAction: {
    width: 100, // Adjust based on your image size
    height: 100, // Adjust based on your image size
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
    bottom: 135, // Distance from the bottom of the container
    right: 10, // Distance from the right of the container
    padding: 10, // Add some padding for visual appeal (optional)
    backgroundColor: 'white', // Set the background color (optional)
    borderRadius: 20, // Round the corners (optional)
  },
  actionButton: {
    position: 'absolute', // Position the button over the map
    bottom: 80, // Distance from the bottom of the container
    right: 10, // Distance from the right of the container
    padding: 10, // Add some padding for visual appeal (optional)
    backgroundColor: 'white', // Set the background color (optional)
    borderRadius: 20, // Round the corners (optional)
  },
  micButton: {
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
    borderColor: '#00ace8',
    marginRight: 8,
  },
  checkboxCheck: {
    fontSize: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },

});

export default MapViewComponent;
