// Dosya: App.js (Ana Giriş Noktası)
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import TabNavigator from './src/navigation/TabNavigator'; // Navigasyonu buradan çekiyoruz

export default function App() {
  return (
    <NavigationContainer>
      <TabNavigator />
    </NavigationContainer>
  );
}