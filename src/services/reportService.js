import AsyncStorage from '@react-native-async-storage/async-storage';

// Helper to generate bulk records
const generateBulk = (count, callback) => Array.from({ length: count }, (_, i) => callback(i + 1));

export const fetchReport = async (endpoint, filters) => {
  try {
    const ep = endpoint.toLowerCase();
    console.log(`[REPORT SERVICE] Generating data for endpoint: ${endpoint}`);
    await new Promise(resolve => setTimeout(resolve, 800)); // Loading feel

    // ================================================================
    // 1. EXPENSE PAYMENT SUMMARY (FIXED FOR YOUR SCREENSHOT)
    // ================================================================
    if (ep.includes('expensepayment')) {
      return generateBulk(20, (id) => ({
        SerialNo: id,
        EDate: `2026-02-${(id % 28) + 1}`, // Key: 'EDate'
        VoucherNo: `EXP-VCH-${100 + id}`,   // Key: 'VoucherNo'
        ParentExpenseName: id % 2 === 0 ? "Building Maintenance" : "Marketing Dept", // Key: 'ParentExpenseName'
        ExpenseName: id % 2 === 0 ? "Electricity Bill" : "Internet Charges", // Key: 'ExpenseName'
        BankName: "HBL Islamic Branch",     // Key: 'BankName'
        ChequeDate: `2026-02-15`,           // Key: 'ChequeDate'
        ChequeNo: `CHQ-770${id}`,           // Key: 'ChequeNo'
        ChequeAmount: 12500 * id,           // Key: 'ChequeAmount' - Setting real values instead of 0
        CashAmount: id % 2 === 0 ? 5000 : 0, // Key: 'CashAmount'
        Remarks: "System generated mock record for Codesphinx", // Key: 'Remarks'
        VoucherID: id // Used as PK for printing
      }));
    }

    // ================================================================
    // 2. ACCOUNT PAYMENT & RECEIVING SUMMARY
    // ================================================================
    if (ep.includes('accountpayment') || ep.includes('accountreceiving')) {
      return generateBulk(15, (id) => ({
        SerialNo: id,
        EntryDate: `2026-02-01`,      // Key: 'EntryDate'
        VoucherNo: `VCH-PR-${id}`,    // Key: 'VoucherNo'
        AccountCode: `ACC-00${id}`,    // Key: 'AccountCode'
        OnlineBankAccount: "Bank Alfalah", // Key: 'OnlineBankAccount'
        CashAmount: 5000 * id,         // Key: 'CashAmount'
        ChequeDate: `2026-03-01`,      // Key: 'ChequeDate'
        BankAccount: "Meezan Bank Ltd", // Key: 'BankAccount'
        BankAcount: "Meezan Bank Ltd",  // Key: 'BankAcount' (Single 'c' for Receiving config)
        ChequeNo: `CHQ-8822${id}`,     // Key: 'ChequeNo'
        WHTax: 200,                    // Key: 'WHTax'
        WithHoldingTax: 200,           // Key: 'WithHoldingTax'
        ChequeAmount: 25000 * id       // Key: 'ChequeAmount'
      }));
    }

    // ================================================================
    // 3. SALES SUMMARY
    // ================================================================
    if (ep.includes('salessummary')) {
      return generateBulk(25, (id) => ({
        SerialNo: id,
        SalesNo: `INV-2026-${500 + id}`, // Key: 'SalesNo'
        InvoiceDate: `2026-02-01`,        // Key: 'InvoiceDate'
        CustomerName: id % 2 === 0 ? "Codesphinx VIP" : "Local Retailer", // Key: 'CustomerName'
        SalesmanName: "Ali Raza",         // Key: 'SalesmanName'
        GrossAmount: 15000 * id,          // Key: 'GrossAmount'
        DiscountAmount: 500,              // Key: 'DiscountAmount'
        SalesTaxAmount: 250,              // Key: 'SalesTaxAmount'
        NetAmount: (15000 * id) - 250,    // Key: 'NetAmount'
        SalesID: id
      }));
    }

    // ================================================================
    // 4. PURCHASE SUMMARY & GOOD RECEIVING
    // ================================================================
    if (ep.includes('purchasesummary') || ep.includes('goodreceive')) {
      return generateBulk(15, (id) => ({
        SerialNo: id,
        PurchaseNo: `PUR-BK-0${id}`,  // Key: 'PurchaseNo'
        EDate: `2026-01-20`,           // Key: 'EDate'
        SupplierName: "Global Traders",// Key: 'SupplierName'
        GrossAmount: 60000 * id,
        DiscountAmount: 1000,
        SalesTaxAmount: 2000,
        NetAmount: (60000 * id) - 1000,
        PaidAmount: 40000,
        BalanceAmount: 20000,
        ReturnAmount: 0,
        OrderDate: `2026-01-05`,
        DeliveryDate: `2026-01-15`,
        OrderQuantities: 100 * id,
        PurchaseID: id
      }));
    }

    // ================================================================
    // 5. PRODUCT LEDGER & STOCK
    // ================================================================
    if (ep.includes('productledger')) {
      return generateBulk(20, (id) => ({
        SerialNo: id,
        EDate: `2026-02-01`,         // Key: 'EDate'
        ProductName: "Premium Cement",// Key: 'ProductName'
        Details: "Stock In via GRN",  // Key: 'Details'
        Particular: `REF-00${id}`,    // Key: 'Particular'
        In: 500 * id,                 // Key: 'In'
        Out: 100,                     // Key: 'Out'
        Balance: (500 * id) - 100     // Key: 'Balance'
      }));
    }

    if (ep.includes('productrunningstock')) {
      return generateBulk(30, (id) => ({
        SerialNo: id,
        ProductNumber: `ITM-BK-0${id}`, // Key: 'ProductNumber'
        ProductName: `Steel Rod ${id}mm`, // Key: 'ProductName'
        RunningStock: 1500 + id,          // Key: 'RunningStock'
        CalculatedPacking: 150            // Key: 'CalculatedPacking'
      }));
    }

    // ================================================================
    // 6. FINANCIAL STATEMENTS (Trial, Balance Sheet, Income)
    // ================================================================
    if (ep.includes('trail') || ep.includes('income') || ep.includes('asset') || ep.includes('equity')) {
      return generateBulk(20, (id) => ({
        SerialNo: id,
        AccountTitle: id % 2 === 0 ? "Trade Receivable" : "Staff Salary", // Key: 'AccountTitle'
        HeadName: id % 2 === 0 ? "Operating Income" : "Direct Expenses", // Key: 'HeadName'
        AssetsAccountTitle: `Asset A/C ${id}`,  // Key: 'AssetsAccountTitle'
        EquityAccountTitle: `Equity A/C ${id}`, // Key: 'EquityAccountTitle'
        TotalAmounts: 8500 * id,                // Key: 'TotalAmounts'
        DEBIT: 5000 * id,                       // Key: 'DEBIT' (Matches config exactly)
        CREDIT: 0,                              // Key: 'CREDIT'
        CreditAmount: 8500 * id                 // Key: 'CreditAmount'
      }));
    }

    // Default Fallback for Payables/Receivables
    return generateBulk(15, (id) => ({
      SerialNo: id,
      Account: `AC-CODE-00${id}`,
      Opening: 1000 * id,
      Amount: 500,
      ClosingAmount: (1000 * id) + 500
    }));

  } catch (error) {
    console.error(`[Static Error]:`, error);
    return [];
  }
};

// SUB-GRID FIXED KEYS
export const fetchSubGrid = async (endpoint, parentId, paramName = 'ID', filters = {}) => {
   await new Promise(resolve => setTimeout(resolve, 500));
   return generateBulk(5, (idx) => ({
     SerialNo: idx,
     ProductName: `Sub-Detail Product #${idx}`,
     Quantity: 10 * idx,
     Rate: 1500,
     GrossAmount: 15000 * idx,
     NetAmount: 16500 * idx,
     ReceiveDate: '2026-02-01',
     BuiltyNo: `BLT-${idx}`,
     RecievedQuantity: 10,
     RejectedQuantity: 0,
     ApproveQuantity: 10,
     Total: 16500 * idx
   }));
};