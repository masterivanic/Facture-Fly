import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, ActivityIndicator } from 'react-native';
import { Invoice, UserCompany, Customer, InvoiceWithArticles, Article } from '../../interfaces';
import { getArticlesByIds, getInvoiceById } from '../../api/invoice';
import { getClient, getUserCompany } from '../../api/auth';
import { useFocusEffect } from '@react-navigation/native';



const AppercuModelFacture = ({ route }: { route: any }) => {
  const { factureId, refreshCount } = route.params || {};
  const [invoice, setInvoice] = useState<InvoiceWithArticles | null>(null);
  const [userCompany, setUserCompany] = useState<UserCompany | null>(null);
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [loading, setLoading] = useState(true);
  const [apayer_str, setApayerStr] = useState('');

  useFocusEffect(
    useCallback(() => {
      const fetchInvoice = async () => {
        try {
          setLoading(true);
          const userCompanyData = await getUserCompany();
          console.log("userCompanyData", userCompanyData);
          setUserCompany(userCompanyData);

          if (factureId) {
            const data = await getInvoiceById(factureId);
            console.log("data", data.due_date);
            if (data) {

              // Convert string amounts to numbers
              const processedData = {
                ...data,
                amount: Number(data.amount),
                discount: Number(data.discount),
                taxe: Number(data.taxe),
                paid_amount: Number(data.paid_amount),
              };

              // Fetch articles and customer in parallel
              const [articles_data, client_data] = await Promise.all([
                getArticlesByIds(data.article),
                data.customer ? getClient(data.customer) : Promise.resolve(null)
              ]);

              setInvoice({
                ...processedData,
                article: articles_data,
                due_date: new Date(data.due_date).toISOString().split('T')[0], // Already in correct format
                emission_date: new Date(data.emission_date)
              });

              if (client_data) {
                setCustomer({
                  ...client_data,
                  // Ensure address exists
                  adress: client_data.adress || 'No address provided'
                });
              }
              if (data.due_date == data.emission_date) {
                setApayerStr("La facture est dûe dés la récéption");
              } else if (new Date(data.due_date).getTime() > new Date().getTime()) {
                const differenceInDays = Math.ceil((new Date(data.due_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
                setApayerStr(`Le paiement est dû dans ${differenceInDays} jours`);
              } else {
                setApayerStr('La facture est en retard, merci de nous contacter pour le paiement');
              }
            }
          }
        } catch (error) {
          console.error('Fetch error:', error);
        } finally {
          setLoading(false);
        }
      };

      fetchInvoice();
      return () => {
        console.log("unmount");
      }
    }, [refreshCount]))



  if (loading) {
    return <ActivityIndicator style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }} size="large" />;
  }

  if (!userCompany || !invoice) {
    return <Text>Error loading invoice data</Text>;
  }
  // Formatting functions
  const formatDate = (dateString: string | Date) => {
    const date = new Date(dateString);
    return `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1)
      .toString()
      .padStart(2, '0')}/${date.getFullYear()}`;
  };

  const formatAddress = (address: string) =>
    address.split(',').join('\n');

  // Calculations
  const subtotal = invoice?.article.reduce(
    (sum: number, item: Article) => sum + (item.quantity * item.price), 0
  ) || 0;
  const totalTax = subtotal * (invoice.taxe / 100);
  const totalDiscount = subtotal * (invoice.discount / 100);
  const tax = invoice ? (subtotal * invoice.taxe) / 100 : 0
  const total = subtotal - totalDiscount + totalTax;
  const balanceDue = total - invoice.paid_amount;


  return (
    <ScrollView style={styles.container}>
      {/* Header Section */}

      <View style={styles.header}>
        {
          userCompany &&
          <View style={styles.companyInfo}>
            <Text style={styles.companyName}>{userCompany.name}</Text>
            <Text style={styles.companyAddress}>
              {formatAddress(userCompany.address)}
            </Text>
          </View>
        }
        {
          customer &&
          <View style={styles.billTo}>
            <Text style={styles.sectionTitle}>À:</Text>
            <Text style={styles.clientName}>
              {customer?.first_name} {customer?.last_name}
            </Text>
            <Text style={styles.clientAddress}>
              {formatAddress(customer?.adress || '')}
            </Text>
          </View>
        }
      </View>

      {/* Invoice Details */}
      {
        invoice &&
        <View style={styles.detailsContainer}>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Facture #</Text>
            <Text style={styles.detailValue}>{invoice?.label}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Date de facturation</Text>
            <Text style={styles.detailValue}>{formatDate(invoice?.emission_date)}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Date d'échéance</Text>
            <Text style={styles.detailValue}>{formatDate(invoice?.due_date)}</Text>
          </View>
        </View>
      }

      {/* Items Table */}
      {
        invoice &&
        <View style={styles.table}>
          <View style={[styles.row, styles.headerRow]}>
            <Text style={[styles.colQty, styles.headerText]}>QTE</Text>
            <Text style={[styles.colDesc, styles.headerText]}>LIBELLE</Text>
            <Text style={[styles.colPrice, styles.headerText]}>PRIX UNITAIRE</Text>
            <Text style={[styles.colTotal, styles.headerText]}>MONTANT</Text>
          </View>

          {invoice.article.map((item: Article) => (
            <View key={item.id} style={[styles.row, styles.itemRow]}>
              <Text style={styles.colQty}>{Number(item.quantity)}</Text>
              <Text style={styles.colDesc}>{item.label}</Text>
              <Text style={styles.colPrice}>€{Number(item.price).toFixed(2)}</Text>
              <Text style={styles.colTotal}>€{(Number(item.quantity) * Number(item.price)).toFixed(2)}</Text>
            </View>
          ))}
        </View>
      }

      {/* Totals Section */}
      {
        invoice &&
        <View style={styles.totalsContainer}>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Sous total</Text>
            <Text style={styles.totalValue}>€{subtotal.toFixed(2)}</Text>
          </View>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Remise {invoice.discount}%</Text>
            <Text style={styles.totalValue}>€{totalDiscount.toFixed(2)}</Text>
          </View>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Taxe {invoice.taxe}%</Text>
            <Text style={styles.totalValue}>€{tax.toFixed(2)}</Text>
          </View>
          <View style={[styles.totalRow, styles.grandTotal]}>
            <Text style={styles.grandTotalLabel}>Total</Text>
            <Text style={styles.grandTotalValue}>€{balanceDue.toFixed(2)}</Text>
          </View>
        </View>
      }

      {/* Payment Details */}

      {
        userCompany &&
        <View style={styles.footer}>
          <Text style={styles.terms}>Conditions de paiement</Text>
          <Text style={styles.termsText}>{apayer_str}</Text>
          <Text style={styles.termsText}>Veuillez faire les chèques payable à: {userCompany?.name}</Text>
        </View>
      }
    </ScrollView>
  );
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
    borderBottomWidth: 2,
    borderBottomColor: '#c00',
    paddingBottom: 15,
  },
  companyName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#c00',
    marginBottom: 5,
  },
  companyAddress: {
    color: '#666',
    fontSize: 14,
    lineHeight: 18,
  },
  billTo: {
    alignItems: 'flex-end',
  },
  sectionTitle: {
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  clientName: {
    fontWeight: '600',
    color: '#333',
  },
  clientAddress: {
    color: '#666',
    fontSize: 14,
    textAlign: 'right',
  },
  detailsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 15,
  },
  detailRow: {
    flex: 1,
    alignItems: 'center',
  },
  detailLabel: {
    color: '#666',
    fontSize: 12,
  },
  detailValue: {
    fontWeight: '600',
    color: '#333',
    fontSize: 14,
  },
  table: {
    marginVertical: 10,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  headerRow: {
    backgroundColor: '#f5f5f5',
    borderTopWidth: 1,
    borderColor: '#ddd',
  },
  headerText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#333',
  },
  colQty: {
    flex: 1,
    textAlign: 'center',
  },
  colDesc: {
    flex: 3,
    paddingLeft: 10,
  },
  colPrice: {
    flex: 2,
    textAlign: 'right',
  },
  colTotal: {
    flex: 2,
    textAlign: 'right',
    paddingRight: 10,
  },
  itemRow: {
    backgroundColor: '#fff',
  },
  totalsContainer: {
    marginTop: 20,
    paddingHorizontal: 10,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  totalLabel: {
    color: '#666',
  },
  totalValue: {
    fontWeight: '600',
  },
  grandTotal: {
    borderTopWidth: 2,
    borderColor: '#c00',
    paddingTop: 10,
    marginTop: 10,
  },
  grandTotalLabel: {
    fontWeight: 'bold',
    color: '#c00',
    fontSize: 16,
  },
  grandTotalValue: {
    fontWeight: 'bold',
    color: '#c00',
    fontSize: 16,
  },
  footer: {
    marginTop: 30,
    paddingTop: 15,
    borderTopWidth: 1,
    borderColor: '#eee',
  },
  terms: {
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  termsText: {
    color: '#666',
    fontSize: 12,
  },
  companyInfo: {
    flex: 1,
    marginRight: 20,
  },
});

export default AppercuModelFacture;