import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';

const AppercuModelFacture = () => {
  // Sample data
  const invoiceData = {
    company: {
      name: 'East Repair Inc.',
      address: '1912 Harvest Lane\nNew York, NY 12210',
    },
    client: {
      name: 'John Smith',
      address: '3787 Pineview Drive\nCambridge, MA 12210',
    },
    invoiceNumber: 'INV-2102/2019',
    poNumber: '2312/2019',
    invoiceDate: '26/02/2019',
    dueDate: '26/02/2019',
    items: [
      { id: 1, description: 'Front and rear brake cables', qty: 1, price: 100.00 },
      { id: 2, description: 'New set of pedal arms', qty: 2, price: 15.00 },
      { id: 3, description: 'Labor 3hrs', qty: 3, price: 5.00 },
    ],
    taxRate: 6.25,
  };

  // Calculations
  const subtotal = invoiceData.items.reduce((sum, item) => sum + (item.qty * item.price), 0);
  const tax = (subtotal * invoiceData.taxRate) / 100;
  const total = subtotal + tax;

  return (
    <ScrollView style={styles.container}>
      {/* Header Section */}
      <View style={styles.header}>
        <View style={styles.companyInfo}>
          <Text style={styles.companyName}>{invoiceData.company.name}</Text>
          <Text style={styles.companyAddress}>{invoiceData.company.address}</Text>
        </View>
        
        <View style={styles.billTo}>
          <Text style={styles.sectionTitle}>Bill To:</Text>
          <Text style={styles.clientName}>{invoiceData.client.name}</Text>
          <Text style={styles.clientAddress}>{invoiceData.client.address}</Text>
        </View>
      </View>

      {/* Invoice Details */}
      <View style={styles.detailsContainer}>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>P.O.#</Text>
          <Text style={styles.detailValue}>{invoiceData.poNumber}</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Invoice Date</Text>
          <Text style={styles.detailValue}>{invoiceData.invoiceDate}</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Due Date</Text>
          <Text style={styles.detailValue}>{invoiceData.dueDate}</Text>
        </View>
      </View>

      {/* Items Table */}
      <View style={styles.table}>
        {/* Table Header */}
        <View style={[styles.row, styles.headerRow]}>
          <Text style={[styles.colQty, styles.headerText]}>QTY</Text>
          <Text style={[styles.colDesc, styles.headerText]}>DESCRIPTION</Text>
          <Text style={[styles.colPrice, styles.headerText]}>UNIT PRICE</Text>
          <Text style={[styles.colTotal, styles.headerText]}>AMOUNT</Text>
        </View>

        {/* Table Rows */}
        {invoiceData.items.map((item) => (
          <View key={item.id} style={[styles.row, styles.itemRow]}>
            <Text style={styles.colQty}>{item.qty}</Text>
            <Text style={styles.colDesc}>{item.description}</Text>
            <Text style={styles.colPrice}>${item.price.toFixed(2)}</Text>
            <Text style={styles.colTotal}>${(item.qty * item.price).toFixed(2)}</Text>
          </View>
        ))}
      </View>

      {/* Totals Section */}
      <View style={styles.totalsContainer}>
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Subtotal</Text>
          <Text style={styles.totalValue}>${subtotal.toFixed(2)}</Text>
        </View>
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Sales Tax {invoiceData.taxRate}%</Text>
          <Text style={styles.totalValue}>${tax.toFixed(2)}</Text>
        </View>
        <View style={[styles.totalRow, styles.grandTotal]}>
          <Text style={styles.grandTotalLabel}>Total</Text>
          <Text style={styles.grandTotalValue}>${total.toFixed(2)}</Text>
        </View>
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.terms}>Terms & Conditions</Text>
        <Text style={styles.termsText}>Payment is due within 15 days</Text>
        <Text style={styles.termsText}>Please make checks payable to: {invoiceData.company.name}</Text>
      </View>
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
});

export default AppercuModelFacture;