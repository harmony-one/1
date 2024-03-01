import {StyleSheet} from 'react-native';

export const styles = StyleSheet.create({
  circle: {
    width: 40,
    height: 40,
    borderRadius: 30,
    backgroundColor: '#00ace8',
    justifyContent: 'center',
    alignItems: 'center',
  },
  number: {
    color: 'white',
    fontSize: 20,
  },
  calloutView: {
    padding: 8,
    width: 250,
    height: 'auto',
    borderRadius: 6,
  },
  calloutTitle: {
    fontWeight: 'bold',
    fontSize: 22,
    marginBottom: 5,
  },
  calloutDescription: {
    fontSize: 16,
    marginBottom: 10,
  },
  buttonContainer: {
    //  flexDirection: 'row',
    //  justifyContent: 'space-between',
    alignItems: 'center',
  },
});
