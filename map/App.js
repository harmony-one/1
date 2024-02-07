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

export class App extends Component {
  constructor(props){
    super(props);
    this.state = {
      loaded: false,
    }
  }

  componentDidMount(){
    firebase.auth().onAuthStateChanged((user)=> {
      if(!user){
        this.setState({
          loggedIn: false,
          loaded: true,
        })
      } else {
        this.setState({
          loggedIn: true,
          loaded: true,
        })
      }
    })
  }

  render() {
    const { loggedIn, loaded } = this.state;
    if(!loaded){
      return(
        <View style={{ flex: 1, justifyContent: "center" }}>
          <Text>Loading</Text>
        </View>
      )
    }

    if(!loggedIn){
      return (
        <NavigationContainer>
          <Stack.Navigator initialRouteName="Landing">
            <Stack.Screen name="Landing" component={LandingScreen} options={{ headerShown: false }} />
            <Stack.Screen name="Register" component={RegisterScreen} options={{ headerShown: false }} />
            <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
          </Stack.Navigator>
        </NavigationContainer>
      );
    }
    return (
      <Provider store={store}>
        <NavigationContainer>
          <Stack.Navigator initialRouteName="Main">
            <Stack.Screen name="Main" component={MainScreen} 
              options={{
                title: 'ONE Map',
                headerStyle: {
                  backgroundColor: '#00ace8',
                },
                headerTintColor: '#47515F',
              }}
            />
          </Stack.Navigator>
        </NavigationContainer>
      </Provider>
    )
  }
}

export default App