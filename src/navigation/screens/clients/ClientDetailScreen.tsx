// ClientDetailScreen.js (for 1000003795.png)
import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, StatusBar } from 'react-native';

const ClientDetailScreen = ({route}: {route: any}) => {
  const { clientId } = route.params || {};
  return (
    <ScrollView style={styles.container}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor="#00E5E5"
      />
      <Text style={styles.mainTitle}>Client</Text>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Ass</Text>
        <Text style={styles.contentText}>elhadji.sarr@outlook.com</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Portable</Text>
        <Text style={styles.contentText}>Téléphone</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Fax</Text>
        <Text style={styles.contentText}>Numéro de fax</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Contact</Text>
        <Text style={styles.contentText}>Adresse 1</Text>
        <Text style={styles.contentText}>Adresse 2</Text>
        <Text style={styles.contentText}>Adresse 3</Text>
      </View>

      <TouchableOpacity style={styles.importButton}>
        <Text style={styles.importButtonText}>Importer depuis les contacts</Text>
      </TouchableOpacity>
    </ScrollView>
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
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    color: '#666',
    marginBottom: 8,
  },
  contentText: {
    fontSize: 16,
    marginBottom: 4,
  },
  importButton: {
    marginTop: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: '#007AFF',
    borderRadius: 8,
    alignItems: 'center',
  },
  importButtonText: {
    color: '#007AFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default ClientDetailScreen;