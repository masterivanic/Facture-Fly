import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, StatusBar, Image } from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { Customer } from '../../../interfaces';
import { getClient, updateClient } from '../../../api/auth';
import { formatDate } from '../../../utils';
import { useNavigation } from '@react-navigation/native';
import Feather from '@expo/vector-icons/Feather';
import Fontisto from '@expo/vector-icons/Fontisto';

const ClientDetailScreen = ({ route }: { route: any }) => {
  const {  clientId, factureId } = route.params || {};
  const navigation = useNavigation();
  const [client, setClient] = useState<Customer | null>(null);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [fax, setFax] = useState('');
  const [address, setAddress] = useState('');
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    getClient(clientId).then(client => {
      setClient(client);
      setFirstName(client?.first_name || '');
      setLastName(client?.last_name || '');
      setEmail(client?.email || '');
      setAddress(client?.adress || '');
    });
  }, [clientId]);
  const handleSave = async () => {
    try {
      if (client && clientId) {  
        const updatedClient = await updateClient(clientId, {
          ...client,  
          first_name: firstName,
          last_name: lastName,
          email,
          adress: address,
          id: clientId,  
        });
        setClient(updatedClient);
        setIsEditing(false);
      }
    } catch (error) {
      console.error('Update failed:', error);
    }
  };

  const formatCustomDateStr = (date: string)=>{
    const year = date.substring(0, 4);
    const month = date.substring(5, 7);
    const day = date.substring(8, 10);
    return `${day}/${month}/${year}`;
  }
  return (
    <ScrollView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#00C2D4" />
      
     {/* Header with Save Button */}
     <View style={styles.header}>
        <TouchableOpacity onPress={()=> navigation.reset({
          index: 0,
          routes: [{ name: 'HomeTabs', params: { screen: 'Nouveau', params: { factureId } } }]
        })}>
          <Ionicons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Information du client</Text>
        <TouchableOpacity onPress={isEditing ? handleSave : () => setIsEditing(true)}>
          <Text style={editStyles.editButton}>
            {isEditing ? <Fontisto name="save" size={24} color="black" /> : <Feather name="edit" size={24} color="black" />}
          </Text>
        </TouchableOpacity>
      </View>


      <View style={styles.card}>
        <Text style={styles.cardTitle}>Informations personnelles</Text>
        <View style={styles.row}>
          <Text style={styles.label}>Prénom</Text>
          <Text style={styles.value}>
            {client?.first_name} 
          </Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Nom</Text>
          <Text style={styles.value}>
            {client?.last_name} 
          </Text>
        </View>
        
      </View>

      {/* Contact Information Card */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Contact</Text>
        
        <View style={styles.infoItem}>
          <Ionicons name="mail" size={20} color="#4E8AF4" />
          <Text style={styles.infoText}>{client?.email}</Text>
        </View>

       {/*  {client.phone && (
          <View style={styles.infoItem}>
            <Ionicons name="phone-portrait" size={20} color="#4E8AF4" />
            <Text style={styles.infoText}>{client.phone}</Text>
          </View>
        )}

        {client.fax && (
          <View style={styles.infoItem}>
            <MaterialIcons name="fax" size={20} color="#4E8AF4" />
            <Text style={styles.infoText}>{client.fax}</Text>
          </View>
        )} */}
      </View>

      

      {/* Address Card */}
      {client?.adress && (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Adresse</Text>
          <View style={styles.infoItem}>
            <Ionicons name="location" size={20} color="#4E8AF4" />
            <Text style={styles.infoText}>
              {client?.adress.split(',').join('\n')}
            </Text>
          </View>
        </View>
      )}

      {/* Membership Section */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Informations supplémentaires</Text>
        <View style={styles.row}>
          <Text style={styles.label}>Ajouté le:</Text>
          <Text style={styles.value}>
            {client?.date_joined ? formatCustomDateStr(client.date_joined.toString()) : '-'}
          </Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>ID Client:</Text>
          <Text style={styles.value}>#{client?.id.toString().padStart(4, '0')}</Text>
        </View>
      </View>

      <TouchableOpacity style={styles.importButton}>
        <Text style={styles.importButtonText}>Importer depuis les contacts</Text>
        <Ionicons name="download" size={20} color="#4E8AF4" />
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  avatarPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#E7F0FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatarText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4E8AF4',
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  infoText: {
    fontSize: 16,
    color: '#333',
    marginLeft: 12,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  label: {
    fontSize: 14,
    color: '#666',
  },
  value: {
    fontSize: 14,
    color: '#1A1A1A',
    fontWeight: '500',
  },
  importButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#E7F0FF',
    padding: 16,
    borderRadius: 8,
    margin: 16,
  },
  importButtonText: {
    color: '#4E8AF4',
    fontWeight: '600',
    marginRight: 8,
  },
  headerTitle: {
    color: 'black',
    fontSize: 20,
    fontWeight: '600',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#00C2D4',
    marginBottom: 16,
  },
});
// Add these new styles to your StyleSheet
const editStyles = StyleSheet.create({
  editButton: {
    color: 'black',
    fontSize: 16,
    fontWeight: '600',
  },
  inputContainer: {
    marginBottom: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: 'white',
  },
  iconInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconInput: {
    flex: 1,
    marginLeft: 8,
  },
  multilineInput: {
    height: 80,
    textAlignVertical: 'top',
  },
});

export default ClientDetailScreen;