import { ENDPOINTS } from '../services/apiConfig';

export const getReportConfig = (routeName) => {
  // --- 1. Define Reusable Components ---
  const dateFilter = { type: 'date', key: 'dateRange' };
  const showBtn = { type: 'button', label: 'Show', action: 'show', icon: 'eye-outline', color: '#009BA9' };
  const printBtn = { type: 'button', label: 'Print', action: 'print', icon: 'print-outline', color: '#555' };

  // --- 2. Define Dropdowns ---
  const accountDropdown = { 
    type: 'dropdown', label: 'Account', key: 'AccountCode', 
    api: ENDPOINTS.ACCOUNTS, valueField: 'AccountCode', labelField: 'AccountTitle' 
  };
  const expenseDropdown = { 
    type: 'dropdown', label: 'Expense', key: 'AccountCode', 
    api: ENDPOINTS.EXPENSES, valueField: 'AccountCode', labelField: 'AccountTitle' 
  };
  const supplierDropdown = { 
    type: 'dropdown', label: 'Supplier', key: 'SupplierID', 
    api: ENDPOINTS.SUPPLIERS, valueField: 'SupplierID', labelField: 'SupplierName' 
  };
  const customerDropdown = { 
    type: 'dropdown', label: 'Customer', key: 'CustomerID', 
    api: ENDPOINTS.CUSTOMERS, valueField: 'CustomerID', labelField: 'CustomerName' 
  };
  const productDropdown = { 
    type: 'dropdown', label: 'Product', key: 'productID', 
    api: ENDPOINTS.PRODUCTS, valueField: 'ProductID', labelField: 'ProductName' 
  };
  const warehouseDropdown = { 
    type: 'dropdown', label: 'Warehouse', key: 'warehouseID', 
    api: ENDPOINTS.WAREHOUSES, valueField: 'WarehouseID', labelField: 'WarehouseName' 
  };
  const categoryDropdown = {
    type: 'dropdown', label: 'Category', key: 'categoryID',
    api: ENDPOINTS.CATEGORIES, valueField: 'CategoryID', labelField: 'CategoryName'
  };

  // --- 3. Map Reports to Filters ---
  // IMPORTANT: These Keys must match your Drawer Screen names EXACTLY
  const configs = {
    // ================= ACCOUNTS =================
    'Account Payables Report': { 
      api: '/GetAccountPayableForGrid', 
      filters: [dateFilter, showBtn, printBtn] 
    },
    'Account Recievable Report': { 
      api: '/GetAccountReceivable', 
      filters: [dateFilter, showBtn, printBtn] 
    },
    // FIXED KEYS HERE:
    'Account Payment Summary': { 
      api: '/GetAccountPaymentSummary', 
      filters: [dateFilter, accountDropdown, showBtn, printBtn] 
    },
    'Account Receiving Summary': { 
      api: '/GetAccountReceivingSummary', 
      filters: [dateFilter, accountDropdown, showBtn, printBtn] 
    },
    'Petty Cash Summary': { 
      api: '/GetPettyCashSummaryNew', 
      filters: [dateFilter, accountDropdown, showBtn, printBtn] 
    },
    'Expense Payment Summary': { 
      api: '/GetExpensePaymentSummary', 
      filters: [dateFilter, expenseDropdown, showBtn, printBtn] 
    },
    'Income Statement': { 
      api: '/GetIncomeStatementRevenue', 
      filters: [dateFilter, showBtn, printBtn],
      isSpecial: true,
      specialTypes: [
        { label: 'Revenue', api: '/GetIncomeStatementRevenue', subApi: '/GetIncomeStatementRevenueDetail' },
        { label: 'Expense', api: '/GetIncomeStatementExpense' }
      ]
    },
    'Balance Sheet': {
      api: '/GetAssetDetail',
      filters: [{ type: 'date', key: 'toDateOnly' }, showBtn, printBtn], 
      isSpecial: true,
      specialTypes: [
        { label: 'Assets', api: '/GetAssetDetail' },
        { label: 'Equity', api: '/GetAssetDetail' }
      ]
    },

    // ================= PURCHASE =================
    'Purchase Summary': { 
      api: '/GetIncomeStatementExpense', 
      filters: [dateFilter, supplierDropdown, showBtn, printBtn],
      hasSubGrid: true,
      subApi: '/GetPurchaseSummaryDetail',
      subGridKey: 'PurchaseSummary_Sub',
      pk: 'PurchaseID' 
    },
    'Good Recieving Summary': { 
      api: '/GetGoodReceiveSummary', 
      filters: [dateFilter, supplierDropdown, showBtn, printBtn],
      hasSubGrid: true,
      subApi: '/GetGoodReceiveSummaryDetail',
      subGridKey: 'Good Recieving Summary_Sub',
      pk: 'PurchaseID' 
    },

    // ================= SALES =================
    'Sales Summary': { 
      api: '/GetSalesSummary', 
      filters: [
        dateFilter, 
        customerDropdown, 
        { type: 'dropdown', label: 'Salesman', key: 'SalesManID', api: '/GetSalesMan', valueField: 'SalesManID', labelField: 'Name' },
        { type: 'text', label: 'Type', key: 'string type', defaultValue: 'All' },
        showBtn,
        printBtn
      ],
      hasSubGrid: true,
      subGridKey: 'Sales Summary_Sub'
    },

    // ================= INVENTORY =================
    'Product Ledger': { 
      api: '/GetProductLedger', 
      filters: [dateFilter, productDropdown, warehouseDropdown, showBtn, printBtn]
    },
    'Product Running Stock': { 
      api: '/GetProductRunningStock', 
      filters: [warehouseDropdown, categoryDropdown, showBtn, printBtn]
    }
  };

  // Safe fallback to prevent crash, but logs warning if name is missing
  const config = configs[routeName];
  if (!config) {
      console.warn(`[Config Error] No config found for route: "${routeName}". Check spelling in reportConfig.js`);
      return { filters: [], api: '' };
  }
  return config;
};