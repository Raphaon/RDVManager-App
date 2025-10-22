# 📱 RDV Manager - Application de Gestion de Rendez-vous

Application mobile hybride (iOS/Android) développée avec React Native pour la gestion complète de rendez-vous multi-entreprises et multi-services.

![React Native](https://img.shields.io/badge/React_Native-0.74-61DAFB?logo=react)
![Expo](https://img.shields.io/badge/Expo-51.0-000020?logo=expo)
![License](https://img.shields.io/badge/License-MIT-green)

## 🎯 Vue d'ensemble

RDV Manager permet aux entreprises (hôpitaux, cliniques, salons de beauté, centres sportifs, etc.) de gérer efficacement leurs rendez-vous. L'application offre trois interfaces distinctes :

- **👤 Patient** : Recherche, réservation et gestion de rendez-vous
- **👨‍⚕️ Employé** : Gestion du calendrier et des disponibilités
- **🔧 Administrateur** : Configuration de l'entreprise, services et employés

## ✨ Fonctionnalités Principales

### Pour les Patients
- 🔍 Recherche d'entreprises et de services
- 📅 Consultation des disponibilités en temps réel
- ✅ Réservation de rendez-vous
- ❌ Annulation et reprogrammation
- 📊 Historique des rendez-vous
- 🔔 Notifications et rappels

### Pour les Employés
- 📆 Gestion du calendrier personnel
- ⏰ Définition des créneaux de disponibilité
- 📋 Consultation des rendez-vous
- ✓ Confirmation/Annulation de RDV
- 💬 Envoi de messages aux patients
- 🔔 Rappels automatiques

### Pour les Administrateurs
- 🏢 Création et gestion d'entreprise
- 🛠️ Ajout et modification de services
- 👥 Gestion des employés
- 🔗 Attribution des services aux employés
- 📊 Statistiques et rapports
- ⚙️ Configuration globale

## 🚀 Installation

### Prérequis

- Node.js 18+
- npm ou yarn
- Expo CLI : `npm install -g expo-cli`
- Application Expo Go sur votre téléphone
- Émulateur Android Studio ou Xcode (optionnel)

### Installation du projet

```bash
# 1. Aller dans le dossier du projet
cd appointment-app

# 2. Installer les dépendances
npm install

# 3. Démarrer le serveur de développement
npm start
# ou
expo start

# 4. Scanner le QR code avec Expo Go
# L'application se lancera automatiquement sur votre téléphone

# 5. Pour lancer sur émulateur
npm run android    # Émulateur Android
npm run ios        # Simulateur iOS (Mac uniquement)
```

## 🧪 Comptes de Test

L'application est préchargée avec des données de démonstration :

**Patient :**
- Email: `user@example.com`
- Mot de passe: `user123`

**Employé (Dr. Marie Nkulu - Gynécologie) :**
- Email: `dr.nkulu@hospital.com`
- Mot de passe: `doc123`

**Administrateur :**
- Email: `admin@hospital.com`
- Mot de passe: `admin123`

## 📁 Structure du Projet

```
appointment-app/
├── App.js                          # Point d'entrée et navigation
├── package.json                    # Dépendances
├── app.json                        # Configuration Expo
└── src/
    ├── screens/                    # Écrans de l'application
    │   ├── LoginScreen.js
    │   ├── RegisterScreen.js
    │   ├── ProfileScreen.js
    │   ├── user/                   # Écrans Patient
    │   ├── employee/               # Écrans Employé
    │   └── admin/                  # Écrans Admin
    ├── services/                   # Services et logique métier
    │   └── DataService.js          # Gestion des données
    ├── components/                 # Composants réutilisables
    └── utils/                      # Utilitaires
```

## 🛠️ Technologies Utilisées

| Technologie | Utilisation |
|------------|-------------|
| React Native | Framework mobile cross-platform |
| Expo | Outils de développement et déploiement |
| React Navigation | Navigation entre écrans |
| React Native Paper | Composants Material Design |
| AsyncStorage | Stockage local des données |
| React Native Calendars | Gestion des calendriers |
| Expo Vector Icons | Bibliothèque d'icônes |

## 📊 Modèles de Données

### User (Utilisateur)
```javascript
{
  id: string,
  email: string,
  name: string,
  phone: string,
  role: 'user' | 'employee' | 'admin',
  companyId?: string,
  services?: string[],
  specialty?: string,
}
```

### Company (Entreprise)
```javascript
{
  id: string,
  name: string,
  category: string,
  address: string,
  phone: string,
  email: string,
  description: string,
}
```

### Appointment (Rendez-vous)
```javascript
{
  id: string,
  userId: string,
  employeeId: string,
  companyId: string,
  serviceId: string,
  date: string,
  time: string,
  status: 'pending' | 'confirmed' | 'cancelled',
}
```

## 🎨 Exemple d'Utilisation

### Cas d'usage : Patient réservant un rendez-vous chez un gynécologue

1. Le patient ouvre l'application et se connecte
2. Il accède à l'onglet "Recherche"
3. Il recherche "Hôpital Général de Kinshasa"
4. Il sélectionne le service "Gynécologie"
5. Il voit la liste des médecins disponibles
6. Il choisit "Dr. Marie Nkulu"
7. Il consulte les créneaux disponibles
8. Il réserve le mercredi 23 octobre à 14:00
9. Le médecin reçoit une notification
10. Le patient reçoit une confirmation

## 🔧 Développement

### Ajouter un nouvel écran

```javascript
// 1. Créer le fichier
// src/screens/user/MonNouvelEcran.js

import React from 'react';
import { View, Text } from 'react-native';

export default function MonNouvelEcran() {
  return (
    <View>
      <Text>Mon nouvel écran</Text>
    </View>
  );
}

// 2. Importer dans App.js
import MonNouvelEcran from './src/screens/user/MonNouvelEcran';

// 3. Ajouter dans le navigateur
<Tab.Screen name="Nouveau" component={MonNouvelEcran} />
```

### Accéder aux données

```javascript
import DataService from '../services/DataService';

const MyComponent = () => {
  const [appointments, setAppointments] = useState([]);

  useEffect(() => {
    const loadData = async () => {
      const data = await DataService.getAppointmentsByUser(userId);
      setAppointments(data);
    };
    loadData();
  }, []);

  return (/* ... */);
};
```

## 🚀 Roadmap & Évolutions Futures

### Phase 1 : Backend API (2-3 semaines)
- [ ] Remplacer AsyncStorage par une vraie API REST
- [ ] Base de données PostgreSQL ou MongoDB
- [ ] Authentification JWT
- [ ] Backend Node.js/Express ou Firebase

### Phase 2 : Notifications (2 semaines)
- [ ] Firebase Cloud Messaging
- [ ] Notifications push en temps réel
- [ ] Rappels SMS via Twilio

### Phase 3 : Fonctionnalités avancées (2 semaines)
- [ ] Paiements en ligne (Stripe/PayPal)
- [ ] Géolocalisation et carte interactive
- [ ] Export vers Google Calendar

### Phase 4 : Features premium (3 semaines)
- [ ] Visioconférence (consultations vidéo)
- [ ] Analytics avancés pour admins
- [ ] Système de notation et avis
- [ ] Multi-langues (FR/EN/Lingala)

## 📱 Captures d'écran

*(Les captures d'écran peuvent être ajoutées ici)*

## 🤝 Contribution

Les contributions sont les bienvenues ! Pour contribuer :

1. Fork le projet
2. Créez une branche pour votre fonctionnalité
3. Commitez vos changements
4. Push vers la branche
5. Ouvrez une Pull Request

## 📄 Licence

Ce projet est sous licence MIT. Voir le fichier `LICENSE` pour plus de détails.

## 👨‍💻 Auteur

Développé par Claude - Assistant IA Anthropic

## 📞 Support

Pour toute question ou problème :
- Consultez la [documentation React Native](https://reactnative.dev/)
- Visitez la [documentation Expo](https://docs.expo.dev/)
- Ouvrez une issue sur GitHub

## 🎓 Apprentissage

Ce projet est idéal pour apprendre :
- ✅ React Native et développement mobile
- ✅ Navigation multi-niveaux
- ✅ Gestion d'état avec Hooks
- ✅ AsyncStorage et persistance
- ✅ Architecture modulaire
- ✅ Material Design sur mobile

---

**⭐ Si ce projet vous a été utile, n'hésitez pas à lui donner une étoile !**
"# RDVManager-App" 
