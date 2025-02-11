import { Button, Text } from '@react-navigation/elements';
import { useEffect, useState } from 'react';
import { FlatList, StatusBar, StyleSheet, View, TouchableOpacity } from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { globalStyles } from '../../styles/global';
import { formatCurrency, transformInvoices } from '../../helpers';
import axios from "axios";
import getInvoices from '../../api/invoice';
import { InvoiceDisplayed, MonthlyInvoices } from '../../interfaces';
import { useNavigation } from '@react-navigation/native';



export function Factures() {
  const [factures, setFactures] = useState<MonthlyInvoices[]>([]);

  useEffect(() => {
    fetchInvoices();
  }, []);

  const fetchInvoices = async () => {
    try {
      const results = await getInvoices();
      if (results) {
        const transformedData = transformInvoices(results);
        setFactures(transformedData);
      }
    } catch (error) {
      console.error("Error fetching invoices:", error);
    }
  };
  return (
    <View style={styles.container}>
     <StatusBar
             barStyle="dark-content" 
             backgroundColor="#00E5E5" 
           />
      {
       factures.length > 0 ?
        <FacturesList invoices={factures}/>
          :
        <View style={{ flex:1, justifyContent:'center', alignItems:'center', gap:20}}>
            <FontAwesome name="search-minus" size={42} color="black" />
            <Text style={{fontSize:16, textAlign:'center'}}>
            Vos factures s’afficheront ici.Cliquez sur le bouton plus pour créer une nouvelle facture
            </Text>
        </View>
      }

    </View>
  );
}
const FacturesList = ({invoices}:{invoices: MonthlyInvoices[]})=>{
  const navigation = useNavigation();
  const handleInvoicePress = (item:InvoiceDisplayed) => {
    navigation.navigate('HomeTabs', { screen: 'Nouveau', params: { factureId: item.id } })
  }
  const renderInvoice = ({ item }:{item:InvoiceDisplayed}) => (
    <TouchableOpacity style={globalStyles.invoiceCard} onPress={()=>handleInvoicePress(item)}>
      <Text style={globalStyles.clientText}>{item.client}</Text>
      <Text style={globalStyles.amountText}>{formatCurrency(item.amount)}</Text>
      <Text style={globalStyles.invoiceNumber}>{item.invoiceNumber}</Text>
    </TouchableOpacity>
  );
  const renderSection = ({ item }:{item:MonthlyInvoices}) => (
    <View style={globalStyles.sectionContainer}>
      {/* Month Header */}
      <View style={globalStyles.sectionHeader}>
        <Text style={globalStyles.monthText}>{item.month}</Text>
        <Text style={globalStyles.totalText}>{formatCurrency(item.total)}</Text>
      </View>

      {/* Invoice List */}
      <FlatList
        data={item.data}
        renderItem={renderInvoice}
        keyExtractor={(invoice, index) => `${item.month}-${index}`}
      />
    </View>
  );
  return (
    <View style={styles.container}>
      <FlatList
        data={invoices}
        renderItem={renderSection}
        keyExtractor={(item, index) => `${item.month}-${index}`}
      />
    </View>
  );
}
{/* <Button screen="Profile" params={{ user: 'jane' }}>
        Go to Profile
      </Button>
      <Button screen="Settings">Go to Settings</Button> */}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'stretch',
    margin:4,
    gap: 10,
    backgroundColor:'#CFDEEC'
  },
});
