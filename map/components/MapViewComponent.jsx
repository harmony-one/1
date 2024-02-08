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
                <Text>{marker.address}</Text>
                <Button title="Check-in" onPress={() => handlePress(marker)} />
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
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'blue',
    justifyContent: 'center',
    alignItems: 'center',
  },
  number: {
    color: 'white',
  },
  calloutView: {
    width: 200,
    height: 'auto',
    borderRadius: 6,
  },
  calloutTitle: {
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 5,
  },
});

export default MapViewComponent;
