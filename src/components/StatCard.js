import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const StatCard = ({ title, value }) => {
  return (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>{title}</Text>
      <Text style={styles.cardValue}>{value}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  card: { 
    backgroundColor: '#fff', 
    width: '30%', 
    padding: 10, 
    borderRadius: 10, 
    elevation: 3, // Android gölgesi
    shadowColor: '#000', // iOS gölgesi
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    alignItems: 'center' 
  },
  cardTitle: { fontSize: 12, color: '#666', marginBottom: 5 },
  cardValue: { fontSize: 18, fontWeight: 'bold', color: '#2c3e50' },
});

export default StatCard;