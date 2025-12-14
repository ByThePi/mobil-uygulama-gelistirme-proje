import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

const CategorySelector = ({ categories, selectedCategory, onSelect, disabled }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.subHeader}>Kategori Seç:</Text>
      <View style={styles.list}>
        {categories.map((cat) => (
          <TouchableOpacity
            key={cat}
            style={[
              styles.button,
              selectedCategory === cat && styles.selectedButton
            ]}
            onPress={() => !disabled && onSelect(cat)}
            activeOpacity={0.7}
          >
            <Text style={[
              styles.text,
              selectedCategory === cat && styles.selectedText
            ]}>{cat}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { width: '90%', marginBottom: 30 },
  subHeader: { fontSize: 16, marginBottom: 10, color: '#666', textAlign: 'center' },
  list: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center' },
  button: {
    paddingVertical: 8, paddingHorizontal: 16, borderRadius: 20,
    backgroundColor: '#f0f0f0', margin: 5, borderWidth: 1, borderColor: '#ddd'
  },
  selectedButton: { backgroundColor: '#4a90e2', borderColor: '#4a90e2' },
  text: { color: '#333' },
  selectedText: { color: '#fff', fontWeight: 'bold' },
});

export default CategorySelector;