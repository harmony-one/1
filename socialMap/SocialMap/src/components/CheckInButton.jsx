// CheckInButton.jsx
import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

const CheckInButton = ({ isChecked, onPress, style }) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={[styles.button, style]}>
      <Icon
        name={isChecked ? "check-circle" : "check-circle-outline"}
        size={20}
        color={isChecked ? "green" : "grey"}
        style={styles.icon}
      />
      <Text style={styles.buttonText}>{isChecked ? "Checked In" : "Check In"}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#DDD', // Adjust the background color as needed
    padding: 10,
    borderRadius: 5,
  },
  icon: {
    marginRight: 8,
  },
  buttonText: {
    fontSize: 15,
  },
});

export default CheckInButton;
