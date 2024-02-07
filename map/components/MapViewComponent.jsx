// MapViewComponent.jsx
import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import MapView, { Marker } from 'react-native-maps';

const windowWidth = Dimensions.get('window').width;
const windowHeight = Dimensions.get('window').height;

const MapViewComponent = () => {
  const mapRef = useRef(null);
  const markers = [
    {
      id: '1', // Unique identifier for the main event
      latitude: 42.536457,
      longitude: -70.985786,
      title: "Peabody, MA, USA",
      description: "This is the main event location."
    }, {
      id: '2',
      latitude: 42.328674,
      longitude: -72.664658,
      title: "Northampton, MA, USA",
      description: "Convention Center"
    }, {
      id: '3',
      latitude: 42.341042,
      longitude: -71.217133,
      title: "Newton, MA, USA ",
      description: "Convention Center"
    }, {
      id: '4',
      latitude: 42.810356,
      longitude: -70.893875,
      title: "Newburyport, MA, USA",
      description: "Federal "
    }
  ];

  useEffect(() => {
    if (mapRef.current) {
      mapRef.current.fitToSuppliedMarkers(markers.map(marker => marker.id), {
        edgePadding: { top: 50, right: 50, bottom: 50, left: 50 },
        animated: true,
      });
    }
  }, []);

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
            title={marker.title}
            description={marker.description}
          />
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
});

export default MapViewComponent;
