import PDFDocument from 'pdfkit';
import { Response } from 'express';

export const generateInvoicePDF = (order: any, res: Response): void => {
  const doc = new PDFDocument({ margin: 50 });

  // Stream PDF directly to Express response
  doc.pipe(res);

  // ── Header Section ──────────────────────────────────────────
  doc.fillColor('#333333')
     .fontSize(20)
     .text('LuxeMarket Storefront', 50, 45, { align: 'left' });
     
  doc.fontSize(10)
     .text('123 Premium Fashion Hub', 50, 70)
     .text('Bandra West, Mumbai, MH - 400050', 50, 85)
     .text('Phone: +91 99999 88888 | billing@luxemarket.com', 50, 100);

  doc.fontSize(24)
     .fillColor('#8b0000')
     .text('INVOICE', 350, 45, { align: 'right' });

  doc.fontSize(10)
     .fillColor('#333333')
     .text(`Invoice Number: INV-${order.orderId}`, 350, 75, { align: 'right' })
     .text(`Date: ${new Date(order.createdAt).toLocaleDateString()}`, 350, 90, { align: 'right' })
     .text(`Payment Method: ${order.paymentMethod}`, 350, 105, { align: 'right' });

  // Draw separator line
  doc.moveTo(50, 125).lineTo(550, 125).strokeColor('#cccccc').stroke();

  // ── Customer Details ────────────────────────────────────────
  doc.fontSize(12)
     .fillColor('#8b0000')
     .text('Bill To:', 50, 140)
     .fillColor('#333333')
     .fontSize(10)
     .text(order.customerName, 50, 155)
     .text(`Email: ${order.email}`, 50, 170)
     .text(`Phone: ${order.phone}`, 50, 185);

  const addr = order.shippingAddress;
  if (addr) {
    doc.fontSize(12)
       .fillColor('#8b0000')
       .text('Ship To:', 300, 140)
       .fillColor('#333333')
       .fontSize(10)
       .text(addr.fullName || order.customerName, 300, 155)
       .text(`${addr.line1 || ''}, ${addr.line2 || ''}`, 300, 170)
       .text(`${addr.city || ''}, ${addr.state || ''} - ${addr.pincode || ''}`, 300, 185);
  }

  // Draw separator line
  doc.moveTo(50, 210).lineTo(550, 210).strokeColor('#cccccc').stroke();

  // ── Table Header ────────────────────────────────────────────
  let y = 230;
  doc.fontSize(10)
     .fillColor('#8b0000')
     .text('Item Description', 50, y)
     .text('SKU', 250, y)
     .text('Price', 350, y, { align: 'right', width: 60 })
     .text('Qty', 430, y, { align: 'right', width: 30 })
     .text('Total', 480, y, { align: 'right', width: 70 });

  doc.moveTo(50, y + 15).lineTo(550, y + 15).strokeColor('#eeeeee').stroke();
  y += 25;

  // ── Table Body ──────────────────────────────────────────────
  doc.fillColor('#333333');
  for (const item of order.products) {
    const itemTotal = item.price * item.quantity;
    doc.text(item.name, 50, y, { width: 190 })
       .text(item.sku, 250, y)
       .text(`INR ${item.price.toFixed(2)}`, 350, y, { align: 'right', width: 60 })
       .text(item.quantity.toString(), 430, y, { align: 'right', width: 30 })
       .text(`INR ${itemTotal.toFixed(2)}`, 480, y, { align: 'right', width: 70 });
    
    y += 20;
  }

  // Draw separator line
  doc.moveTo(50, y + 10).lineTo(550, y + 10).strokeColor('#cccccc').stroke();
  y += 20;

  // ── Totals Section ──────────────────────────────────────────
  doc.fontSize(10)
     .text('Subtotal:', 350, y, { align: 'right', width: 100 })
     .text(`INR ${order.subtotal.toFixed(2)}`, 460, y, { align: 'right', width: 90 });
  y += 15;

  doc.text('Tax (18% GST):', 350, y, { align: 'right', width: 100 })
     .text(`INR ${order.tax.toFixed(2)}`, 460, y, { align: 'right', width: 90 });
  y += 15;

  if (order.discount > 0) {
    doc.text('Discounts:', 350, y, { align: 'right', width: 100 })
       .text(`- INR ${order.discount.toFixed(2)}`, 460, y, { align: 'right', width: 90 });
    y += 15;
  }

  doc.text('Shipping Charge:', 350, y, { align: 'right', width: 100 })
     .text(`INR ${order.shipping.toFixed(2)}`, 460, y, { align: 'right', width: 90 });
  y += 20;

  doc.fontSize(12)
     .fillColor('#8b0000')
     .text('Grand Total:', 350, y, { align: 'right', width: 100 })
     .text(`INR ${order.total.toFixed(2)}`, 460, y, { align: 'right', width: 90 });

  // ── Footer Signoff ──────────────────────────────────────────
  doc.fontSize(8)
     .fillColor('#999999')
     .text('This is a computer-generated invoice and does not require signatures.', 50, 700, { align: 'center' })
     .text('Thank you for shopping with LuxeMarket!', 50, 715, { align: 'center' });

  doc.end();
};
