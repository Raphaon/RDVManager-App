import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Calendar } from 'react-native-calendars';
import DataService from '../../services/DataService';

export default function BookAppointmentScreen({ route, navigation }) {
  const { company } = route.params;
  
  const [services, setServices] = useState([]);
  const [selectedService, setSelectedService] = useState(null);
  const [employees, setEmployees] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [selectedDate, setSelectedDate] = useState('');
  const [availableSlots, setAvailableSlots] = useState([]);
  const [selectedTime, setSelectedTime] = useState('');
  const [notes, setNotes] = useState('');
  const [user, setUser] = useState(null);
  const [step, setStep] = useState(1);

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    if (selectedService) {
      loadEmployees();
    }
  }, [selectedService]);

  useEffect(() => {
    if (selectedEmployee && selectedDate) {
      loadAvailableSlots();
    }
  }, [selectedEmployee, selectedDate]);

  const loadInitialData = async () => {
    const currentUser = await DataService.getCurrentUser();
    setUser(currentUser);

    const companyServices = await DataService.getServicesByCompany(company.id);
    setServices(companyServices);
  };

  const loadEmployees = async () => {
    const serviceEmployees = await DataService.getEmployeesByService(selectedService.id);
    setEmployees(serviceEmployees);
  };

  const loadAvailableSlots = async () => {
    const slots = await DataService.getAvailableSlots(selectedEmployee.id, selectedDate);
    setAvailableSlots(slots);
  };

  const handleServiceSelect = (service) => {
    setSelectedService(service);
    setSelectedEmployee(null);
    setSelectedDate('');
    setSelectedTime('');
    setStep(2);
  };

  const handleEmployeeSelect = (employee) => {
    setSelectedEmployee(employee);
    setSelectedDate('');
    setSelectedTime('');
    setStep(3);
  };

  const handleDateSelect = (day) => {
    setSelectedDate(day.dateString);
    setSelectedTime('');
    setStep(4);
  };

  const handleTimeSelect = (time) => {
    setSelectedTime(time);
  };

  const handleBookAppointment = async () => {
    if (!selectedService || !selectedEmployee || !selectedDate || !selectedTime) {
      Alert.alert('Erreur', 'Veuillez compléter toutes les étapes');
      return;
    }

    const appointmentData = {
      userId: user.id,
      employeeId: selectedEmployee.id,
      companyId: company.id,
      serviceId: selectedService.id,
      date: selectedDate,
      time: selectedTime,
      notes,
      userName: user.name,
      employeeName: selectedEmployee.name,
      companyName: company.name,
      serviceName: selectedService.name,
    };

    const result = await DataService.createAppointment(appointmentData);

    if (result.success) {
      Alert.alert(
        'Succès ! 🎉',
        `Votre rendez-vous a été réservé avec ${selectedEmployee.name} le ${formatDate(selectedDate)} à ${selectedTime}`,
        [
          {
            text: 'OK',
            onPress: () => navigation.navigate('Mes RDV'),
          },
        ]
      );
    } else {
      Alert.alert('Erreur', result.message);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
    });
  };

  const getMinDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  const getMaxDate = () => {
    const today = new Date();
    const maxDate = new Date(today.setMonth(today.getMonth() + 2));
    return maxDate.toISOString().split('T')[0];
  };

  return (
    <View style={styles.container}>
      {/* Progress Steps */}
      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          {[1, 2, 3, 4].map((stepNum) => (
            <View
              key={stepNum}
              style={[
                styles.progressStep,
                step >= stepNum && styles.progressStepActive,
              ]}
            />
          ))}
        </View>
        <Text style={styles.progressText}>
          Étape {step}/4
        </Text>
      </View>

      <ScrollView style={styles.content}>
        {/* Company Info */}
        <View style={styles.companyCard}>
          <Text style={styles.companyName}>{company.name}</Text>
          <Text style={styles.companyAddress}>{company.address}</Text>
        </View>

        {/* Step 1: Select Service */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            1. Choisissez un service {step > 1 && '✓'}
          </Text>
          {step >= 1 && (
            <View style={styles.optionsList}>
              {services.map((service) => (
                <TouchableOpacity
                  key={service.id}
                  style={[
                    styles.optionCard,
                    selectedService?.id === service.id && styles.optionCardSelected,
                  ]}
                  onPress={() => handleServiceSelect(service)}
                >
                  <View style={styles.optionInfo}>
                    <Text style={styles.optionName}>{service.name}</Text>
                    <Text style={styles.optionDescription}>{service.description}</Text>
                    <Text style={styles.optionDuration}>⏱️ {service.duration} min</Text>
                  </View>
                  {selectedService?.id === service.id && (
                    <Ionicons name="checkmark-circle" size={24} color="#6200ee" />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        {/* Step 2: Select Employee */}
        {step >= 2 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              2. Choisissez un praticien {step > 2 && '✓'}
            </Text>
            <View style={styles.optionsList}>
              {employees.map((employee) => (
                <TouchableOpacity
                  key={employee.id}
                  style={[
                    styles.optionCard,
                    selectedEmployee?.id === employee.id && styles.optionCardSelected,
                  ]}
                  onPress={() => handleEmployeeSelect(employee)}
                >
                  <View style={styles.employeeIcon}>
                    <Ionicons name="person" size={32} color="#6200ee" />
                  </View>
                  <View style={styles.optionInfo}>
                    <Text style={styles.optionName}>{employee.name}</Text>
                    {employee.specialty && (
                      <Text style={styles.optionDescription}>{employee.specialty}</Text>
                    )}
                  </View>
                  {selectedEmployee?.id === employee.id && (
                    <Ionicons name="checkmark-circle" size={24} color="#6200ee" />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* Step 3: Select Date */}
        {step >= 3 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              3. Choisissez une date {step > 3 && '✓'}
            </Text>
            <Calendar
              minDate={getMinDate()}
              maxDate={getMaxDate()}
              onDayPress={handleDateSelect}
              markedDates={{
                [selectedDate]: {
                  selected: true,
                  selectedColor: '#6200ee',
                },
              }}
              theme={{
                todayTextColor: '#6200ee',
                selectedDayBackgroundColor: '#6200ee',
                arrowColor: '#6200ee',
              }}
            />
          </View>
        )}

        {/* Step 4: Select Time */}
        {step >= 4 && availableSlots.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>4. Choisissez une heure</Text>
            <View style={styles.slotsGrid}>
              {availableSlots.map((slot) => (
                <TouchableOpacity
                  key={slot}
                  style={[
                    styles.slotCard,
                    selectedTime === slot && styles.slotCardSelected,
                  ]}
                  onPress={() => handleTimeSelect(slot)}
                >
                  <Ionicons
                    name="time-outline"
                    size={20}
                    color={selectedTime === slot ? 'white' : '#6200ee'}
                  />
                  <Text
                    style={[
                      styles.slotText,
                      selectedTime === slot && styles.slotTextSelected,
                    ]}
                  >
                    {slot}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {step >= 4 && availableSlots.length === 0 && selectedDate && (
          <View style={styles.noSlotsContainer}>
            <Ionicons name="calendar-outline" size={48} color="#999" />
            <Text style={styles.noSlotsText}>
              Aucun créneau disponible pour cette date
            </Text>
            <Text style={styles.noSlotsSubtext}>
              Veuillez choisir une autre date
            </Text>
          </View>
        )}

        {/* Notes */}
        {selectedTime && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Notes (optionnel)</Text>
            <TextInput
              style={styles.notesInput}
              placeholder="Ajoutez des informations supplémentaires..."
              value={notes}
              onChangeText={setNotes}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>
        )}
      </ScrollView>

      {/* Book Button */}
      {selectedTime && (
        <View style={styles.footer}>
          <TouchableOpacity
            style={styles.bookButton}
            onPress={handleBookAppointment}
          >
            <Text style={styles.bookButtonText}>Confirmer le rendez-vous</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  progressContainer: {
    backgroundColor: 'white',
    padding: 16,
    paddingTop: 60,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  progressBar: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },
  progressStep: {
    flex: 1,
    height: 4,
    backgroundColor: '#e0e0e0',
    borderRadius: 2,
  },
  progressStepActive: {
    backgroundColor: '#6200ee',
  },
  progressText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  content: {
    flex: 1,
  },
  companyCard: {
    backgroundColor: 'white',
    padding: 16,
    marginBottom: 8,
  },
  companyName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  companyAddress: {
    fontSize: 14,
    color: '#666',
  },
  section: {
    backgroundColor: 'white',
    padding: 16,
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  optionsList: {
    gap: 12,
  },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#f9f9f9',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  optionCardSelected: {
    borderColor: '#6200ee',
    backgroundColor: '#f3e5f5',
  },
  employeeIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#e3f2fd',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  optionInfo: {
    flex: 1,
  },
  optionName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  optionDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  optionDuration: {
    fontSize: 12,
    color: '#6200ee',
  },
  slotsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  slotCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#6200ee',
  },
  slotCardSelected: {
    backgroundColor: '#6200ee',
    borderColor: '#6200ee',
  },
  slotText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6200ee',
  },
  slotTextSelected: {
    color: 'white',
  },
  noSlotsContainer: {
    alignItems: 'center',
    padding: 40,
    backgroundColor: 'white',
    marginBottom: 8,
  },
  noSlotsText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#999',
    marginTop: 16,
  },
  noSlotsSubtext: {
    fontSize: 14,
    color: '#999',
    marginTop: 8,
  },
  notesInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    backgroundColor: '#f9f9f9',
    minHeight: 100,
  },
  footer: {
    backgroundColor: 'white',
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  bookButton: {
    backgroundColor: '#6200ee',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
  },
  bookButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
