/* eslint-disable react/react-in-jsx-scope */
import {View} from 'react-native';
import Toast from 'react-native-toast-message';
import {NavigationContainer} from '@react-navigation/native';
import {createStackNavigator} from '@react-navigation/stack';
import MapViewComponent from './src/screens/MapViewComponent';
import React from 'react';

const Stack = createStackNavigator();

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

export default function App() {
  return (
    <View>
      <NavigationContainer>
        <MyStack />
      </NavigationContainer>
      <Toast />
    </View>
  );
}
