import React from 'react';
import { Text, Image, Dimensions, StyleSheet, SafeAreaView, TouchableOpacity } from 'react-native';
import { StatusBar } from 'expo-status-bar';

const windowWidth = Dimensions.get('window').width;

const Landing = ({ navigation }) => {
  return (
    <SafeAreaView style={styles.appContainer}>
        <StatusBar />
        <Image
            style={styles.logo}
            width="50%"
            source={require('../assets/LandingLogo.png')}
        />
        <Text>ONE Map</Text>
        <TouchableOpacity 
            style={styles.button}
            onPress={() => navigation.navigate("Register")}
        ><Text style={{color: '#143F73'}}>SIGN-UP</Text></TouchableOpacity>
        <TouchableOpacity
            style={styles.button}
            onPress={() => navigation.navigate("Login")}
        ><Text style={{color: '#143F73'}}>LOG-IN</Text></TouchableOpacity>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  appContainer: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: 'white'
  },
  logo: {
    width: windowWidth,
    height: undefined,
    aspectRatio: 1,
    marginTop: 50,
    marginBottom: -20,
  },
  button: {
    alignItems: "center",
    backgroundColor: "#00ace8",
    padding: 10,
    borderRadius: 30,
    width: 250,
    height: 45,
    justifyContent: 'center',
    marginTop: 15,
  },
})

export default Landing