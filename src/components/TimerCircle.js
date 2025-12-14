import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const TimerCircle = ({ seconds, distractionCount }) => {
  
  const formatTime = (secs) => {
    const mins = Math.floor(secs / 60);
    const s = secs % 60;
    return `${mins < 10 ? '0' : ''}${mins}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <View style={styles.container}>
      <Text style={styles.timerText}>{formatTime(seconds)}</Text>
      <Text style={styles.distractionText}>Odak Kaybı: {distractionCount}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: 200, height: 200, borderRadius: 100, borderWidth: 4, borderColor: '#4a90e2',
    justifyContent: 'center', alignItems: 'center',
    marginHorizontal: 10,
    backgroundColor: '#fff'
  },
  timerText: { fontSize: 48, fontWeight: 'bold', color: '#333' },
  distractionText: { fontSize: 13, color: 'red', marginTop: 8, fontWeight: 'bold' },
});

export default TimerCircle;