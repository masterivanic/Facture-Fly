// ClientsScreen.js (for 1000003796.png)
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, StatusBar, FlatList } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Customer } from '../../../interfaces';
import { getClients } from '../../../api/auth';
import { 
  Image,
  SafeAreaView,
  TextInput
} from 'react-native';

import { Ionicons } from '@expo/vector-icons';
import AntDesign from '@expo/vector-icons/AntDesign';

const ClientsScreen = ({route}: {route: any}) => {
  const [clients, setClients] = useState<Customer[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const navigation = useNavigation();

  useEffect(() => {
    getClients().then(setClients);
  }, []);
  const {  factureId } = route.params || {};
  const handleClientSelection = (clientId: number) => {
    navigation.reset({
      index: 0,
      routes: [{ 
        name: 'HomeTabs', 
        params: { 
          screen: 'Nouveau', 
          params: { clientId, factureId } 
        } 
      }]
    });
  };

  const filteredClients = clients.filter(client =>
    client.first_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    client.last_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    client.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#00C2D4" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={()=> navigation.reset({
          index: 0,
          routes: [{ name: 'HomeTabs', params: { screen: 'Nouveau', params: { factureId } } }]
        })}>
          <Ionicons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Choisir un client</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#888" />
        <TextInput
          style={styles.searchInput}
          placeholder="Search customers..."
          placeholderTextColor="#888"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {/* Customer List */}
      <FlatList
        data={filteredClients}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity 
            style={styles.clientCard}
            onPress={() => handleClientSelection(item.id)}
          >
            <View style={styles.avatar}>
                <Ionicons name="person" size={24} color="#00C2D4" />
            </View>
            
            <View style={styles.clientInfo}>
              <Text style={styles.clientName}>{item.first_name} {item.last_name}</Text>
              {item.email && (
                <Text style={styles.companyName}>{item.email}</Text>
              )}
            </View>
            
            <Ionicons name="chevron-forward" size={20} color="#CCCCCC" />
          </TouchableOpacity>
        )}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        contentContainerStyle={styles.listContent}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#00C2D4',
  },
  headerTitle: {
    color: 'black',
    fontSize: 20,
    fontWeight: '600',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    margin: 16,
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
    color: '#333',
  },
  listContent: {
    paddingHorizontal: 16,
  },
  clientCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginVertical: 4,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E8F9FD',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  avatarImage: {
    width: '100%',
    height: '100%',
    borderRadius: 20,
  },
  clientInfo: {
    flex: 1,
  },
  clientName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  companyName: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  separator: {
    height: 1,
    backgroundColor: '#EEE',
    marginVertical: 4,
  },
});

export default ClientsScreen;