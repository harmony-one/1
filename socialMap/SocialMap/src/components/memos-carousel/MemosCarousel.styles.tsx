import { StyleSheet, Dimensions } from 'react-native';

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
    height: 175,
  },
  contentAction: {
    flexGrow: 6,
    flexDirection: 'column',
    color: 'white', // Ensure this contrasts with the background
    // marginBottom: 8,
    // marginLeft: 10,
    height: 175,
    width: 100,
  },

  // New style for the container of the address and share action
  actionContainer: {
    flexDirection: 'row',
    alignItems: 'center', // This will vertically center the contents
    paddingHorizontal: 10, // Add horizontal padding if needed
    justifyContent: 'flex-end',
    paddingBottom: 30,
  },

   // Container for the transcription text that has a fixed height
   transcriptionContainer: {
    height: 135, // Set your fixed height here
    paddingRight: 15,
  },

  containerDrop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  // Updated `textActionAddress` style
  textActionAddress: {
    // flexGrow has been removed
    fontSize: 17,
    color: '#00aee9',
    paddingRight: 15,
    lineHeight: 24,
    fontFamily: 'Nunito-Regular',
    // marginLeft has been removed
    // paddingRight has been removed, assuming the container padding handles this
  },

  // Updated `shareAction` style
  shareAction: {
    // Removed marginBottom and flexGrow
    // paddingRight has been removed, assuming the container padding handles this
    height: 34, // Ensure the button has a height
    width: 34, // Ensure the button has a width
  },

 
  // Style for the drop cap
  dropCap: {
    fontSize: 30, // Set this to the size you want for the first letter
    lineHeight: 34,
    color: 'white',
    fontFamily: 'Nunito-Regular',
    paddingTop: 5

  },
  // Style for the rest of the transcription text
  transcriptionText: {
    fontSize: 18, // Set this to the size you want for the rest of the text
    color: 'white',
    fontFamily: 'Nunito-Regular',

  },
  container: {
   // flex: 1,
   height: 130,
    paddingBottom: 10,
  }

});
