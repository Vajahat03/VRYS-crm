import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Invoice, Organization, Payment } from '../types';

export const generateInvoicePDF = (invoice: Invoice, org: Organization) => {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  // Header / Branding Banner
  doc.setFillColor(15, 23, 42); // Slate dark
  doc.rect(0, 0, 210, 38, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(22);
  doc.text(org.name.toUpperCase(), 14, 18);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(148, 163, 184);
  doc.text(org.tagline || 'Business Management & Digital Solutions', 14, 25);
  doc.text(`${org.address}, ${org.city}, ${org.state} | Ph: ${org.phone}`, 14, 31);

  // Invoice Title
  doc.setTextColor(99, 102, 241);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(20);
  doc.text('TAX INVOICE', 145, 20);

  doc.setFontSize(9);
  doc.setTextColor(203, 213, 225);
  doc.text(`Invoice #: ${invoice.invoiceNumber}`, 145, 27);
  doc.text(`Date: ${new Date(invoice.issueDate).toLocaleDateString()}`, 145, 32);

  // Customer / Bill To Box
  doc.setDrawColor(226, 232, 240);
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(14, 46, 182, 28, 2, 2, 'FD');

  doc.setTextColor(71, 85, 105);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text('BILLED TO:', 20, 53);

  doc.setTextColor(15, 23, 42);
  doc.setFontSize(11);
  doc.text(invoice.customerName, 20, 60);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(100, 116, 139);
  doc.text(`Phone: ${invoice.customerPhone}`, 20, 66);
  if (invoice.customerAddress) {
    doc.text(`Address: ${invoice.customerAddress}`, 100, 66);
  }

  // Items Table
  const tableRows = invoice.items.map((item, idx) => [
    idx + 1,
    item.name,
    item.quantity,
    `${org.currency} ${item.unitPrice.toLocaleString('en-IN')}`,
    `${item.tax}%`,
    `${org.currency} ${item.total.toLocaleString('en-IN')}`
  ]);

  autoTable(doc, {
    startY: 82,
    head: [['#', 'Service / Item Description', 'Qty', 'Rate', 'Tax', 'Amount']],
    body: tableRows,
    theme: 'grid',
    headStyles: {
      fillColor: [99, 102, 241],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 9
    },
    styles: {
      fontSize: 9,
      cellPadding: 4,
      textColor: [30, 41, 59]
    },
    columnStyles: {
      0: { cellWidth: 12, halign: 'center' },
      1: { cellWidth: 90 },
      2: { cellWidth: 15, halign: 'center' },
      3: { cellWidth: 25, halign: 'right' },
      4: { cellWidth: 15, halign: 'center' },
      5: { cellWidth: 25, halign: 'right' }
    }
  });

  const finalY = (doc as any).lastAutoTable.finalY + 8;

  // Summary Totals Box
  const summaryX = 120;
  doc.setFontSize(9);
  doc.setTextColor(71, 85, 105);
  doc.text('Subtotal:', summaryX, finalY);
  doc.text(`${org.currency} ${invoice.subtotal.toLocaleString('en-IN')}`, 196, finalY, { align: 'right' });

  doc.text('GST / Tax:', summaryX, finalY + 6);
  doc.text(`${org.currency} ${invoice.taxTotal.toLocaleString('en-IN')}`, 196, finalY + 6, { align: 'right' });

  doc.setDrawColor(203, 213, 225);
  doc.line(summaryX, finalY + 9, 196, finalY + 9);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(15, 23, 42);
  doc.text('Grand Total:', summaryX, finalY + 16);
  doc.text(`${org.currency} ${invoice.total.toLocaleString('en-IN')}`, 196, finalY + 16, { align: 'right' });

  doc.setFontSize(10);
  doc.setTextColor(16, 185, 129); // Green
  doc.text('Paid Amount:', summaryX, finalY + 23);
  doc.text(`${org.currency} ${invoice.paidAmount.toLocaleString('en-IN')}`, 196, finalY + 23, { align: 'right' });

  doc.setTextColor(244, 63, 94); // Rose red
  doc.text('Balance Due:', summaryX, finalY + 30);
  doc.text(`${org.currency} ${invoice.balanceAmount.toLocaleString('en-IN')}`, 196, finalY + 30, { align: 'right' });

  // Status Stamp
  doc.setDrawColor(invoice.status === 'Paid' ? 16 : 244, invoice.status === 'Paid' ? 185 : 63, invoice.status === 'Paid' ? 129 : 94);
  doc.setLineWidth(1);
  doc.roundedRect(14, finalY, 50, 20, 2, 2, 'D');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(invoice.status === 'Paid' ? 16 : 244, invoice.status === 'Paid' ? 185 : 63, invoice.status === 'Paid' ? 129 : 94);
  doc.text(invoice.status.toUpperCase(), 39, finalY + 12, { align: 'center' });

  // Footer Note
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(8);
  doc.setTextColor(148, 163, 184);
  doc.text('Thank you for your business! For any queries, contact support@aluzer.com', 105, 280, { align: 'center' });
  doc.text('Generated via VRYS CRM Operating System', 105, 285, { align: 'center' });

  doc.save(`${invoice.invoiceNumber}_${invoice.customerName.replace(/\s+/g, '_')}.pdf`);
};

export const generatePaymentReceiptPDF = (payment: Payment, org: Organization) => {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a5' });

  doc.setFillColor(15, 23, 42);
  doc.rect(0, 0, 148, 28, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.text(org.name, 10, 14);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(148, 163, 184);
  doc.text(`Official Payment Receipt • ${org.phone}`, 10, 21);

  doc.setFontSize(14);
  doc.setTextColor(16, 185, 129);
  doc.text('PAYMENT RECEIPT', 95, 14);
  doc.setFontSize(8);
  doc.setTextColor(203, 213, 225);
  doc.text(payment.receiptNumber, 95, 21);

  // Content
  doc.setTextColor(30, 41, 59);
  doc.setFontSize(9);
  doc.text(`Received With Thanks From:`, 10, 38);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text(payment.customerName, 10, 45);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.text(`Amount Received:`, 10, 56);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(16, 185, 129);
  doc.text(`${org.currency} ${payment.amount.toLocaleString('en-IN')}`, 10, 64);

  doc.setTextColor(71, 85, 105);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.text(`Payment Mode: ${payment.paymentMethod}`, 10, 75);
  doc.text(`Date: ${new Date(payment.paymentDate).toLocaleDateString()}`, 10, 82);
  if (payment.transactionReference) {
    doc.text(`Reference / UPI Ref: ${payment.transactionReference}`, 10, 89);
  }
  doc.text(`Authorized Receiver: ${payment.recordedBy}`, 10, 96);

  doc.setDrawColor(203, 213, 225);
  doc.line(10, 105, 138, 105);

  doc.setFontSize(8);
  doc.setTextColor(148, 163, 184);
  doc.text('This is a computer-generated receipt from VRYS CRM.', 74, 115, { align: 'center' });

  doc.save(`${payment.receiptNumber}_Receipt.pdf`);
};

export const generateQuotePDF = (quote: any, org: Organization) => {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  // Header / Branding Banner
  doc.setFillColor(15, 23, 42);
  doc.rect(0, 0, 210, 38, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(22);
  doc.text(org.name.toUpperCase(), 14, 18);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(148, 163, 184);
  doc.text(org.tagline || 'Business Management & Digital Solutions', 14, 25);
  doc.text(`${org.address}, ${org.city}, ${org.state} | Ph: ${org.phone}`, 14, 31);

  // Quote Title
  doc.setTextColor(6, 182, 212); // Cyan
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(20);
  doc.text('PROFORMA QUOTE', 135, 20);

  doc.setFontSize(9);
  doc.setTextColor(203, 213, 225);
  doc.text(`Quote #: ${quote.quoteNumber}`, 135, 27);
  doc.text(`Valid Until: ${new Date(quote.validUntil).toLocaleDateString()}`, 135, 32);

  // Customer / Quote For Box
  doc.setDrawColor(226, 232, 240);
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(14, 46, 182, 28, 2, 2, 'FD');

  doc.setTextColor(71, 85, 105);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text('PREPARED FOR:', 20, 53);

  doc.setTextColor(15, 23, 42);
  doc.setFontSize(11);
  doc.text(quote.customerName, 20, 60);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(100, 116, 139);
  doc.text(`Status: ${quote.status}`, 20, 66);

  // Items Table
  const tableData = quote.items.map((item: any) => [
    item.description,
    item.quantity.toString(),
    `${org.currency} ${item.unitPrice.toLocaleString('en-IN')}`,
    `${item.taxRate}%`,
    `${org.currency} ${item.total.toLocaleString('en-IN')}`
  ]);

  autoTable(doc, {
    startY: 82,
    head: [['Item Description', 'Qty', 'Unit Price', 'Tax %', 'Total Amount']],
    body: tableData,
    theme: 'grid',
    headStyles: {
      fillColor: [15, 23, 42],
      textColor: [255, 255, 255],
      fontStyle: 'bold'
    },
    styles: {
      fontSize: 9,
      cellPadding: 4
    },
    columnStyles: {
      0: { cellWidth: 80 },
      1: { halign: 'center' },
      2: { halign: 'right' },
      3: { halign: 'center' },
      4: { halign: 'right' }
    }
  });

  const finalY = (doc as any).lastAutoTable.finalY + 10;

  // Summary Totals Box
  doc.setDrawColor(226, 232, 240);
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(120, finalY, 76, 36, 2, 2, 'FD');

  doc.setFontSize(9);
  doc.setTextColor(71, 85, 105);
  doc.text('Subtotal:', 126, finalY + 8);
  doc.text(`${org.currency} ${quote.subtotal.toLocaleString('en-IN')}`, 190, finalY + 8, { align: 'right' });

  doc.text('GST Tax Total:', 126, finalY + 16);
  doc.text(`${org.currency} ${quote.taxTotal.toLocaleString('en-IN')}`, 190, finalY + 16, { align: 'right' });

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(6, 182, 212);
  doc.text('Grand Total:', 126, finalY + 28);
  doc.text(`${org.currency} ${quote.grandTotal.toLocaleString('en-IN')}`, 190, finalY + 28, { align: 'right' });

  // Terms & Footer
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(148, 163, 184);
  doc.text(quote.terms || 'Quote valid for 15 days from issuance. Subject to document verification.', 14, finalY + 45);

  doc.save(`${quote.quoteNumber}_Quote.pdf`);
};

