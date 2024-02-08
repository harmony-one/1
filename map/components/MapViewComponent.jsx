// MapViewComponent.jsx
import React, { useEffect, useRef, useState } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { getMapMarkers } from '../api/markers';

const windowWidth = Dimensions.get('window').width;
const windowHeight = Dimensions.get('window').height;

const MapViewComponent = () => {
  const [markers, setMarkers] = useState([])
  const mapRef = useRef(null);

  useEffect(() => {
    const getMarkers = async () => {
      const markers = await getMapMarkers()
      setMarkers(markers)
    }
    getMarkers()
  }, [])

  useEffect(() => {
    if (mapRef.current) {
      mapRef.current.fitToSuppliedMarkers(markers.map(marker => marker.id), {
        edgePadding: { top: 50, right: 50, bottom: 50, left: 50 },
        animated: true,
      });
    }
  }, [markers]);

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
        {markers.length > 0 && markers.map((marker, index) => (
          <Marker
            key={index}
            identifier={marker.id} // Use identifier for fitToSuppliedMarkers
            coordinate={{ latitude: marker.latitude, longitude: marker.longitude }}
            title={marker.name}
            description={marker.address}
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
