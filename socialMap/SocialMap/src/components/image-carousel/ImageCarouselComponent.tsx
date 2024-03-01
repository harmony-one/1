//@ts-nocheck
import React, {useEffect, useRef, useState} from 'react';
import {View, Dimensions, TouchableOpacity, Image} from 'react-native';
import RNFS from 'react-native-fs';
import Carousel from 'react-native-reanimated-carousel';
import {launchCamera} from 'react-native-image-picker';

import {Marker} from '../map-marker/MapMarkerComponent';
import {styles} from './ImageCarousel.styles';

interface ImageCarouselProps {
  markers: Marker[];
  setIsRecording: React.Dispatch<React.SetStateAction<boolean>>; // (isRecording: boolean) => void;
  setCurrentIndex: React.Dispatch<React.SetStateAction<number>>;
  setMarkers: React.Dispatch<React.SetStateAction<Marker[]>>;
  currentIndex: number;
}

const windowWidth = Dimensions.get('window').width;

const ImageCarousel = (props: ImageCarouselProps) => {
  const {markers, setCurrentIndex, setMarkers, currentIndex} = props;
  const [selectedImage, setSelectedImage] = useState(0);
  const carouselRefImages = useRef(null);

  useEffect(() => {
    console.log('useEffect', currentIndex);
    if (selectedImage !== currentIndex) {
      setSelectedImage(currentIndex);
      carouselRefImages.current?.scrollTo({
        index: currentIndex,
        animated: true,
      });
    }
  }, [currentIndex, carouselRefImages, selectedImage]);

  const openCameraAndSaveImage = (id: number) => {
    const options = {
      saveToPhotos: true,
      mediaType: 'photo',
    };
    console.log('open Camera And SaveImage called');
    launchCamera(options, async response => {
      console.log('RESPONSE', response);
      if (response.didCancel) {
        console.log('User cancelled image capture');
      } else if (response.error) {
        console.log('ImagePicker Error: ', response.error);
      } else if (response.customButton) {
        console.log('User tapped custom button: ', response.customButton);
      } else {
        const source = {uri: response.assets[0].uri};
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

  return (
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
          console.log('New Index: carouselImages', index); //r Debugging log
          setCurrentIndex(index);
          setSelectedImage(index);
          // synchronizeMapAndCarousel(index, carouselRef);
        }}
        renderItem={({item}) => (
          <TouchableOpacity onPress={() => openCameraAndSaveImage(item.id)}>
            <Image
              source={
                item.image
                  ? {uri: item.image}
                  : require('../../assets/group.png')
              }
              // eslint-disable-next-line react-native/no-inline-styles
              style={[styles.imageAction, {borderRadrius: 15}]}
            />
          </TouchableOpacity>
        )}
      />
    </View>
  );
};

export default ImageCarousel;
