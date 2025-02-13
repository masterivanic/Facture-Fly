import React, { useState, useRef, useEffect, useMemo } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, StatusBar, Platform, Switch, Alert } from 'react-native';
import Signature from 'react-native-signature-canvas';
import Feather from '@expo/vector-icons/Feather';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import AntDesign from '@expo/vector-icons/AntDesign';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Invoice, Customer, Article, InvoiceWithArticles } from '../../interfaces';
import { CustomDatePicker } from '../components/CustomDatePicker';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { getAccessToken, getClient } from '../../api/auth';
import { createDefaultInvoice, getArticlesByIds, getInvoiceById, updateInvoice } from '../../api/invoice';
import debounce from 'lodash.debounce'
import { transformInvoice } from '../../helpers';
import { Share } from 'react-native';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { API_URL } from '../../constants';


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
interface InvoiceState {
  invoiceLibelle: string;
  emissionDate: Date;
  dueDate: Date;
  discount: number;
  tax: number;
  payments: number;
  customer: Customer | null;
  items: Article[];
  signature: string | null;
  isPaid: boolean;
  total: number;
  invoice: Invoice | null;
}

const NouvelleFacture = ({ route }: { route: any }) => {
  const { clientId, factureId } = route.params || {};
  const [initialLoad, setInitialLoad] = useState(true);
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
  const signatureRef = useRef<any>(null);
  const [isSigning, setIsSigning] = useState(false);
  const [isPaid, setIsPaid] = useState(false);
  const [signatureKey, setSignatureKey] = useState(0);
  const emissionDateFirstUpdate = useRef(true);
  const dueDateFirstUpdate = useRef(true);


  // When the screen is focused, update the key to force remount
  useFocusEffect(
    React.useCallback(() => {
      setSignatureKey((prevKey) => prevKey + 1);
    }, [])
  );


  useEffect(() => {
    const fetchClient = async () => {
      if (clientId) {
        const data = await getClient(clientId);
        if (data) {
          setCustomer(data);
          const currentState = stateRef.current;
          currentState.customer = data;
          const invoiceData = syncInvoice(currentState);
          if (invoiceData) {
            await updateInvoice(invoiceData);
          }
        }
      }
    };
    fetchClient();
  }, [clientId]);


  useEffect(() => {
    const fetchInvoice = async () => {
      try {
        let invoiceData;
        if (factureId) {
          invoiceData = await getInvoiceById(factureId);
          if (invoiceData) {
            const articles_data = await getArticlesByIds(invoiceData.article);
            if (invoiceData.customer) {
              const client_data = await getClient(invoiceData.customer);
              client_data && setCustomer(client_data);
            }

            // Date comparison to prevent unnecessary updates
            const newEmissionDate = new Date(invoiceData.emission_date);
            const newDueDate = new Date(invoiceData.due_date);

            setInvoice(invoiceData);
            setInvoiceLibelle(invoiceData.label);
            if (newEmissionDate.getTime() !== emissionDate.getTime()) {
              setEmissionDate(newEmissionDate);
            }
            if (newDueDate.getTime() !== dueDate.getTime()) {
              setDueDate(newDueDate);
            }
            setDiscount(invoiceData.discount || 0);
            setTax(invoiceData.taxe || 0);
            setPayments(invoiceData.paid_amount || 0);
            setItems(articles_data);
            setIsPaid(invoiceData.is_paid);
          }
        } else {
          invoiceData = await createDefaultInvoice();
          if (invoiceData) {
            const transformed = transformInvoice(invoiceData);
            setInvoice(transformed);
            setInvoiceLibelle(transformed.label);
            setEmissionDate(new Date(transformed.emission_date));
            setDueDate(new Date(transformed.due_date));
            setDiscount(transformed.discount || 0);
            setTax(transformed.taxe || 0);
            setPayments(transformed.paid_amount || 0);
            setItems(invoiceData.article);
            setIsPaid(transformed.is_paid);
          }
        }
      } finally {
        setInitialLoad(false);
      }
    };

    fetchInvoice();
  }, [factureId]);
  const updateField = async (field: keyof InvoiceState, value: any) => {
    if (initialLoad) return;
    console.log("i am fucking updating", field, value);
    const currentState = stateRef.current;
    const data = syncInvoice({ ...currentState, [field]: value });
    data && await updateInvoice(data);
  };


  const syncInvoice = (currentState: InvoiceState): InvoiceWithArticles | null => {
    if (!currentState.invoice) return null;

    return {
      id: currentState.invoice.id,
      label: currentState.invoiceLibelle,
      emission_date: currentState.emissionDate,
      due_date: currentState.dueDate.toISOString().split('T')[0],
      discount: currentState.discount,
      taxe: currentState.tax,
      paid_amount: currentState.payments,
      customer: currentState.customer?.id || null,
      article: currentState.items.map(item => item),
      signature: currentState.signature,
      is_paid: currentState.isPaid || false,
      amount: currentState.total,
      user: 1,
    };
  };


  const calculateTotal = (item: Article) => item.quantity * item.price;

  const subtotal = items.reduce((sum, item) => sum + calculateTotal(item), 0);
  const totalTax = subtotal * (tax / 100);
  const totalDiscount = subtotal * (discount / 100);
  const total = subtotal - totalDiscount + totalTax;
  const balanceDue = total - payments;


  const invoiceState: InvoiceState = {
    invoiceLibelle,
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
    invoice
  };
  const stateRef = useInvoiceStateRef(invoiceState);

  const addItem = async () => {
    const newItems = [...items, {
      id: items.length + 1,
      label: 'New Item',
      quantity: 0,
      price: 0,
      description: '',
      user: 1,
      facture: 1
    }]
    setItems(newItems);
    const currentState = stateRef.current;
    currentState.items = newItems;
    const data = syncInvoice(currentState);
    if (data) {
      await updateInvoice(data);
    }
  };

  const removeItem = async (id: number) => {
    const newItems = items.filter(item => id !== item.id);
    setItems(newItems);
    const currentState = stateRef.current;
    currentState.items = newItems;
    const data = syncInvoice(currentState);
    if (data) {
      await updateInvoice(data);
    }
  }
  const debouncedLabelUpdate = debounce(async (state) => {
    const data = syncInvoice(state);
    if (data) {
      await updateInvoice(data);
    }
  }, 500);

  const updateItem = async (id: number, field: string, value: number | string) => {
    const newItems = items.map(item =>
      item.id === id ? { ...item, [field]: value } : item
    );

    setItems(newItems);
    const currentState = stateRef.current;
    currentState.items = newItems;

    if (field === 'label') {
      // Debounce only for label updates
      debouncedLabelUpdate(currentState);
    } else {
      // Immediate update for other fields
      const data = syncInvoice(currentState);
      if (data) {
        await updateInvoice(data);
      }
    }
  };
  useEffect(() => {
    return () => {
      debouncedLabelUpdate.cancel();
    };
  }, []);

  const handleSignature = (signature: any) => {
    setSignature(signature);
  };

  const [apayer_str, setApayerStr] = useState('');
  const updateApayerStr = () => {
    if (dueDate.getTime() == emissionDate.getTime()) {
      setApayerStr('À payer dés la récéption');
    } else if (dueDate.getTime() > new Date().getTime()) {
      const differenceInDays = Math.ceil((dueDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
      setApayerStr(`À payer dans ${differenceInDays} jours`);
    } else {
      setApayerStr('Facture en retard');
    }
  }
  useEffect(() => {
    updateApayerStr();
  }, [dueDate, emissionDate]);
  const navigation = useNavigation();

  const handleCustomeSelection = () => {
    if (customer != null) {
      navigation.reset({
        index: 0,
        routes: [{ name: 'ClientsStack', params: { screen: 'ClientDetail', params: { clientId: customer.id, factureId: invoice?.id } } }]
      });
    } else {
      navigation.reset({
        index: 0,
        routes: [{ name: 'ClientsStack', params: { screen: 'Clients', params: { factureId: invoice?.id } } }]
      });
    }
  }


  // Create a custom hook for state management
  function useInvoiceStateRef(initialState: InvoiceState) {
    const stateRef = useRef<InvoiceState>(initialState);

    // Update ref on every render
    useEffect(() => {
      stateRef.current = initialState;
    });

    return stateRef;
  }

  const debouncedUpdate = useMemo(
    () => debounce(() => {
      updateInvoiceLabel(stateRef.current);
    }, 500),
    []
  );

  async function updateInvoiceLabel(currentState: InvoiceState) {
    try {
      const invoiceWithArticles = syncInvoice(currentState);
      if (invoiceWithArticles) {
        if (invoiceWithArticles.label.length > 0) {
          await updateInvoice(invoiceWithArticles);
        }
      }
    } catch (error) {
      console.error('Update error:', error);
    }
  }

  useEffect(() => {
    if (emissionDateFirstUpdate.current) {
      emissionDateFirstUpdate.current = false;
      return;
    }
    if (!initialLoad) {
      updateField('emissionDate', emissionDate);
    }
  }, [emissionDate]);


  useEffect(() => {
    if (dueDateFirstUpdate.current) {
      dueDateFirstUpdate.current = false;
      return;
    }
    if (!initialLoad) {
      updateField('dueDate', dueDate);
    }
  }, [dueDate]);
  useEffect(() => {
    emissionDateFirstUpdate.current = true;
    dueDateFirstUpdate.current = true;
  }, [factureId]);

  const handlePaidStatusChange = async (value: boolean) => {
    if (initialLoad) return;

    setIsPaid(value);
    const currentState = stateRef.current;
    const data = syncInvoice({ ...currentState, isPaid: value });
    data && await updateInvoice(data);
  };
  const shareContent = async () => {
    try {
      const result = await Share.share({
        message: 'Check out this awesome app!',
        title: 'Share via',
        url: 'https://expo.dev' // iOS only for URL
      });

      if (result.action === Share.sharedAction) {
        if (result.activityType) {
          // Shared with activity type (iOS specific)
          console.log('Shared with', result.activityType);
        } else {
          // Shared successfully
          console.log('Share completed');
        }
      } else if (result.action === Share.dismissedAction) {
        // Share dismissed
        console.log('Share dismissed');
      }
    } catch (error: any) {
      console.error('Error sharing:', error.message);
    }
  };
  const handleShare = async () => {
    try {
      // 1. Define API URL and local file path
      const apiUrl = `${API_URL}/facturation/invoice/preview/${invoice?.id}/`;
      const fileUri = FileSystem.documentDirectory + 'invoice_Facture.docx';

      // 2. Download the file from API
      const token = await getAccessToken()
      const downloadResult = await FileSystem.downloadAsync(
        apiUrl,
        fileUri,
        {
          headers: {
            Accept: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // 3. Check if file downloaded successfully
      if (downloadResult.status !== 200) {
        throw new Error('Failed to download file');
      }

      // 4. Check if sharing is available
      if (!(await Sharing.isAvailableAsync())) {
        Alert.alert('Sharing not available on this device');
        return;
      }

      // 5. Share the file
      await Sharing.shareAsync(fileUri, {
        mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        dialogTitle: 'Share Invoice',
        UTI: 'com.microsoft.word.doc' // iOS specific
      });

    } catch (error: any) {
      Alert.alert('Error', error.message);
      console.error('Sharing failed:', error);
    }
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
        <TextInput
          style={styles.invoiceNumber}
          value={invoiceLibelle}
          onChangeText={(text) => {

            setInvoiceLibelle(text);
            debouncedUpdate();
          }}
          placeholder="Libellé de la facture"
        />
        <Text style={styles.apayer}>{apayer_str}</Text>
      </View>
      <View style={styles.section}>
        <Text style={{ fontWeight: '500', fontSize: 16 }}>Date D'émission</Text>
        <CustomDatePicker date={emissionDate} setDate={setEmissionDate} />
      </View>
      {/* Due Date Section */}
      <View style={styles.section}>
        <Text style={{ fontWeight: '500', fontSize: 16 }}>Date D'échéance</Text>
        <CustomDatePicker date={dueDate} setDate={setDueDate} />
      </View>

      {/* Date and Client Section */}
      {/* TODO Add a date picker component */}
      <View style={styles.section}>
        <Text style={{ fontWeight: '500', fontSize: 16 }}>Client</Text>
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
        <View style={styles.totalRow}>
          <Text>Statut de paiement</Text>
          <Switch
            value={isPaid}
            onValueChange={handlePaidStatusChange}
            trackColor={{ false: '#767577', true: '#81b0ff' }}
            thumbColor={isPaid ? '#0C897B' : '#f4f3f4'}
          />
        </View>
        <View style={[styles.sousTotalRow, styles.balanceDue, styles.change]}>
          <Text style={styles.sousTotalText}>Sous-total</Text>
          <Text style={styles.sousTotalText}>{subtotal.toFixed(2)}€</Text>
        </View>
        <View style={styles.totalRow}>
          <Text>Remise</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <TextInput
              keyboardType="numeric"
              value={String(discount)}
              onChangeText={async (text) => {
                setDiscount(Number(text));
                const currentState = stateRef.current;
                currentState.discount = Number(text);
                const data = syncInvoice(currentState);
                if (data) await updateInvoice(data);
              }}
            />
            <Text>%</Text>
          </View>
        </View>
        <View style={styles.totalRow}>
          <Text>Taxe</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <TextInput
              keyboardType="numeric"
              value={String(tax)}
              onChangeText={async (text) => {
                setTax(Number(text));
                const currentState = stateRef.current;
                currentState.tax = Number(text);
                const data = syncInvoice(currentState);
                if (data) await updateInvoice(data);
              }}
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
            onChangeText={async (text) => {
              setPayments(Number(text));
              const currentState = stateRef.current;
              currentState.payments = Number(text);
              const data = syncInvoice(currentState);
              if (data) await updateInvoice(data);
            }}
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
          key={signatureKey} // remounts the component when key changes
          onBegin={() => setIsSigning(true)}
          onEnd={() => setIsSigning(false)}
          onOK={handleSignature}
          style={styles.signatureBox}
          descriptionText="Hello"
          clearText="Effacer"
          confirmText="Confirmer"
          penColor="#000"
          backgroundColor="#f8f8f8"
        />
      </View>

      {/* Send Button */}
      <TouchableOpacity onPress={handleShare} style={styles.sendButton}>
        <Text style={styles.sendButtonText} >Envoyer</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#CFDEEC',
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