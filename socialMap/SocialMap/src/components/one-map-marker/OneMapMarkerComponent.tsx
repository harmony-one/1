import React, {useEffect, useRef, useState} from 'react';
import {Marker, Callout} from 'react-native-maps';
import {View, Text, TouchableOpacity, Animated} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {AudioRecorder, AudioUtils} from 'react-native-audio';
import Toast from 'react-native-toast-message';
import Icon from 'react-native-vector-icons/MaterialIcons';
import MapView from 'react-native-maps';

import {speechToText} from '../../apis/openai';
import openInAppBrowser from '../BrowserView';
import {styles} from './OneMapMarker.styles';
import {type MapMarker} from '../../apis/markers';

interface MapMarkerProps {
  marker: MapMarker;
  isRecording: boolean;
  setIsRecording: React.Dispatch<React.SetStateAction<boolean>>; // (isRecording: boolean) => void;
  setMarkers: React.Dispatch<React.SetStateAction<MapMarker[]>>;
  hasPermission: boolean;
  mapRef: React.MutableRefObject<null>;
  currentIndex: number;
}

function sanitizeURL(str: string) {
  return str.replace(/[^a-zA-Z0-9\-_.!~*'()]/g, '');
}

const OneMapMarker = (props: MapMarkerProps) => {
  const {
    marker,
    isRecording,
    setIsRecording,
    setMarkers,
    hasPermission,
    mapRef,
    currentIndex,
  } = props;
  const [audioPath, setAudioPath] = useState(
    AudioUtils.DocumentDirectoryPath + `/voiceMemo_${Date.now()}.mp4`,
  );
  const opacity = useRef(new Animated.Value(1)).current;

  const handlePress = () => {
    console.log('Button pressed for:', marker.name);

    const newRegion = {
      latitude: marker.latitude,
      longitude: marker.longitude,
      latitudeDelta: 0.01,
      longitudeDelta: 0.01,
    };
    if (mapRef.current) {
      (mapRef.current as MapView).animateToRegion(newRegion);
    } else {
      console.error('mapRef is null');
    } // Added duration for the animation
  };

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isRecording]);

  useEffect(() => {
    if (currentIndex === marker.id - 1 && mapRef.current) {
      const {latitude, longitude} = marker;
      // @ts-ignore
      if (mapRef.current) {
        (mapRef.current as MapView).animateToRegion(
          {
            latitude,
            longitude,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
          },
          1000,
        );
      } else {
        console.error('mapRef is null');
      }
    }
  }, [currentIndex, marker, mapRef]);

  // Handle recording stop and playback
  const stopRecordingAndPlayBackEventPopup = async () => {
    if (!isRecording) {
      return;
    }
    await AudioRecorder.stopRecording();
    setIsRecording(false);
    // Playback the recording
    try {
      console.log(audioPath);
      const result = await speechToText(audioPath);
      if (result) {
        console.log('Transcription result:', result);
        setMarkers(prevMarkers =>
          prevMarkers.map(m =>
            m.id === marker.id
              ? {
                  ...m,
                  memoTranscription: m.memoTranscription
                    ? `${m.memoTranscription}\n${result}`
                    : result,
                }
              : m,
          ),
        );
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
  const startRecordingEventPopup = async () => {
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

  return (
    <Marker
      identifier={`${marker.id}`}
      coordinate={{
        latitude: marker.latitude,
        longitude: marker.longitude,
      }}
      title={marker.name}
      description={marker.address}>
      <View style={styles.circle}>
        <LinearGradient
          colors={['#00AEE9', '#FFFFFF']} // Replace with your gradient colors
          style={styles.circle}
          start={{x: 0, y: 0}} // Gradient starting position
          end={{x: 1, y: 1}} // Gradient ending position
        >
          <Text style={styles.number}>{marker.id}</Text>
        </LinearGradient>
      </View>
      <Callout onPress={handlePress}>
        <View style={styles.calloutView}>
          <TouchableOpacity
            onPress={() =>
              openInAppBrowser(
                `https://www.j.country/tag/${sanitizeURL(marker.name)}`,
              )
            }>
            <Text style={styles.calloutTitle}>{marker.name}</Text>
          </TouchableOpacity>
          <Text style={styles.calloutDescription}>
            {marker.address.split(',')[0]}
          </Text>
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              // eslint-disable-next-line react-native/no-inline-styles
              style={{flexDirection: 'row', alignItems: 'center'}}
              onPress={() => {
                if (isRecording) {
                  stopRecordingAndPlayBackEventPopup();
                } else {
                  startRecordingEventPopup();
                }
              }}>
              <Animated.View style={{opacity}}>
                <Icon
                  name={isRecording ? 'mic' : 'mic-none'}
                  size={30}
                  color={isRecording ? 'red' : '#00ace8'}
                />
              </Animated.View>
            </TouchableOpacity>
          </View>
        </View>
      </Callout>
    </Marker>
  );
};

export default OneMapMarker;
