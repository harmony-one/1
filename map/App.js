import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import MapViewComponent from './components/MapViewComponent';
import RecordViewComponent from './components/RecordViewComponent';


const Stack = createStackNavigator();

function MyStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="RecordView"
        component={RecordViewComponent}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="MapView"
        component={MapViewComponent}
        options={{ headerShown: false }}
      />
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
