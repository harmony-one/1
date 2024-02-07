import React, { useState, useEffect, useRef } from 'react';
import { Image, View, Text, StyleSheet, Dimensions, Keyboard, TouchableWithoutFeedback, Platform, ActivityIndicator, TouchableOpacity } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { connect } from 'react-redux';
 
import { Marker } from 'react-native-maps';
import * as Location from 'expo-location';
import MapView from "react-native-map-clustering";
 
const windowWidth = Dimensions.get('window').width;
const windowHeight = Dimensions.get('window').height;
 
function Map(props) {
  const [mapRegion, setmapRegion] = useState({
    latitude: 41.223,
    longitude: 23.232,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  });
 return (
  <View style={{ flex: 1, width: windowWidth, height: windowHeight-180 }}>
        <MapView
        style={{ alignSelf: 'stretch', height: '100%' }}
        region={mapRegion}
      >
        <Marker coordinate={mapRegion} title='Marker' />
      </MapView>
</View>
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