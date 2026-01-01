import { ENDPOINTS } from "../services/apiConfig";

export const getReportConfig = (routeName) => {
  // --- 1. Reusable Components ---
  const dateFilter = { type: 'date', key: 'dateRange' };
  const showBtn = { type: 'button', label: 'Show', action: 'show', icon: 'eye-outline', color: '#009BA9' };
  const printBtn = { type: 'button', label: 'Print', action: 'print', icon: 'print-outline', color: '#555' };

  // --- 2. Dropdowns ---
  const accountDropdown = { 
    type: 'dropdown', label: 'Account', key: 'AccountCode', 
    api: ENDPOINTS.ACCOUNTS, valueField: 'ID', labelField: 'Name' 
  };

  const expenseDropdown = { 
    type: 'dropdown', label: 'Expense', key: 'ExpenseID', 
    api: ENDPOINTS.EXPENSES, valueField: 'ID', labelField: 'Name' 
  };

  const supplierDropdown = { 
    type: 'dropdown', label: 'Supplier', key: 'SupplierID', 
    api: ENDPOINTS.SUPPLIERS, valueField: 'ID', labelField: 'Name' 
  };

  const customerDropdown = { 
    type: 'dropdown', label: 'Customer', key: 'CustomerID', 
    api: ENDPOINTS.CUSTOMERS, valueField: 'ID', labelField: 'Name' 
  };

  const productDropdown = { 
    type: 'dropdown', label: 'Product', key: 'ProductID', 
    api: ENDPOINTS.PRODUCTS, valueField: 'ID', labelField: 'Name' 
  };

  const warehouseDropdown = { 
    type: 'dropdown', label: 'Warehouse', key: 'WarehouseID', 
    api: ENDPOINTS.WAREHOUSES, valueField: 'ID', labelField: 'Name' 
  };

  const categoryDropdown = {
    type: 'dropdown', label: 'Category', key: 'CategoryID', 
    api: ENDPOINTS.CATEGORIES, valueField: 'ID', labelField: 'Name' 
  };

  const subCategoryDropdown = {
    type: 'dropdown', label: 'Product Sub Category', key: 'SubCategoryID', 
    api: '/GetProductSubCategory', valueField: 'ID', labelField: 'Name'
  };

  // --- 3. Report Configurations ---
  const configs = {
    // ================= ACCOUNTS =================
    'Account Payables Report': { 
      api: '/GetAccountPayableForGrid', 
      filters: [dateFilter, showBtn, printBtn],
      sidebarPrintConfig: { reportName: 'AccountPayableReportMobile' }
    },
    'Account Recievable Report': { 
      api: '/GetAccountReceivable', 
      filters: [dateFilter, showBtn, printBtn],
      sidebarPrintConfig: { reportName: 'AccountReceivableReportMobile' }
    },
    
    'Account Payment Summary': { 
      api: '/GetAccountPaymentSummary', 
      filters: [dateFilter, accountDropdown, showBtn, printBtn],
      sidebarPrintConfig: { reportName: 'AccountPaymentSummaryReportMobile' },
      rowPrintConfig: { reportName: 'AccountPaymentEntryReportMobile', idParam: 'VoucherNo', pk: 'VoucherNo' }
    },

    'Account Receiving Summary': { 
      api: '/GetAccountReceivingSummary', 
      filters: [dateFilter, accountDropdown, showBtn, printBtn],
      sidebarPrintConfig: { reportName: 'AccountReceivingSummaryReportMobile' },
      rowPrintConfig: { reportName: 'AccountReceivingEntryReportMobile', idParam: 'VoucherNo', pk: 'VoucherNo' }
    },
    
    'Petty Cash Summary': { 
      api: '/GetPettyCashSummaryNew', 
      filters: [dateFilter, accountDropdown, showBtn, printBtn],
      isGrouped: true, groupBy: 'ID',
      sidebarPrintConfig: { reportName: 'PettyCashSummaryReportMobile' },
      rowPrintConfig: { reportName: 'PettyCashMobile', idParam: 'VoucherNo', pk: 'ID' }
    },

    'Expense Payment Summary': { 
      api: '/GetExpensePaymentSummary', 
      filters: [dateFilter, expenseDropdown, showBtn, printBtn],
      sidebarPrintConfig: { reportName: 'ExpensePaymentSummaryReportMobile' },
      rowPrintConfig: { reportName: 'ExpensePaymentReportMobile', idParam: 'VoucherID', pk: 'VoucherID' }
    },

    'Income Statement': { 
      api: '/GetIncomeStatementRevenue', 
      filters: [dateFilter, showBtn, printBtn],
      isSpecial: true,
      specialTypes: [
        { label: 'Revenue', api: '/GetIncomeStatementRevenue', subApi: '/GetIncomeStatementRevenueDetail', pk: 'AccountCode' },
        { label: 'Expense', api: '/GetIncomeStatementExpense' }
      ],
      sidebarPrintConfig: { reportName: 'IncomeStatementMobile' }
    },

    'Balance Sheet': {
      api: '/GetAssetDetail',
      filters: [{ type: 'date', key: 'toDateOnly' }, showBtn, printBtn], 
      isSpecial: true,
      specialTypes: [
        { label: 'Assets', api: '/GetAssetDetail' },
        { label: 'Equity', api: '/GetEquityDetail' }
      ],
      sidebarPrintConfig: { reportName: 'BalanceSheetReportMobile' }
    },

    // ✅ FIXED: Removed printBtn
    'Trial Balance': { 
      api: '/GetTrailBalance', 
      filters: [dateFilter, showBtn] 
    },

    // ================= PURCHASE =================
    'Purchase Summary': { 
      api: '/GetPurchaseSummaryReport', 
      filters: [dateFilter, supplierDropdown, showBtn, printBtn],
      hasSubGrid: true, subApi: '/GetPurchaseSummaryDetail', subGridKey: 'Purchase Summary_Sub', pk: 'PurchaseID',
      sidebarPrintConfig: { reportName: 'PurchaseSummaryReportMobile' },
      rowPrintConfig: { reportName: 'PurchaseInvoiceReportMobile', idParam: 'PurchaseID', pk: 'PurchaseID' }
    },

    'Good Recieving Summary': { 
      api: '/GetGoodReceiveSummary', 
      filters: [dateFilter, supplierDropdown, showBtn, printBtn],
      hasSubGrid: true, subApi: '/GetGoodReceiveSummaryDetail', subGridKey: 'Good Recieving Summary_Sub', pk: 'PurchaseID',
      sidebarPrintConfig: { reportName: 'GoodReceiveSummaryMobile' },
      rowPrintConfig: { reportName: 'GoodReceiveIndividualReportMobile', idParam: 'PurchaseID', pk: 'PurchaseID' }
    },

    // ================= SALES =================
    // ✅ FIXED: Removed printBtn
    'Sales Summary': { 
      api: '/GetSalesSummary', 
      filters: [
        dateFilter, customerDropdown, 
        { type: 'dropdown', label: 'Salesman', key: 'SalesManID', api: '/GetAllSalesman', valueField: 'ID', labelField: 'Name' },
        { type: 'text', label: 'Type', key: 'type', defaultValue: 'All' },
        showBtn // Removed printBtn here
      ],
      hasSubGrid: true, subApi: '/GetSalesSummaryDetailForGrid', subGridKey: 'Sales Summary_Sub', pk: 'SalesID',
      rowPrintConfig: { reportName: 'SalesInvoiceMobile', idParam: 'SalesID', pk: 'SalesID' }
    },

    // ================= INVENTORY =================
    'Product Ledger': { 
      api: '/GetProductLedger', 
      filters: [
        dateFilter, 
        { ...productDropdown, required: true },
        { ...warehouseDropdown, required: true },
        showBtn, printBtn
      ],
      sidebarPrintConfig: { reportName: 'ProductLedgerReportMobile' }
    },

    'Product Running Stock': { 
      api: '/GetProductRunningStock', 
      filters: [
        { ...warehouseDropdown, required: true },
        categoryDropdown, subCategoryDropdown,
        showBtn, printBtn
      ],
      sidebarPrintConfig: { reportName: 'ProductRunningStockReportMobile' }
    }
  };

  return configs[routeName] || { filters: [], api: '' };
};