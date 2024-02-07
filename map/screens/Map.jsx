import React, { useState, useEffect, useRef } from 'react';
import { Image, View, Text, StyleSheet, Dimensions, Keyboard, TouchableWithoutFeedback, Platform, ActivityIndicator, TouchableOpacity } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { connect } from 'react-redux';
 
import { PROVIDER_GOOGLE } from 'react-native-maps';
import { Marker } from 'react-native-maps';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';
import * as Location from 'expo-location';
import MapView from "react-native-map-clustering";

import BottomSheet, { BottomSheetScrollView } from '@gorhom/bottom-sheet';
 
const windowWidth = Dimensions.get('window').width;
const windowHeight = Dimensions.get('window').height;
const dismissKeyboard = () => { if (Platform.OS != "web"){ Keyboard.dismiss(); } }

const api_key = ''
 
function Map(props) {
 const [currentLocation, setCurrentLocation] = useState(null);
 const [errorMsg, setErrorMsg] = useState(null);
 
 useEffect(() => {
   (async () => {
    
     let { status } = await Location.requestForegroundPermissionsAsync();
     if (status !== 'granted') {
       setErrorMsg('Permission to access location was denied');
       return;
     }
 
     let location = await Location.getCurrentPositionAsync({});
     setCurrentLocation([location.coords.latitude, location.coords.longitude]);

   })();
 }, []);

 let text = 'Fetching Location...';
 if (errorMsg) {
   text = errorMsg;
 }

  const mapRef = useRef(null);
  const animate = (coordinate) => {
    let newRegion = {latitude: coordinate[0], longitude: coordinate[1], latitudeDelta: 0.1, longitudeDelta: 0.04};
    mapRef.current.animateToRegion(newRegion, 800);
  }

 if (currentLocation === null) {
   return (
     <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
       <View>
           <ActivityIndicator size="large" color="#00ace8" />
       </View>
       <Text style={{ fontSize: 15, marginTop: 10, color: "#00ace8"}}>{text}</Text>
     </View>
   )}

 return (
     <TouchableWithoutFeedback onPress={() => dismissKeyboard()} accessible={false}>
         <View style={{ flex: 1, width: windowWidth, height: windowHeight-180 }}>
           <MapView
             style={StyleSheet.absoluteFillObject}
             provider={PROVIDER_GOOGLE}
             ref={mapRef}
             showsUserLocation={true}
             followsUserLocation={true}
             showsMyLocationButton={true}
             showsIndoors={true}
             showsIndoorLevelPicker={true}
             loadingEnabled={true}
             rotateEnabled={true}
             scrollDuringRotateOrZoomEnabled={true}
             initialRegion={{latitude: currentLocation[0], longitude: currentLocation[1], latitudeDelta: 0.3, longitudeDelta: 0.04}}
             onClusterPress={(coordinate) => {
              animate([coordinate.geometry.coordinates[1], coordinate.geometry.coordinates[0]])
            }}
             clustering = {true}
             clusterColor="#00ace8"
             radius = {50}
             >
             <GooglePlacesAutocomplete
               placeholder='Search Location'
               onPress={(data, details = null) => {
                animate([details.geometry.location.lat, details.geometry.location.lng])
               }}
               fetchDetails
               query={{
                 key: api_key,
                 language: 'en',
               }}
               renderLeftButton={()  => <MaterialCommunityIcons name="map-marker" color='grey' size={30} style={{marginLeft: 20, marginTop: 7.5, top: 15}} />}
               styles={styles.searchBar}
             />
           </MapView>
         </View>
     </TouchableWithoutFeedback>
 )
}


const styles = StyleSheet.create({
  toggleButton: {
    flex: 1,
    flexDirection: "row",
    width: 115,
    height: 35,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    padding: 7,
    borderRadius: 50,
    bottom: 40,
    position: "absolute",
    backgroundColor: 'white',
    shadowColor: '#171717',
    shadowOffset: {width: -2, height: 4},
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  chips: {
    width: 80,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 0,
    borderRadius: 50,
    marginTop: 70,
    marginLeft: 15,
    backgroundColor: 'white',
    shadowColor: '#171717',
    shadowOffset: {width: -2, height: 4},
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  searchBar: {
      container: {
        shadowColor: '#171717',
        shadowOffset: {width: -2, height: 4},
        shadowOpacity: 0.2,
        shadowRadius: 3,
        top: 15,
      },
      textInput: {
        height: 45,
        marginLeft: 0,
        marginRight: 15,
        backgroundColor: 'white',
        top: 15,
      },
      textInputContainer: {
        backgroundColor: 'white',
        borderRadius: 30,
        height: 45,
        marginLeft: 15,
        marginRight: 15,
        marginTop: 0,
      },
      listView: {
        marginHorizontal: 35
      }
  },
  pinImage: {
    width: 50,
    height: 50,
    borderRadius: 30,
    borderColor: 'rgba(48, 181, 199, 0.3)',
    borderWidth: 6,
  },
  detailEventImage: {
    width: windowWidth-20,
    height: windowWidth-20,
    aspectRatio: 1,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    margin: 10
  },
  detailPhotoImage: {
    width: windowWidth-20,
    height: windowWidth-20,
    aspectRatio: 1,
    borderRadius: 30,
    margin: 10
  },
  profileImage: {
    width: 35,
    height: 35,
  },
  textDetailHeader: {
    fontSize: 17,
    fontWeight: 'bold',
    marginTop: 5,
  }
})

const mapStateToProps = (store) => ({
  currentUser: store.userState.currentUser,
  following: store.userState.following,
  users: store.usersState.users,
  usersLoaded: store.usersState.usersLoaded,
})

export default connect(mapStateToProps, null)(Map);