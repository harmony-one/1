import {StyleSheet, Dimensions} from 'react-native';

const windowWidth = Dimensions.get('window').width;
// const windowHeight = Dimensions.get('window').height;

export const styles = StyleSheet.create({
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
  overlayButtons: {
    position: 'absolute', // Position buttons over the map
    bottom: 10, // Adjust based on your layout
    right: 10,
    alignItems: 'flex-end',
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
  carouselImages: {
    backgroundColor: 'transparent', // Completely transparent background
    justifyContent: 'center',
  },
  carouselItemContainer: {
    flexDirection: 'row', // Align items horizontally
    alignItems: 'center', // Center items vertically in the container
    justifyContent: 'space-between', // Space between the image and text content
    width: windowWidth, // Match the width of the carousel
    paddingHorizontal: 10, // Add some horizontal padding
    height: 100,
  },
  imageAction: {
    maxWidth: 300,
    maxHeight: 150,
    width: 292, // Adjust based on your image size
    height: 150, // Adjust based on your image size
    backgroundColor: 'transparent', // Completely transparent background
    justifyContent: 'center',
    alignItems: 'center',
  },
  containerActionBottom: {
    flexDirection: 'row',
    padding: 10,
    backgroundColor: '#404040',
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
