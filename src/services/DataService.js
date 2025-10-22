import AsyncStorage from '@react-native-async-storage/async-storage';

// Service de gestion des données locales (simule une API)
class DataService {
  
  // === AUTHENTIFICATION ===
  
  async login(email, password) {
    try {
      const users = await this.getUsers();
      const user = users.find(u => u.email === email && u.password === password);
      
      if (user) {
        await AsyncStorage.setItem('userData', JSON.stringify(user));
        return { success: true, user };
      }
      return { success: false, message: 'Email ou mot de passe incorrect' };
    } catch (error) {
      return { success: false, message: 'Erreur de connexion' };
    }
  }

  async register(userData) {
    try {
      const users = await this.getUsers();
      
      // Vérifier si l'email existe déjà
      if (users.find(u => u.email === userData.email)) {
        return { success: false, message: 'Cet email est déjà utilisé' };
      }

      const newUser = {
        id: Date.now().toString(),
        ...userData,
        createdAt: new Date().toISOString(),
      };

      users.push(newUser);
      await AsyncStorage.setItem('users', JSON.stringify(users));
      
      return { success: true, user: newUser };
    } catch (error) {
      return { success: false, message: 'Erreur lors de l\'inscription' };
    }
  }

  async logout() {
    try {
      await AsyncStorage.removeItem('userData');
      return { success: true };
    } catch (error) {
      return { success: false, message: 'Erreur lors de la déconnexion' };
    }
  }

  async getCurrentUser() {
    try {
      const userData = await AsyncStorage.getItem('userData');
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      return null;
    }
  }

  async updateUser(userId, updates) {
    try {
      const users = await this.getUsers();
      const index = users.findIndex(u => u.id === userId);
      
      if (index !== -1) {
        users[index] = { ...users[index], ...updates };
        await AsyncStorage.setItem('users', JSON.stringify(users));
        
        // Mettre à jour les données de l'utilisateur connecté
        const currentUser = await this.getCurrentUser();
        if (currentUser && currentUser.id === userId) {
          await AsyncStorage.setItem('userData', JSON.stringify(users[index]));
        }
        
        return { success: true, user: users[index] };
      }
      return { success: false, message: 'Utilisateur non trouvé' };
    } catch (error) {
      return { success: false, message: 'Erreur lors de la mise à jour' };
    }
  }

  // === ENTREPRISES ===
  
  async getCompanies() {
    try {
      const data = await AsyncStorage.getItem('companies');
      return data ? JSON.parse(data) : [];
    } catch (error) {
      return [];
    }
  }

  async getCompanyById(id) {
    try {
      const companies = await this.getCompanies();
      return companies.find(c => c.id === id);
    } catch (error) {
      return null;
    }
  }

  async createCompany(companyData) {
    try {
      const companies = await this.getCompanies();
      const newCompany = {
        id: Date.now().toString(),
        ...companyData,
        createdAt: new Date().toISOString(),
      };
      companies.push(newCompany);
      await AsyncStorage.setItem('companies', JSON.stringify(companies));
      return { success: true, company: newCompany };
    } catch (error) {
      return { success: false, message: 'Erreur lors de la création' };
    }
  }

  async updateCompany(companyId, updates) {
    try {
      const companies = await this.getCompanies();
      const index = companies.findIndex(c => c.id === companyId);
      
      if (index !== -1) {
        companies[index] = { ...companies[index], ...updates };
        await AsyncStorage.setItem('companies', JSON.stringify(companies));
        return { success: true, company: companies[index] };
      }
      return { success: false, message: 'Entreprise non trouvée' };
    } catch (error) {
      return { success: false, message: 'Erreur lors de la mise à jour' };
    }
  }

  async searchCompanies(query) {
    try {
      const companies = await this.getCompanies();
      const lowerQuery = query.toLowerCase();
      return companies.filter(c => 
        c.name.toLowerCase().includes(lowerQuery) ||
        c.category?.toLowerCase().includes(lowerQuery) ||
        c.address?.toLowerCase().includes(lowerQuery)
      );
    } catch (error) {
      return [];
    }
  }

  // === SERVICES ===
  
  async getServices() {
    try {
      const data = await AsyncStorage.getItem('services');
      return data ? JSON.parse(data) : [];
    } catch (error) {
      return [];
    }
  }

  async getServicesByCompany(companyId) {
    try {
      const services = await this.getServices();
      return services.filter(s => s.companyId === companyId);
    } catch (error) {
      return [];
    }
  }

  async createService(serviceData) {
    try {
      const services = await this.getServices();
      const newService = {
        id: Date.now().toString(),
        ...serviceData,
        createdAt: new Date().toISOString(),
      };
      services.push(newService);
      await AsyncStorage.setItem('services', JSON.stringify(services));
      return { success: true, service: newService };
    } catch (error) {
      return { success: false, message: 'Erreur lors de la création' };
    }
  }

  async updateService(serviceId, updates) {
    try {
      const services = await this.getServices();
      const index = services.findIndex(s => s.id === serviceId);
      
      if (index !== -1) {
        services[index] = { ...services[index], ...updates };
        await AsyncStorage.setItem('services', JSON.stringify(services));
        return { success: true, service: services[index] };
      }
      return { success: false, message: 'Service non trouvé' };
    } catch (error) {
      return { success: false, message: 'Erreur lors de la mise à jour' };
    }
  }

  async deleteService(serviceId) {
    try {
      const services = await this.getServices();
      const filtered = services.filter(s => s.id !== serviceId);
      await AsyncStorage.setItem('services', JSON.stringify(filtered));
      return { success: true };
    } catch (error) {
      return { success: false, message: 'Erreur lors de la suppression' };
    }
  }

  // === EMPLOYÉS ===
  
  async getUsers() {
    try {
      const data = await AsyncStorage.getItem('users');
      return data ? JSON.parse(data) : [];
    } catch (error) {
      return [];
    }
  }

  async getEmployeesByCompany(companyId) {
    try {
      const users = await this.getUsers();
      return users.filter(u => u.role === 'employee' && u.companyId === companyId);
    } catch (error) {
      return [];
    }
  }

  async getEmployeesByService(serviceId) {
    try {
      const users = await this.getUsers();
      return users.filter(u => 
        u.role === 'employee' && 
        u.services && 
        u.services.includes(serviceId)
      );
    } catch (error) {
      return [];
    }
  }

  // === DISPONIBILITÉS ===
  
  async getAvailabilities() {
    try {
      const data = await AsyncStorage.getItem('availabilities');
      return data ? JSON.parse(data) : [];
    } catch (error) {
      return [];
    }
  }

  async getEmployeeAvailabilities(employeeId) {
    try {
      const availabilities = await this.getAvailabilities();
      return availabilities.filter(a => a.employeeId === employeeId);
    } catch (error) {
      return [];
    }
  }

  async setAvailability(availabilityData) {
    try {
      const availabilities = await this.getAvailabilities();
      
      // Supprimer les anciennes disponibilités pour cette date
      const filtered = availabilities.filter(a => 
        !(a.employeeId === availabilityData.employeeId && a.date === availabilityData.date)
      );
      
      const newAvailability = {
        id: Date.now().toString(),
        ...availabilityData,
        createdAt: new Date().toISOString(),
      };
      
      filtered.push(newAvailability);
      await AsyncStorage.setItem('availabilities', JSON.stringify(filtered));
      return { success: true, availability: newAvailability };
    } catch (error) {
      return { success: false, message: 'Erreur lors de la sauvegarde' };
    }
  }

  async getAvailableSlots(employeeId, date) {
    try {
      const availabilities = await this.getEmployeeAvailabilities(employeeId);
      const dateAvailability = availabilities.find(a => a.date === date);
      
      if (!dateAvailability) return [];
      
      // Récupérer les rendez-vous existants pour ce jour
      const appointments = await this.getAppointmentsByEmployeeAndDate(employeeId, date);
      const bookedSlots = appointments.map(a => a.time);
      
      // Filtrer les créneaux disponibles
      return dateAvailability.slots.filter(slot => !bookedSlots.includes(slot));
    } catch (error) {
      return [];
    }
  }

  // === RENDEZ-VOUS ===
  
  async getAppointments() {
    try {
      const data = await AsyncStorage.getItem('appointments');
      return data ? JSON.parse(data) : [];
    } catch (error) {
      return [];
    }
  }

  async getAppointmentsByUser(userId) {
    try {
      const appointments = await this.getAppointments();
      return appointments.filter(a => a.userId === userId);
    } catch (error) {
      return [];
    }
  }

  async getAppointmentsByEmployee(employeeId) {
    try {
      const appointments = await this.getAppointments();
      return appointments.filter(a => a.employeeId === employeeId);
    } catch (error) {
      return [];
    }
  }

  async getAppointmentsByEmployeeAndDate(employeeId, date) {
    try {
      const appointments = await this.getAppointments();
      return appointments.filter(a => 
        a.employeeId === employeeId && 
        a.date === date &&
        a.status !== 'cancelled'
      );
    } catch (error) {
      return [];
    }
  }

  async createAppointment(appointmentData) {
    try {
      const appointments = await this.getAppointments();
      const newAppointment = {
        id: Date.now().toString(),
        ...appointmentData,
        status: 'pending',
        createdAt: new Date().toISOString(),
      };
      appointments.push(newAppointment);
      await AsyncStorage.setItem('appointments', JSON.stringify(appointments));
      return { success: true, appointment: newAppointment };
    } catch (error) {
      return { success: false, message: 'Erreur lors de la création' };
    }
  }

  async updateAppointment(appointmentId, updates) {
    try {
      const appointments = await this.getAppointments();
      const index = appointments.findIndex(a => a.id === appointmentId);
      
      if (index !== -1) {
        appointments[index] = { ...appointments[index], ...updates };
        await AsyncStorage.setItem('appointments', JSON.stringify(appointments));
        return { success: true, appointment: appointments[index] };
      }
      return { success: false, message: 'Rendez-vous non trouvé' };
    } catch (error) {
      return { success: false, message: 'Erreur lors de la mise à jour' };
    }
  }

  async cancelAppointment(appointmentId) {
    try {
      return await this.updateAppointment(appointmentId, { 
        status: 'cancelled',
        cancelledAt: new Date().toISOString() 
      });
    } catch (error) {
      return { success: false, message: 'Erreur lors de l\'annulation' };
    }
  }

  // === INITIALISATION DONNÉES DE DEMO ===
  
  async initializeDemoData() {
    try {
      // Vérifier si des données existent déjà
      const users = await this.getUsers();
      if (users.length > 0) return;

      // Créer des utilisateurs de démo
      const demoUsers = [
        {
          id: '1',
          email: 'admin@hospital.com',
          password: 'admin123',
          name: 'Admin Hôpital',
          role: 'admin',
          phone: '+243 900 000 001',
        },
        {
          id: '2',
          email: 'dr.nkulu@hospital.com',
          password: 'doc123',
          name: 'Dr. Marie Nkulu',
          role: 'employee',
          companyId: '1',
          services: ['1'],
          phone: '+243 900 000 002',
          specialty: 'Gynécologie',
        },
        {
          id: '3',
          email: 'dr.kabamba@hospital.com',
          password: 'doc123',
          name: 'Dr. Jean Kabamba',
          role: 'employee',
          companyId: '1',
          services: ['2'],
          phone: '+243 900 000 003',
          specialty: 'Cardiologie',
        },
        {
          id: '4',
          email: 'user@example.com',
          password: 'user123',
          name: 'Patient Test',
          role: 'user',
          phone: '+243 900 000 004',
        },
      ];

      // Créer une entreprise de démo
      const demoCompanies = [
        {
          id: '1',
          name: 'Hôpital General de Kinshasa',
          category: 'Santé',
          address: 'Avenue de la Libération, Kinshasa',
          phone: '+243 900 000 100',
          email: 'contact@hopital-kinshasa.cd',
          description: 'Hôpital général offrant des services médicaux complets',
          adminId: '1',
        },
      ];

      // Créer des services de démo
      const demoServices = [
        {
          id: '1',
          companyId: '1',
          name: 'Gynécologie',
          description: 'Consultations gynécologiques et obstétriques',
          duration: 30,
        },
        {
          id: '2',
          companyId: '1',
          name: 'Cardiologie',
          description: 'Consultations cardiologiques',
          duration: 45,
        },
        {
          id: '3',
          companyId: '1',
          name: 'Pédiatrie',
          description: 'Soins pour enfants',
          duration: 30,
        },
      ];

      // Créer des disponibilités de démo
      const today = new Date();
      const demoAvailabilities = [];
      
      for (let i = 0; i < 7; i++) {
        const date = new Date(today);
        date.setDate(date.getDate() + i);
        const dateString = date.toISOString().split('T')[0];
        
        demoAvailabilities.push({
          id: `av-${i}-1`,
          employeeId: '2',
          date: dateString,
          slots: ['08:00', '08:30', '09:00', '09:30', '10:00', '10:30', '14:00', '14:30', '15:00', '15:30'],
        });
        
        demoAvailabilities.push({
          id: `av-${i}-2`,
          employeeId: '3',
          date: dateString,
          slots: ['09:00', '09:45', '10:30', '11:15', '14:00', '14:45', '15:30', '16:15'],
        });
      }

      // Sauvegarder toutes les données
      await AsyncStorage.setItem('users', JSON.stringify(demoUsers));
      await AsyncStorage.setItem('companies', JSON.stringify(demoCompanies));
      await AsyncStorage.setItem('services', JSON.stringify(demoServices));
      await AsyncStorage.setItem('availabilities', JSON.stringify(demoAvailabilities));
      await AsyncStorage.setItem('appointments', JSON.stringify([]));

    } catch (error) {
      // Erreur lors de l'initialisation des données de démo
    }
  }
}

export default new DataService();
