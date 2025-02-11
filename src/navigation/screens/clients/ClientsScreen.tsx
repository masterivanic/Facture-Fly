// ClientsScreen.js (for 1000003796.png)
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Customer } from '../../../interfaces';

const ClientsScreen = ({route}) => {
  console.log(route.params?.id);

  const navigation = useNavigation();
  
  const handleClientSelection = () => {
    navigation.navigate('HomeTabs', { 
      screen: 'Nouveau',
      params: {
        clientId: 2,
      }
    })
  }
  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Nom</Text>
      <TouchableOpacity 
      onPress={handleClientSelection} 
      style={styles.section}>
      <Text style={styles.boldText}>Ass</Text>
    </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  mainTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    color: '#666',
    marginBottom: 8,
  },
  boldText: {
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default ClientsScreen;