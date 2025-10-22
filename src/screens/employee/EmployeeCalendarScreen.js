import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { Calendar } from 'react-native-calendars';
import { Ionicons } from '@expo/vector-icons';
import DataService from '../../services/DataService';

export default function EmployeeCalendarScreen() {
  const [selectedDate, setSelectedDate] = useState('');
  const [availabilities, setAvailabilities] = useState({});
  const [selectedSlots, setSelectedSlots] = useState([]);
  const [user, setUser] = useState(null);

  const timeSlots = [
    '08:00', '08:30', '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
    '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00', '17:30'
  ];

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const currentUser = await DataService.getCurrentUser();
    setUser(currentUser);
    const avails = await DataService.getEmployeeAvailabilities(currentUser.id);
    const availDict = {};
    avails.forEach(a => {
      availDict[a.date] = a.slots;
    });
    setAvailabilities(availDict);
  };

  const handleDateSelect = (day) => {
    setSelectedDate(day.dateString);
    setSelectedSlots(availabilities[day.dateString] || []);
  };

  const toggleSlot = (slot) => {
    if (selectedSlots.includes(slot)) {
      setSelectedSlots(selectedSlots.filter(s => s !== slot));
    } else {
      setSelectedSlots([...selectedSlots, slot]);
    }
  };

  const saveAvailability = async () => {
    if (!selectedDate) {
      Alert.alert('Erreur', 'Veuillez sélectionner une date');
      return;
    }

    const result = await DataService.setAvailability({
      employeeId: user.id,
      date: selectedDate,
      slots: selectedSlots,
    });

    if (result.success) {
      Alert.alert('Succès', 'Disponibilités enregistrées');
      loadData();
    } else {
      Alert.alert('Erreur', result.message);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Mon Calendrier</Text>
        <Text style={styles.headerSubtitle}>Gérez vos disponibilités</Text>
      </View>

      <View style={styles.calendarContainer}>
        <Calendar
          onDayPress={handleDateSelect}
          markedDates={{
            ...Object.keys(availabilities).reduce((acc, date) => {
              acc[date] = { marked: true, dotColor: '#03dac6' };
              return acc;
            }, {}),
            [selectedDate]: {
              selected: true,
              selectedColor: '#03dac6',
              marked: availabilities[selectedDate]?.length > 0,
            },
          }}
          theme={{
            todayTextColor: '#03dac6',
            selectedDayBackgroundColor: '#03dac6',
            arrowColor: '#03dac6',
          }}
        />
      </View>

      {selectedDate && (
        <View style={styles.slotsContainer}>
          <Text style={styles.slotsTitle}>
            Créneaux pour le {new Date(selectedDate).toLocaleDateString('fr-FR')}
          </Text>
          <Text style={styles.slotsSubtitle}>
            Sélectionnez les créneaux où vous êtes disponible
          </Text>

          <View style={styles.slotsGrid}>
            {timeSlots.map(slot => (
              <TouchableOpacity
                key={slot}
                style={[
                  styles.slotCard,
                  selectedSlots.includes(slot) && styles.slotCardSelected,
                ]}
                onPress={() => toggleSlot(slot)}
              >
                <Ionicons
                  name={selectedSlots.includes(slot) ? 'checkmark-circle' : 'time-outline'}
                  size={20}
                  color={selectedSlots.includes(slot) ? 'white' : '#03dac6'}
                />
                <Text style={[
                  styles.slotText,
                  selectedSlots.includes(slot) && styles.slotTextSelected,
                ]}>
                  {slot}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity style={styles.saveButton} onPress={saveAvailability}>
            <Ionicons name="save-outline" size={20} color="white" />
            <Text style={styles.saveButtonText}>
              Enregistrer ({selectedSlots.length} créneaux)
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  header: { backgroundColor: 'white', padding: 20, paddingTop: 60 },
  headerTitle: { fontSize: 24, fontWeight: 'bold', color: '#333' },
  headerSubtitle: { fontSize: 14, color: '#666', marginTop: 4 },
  calendarContainer: { backgroundColor: 'white', marginTop: 12, paddingBottom: 16 },
  slotsContainer: { backgroundColor: 'white', marginTop: 12, padding: 20 },
  slotsTitle: { fontSize: 18, fontWeight: 'bold', color: '#333' },
  slotsSubtitle: { fontSize: 14, color: '#666', marginTop: 4, marginBottom: 16 },
  slotsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  slotCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#03dac6',
    minWidth: '30%',
  },
  slotCardSelected: { backgroundColor: '#03dac6', borderColor: '#03dac6' },
  slotText: { fontSize: 14, fontWeight: '600', color: '#03dac6' },
  slotTextSelected: { color: 'white' },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#03dac6',
    padding: 16,
    borderRadius: 8,
    marginTop: 20,
  },
  saveButtonText: { color: 'white', fontSize: 16, fontWeight: 'bold' },
});
