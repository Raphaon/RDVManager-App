import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import DataService from '../../services/DataService';

export default function AdminHomeScreen({ navigation }) {
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState({ companies: 0, services: 0, employees: 0, appointments: 0 });
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const currentUser = await DataService.getCurrentUser();
    setUser(currentUser);

    const companies = await DataService.getCompanies();
    const services = await DataService.getServices();
    const users = await DataService.getUsers();
    const employees = users.filter(u => u.role === 'employee');
    const appointments = await DataService.getAppointments();

    setStats({
      companies: companies.length,
      services: services.length,
      employees: employees.length,
      appointments: appointments.length,
    });
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  return (
    <ScrollView style={styles.container} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Tableau de bord</Text>
          <Text style={styles.userName}>{user?.name}</Text>
        </View>
        <Ionicons name="settings-outline" size={28} color="#cf6679" />
      </View>

      <View style={styles.statsContainer}>
        {[
          { label: 'Entreprises', value: stats.companies, icon: 'business', color: '#6200ee' },
          { label: 'Services', value: stats.services, icon: 'list', color: '#03dac6' },
          { label: 'Employés', value: stats.employees, icon: 'people', color: '#ff9800' },
          { label: 'Rendez-vous', value: stats.appointments, icon: 'calendar', color: '#4caf50' },
        ].map((stat, i) => (
          <View key={i} style={styles.statCard}>
            <View style={[styles.statIcon, { backgroundColor: stat.color + '20' }]}>
              <Ionicons name={stat.icon} size={28} color={stat.color} />
            </View>
            <Text style={styles.statValue}>{stat.value}</Text>
            <Text style={styles.statLabel}>{stat.label}</Text>
          </View>
        ))}
      </View>

      <View style={styles.actionsContainer}>
        <Text style={styles.sectionTitle}>Actions rapides</Text>
        {[
          { label: "Gérer l'entreprise", icon: 'business', screen: 'Entreprise', color: '#6200ee' },
          { label: 'Gérer les services', icon: 'list', screen: 'Services', color: '#03dac6' },
          { label: 'Gérer les employés', icon: 'people', screen: 'Employés', color: '#ff9800' },
        ].map((action, i) => (
          <TouchableOpacity key={i} style={styles.actionCard} onPress={() => navigation.navigate(action.screen)}>
            <View style={[styles.actionIcon, { backgroundColor: action.color }]}>
              <Ionicons name={action.icon} size={24} color="white" />
            </View>
            <Text style={styles.actionLabel}>{action.label}</Text>
            <Ionicons name="chevron-forward" size={20} color="#999" />
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, paddingTop: 60, backgroundColor: 'white' },
  greeting: { fontSize: 16, color: '#666' },
  userName: { fontSize: 24, fontWeight: 'bold', color: '#333', marginTop: 4 },
  statsContainer: { flexDirection: 'row', flexWrap: 'wrap', padding: 16, gap: 12 },
  statCard: { flex: 1, minWidth: '45%', backgroundColor: 'white', borderRadius: 12, padding: 16, alignItems: 'center' },
  statIcon: { width: 56, height: 56, borderRadius: 28, justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  statValue: { fontSize: 28, fontWeight: 'bold', color: '#333' },
  statLabel: { fontSize: 12, color: '#666', marginTop: 4 },
  actionsContainer: { padding: 16 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#333', marginBottom: 16 },
  actionCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'white', borderRadius: 12, padding: 16, marginBottom: 12 },
  actionIcon: { width: 48, height: 48, borderRadius: 24, justifyContent: 'center', alignItems: 'center', marginRight: 16 },
  actionLabel: { flex: 1, fontSize: 16, fontWeight: '600', color: '#333' },
});
