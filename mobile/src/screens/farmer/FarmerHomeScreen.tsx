import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export const FarmerHomeScreen = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Farmer Dashboard</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 20, fontWeight: 'bold' },
});

