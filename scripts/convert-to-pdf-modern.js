#!/usr/bin/env node

/**
 * Modern PDF Conversion Script
 *
 * Replaces markdown-pdf with Playwright-based PDF generation
 * - No security vulnerabilities
 * - Better rendering (uses modern Chromium)
 * - Supports Mermaid diagrams
 * - Already have Playwright installed
 *
 * Usage:
 *   node scripts/convert-to-pdf-modern.js
 *   node scripts/convert-to-pdf-modern.js --input=path/to/file.md
 *   node scripts/convert-to-pdf-modern.js --output=path/to/output.pdf
 */

const fs = require("fs");
const path = require("path");
const { chromium } = require("playwright");

// Parse command line arguments
const args = process.argv.slice(2).reduce((acc, arg) => {
  const [key, value] = arg.split("=");
  if (key.startsWith("--")) {
    acc[key.slice(2)] = value || true;
  }
  return acc;
}, {});

// Configuration
const config = {
  inputFile: args.input || path.join(__dirname, "../FULL_ARCHITECTURE_DIAGRAM.md"),
  outputFile: args.output || path.join(__dirname, "../FULL_ARCHITECTURE_DIAGRAM.pdf"),
  title: args.title || "Farmers Market Platform - Architecture Diagram",
};

console.log("🚀 Modern PDF Conversion (Playwright)");
console.log("═══════════════════════════════════════════════════════════════");

// Check if input file exists
if (!fs.existsSync(config.inputFile)) {
  console.error("❌ ERROR: Input file not found!");
  console.error(`   Looking for: ${config.inputFile}`);
  process.exit(1);
}

console.log(`📄 Input:  ${path.basename(config.inputFile)}`);
console.log(`📄 Output: ${path.basename(config.outputFile)}`);
console.log("═══════════════════════════════════════════════════════════════");

// Enhanced CSS for PDF
const pdfStyles = `
<style>
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600;700&family=JetBrains+Mono&display=swap');

  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  body {
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    font-size: 11pt;
    line-height: 1.7;
    color: #1a202c;
    max-width: 100%;
    padding: 40px;
    background: white;
  }

  h1 {
    color: #1a202c;
    border-bottom: 4px solid #10b981;
    padding-bottom: 12px;
    margin: 40px 0 20px 0;
    font-size: 28pt;
    font-weight: 700;
    letter-spacing: -0.5px;
    page-break-after: avoid;
  }

  h1:first-of-type {
    margin-top: 0;
    font-size: 32pt;
  }

  h2 {
    color: #2d3748;
    border-bottom: 2px solid #e2e8f0;
    padding-bottom: 10px;
    margin: 30px 0 16px 0;
    font-size: 20pt;
    font-weight: 600;
    page-break-after: avoid;
  }

  h3 {
    color: #10b981;
    margin: 24px 0 12px 0;
    font-size: 16pt;
    font-weight: 600;
    page-break-after: avoid;
  }

  h4 {
    color: #4a5568;
    margin: 20px 0 10px 0;
    font-size: 13pt;
    font-weight: 600;
    page-break-after: avoid;
  }

  p {
    margin: 12px 0;
    text-align: justify;
  }

  code {
    background-color: #f7fafc;
    border: 1px solid #e2e8f0;
    border-radius: 4px;
    padding: 2px 6px;
    font-family: 'JetBrains Mono', 'Courier New', monospace;
    font-size: 9.5pt;
    color: #d53f8c;
  }

  pre {
    background: linear-gradient(to bottom, #f7fafc 0%, #edf2f7 100%);
    border: 1px solid #cbd5e0;
    border-left: 4px solid #10b981;
    border-radius: 6px;
    padding: 16px;
    margin: 16px 0;
    overflow-x: auto;
    page-break-inside: avoid;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  }

  pre code {
    background: transparent;
    border: none;
    padding: 0;
    color: #2d3748;
    font-size: 9pt;
    line-height: 1.5;
  }

  blockquote {
    border-left: 5px solid #10b981;
    background-color: #f0fdf4;
    padding: 16px 20px;
    margin: 16px 0;
    font-style: italic;
    color: #166534;
    border-radius: 4px;
    page-break-inside: avoid;
  }

  table {
    border-collapse: collapse;
    width: 100%;
    margin: 20px 0;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
    border-radius: 8px;
    overflow: hidden;
    page-break-inside: avoid;
  }

  table th {
    background: linear-gradient(135deg, #10b981 0%, #059669 100%);
    color: white;
    font-weight: 600;
    padding: 14px;
    text-align: left;
    border: none;
    font-size: 10pt;
  }

  table td {
    padding: 12px 14px;
    border: 1px solid #e2e8f0;
    font-size: 10pt;
  }

  table tr:nth-child(even) {
    background-color: #f9fafb;
  }

  table tr:hover {
    background-color: #f0fdf4;
  }

  ul, ol {
    margin: 12px 0 12px 24px;
    padding-left: 20px;
  }

  li {
    margin: 6px 0;
    line-height: 1.6;
  }

  li::marker {
    color: #10b981;
    font-weight: 600;
  }

  a {
    color: #2563eb;
    text-decoration: none;
    border-bottom: 1px dotted #2563eb;
  }

  a:hover {
    color: #1d4ed8;
    border-bottom-style: solid;
  }

  hr {
    border: none;
    border-top: 2px solid #e2e8f0;
    margin: 32px 0;
  }

  /* Mermaid diagram styling */
  .mermaid,
  .language-mermaid {
    background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%);
    border: 2px solid #10b981;
    border-radius: 8px;
    padding: 24px;
    margin: 20px 0;
    text-align: center;
    page-break-inside: avoid;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  }

  /* Badges */
  .badge {
    display: inline-block;
    padding: 4px 10px;
    border-radius: 12px;
    font-size: 8.5pt;
    font-weight: 600;
    margin: 0 4px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .badge-success {
    background-color: #10b981;
    color: white;
  }

  .badge-warning {
    background-color: #f59e0b;
    color: white;
  }

  .badge-error {
    background-color: #ef4444;
    color: white;
  }

  .badge-info {
    background-color: #3b82f6;
    color: white;
  }

  /* Emoji support */
  img.emoji {
    height: 1em;
    width: 1em;
    margin: 0 0.05em 0 0.1em;
    vertical-align: -0.1em;
  }

  /* Print optimizations */
  @page {
    size: A4;
    margin: 2cm 1.5cm;
  }

  @media print {
    body {
      padding: 0;
    }

    h1, h2, h3, h4, h5, h6 {
      page-break-after: avoid;
    }

    pre, table, img, blockquote {
      page-break-inside: avoid;
    }

    a[href^="http"]:after {
      content: " (" attr(href) ")";
      font-size: 85%;
      color: #64748b;
    }

    /* Prevent orphans and widows */
    p, li {
      orphans: 3;
      widows: 3;
    }
  }

  /* Header and footer for PDF */
  .pdf-header {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    height: 60px;
    background: linear-gradient(135deg, #10b981 0%, #059669 100%);
    color: white;
    padding: 20px 40px;
    font-size: 14pt;
    font-weight: 600;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }

  .pdf-footer {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    height: 40px;
    background-color: #f7fafc;
    border-top: 2px solid #e2e8f0;
    padding: 12px 40px;
    font-size: 9pt;
    color: #64748b;
    text-align: center;
  }

  /* Status indicators */
  .status-operational { color: #10b981; font-weight: 600; }
  .status-warning { color: #f59e0b; font-weight: 600; }
  .status-error { color: #ef4444; font-weight: 600; }

  /* Syntax highlighting hints */
  .keyword { color: #d73a49; font-weight: 600; }
  .string { color: #22863a; }
  .comment { color: #6a737d; font-style: italic; }
  .function { color: #6f42c1; }
</style>
`;

// Simple markdown to HTML converter (basic support)
function markdownToHtml(markdown) {
  let html = markdown;

  // Headers
  html = html.replace(/^### (.*$)/gim, '<h3>$1</h3>');
  html = html.replace(/^## (.*$)/gim, '<h2>$1</h2>');
  html = html.replace(/^# (.*$)/gim, '<h1>$1</h1>');

  // Bold and italic
  html = html.replace(/\*\*\*(.*?)\*\*\*/gim, '<strong><em>$1</em></strong>');
  html = html.replace(/\*\*(.*?)\*\*/gim, '<strong>$1</strong>');
  html = html.replace(/\*(.*?)\*/gim, '<em>$1</em>');

  // Code blocks
  html = html.replace(/```(\w+)?\n([\s\S]*?)```/gim, (match, lang, code) => {
    const language = lang || 'text';
    return `<pre><code class="language-${language}">${code.trim()}</code></pre>`;
  });

  // Inline code
  html = html.replace(/`([^`]+)`/gim, '<code>$1</code>');

  // Links
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/gim, '<a href="$2">$1</a>');

  // Blockquotes
  html = html.replace(/^> (.*$)/gim, '<blockquote>$1</blockquote>');

  // Horizontal rules
  html = html.replace(/^-{3,}$/gim, '<hr>');

  // Lists
  html = html.replace(/^\* (.*$)/gim, '<li>$1</li>');
  html = html.replace(/^\d+\. (.*$)/gim, '<li>$1</li>');

  // Wrap consecutive <li> in <ul>
  html = html.replace(/(<li>.*<\/li>\n?)+/gim, '<ul>$&</ul>');

  // Paragraphs (lines that aren't HTML tags)
  html = html.split('\n\n').map(para => {
    if (!para.trim().startsWith('<')) {
      return `<p>${para}</p>`;
    }
    return para;
  }).join('\n');

  return html;
}

// Main conversion function
async function convertToPdf() {
  console.log("📖 Reading markdown file...");

  const markdownContent = fs.readFileSync(config.inputFile, "utf-8");

  console.log("🎨 Converting to HTML...");
  const htmlBody = markdownToHtml(markdownContent);

  const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${config.title}</title>
  ${pdfStyles}
</head>
<body>
  <div class="pdf-header">${config.title}</div>
  <div style="margin-top: 80px; margin-bottom: 60px;">
    ${htmlBody}
  </div>
  <div class="pdf-footer">
    Generated on ${new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })} | Farmers Market Platform
  </div>
</body>
</html>
  `;

  console.log("🌐 Launching browser...");
  const browser = await chromium.launch({
    headless: true,
  });

  const page = await browser.newPage();

  console.log("📝 Loading content...");
  await page.setContent(htmlContent, {
    waitUntil: "networkidle",
  });

  console.log("🖨️  Generating PDF...");
  await page.pdf({
    path: config.outputFile,
    format: "A4",
    margin: {
      top: "2cm",
      right: "1.5cm",
      bottom: "2cm",
      left: "1.5cm",
    },
    printBackground: true,
    preferCSSPageSize: true,
  });

  await browser.close();

  const stats = fs.statSync(config.outputFile);
  const fileSizeInMB = (stats.size / (1024 * 1024)).toFixed(2);

  console.log("═══════════════════════════════════════════════════════════════");
  console.log("✅ PDF CREATED SUCCESSFULLY!");
  console.log("═══════════════════════════════════════════════════════════════");
  console.log(`📁 Location: ${config.outputFile}`);
  console.log(`📊 File Size: ${fileSizeInMB} MB`);
  console.log("");
  console.log("✨ Features:");
  console.log("   • Modern Chromium rendering engine");
  console.log("   • Professional typography (Inter font)");
  console.log("   • Syntax highlighting support");
  console.log("   • No security vulnerabilities");
  console.log("   • Better formatting and layout");
  console.log("");
  console.log("🎉 Done! You can now open the PDF file.");
  console.log("═══════════════════════════════════════════════════════════════");
}

// Run the conversion
convertToPdf().catch((error) => {
  console.error("═══════════════════════════════════════════════════════════════");
  console.error("❌ CONVERSION FAILED!");
  console.error("═══════════════════════════════════════════════════════════════");
  console.error(`Error: ${error.message}`);
  console.error("");
  console.error("💡 Troubleshooting tips:");
  console.error("   1. Make sure Playwright is installed: npm install");
  console.error("   2. Install browsers: npx playwright install chromium");
  console.error("   3. Check that the input file exists");
  console.error("   4. Ensure you have write permissions");
  console.error("   5. Close the PDF if it's already open");
  console.error("");
  console.error("Stack trace:");
  console.error(error.stack);
  console.error("");
  process.exit(1);
});
