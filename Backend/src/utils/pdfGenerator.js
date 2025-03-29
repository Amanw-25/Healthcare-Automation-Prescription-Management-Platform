import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';

export const generateInvoice = async (payment, patient) => {
  return new Promise((resolve, reject) => {
    try {
      // Create invoice directory if it doesn't exist
      const invoiceDir = path.join(process.cwd(), 'public', 'invoices');
      if (!fs.existsSync(invoiceDir)) {
        fs.mkdirSync(invoiceDir, { recursive: true });
      }
      
      const invoiceFilename = `invoice_${payment.razorpayPaymentId}.pdf`;
      const invoicePath = path.join(invoiceDir, invoiceFilename);
      const invoiceUrl = `/invoices/${invoiceFilename}`;
      
      // Create PDF document
      const doc = new PDFDocument({ margin: 50 });
      const writeStream = fs.createWriteStream(invoicePath);
      
      // Pipe PDF to writable stream
      doc.pipe(writeStream);
      
      // Add content to PDF
      // Header
      doc.fontSize(25).text('Payment Receipt', { align: 'center' });
      doc.moveDown();
      
      // Hospital/Clinic info
      doc.fontSize(14).text('Medical Clinic', { align: 'left' });
      doc.fontSize(10).text('123 Health Street, City, Country', { align: 'left' });
      doc.text('Phone: +1234567890', { align: 'left' });
      doc.text('Email: info@medicalclinic.com', { align: 'left' });
      doc.moveDown();
      
      // Line
      doc.strokeColor('#aaaaaa').lineWidth(1).moveTo(50, doc.y).lineTo(550, doc.y).stroke();
      doc.moveDown();
      
      // Patient Information
      doc.fontSize(12).text('Patient Information:', { underline: true });
      doc.fontSize(10).text(`Patient ID: ${patient.patientId}`);
      doc.text(`Name: ${patient.name}`);
      doc.text(`Phone: ${patient.phone}`);
      doc.text(`Email: ${patient.email || 'N/A'}`);
      doc.moveDown();
      
      // Payment Information
      doc.fontSize(12).text('Payment Information:', { underline: true });
      doc.fontSize(10).text(`Payment ID: ${payment.razorpayPaymentId}`);
      doc.text(`Order ID: ${payment.razorpayOrderId}`);
      doc.text(`Amount: ₹${payment.amount.toFixed(2)}`);
      doc.text(`Date: ${payment.updatedAt.toLocaleDateString()}`);
      doc.text(`Time: ${payment.updatedAt.toLocaleTimeString()}`);
      doc.text(`Status: ${payment.status.toUpperCase()}`);
      doc.moveDown();
      
      // Line
      doc.strokeColor('#aaaaaa').lineWidth(1).moveTo(50, doc.y).lineTo(550, doc.y).stroke();
      doc.moveDown();
      
      // Thank you message
      doc.fontSize(10).text('Thank you for your payment. We appreciate your trust in our medical services.', { align: 'center' });
      
      // Footer
      doc.fontSize(8).text('This is an electronically generated receipt. No signature required.', { align: 'center' });
      
      // Finalize PDF
      doc.end();
      
      writeStream.on('finish', () => {
        resolve(invoiceUrl);
      });
      
      writeStream.on('error', (err) => {
        reject(err);
      });
    } catch (error) {
      reject(error);
    }
  });
};