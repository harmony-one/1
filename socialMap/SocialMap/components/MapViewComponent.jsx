// MapViewComponent.jsx
import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Dimensions, Text, Button } from 'react-native';
import MapView, { Marker, Callout } from 'react-native-maps';

import markers from '../assets/locations/tf.json';

const windowWidth = Dimensions.get('window').width;
const windowHeight = Dimensions.get('window').height;

const MapViewComponent = () => {
  const mapRef = useRef(null);

  useEffect(() => {
    if (mapRef.current) {
      mapRef.current.fitToSuppliedMarkers(markers.map(marker => marker.id), {
        edgePadding: { top: 50, right: 50, bottom: 50, left: 50 },
        animated: true,
      });
    }
  }, []);

  const handlePress = (marker) => {
    console.log('Button pressed for:', marker.name);
  };

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={styles.map}
        initialRegion={{
          latitude: 39.739235,
          longitude: -104.990250,
          latitudeDelta: 40,
          longitudeDelta: 40,
        }}>
        {markers.map((marker, index) => (
          <Marker
            key={index}
            identifier={marker.id} // Use identifier for fitToSuppliedMarkers
            coordinate={{ latitude: marker.latitude, longitude: marker.longitude }}
            title={marker.name}
            description={marker.address}
          >
            <View style={styles.circle}>
              {/* change "1" to reflect count for number of checkins */}
              <Text style={styles.number}>1</Text>
            </View>
            <Callout onPress={() => handlePress(marker)}>
              <View style={styles.calloutView}>
                <Text style={styles.calloutTitle}>{marker.name}</Text>
                <Text style={styles.calloutDescription}>{marker.address}</Text>
                <View style={styles.buttonContainer}>
                  <Button title="Check-in" onPress={() => handlePress(marker)} />
                  <Button title="Voice Memo" onPress={() => handlePress(marker)} />
                </View>
              </View>
            </Callout>
          </Marker>
        ))}
      </MapView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: windowHeight,
    width: windowWidth,
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  circle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#00ace8',
    justifyContent: 'center',
    alignItems: 'center',
  },
  number: {
    color: 'white',
    fontSize: 24,
  },
  calloutView: {
    width: 200,
    height: 'auto',
    borderRadius: 6,
  },
  calloutTitle: {
    fontWeight: 'bold',
    fontSize: 24,
    marginBottom: 5,
  },
  calloutDescription : {
    fontSize: 18,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
});

export default MapViewComponent;
