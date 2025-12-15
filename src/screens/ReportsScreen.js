import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions, RefreshControl, TouchableOpacity, Alert } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { BarChart, PieChart } from 'react-native-chart-kit';
import { getSessions, clearSessions } from '../utils/storage';
import StatCard from '../components/StatCard';

const screenWidth = Dimensions.get('window').width;

export default function ReportsScreen() {
  const [sessions, setSessions] = useState([]);
  const [stats, setStats] = useState({ todayFocus: 0, totalFocus: 0, totalDistractions: 0 });
  const [refreshing, setRefreshing] = useState(false);

  useFocusEffect(useCallback(() => { loadData(); }, []));

  const loadData = async () => {
    const data = await getSessions();
    setSessions(data);
    calculateStats(data);
  };

  const calculateStats = (data) => {
    const todayStr = new Date().toISOString().split('T')[0];
    let todayTotal = 0, grandTotal = 0, distractions = 0;

    data.forEach(item => {
      grandTotal += item.duration;
      distractions += item.distractionCount;
      if (item.date.startsWith(todayStr)) todayTotal += item.duration;
    });

    setStats({
      todayFocus: Math.floor(todayTotal / 60),
      totalFocus: Math.floor(grandTotal / 60),
      totalDistractions: distractions
    });
  };

  const handleResetData = () => {
    Alert.alert("Verileri Sıfırla", "Emin misiniz?", [
      { text: "Vazgeç", style: "cancel" },
      { text: "Sil", style: 'destructive', onPress: async () => { await clearSessions(); await loadData(); } }
    ]);
  };

  const getPieData = () => {
      const categoryMap = {};
      sessions.forEach(s => {
        if (!categoryMap[s.category]) categoryMap[s.category] = 0;
        categoryMap[s.category] += Math.floor(s.duration / 60);
      });
      if (Object.keys(categoryMap).length === 0) {
         return [{ name: "Veri Yok", population: 100, color: "#e0e0e0", legendFontColor: "#7F7F7F", legendFontSize: 12 }];
      }
      const colors = ['#f39c12', '#e74c3c', '#3498db', '#9b59b6', '#2ecc71', '#95a5a6'];
      return Object.keys(categoryMap).map((key, index) => ({
        name: key, population: categoryMap[key], color: colors[index % colors.length], legendFontColor: "#7F7F7F", legendFontSize: 12
      }));
  };

  const getBarData = () => {
     const days = ["Paz", "Pzt", "Sal", "Çar", "Per", "Cum", "Cmt"];
     const last7Days = [], values = [];
     for (let i = 6; i >= 0; i--) {
       const d = new Date(); d.setDate(d.getDate() - i);
       const dateStr = d.toISOString().split('T')[0];
       last7Days.push(days[d.getDay()]);
       const totalSeconds = sessions.filter(s => s.date.startsWith(dateStr)).reduce((sum, item) => sum + item.duration, 0);
       values.push(Math.floor(totalSeconds / 60));
     }
     return { labels: last7Days, datasets: [{ data: values }] };
  };

  return (
    <ScrollView style={styles.container} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={loadData} />}>
      <Text style={styles.header}>İstatistikler</Text>

      {/* BİLEŞEN KULLANIMI: Tekrar eden View'lar yerine StatCard */}
      <View style={styles.statsContainer}>
        <StatCard title="Bugün" value={`${stats.todayFocus} dk`} />
        <StatCard title="Toplam" value={`${stats.totalFocus} dk`} />
        <StatCard title="Odak Kaybı" value={stats.totalDistractions} />
      </View>

      <Text style={styles.chartTitle}>Son 7 Gün (Dakika)</Text>
      <BarChart data={getBarData()} width={screenWidth - 30} height={220} chartConfig={chartConfig} style={styles.chart} fromZero />

      <Text style={styles.chartTitle}>Kategori Dağılımı</Text>
      <PieChart data={getPieData()} width={screenWidth} height={220} chartConfig={chartConfig} accessor={"population"} backgroundColor={"transparent"} paddingLeft={"15"} absolute />

      <TouchableOpacity style={styles.resetButton} onPress={handleResetData}>
        <Text style={styles.resetButtonText}>Tüm Verileri Sıfırla</Text>
      </TouchableOpacity>
      <View style={{height: 50}} /> 
    </ScrollView>
  );
}

const chartConfig = {
  backgroundGradientFrom: "#fff",
  backgroundGradientTo: "#fff",
  color: (opacity = 1) => `rgba(0, 122, 255, ${opacity})`,
  strokeWidth: 2, barPercentage: 0.7, decimalPlaces: 0, labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5', paddingTop: 50, paddingHorizontal: 15 },
  header: { fontSize: 28, fontWeight: 'bold', marginBottom: 20, color: '#333' },
  statsContainer: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 25 },
  chartTitle: { fontSize: 18, fontWeight: 'bold', marginTop: 10, marginBottom: 10, color: '#444' },
  chart: { marginVertical: 8, borderRadius: 16 },
  resetButton: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#e74c3c', padding: 15, borderRadius: 10, alignItems: 'center', marginTop: 20, marginBottom: 30 },
  resetButtonText: { color: '#e74c3c', fontWeight: 'bold', fontSize: 16 }
});