import {StyleSheet, Dimensions} from 'react-native';

const windowWidth = Dimensions.get('window').width;
// const windowHeight = Dimensions.get('window').height;

export const styles = StyleSheet.create({
  containerActionBottom: {
    flexDirection: 'row',
    padding: 10,
    backgroundColor: '#404040',
  },
  carouselItemContainer: {
    flexDirection: 'row', // Align items horizontally
    alignItems: 'center', // Center items vertically in the container
    justifyContent: 'space-between', // Space between the image and text content
    width: windowWidth, // Match the width of the carousel
    paddingHorizontal: 10, // Add some horizontal padding
    height: 100,
  },
  contentAction: {
    flexGrow: 6,
    flexDirection: 'column',
    color: 'white', // Ensure this contrasts with the background
    marginBottom: 8,
    marginLeft: 10,
    height: 100,
    width: 100,
  },
  textAction: {
    flexGrow: 1,
    fontSize: 12,
    paddingTop: 5,
    paddingRight: 15,
    paddingBottom: 5,
    textAlignVertical: 'center',
    textAlign: 'left',
    color: 'white',
  },
  textActionAddress: {
    paddingRight: 25,
    flexGrow: 0,
    textAlign: 'right',
    textAlignVertical: 'bottom',
    fontSize: 12,
    marginBottom: 8, // Adjust based on your spacing needs
    marginLeft: 10, // Adjust the spacing between the text and the imag
    color: 'white',
  },
});
