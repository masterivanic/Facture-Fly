import React from 'react';
import { View, Text, ScrollView, StyleSheet, SafeAreaView } from 'react-native';

const AppercuFacture = () => {
  // Default invoice data
  const invoiceData = {
    invoiceNumber: 'INV-2023-001',
    date: '30 Janvier 2025',
    dueDate: '15 Février 2025',
    company: {
      name: 'Votre Entreprise',
      address: '123 Rue du Commerce\n75000 Paris',
      email: 'contact@entreprise.com',
      phone: '01 23 45 67 89'
    },
    client: {
      name: 'Client Important',
      address: '456 Avenue des Affaires\n69000 Lyon',
      email: 'client@entreprise.com'
    },
    items: [
      { description: 'Développement Application', quantity: 10, price: 150.0 },
      { description: 'Conseil Technique', quantity: 5, price: 200.0 },
      { description: 'Maintenance Mensuelle', quantity: 1, price: 500.0 }
    ],
    taxRate: 20.0,
    discount: 100.0
  };

  // Calculations
  const subtotal = invoiceData.items.reduce((sum, item) => sum + (item.quantity * item.price), 0);
  const tax = (subtotal - invoiceData.discount) * (invoiceData.taxRate / 100);
  const total = subtotal - invoiceData.discount + tax;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header Section */}
        <View style={styles.header}>
          <View style={styles.companyInfo}>
            <Text style={styles.companyName}>{invoiceData.company.name}</Text>
            <Text style={styles.address}>{invoiceData.company.address}</Text>
            <Text style={styles.contact}>{invoiceData.company.email}</Text>
            <Text style={styles.contact}>{invoiceData.company.phone}</Text>
          </View>
          
          <View style={styles.clientInfo}>
            <Text style={styles.sectionTitle}>Facturé à:</Text>
            <Text style={styles.clientName}>{invoiceData.client.name}</Text>
            <Text style={styles.address}>{invoiceData.client.address}</Text>
            <Text style={styles.contact}>{invoiceData.client.email}</Text>
          </View>
        </View>

        {/* Invoice Details */}
        <View style={styles.detailsSection}>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Facture N°:</Text>
            <Text style={styles.detailValue}>{invoiceData.invoiceNumber}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Date d'émission:</Text>
            <Text style={styles.detailValue}>{invoiceData.date}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Date d'échéance:</Text>
            <Text style={styles.detailValue}>{invoiceData.dueDate}</Text>
          </View>
        </View>

        {/* Items Table */}
        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={[styles.colDescription, styles.headerText]}>Description</Text>
            <Text style={[styles.colQuantity, styles.headerText]}>Qté</Text>
            <Text style={[styles.colPrice, styles.headerText]}>Prix Unitaire</Text>
            <Text style={[styles.colTotal, styles.headerText]}>Total</Text>
          </View>

          {invoiceData.items.map((item, index) => (
            <View key={index} style={styles.tableRow}>
              <Text style={styles.colDescription}>{item.description}</Text>
              <Text style={styles.colQuantity}>{item.quantity}</Text>
              <Text style={styles.colPrice}>{item.price.toFixed(2)}€</Text>
              <Text style={styles.colTotal}>{(item.quantity * item.price).toFixed(2)}€</Text>
            </View>
          ))}
        </View>

        {/* Totals Section */}
        <View style={styles.totalsContainer}>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Sous-total:</Text>
            <Text style={styles.totalValue}>{subtotal.toFixed(2)}€</Text>
          </View>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Remise:</Text>
            <Text style={styles.totalValue}>-{invoiceData.discount.toFixed(2)}€</Text>
          </View>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Taxe ({invoiceData.taxRate}%):</Text>
            <Text style={styles.totalValue}>{tax.toFixed(2)}€</Text>
          </View>
          <View style={[styles.totalRow, styles.grandTotal]}>
            <Text style={styles.grandTotalLabel}>Total à payer:</Text>
            <Text style={styles.grandTotalValue}>{total.toFixed(2)}€</Text>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.thankYouText}>Merci pour votre confiance !</Text>
          <Text style={styles.termsText}>Paiement dû dans les 15 jours suivant réception</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
    companyInfo: {
        flex: 1,
        marginRight: 20,
      },
      clientInfo: {
        flex: 1,
        alignItems: 'flex-end',
      },
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollContent: {
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 25,
  },
  companyName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 5,
  },
  clientName: {
    fontWeight: '600',
    marginBottom: 5,
  },
  address: {
    color: '#7f8c8d',
    fontSize: 12,
    lineHeight: 16,
  },
  contact: {
    color: '#3498db',
    fontSize: 12,
  },
  detailsSection: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 15,
    marginBottom: 20,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  detailLabel: {
    fontWeight: '600',
    color: '#7f8c8d',
  },
  detailValue: {
    fontWeight: '500',
  },
  table: {
    borderWidth: 1,
    borderColor: '#ecf0f1',
    borderRadius: 8,
    marginBottom: 20,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#f8f9fa',
    paddingVertical: 12,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#ecf0f1',
  },
  headerText: {
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  colDescription: {
    flex: 4,
    paddingLeft: 10,
  },
  colQuantity: {
    flex: 1,
    textAlign: 'center',
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
  totalsContainer: {
    marginBottom: 30,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
    paddingHorizontal: 10,
  },
  totalLabel: {
    color: '#7f8c8d',
  },
  totalValue: {
    fontWeight: '500',
  },
  grandTotal: {
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 8,
    marginTop: 15,
  },
  grandTotalLabel: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  grandTotalValue: {
    fontWeight: 'bold',
    fontSize: 16,
    color: '#2ecc71',
  },
  footer: {
    borderTopWidth: 2,
    borderTopColor: '#ecf0f1',
    paddingTop: 20,
    alignItems: 'center',
  },
  thankYouText: {
    fontSize: 16,
    color: '#3498db',
    marginBottom: 10,
  },
  termsText: {
    color: '#95a5a6',
    fontSize: 12,
  },
  sectionTitle: {
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#2c3e50',
  },
});

export default AppercuFacture;