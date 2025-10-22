import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  RefreshControl,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import DataService from '../../services/DataService';

export default function UserAppointmentsScreen({ navigation }) {
  const [appointments, setAppointments] = useState([]);
  const [filter, setFilter] = useState('upcoming');
  const [refreshing, setRefreshing] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    loadData();
  }, [filter]);

  const loadData = async () => {
    const currentUser = await DataService.getCurrentUser();
    setUser(currentUser);
    await loadAppointments(currentUser.id);
  };

  const loadAppointments = async (userId) => {
    const allAppointments = await DataService.getAppointmentsByUser(userId);
    
    const now = new Date();
    let filtered = allAppointments;

    if (filter === 'upcoming') {
      filtered = allAppointments.filter(apt => {
        const aptDate = new Date(apt.date + 'T' + apt.time);
        return aptDate > now && apt.status !== 'cancelled';
      }).sort((a, b) => {
        const dateA = new Date(a.date + 'T' + a.time);
        const dateB = new Date(b.date + 'T' + b.time);
        return dateA - dateB;
      });
    } else if (filter === 'past') {
      filtered = allAppointments.filter(apt => {
        const aptDate = new Date(apt.date + 'T' + apt.time);
        return aptDate <= now;
      }).sort((a, b) => {
        const dateA = new Date(a.date + 'T' + a.time);
        const dateB = new Date(b.date + 'T' + b.time);
        return dateB - dateA;
      });
    } else if (filter === 'cancelled') {
      filtered = allAppointments.filter(apt => apt.status === 'cancelled');
    }

    setAppointments(filtered);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const handleCancel = async (appointment) => {
    Alert.alert(
      'Annuler le rendez-vous',
      `Voulez-vous vraiment annuler votre rendez-vous avec ${appointment.employeeName} le ${formatDate(appointment.date)} à ${appointment.time} ?`,
      [
        { text: 'Non', style: 'cancel' },
        {
          text: 'Oui, annuler',
          style: 'destructive',
          onPress: async () => {
            const result = await DataService.cancelAppointment(appointment.id);
            if (result.success) {
              Alert.alert('Succès', 'Rendez-vous annulé avec succès');
              loadData();
            } else {
              Alert.alert('Erreur', result.message);
            }
          },
        },
      ]
    );
  };

  const showDetails = (appointment) => {
    setSelectedAppointment(appointment);
    setModalVisible(true);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed': return '#4caf50';
      case 'pending': return '#ff9800';
      case 'cancelled': return '#f44336';
      case 'completed': return '#2196f3';
      default: return '#999';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'confirmed': return 'Confirmé';
      case 'pending': return 'En attente';
      case 'cancelled': return 'Annulé';
      case 'completed': return 'Terminé';
      default: return status;
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'confirmed': return 'checkmark-circle';
      case 'pending': return 'time';
      case 'cancelled': return 'close-circle';
      case 'completed': return 'checkmark-done-circle';
      default: return 'help-circle';
    }
  };

  const renderAppointment = ({ item }) => (
    <TouchableOpacity
      style={styles.appointmentCard}
      onPress={() => showDetails(item)}
    >
      <View style={styles.cardHeader}>
        <View style={styles.companyInfo}>
          <Text style={styles.companyName}>{item.companyName}</Text>
          <Text style={styles.serviceName}>{item.serviceName}</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
          <Ionicons name={getStatusIcon(item.status)} size={16} color="white" />
          <Text style={styles.statusText}>{getStatusText(item.status)}</Text>
        </View>
      </View>

      <View style={styles.appointmentDetails}>
        <View style={styles.detailRow}>
          <Ionicons name="person" size={18} color="#666" />
          <Text style={styles.detailText}>{item.employeeName}</Text>
        </View>
        <View style={styles.detailRow}>
          <Ionicons name="calendar-outline" size={18} color="#666" />
          <Text style={styles.detailText}>{formatDate(item.date)}</Text>
        </View>
        <View style={styles.detailRow}>
          <Ionicons name="time-outline" size={18} color="#666" />
          <Text style={styles.detailText}>{item.time}</Text>
        </View>
      </View>

      {item.status !== 'cancelled' && item.status !== 'completed' && (
        <View style={styles.cardActions}>
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={() => handleCancel(item)}
          >
            <Ionicons name="close-circle-outline" size={18} color="#f44336" />
            <Text style={styles.cancelButtonText}>Annuler</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.detailsButton}>
            <Text style={styles.detailsButtonText}>Voir détails</Text>
            <Ionicons name="chevron-forward" size={18} color="#6200ee" />
          </TouchableOpacity>
        </View>
      )}
    </TouchableOpacity>
  );

  const renderEmptyList = () => (
    <View style={styles.emptyState}>
      <Ionicons name="calendar-outline" size={80} color="#ccc" />
      <Text style={styles.emptyStateTitle}>
        {filter === 'upcoming' && 'Aucun rendez-vous à venir'}
        {filter === 'past' && 'Aucun rendez-vous passé'}
        {filter === 'cancelled' && 'Aucun rendez-vous annulé'}
      </Text>
      <Text style={styles.emptyStateText}>
        {filter === 'upcoming' && 'Réservez votre premier rendez-vous'}
      </Text>
      {filter === 'upcoming' && (
        <TouchableOpacity
          style={styles.bookButton}
          onPress={() => navigation.navigate('Recherche')}
        >
          <Ionicons name="add-circle" size={20} color="white" />
          <Text style={styles.bookButtonText}>Prendre un rendez-vous</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Mes Rendez-vous</Text>
      </View>

      <View style={styles.filtersContainer}>
        <TouchableOpacity
          style={[styles.filterChip, filter === 'upcoming' && styles.filterChipActive]}
          onPress={() => setFilter('upcoming')}
        >
          <Ionicons
            name="calendar"
            size={18}
            color={filter === 'upcoming' ? 'white' : '#666'}
          />
          <Text style={[styles.filterText, filter === 'upcoming' && styles.filterTextActive]}>
            À venir
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.filterChip, filter === 'past' && styles.filterChipActive]}
          onPress={() => setFilter('past')}
        >
          <Ionicons
            name="checkmark-done"
            size={18}
            color={filter === 'past' ? 'white' : '#666'}
          />
          <Text style={[styles.filterText, filter === 'past' && styles.filterTextActive]}>
            Passés
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.filterChip, filter === 'cancelled' && styles.filterChipActive]}
          onPress={() => setFilter('cancelled')}
        >
          <Ionicons
            name="close-circle"
            size={18}
            color={filter === 'cancelled' ? 'white' : '#666'}
          />
          <Text style={[styles.filterText, filter === 'cancelled' && styles.filterTextActive]}>
            Annulés
          </Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={appointments}
        keyExtractor={(item) => item.id}
        renderItem={renderAppointment}
        contentContainerStyle={styles.list}
        ListEmptyComponent={renderEmptyList}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      />

      {/* Modal détails */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {selectedAppointment && (
              <>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>Détails du rendez-vous</Text>
                  <TouchableOpacity onPress={() => setModalVisible(false)}>
                    <Ionicons name="close" size={28} color="#333" />
                  </TouchableOpacity>
                </View>

                <View style={styles.modalBody}>
                  <View style={styles.modalSection}>
                    <Text style={styles.modalLabel}>Entreprise</Text>
                    <Text style={styles.modalValue}>{selectedAppointment.companyName}</Text>
                  </View>

                  <View style={styles.modalSection}>
                    <Text style={styles.modalLabel}>Service</Text>
                    <Text style={styles.modalValue}>{selectedAppointment.serviceName}</Text>
                  </View>

                  <View style={styles.modalSection}>
                    <Text style={styles.modalLabel}>Praticien</Text>
                    <Text style={styles.modalValue}>{selectedAppointment.employeeName}</Text>
                  </View>

                  <View style={styles.modalSection}>
                    <Text style={styles.modalLabel}>Date</Text>
                    <Text style={styles.modalValue}>{formatDate(selectedAppointment.date)}</Text>
                  </View>

                  <View style={styles.modalSection}>
                    <Text style={styles.modalLabel}>Heure</Text>
                    <Text style={styles.modalValue}>{selectedAppointment.time}</Text>
                  </View>

                  <View style={styles.modalSection}>
                    <Text style={styles.modalLabel}>Statut</Text>
                    <View style={[styles.statusBadge, { backgroundColor: getStatusColor(selectedAppointment.status) }]}>
                      <Ionicons name={getStatusIcon(selectedAppointment.status)} size={16} color="white" />
                      <Text style={styles.statusText}>{getStatusText(selectedAppointment.status)}</Text>
                    </View>
                  </View>

                  {selectedAppointment.notes && (
                    <View style={styles.modalSection}>
                      <Text style={styles.modalLabel}>Notes</Text>
                      <Text style={styles.modalValue}>{selectedAppointment.notes}</Text>
                    </View>
                  )}
                </View>

                {selectedAppointment.status !== 'cancelled' && selectedAppointment.status !== 'completed' && (
                  <View style={styles.modalActions}>
                    <TouchableOpacity
                      style={styles.modalCancelButton}
                      onPress={() => {
                        setModalVisible(false);
                        handleCancel(selectedAppointment);
                      }}
                    >
                      <Text style={styles.modalCancelButtonText}>Annuler le RDV</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: 'white',
    padding: 20,
    paddingTop: 60,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  filtersContainer: {
    flexDirection: 'row',
    padding: 16,
    gap: 8,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  filterChip: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#f5f5f5',
  },
  filterChipActive: {
    backgroundColor: '#6200ee',
  },
  filterText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '600',
  },
  filterTextActive: {
    color: 'white',
  },
  list: {
    padding: 16,
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
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  companyInfo: {
    flex: 1,
  },
  companyName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  serviceName: {
    fontSize: 14,
    color: '#6200ee',
    fontWeight: '600',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
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
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  detailText: {
    fontSize: 14,
    color: '#666',
  },
  cardActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  cancelButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  cancelButtonText: {
    color: '#f44336',
    fontSize: 14,
    fontWeight: '600',
  },
  detailsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  detailsButtonText: {
    color: '#6200ee',
    fontSize: 14,
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#999',
    marginTop: 20,
  },
  emptyStateText: {
    fontSize: 14,
    color: '#999',
    marginTop: 8,
  },
  bookButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#6200ee',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 20,
  },
  bookButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 40,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  modalBody: {
    padding: 20,
  },
  modalSection: {
    marginBottom: 16,
  },
  modalLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
    textTransform: 'uppercase',
    fontWeight: '600',
  },
  modalValue: {
    fontSize: 16,
    color: '#333',
  },
  modalActions: {
    padding: 20,
    paddingTop: 0,
  },
  modalCancelButton: {
    backgroundColor: '#f44336',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  modalCancelButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
