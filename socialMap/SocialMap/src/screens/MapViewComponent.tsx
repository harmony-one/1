// MapViewComponent.jsx
import React, {useEffect, useRef, useState} from 'react';
import {View, Text, TouchableOpacity, Alert, Animated} from 'react-native';
import MapView from 'react-native-maps';
import {AudioRecorder, AudioUtils} from 'react-native-audio';
import Toast from 'react-native-toast-message';
import Geolocation from '@react-native-community/geolocation';
import Icon from 'react-native-vector-icons/MaterialIcons';
import firestore from '@react-native-firebase/firestore';

import {speechToText} from '../apis/openai';
import {type MapMarker, getMapMarkers} from '../apis/markers';
import {getMarkerAddress} from '../apis/geocoding';

import ImageCarousel from '../components/image-carousel/ImageCarouselComponent';
import MemosCarousel from '../components/memos-carousel/MemosCarouselComponent';
import OneMapMarker from '../components/one-map-marker/OneMapMarkerComponent';
import {styles} from './MapView.styles';

const MapViewComponent = () => {
  // State for managing recording
  const [markers, setMarkers] = useState<MapMarker[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [hasPermission, setHasPermission] = useState(false);
  const [, setMarkerCounts] = useState({});
  // const [showPosts, setShowPosts] = useState(false);
  const showPosts = false;
  const [audioPath, setAudioPath] = useState(
    AudioUtils.DocumentDirectoryPath + `/voiceMemo_${Date.now()}.mp4`,
  );
  const mapRef = useRef(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const opacity = useRef(new Animated.Value(1)).current; // For opacity animation
  // const carouselRef = useRef(null);

  useEffect(() => {
    const getMarkers = async () => {
      const markerList = await getMapMarkers();
      setMarkers(markerList ?? []);
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // useEffect(() => {
  //   if (markers && markers.length > 0) {
  //     const updatedCount = markers ? markers.length : 0;
  //     // const latestData = markers[updatedCount - 1];
  //   }
  // }, [markers]); // This

  useEffect(() => {
    if (markers && mapRef.current) {
      (mapRef.current as MapView).fitToSuppliedMarkers(
        markers.map(marker => `${marker.id}`),
        {
          edgePadding: {top: 50, right: 50, bottom: 50, left: 50},
          animated: true,
        },
      );
    }
  }, [markers]);

  useEffect(() => {
    const fetchCounts = async () => {
      if (!markers || markers.length === 0) {
        return;
      }
      const countsMap: {[key: string]: number} = {};
      const fetchPromises = markers.map(marker => {
        const documentId = `${marker.longitude}${marker.latitude}`;
        return firestore()
          .collection('checkins')
          .doc(documentId)
          .get()
          .then(docSnapshot => {
            if (docSnapshot.exists) {
              countsMap[documentId] = docSnapshot.data()
                ? docSnapshot.data()!.count
                : 0;
            }
          })
          .catch(error => {
            console.error(
              `Error fetching count for marker ${documentId}:`,
              error,
            );
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
      ]),
    );

    if (isRecording) {
      blinkAnimation.start(); // Start blinking when recording
    } else {
      blinkAnimation.stop(); // Stop blinking when not recording
      opacity.setValue(1); // Reset opacity to show button normally
    }
    return () => blinkAnimation.stop(); // Cleanup by stopping the animation
  }, [isRecording, opacity]);

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
    if (!isRecording) {
      return;
    }
    await AudioRecorder.stopRecording();
    setIsRecording(false);

    try {
      console.log(audioPath);
      const result = await speechToText(audioPath); // Assuming this function exists and works as expected
      if (result) {
        console.log('Transcription result:', result);
        Geolocation.getCurrentPosition(
          async position => {
            // Corrected syntax for async callback
            console.log('Current position:', position);
            const {latitude, longitude} = position.coords;
            // const newRegion = {
            //   latitude,
            //   longitude,
            //   latitudeDelta: 0.01, // Optionally adjust the latitudeDelta and longitudeDelta
            //   longitudeDelta: 0.01,
            // };

            const address = await getMarkerAddress(latitude, longitude); // Make sure this function is correctly defined
            if (address) {
              console.log('Current address:', address);
              const newMarker = {
                //    id: uuid.v4(), // Ensure uuid.v4() is correctly imported and used
                id: markers ? markers.length + 1 : 1,
                name: 'New Marker', // Changed from uuid to a descriptive name
                longitude: longitude,
                latitude: latitude,
                address: address.split(',')[0],
                checked: true,
                counter: 1,
                memoTranscription: result,
              };

              setMarkers((prevMarkers: MapMarker[]) => [
                ...prevMarkers,
                newMarker,
              ]);
              setCurrentIndex(markers ? markers.length + 1 : 1);
            }
          },
          error => {
            console.error('Error getting current position:', error);
            Alert.alert('Error', 'Unable to fetch current location.');
          },
          {enableHighAccuracy: true},
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

  const getCurrentLocation = () => {
    console.log('Attempting to get current position...');

    Geolocation.getCurrentPosition(
      position => {
        console.log('Current position:', position);
        const {latitude, longitude} = position.coords;
        const newRegion = {
          latitude,
          longitude,
          latitudeDelta: 0.01, // Optionally adjust the latitudeDelta and longitudeDelta
          longitudeDelta: 0.01,
        };
        if (mapRef.current) {
          (mapRef.current as MapView).animateToRegion(newRegion);
        } else {
          console.error('mapRef is null');
        }
      },
      error => {
        console.error('Error getting current position:', error);
        Alert.alert('Error', error.message);
      },
      {enableHighAccuracy: true},
    );
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
              {markers &&
                markers.length > 0 &&
                markers.map((marker, index) => (
                  <OneMapMarker
                    key={index}
                    marker={marker}
                    isRecording={isRecording}
                    setIsRecording={setIsRecording}
                    setMarkers={setMarkers ?? undefined}
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
                <TouchableOpacity
                  onPress={() => {
                    if (isRecording) {
                      stopRecordingAndPlayBack();
                    } else {
                      startRecording();
                    }
                  }}>
                  <Animated.View style={{opacity}}>
                    <Icon
                      name={isRecording ? 'mic' : 'mic-none'}
                      size={25}
                      color={isRecording ? 'red' : '#00ace8'}
                    />
                  </Animated.View>
                </TouchableOpacity>
              </View>
            </View>
          </>
        ) : (
          <View>
            {/* place PostsComponent */}
            <Text style={styles.postText}>Showing Posts</Text>
          </View>
        )}
      </View>
      <ImageCarousel
        markers={markers}
        setMarkers={setMarkers}
        setCurrentIndex={setCurrentIndex}
        currentIndex={currentIndex}
      />
      <MemosCarousel
        markers={markers}
        setCurrentIndex={setCurrentIndex}
        currentIndex={currentIndex}
      />
    </View>
  );
};

export default MapViewComponent;