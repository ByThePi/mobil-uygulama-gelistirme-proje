import AsyncStorage from '@react-native-async-storage/async-storage';


const STORAGE_KEY = '@focus_sessions';


export const saveSession = async (sessionData) => {
  try {
    
    const existingData = await getSessions();
    
    const newData = [...existingData, sessionData];
    
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newData));
    console.log("Seans kaydedildi:", sessionData);
  } catch (e) {
    console.error("Kaydetme hatası:", e);
  }
};


export const getSessions = async () => {
  try {
    const jsonValue = await AsyncStorage.getItem(STORAGE_KEY);
    return jsonValue != null ? JSON.parse(jsonValue) : [];
  } catch (e) {
    console.error("Okuma hatası:", e);
    return [];
  }
};


export const clearSessions = async () => {
  try {
    await AsyncStorage.removeItem(STORAGE_KEY);
  } catch(e) {
    console.error(e);
  }
};