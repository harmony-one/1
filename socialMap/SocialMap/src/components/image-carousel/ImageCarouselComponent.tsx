import React, {useEffect, useRef, useState} from 'react';
import {View, Dimensions, TouchableOpacity, Image} from 'react-native';
import RNFS from 'react-native-fs';
import Carousel from 'react-native-reanimated-carousel';
import {
  launchCamera,
  CameraOptions,
  ImagePickerResponse,
} from 'react-native-image-picker';

import {styles} from './ImageCarousel.styles';
import {MapMarker} from '../../apis/markers';

interface ImageCarouselProps {
  markers: MapMarker[];
  setCurrentIndex: React.Dispatch<React.SetStateAction<number>>;
  setMarkers: React.Dispatch<React.SetStateAction<MapMarker[]>>;
  currentIndex: number;
}

const windowWidth = Dimensions.get('window').width;

const ImageCarousel = (props: ImageCarouselProps) => {
  const {markers, setCurrentIndex, setMarkers, currentIndex} = props;
  const [selectedImage, setSelectedImage] = useState(0);
  const carouselRefImages = useRef(null);

  useEffect(() => {
    if (selectedImage !== currentIndex) {
      setSelectedImage(currentIndex);
      if (carouselRefImages.current) {
        (carouselRefImages.current as any).scrollTo({
          index: currentIndex,
          animated: true,
        });
      }
    }
  }, [currentIndex, carouselRefImages, selectedImage]);

  const openCameraAndSaveImage = (id: number) => {
    const options: CameraOptions = {
      saveToPhotos: true,
      mediaType: 'photo',
    };
    console.log('open Camera And SaveImage called');
    launchCamera(options, async (response: ImagePickerResponse) => {
      console.log('RESPONSE', response);
      if (response.didCancel) {
        console.log('User cancelled image capture');
      } else if (response.errorCode) {
        console.log('ImagePicker Error: ', response.errorMessage);
        // } else if (response. assets .customButton) {
        //   console.log('User tapped custom button: ', response.customButton);
      } else {
        const source = {uri: response.assets && response.assets[0].uri};
        console.log('Image captured:', source.uri);

        // Save the image to the app's document directory
        const timestamp = Date.now(); // Use a timestamp to ensure uniqueness
        const newImageName = `image_${timestamp}.jpg`; // Generate a unique file name
        const newImagePath = `${RNFS.DocumentDirectoryPath}/${newImageName}`;
        try {
          if (source.uri) {
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
          }
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
              style={[styles.imageAction, {borderRadius: 15}]}
            />
          </TouchableOpacity>
        )}
      />
    </View>
  );
};

export default ImageCarousel;
