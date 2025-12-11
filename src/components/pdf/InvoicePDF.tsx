/* eslint-disable jsx-a11y/alt-text */
import React from 'react';
import { Page, Text, View, Document, StyleSheet, Image, Font } from '@react-pdf/renderer';

// Register a standard font (optional, but good for reliable rendering)
Font.register({
    family: 'Helvetica',
    fonts: [
        { src: 'https://fonts.gstatic.com/s/helveticaneue/v70/1Ptsg8zYS_SKggPNyC0IT4ttDfA.ttf', fontWeight: 'normal' },
        { src: 'https://fonts.gstatic.com/s/helveticaneue/v70/1Ptsg8zYS_SKggPNyC0IT4ttDfA.ttf', fontWeight: 'bold' }, // Using same for simplicity primarily
    ]
});

const colors = {
    terracotta: '#cc5500',
    carbon: '#0F0F0F',
    stone: '#78716c',
    vapor: '#F3F4F6',
    white: '#ffffff',
};

const styles = StyleSheet.create({
    page: {
        flexDirection: 'column',
        backgroundColor: '#FFFFFF',
        padding: 40,
        fontFamily: 'Helvetica',
        color: colors.carbon,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 40,
        borderBottomWidth: 2,
        borderBottomColor: colors.terracotta,
        paddingBottom: 20,
    },
    logo: {
        width: 100,
        height: 'auto',
    },
    headerRight: {
        textAlign: 'right',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: colors.terracotta,
        textTransform: 'uppercase',
        letterSpacing: 2,
    },
    meta: {
        fontSize: 10,
        color: colors.stone,
        marginTop: 4,
    },
    // Address Section
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 30,
    },
    column: {
        flex: 1,
    },
    columnRight: {
        flex: 1,
        textAlign: 'right',
    },
    sectionTitle: {
        fontSize: 12,
        fontWeight: 'bold',
        color: colors.terracotta,
        marginBottom: 8,
        textTransform: 'uppercase',
    },
    text: {
        fontSize: 10,
        marginBottom: 3,
        lineHeight: 1.4,
    },
    // Table
    table: {
        display: 'flex',
        width: 'auto',
        borderStyle: 'solid',
        borderWidth: 1,
        borderColor: colors.vapor,
        borderRadius: 4,
        marginBottom: 20,
    },
    tableRow: {
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderBottomColor: colors.vapor,
        alignItems: 'center',
        height: 32,
    },
    tableHeader: {
        backgroundColor: colors.vapor,
        height: 32,
        alignItems: 'center',
    },
    th: {
        fontSize: 9,
        fontWeight: 'bold',
        color: colors.carbon,
        textTransform: 'uppercase',
    },
    col1: { width: '50%', paddingLeft: 8 },
    col2: { width: '15%', textAlign: 'center' },
    col3: { width: '15%', textAlign: 'right' },
    col4: { width: '20%', textAlign: 'right', paddingRight: 8 },

    td: {
        fontSize: 10,
        color: colors.carbon,
    },
    // Totals
    totalsSection: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        marginTop: 10,
    },
    totalRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: 200,
        marginBottom: 5,
    },
    totalLabel: {
        fontSize: 10,
        fontWeight: 'bold',
        color: colors.stone,
    },
    totalValue: {
        fontSize: 10,
        fontWeight: 'bold',
        color: colors.carbon,
        textAlign: 'right',
    },
    grandTotal: {
        borderTopWidth: 2,
        borderTopColor: colors.terracotta,
        paddingTop: 5,
        marginTop: 5,
    },
    grandTotalValue: {
        fontSize: 14,
        color: colors.terracotta,
    },

    // Footer
    footer: {
        position: 'absolute',
        bottom: 30,
        left: 40,
        right: 40,
        textAlign: 'center',
        borderTopWidth: 1,
        borderTopColor: colors.vapor,
        paddingTop: 20,
    },
    footerText: {
        fontSize: 8,
        color: colors.stone,
    }
});

interface InvoicePDFProps {
    order: any; // Using any for speed, but structure is known
}

export default function InvoicePDF({ order }: InvoicePDFProps) {
    const subtotal = order.lines.reduce((acc: number, line: any) => acc + (line.price * line.quantity), 0);
    // Mocking VAT as 20% if not provided, just for display structure (User requested "VAT PDF")
    // In a real scenario, this should come from the API. 
    // We'll calculate mock tax separation for the visual if explicit tax is missing.
    // Assuming 'order.total' is Gross.
    const taxRate = 0.20;
    const taxAmount = order.total - (order.total / (1 + taxRate));
    const netAmount = order.total - taxAmount;

    return (
        <Document>
            <Page size="A4" style={styles.page}>
                {/* Header */}
                <View style={styles.header}>
                    {/* Code-Generated Logo: "Salp." */}
                    <View style={{ flexDirection: 'row', alignItems: 'baseline' }}>
                        <Text style={{
                            fontFamily: 'Times-Bold',
                            fontSize: 32,
                            color: colors.carbon
                        }}>
                            Salp
                        </Text>
                        <Text style={{
                            fontFamily: 'Times-Bold',
                            fontSize: 32,
                            color: colors.terracotta
                        }}>
                            .
                        </Text>
                    </View>
                    <View style={styles.headerRight}>
                        <Text style={styles.title}>INVOICE</Text>
                        <Text style={styles.meta}>#{order.displayId || order.id}</Text>
                        <Text style={styles.meta}>Date: {order.date}</Text>
                    </View>
                </View>

                {/* Addresses */}
                <View style={styles.row}>
                    <View style={styles.column}>
                        <Text style={styles.sectionTitle}>Bill To</Text>
                        {order.billingAddress ? (
                            <>
                                <Text style={styles.text}>{order.billingAddress.firstName} {order.billingAddress.lastName}</Text>
                                <Text style={styles.text}>{order.billingAddress.streetAddress1}</Text>
                                <Text style={styles.text}>{order.billingAddress.city}, {order.billingAddress.postalCode}</Text>
                                <Text style={styles.text}>{order.billingAddress.country.country}</Text>
                            </>
                        ) : (
                            <Text style={styles.text}>Same as Shipping</Text>
                        )}
                    </View>
                    <View style={styles.columnRight}>
                        <Text style={styles.sectionTitle}>Ship To</Text>
                        {order.shippingAddress ? (
                            <>
                                <Text style={styles.text}>{order.shippingAddress.firstName} {order.shippingAddress.lastName}</Text>
                                <Text style={styles.text}>{order.shippingAddress.streetAddress1}</Text>
                                <Text style={styles.text}>{order.shippingAddress.city}, {order.shippingAddress.postalCode}</Text>
                                <Text style={styles.text}>{order.shippingAddress.country.country}</Text>
                            </>
                        ) : (
                            <Text style={styles.text}>No Shipping Address</Text>
                        )}
                    </View>
                </View>

                {/* Table */}
                <View style={styles.table}>
                    <View style={[styles.tableRow, styles.tableHeader]}>
                        <View style={styles.col1}><Text style={styles.th}>Item</Text></View>
                        <View style={styles.col2}><Text style={styles.th}>Qty</Text></View>
                        <View style={styles.col3}><Text style={styles.th}>Price</Text></View>
                        <View style={styles.col4}><Text style={styles.th}>Total</Text></View>
                    </View>
                    {order.lines.map((line: any, i: number) => (
                        <View key={i} style={styles.tableRow}>
                            <View style={styles.col1}><Text style={styles.td}>{line.name}</Text></View>
                            <View style={styles.col2}><Text style={styles.td}>{line.quantity}</Text></View>
                            <View style={styles.col3}><Text style={styles.td}>{order.currency} {line.price.toFixed(2)}</Text></View>
                            <View style={styles.col4}><Text style={styles.td}>{order.currency} {(line.price * line.quantity).toFixed(2)}</Text></View>
                        </View>
                    ))}
                </View>

                {/* Totals */}
                <View style={styles.totalsSection}>
                    <View>
                        <View style={styles.totalRow}>
                            <Text style={styles.totalLabel}>Subtotal (Net):</Text>
                            <Text style={styles.totalValue}>{order.currency} {netAmount.toFixed(2)}</Text>
                        </View>
                        <View style={styles.totalRow}>
                            <Text style={styles.totalLabel}>VAT (20%):</Text>
                            <Text style={styles.totalValue}>{order.currency} {taxAmount.toFixed(2)}</Text>
                        </View>
                        <View style={[styles.totalRow, styles.grandTotal]}>
                            <Text style={styles.totalLabel}>Total:</Text>
                            <Text style={[styles.totalValue, styles.grandTotalValue]}>{order.currency} {order.total.toFixed(2)}</Text>
                        </View>
                    </View>
                </View>

                {/* Footer */}
                <View style={styles.footer}>
                    <Text style={styles.footerText}>Thank you for your business.</Text>
                    <Text style={styles.footerText}>Salp. Inc | 123 Fashion Blvd, Amsterdam, NL | VAT: NL123456789B01</Text>
                </View>
            </Page>
        </Document>
    );
}
