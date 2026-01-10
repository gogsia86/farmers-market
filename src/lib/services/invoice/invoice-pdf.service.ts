/**
 * 📄 INVOICE PDF GENERATION SERVICE
 * Generates professional PDF invoices for orders
 * Following: Divine Patterns & Agricultural Consciousness
 */

import { formatCurrency } from "@/lib/utils/currency";
import type { Farm, Order, OrderItem, User } from "@prisma/client";
import { jsPDF } from "jspdf";

// ============================================================================
// TYPES
// ============================================================================

interface InvoiceData {
  order: Order & {
    items: (OrderItem & {
      product: {
        name: string;
        unit: string;
      } | null;
    })[];
    farm: Farm;
    customer: User;
  };
}

interface InvoiceOptions {
  includeHeader?: boolean;
  includeFooter?: boolean;
  includePaymentInfo?: boolean;
  watermark?: string;
}

// ============================================================================
// PDF GENERATION SERVICE
// ============================================================================

export class InvoicePDFService {
  private static readonly COLORS = {
    primary: "#16a34a", // green-600
    secondary: "#4b5563", // gray-600
    text: "#1f2937", // gray-800
    lightGray: "#f3f4f6", // gray-100
    border: "#e5e7eb", // gray-200
  };

  private static readonly FONTS = {
    title: 20,
    heading: 14,
    subheading: 12,
    body: 10,
    small: 8,
  };

  /**
   * Generate PDF invoice for an order
   */
  static async generateInvoice(
    invoiceData: InvoiceData,
    options: InvoiceOptions = {}
  ): Promise<Blob> {
    const {
      includeHeader = true,
      includeFooter = true,
      includePaymentInfo = true,
    } = options;

    const { order } = invoiceData;
    const doc = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    });

    let yPosition = 20;

    // ==========================================================================
    // HEADER SECTION
    // ==========================================================================
    if (includeHeader) {
      yPosition = this.addHeader(doc, order, yPosition);
    }

    // ==========================================================================
    // ORDER INFORMATION SECTION
    // ==========================================================================
    yPosition = this.addOrderInfo(doc, order, yPosition);

    // ==========================================================================
    // CUSTOMER & FARM INFORMATION
    // ==========================================================================
    yPosition = this.addPartyInfo(doc, order, yPosition);

    // ==========================================================================
    // ORDER ITEMS TABLE
    // ==========================================================================
    yPosition = this.addItemsTable(doc, order, yPosition);

    // ==========================================================================
    // TOTALS SECTION
    // ==========================================================================
    yPosition = this.addTotals(doc, order, yPosition);

    // ==========================================================================
    // PAYMENT INFORMATION
    // ==========================================================================
    if (includePaymentInfo) {
      yPosition = this.addPaymentInfo(doc, order, yPosition);
    }

    // ==========================================================================
    // FOOTER
    // ==========================================================================
    if (includeFooter) {
      this.addFooter(doc);
    }

    // Convert to blob
    const pdfBlob = doc.output("blob");
    return pdfBlob;
  }

  /**
   * Download invoice PDF
   */
  static async downloadInvoice(
    invoiceData: InvoiceData,
    filename?: string
  ): Promise<void> {
    const { order } = invoiceData;
    const defaultFilename = `invoice-${order.orderNumber}-${new Date().toISOString().split("T")[0]}.pdf`;

    const blob = await this.generateInvoice(invoiceData);
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename || defaultFilename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  /**
   * Generate invoice as base64 string (for email attachments)
   */
  static async generateInvoiceBase64(
    invoiceData: InvoiceData
  ): Promise<string> {
    const blob = await this.generateInvoice(invoiceData);
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        if (!base64) {
          reject(new Error("Failed to convert blob to base64"));
          return;
        }
        const base64Data = base64.split(",")[1];
        if (!base64Data) {
          reject(new Error("Invalid base64 format"));
          return;
        }
        resolve(base64Data); // Remove data:application/pdf;base64, prefix
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }

  // ==========================================================================
  // PRIVATE HELPER METHODS
  // ==========================================================================

  private static addHeader(
    doc: jsPDF,
    order: InvoiceData["order"],
    yPos: number
  ): number {
    // Logo/Branding Area
    doc.setFontSize(this.FONTS.title);
    doc.setTextColor(this.COLORS.primary);
    doc.setFont("helvetica", "bold");
    doc.text("🌾 Farmers Market", 20, yPos);

    // Invoice Title
    doc.setFontSize(this.FONTS.heading);
    doc.setTextColor(this.COLORS.text);
    doc.text("INVOICE", 170, yPos);

    yPos += 10;

    // Company tagline
    doc.setFontSize(this.FONTS.small);
    doc.setTextColor(this.COLORS.secondary);
    doc.setFont("helvetica", "normal");
    doc.text("Fresh from Farm to Table", 20, yPos);

    return yPos + 10;
  }

  private static addOrderInfo(
    doc: jsPDF,
    order: InvoiceData["order"],
    yPos: number
  ): number {
    // Background box
    doc.setFillColor(this.COLORS.lightGray);
    doc.rect(20, yPos - 5, 170, 20, "F");

    // Order details in two columns
    doc.setFontSize(this.FONTS.body);
    doc.setTextColor(this.COLORS.text);
    doc.setFont("helvetica", "bold");

    // Left column
    doc.text("Invoice Number:", 25, yPos);
    doc.text("Order Number:", 25, yPos + 5);
    doc.text("Order Date:", 25, yPos + 10);

    doc.setFont("helvetica", "normal");
    doc.text(`INV-${order.orderNumber}`, 60, yPos);
    doc.text(order.orderNumber, 60, yPos + 5);
    doc.text(
      new Date(order.createdAt).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      }),
      60,
      yPos + 10
    );

    // Right column
    doc.setFont("helvetica", "bold");
    doc.text("Status:", 120, yPos);
    doc.text("Payment Method:", 120, yPos + 5);
    doc.text("Invoice Date:", 120, yPos + 10);

    doc.setFont("helvetica", "normal");
    doc.text(order.status.replace(/_/g, " "), 155, yPos);
    doc.text("Card Payment".replace(/_/g, " "), 155, yPos + 5);
    doc.text(new Date().toLocaleDateString("en-US"), 155, yPos + 10);

    return yPos + 25;
  }

  private static addPartyInfo(
    doc: jsPDF,
    order: InvoiceData["order"],
    yPos: number
  ): number {
    doc.setFontSize(this.FONTS.subheading);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(this.COLORS.text);

    // Customer Information (Left)
    doc.text("Bill To:", 20, yPos);
    doc.setFontSize(this.FONTS.body);
    doc.setFont("helvetica", "normal");

    const customerName = `${order.customer.firstName || ""} ${order.customer.lastName || ""}`.trim() || "Customer";
    doc.text(customerName, 20, yPos + 5);

    if (order.customer.email) {
      doc.text(order.customer.email, 20, yPos + 10);
    }

    // Shipping address
    if (order.shippingAddress) {
      const address =
        typeof order.shippingAddress === "string"
          ? order.shippingAddress
          : JSON.stringify(order.shippingAddress);

      const addressLines = this.wrapText(doc, address, 70);
      addressLines.forEach((line, index) => {
        doc.text(line, 20, yPos + 15 + index * 5);
      });
    }

    // Farm Information (Right)
    doc.setFontSize(this.FONTS.subheading);
    doc.setFont("helvetica", "bold");
    doc.text("Sold By:", 120, yPos);

    doc.setFontSize(this.FONTS.body);
    doc.setFont("helvetica", "normal");
    doc.text(order.farm.name, 120, yPos + 5);

    if (order.farm.email) {
      doc.text(order.farm.email, 120, yPos + 10);
    }

    if (order.farm.phone) {
      doc.text(order.farm.phone, 120, yPos + 15);
    }

    // Farm address
    const farmAddress = [
      order.farm.address,
      order.farm.city,
      `${order.farm.state} ${order.farm.zipCode}`,
    ]
      .filter(Boolean)
      .join(", ");

    if (farmAddress) {
      const farmAddressLines = this.wrapText(doc, farmAddress, 70);
      farmAddressLines.forEach((line, index) => {
        doc.text(line, 120, yPos + 20 + index * 5);
      });
    }

    return yPos + 45;
  }

  private static addItemsTable(
    doc: jsPDF,
    order: InvoiceData["order"],
    yPos: number
  ): number {
    // Table header
    doc.setFillColor(this.COLORS.primary);
    doc.rect(20, yPos - 5, 170, 8, "F");

    doc.setFontSize(this.FONTS.body);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(255, 255, 255); // White text

    doc.text("Item", 25, yPos);
    doc.text("Quantity", 110, yPos);
    doc.text("Unit Price", 140, yPos);
    doc.text("Total", 170, yPos);

    yPos += 5;

    // Table rows
    doc.setTextColor(this.COLORS.text);
    doc.setFont("helvetica", "normal");

    order.items.forEach((item, index) => {
      // Alternate row background
      if (index % 2 === 0) {
        doc.setFillColor(this.COLORS.lightGray);
        doc.rect(20, yPos - 3, 170, 7, "F");
      }

      // Item name
      const itemName = item.productName || item.product?.name || "Product";
      const itemNameLines = this.wrapText(doc, itemName, 80);
      const itemNameText = itemNameLines[0] || itemName;
      doc.text(itemNameText, 25, yPos);

      // Quantity
      const unit = item.unit || item.product?.unit || "";
      const quantityStr = `${Number(item.quantity)} ${unit}`.trim();
      doc.text(quantityStr, 110, yPos);

      // Unit price
      doc.text(formatCurrency(Number(item.unitPrice)), 140, yPos);

      // Total
      const itemTotal = Number(item.quantity) * Number(item.unitPrice);
      doc.text(formatCurrency(itemTotal), 170, yPos);

      yPos += 7;

      // Check if we need a new page
      if (yPos > 250) {
        doc.addPage();
        yPos = 20;
      }
    });

    // Table bottom border
    doc.setDrawColor(this.COLORS.border);
    doc.line(20, yPos, 190, yPos);

    return yPos + 5;
  }

  private static addTotals(
    doc: jsPDF,
    order: InvoiceData["order"],
    yPos: number
  ): number {
    const totalsX = 140;
    const valuesX = 170;

    doc.setFontSize(this.FONTS.body);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(this.COLORS.text);

    // Subtotal
    doc.text("Subtotal:", totalsX, yPos);
    doc.text(formatCurrency(Number(order.subtotal)), valuesX, yPos);
    yPos += 5;

    // Delivery Fee
    if (order.deliveryFee && Number(order.deliveryFee) > 0) {
      doc.text("Delivery Fee:", totalsX, yPos);
      doc.text(formatCurrency(Number(order.deliveryFee)), valuesX, yPos);
      yPos += 5;
    }

    // Tax
    if (order.tax && Number(order.tax) > 0) {
      doc.text("Tax:", totalsX, yPos);
      doc.text(formatCurrency(Number(order.tax)), valuesX, yPos);
      yPos += 5;
    }

    // Discount
    if (order.discount && Number(order.discount) > 0) {
      doc.setTextColor(this.COLORS.primary);
      doc.text("Discount:", totalsX, yPos);
      doc.text(`-${formatCurrency(Number(order.discount))}`, valuesX, yPos);
      yPos += 5;
      doc.setTextColor(this.COLORS.text);
    }

    // Total line
    doc.setDrawColor(this.COLORS.primary);
    doc.setLineWidth(0.5);
    doc.line(totalsX - 5, yPos, 190, yPos);
    yPos += 5;

    // Total
    doc.setFontSize(this.FONTS.heading);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(this.COLORS.primary);
    doc.text("TOTAL:", totalsX, yPos);
    doc.text(formatCurrency(Number(order.total)), valuesX, yPos);

    return yPos + 10;
  }

  private static addPaymentInfo(
    doc: jsPDF,
    order: InvoiceData["order"],
    yPos: number
  ): number {
    doc.setFillColor(this.COLORS.lightGray);
    doc.rect(20, yPos - 3, 170, 20, "F");

    doc.setFontSize(this.FONTS.subheading);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(this.COLORS.text);
    doc.text("Payment Information", 25, yPos + 2);

    doc.setFontSize(this.FONTS.body);
    doc.setFont("helvetica", "normal");

    doc.text("Payment Method:", 25, yPos + 8);
    doc.text("Card Payment".replace(/_/g, " "), 65, yPos + 8);

    doc.text("Payment Status:", 25, yPos + 13);
    doc.text(order.paymentStatus.replace(/_/g, " "), 65, yPos + 13);

    if (order.paidAt) {
      doc.text("Paid On:", 120, yPos + 8);
      doc.text(
        new Date(order.paidAt).toLocaleDateString("en-US"),
        155,
        yPos + 8
      );
    }

    return yPos + 25;
  }

  private static addFooter(doc: jsPDF): void {
    const pageHeight = doc.internal.pageSize.height;
    const footerY = pageHeight - 20;

    // Footer line
    doc.setDrawColor(this.COLORS.border);
    doc.line(20, footerY - 5, 190, footerY - 5);

    doc.setFontSize(this.FONTS.small);
    doc.setTextColor(this.COLORS.secondary);
    doc.setFont("helvetica", "normal");

    // Footer text
    doc.text(
      "Thank you for supporting local agriculture! 🌾",
      105,
      footerY,
      { align: "center" }
    );

    doc.text(
      "For questions, contact support@farmersmarket.com",
      105,
      footerY + 5,
      { align: "center" }
    );

    // Page number
    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.text(
        `Page ${i} of ${pageCount}`,
        190,
        footerY + 10,
        { align: "right" }
      );
    }
  }

  /**
   * Helper to wrap text to fit within a given width
   */
  private static wrapText(
    doc: jsPDF,
    text: string,
    maxWidth: number
  ): string[] {
    const words = text.split(" ");
    const lines: string[] = [];
    let currentLine = "";

    words.forEach((word: any) => {
      const testLine = currentLine + (currentLine ? " " : "") + word;
      const textWidth = doc.getTextWidth(testLine);

      if (textWidth > maxWidth && currentLine) {
        lines.push(currentLine);
        currentLine = word;
      } else {
        currentLine = testLine;
      }
    });

    if (currentLine) {
      lines.push(currentLine);
    }

    return lines;
  }
}

// ============================================================================
// EXPORT DEFAULT
// ============================================================================

export default InvoicePDFService;
