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
    justifyContent: 'space-between', // This will align `textActionAddress` to the right and `shareAction` to the left
    alignItems: 'center', // This will vertically center the contents
    height: 34, // Set the height you prefer
    paddingHorizontal: 10, // Add horizontal padding if needed
  },
  // Updated `textActionAddress` style
  textActionAddress: {
    // flexGrow has been removed
    fontSize: 17,
    color: '#00aee9',
    paddingRight: 15,
    lineHeight: 24
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

  // Container for the transcription text that has a fixed height
  transcriptionContainer: {
    height: 135, // Set your fixed height here
   // justifyContent: 'left', // Centers the text vertically within the container
   paddingRight: 15,
  },
  // Style for the large initial letter
  dropCap: {
    fontSize: 30, // Set this to the size you want for the first letter
    fontWeight: 'bold', // If you want the first letter to be bold
    color: 'white'
    // Add other styles like color, fontFamily etc. as required
  },

  // Style for the rest of the transcription text
  transcriptionText: {
    fontSize: 17, // Set this to the size you want for the rest of the text
    // Add other styles like color, fontFamily etc. as required
    // height: 135,
    color: 'white',
    flexShrink: 1, // Allow text to shrink and not overflow the container

  },

  // Style for the quotation mark and transcription text
  quotedText: {
    flexDirection: 'row', // Aligns the drop cap with the rest of the text
    flexWrap: 'wrap', // Ensures text wraps correctly
    alignItems: 'flex-end', // Aligns the baseline of the text with the drop cap
  },

});
