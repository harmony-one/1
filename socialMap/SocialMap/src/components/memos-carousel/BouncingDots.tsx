import React, { useEffect, useRef } from 'react';
import { Animated, View, StyleSheet } from 'react-native';

const BouncingDots = () => {
  // Animated values for each dot
  const dot1 = useRef(new Animated.Value(0)).current;
  const dot2 = useRef(new Animated.Value(0)).current;
  const dot3 = useRef(new Animated.Value(0)).current;

  // Bounce animation for a single dot
  const bounceAnimation = (dot) => Animated.loop(
    Animated.sequence([
      Animated.timing(dot, {
        toValue: -10,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(dot, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ])
  );

  // Trigger the animations when the component mounts
  useEffect(() => {
    // Start each dot's animation with a staggered delay
    bounceAnimation(dot1).start();
    setTimeout(() => bounceAnimation(dot2).start(), 100);
    setTimeout(() => bounceAnimation(dot3).start(), 200);
  }, []);

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.dot, { transform: [{ translateY: dot1 }] }]} />
      <Animated.View style={[styles.dot, { transform: [{ translateY: dot2 }] }]} />
      <Animated.View style={[styles.dot, { transform: [{ translateY: dot3 }] }]} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    width: 60,
    paddingTop: 15
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'white',
    marginHorizontal: 2,
  },
});

export default BouncingDots;
