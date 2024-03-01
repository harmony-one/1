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
import config from '../config';
import { useUserContext } from '../context/UserContext';
import LinearGradient from 'react-native-linear-gradient';
import MapMarker from '../components/map-marker/MapMarkerComponent';
import { styles } from './MapView.styles';
import { getMarkerAddress } from '../apis/geocoding';

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
  const carouselRefImages = useRef(null);
  const { wallet, getAddressShort } = useUserContext()
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
                //    id: uuid.v4(), // Ensure uuid.v4() is correctly imported and used
                id: markers.length + 1,
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

  const synchronizeMapAndCarousel = (index, carouselRef) => {
    if (index < 0 || index >= markers.length) {
      console.warn('Index out of bounds. Cannot synchronize map and carousel.');
      return;
    }

    // Define the new region for the map based on the marker's location
    const newRegion = {
      latitude: markers[index].latitude,
      longitude: markers[index].longitude,
      latitudeDelta: 0.01,
      longitudeDelta: 0.01,
    };

    // Animate the map to the new region
    mapRef.current.animateToRegion(newRegion);

    // Scroll the carousel to the new index, using the passed carousel reference
    carouselRef.current?.scrollTo({ index: index, animated: true });

  };

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
                  <MapMarker
                    key={index}
                    marker={marker}
                    isRecording={isRecording}
                    setIsRecording={setIsRecording}
                    setMarkers={setMarkers}
                    mapRef={mapRef}
                    hasPermission={hasPermission}
                    currentIndex={currentIndex}
                  />
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

      <View style={styles.carouselImages}>
        <Carousel
          //loop
          ref={carouselRefImages}
          key={markers.length}
          width={windowWidth - 10} // Use the width of the window/device
          height={150} // Fixed height for each item
          data={markers}
          mode="parallax"
          modeConfig={{
            parallaxScrollingScale: 1,
            parallaxScrollingOffset: 180,
            parallaxAdjacentItemScale: 0.8,
          }}
          onSnapToItem={index => {
            console.log("New Index: carouselImages", index); //r Debugging log
            setCurrentIndex(index);
            synchronizeMapAndCarousel(index, carouselRef);
          }}
          renderItem={({ item, index }) => (
            <TouchableOpacity onPress={() => openCameraAndSaveImage(item.id)}>
              <Image
                source={item.image ? { uri: item.image } : require('../assets/group.png')}
                style={[styles.imageAction, { borderRadrius: 15 }]}
              />
            </TouchableOpacity>
          )}
        />
      </View>

      <View style={styles.containerActionBottom}>
        <Carousel
          //loop
          ref={carouselRef}
          key={markers.length}
          width={windowWidth - 10} // Use the width of the window/device
          height={120} // Fixed height for each item
          data={markers}
          onSnapToItem={index => {
            console.log("New Index: containerActionBottom", index); //r Debugging log
            synchronizeMapAndCarousel(index, carouselRef);

          }}
          renderItem={({ item, index }) => (
            <View style={styles.carouselItemContainer}>
              <View style={styles.contentAction}>
                <Text style={styles.textAction}>{item.memoTranscription || 'No memo transcription available'}</Text>
                <Text style={styles.textActionAddress}>{`#${index == 0 ? 1 : index + 1}`} {`0/${getAddressShort()}`} {`${item.address ? '@ ' + item.address : 'No address available'}`}</Text>
              </View>
            </View>
          )}
        />
      </View>
    </View>
  );
};

export default MapViewComponent;
