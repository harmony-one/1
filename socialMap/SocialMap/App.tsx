/* eslint-disable react/react-in-jsx-scope */
import Toast from 'react-native-toast-message';
import {NavigationContainer} from '@react-navigation/native';
import {createStackNavigator} from '@react-navigation/stack';
import MapViewComponent from './src/screens/MapViewComponent';
import React from 'react';
import codePush from 'react-native-code-push';
import {UserProvider} from './src/context/UserContext';

const Stack = createStackNavigator();
let codePushOptions = {
  checkFrequency: codePush.CheckFrequency.ON_APP_RESUME,
  installMode: codePush.InstallMode.ON_NEXT_RESUME,
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
  return (
    <UserProvider>
      <NavigationContainer>
        <MyStack />
      </NavigationContainer>
      <Toast />
    </UserProvider>
  );
}

export default codePush(codePushOptions)(App);
