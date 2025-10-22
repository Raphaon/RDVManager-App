import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import DataService from '../../services/DataService';

export default function SearchCompanyScreen({ navigation }) {
  const [search, setSearch] = useState('');
  const [companies, setCompanies] = useState([]);
  const [filteredCompanies, setFilteredCompanies] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');

  const categories = [
    { id: 'all', name: 'Tout', icon: 'apps' },
    { id: 'Santé', name: 'Santé', icon: 'medical' },
    { id: 'Beauté', name: 'Beauté', icon: 'cut' },
    { id: 'Sport', name: 'Sport', icon: 'fitness' },
    { id: 'Services', name: 'Services', icon: 'business' },
  ];

  useEffect(() => {
    loadCompanies();
  }, []);

  useEffect(() => {
    filterCompanies();
  }, [search, selectedCategory, companies]);

  const loadCompanies = async () => {
    const data = await DataService.getCompanies();
    setCompanies(data);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadCompanies();
    setRefreshing(false);
  };

  const filterCompanies = () => {
    let filtered = companies;

    // Filtrer par catégorie
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(c => c.category === selectedCategory);
    }

    // Filtrer par recherche
    if (search.length > 0) {
      const lowerSearch = search.toLowerCase();
      filtered = filtered.filter(c =>
        c.name.toLowerCase().includes(lowerSearch) ||
        c.address?.toLowerCase().includes(lowerSearch) ||
        c.description?.toLowerCase().includes(lowerSearch)
      );
    }

    setFilteredCompanies(filtered);
  };

  const renderCompany = ({ item }) => (
    <TouchableOpacity
      style={styles.companyCard}
      onPress={() => navigation.navigate('BookAppointment', { company: item })}
    >
      <View style={styles.companyHeader}>
        <View style={styles.companyIcon}>
          <Ionicons name="business" size={32} color="#6200ee" />
        </View>
        <View style={styles.companyInfo}>
          <Text style={styles.companyName}>{item.name}</Text>
          <View style={styles.categoryBadge}>
            <Text style={styles.categoryText}>{item.category}</Text>
          </View>
        </View>
        <Ionicons name="chevron-forward" size={24} color="#999" />
      </View>

      {item.description && (
        <Text style={styles.companyDescription} numberOfLines={2}>
          {item.description}
        </Text>
      )}

      <View style={styles.companyFooter}>
        <View style={styles.companyDetail}>
          <Ionicons name="location-outline" size={16} color="#666" />
          <Text style={styles.companyDetailText}>{item.address}</Text>
        </View>
        {item.phone && (
          <View style={styles.companyDetail}>
            <Ionicons name="call-outline" size={16} color="#666" />
            <Text style={styles.companyDetailText}>{item.phone}</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );

  const renderEmptyList = () => (
    <View style={styles.emptyState}>
      <Ionicons name="business-outline" size={64} color="#ccc" />
      <Text style={styles.emptyStateText}>Aucune entreprise trouvée</Text>
      <Text style={styles.emptyStateSubtext}>
        Essayez de modifier votre recherche
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={20} color="#666" />
          <TextInput
            style={styles.searchInput}
            placeholder="Rechercher une entreprise..."
            value={search}
            onChangeText={setSearch}
            autoCapitalize="none"
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch('')}>
              <Ionicons name="close-circle" size={20} color="#999" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <View style={styles.categoriesContainer}>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={categories}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.categoryChip,
                selectedCategory === item.id && styles.categoryChipActive,
              ]}
              onPress={() => setSelectedCategory(item.id)}
            >
              <Ionicons
                name={item.icon}
                size={20}
                color={selectedCategory === item.id ? 'white' : '#666'}
              />
              <Text
                style={[
                  styles.categoryChipText,
                  selectedCategory === item.id && styles.categoryChipTextActive,
                ]}
              >
                {item.name}
              </Text>
            </TouchableOpacity>
          )}
          contentContainerStyle={styles.categoriesList}
        />
      </View>

      <FlatList
        data={filteredCompanies}
        keyExtractor={(item) => item.id}
        renderItem={renderCompany}
        contentContainerStyle={styles.list}
        ListEmptyComponent={renderEmptyList}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      />
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
    paddingTop: 60,
    paddingHorizontal: 16,
    paddingBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    paddingHorizontal: 12,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    height: 45,
    fontSize: 16,
  },
  categoriesContainer: {
    backgroundColor: 'white',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  categoriesList: {
    paddingHorizontal: 16,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    gap: 6,
  },
  categoryChipActive: {
    backgroundColor: '#6200ee',
  },
  categoryChipText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  categoryChipTextActive: {
    color: 'white',
  },
  list: {
    padding: 16,
  },
  companyCard: {
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
  companyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  companyIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  companyInfo: {
    flex: 1,
  },
  companyName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 6,
  },
  categoryBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#e3f2fd',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  categoryText: {
    fontSize: 12,
    color: '#1976d2',
    fontWeight: '600',
  },
  companyDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
    lineHeight: 20,
  },
  companyFooter: {
    gap: 8,
  },
  companyDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  companyDetailText: {
    fontSize: 13,
    color: '#666',
    flex: 1,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#999',
    marginTop: 16,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#999',
    marginTop: 8,
  },
});
