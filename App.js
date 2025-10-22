import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Provider as PaperProvider } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Screens
import LoginScreen from './src/screens/LoginScreen';
import RegisterScreen from './src/screens/RegisterScreen';
import UserHomeScreen from './src/screens/user/UserHomeScreen';
import SearchCompanyScreen from './src/screens/user/SearchCompanyScreen';
import BookAppointmentScreen from './src/screens/user/BookAppointmentScreen';
import UserAppointmentsScreen from './src/screens/user/UserAppointmentsScreen';
import EmployeeHomeScreen from './src/screens/employee/EmployeeHomeScreen';
import EmployeeAppointmentsScreen from './src/screens/employee/EmployeeAppointmentsScreen';
import EmployeeCalendarScreen from './src/screens/employee/EmployeeCalendarScreen';
import AdminHomeScreen from './src/screens/admin/AdminHomeScreen';
import ManageCompanyScreen from './src/screens/admin/ManageCompanyScreen';
import ManageEmployeesScreen from './src/screens/admin/ManageEmployeesScreen';
import ManageServicesScreen from './src/screens/admin/ManageServicesScreen';
import ProfileScreen from './src/screens/ProfileScreen';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

// Navigation pour utilisateur
function UserTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
          if (route.name === 'Accueil') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Recherche') {
            iconName = focused ? 'search' : 'search-outline';
          } else if (route.name === 'Mes RDV') {
            iconName = focused ? 'calendar' : 'calendar-outline';
          } else if (route.name === 'Profil') {
            iconName = focused ? 'person' : 'person-outline';
          }
          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#6200ee',
        tabBarInactiveTintColor: 'gray',
        headerShown: false,
      })}
    >
      <Tab.Screen name="Accueil" component={UserHomeScreen} />
      <Tab.Screen name="Recherche" component={SearchCompanyScreen} />
      <Tab.Screen name="Mes RDV" component={UserAppointmentsScreen} />
      <Tab.Screen name="Profil" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

// Navigation pour employé
function EmployeeTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
          if (route.name === 'Accueil') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'RDV') {
            iconName = focused ? 'calendar' : 'calendar-outline';
          } else if (route.name === 'Calendrier') {
            iconName = focused ? 'time' : 'time-outline';
          } else if (route.name === 'Profil') {
            iconName = focused ? 'person' : 'person-outline';
          }
          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#03dac6',
        tabBarInactiveTintColor: 'gray',
        headerShown: false,
      })}
    >
      <Tab.Screen name="Accueil" component={EmployeeHomeScreen} />
      <Tab.Screen name="RDV" component={EmployeeAppointmentsScreen} />
      <Tab.Screen name="Calendrier" component={EmployeeCalendarScreen} />
      <Tab.Screen name="Profil" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

// Navigation pour admin
function AdminTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
          if (route.name === 'Accueil') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Entreprise') {
            iconName = focused ? 'business' : 'business-outline';
          } else if (route.name === 'Employés') {
            iconName = focused ? 'people' : 'people-outline';
          } else if (route.name === 'Services') {
            iconName = focused ? 'list' : 'list-outline';
          } else if (route.name === 'Profil') {
            iconName = focused ? 'person' : 'person-outline';
          }
          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#cf6679',
        tabBarInactiveTintColor: 'gray',
        headerShown: false,
      })}
    >
      <Tab.Screen name="Accueil" component={AdminHomeScreen} />
      <Tab.Screen name="Entreprise" component={ManageCompanyScreen} />
      <Tab.Screen name="Employés" component={ManageEmployeesScreen} />
      <Tab.Screen name="Services" component={ManageServicesScreen} />
      <Tab.Screen name="Profil" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkLoginStatus();
  }, []);

  const checkLoginStatus = async () => {
    try {
      const userData = await AsyncStorage.getItem('userData');
      if (userData) {
        const user = JSON.parse(userData);
        setIsLoggedIn(true);
        setUserRole(user.role);
      }
    } catch (error) {
      console.error('Error checking login status:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return null; // ou un écran de chargement
  }

  return (
    <PaperProvider>
      <NavigationContainer>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          {!isLoggedIn ? (
            <>
              <Stack.Screen name="Login" component={LoginScreen} />
              <Stack.Screen name="Register" component={RegisterScreen} />
            </>
          ) : (
            <>
              {userRole === 'user' && (
                <>
                  <Stack.Screen name="UserMain" component={UserTabs} />
                  <Stack.Screen 
                    name="BookAppointment" 
                    component={BookAppointmentScreen}
                    options={{ headerShown: true, title: 'Réserver un RDV' }}
                  />
                </>
              )}
              {userRole === 'employee' && (
                <Stack.Screen name="EmployeeMain" component={EmployeeTabs} />
              )}
              {userRole === 'admin' && (
                <Stack.Screen name="AdminMain" component={AdminTabs} />
              )}
            </>
          )}
        </Stack.Navigator>
      </NavigationContainer>
    </PaperProvider>
  );
}
