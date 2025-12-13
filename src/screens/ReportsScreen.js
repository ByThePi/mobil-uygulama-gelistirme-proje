import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions, RefreshControl } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { BarChart, PieChart } from 'react-native-chart-kit';
import { getSessions } from '../utils/storage';

const screenWidth = Dimensions.get('window').width;

export default function ReportsScreen() {
  const [sessions, setSessions] = useState([]);
  const [stats, setStats] = useState({
    todayFocus: 0,
    totalFocus: 0,
    totalDistractions: 0
  });
  const [refreshing, setRefreshing] = useState(false);

  // Ekran her odaklandığında verileri çek
  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

  const loadData = async () => {
    const data = await getSessions();
    setSessions(data);
    calculateStats(data);
  };

  const calculateStats = (data) => {
    const todayStr = new Date().toISOString().split('T')[0];
    
    let todayTotal = 0;
    let grandTotal = 0;
    let distractions = 0;

    data.forEach(item => {
      const itemDate = item.date.split('T')[0];
      grandTotal += item.duration;
      distractions += item.distractionCount;

      if (itemDate === todayStr) {
        todayTotal += item.duration;
      }
    });

    setStats({
      todayFocus: Math.floor(todayTotal / 60), // Dakikaya çevir
      totalFocus: Math.floor(grandTotal / 60),
      totalDistractions: distractions
    });
  };

  // GRAFİK VERİLERİ HAZIRLIĞI
  
  // 1. Pasta Grafik Verisi (Kategorilere Göre)
  const getPieData = () => {
    const categoryMap = {};
    sessions.forEach(s => {
      if (!categoryMap[s.category]) categoryMap[s.category] = 0;
      categoryMap[s.category] += Math.floor(s.duration / 60); // Dakika olarak
    });

    const colors = ['#f39c12', '#e74c3c', '#3498db', '#9b59b6', '#2ecc71'];
    return Object.keys(categoryMap).map((key, index) => ({
      name: key,
      population: categoryMap[key],
      color: colors[index % colors.length],
      legendFontColor: "#7F7F7F",
      legendFontSize: 12
    }));
  };

  // 2. Çubuk Grafik Verisi (Son 7 Gün)
  const getBarData = () => {
    const days = ["Paz", "Pzt", "Sal", "Çar", "Per", "Cum", "Cmt"];
    const last7Days = [];
    const values = [];

    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const dayName = days[d.getDay()];
      
      last7Days.push(dayName);
      
      // O günkü toplam süreyi bul
      const totalSeconds = sessions
        .filter(s => s.date.startsWith(dateStr))
        .reduce((sum, item) => sum + item.duration, 0);
      
      values.push(Math.floor(totalSeconds / 60)); // Dakika
    }

    return {
      labels: last7Days,
      datasets: [{ data: values }]
    };
  };

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={loadData} />}
    >
      <Text style={styles.header}>İstatistikler</Text>

      {/* ÖZET KARTLARI */}
      <View style={styles.statsContainer}>
        <View style={styles.card}>
            <Text style={styles.cardTitle}>Bugün</Text>
            <Text style={styles.cardValue}>{stats.todayFocus} dk</Text>
        </View>
        <View style={styles.card}>
            <Text style={styles.cardTitle}>Toplam</Text>
            <Text style={styles.cardValue}>{stats.totalFocus} dk</Text>
        </View>
        <View style={styles.card}>
            <Text style={styles.cardTitle}>Odak Kaybı</Text>
            <Text style={styles.cardValue}>{stats.totalDistractions}</Text>
        </View>
      </View>

      {/* GRAFİKLER */}
      <Text style={styles.chartTitle}>Son 7 Gün (Dakika)</Text>
      <BarChart
        data={getBarData()}
        width={screenWidth - 30}
        height={220}
        chartConfig={chartConfig}
        style={styles.chart}
        fromZero
      />

      <Text style={styles.chartTitle}>Kategori Dağılımı</Text>
      <PieChart
        data={getPieData()}
        width={screenWidth}
        height={220}
        chartConfig={chartConfig}
        accessor={"population"}
        backgroundColor={"transparent"}
        paddingLeft={"15"}
        absolute
      />
      
      <View style={{height: 50}} /> 
    </ScrollView>
  );
}

const chartConfig = {
  backgroundGradientFrom: "#fff",
  backgroundGradientTo: "#fff",
  color: (opacity = 1) => `rgba(0, 122, 255, ${opacity})`,
  strokeWidth: 2,
  barPercentage: 0.7,
  decimalPlaces: 0,
  labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5', paddingTop: 50, paddingHorizontal: 15 },
  header: { fontSize: 28, fontWeight: 'bold', marginBottom: 20, color: '#333' },
  
  statsContainer: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 25 },
  card: { 
    backgroundColor: '#fff', width: '30%', padding: 10, borderRadius: 10, 
    elevation: 3, alignItems: 'center' 
  },
  cardTitle: { fontSize: 12, color: '#666', marginBottom: 5 },
  cardValue: { fontSize: 18, fontWeight: 'bold', color: '#2c3e50' },

  chartTitle: { fontSize: 18, fontWeight: 'bold', marginTop: 10, marginBottom: 10, color: '#444' },
  chart: { marginVertical: 8, borderRadius: 16 }
});