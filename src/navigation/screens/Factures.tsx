import { Button, Text } from '@react-navigation/elements';
import { useEffect, useState } from 'react';
import { FlatList, StatusBar, StyleSheet, View } from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { globalStyles } from '../../styles/global';
import { transformInvoices } from '../../helpers';
import axios from "axios";
import getInvoices from '../../api/invoice';
import { InvoiceDisplayed, MonthlyInvoices } from '../../interfaces';



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
  const renderInvoice = ({ item }:{item:InvoiceDisplayed}) => (
    <View style={globalStyles.invoiceCard}>
      <Text style={globalStyles.clientText}>{item.client}</Text>
      <Text style={globalStyles.amountText}>{item.amount}</Text>
      <Text style={globalStyles.invoiceNumber}>{item.invoiceNumber}</Text>
    </View>
  );
  const renderSection = ({ item }:{item:MonthlyInvoices}) => (
    <View style={globalStyles.sectionContainer}>
      {/* Month Header */}
      <View style={globalStyles.sectionHeader}>
        <Text style={globalStyles.monthText}>{item.month}</Text>
        <Text style={globalStyles.totalText}>{item.total}</Text>
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
