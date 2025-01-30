import { StyleSheet } from "react-native";

export const globalStyles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#E5F4F9', // Light blue background
      paddingTop: 10,
    },
    sectionContainer: {
      marginBottom: 15,
      backgroundColor: '#FFFFFF', // White background for sections
      borderRadius: 10,
      overflow: 'hidden',
    },
    sectionHeader: {
      backgroundColor: '#00796B', // Teal color for header
      padding: 10,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    monthText: {
      fontSize: 18,
      fontWeight: 'bold',
      color: '#FFFFFF', // White text
    },
    totalText: {
      fontSize: 18,
      fontWeight: 'bold',
      color: '#FFFFFF', // White text
    },
    invoiceCard: {
      backgroundColor: '#F6F6F6', // Light gray background for cards
      padding: 10,
      borderBottomWidth: 1,
      borderBottomColor: '#DADADA',
    },
    clientText: {
      fontSize: 16,
      color: '#333333', // Dark gray text
      fontWeight: 'bold',
    },
    amountText: {
      fontSize: 16,
      color: '#00796B', // Teal color for amounts
      textAlign: 'right',
      marginTop: -20,
    },
    invoiceNumber: {
      fontSize: 14,
      color: '#999999', // Lighter gray for invoice number
      marginTop: 5,
    },
  });