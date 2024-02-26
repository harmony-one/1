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
  Image,
  Animated

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
import { launchCamera } from 'react-native-image-picker';
import RNFS from 'react-native-fs';


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
  const opacity = useRef(new Animated.Value(1)).current; // For opacity animation
  const carouselRef = useRef(null);

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
    const updatedCount = markers.length;
    const latestData = markers[updatedCount - 1];
  
    console.log("Updated markers count:", updatedCount);
    console.log("Latest marker data:", latestData);
    // Perform actions with the updated count and latest data here
  
  }, [markers]); // This

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

  // Animation for blinking effect
  useEffect(() => {
    const blinkAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 0,
          duration: 1000, // Adjust the speed of blinking
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );

    if (isRecording) {
      blinkAnimation.start(); // Start blinking when recording
    } else {
      blinkAnimation.stop(); // Stop blinking when not recording
      opacity.setValue(1); // Reset opacity to show button normally
    }

    return () => blinkAnimation.stop(); // Cleanup by stopping the animation
  }, [isRecording]);


  const getMarkerAddress = async (latitude, longitude) => {
    const apiKey = 'YOUR_API_KEY_HERE'; // 'YOUR_API_KEY_HERE'; // Replace this with your actual API key
    const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${apiKey}`;

    try {
      const response = await fetch(url);
      const json = await response.json();

      if (json.status === 'OK') {
        // Extract the full address from the first result
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

    try {
      console.log(audioPath);
      const result = await speechToText(audioPath); // Assuming this function exists and works as expected
      if (result) {
        console.log('Transcription result:', result);
        // Toast.show({
        //   type: 'success',
        //   text1: result,
        // });

        Geolocation.getCurrentPosition(
          async (position) => { // Corrected syntax for async callback
            console.log('Current position:', position);
            const { latitude, longitude } = position.coords;
            const newRegion = {
              latitude,
              longitude,
              latitudeDelta: 0.01, // Optionally adjust the latitudeDelta and longitudeDelta
              longitudeDelta: 0.01,
            };

            const address = await getMarkerAddress(latitude, longitude); // Make sure this function is correctly defined
            if (address) {
              console.log('Current address:', address);
              const newMarker = {
                id: uuid.v4(), // Ensure uuid.v4() is correctly imported and used
                name: 'New Marker', // Changed from uuid to a descriptive name
                longitude: longitude,
                latitude: latitude,
                address: address.split(',')[0],
                checked: true,
                counter: 1,
                memoTranscription: result
              }

              setMarkers(prevMarkers => [...prevMarkers, newMarker]);
              mapRef.current.animateToRegion(newRegion, 1000); // Added duration for animation
              setTimeout(() => {
                carouselRef.current?.scrollTo({ index: markers.length, animated: true })
              }, 1000); // Adjust the delay as needed
            }
          },
          error => {
            console.error('Error getting current position:', error);
            Alert.alert('Error', 'Unable to fetch current location.');
          },
          { enableHighAccuracy: true },
        );
      } else {
        Toast.show({
          type: 'error',
          text1: 'The voice memo could not be processed.',
        });
      }
    } catch (error) {
      console.error('Error processing audio:', error);
      Toast.show({
        type: 'error',
        text1: 'Error processing audio.',
      });
    }
  };

  // Handle recording stop and playback
  const stopRecordingAndPlayBackEventPopup = async id => {
    if (!isRecording) return;
    await AudioRecorder.stopRecording();
    setIsRecording(false);
    // Playback the recording
    try {
      console.log(audioPath);
      const result = await speechToText(audioPath);
      if (result) {
        console.log('Transcription result:', result);
        const updatedMarkers = markers.map(marker =>
          marker.id === id
            ? {
              ...marker,
              memoTranscription: marker.memoTranscription
                ? `${marker.memoTranscription}\n${result}`
                : result,
            }
            : marker,
        );
        setMarkers(updatedMarkers);
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

  // Handle recording start
  const startRecordingEventPopup = async marker => {
    if (!hasPermission) {
      console.warn("Can't record, no permission granted!");
      return;
    }
    setIsRecording(true);
    if (hasTranscription(markers)) {
      const audio =
        AudioUtils.DocumentDirectoryPath + `/voiceMemo_${Date.now()}.mp4`;
      setAudioPath(audio);
      AudioRecorder.prepareRecordingAtPath(audio, {
        SampleRate: 22050,
        Channels: 1,
        AudioQuality: 'High',
        AudioEncoding: 'aac',
      });
    }
    await AudioRecorder.startRecording();
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

  const openCameraAndSaveImage = id => {
    const options = {
      saveToPhotos: true,
      mediaType: 'photo',
    };
    console.log('open Camera And SaveImage called');
    launchCamera(options, async (response) => {
      if (response.didCancel) {
        console.log('User cancelled image capture');
      } else if (response.error) {
        console.log('ImagePicker Error: ', response.error);
      } else if (response.customButton) {
        console.log('User tapped custom button: ', response.customButton);
      } else {
        const source = { uri: response.assets[0].uri };
        console.log('Image captured:', source.uri);

        // Save the image to the app's document directory
        const timestamp = Date.now(); // Use a timestamp to ensure uniqueness
        const newImageName = `image_${timestamp}.jpg`; // Generate a unique file name
        const newImagePath = `${RNFS.DocumentDirectoryPath}/${newImageName}`;
        try {
          await RNFS.copyFile(source.uri, newImagePath);
          console.log('Image saved to:', newImagePath);
          // Here you can update your state or UI with the new image path
          const updatedMarkers = markers.map(marker =>
            marker.id === id
              ? {
                ...marker,
                image: marker.image // Ensure the property name's case matches
                  ? `${marker.image}\n${newImagePath}`
                  : newImagePath,
              }
              : marker,
          );
          setMarkers(updatedMarkers);

        } catch (error) {
          console.error('Error saving image:', error);
        }
      }
    });
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
      <View style={styles.mapContainer}>
        {!showPosts ? (
          <>
            <MapView
              ref={mapRef}
              style={styles.map}
              initialRegion={{
                latitude: 39.739235,
                longitude: -104.99025,
                latitudeDelta: 40,
                longitudeDelta: 40,
              }}>
              {markers.length > 0 &&
                markers.map((marker, index) => (
                  <Marker
                    key={index}
                    identifier={marker.id}
                    coordinate={{
                      latitude: marker.latitude,
                      longitude: marker.longitude,
                    }}
                    title={marker.name}
                    description={marker.address}>
                    <Callout onPress={() => handlePress(marker)}>
                      <View style={styles.calloutView}>
                        <TouchableOpacity onPress={() => openInAppBrowser(`https://www.j.country/tag/${sanitizeURL(marker.name)}`)}>
                          <Text style={styles.calloutTitle}>{marker.name}</Text>
                        </TouchableOpacity>
                        <Text style={styles.calloutDescription}>{marker.address.split(',')[0]}</Text>
                        <View style={styles.buttonContainer}>
                          {/* <CheckInButton
                            isChecked={!!checkedIn[marker.id]}
                            onPress={() => {
                              toggleCheckIn(marker.id);
                              handleCheckIn(marker);
                            }}
                          /> */}
                          <TouchableOpacity
                            style={{ flexDirection: 'row', alignItems: 'center' }}
                            onPress={() => {
                              if (isRecording) {
                                stopRecordingAndPlayBackEventPopup(marker.id);
                              } else {
                                startRecordingEventPopup(marker);
                              }
                            }}>
                            <Animated.View style={{ opacity }}>
                              <Icon name={isRecording ? "mic" : "mic-none"} size={30} color={isRecording ? "red" : "#00ace8"} />
                            </Animated.View>
                          </TouchableOpacity>
                        </View>
                      </View>
                    </Callout>
                  </Marker>
                ))}
            </MapView>
            <View style={styles.overlayButtons}>
              <View style={styles.actionButton}>
                <TouchableOpacity onPress={getCurrentLocation}>
                  <Icon name="near-me" size={25} color="#00ace8" />
                </TouchableOpacity>
              </View>
              {/* <View style={styles.actionButton}>
                <TouchableOpacity onPress={actionSheet}>
                  <Icon name="menu" size={25} color="#00ace8" />
                </TouchableOpacity>
              </View> */}
              <View style={styles.micButton}>
                <TouchableOpacity onPress={() => {
                  if (isRecording) {
                    stopRecordingAndPlayBack();
                  } else {
                    startRecording();
                  }
                }}>
                   <Animated.View style={{ opacity }}>
                  <Icon name={isRecording ? "mic" : "mic-none"} size={25} color={isRecording ? "red" : "#00ace8"} />
                  </Animated.View>
                </TouchableOpacity>
              </View>
            </View>
          </>
        ) : (
          <View>
            {/* place PostsComponent */}
            <Text size={'44px'}>Showing Posts</Text>
          </View>
        )}
      </View>

      <View style={styles.containerActionBottom}>
        <Carousel
          //loop
          ref={carouselRef}
          key={markers.length}
          width={windowWidth - 10} // Use the width of the window/device
          height={100} // Fixed height for each item
          data={markers}
          layout={'default'} // Use 'default' or other layouts as needed
          autoPlayInterval={1}
          onSnapToItem={index => {
            console.log("New Index:", index); //r Debugging log
            setCurrentIndex(index);

            const newRegion = {
              latitude: markers[index].latitude,
              longitude: markers[index].longitude,
              latitudeDelta: 0.01,
              longitudeDelta: 0.01,
            };
            mapRef.current.animateToRegion(newRegion);
          }}
          renderItem={({ item, index }) => (

            <View style={styles.carouselItemContainer}>
              <View style={styles.imageActionContainer}>
                {/* Adjust the TouchableOpacity to call the function correctly */}
                <TouchableOpacity onPress={() => openCameraAndSaveImage(item.id)}>
                  <Image
                    source={item.image ? { uri: item.image } : require('../assets/placeholder.png')}
                    style={[styles.imageAction, { borderRadius: 15 }]}
                  />
                </TouchableOpacity>
              </View>
              <View style={styles.contentAction}>
                <Text style={styles.textAction}>{item.memoTranscription || 'No memo transcription available'}</Text>
                <Text style={styles.textActionAddress}>{item.address || 'No address available'}</Text>
              </View>
            </View>
          )}

        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1, // Use flex to fill the entire screen
    // backgroundColor: '#404040',
  },
  mapContainer: {
    flex: 1, // This will make the map container take up all available space except for what the containerActionBottom uses
  },
  map: {
    ...StyleSheet.absoluteFillObject, // This will make the map fill the mapContainer
  },

  carouselItemContainer: {
    flexDirection: 'row', // Align items horizontally
    alignItems: 'center', // Center items vertically in the container
    justifyContent: 'space-between', // Space between the image and text content
    width: windowWidth, // Match the width of the carousel
    paddingHorizontal: 10, // Add some horizontal padding
    height: 100
  },


  overlayButtons: {
    position: 'absolute', // Position buttons over the map
    bottom: 10, // Adjust based on your layout
    right: 10,
    alignItems: 'flex-end',
  },
  containerActionBottom: {
    flexDirection: 'row',
    padding: 10,
    backgroundColor: '#404040',
    // borderTopLeftRadius: 10,
    // borderTopRightRadius: 10,
    // overflow: Platform.select({ android: 'hidden', ios: 'visible' }), // Example usage
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
    //  backgroundColor: '#404040',
    borderTopLeftRadius: 10, // Adjust the radius as needed
    borderTopRightRadius: 10,
  },
  contentAction: {
    flexGrow: 6,
    flexDirection: 'column',
    color: 'white', // Ensure this contrasts with the background
    marginBottom: 8,
    marginLeft: 10,
    height: 100,
    width: 100
  },
  textAction: {
    flexGrow: 1,
    fontSize: 12,
    paddingTop: 5,
    paddingRight: 15,
    paddingBottom: 5,
    // Top: 5,
    // paddingLeft: 5,x
    textAlignVertical: 'center',
    textAlign: 'left',
    // marginBottom: 8, // Adjust based on your spacing needs
    // marginLeft: 10, // Adjust the spacing between the text and the imag
    color: 'white',
    // width: 100
  },
  textActionAddress: {
    // bottom: 3,
    paddingRight: 25,
    flexGrow: 0,
    textAlign: 'right',
    textAlignVertical: 'bottom',
    fontSize: 12,
    marginBottom: 8, // Adjust based on your spacing needs
    marginLeft: 10, // Adjust the spacing between the text and the imag
    color: 'white',
  },
  imageActionContainer: {
    flexGrow: 0,
  },

  imageAction: {
    maxWidth: 95,
    maxHeight: 95,
    width: 100, // Adjust based on your image size
    height: 100, // Adjust based on your image size
  },
  number: {
    color: 'white',
    fontSize: 20,
  },
  calloutView: {
    padding: 8,
    width: 250,
    height: 'auto',
    borderRadius: 6,
  },
  calloutTitle: {
    fontWeight: 'bold',
    fontSize: 22,
    marginBottom: 5,
  },
  calloutDescription: {
    fontSize: 16,
    marginBottom: 10,
  },
  buttonContainer: {
    //  flexDirection: 'row',
    //  justifyContent: 'space-between',
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
