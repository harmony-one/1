import LandingScreen from './screens/Landing'
import RegisterScreen from './screens/Register'
import LoginScreen from './screens/Login'
import MainScreen from './screens/Main'

import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

import React, { Component } from 'react'
import { View, Text } from 'react-native';

import firebase from 'firebase/app'
import "firebase/auth"

import { Provider } from 'react-redux';
import { createStore, applyMiddleware } from 'redux'
import rootReducer from './components/redux/reducers'
import thunk from 'redux-thunk'
const store = createStore(rootReducer, applyMiddleware(thunk))

import { LogBox } from 'react-native';
import {FIREBASE_API_KEY} from '@env';
import MapViewComponent from './screens/MapViewComponent'
import { StyleSheet } from 'react-native';


LogBox.ignoreLogs(['Warning: ...']);
LogBox.ignoreAllLogs();

const firebaseConfig = {
  apiKey: `${FIREBASE_API_KEY}`,
  authDomain: "harmony-64ffb.firebaseapp.com",
  projectId: "harmony-64ffb",
  storageBucket: "harmony-64ffb.appspot.com",
  messagingSenderId: "787358226489",
  appId: "1:787358226489:web:de977476792ce8018615e8"
};

if(firebase.apps.length === 0){
  firebase.initializeApp(firebaseConfig)
}

const Stack = createStackNavigator();

function MyStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="MapView" component={MapViewComponent} options={{ title: 'Harmony' }} />
      {/* You can add more screens to the stack here */}
    </Stack.Navigator>
  );
}

export default function App() {
  return (
    <NavigationContainer>
      <MyStack />
    </NavigationContainer>
  );
}