import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import DataService from '../../services/DataService';

export default function ManageCompanyScreen() {
  const [company, setCompany] = useState(null);
  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [description, setDescription] = useState('');

  useEffect(() => {
    loadCompany();
  }, []);

  const loadCompany = async () => {
    const user = await DataService.getCurrentUser();
    const companies = await DataService.getCompanies();
    const userCompany = companies.find(c => c.adminId === user.id);
    
    if (userCompany) {
      setCompany(userCompany);
      setName(userCompany.name);
      setCategory(userCompany.category);
      setAddress(userCompany.address || '');
      setPhone(userCompany.phone || '');
      setEmail(userCompany.email || '');
      setDescription(userCompany.description || '');
    }
  };

  const handleSave = async () => {
    if (!name || !category) {
      Alert.alert('Erreur', 'Veuillez remplir les champs obligatoires');
      return;
    }

    const user = await DataService.getCurrentUser();
    const data = { name, category, address, phone, email, description, adminId: user.id };

    let result;
    if (company) {
      result = await DataService.updateCompany(company.id, data);
    } else {
      result = await DataService.createCompany(data);
    }

    if (result.success) {
      Alert.alert('Succès', company ? 'Entreprise mise à jour' : 'Entreprise créée');
      loadCompany();
    } else {
      Alert.alert('Erreur', result.message);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{company ? 'Modifier l\'entreprise' : 'Créer l\'entreprise'}</Text>
      </View>

      <View style={styles.form}>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Nom de l&apos;entreprise *</Text>
          <TextInput style={styles.input} value={name} onChangeText={setName} placeholder="Ex: Hôpital Général" />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Catégorie *</Text>
          <View style={styles.categoryButtons}>
            {['Santé', 'Beauté', 'Sport', 'Services'].map(cat => (
              <TouchableOpacity
                key={cat}
                style={[styles.categoryButton, category === cat && styles.categoryButtonActive]}
                onPress={() => setCategory(cat)}
              >
                <Text style={[styles.categoryButtonText, category === cat && styles.categoryButtonTextActive]}>
                  {cat}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Adresse</Text>
          <TextInput style={styles.input} value={address} onChangeText={setAddress} placeholder="Adresse complète" />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Téléphone</Text>
          <TextInput style={styles.input} value={phone} onChangeText={setPhone} placeholder="+243 900 000 000" keyboardType="phone-pad" />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Email</Text>
          <TextInput style={styles.input} value={email} onChangeText={setEmail} placeholder="contact@entreprise.com" keyboardType="email-address" />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Description</Text>
          <TextInput style={[styles.input, styles.textArea]} value={description} onChangeText={setDescription} placeholder="Description de l'entreprise" multiline numberOfLines={4} />
        </View>

        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
          <Ionicons name="save-outline" size={20} color="white" />
          <Text style={styles.saveButtonText}>Enregistrer</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  header: { backgroundColor: 'white', padding: 20, paddingTop: 60 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#333' },
  form: { padding: 20 },
  inputGroup: { marginBottom: 20 },
  label: { fontSize: 14, fontWeight: '600', color: '#333', marginBottom: 8 },
  input: { borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 12, fontSize: 16, backgroundColor: 'white' },
  textArea: { minHeight: 100, textAlignVertical: 'top' },
  categoryButtons: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  categoryButton: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 8, backgroundColor: '#f5f5f5', borderWidth: 2, borderColor: 'transparent' },
  categoryButtonActive: { backgroundColor: '#cf6679', borderColor: '#cf6679' },
  categoryButtonText: { fontSize: 14, fontWeight: '600', color: '#666' },
  categoryButtonTextActive: { color: 'white' },
  saveButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: '#cf6679', padding: 16, borderRadius: 8, marginTop: 20 },
  saveButtonText: { color: 'white', fontSize: 16, fontWeight: 'bold' },
});
