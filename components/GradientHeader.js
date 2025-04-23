import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

export default function GradientHeader() {
  return (
    <LinearGradient
      colors={['#feda75', '#fa7e1e', '#d62976', '#962fbf', '#4f5bd5']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 0 }}
      style={styles.container}
    >
      <Text style={styles.title}>FahmyGram</Text>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 90,
    paddingTop: 50,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
  },
  title: {
    fontSize: 24,
    fontFamily: 'Snell Roundhand', // or use a custom script font below
    color: '#fff',
    letterSpacing: 1,
  },
});