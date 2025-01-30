import React, { useState, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, StatusBar } from 'react-native';
import Signature from 'react-native-signature-canvas';
import Feather from '@expo/vector-icons/Feather';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

const NouvelleFacture = () => {
  const [invoiceNumber, setInvoiceNumber] = useState('INV0001');
  const [date, setDate] = useState('22/01/2025');
  const [client, setClient] = useState('Client');
  const [items, setItems] = useState([{ id: 1, description: '', quantity: 0, price: 0 }]);
  const [discount, setDiscount] = useState(0);
  const [tax, setTax] = useState(0);
  const [payments, setPayments] = useState(0);
  const [signature, setSignature] = useState(null);
  const signatureRef = useRef();
  const [isSigning, setIsSigning] = useState(false);

  const calculateTotal = (item) => item.quantity * item.price;
  
  const subtotal = items.reduce((sum, item) => sum + calculateTotal(item), 0);
  const totalTax = subtotal * (tax / 100);
  const total = subtotal - discount + totalTax;
  const balanceDue = total - payments;

  const addItem = () => {
    setItems([...items, { 
      id: items.length + 1, 
      description: '', 
      quantity: 0, 
      price: 0 
    }]);
  };

  const updateItem = (id, field, value) => {
    setItems(items.map(item => 
      item.id === id ? { ...item, [field]: Number(value) } : item
    ));
  };

  const handleSignature = (signature) => {
    setSignature(signature);
  };

  const clearSignature = () => {
    signatureRef.current.clearSignature();
    setSignature(null);
  };
  return (
    <ScrollView 
    scrollEnabled={!isSigning}
      keyboardShouldPersistTaps="handled"
    style={styles.container}>
        <StatusBar
                     barStyle="dark-content" 
                     backgroundColor="#00E5E5" 
                   />
      {/* Header Section */}
      <View style={styles.header}>
        <Text style={styles.invoiceNumber}>{invoiceNumber}</Text>
        <Text style={styles.headerTitle}>À payer des reception</Text>
        <Text style={styles.headerSubtitle}>Informations relatives à</Text>
      </View>

      {/* Date and Client Section */}
      <View style={styles.section}>
        <TextInput
          style={[styles.date, styles.boldText]}
          value={date}
          onChangeText={setDate}
        />
        <TextInput
          style={styles.clientInput}
          value={client}
          onChangeText={setClient}
          placeholder="Client"
        />
      </View>

      {/* Items Table */}
      <View style={styles.table}>
        <View style={styles.tableHeader}>
          <Text style={styles.colDescription}>Description</Text>
          <Text style={styles.colQuantity}>Qté</Text>
          <Text style={styles.colPrice}>Prix</Text>
          <Text style={styles.colTotal}>Total</Text>
        </View>

        {items.map((item) => (
          <View key={item.id} style={styles.itemRow}>
            <TextInput
              style={styles.colDescription}
              placeholder="Ajouter une description"
              value={item.description}
              onChangeText={(text) => updateItem(item.id, 'description', text)}
            />
            <View style={styles.colQuantity}>
              <TouchableOpacity 
                onPress={() => updateItem(item.id, 'quantity', Math.max(0, item.quantity - 1))}
                style={styles.quantityButton}
              >
                    <MaterialIcons name="highlight-remove" size={24} color="black" />              
                </TouchableOpacity>
              <TextInput
                style={styles.quantityInput}
                keyboardType="numeric"
                value={String(item.quantity)}
                onChangeText={(text) => updateItem(item.id, 'quantity', text)}
              />
              <TouchableOpacity 
                onPress={() => updateItem(item.id, 'quantity', item.quantity + 1)}
                style={styles.quantityButton}
              >
                <Feather name="plus-circle" size={24} color="#4a90e2" />
              </TouchableOpacity>
            </View>
            <TextInput
              style={styles.colPrice}
              keyboardType="numeric"
              value={String(item.price)}
              onChangeText={(text) => updateItem(item.id, 'price', text)}
            />
            <Text style={styles.colTotal}>{calculateTotal(item).toFixed(2)}€</Text>
          </View>
        ))}
      </View>

      {/* Add Item Button */}
      <TouchableOpacity style={styles.addButton} onPress={addItem}>
        <Feather name="plus-circle" size={24} color="#4a90e2" />
        <Text style={styles.addButtonText}>Ajouter un article</Text>
      </TouchableOpacity>

      {/* Totals Section */}
      <View style={styles.totalsContainer}>
        <View style={styles.totalRow}>
          <Text>Sous-total</Text>
          <Text>{subtotal.toFixed(2)}€</Text>
        </View>
        <View style={styles.totalRow}>
          <Text>Remise</Text>
          <TextInput
            style={styles.discountInput}
            keyboardType="numeric"
            value={String(discount)}
            onChangeText={(text) => setDiscount(Number(text))}
          />
        </View>
        <View style={styles.totalRow}>
          <Text>Taxe</Text>
          <TextInput
            style={styles.taxInput}
            keyboardType="numeric"
            value={String(tax)}
            onChangeText={(text) => setTax(Number(text))}
          />
        </View>
        <View style={[styles.totalRow, styles.totalHighlight]}>
          <Text style={styles.boldText}>Total</Text>
          <Text style={styles.boldText}>{total.toFixed(2)}€</Text>
        </View>
        <View style={styles.totalRow}>
          <Text>Paiements</Text>
          <TextInput
            style={styles.paymentInput}
            keyboardType="numeric"
            value={String(payments)}
            onChangeText={(text) => setPayments(Number(text))}
          />
        </View>
        <View style={[styles.totalRow, styles.balanceDue]}>
          <Text style={styles.boldText}>Solde dû</Text>
          <Text style={styles.boldText}>{balanceDue.toFixed(2)}€</Text>
        </View>
      </View>

      {/* Signature Section */}
      <View style={styles.signatureContainer}>
        <Text style={styles.sectionTitle}>Signature</Text>
        <Signature
        onBegin={() => setIsSigning(true)}
        onEnd={() => setIsSigning(false)}
          ref={signatureRef}
          onOK={handleSignature}
          style={styles.signatureBox}
          descriptionText=""
          clearText="Effacer"
          confirmText="Confirmer"
          penColor="#000"
          backgroundColor="#f8f8f8"
        />
      </View>

      {/* Send Button */}
      <TouchableOpacity style={styles.sendButton}>
        <Text style={styles.sendButtonText}>Envoyer</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 15,
  },
  header: {
    borderBottomWidth: 2,
    borderBottomColor: '#e0e0e0',
    paddingBottom: 15,
    marginBottom: 20,
  },
  invoiceNumber: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  headerTitle: {
    fontSize: 16,
    color: '#7f8c8d',
    marginTop: 5,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#95a5a6',
  },
  section: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 15,
    marginBottom: 20,
  },
  boldText: {
    fontWeight: 'bold',
  },
  table: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    marginBottom: 10,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#f8f9fa',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  itemRow: {
    flexDirection: 'row',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    alignItems: 'center',
  },
  colDescription: {
    flex: 4,
    paddingLeft: 10,
  },
  colQuantity: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  colPrice: {
    flex: 2,
    textAlign: 'right',
    paddingRight: 10,
  },
  colTotal: {
    flex: 2,
    textAlign: 'right',
    paddingRight: 10,
  },
  quantityButton: {
    padding: 5,
  },
  quantityInput: {
    width: 40,
    textAlign: 'center',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 4,
    padding: 2,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    marginVertical: 10,
    justifyContent: 'center',
  },
  addButtonText: {
    color: '#4a90e2',
    marginLeft: 8,
    fontWeight: '500',
  },
  totalsContainer: {
    marginVertical: 20,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  totalHighlight: {
    backgroundColor: '#f8f9fa',
    padding: 10,
    borderRadius: 6,
  },
  balanceDue: {
    backgroundColor: '#fff9e6',
    padding: 10,
    borderRadius: 6,
    marginTop: 10,
  },
  signatureContainer: {
    marginVertical: 20,
  },
  signatureBox: {
    height: 150,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    marginTop: 10,
  },
  sendButton: {
    backgroundColor: '#4a90e2',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginVertical: 20,
  },
  sendButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  sectionTitle: {
    fontWeight: 'bold',
    marginBottom: 8,
    fontSize: 16,
  },
});


export default NouvelleFacture;