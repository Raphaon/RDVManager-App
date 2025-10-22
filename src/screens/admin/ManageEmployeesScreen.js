import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, Modal, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import DataService from '../../services/DataService';

export default function ManageEmployeesScreen() {
  const [employees, setEmployees] = useState([]);
  const [services, setServices] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [specialty, setSpecialty] = useState('');
  const [selectedServices, setSelectedServices] = useState([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const user = await DataService.getCurrentUser();
    const emps = await DataService.getEmployeesByCompany(user.companyId || '1');
    const servs = await DataService.getServicesByCompany(user.companyId || '1');
    setEmployees(emps);
    setServices(servs);
  };

  const handleAdd = () => {
    setEditingEmployee(null);
    setName('');
    setEmail('');
    setPhone('');
    setSpecialty('');
    setSelectedServices([]);
    setModalVisible(true);
  };

  const handleSave = async () => {
    if (!name || !email) {
      Alert.alert('Erreur', 'Nom et email requis');
      return;
    }

    const user = await DataService.getCurrentUser();
    const data = {
      name,
      email,
      phone,
      specialty,
      password: 'employee123',
      role: 'employee',
      companyId: user.companyId || '1',
      services: selectedServices,
    };

    let result;
    if (editingEmployee) {
      result = await DataService.updateUser(editingEmployee.id, data);
    } else {
      result = await DataService.register(data);
    }

    if (result.success) {
      Alert.alert('Succès', editingEmployee ? 'Employé modifié' : 'Employé ajouté');
      setModalVisible(false);
      loadData();
    } else {
      Alert.alert('Erreur', result.message);
    }
  };

  const renderEmployee = ({ item }) => (
    <View style={styles.employeeCard}>
      <View style={styles.employeeIcon}>
        <Ionicons name="person" size={32} color="#cf6679" />
      </View>
      <View style={styles.employeeInfo}>
        <Text style={styles.employeeName}>{item.name}</Text>
        {item.specialty && <Text style={styles.employeeSpecialty}>{item.specialty}</Text>}
        <Text style={styles.employeeEmail}>{item.email}</Text>
      </View>
      <TouchableOpacity onPress={() => {
        setEditingEmployee(item);
        setName(item.name);
        setEmail(item.email);
        setPhone(item.phone || '');
        setSpecialty(item.specialty || '');
        setSelectedServices(item.services || []);
        setModalVisible(true);
      }}>
        <Ionicons name="create-outline" size={24} color="#cf6679" />
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Employés</Text>
        <TouchableOpacity style={styles.addButton} onPress={handleAdd}>
          <Ionicons name="add" size={24} color="white" />
        </TouchableOpacity>
      </View>

      <FlatList
        data={employees}
        keyExtractor={item => item.id}
        renderItem={renderEmployee}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="people-outline" size={64} color="#ccc" />
            <Text style={styles.emptyText}>Aucun employé</Text>
            <TouchableOpacity style={styles.emptyButton} onPress={handleAdd}>
              <Text style={styles.emptyButtonText}>Ajouter un employé</Text>
            </TouchableOpacity>
          </View>
        }
      />

      <Modal visible={modalVisible} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{editingEmployee ? 'Modifier' : 'Ajouter'} un employé</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={28} color="#333" />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.modalBody}>
              <TextInput style={styles.input} placeholder="Nom *" value={name} onChangeText={setName} />
              <TextInput style={styles.input} placeholder="Email *" value={email} onChangeText={setEmail} keyboardType="email-address" />
              <TextInput style={styles.input} placeholder="Téléphone" value={phone} onChangeText={setPhone} keyboardType="phone-pad" />
              <TextInput style={styles.input} placeholder="Spécialité" value={specialty} onChangeText={setSpecialty} />
              <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
                <Text style={styles.saveButtonText}>Enregistrer</Text>
              </TouchableOpacity>
            </ScrollView>
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
  employeeCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'white', borderRadius: 12, padding: 16, marginBottom: 12 },
  employeeIcon: { width: 56, height: 56, borderRadius: 28, backgroundColor: '#f5f5f5', justifyContent: 'center', alignItems: 'center', marginRight: 16 },
  employeeInfo: { flex: 1 },
  employeeName: { fontSize: 16, fontWeight: 'bold', color: '#333' },
  employeeSpecialty: { fontSize: 14, color: '#cf6679', marginTop: 2 },
  employeeEmail: { fontSize: 13, color: '#666', marginTop: 4 },
  emptyState: { alignItems: 'center', padding: 40 },
  emptyText: { fontSize: 16, color: '#999', marginTop: 16, marginBottom: 20 },
  emptyButton: { backgroundColor: '#cf6679', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 8 },
  emptyButtonText: { color: 'white', fontWeight: 'bold' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: 'white', borderTopLeftRadius: 20, borderTopRightRadius: 20, maxHeight: '80%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
  modalTitle: { fontSize: 20, fontWeight: 'bold', color: '#333' },
  modalBody: { padding: 20 },
  input: { borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 12, marginBottom: 16, fontSize: 16, backgroundColor: '#f9f9f9' },
  saveButton: { backgroundColor: '#cf6679', padding: 16, borderRadius: 8, alignItems: 'center', marginTop: 10 },
  saveButtonText: { color: 'white', fontSize: 16, fontWeight: 'bold' },
});
