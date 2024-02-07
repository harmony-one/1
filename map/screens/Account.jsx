import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, Image, FlatList, TouchableOpacity, Dimensions } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'

import firebase from 'firebase/app';
require('firebase/firestore');
import { connect } from 'react-redux';

const windowWidth = Dimensions.get('window').width;

const Account = (props) => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const { currentUser } = props

    setUser(currentUser)

  }, [])
  const onLogout = () => {
    firebase.auth().signOut();
  }
  if(user === null) {
    return (
      <View>
        <Text>Error: User account doesn't exist.</Text>
      </View>
      )
  };

  return (
    <KeyboardAwareScrollView 
      style={{
          flex: 1,
          backgroundColor: 'white'
      }}
      extraScrollHeight={100}
      >
        <View style={styles.container}>
          <View style={styles.containerInfo}>
            <View style={{ flexDirection: 'row', justifyContent: 'flex-start', marginLeft: 5, marginBottom: 5}}>
              <Image source={{uri: user.downloadURL}} style={{ width: 60, height: 60, marginTop: 20}}/>
              <View style={{flexDirection: "column"}}>
                <Text style={{fontSize: 20, marginTop: 20, marginLeft: 10, fontWeight: 'bold'}}>Welcome,</Text>
                <Text style={{fontSize: 25, marginTop: 5, marginLeft: 10, fontWeight: 'bold'}}>{user.name}! 👋</Text>
              </View>
            </View>
            <TouchableOpacity 
              style={styles.button}
              onPress={() => onLogout()}
            ><Text style={{color: 'white'}}>Sign Out</Text></TouchableOpacity>
          </View>
        </View>
    </KeyboardAwareScrollView>
    
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    width: windowWidth,
  },
  containerInfo: {
    margin: 20,
  },
  eventGallery: {
    flex: 1,

  },
  photoGallery: {
    flexDirection: 'row',
  },
  containerImage: {
    flex: 1,
  },
  containerEvent: {
    flex: 1,
    alignSelf: 'center'
  },
  photoImage: {
    flex: 1,
    aspectRatio: 1,
    marginTop: 0,
    width: windowWidth/3,
    height: undefined,
    borderWidth: 0.5,
    borderColor: 'white'
  },
  eventImage: {
    width: windowWidth-40,
    height: windowWidth/2.5,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    margin: 10
  },
  button: {
    alignItems: "center",
    backgroundColor: "#00ace8",
    padding: 10,
    borderRadius: 30,
    width: 160,
    height: 40,
    justifyContent: 'center',
    marginTop: 5,
    marginHorizontal: 100
  },
  segmentedButton: {
    marginBottom: 10,
  }
})

const mapStateToProps = (store) => ({
  currentUser: store.userState.currentUser,
})

export default connect(mapStateToProps, null)(Account);