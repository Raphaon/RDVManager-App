import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import DataService from '../../services/DataService';

export default function UserHomeScreen({ navigation }) {
  const [user, setUser] = useState(null);
  const [upcomingAppointments, setUpcomingAppointments] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const currentUser = await DataService.getCurrentUser();
    setUser(currentUser);

    if (currentUser) {
      const appointments = await DataService.getAppointmentsByUser(currentUser.id);
      
      // Filtrer les rendez-vous à venir
      const now = new Date();
      const upcoming = appointments
        .filter(apt => {
          const aptDate = new Date(apt.date + 'T' + apt.time);
          return aptDate > now && apt.status !== 'cancelled';
        })
        .sort((a, b) => {
          const dateA = new Date(a.date + 'T' + a.time);
          const dateB = new Date(b.date + 'T' + b.time);
          return dateA - dateB;
        })
        .slice(0, 3);

      setUpcomingAppointments(upcoming);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed':
        return '#4caf50';
      case 'pending':
        return '#ff9800';
      case 'cancelled':
        return '#f44336';
      default:
        return '#999';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'confirmed':
        return 'Confirmé';
      case 'pending':
        return 'En attente';
      case 'cancelled':
        return 'Annulé';
      default:
        return status;
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const options = { weekday: 'long', day: 'numeric', month: 'long' };
    return date.toLocaleDateString('fr-FR', options);
  };

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Bonjour,</Text>
          <Text style={styles.userName}>{user?.name || 'Utilisateur'}</Text>
        </View>
        <TouchableOpacity style={styles.notificationButton}>
          <Ionicons name="notifications-outline" size={28} color="#6200ee" />
          <View style={styles.notificationBadge}>
            <Text style={styles.notificationText}>2</Text>
          </View>
        </TouchableOpacity>
      </View>

      <View style={styles.quickActions}>
        <TouchableOpacity
          style={styles.actionCard}
          onPress={() => navigation.navigate('Recherche')}
        >
          <View style={styles.actionIconContainer}>
            <Ionicons name="search" size={32} color="#6200ee" />
          </View>
          <Text style={styles.actionTitle}>Rechercher</Text>
          <Text style={styles.actionSubtitle}>Trouvez un service</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionCard}
          onPress={() => navigation.navigate('Mes RDV')}
        >
          <View style={styles.actionIconContainer}>
            <Ionicons name="calendar" size={32} color="#03dac6" />
          </View>
          <Text style={styles.actionTitle}>Mes RDV</Text>
          <Text style={styles.actionSubtitle}>Gérer vos rendez-vous</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Prochains rendez-vous</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Mes RDV')}>
            <Text style={styles.seeAll}>Voir tout</Text>
          </TouchableOpacity>
        </View>

        {upcomingAppointments.length > 0 ? (
          upcomingAppointments.map((appointment) => (
            <TouchableOpacity
              key={appointment.id}
              style={styles.appointmentCard}
              onPress={() => navigation.navigate('Mes RDV')}
            >
              <View style={styles.appointmentHeader}>
                <View>
                  <Text style={styles.appointmentCompany}>{appointment.companyName}</Text>
                  <Text style={styles.appointmentService}>{appointment.serviceName}</Text>
                </View>
                <View
                  style={[
                    styles.statusBadge,
                    { backgroundColor: getStatusColor(appointment.status) },
                  ]}
                >
                  <Text style={styles.statusText}>{getStatusText(appointment.status)}</Text>
                </View>
              </View>

              <View style={styles.appointmentDetails}>
                <View style={styles.appointmentInfo}>
                  <Ionicons name="person" size={16} color="#666" />
                  <Text style={styles.appointmentText}>{appointment.employeeName}</Text>
                </View>
                <View style={styles.appointmentInfo}>
                  <Ionicons name="calendar-outline" size={16} color="#666" />
                  <Text style={styles.appointmentText}>{formatDate(appointment.date)}</Text>
                </View>
                <View style={styles.appointmentInfo}>
                  <Ionicons name="time-outline" size={16} color="#666" />
                  <Text style={styles.appointmentText}>{appointment.time}</Text>
                </View>
              </View>
            </TouchableOpacity>
          ))
        ) : (
          <View style={styles.emptyState}>
            <Ionicons name="calendar-outline" size={64} color="#ccc" />
            <Text style={styles.emptyStateText}>Aucun rendez-vous à venir</Text>
            <TouchableOpacity
              style={styles.emptyStateButton}
              onPress={() => navigation.navigate('Recherche')}
            >
              <Text style={styles.emptyStateButtonText}>Prendre un rendez-vous</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Catégories populaires</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <TouchableOpacity style={styles.categoryCard}>
            <Ionicons name="medical" size={40} color="#e91e63" />
            <Text style={styles.categoryText}>Santé</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.categoryCard}>
            <Ionicons name="cut" size={40} color="#9c27b0" />
            <Text style={styles.categoryText}>Beauté</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.categoryCard}>
            <Ionicons name="fitness" size={40} color="#3f51b5" />
            <Text style={styles.categoryText}>Sport</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.categoryCard}>
            <Ionicons name="business" size={40} color="#009688" />
            <Text style={styles.categoryText}>Services</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 60,
    backgroundColor: 'white',
  },
  greeting: {
    fontSize: 16,
    color: '#666',
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 4,
  },
  notificationButton: {
    position: 'relative',
  },
  notificationBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#f44336',
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notificationText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  quickActions: {
    flexDirection: 'row',
    padding: 20,
    gap: 12,
  },
  actionCard: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  actionIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  actionSubtitle: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  section: {
    padding: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  seeAll: {
    color: '#6200ee',
    fontSize: 14,
    fontWeight: '600',
  },
  appointmentCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  appointmentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  appointmentCompany: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  appointmentService: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  appointmentDetails: {
    gap: 8,
  },
  appointmentInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  appointmentText: {
    fontSize: 14,
    color: '#666',
  },
  emptyState: {
    alignItems: 'center',
    padding: 40,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#999',
    marginTop: 16,
    marginBottom: 20,
  },
  emptyStateButton: {
    backgroundColor: '#6200ee',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  emptyStateButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  categoryCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    marginRight: 12,
    alignItems: 'center',
    minWidth: 100,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  categoryText: {
    fontSize: 14,
    color: '#333',
    marginTop: 8,
    fontWeight: '600',
  },
});
