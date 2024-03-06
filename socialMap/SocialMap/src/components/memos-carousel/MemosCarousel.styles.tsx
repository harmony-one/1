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
    height: 175,
  },
  contentAction: {
    flexGrow: 6,
    flexDirection: 'column',
    color: 'white', // Ensure this contrasts with the background
    marginBottom: 8,
    marginLeft: 10,
    height: 175,
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
  


  // New style for the container of the address and share action
  actionContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between', // This will align `textActionAddress` to the right and `shareAction` to the left
    alignItems: 'center', // This will vertically center the contents
    height: 34, // Set the height you prefer
    paddingHorizontal: 10, // Add horizontal padding if needed
  },
  // Updated `textActionAddress` style
  textActionAddress: {
    // flexGrow has been removed
    fontSize: 12,
    color: '#00aee9',
    paddingRight: 15,
    // marginLeft has been removed
    // paddingRight has been removed, assuming the container padding handles this
  },

  // Updated `shareAction` style
  shareAction: {
    // Removed marginBottom and flexGrow
    // paddingRight has been removed, assuming the container padding handles this
    height: 34, // Ensure the button has a height
    width: 34, // Ensure the button has a width
    // Add marginLeft if you want to push the button a bit to the right from the edge
  },
  
});
