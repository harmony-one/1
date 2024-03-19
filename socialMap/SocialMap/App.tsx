/* eslint-disable react/react-in-jsx-scope */
import Toast from 'react-native-toast-message';
import {NavigationContainer} from '@react-navigation/native';
import {createStackNavigator} from '@react-navigation/stack';
import MapViewComponent from './src/screens/MapViewComponent';
import React, { useEffect, useState } from 'react';
import codePush from 'react-native-code-push';
import {UserProvider} from './src/context/UserContext';
import { Modal, View, Text, ActivityIndicator } from 'react-native';


const Stack = createStackNavigator();
let codePushOptions = {
  checkFrequency: codePush.CheckFrequency.ON_APP_RESUME,
  installMode: codePush.InstallMode.ON_NEXT_RESUME,
 updateDialog: true,
};



function MyStack() {

  return (
    <Stack.Navigator>
      <Stack.Screen
        name="MapView"
        component={MapViewComponent}
        options={{headerShown: false}}
      />
      {/* You can add more screens to the stack here */}
    </Stack.Navigator>
  );
}

function App() {


  useEffect(() => {
    codePush.sync(
      {
        installMode: codePush.InstallMode.IMMEDIATE,
      },
      codePushStatusDidChange,
    );
  }, [])

  return (
    <UserProvider>
      <NavigationContainer>
        <MyStack />
      </NavigationContainer>
      <Toast />
    </UserProvider>
  );
}

function codePushStatusDidChange(syncStatus) {
  switch (syncStatus) {
    case codePush.SyncStatus.CHECKING_FOR_UPDATE:
      console.log("Checking for update.")
      break;
    case codePush.SyncStatus.DOWNLOADING_PACKAGE:
      console.log("Download packaging....")
      break;
    case codePush.SyncStatus.AWAITING_USER_ACTION:
      console.log("Awaiting user action....")
      break;
    case codePush.SyncStatus.INSTALLING_UPDATE:
      console.log("Installing update")
      break;
    case codePush.SyncStatus.UP_TO_DATE:
      console.log("codepush status up to date")
      break;
    case codePush.SyncStatus.UPDATE_IGNORED:
      console.log("update cancel by user")
      break;
    case codePush.SyncStatus.UPDATE_INSTALLED:
      console.log("Update installed and will be applied on restart.")
      break;
    case codePush.SyncStatus.UNKNOWN_ERROR:
      console.log("An unknown error occurred")
      break;
  }
}


export default codePush(codePushOptions)(App);
