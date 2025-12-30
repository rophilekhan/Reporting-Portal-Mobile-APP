export const getReportColumns = (reportName, subType = null) => {
  // Helper to standard 'Serial No' column
  const serialCol = { key: 'SerialNo', title: 'S.No', width: 50 };

  const definitions = {
    // --- ACCOUNTS ---
    'Account Payables Report': [
      serialCol,
      { key: 'Account', title: 'Account No', width: 240},
      { key: 'Opening', title: 'Opening', width: 120, type: 'money', total: true }, // 'total: true' enables footer sum
      { key: 'Amount', title: 'In Between', width: 120, type: 'money', total: true },
      { key: 'ClosingAmount', title: 'Closing', width: 120, type: 'money', total: true },
    ],
     'Account Recievable Report': [
      serialCol,
      { key: 'Account', title: 'Account No', width: 100 },
      { key: 'Opening', title: 'Opening', width: 120, type: 'money', total: true }, // 'total: true' enables footer sum
      { key: 'Amount', title: 'In Between', width: 120, type: 'money', total: true },
      { key: 'ClosingAmount', title: 'Closing', width: 120, type: 'money', total: true },
    ],
    'Payment Summary': [
      serialCol,
      { key: 'Print', title: 'Print', width: 60, type: 'action' },
      { key: 'Date', title: 'Date', width: 100, type: 'date' },
      { key: 'VoucherNo', title: 'Voucher #', width: 100 },
      { key: 'AccountCode', title: 'A/C Code', width: 100 },
      { key: 'OnlineBankAcnt', title: 'Online Bank', width: 120 },
      { key: 'CashAmount', title: 'Cash', width: 100, type: 'money', total: true },
      { key: 'ChequeDate', title: 'Chq Date', width: 100, type: 'date' },
      { key: 'BankAcount', title: 'Bank A/C', width: 120 },
      { key: 'ChequeNo', title: 'Chq #', width: 100 },
      { key: 'WithHoldingTax', title: 'W.H Tax', width: 100, type: 'money', total: true },
      { key: 'ChequeAmount', title: 'Chq Amount', width: 100, type: 'money', total: true },
    ],
    'Receiving Summary': [
      serialCol,
      { key: 'Print', title: 'Print', width: 60, type: 'action' },
      { key: 'Date', title: 'Date', width: 100, type: 'date' },
      { key: 'VoucherNo', title: 'Voucher #', width: 100 },
      { key: 'AccountCode', title: 'A/C Code', width: 100 },
      { key: 'OnlineBankAcnt', title: 'Online Bank', width: 120 },
      { key: 'CashAmount', title: 'Cash', width: 100, type: 'money', total: true },
      { key: 'ChequeDate', title: 'Chq Date', width: 100, type: 'date' },
      { key: 'BankAcount', title: 'Bank A/C', width: 120 },
      { key: 'ChequeNo', title: 'Chq #', width: 100 },
      { key: 'WithHoldingTax', title: 'W.H Tax', width: 100, type: 'money', total: true },
      { key: 'ChequeAmount', title: 'Chq Amount', width: 100, type: 'money', total: true },
    ],
    'Petty Cash': [
      serialCol,
      { key: 'Print', title: 'Print', width: 60, type: 'action' },
      { key: 'Date', title: 'Date', width: 100, type: 'date' },
      { key: 'AcntTitle', title: 'A/C Title', width: 150 },
      { key: 'DebitAmount', title: 'Debit', width: 100, type: 'money', total: true },
      { key: 'CreditAmount', title: 'Credit', width: 100, type: 'money', total: true },
      { key: 'Remarks', title: 'Remarks', width: 200 },
    ],
    'Expense Payment': [
      serialCol,
      { key: 'Print', title: 'Print', width: 60, type: 'action' },
      { key: 'VoucherNo', title: 'Voucher', width: 100 },
      { key: 'EntryDate', title: 'Date', width: 100, type: 'date' },
      { key: 'Expense', title: 'Expense', width: 150 },
      { key: 'PayTo', title: 'Pay To', width: 150 },
      { key: 'Bank', title: 'Bank', width: 120 },
      { key: 'ChequeDate', title: 'Chq Date', width: 100, type: 'date' },
      { key: 'ChequeNo', title: 'Chq No', width: 100 },
      { key: 'ChequeAmount', title: 'Chq Amt', width: 100, type: 'money', total: true },
      { key: 'CashAmount', title: 'Cash', width: 100, type: 'money', total: true },
      { key: 'Remarks', title: 'Remarks', width: 200 },
    ],
    'Trial Balance': [
      serialCol,
      { key: 'Customer', title: 'Customer', width: 200 },
      { key: 'DebitAmount', title: 'Debit', width: 120, type: 'money', total: true },
      { key: 'CreditAmount', title: 'Credit', width: 120, type: 'money', total: true },
    ],

    // --- PURCHASE ---
    'Purchase Summary': [
      serialCol,
      { key: 'Print', title: 'Print', width: 60, type: 'action' },
      { key: 'PurchaseNo', title: 'Pur. No', width: 100 },
      { key: 'Date', title: 'Date', width: 100, type: 'date' },
      { key: 'Supplier', title: 'Supplier', width: 150 },
      { key: 'GrossAmount', title: 'Gross', width: 100, type: 'money', total: true },
      { key: 'DiscountAmount', title: 'Disc. Amt', width: 100, type: 'money', total: true },
      { key: 'SalesTaxAmount', title: 'Tax Amt', width: 100, type: 'money', total: true },
      { key: 'NetAmount', title: 'Net', width: 100, type: 'money', total: true },
      { key: 'PaidAmount', title: 'Paid', width: 100, type: 'money', total: true },
      { key: 'BalanceAmount', title: 'Balance', width: 100, type: 'money', total: true },
      { key: 'ReturnedAmount', title: 'Returned', width: 100, type: 'money', total: true },
    ],
    'Purchase Summary_Sub': [
      serialCol,
      { key: 'Product', title: 'Product', width: 150 },
      { key: 'Quantity', title: 'Qty', width: 60, total: true },
      { key: 'Rate', title: 'Rate', width: 80, type: 'money' },
      { key: 'GrossAmount', title: 'Gross', width: 100, type: 'money', total: true },
      { key: 'Discount', title: 'Disc %', width: 60 },
      { key: 'DiscountAmount', title: 'Disc Amt', width: 100, type: 'money', total: true },
      { key: 'SalesTax', title: 'Tax %', width: 60 },
      { key: 'SalesTaxAmount', title: 'Tax Amt', width: 100, type: 'money', total: true },
      { key: 'NetAmount', title: 'Net', width: 100, type: 'money', total: true },
    ],
    'Good Recieving Summary': [
      serialCol,
      { key: 'Print', title: 'Print', width: 60, type: 'action' },
      { key: 'OrderNo', title: 'Order #', width: 100 },
      { key: 'Supplier', title: 'Supplier', width: 150 },
      { key: 'OrderDate', title: 'Ord Date', width: 100, type: 'date' },
      { key: 'DeliveryDate', title: 'Del Date', width: 100, type: 'date' },
      { key: 'OrderQuantities', title: 'Total Qty', width: 100, total: true },
    ],
    'Good Recieving Summary_Sub': [
      serialCol,
      { key: 'ReceiveDate', title: 'Rec Date', width: 100, type: 'date' },
      { key: 'Product', title: 'Product', width: 150 },
      { key: 'BuiltyNo', title: 'Builty #', width: 100 },
      { key: 'RecievedQuantity', title: 'Rec Qty', width: 80, total: true },
      { key: 'RejectedQuantity', title: 'Rej Qty', width: 80, total: true },
      { key: 'ApprovedQuantity', title: 'App Qty', width: 80, total: true },
    ],

    // --- SALES ---
    'Sales Summary': [
      serialCol,
      { key: 'Print', title: 'Print', width: 60, type: 'action' },
      { key: 'SalesNo', title: 'Sales #', width: 100 },
      { key: 'Date', title: 'Date', width: 100, type: 'date' },
      { key: 'Customer', title: 'Customer', width: 150 },
      { key: 'SalesMan', title: 'Salesman', width: 120 },
      { key: 'GrossAmount', title: 'Gross', width: 100, type: 'money', total: true },
      { key: 'DiscountAmount', title: 'Disc Amt', width: 100, type: 'money', total: true },
      { key: 'SalesTaxAmount', title: 'Tax Amt', width: 100, type: 'money', total: true },
      { key: 'NetAmount', title: 'Net', width: 100, type: 'money', total: true },
    ],

    // --- INVENTORY ---
    'Product Ledger': [
      serialCol,
      { key: 'EDate', title: 'Date', width: 100, type: 'date' },
      { key: 'ProductName', title: 'Product', width: 200 },
      { key: 'Details', title: 'Details', width: 150 },
      { key: 'Particular', title: 'Particular', width: 120 },
      { key: 'In', title: 'In', width: 80, total: true },
      { key: 'Out', title: 'Out', width: 80, total: true },
    ],
    'Product Running Stock': [
       serialCol,
       { key: 'SerialNo', title: 'S.No', width: 60 },
       { key: 'ProductNo', title: 'Prod #', width: 100 },
       { key: 'Product', title: 'Product', width: 200 },
       { key: 'RunningStockPiece', title: 'Run Stock (Pc)', width: 120, total: true },
       { key: 'StockPacking', title: 'Stock (Pack)', width: 120, total: true },
    ]
  };

  if (subType) {
      return definitions[`${reportName}_${subType}`] || [];
  }
  return definitions[reportName] || [];
};