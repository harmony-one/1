import React, {useEffect, useRef, useState} from 'react';
import {View, Dimensions, Text} from 'react-native';
import Carousel from 'react-native-reanimated-carousel';

import {useUserContext} from '../../context/UserContext';
import {MapMarker} from '../../apis/markers';
import {styles} from './MemosCarousel.styles';
interface MemosCarouselProps {
  markers: MapMarker[];
  setCurrentIndex: React.Dispatch<React.SetStateAction<number>>;
  currentIndex: number;
}

const windowWidth = Dimensions.get('window').width;

const MemosCarousel = (props: MemosCarouselProps) => {
  const {getAddressShort} = useUserContext();
  const {markers, setCurrentIndex, currentIndex} = props;
  const [selectedMemo, setSelectedMemo] = useState(0);
  const carouselRefMemos = useRef(null);

  useEffect(() => {
    if (selectedMemo !== currentIndex) {
      setSelectedMemo(currentIndex);
      if (carouselRefMemos.current) {
        (carouselRefMemos.current as any).scrollTo({
          index: currentIndex,
          animated: true,
        });
      }
    }
  }, [currentIndex, carouselRefMemos, selectedMemo]);

  return (
    <View style={styles.containerActionBottom}>
      <Carousel
        //loop
        ref={carouselRefMemos}
        key={markers.length}
        width={windowWidth - 10} // Use the width of the window/device
        height={120} // Fixed height for each item
        data={markers}
        onSnapToItem={index => {
          console.log('New Index: containerActionBottom', index); //r Debugging log
          // synchronizeMapAndCarousel(index, carouselRef);
          setCurrentIndex(index);
          setSelectedMemo(index);
        }}
        renderItem={({item, index}) => (
          <View style={styles.carouselItemContainer}>
            <View style={styles.contentAction}>
              <Text style={styles.textAction}>
                {item.memoTranscription || 'No memo transcription available'}
              </Text>
              <Text style={styles.textActionAddress}>
                {`#${index === 0 ? 1 : index}`} {`0/${getAddressShort()}`}{' '}
                {`${
                  item.address ? '@ ' + item.address : 'No address available'
                }`}
              </Text>
            </View>
          </View>
        )}
      />
    </View>
  );
};

export default MemosCarousel;
