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

export default function EmployeeHomeScreen({ navigation }) {
  const [user, setUser] = useState(null);
  const [todayAppointments, setTodayAppointments] = useState([]);
  const [stats, setStats] = useState({
    today: 0,
    pending: 0,
    confirmed: 0,
    thisWeek: 0,
  });
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const currentUser = await DataService.getCurrentUser();
    setUser(currentUser);

    const appointments = await DataService.getAppointmentsByEmployee(currentUser.id);
    
    // Rendez-vous d'aujourd'hui
    const today = new Date().toISOString().split('T')[0];
    const todayAppts = appointments.filter(apt => apt.date === today && apt.status !== 'cancelled');
    setTodayAppointments(todayAppts.sort((a, b) => a.time.localeCompare(b.time)));

    // Statistiques
    const thisWeekStart = new Date();
    thisWeekStart.setDate(thisWeekStart.getDate() - thisWeekStart.getDay());
    const thisWeekEnd = new Date(thisWeekStart);
    thisWeekEnd.setDate(thisWeekEnd.getDate() + 7);

    const thisWeekAppts = appointments.filter(apt => {
      const aptDate = new Date(apt.date);
      return aptDate >= thisWeekStart && aptDate < thisWeekEnd && apt.status !== 'cancelled';
    });

    setStats({
      today: todayAppts.length,
      pending: appointments.filter(apt => apt.status === 'pending').length,
      confirmed: appointments.filter(apt => apt.status === 'confirmed').length,
      thisWeek: thisWeekAppts.length,
    });
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const formatTime = (time) => {
    return time;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed': return '#4caf50';
      case 'pending': return '#ff9800';
      case 'cancelled': return '#f44336';
      default: return '#999';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'confirmed': return 'Confirmé';
      case 'pending': return 'En attente';
      case 'cancelled': return 'Annulé';
      default: return status;
    }
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
          <Text style={styles.userName}>{user?.name || 'Employé'}</Text>
          {user?.specialty && (
            <Text style={styles.userSpecialty}>{user.specialty}</Text>
          )}
        </View>
        <TouchableOpacity style={styles.notificationButton}>
          <Ionicons name="notifications-outline" size={28} color="#03dac6" />
          <View style={styles.notificationBadge}>
            <Text style={styles.notificationText}>{stats.pending}</Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* Statistiques */}
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <View style={styles.statIconContainer}>
            <Ionicons name="calendar-outline" size={28} color="#03dac6" />
          </View>
          <Text style={styles.statValue}>{stats.today}</Text>
          <Text style={styles.statLabel}>Aujourd'hui</Text>
        </View>

        <View style={styles.statCard}>
          <View style={styles.statIconContainer}>
            <Ionicons name="time-outline" size={28} color="#ff9800" />
          </View>
          <Text style={styles.statValue}>{stats.pending}</Text>
          <Text style={styles.statLabel}>En attente</Text>
        </View>

        <View style={styles.statCard}>
          <View style={styles.statIconContainer}>
            <Ionicons name="checkmark-circle-outline" size={28} color="#4caf50" />
          </View>
          <Text style={styles.statValue}>{stats.confirmed}</Text>
          <Text style={styles.statLabel}>Confirmés</Text>
        </View>

        <View style={styles.statCard}>
          <View style={styles.statIconContainer}>
            <Ionicons name="trending-up-outline" size={28} color="#2196f3" />
          </View>
          <Text style={styles.statValue}>{stats.thisWeek}</Text>
          <Text style={styles.statLabel}>Cette semaine</Text>
        </View>
      </View>

      {/* Actions rapides */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Actions rapides</Text>
        <View style={styles.actionsGrid}>
          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => navigation.navigate('RDV')}
          >
            <View style={styles.actionIcon}>
              <Ionicons name="list" size={32} color="#03dac6" />
            </View>
            <Text style={styles.actionTitle}>Mes RDV</Text>
            <Text style={styles.actionSubtitle}>Gérer les rendez-vous</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => navigation.navigate('Calendrier')}
          >
            <View style={styles.actionIcon}>
              <Ionicons name="calendar" size={32} color="#ff9800" />
            </View>
            <Text style={styles.actionTitle}>Calendrier</Text>
            <Text style={styles.actionSubtitle}>Disponibilités</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Rendez-vous du jour */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Rendez-vous aujourd'hui</Text>
          <TouchableOpacity onPress={() => navigation.navigate('RDV')}>
            <Text style={styles.seeAll}>Tout voir</Text>
          </TouchableOpacity>
        </View>

        {todayAppointments.length > 0 ? (
          todayAppointments.map((appointment) => (
            <TouchableOpacity
              key={appointment.id}
              style={styles.appointmentCard}
              onPress={() => navigation.navigate('RDV')}
            >
              <View style={styles.appointmentTime}>
                <Ionicons name="time" size={24} color="#03dac6" />
                <Text style={styles.timeText}>{formatTime(appointment.time)}</Text>
              </View>

              <View style={styles.appointmentInfo}>
                <Text style={styles.patientName}>{appointment.userName}</Text>
                <Text style={styles.serviceName}>{appointment.serviceName}</Text>
                {appointment.notes && (
                  <Text style={styles.notes} numberOfLines={1}>
                    📝 {appointment.notes}
                  </Text>
                )}
              </View>

              <View
                style={[
                  styles.statusIndicator,
                  { backgroundColor: getStatusColor(appointment.status) },
                ]}
              >
                <Text style={styles.statusIndicatorText}>
                  {getStatusText(appointment.status)}
                </Text>
              </View>
            </TouchableOpacity>
          ))
        ) : (
          <View style={styles.emptyState}>
            <Ionicons name="checkmark-done-circle-outline" size={48} color="#4caf50" />
            <Text style={styles.emptyStateText}>Aucun rendez-vous aujourd'hui</Text>
            <Text style={styles.emptyStateSubtext}>Profitez de votre journée ! 😊</Text>
          </View>
        )}
      </View>

      {/* Conseils */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Rappels</Text>
        <View style={styles.tipCard}>
          <Ionicons name="bulb-outline" size={24} color="#ff9800" />
          <View style={styles.tipContent}>
            <Text style={styles.tipTitle}>Gardez votre calendrier à jour</Text>
            <Text style={styles.tipText}>
              Définissez vos disponibilités pour permettre aux patients de réserver facilement.
            </Text>
          </View>
        </View>

        {stats.pending > 0 && (
          <View style={[styles.tipCard, { backgroundColor: '#fff3e0' }]}>
            <Ionicons name="alert-circle-outline" size={24} color="#ff9800" />
            <View style={styles.tipContent}>
              <Text style={styles.tipTitle}>Rendez-vous en attente</Text>
              <Text style={styles.tipText}>
                Vous avez {stats.pending} rendez-vous en attente de confirmation.
              </Text>
            </View>
          </View>
        )}
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
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
  userSpecialty: {
    fontSize: 14,
    color: '#03dac6',
    marginTop: 4,
    fontWeight: '600',
  },
  notificationButton: {
    position: 'relative',
  },
  notificationBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#ff9800',
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
  statsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 16,
    gap: 12,
  },
  statCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  statValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  section: {
    padding: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  seeAll: {
    fontSize: 14,
    color: '#03dac6',
    fontWeight: '600',
  },
  actionsGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  actionCard: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  actionIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
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
  appointmentCard: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  appointmentTime: {
    alignItems: 'center',
    marginRight: 16,
    paddingRight: 16,
    borderRightWidth: 1,
    borderRightColor: '#f0f0f0',
  },
  timeText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 4,
  },
  appointmentInfo: {
    flex: 1,
  },
  patientName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  serviceName: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  notes: {
    fontSize: 12,
    color: '#999',
    fontStyle: 'italic',
  },
  statusIndicator: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusIndicatorText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  emptyState: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 40,
    alignItems: 'center',
  },
  emptyStateText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4caf50',
    marginTop: 12,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#999',
    marginTop: 4,
  },
  tipCard: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  tipContent: {
    flex: 1,
    marginLeft: 12,
  },
  tipTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  tipText: {
    fontSize: 13,
    color: '#666',
    lineHeight: 18,
  },
});
