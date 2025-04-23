import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation, useRoute } from '@react-navigation/native';

export default function GradientHeader() {
  const navigation = useNavigation();
  const route = useRoute();

  const canGoBack = navigation.canGoBack();

  return (
    <LinearGradient
      colors={['#feda75', '#fa7e1e', '#d62976', '#962fbf', '#4f5bd5']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 0 }}
      style={styles.container}
    >
      <View style={styles.inner}>
        {canGoBack ? (
          <TouchableOpacity onPress={navigation.goBack} style={styles.backButton}>
            <Text style={styles.backArrow}>←</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.backPlaceholder} />
        )}

        <Text style={styles.title}>FahmyGram</Text>

        {/* Placeholder to balance spacing if back is shown */}
        <View style={styles.backPlaceholder} />
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 90,
    paddingTop: Platform.OS === 'ios' ? 50 : 40,
    justifyContent: 'center',
    elevation: 4,
  },
  inner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  title: {
    fontSize: 24,
    fontFamily: 'Snell Roundhand', // swap if needed
    color: '#fff',
    letterSpacing: 1,
    textAlign: 'center',
    flex: 1,
  },
  backButton: {
    width: 40,
    alignItems: 'flex-start',
  },
  backArrow: {
    fontSize: 24,
    color: '#fff',
  },
  backPlaceholder: {
    width: 40,
  },
});