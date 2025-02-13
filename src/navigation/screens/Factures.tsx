import { 
  Button, 
  Text 
} from '@react-navigation/elements';
import { useEffect, useState } from 'react';
import { 
  FlatList, 
  StatusBar, 
  StyleSheet, 
  View, 
  TouchableOpacity, 
  RefreshControl, 
  ActivityIndicator
} from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { globalStyles } from '../../styles/global';
import { formatCurrency, transformInvoices } from '../../helpers';
import { getInvoices } from '../../api/invoice';
import { InvoiceDisplayed, MonthlyInvoices } from '../../interfaces';
import { useNavigation } from '@react-navigation/native';

export function Factures({route}: {route: any}) {
  const {isPaidParam} = route.params || {};
  const [factures, setFactures] = useState<MonthlyInvoices[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchInvoices = async () => {
    try {
      const results = await getInvoices();
      let filteredResults = results || [];

      // Apply filtering based on isPaidParam
      if (typeof isPaidParam === 'boolean') {
        filteredResults = filteredResults.filter(invoice => 
          invoice.is_paid === isPaidParam
        );
      }

      const transformedData = await transformInvoices(filteredResults);
      setFactures(transformedData);
    } catch (error) {
      console.error("Error fetching invoices:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };


  const handleRefresh = () => {
    setRefreshing(true);
    fetchInvoices();
  };

  useEffect(() => {
    fetchInvoices();
  }, [isPaidParam]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator style={{flex: 1, justifyContent: 'center', alignItems: 'center'}} size="large" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#00E5E5" />
      
      {factures.length > 0 ? (
        <FacturesList 
          invoices={factures} 
          onRefresh={handleRefresh} 
          refreshing={refreshing}
        />
      ) : (
        <View style={styles.emptyState}>
          <FontAwesome name="search-minus" size={42} color="black" />
          <Text style={styles.emptyText}>
            Vos factures s’afficheront ici. Cliquez sur le bouton plus pour créer une nouvelle facture
          </Text>
        </View>
      )}
    </View>
  );
}

const FacturesList = ({ 
  invoices, 
  onRefresh, 
  refreshing 
}: { 
  invoices: MonthlyInvoices[]; 
  onRefresh: () => void; 
  refreshing: boolean; 
}) => {
  const navigation = useNavigation();

  const handleInvoicePress = (item: InvoiceDisplayed) => {
    navigation.reset({
      index: 0,
      routes: [{ name: 'HomeTabs', params: { screen: 'Nouveau', params: { factureId: item.id } } }]
    });
  };

  const renderInvoice = ({ item }: { item: InvoiceDisplayed }) => (
    <TouchableOpacity 
      style={globalStyles.invoiceCard} 
      onPress={() => handleInvoicePress(item)}
    >
      <Text style={globalStyles.clientText}>{item.client}</Text>
      <Text style={globalStyles.amountText}>{formatCurrency(item.amount)}</Text>
      <Text style={globalStyles.invoiceNumber}>{item.invoiceNumber}</Text>
    </TouchableOpacity>
  );

  const renderSection = ({ item }: { item: MonthlyInvoices }) => (
    <View style={globalStyles.sectionContainer}>
      <View style={globalStyles.sectionHeader}>
        <Text style={globalStyles.monthText}>{item.month}</Text>
        <Text style={globalStyles.totalText}>{formatCurrency(item.total)}</Text>
      </View>
      <FlatList
        data={item.data}
        renderItem={renderInvoice}
        keyExtractor={(invoice, index) => `${item.month}-${index}`}
        scrollEnabled={false}
      />
    </View>
  );

  return (
    <FlatList
      data={invoices}
      renderItem={renderSection}
      keyExtractor={(item, index) => `${item.month}-${index}`}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          colors={['#00E5E5']}
          tintColor="#00E5E5"
          title="Chargement..."
          titleColor="#666"
        />
      }
      initialNumToRender={5}
      maxToRenderPerBatch={5}
      windowSize={10}
    />
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    margin: 4,
    gap: 10,
    backgroundColor: '#CFDEEC'
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#CFDEEC'
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 20,
    paddingHorizontal: 20
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
    color: '#666'
  }
});