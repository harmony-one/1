/* eslint-disable react-native/no-inline-styles */
import React, { useEffect, useState } from 'react';
import {
  View,
  Dimensions,
  Text,
  // TouchableOpacity,
  // Image,
  // StyleSheet,
  // Animated,
} from 'react-native';
import Carousel from 'react-native-reanimated-carousel';

// import {useUserContext} from '../../context/UserContext';
import { MapMarker } from '../../apis/markers';
import { styles } from './MemosCarousel.styles';
// import Icon from 'react-native-vector-icons/MaterialIcons';
import BouncingDots from './BouncingDots';
import { WebView } from 'react-native-webview';
import DropCapWebView from '../memos-carousel/DropCapWebView';

interface MemosCarouselProps {
  markers: MapMarker[];
  setCurrentIndex: React.Dispatch<React.SetStateAction<number>>;
  currentIndex: number;
  carouselRef: React.MutableRefObject<null>;
  isRecording: boolean;
}
const windowWidth = Dimensions.get('window').width;
const MemosCarousel = (props: MemosCarouselProps) => {
  const { markers, setCurrentIndex, currentIndex, carouselRef, isRecording } =
    props;
  const [selectedMemo, setSelectedMemo] = useState(0);

  useEffect(() => {
    // if (selectedMemo !== currentIndex) {
    //   setSelectedMemo(currentIndex);
    // }
  }, [currentIndex, carouselRef, selectedMemo, isRecording]);

  return (
    <View style={styles.containerActionBottom}>
      <Carousel
        //loop
        ref={carouselRef}
        key={markers.length}
        width={windowWidth - 10} // Use the width of the window/device
        height={175} // Fixed height for each item
        data={markers}
        onSnapToItem={index => {
          console.log('New Index: containerActionBottom', index); //r Debugging log
          // synchronizeMapAndCarousel(index, carouselRef);
          setCurrentIndex(index);
          setSelectedMemo(index);
        }}
        renderItem={({ item, index }) => (
          <View style={styles.carouselItemContainer}>
            <View style={styles.contentAction}>
              <View style={styles.transcriptionContainer}>
                {item.memoTranscription ? (


                  <View style={styles.container}>
                    {isRecording ? (
                      <BouncingDots />
                    ) : (
                      <DropCapWebView text={item.memoTranscription} />
                    )}
                  </View>
                ) : (
                  <Text selectable={true} style={styles.transcriptionText}>
                    No memo transcription available.
                  </Text>

                )}
              </View>
              {/* New container for the address and share button */}
              <View style={styles.actionContainer}>
                {/* <TouchableOpacity onPress={shareAction} style={styles.shareAction}>
                  <Image source={require('../../assets/share.png')} />
                </TouchableOpacity> */}
                {/* {`#${index === 0 ? 1 : index} 0/${getAddressShort()} ${item.address ? '@ ' + item.address : 'No address available'}`} */}

                <Text style={styles.textActionAddress}>
                  #{index === 0 ? 1 : index}{' '}
                  <Text style={{ textDecorationLine: 'underline' }}>0/babe</Text>
                  {item.address
                    ? ' @ ' + item.address.toLowerCase() + ' (2s)'
                    : ' No address available'}
                </Text>
              </View>
            </View>
          </View>
        )}
      />
    </View>
  );
};

export default MemosCarousel;
