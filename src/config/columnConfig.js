export const getReportColumns = (reportName, subType = null) => {
  const serialCol = { key: 'SerialNo', title: 'S.No', width: 50 };
  const MONEY_WIDTH = 120;

  const definitions = {
    // --- ACCOUNTS ---
    'Account Payables Report': [
      serialCol,
      { key: 'Account', title: 'Account No', width: 100 },
      { key: 'Opening', title: 'Opening', width: MONEY_WIDTH, type: 'money', total: true },
      { key: 'Amount', title: 'In b/w Transaction Amount', width: MONEY_WIDTH, type: 'money', total: true },
      { key: 'ClosingAmount', title: 'Closing', width: MONEY_WIDTH, type: 'money', total: true },
    ],
    'Account Recievable Report': [
      serialCol,
      { key: 'Account', title: 'Account No', width: 100 },
      { key: 'Opening', title: 'Opening', width: MONEY_WIDTH, type: 'money', total: true },
      { key: 'Amount', title: 'In b/w Transaction Amount', width: MONEY_WIDTH, type: 'money', total: true },
      { key: 'ClosingAmount', title: 'Closing', width: MONEY_WIDTH, type: 'money', total: true },
    ],
  
    // ✅ CORRECTED KEYS (Matches your API JSON exactly)
    'Account Payment Summary': [
      { key: 'SerialNo', title: 'S.No', width: 50 },
      { key: 'Print', title: 'Print', width: 60, type: 'action' },
      { key: 'EntryDate', title: 'Date', width: 100, type: 'date' }, 
      { key: 'VoucherNo', title: 'Voucher No', width: 100 },
      { key: 'AccountCode', title: 'A/C Code', width: 150 },
      { key: 'OnlineBankAccount', title: 'Online Bank Account', width: 150 }, 
      { key: 'CashAmount', title: 'Cash Amount', width: 120, type: 'money', total: true },
      { key: 'ChequeDate', title: 'Cheque Date', width: 100, type: 'date' },
      { key: 'BankAccount', title: 'Bank A/C', width: 150 }, 
      { key: 'ChequeNo', title: 'Cheque No', width: 100 },
      { key: 'WHTax', title: 'W.H Tax', width: 100, type: 'money', total: true }, 
      { key: 'ChequeAmount', title: 'Cheque Amount', width: 120, type: 'money', total: true },
    ],

    // ✅ RENAMED TO MATCH DRAWER & CONFIG
    'Account Receiving Summary': [
      serialCol,
      { key: 'Print', title: 'Print', width: 60, type: 'action' },
      { key: 'EntryDate', title: 'Date', width: 100, type: 'date' },
      { key: 'VoucherNo', title: 'Voucher No', width: 100 },
      { key: 'AccountCode', title: 'A/C Code', width: 100 },
      { key: 'OnlineBankAccount', title: 'Online Bank Account', width: 120 },
      { key: 'CashAmount', title: 'Cash', width: 100, type: 'money', total: true },
      { key: 'ChequeDate', title: 'Cheque Date', width: 100, type: 'date' },
      { key: 'BankAcount', title: 'Bank A/C', width: 120 },
      { key: 'ChequeNo', title: 'Cheque No', width: 100 },
      { key: 'WithHoldingTax', title: 'W.H Tax', width: 100, type: 'money', total: true },
      { key: 'ChequeAmount', title: 'Cheque Amount', width: 100, type: 'money', total: true },
    ],
   'Petty Cash Summary': [
    
      { key: 'ID', title: 'ID', width: 60 }, // The ID column itself
      { key: 'Print', title: 'Print', width: 60, type: 'action' }, // Special 3-button column
      { key: 'EDate', title: 'Date', width: 100, type: 'date' },
      { key: 'AccountTitle', title: 'Account Title', width: 200 },
      { key: 'Debit', title: 'Debit', width: MONEY_WIDTH, type: 'money', total: true },
      { key: 'Credit', title: 'Credit', width: MONEY_WIDTH, type: 'money', total: true },
      { key: 'Remarks', title: 'Remarks', width: 150 },
    ],
   
    'Expense Payment Summary': [
      { key: 'SerialNo', title: 'S.No', width: 50 },
      { key: 'Print', title: 'Print', width: 60, type: 'action' },
      { key: 'EDate', title: 'Date', width: 100, type: 'date' }, 
      { key: 'VoucherNo', title: 'Voucher No', width: 100 },
      { key: 'ParentExpenseName', title: 'Pay To', width: 100 },
      { key: 'ExpenseName', title: 'Expense', width: 150 }, 
      { key: 'BankName', title: 'Bank', width: 150 }, 
      { key: 'ChequeDate', title: 'Cheque Date', width: 100, type: 'date' },
      { key: 'ChequeNo', title: 'Cheque No', width: 100 },
      { key: 'ChequeAmount', title: 'Cheque Amount', width: 100, type: 'money', total: true },
      { key: 'CashAmount', title: 'Cash Amount', width: 100, type: 'money', total: true },
      { key: 'Remarks', title: 'Remarks', width: 200 },
    ],

    'Income Statement_Revenue': [
      { key: 'HeadName', title: 'Head', width: 200 }, 
      { key: 'TotalAmounts', title: 'Amount', width: 120, type: 'money', total: true },
    ],
    // Sub-grid for Revenue (if you click a row)
    'Income Statement_Revenue_Sub': [
      { key: 'AccountTitle', title: 'Account Title', width: 200 },
      { key: 'Debit', title: 'Debit', width: 100, type: 'money' },
      { key: 'Credit', title: 'Credit', width: 100, type: 'money' },
    ],

    // 2. Expense Tab Columns
    'Income Statement_Expense': [
      { key: 'HeadName', title: 'Head', width: 200 },
      { key: 'TotalAmounts', title: 'Amount', width: 120, type: 'money', total: true },
    ],
    
   'Balance Sheet_Assets': [
      { key: 'SerialNo', title: 'S.No', width: 50 },
      { key: 'AssetsAccountTitle', title: 'Account Title', width: 250 }, 
      { key: 'CreditAmount', title: 'Amount', width: 150, type: 'money', total: true },
    ],

    // 2. Equity Tab (Matches your provided JSON)
    'Balance Sheet_Equity': [
      { key: 'SerialNo', title: 'S.No', width: 50 },
      { key: 'EquityAccountTitle', title: 'Account Title', width: 250 },
      { key: 'CreditAmount', title: 'Amount', width: 150, type: 'money', total: true },
    ],

    'Trial Balance': [
      serialCol,
      { key: 'AccountTitle', title: 'Customer', width: 200 },
      { key: 'DEBIT', title: 'Debit', width: 120, type: 'money', total: true },
      { key: 'CREDIT', title: 'Credit', width: 120, type: 'money', total: true },
    ],

    // --- PURCHASE ---
    'Purchase Summary': [
      serialCol,
      { key: 'Print', title: 'Print', width: 60, type: 'action' },
      { key: 'PurchaseNo', title: 'Purchase No', width: 100 },
      { key: 'EDate', title: 'Date', width: 100, type: 'date' },
      { key: 'SupplierName', title: 'Supplier', width: 150 },
      { key: 'GrossAmount', title: 'Gross Amount', width: MONEY_WIDTH, type: 'money', total: true },
      { key: 'DiscountAmount', title: 'Disc. Amount', width: MONEY_WIDTH, type: 'money', total: true },
      { key: 'SalesTaxAmount', title: 'Tax Amount', width: MONEY_WIDTH, type: 'money', total: true },
      { key: 'NetAmount', title: 'Net Amount', width: MONEY_WIDTH, type: 'money', total: true },
      { key: 'PaidAmount', title: 'Paid Amount', width: MONEY_WIDTH, type: 'money', total: true },
      { key: 'BalanceAmount', title: 'Balance Amount', width: MONEY_WIDTH, type: 'money', total: true },
      { key: 'ReturnAmount', title: 'Returned Amount', width: MONEY_WIDTH, type: 'money', total: true },
    ],
'Purchase Summary_Sub': [
      { key: 'ProductName', title: 'Product', width: 200 }, // Changed from 'Product' to 'ProductName'
      { key: 'Quantity', title: 'Qty', width: 60, total: true },
      { key: 'Rate', title: 'Rate', width: 80, type: 'money' },
      { key: 'GrossAmount', title: 'Gross', width: 100, type: 'money', total: true },
      { key: 'Discount', title: 'Disc %', width: 60 },
      { key: 'DiscountAmount', title: 'Disc Amount', width: 100, type: 'money', total: true },
      { key: 'SalesTax', title: 'Tax %', width: 60 },
      { key: 'SalesTaxAmount', title: 'Tax Amount', width: 100, type: 'money', total: true },
      { key: 'NetAmount', title: 'Net Amount', width: 100, type: 'money', total: true },
    ],
    'Good Recieving Summary': [
      serialCol,
      { key: 'Print', title: 'Print', width: 60, type: 'action' },
      { key: 'PurchaseNo', title: 'Order No', width: 100 },
      { key: 'SupplierName', title: 'Supplier', width: 150 },
      { key: 'OrderDate', title: 'Order Date', width: 100, type: 'date' },
      { key: 'DeliveryDate', title: 'Delivery Date', width: 100, type: 'date' },
      { key: 'OrderQuantities', title: 'Total Qty', width: 100, total: true },
    ],
    'Good Recieving Summary_Sub': [
      serialCol,
      { key: 'ReceiveDate', title: 'Receive Date', width: 100, type: 'date' },
      { key: 'ProductName', title: 'Product', width: 150 },
      { key: 'BuiltyNo', title: 'Builty No', width: 100 },
      { key: 'RecievedQuantity', title: 'Recieved Qty', width: 80, total: true },
      { key: 'RejectedQuantity', title: 'Rejected Qty', width: 80, total: true },
      { key: 'ApproveQuantity', title: 'Approved Qty', width: 80, total: true },
    ],

    // --- SALES ---
    'Sales Summary': [
      serialCol,
      { key: 'Print', title: 'Print', width: 60, type: 'action' },
      { key: 'SalesNo', title: 'Sales No', width: 100 },
      { key: 'InvoiceDate', title: 'Date', width: 100, type: 'date' },
      { key: 'CustomerName', title: 'Customer', width: 150 },
      { key: 'SalesmanName', title: 'Salesman', width: 120 },
      { key: 'GrossAmount', title: 'Gross Amount', width: MONEY_WIDTH, type: 'money', total: true },
      { key: 'DiscountAmount', title: 'Disc Amount', width: MONEY_WIDTH, type: 'money', total: true },
      { key: 'SalesTaxAmount', title: 'Sales Tax Amount', width: MONEY_WIDTH, type: 'money', total: true },
      { key: 'NetAmount', title: 'Net Amount', width: MONEY_WIDTH, type: 'money', total: true },
    ],
'Sales Summary_Sub': [
      { key: 'ProductName', title: 'Product', width: 180 },
      { key: 'Boxes', title: 'Boxes', width: 80, type: 'number' }, // New Column
      { key: 'Quantity', title: 'Quantity', width: 80, total: true },
      { key: 'Rate', title: 'Rate', width: 100, type: 'money' },
      { key: 'Discount', title: 'Discount %', width: 100 },
      { key: 'SalesTax', title: 'Sales Tax %', width: 100 },
      { key: 'GrossAmount', title: 'Gross Amount', width: 120, type: 'money', total: true },
      { key: 'DiscountAmount', title: 'Discount Amount', width: 120, type: 'money', total: true },
      { key: 'SalesTaxAmount', title: 'Sales Tax Amount', width: 120, type: 'money', total: true },
      { key: 'NetAmount', title: 'Net Amount', width: 120, type: 'money', total: true },
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
      { key: 'Balance', title: 'Balance', width: 80, total: true },
    ],
    'Product Running Stock': [
      serialCol,
       { key: 'ProductNumber', title: 'Product No', width: 100 },
       { key: 'ProductName', title: 'Product', width: 200 },
       { key: 'RunningStock', title: 'Running Stock (Pc)', width: 120, total: true },
       { key: 'CalculatedPacking', title: 'Stock (Pack)', width: 120, total: true },
    ]
  };

  if (subType) {
      return definitions[`${reportName}_${subType}`] || [];
  }
  return definitions[reportName] || [];
};