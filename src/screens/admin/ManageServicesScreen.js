import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, Modal, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import DataService from '../../services/DataService';

export default function ManageServicesScreen() {
  const [services, setServices] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [duration, setDuration] = useState('30');

  useEffect(() => {
    loadServices();
  }, []);

  const loadServices = async () => {
    const user = await DataService.getCurrentUser();
    const servs = await DataService.getServicesByCompany(user.companyId || '1');
    setServices(servs);
  };

  const handleAdd = () => {
    setEditingService(null);
    setName('');
    setDescription('');
    setDuration('30');
    setModalVisible(true);
  };

  const handleSave = async () => {
    if (!name) {
      Alert.alert('Erreur', 'Nom du service requis');
      return;
    }

    const user = await DataService.getCurrentUser();
    const data = {
      name,
      description,
      duration: parseInt(duration) || 30,
      companyId: user.companyId || '1',
    };

    let result;
    if (editingService) {
      result = await DataService.updateService(editingService.id, data);
    } else {
      result = await DataService.createService(data);
    }

    if (result.success) {
      Alert.alert('Succès', editingService ? 'Service modifié' : 'Service ajouté');
      setModalVisible(false);
      loadServices();
    } else {
      Alert.alert('Erreur', result.message);
    }
  };

  const handleDelete = async (service) => {
    Alert.alert('Supprimer', `Supprimer ${service.name} ?`, [
      { text: 'Annuler', style: 'cancel' },
      {
        text: 'Supprimer',
        style: 'destructive',
        onPress: async () => {
          const result = await DataService.deleteService(service.id);
          if (result.success) {
            Alert.alert('Succès', 'Service supprimé');
            loadServices();
          }
        },
      },
    ]);
  };

  const renderService = ({ item }) => (
    <View style={styles.serviceCard}>
      <View style={styles.serviceIcon}>
        <Ionicons name="list-circle" size={40} color="#cf6679" />
      </View>
      <View style={styles.serviceInfo}>
        <Text style={styles.serviceName}>{item.name}</Text>
        {item.description && <Text style={styles.serviceDescription}>{item.description}</Text>}
        <Text style={styles.serviceDuration}>⏱️ {item.duration} min</Text>
      </View>
      <View style={styles.serviceActions}>
        <TouchableOpacity onPress={() => {
          setEditingService(item);
          setName(item.name);
          setDescription(item.description || '');
          setDuration(item.duration.toString());
          setModalVisible(true);
        }}>
          <Ionicons name="create-outline" size={24} color="#cf6679" />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => handleDelete(item)}>
          <Ionicons name="trash-outline" size={24} color="#f44336" />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Services</Text>
        <TouchableOpacity style={styles.addButton} onPress={handleAdd}>
          <Ionicons name="add" size={24} color="white" />
        </TouchableOpacity>
      </View>

      <FlatList
        data={services}
        keyExtractor={item => item.id}
        renderItem={renderService}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="list-outline" size={64} color="#ccc" />
            <Text style={styles.emptyText}>Aucun service</Text>
            <TouchableOpacity style={styles.emptyButton} onPress={handleAdd}>
              <Text style={styles.emptyButtonText}>Ajouter un service</Text>
            </TouchableOpacity>
          </View>
        }
      />

      <Modal visible={modalVisible} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{editingService ? 'Modifier' : 'Ajouter'} un service</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={28} color="#333" />
              </TouchableOpacity>
            </View>
            <View style={styles.modalBody}>
              <TextInput style={styles.input} placeholder="Nom du service *" value={name} onChangeText={setName} />
              <TextInput style={[styles.input, styles.textArea]} placeholder="Description" value={description} onChangeText={setDescription} multiline numberOfLines={3} />
              <TextInput style={styles.input} placeholder="Durée (minutes)" value={duration} onChangeText={setDuration} keyboardType="number-pad" />
              <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
                <Text style={styles.saveButtonText}>Enregistrer</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'white', padding: 20, paddingTop: 60 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#333' },
  addButton: { width: 48, height: 48, borderRadius: 24, backgroundColor: '#cf6679', justifyContent: 'center', alignItems: 'center' },
  list: { padding: 16 },
  serviceCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'white', borderRadius: 12, padding: 16, marginBottom: 12 },
  serviceIcon: { marginRight: 16 },
  serviceInfo: { flex: 1 },
  serviceName: { fontSize: 16, fontWeight: 'bold', color: '#333', marginBottom: 4 },
  serviceDescription: { fontSize: 14, color: '#666', marginBottom: 4 },
  serviceDuration: { fontSize: 13, color: '#cf6679' },
  serviceActions: { flexDirection: 'row', gap: 12 },
  emptyState: { alignItems: 'center', padding: 40 },
  emptyText: { fontSize: 16, color: '#999', marginTop: 16, marginBottom: 20 },
  emptyButton: { backgroundColor: '#cf6679', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 8 },
  emptyButtonText: { color: 'white', fontWeight: 'bold' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: 'white', borderTopLeftRadius: 20, borderTopRightRadius: 20, paddingBottom: 40 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
  modalTitle: { fontSize: 20, fontWeight: 'bold', color: '#333' },
  modalBody: { padding: 20 },
  input: { borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 12, marginBottom: 16, fontSize: 16, backgroundColor: '#f9f9f9' },
  textArea: { minHeight: 80, textAlignVertical: 'top' },
  saveButton: { backgroundColor: '#cf6679', padding: 16, borderRadius: 8, alignItems: 'center', marginTop: 10 },
  saveButtonText: { color: 'white', fontSize: 16, fontWeight: 'bold' },
});
