import { USER_STATE_CHANGE, USER_EVENTS_STATE_CHANGE, USER_PHOTOS_STATE_CHANGE, USER_FOLLOWING_STATE_CHANGE, USERS_DATA_STATE_CHANGE, USERS_EVENTS_STATE_CHANGE, USERS_PHOTOS_STATE_CHANGE, CLEAR_DATA } from '../constants/index'
import firebase from 'firebase/app'
require('firebase/firestore')

export function clearData() {
    return ((dispatch) => {
        dispatch({type: CLEAR_DATA})
    })
}
export function fetchUser(){
    return((dispatch) => {
        firebase.firestore()
            .collection("users")
            .doc(firebase.auth().currentUser.uid)
            .get()
            .then((snapshot) => {
                if(snapshot.exists){
                    dispatch({ type: USER_STATE_CHANGE, currentUser: snapshot.data() })
                } else {
                    console.log("User doesn't exist.")
                }
            })
    })
}