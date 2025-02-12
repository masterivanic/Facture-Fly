import React, { useState, useRef, useEffect, useMemo } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, StatusBar, Platform } from 'react-native';
import Signature from 'react-native-signature-canvas';
import Feather from '@expo/vector-icons/Feather';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import AntDesign from '@expo/vector-icons/AntDesign';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Invoice, Customer, Article, InvoiceWithArticles } from '../../interfaces';
import { CustomDatePicker } from '../components/CustomDatePicker';
import { useNavigation } from '@react-navigation/native';
import { getClient } from '../../api/auth';
import { getArticlesByIds, getInvoiceById, updateInvoice } from '../../api/invoice';
import debounce from 'lodash.debounce'

interface StateRef {
  emissionDate: Date;
  dueDate: Date;
  discount: number;
  tax: number;
  payments: number;
  customer: Customer | null;
  items: Article[];
  signature: null;
  isPaid: boolean;
  total: number;
  invoice: Invoice | null;
}

const NouvelleFacture = ({route}: {route: any}) => {
  const {  clientId, factureId } = route.params || {};
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [invoiceLibelle, setInvoiceLibelle] = useState('');
  const [emissionDate, setEmissionDate] = useState(new Date());
  const [dueDate, setDueDate] = useState(new Date());
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [items, setItems] = useState<Article[]>([]);
  const [discount, setDiscount] = useState(0);
  const [tax, setTax] = useState(0);
  const [payments, setPayments] = useState(0);
  const [signature, setSignature] = useState(null);
  const signatureRef = useRef();
  const [isSigning, setIsSigning] = useState(false);
  const [isPaid, setIsPaid] = useState(false);

  useEffect(() => {
    const fetchClient = async () => {
      console.log("from NF clientId", clientId);
      if(clientId ) {
        const data = await getClient(clientId);
        if (data) {  
          setCustomer(data);
        } 
      }
    };
    fetchClient();
  }, [clientId]);
  useEffect(() => {
    const fetchInvoice = async () => {
      console.log("from NF factureId", factureId);
      if(factureId) {
        const data = await getInvoiceById(factureId);
        if (data) {
          console.log("from NF data", data);
          const articles_data = await getArticlesByIds(data.article);
          if(data.customer){
            const client_data = await getClient(data.customer);
            if(client_data) {
              
              setCustomer(client_data);
            }
          }
          setInvoice(data);
          setInvoiceLibelle(data.label);
          setEmissionDate(new Date(data.emission_date));
          setDueDate(new Date(data.due_date));
          setDiscount(data.discount || 0);
          setTax(data.taxe || 0);
          setPayments(data.paid_amount || 0);
          setItems(articles_data);
          setIsPaid(data.is_paid);
        }
      }
    };
    fetchInvoice();
  }, [factureId]);



  const calculateTotal = (item: Article) => item.quantity * item.price;

  const subtotal = items.reduce((sum, item) => sum + calculateTotal(item), 0);
  const totalTax = subtotal * (tax / 100);
  const total = subtotal - discount + totalTax;
  const balanceDue = total - payments;

  const addItem = () => {
    setItems([...items, {
      id: items.length + 1,
      label: '',
      quantity: 0,
      price: 0,
      description: '',
      user: 1,
      facture: 1
    }]);
  };
  const removeItem = (id: number) => {
    setItems(items.filter(item => id !== item.id))
  }

  const updateItem = (id: number, field: string, value: number | string) => {
    setItems(items.map(item =>
      item.id === id ? { ...item, [field]: typeof value === 'string' ? Number(value) : value } : item
    ));
  };

  const handleSignature = (signature) => {
    setSignature(signature);
  };

  const [apayer_str, setApayerStr] = useState('');
  const updateApayerStr = () => {
    if (dueDate.getTime() == emissionDate.getTime()) {
      setApayerStr('À payer dés la récéption');
    }else if(dueDate.getTime() > new Date().getTime()) {
      const differenceInDays = Math.ceil((dueDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
      setApayerStr(`À payer dans ${differenceInDays} jours`);
    }else {
      setApayerStr('Facture en retard');
    }
  }
  useEffect(() => {
    updateApayerStr();
  }, [dueDate, emissionDate]);
  const navigation = useNavigation();

  const handleCustomeSelection = () => {
    if(customer != null) {
      navigation.reset({
        index: 0,
        routes: [{ name: 'ClientsStack', params: { screen: 'ClientDetail' } }]
      });
    }else {
      navigation.reset({
        index: 0,
        routes: [{ name: 'ClientsStack', params: { screen: 'Clients', params: { id:2 } } }]
      });
    }
  }
  async function updateInvoiceLabel(label: string, currentState: any) {
    try {
      const invoice_with_articles = syncInvoice(label, currentState);
      if (invoice_with_articles) { 
        console.log("invoiceWArticles label updated", invoice_with_articles.label);
        await updateInvoice(invoice_with_articles);
      }
    } catch (error) {
      console.error("Error updating label:", error);
    }
  }
  
  const stateRef = useRef<StateRef>();
  stateRef.current = {
    emissionDate,
    dueDate,
    discount,
    tax,
    payments,
    customer,
    items,
    signature,
    isPaid,
    total,
    invoice,
  };
  
  const syncInvoice = (label: string, currentState: any): InvoiceWithArticles | null => {
    //TODO: Philippe will update the endpoint to update the invoice
    //For now, we are just creating another interface to update the invoice by also passing the articles
    //Not great but Ok for now
    if (currentState.invoice) {
      return {
        id: currentState.invoice.id,
        label: label,
        emission_date: currentState.emissionDate,
        due_date: currentState.dueDate.toISOString().split('T')[0],
        discount: currentState.discount,
        taxe: currentState.tax,
        paid_amount: currentState.payments,
        customer: currentState.customer?.id || null,
        article: currentState.items.map(item => item),
        signature: currentState.signature,
        is_paid: currentState.isPaid,
        amount: currentState.total,
        user: 1,
      };
    }
    return null;
  };
  
  const debouncedUpdate = useMemo(
    () =>
      debounce((label: string) => {
        updateInvoiceLabel(label, stateRef.current);
      }, 500),
    []
  );
  
  

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
      <TextInput
        style={styles.invoiceNumber}
        value={invoiceLibelle}
        onChangeText={(text) => {
          setInvoiceLibelle(text);
          debouncedUpdate(text);
        }}
        placeholder="Libellé de la facture"
      />
        <Text style={styles.apayer}>{apayer_str}</Text>
      </View>
      <View style={styles.section}>
        <Text style={{fontWeight: '500', fontSize: 16}}>Date D'émission</Text>
        <CustomDatePicker date={emissionDate} setDate={setEmissionDate} />
      </View>
      {/* Due Date Section */}
      <View style={styles.section}>
        <Text style={{fontWeight: '500', fontSize: 16}}>Date D'échéance</Text>
        <CustomDatePicker date={dueDate} setDate={setDueDate} />
      </View>

      {/* Date and Client Section */}
      {/* TODO Add a date picker component */}
      <View style={styles.section}>
      <Text style={{fontWeight: '500', fontSize: 16}}>Client</Text>
        <TouchableOpacity onPress={handleCustomeSelection}>
          {customer == null ? <Text>Sélectionner un client</Text> : <Text>{customer?.first_name} {customer?.last_name}</Text>}
        </TouchableOpacity>
      </View>

      {/* Items Table */}
      <View style={styles.table}>
        <View style={styles.tableHeader}>
          <Text style={styles.colDescription}>Libellé</Text>
          <Text style={styles.colQuantity}>Qantité</Text>
          <Text style={styles.colPrice}>Prix</Text>
          <Text style={styles.colTotal}>Total</Text>
        </View>

        {items.map((item) => (
          <View key={item.id}>
            <TouchableOpacity
              onPress={() => removeItem(item.id)}
              style={styles.quantityButton}
            >
              <Ionicons name="remove-circle" size={24} color="black" />
            </TouchableOpacity>
            <View style={styles.itemRow}>
              <TextInput
                style={styles.colDescription}
                placeholder="Ajouter un libellé"
                value={item.label}
                onChangeText={(text) => updateItem(item.id, 'label', text)}
              />
              <View style={styles.colQuantity1}>
                <TouchableOpacity
                  onPress={() => updateItem(item.id, 'quantity', item.quantity + 1)}
                  style={styles.quantityButton}
                >
                  <Feather name="plus-circle" size={24} color="#4a90e2" />
                </TouchableOpacity>

                <TextInput
                  style={styles.quantityInput}
                  keyboardType="numeric"
                  value={String(item.quantity)}
                  onChangeText={(text) => updateItem(item.id, 'quantity', text)}
                />

                <TouchableOpacity
                  onPress={() => updateItem(item.id, 'quantity', Math.max(0, item.quantity - 1))}
                  style={styles.quantityButton}
                >
                  <AntDesign name="minuscircleo" size={20} color="red" />
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
        <View style={[styles.sousTotalRow, styles.balanceDue, styles.change]}>
          <Text style={styles.sousTotalText}>Sous-total</Text>
          <Text style={styles.sousTotalText}>{subtotal.toFixed(2)}€</Text>
        </View>
        <View style={styles.totalRow}>
          <Text>Remise</Text>
          <View style={{flexDirection: 'row', alignItems: 'center'}}>
            <TextInput
              keyboardType="numeric"
              value={String(discount)}
              onChangeText={(text) => setDiscount(Number(text))}
            />
            <Text>%</Text>
          </View>
        </View>
        <View style={styles.totalRow}>
          <Text>Taxe</Text>
          <View style={{flexDirection: 'row', alignItems: 'center'}}>
            <TextInput
              keyboardType="numeric"
              value={String(tax)}
              onChangeText={(text) => setTax(Number(text))}
            />
            <Text>%</Text>
          </View>
        </View>
        <View style={[styles.sousTotalRow, styles.balanceDue, styles.change]}>
          <Text style={styles.sousTotalText}>Total</Text>
          <Text style={styles.sousTotalText}>{total.toFixed(2)}€</Text>
        </View>
        <View style={styles.totalRow}>
          <Text>Paiements</Text>
          <TextInput
            keyboardType="numeric"
            value={String(payments)}
            onChangeText={(text) => setPayments(Number(text))}
          />
        </View>
        <View style={[styles.sousTotalRow, styles.balanceDue, styles.change]}>
          <Text style={styles.sousTotalText}>Solde dû</Text>
          <Text style={styles.sousTotalText}>{balanceDue.toFixed(2)}€</Text>
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
    backgroundColor:'#CFDEEC',
    padding: 15,
  },
  change: {
    backgroundColor: '#0C897B',
  },
  header: {
    borderBottomWidth: 2,
    borderBottomColor: 'white',
    paddingBottom: 15,
    marginBottom: 10,
  },
  invoiceNumber: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  apayer: {
    alignSelf: 'flex-start',
    padding: 10,
    fontSize: 13,
    color: 'white',
    backgroundColor: '#0C897B',
    borderRadius: 5,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#95a5a6',
  },
  section: {
    flexDirection: 'row',
    alignItems: 'center', 
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 15,
    marginBottom: 8,
    gap: 10,
  },
  boldText: {
    fontWeight: 'bold',
  },
  table: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    marginBottom: 10,
    backgroundColor: '#f8f9fa',
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
  colQuantity1: {
    flex: 2,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'space-between',
    display: 'flex',
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
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'white',

  },

  sousTotalRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,

  },

  sousTotalText: {
    color: 'white',
    fontSize: 13,
    fontWeight: 'bold',
  },
  totalHighlight: {
    backgroundColor: '#f8f9fa',
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
  }

});


export default NouvelleFacture;