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
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import DataService from '../../services/DataService';

export default function EmployeeAppointmentsScreen({ navigation }) {
  const [appointments, setAppointments] = useState([]);
  const [filter, setFilter] = useState('today');
  const [refreshing, setRefreshing] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [messageModalVisible, setMessageModalVisible] = useState(false);
  const [message, setMessage] = useState('');
  const [user, setUser] = useState(null);

  useEffect(() => {
    loadData();
  }, [filter]);

  const loadData = async () => {
    const currentUser = await DataService.getCurrentUser();
    setUser(currentUser);
    await loadAppointments(currentUser.id);
  };

  const loadAppointments = async (employeeId) => {
    const allAppointments = await DataService.getAppointmentsByEmployee(employeeId);
    
    const today = new Date().toISOString().split('T')[0];
    const now = new Date();
    let filtered = allAppointments;

    if (filter === 'today') {
      filtered = allAppointments.filter(apt => 
        apt.date === today && apt.status !== 'cancelled'
      ).sort((a, b) => a.time.localeCompare(b.time));
    } else if (filter === 'upcoming') {
      filtered = allAppointments.filter(apt => {
        const aptDate = new Date(apt.date + 'T' + apt.time);
        return aptDate > now && apt.status !== 'cancelled';
      }).sort((a, b) => {
        const dateA = new Date(a.date + 'T' + a.time);
        const dateB = new Date(b.date + 'T' + b.time);
        return dateA - dateB;
      });
    } else if (filter === 'pending') {
      filtered = allAppointments.filter(apt => apt.status === 'pending');
    } else if (filter === 'past') {
      filtered = allAppointments.filter(apt => {
        const aptDate = new Date(apt.date + 'T' + apt.time);
        return aptDate <= now;
      }).sort((a, b) => {
        const dateA = new Date(a.date + 'T' + a.time);
        const dateB = new Date(b.date + 'T' + b.time);
        return dateB - dateA;
      });
    }

    setAppointments(filtered);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const handleConfirm = async (appointment) => {
    Alert.alert(
      'Confirmer le rendez-vous',
      `Confirmer le rendez-vous avec ${appointment.userName} ?`,
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Confirmer',
          onPress: async () => {
            const result = await DataService.updateAppointment(appointment.id, {
              status: 'confirmed',
              confirmedAt: new Date().toISOString(),
            });
            if (result.success) {
              Alert.alert('Succès', 'Rendez-vous confirmé');
              loadData();
            } else {
              Alert.alert('Erreur', result.message);
            }
          },
        },
      ]
    );
  };

  const handleCancel = async (appointment) => {
    Alert.alert(
      'Annuler le rendez-vous',
      `Voulez-vous vraiment annuler le rendez-vous avec ${appointment.userName} ?`,
      [
        { text: 'Non', style: 'cancel' },
        {
          text: 'Oui, annuler',
          style: 'destructive',
          onPress: async () => {
            const result = await DataService.cancelAppointment(appointment.id);
            if (result.success) {
              Alert.alert('Succès', 'Rendez-vous annulé');
              loadData();
            } else {
              Alert.alert('Erreur', result.message);
            }
          },
        },
      ]
    );
  };

  const handleSendMessage = (appointment) => {
    setSelectedAppointment(appointment);
    setMessage('');
    setMessageModalVisible(true);
  };

  const sendMessage = () => {
    if (!message.trim()) {
      Alert.alert('Erreur', 'Veuillez saisir un message');
      return;
    }

    Alert.alert(
      'Message envoyé',
      `Votre message a été envoyé à ${selectedAppointment.userName}`,
      [
        {
          text: 'OK',
          onPress: () => {
            setMessageModalVisible(false);
            setMessage('');
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

  const renderAppointment = ({ item }) => (
    <TouchableOpacity
      style={styles.appointmentCard}
      onPress={() => showDetails(item)}
    >
      <View style={styles.cardHeader}>
        <View style={styles.timeContainer}>
          <Ionicons name="time" size={24} color="#03dac6" />
          <Text style={styles.timeText}>{item.time}</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
          <Text style={styles.statusText}>{getStatusText(item.status)}</Text>
        </View>
      </View>

      <View style={styles.cardBody}>
        <View style={styles.patientInfo}>
          <Ionicons name="person-circle-outline" size={32} color="#666" />
          <View style={styles.patientDetails}>
            <Text style={styles.patientName}>{item.userName}</Text>
            <Text style={styles.serviceName}>{item.serviceName}</Text>
          </View>
        </View>

        {item.notes && (
          <View style={styles.notesContainer}>
            <Ionicons name="document-text-outline" size={16} color="#666" />
            <Text style={styles.notesText} numberOfLines={2}>{item.notes}</Text>
          </View>
        )}
      </View>

      {item.status === 'pending' && (
        <View style={styles.cardActions}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => handleCancel(item)}
          >
            <Ionicons name="close-circle-outline" size={20} color="#f44336" />
            <Text style={styles.actionButtonTextCancel}>Annuler</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, styles.actionButtonPrimary]}
            onPress={() => handleConfirm(item)}
          >
            <Ionicons name="checkmark-circle-outline" size={20} color="white" />
            <Text style={styles.actionButtonTextConfirm}>Confirmer</Text>
          </TouchableOpacity>
        </View>
      )}

      {item.status === 'confirmed' && (
        <View style={styles.cardActions}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => handleSendMessage(item)}
          >
            <Ionicons name="chatbubble-outline" size={20} color="#03dac6" />
            <Text style={styles.actionButtonTextMessage}>Message</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => handleCancel(item)}
          >
            <Ionicons name="close-circle-outline" size={20} color="#f44336" />
            <Text style={styles.actionButtonTextCancel}>Annuler</Text>
          </TouchableOpacity>
        </View>
      )}
    </TouchableOpacity>
  );

  const renderEmptyList = () => (
    <View style={styles.emptyState}>
      <Ionicons name="calendar-outline" size={80} color="#ccc" />
      <Text style={styles.emptyStateTitle}>
        {filter === 'today' && 'Aucun rendez-vous aujourd\'hui'}
        {filter === 'upcoming' && 'Aucun rendez-vous à venir'}
        {filter === 'pending' && 'Aucun rendez-vous en attente'}
        {filter === 'past' && 'Aucun rendez-vous passé'}
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Rendez-vous</Text>
        <Text style={styles.headerSubtitle}>{appointments.length} rendez-vous</Text>
      </View>

      <View style={styles.filtersContainer}>
        <TouchableOpacity
          style={[styles.filterChip, filter === 'today' && styles.filterChipActive]}
          onPress={() => setFilter('today')}
        >
          <Ionicons name="today" size={18} color={filter === 'today' ? 'white' : '#666'} />
          <Text style={[styles.filterText, filter === 'today' && styles.filterTextActive]}>
            Aujourd'hui
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.filterChip, filter === 'pending' && styles.filterChipActive]}
          onPress={() => setFilter('pending')}
        >
          <Ionicons name="hourglass-outline" size={18} color={filter === 'pending' ? 'white' : '#666'} />
          <Text style={[styles.filterText, filter === 'pending' && styles.filterTextActive]}>
            En attente
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.filterChip, filter === 'upcoming' && styles.filterChipActive]}
          onPress={() => setFilter('upcoming')}
        >
          <Ionicons name="calendar" size={18} color={filter === 'upcoming' ? 'white' : '#666'} />
          <Text style={[styles.filterText, filter === 'upcoming' && styles.filterTextActive]}>
            À venir
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.filterChip, filter === 'past' && styles.filterChipActive]}
          onPress={() => setFilter('past')}
        >
          <Ionicons name="checkmark-done" size={18} color={filter === 'past' ? 'white' : '#666'} />
          <Text style={[styles.filterText, filter === 'past' && styles.filterTextActive]}>
            Passés
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

      {/* Modal Détails */}
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
                    <Text style={styles.modalLabel}>Patient</Text>
                    <Text style={styles.modalValue}>{selectedAppointment.userName}</Text>
                  </View>

                  <View style={styles.modalSection}>
                    <Text style={styles.modalLabel}>Service</Text>
                    <Text style={styles.modalValue}>{selectedAppointment.serviceName}</Text>
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
                      <Text style={styles.statusText}>{getStatusText(selectedAppointment.status)}</Text>
                    </View>
                  </View>

                  {selectedAppointment.notes && (
                    <View style={styles.modalSection}>
                      <Text style={styles.modalLabel}>Notes du patient</Text>
                      <Text style={styles.modalValue}>{selectedAppointment.notes}</Text>
                    </View>
                  )}
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>

      {/* Modal Message */}
      <Modal
        visible={messageModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setMessageModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Envoyer un message</Text>
              <TouchableOpacity onPress={() => setMessageModalVisible(false)}>
                <Ionicons name="close" size={28} color="#333" />
              </TouchableOpacity>
            </View>

            <View style={styles.modalBody}>
              {selectedAppointment && (
                <View style={styles.modalSection}>
                  <Text style={styles.modalLabel}>À</Text>
                  <Text style={styles.modalValue}>{selectedAppointment.userName}</Text>
                </View>
              )}

              <View style={styles.modalSection}>
                <Text style={styles.modalLabel}>Message</Text>
                <TextInput
                  style={styles.messageInput}
                  placeholder="Tapez votre message..."
                  value={message}
                  onChangeText={setMessage}
                  multiline
                  numberOfLines={6}
                  textAlignVertical="top"
                />
              </View>

              <TouchableOpacity style={styles.sendButton} onPress={sendMessage}>
                <Ionicons name="send" size={20} color="white" />
                <Text style={styles.sendButtonText}>Envoyer</Text>
              </TouchableOpacity>
            </View>
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
  headerSubtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  filtersContainer: {
    flexDirection: 'row',
    padding: 12,
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
    gap: 4,
    padding: 10,
    borderRadius: 8,
    backgroundColor: '#f5f5f5',
  },
  filterChipActive: {
    backgroundColor: '#03dac6',
  },
  filterText: {
    fontSize: 12,
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
    alignItems: 'center',
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  timeText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  cardBody: {
    marginBottom: 12,
  },
  patientInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 8,
  },
  patientDetails: {
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
  },
  notesContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    backgroundColor: '#f9f9f9',
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  notesText: {
    flex: 1,
    fontSize: 13,
    color: '#666',
    fontStyle: 'italic',
  },
  cardActions: {
    flexDirection: 'row',
    gap: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#f5f5f5',
  },
  actionButtonPrimary: {
    backgroundColor: '#03dac6',
  },
  actionButtonTextCancel: {
    color: '#f44336',
    fontSize: 14,
    fontWeight: '600',
  },
  actionButtonTextConfirm: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  actionButtonTextMessage: {
    color: '#03dac6',
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
    maxHeight: '80%',
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
    marginBottom: 6,
    textTransform: 'uppercase',
    fontWeight: '600',
  },
  modalValue: {
    fontSize: 16,
    color: '#333',
  },
  messageInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    backgroundColor: '#f9f9f9',
    minHeight: 120,
  },
  sendButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#03dac6',
    padding: 16,
    borderRadius: 8,
    marginTop: 16,
  },
  sendButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
