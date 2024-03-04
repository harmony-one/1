import {StyleSheet} from 'react-native';

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
  postText: {
    fontSize: 44,
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
});
