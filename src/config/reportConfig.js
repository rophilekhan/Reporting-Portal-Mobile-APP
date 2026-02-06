import { ENDPOINTS } from "../services/apiConfig";

export const getReportConfig = (routeName) => {
  // --- 1. Reusable Components ---
  const dateFilter = { type: 'date', key: 'dateRange' };
  
  // Static buttons
  const showBtn = { type: 'button', label: 'Show (Static)', action: 'show', icon: 'eye-outline', color: '#009BA9' };
  const printBtn = { type: 'button', label: 'Print (Demo)', action: 'print', icon: 'print-outline', color: '#555' };

  // --- 2. Dropdowns (Mocking API calls within the app logic) ---
  const accountDropdown = { 
    type: 'dropdown', label: 'Account', key: 'AccountCode', 
    api: '/GetAccountsStatic', valueField: 'ID', labelField: 'Name' 
  };

  const expenseDropdown = { 
    type: 'dropdown', label: 'Expense', key: 'ExpenseID', 
    api: '/GetExpensesStatic', valueField: 'ID', labelField: 'Name' 
  };

  const supplierDropdown = { 
    type: 'dropdown', label: 'Supplier', key: 'SupplierID', 
    api: '/GetSuppliersStatic', valueField: 'ID', labelField: 'Name' 
  };

  const customerDropdown = { 
    type: 'dropdown', label: 'Customer', key: 'CustomerID', 
    api: '/GetCustomersStatic', valueField: 'ID', labelField: 'Name' 
  };

  const productDropdown = { 
    type: 'dropdown', label: 'Product', key: 'ProductID', 
    api: '/GetProductsStatic', valueField: 'ID', labelField: 'Name' 
  };

  const warehouseDropdown = { 
    type: 'dropdown', label: 'Warehouse', key: 'WarehouseID', 
    api: '/GetWarehousesStatic', valueField: 'ID', labelField: 'Name' 
  };

  const categoryDropdown = {
    type: 'dropdown', label: 'Category', key: 'CategoryID', 
    api: '/GetCategoriesStatic', valueField: 'ID', labelField: 'Name' 
  };

  const subCategoryDropdown = {
    type: 'dropdown', label: 'Product Sub Category', key: 'SubCategoryID', 
    api: '/GetProductSubCategoryStatic', valueField: 'ID', labelField: 'Name'
  };

  // --- 3. Report Configurations (Mapped to Static Data in Hook/Service) ---
  const configs = {
    // ================= ACCOUNTS =================
    'Account Payables Report': { 
      api: '/GetAccountPayableStatic', 
      filters: [dateFilter, showBtn, printBtn],
      sidebarPrintConfig: { reportName: 'AccountPayableReportMobile' }
    },
    'Account Recievable Report': { 
      api: '/GetAccountReceivableStatic', 
      filters: [dateFilter, showBtn, printBtn],
      sidebarPrintConfig: { reportName: 'AccountReceivableReportMobile' }
    },
    
    'Account Payment Summary': { 
      api: '/GetAccountPaymentSummaryStatic', 
      filters: [dateFilter, accountDropdown, showBtn, printBtn],
      sidebarPrintConfig: { reportName: 'AccountPaymentSummaryReportMobile' },
      rowPrintConfig: { reportName: 'AccountPaymentEntryReportMobile', idParam: 'VoucherNo', pk: 'VoucherNo' }
    },

    'Account Receiving Summary': { 
      api: '/GetAccountReceivingSummaryStatic', 
      filters: [dateFilter, accountDropdown, showBtn, printBtn],
      sidebarPrintConfig: { reportName: 'AccountReceivingSummaryReportMobile' },
      rowPrintConfig: { reportName: 'AccountReceivingEntryReportMobile', idParam: 'VoucherNo', pk: 'VoucherNo' }
    },
    
    'Petty Cash Summary': { 
      api: '/GetPettyCashSummaryStatic', 
      filters: [dateFilter, accountDropdown, showBtn, printBtn],
      isGrouped: true, groupBy: 'ID',
      sidebarPrintConfig: { reportName: 'PettyCashSummaryReportMobile' },
      rowPrintConfig: { reportName: 'PettyCashMobile', idParam: 'VoucherNo', pk: 'ID' }
    },

    'Expense Payment Summary': { 
      api: '/GetExpensePaymentSummaryStatic', 
      filters: [dateFilter, expenseDropdown, showBtn, printBtn],
      sidebarPrintConfig: { reportName: 'ExpensePaymentSummaryReportMobile' },
      rowPrintConfig: { reportName: 'ExpensePaymentReportMobile', idParam: 'VoucherID', pk: 'VoucherID' }
    },

    'Income Statement': { 
      api: '/GetIncomeStatementRevenueStatic', 
      filters: [dateFilter, showBtn, printBtn],
      isSpecial: true,
      specialTypes: [
        { label: 'Revenue', api: '/GetRevenueStatic', subApi: '/GetRevenueDetailStatic', pk: 'AccountCode' },
        { label: 'Expense', api: '/GetExpenseStatic' }
      ],
      sidebarPrintConfig: { reportName: 'IncomeStatementMobile' }
    },

    'Balance Sheet': {
      api: '/GetAssetDetailStatic',
      filters: [{ type: 'date', key: 'toDateOnly' }, showBtn, printBtn], 
      isSpecial: true,
      specialTypes: [
        { label: 'Assets', api: '/GetAssetDetailStatic' },
        { label: 'Equity', api: '/GetEquityDetailStatic' }
      ],
      sidebarPrintConfig: { reportName: 'BalanceSheetReportMobile' }
    },

    'Trial Balance': { 
      api: '/GetTrailBalanceStatic', 
      filters: [dateFilter, showBtn] 
    },

    // ================= PURCHASE =================
    'Purchase Summary': { 
      api: '/GetPurchaseSummaryStatic', 
      filters: [dateFilter, supplierDropdown, showBtn, printBtn],
      hasSubGrid: true, subApi: '/GetPurchaseSummaryDetailStatic', subGridKey: 'Purchase Summary_Sub', pk: 'PurchaseID',
      sidebarPrintConfig: { reportName: 'PurchaseSummaryReportMobile' },
      rowPrintConfig: { reportName: 'PurchaseInvoiceReportMobile', idParam: 'PurchaseID', pk: 'PurchaseID' }
    },

    'Good Recieving Summary': { 
      api: '/GetGoodReceiveSummaryStatic', 
      filters: [dateFilter, supplierDropdown, showBtn, printBtn],
      hasSubGrid: true, subApi: '/GetGoodReceiveSummaryDetailStatic', subGridKey: 'Good Recieving Summary_Sub', pk: 'PurchaseID',
      sidebarPrintConfig: { reportName: 'GoodReceiveSummaryMobile' },
      rowPrintConfig: { reportName: 'GoodReceiveIndividualReportMobile', idParam: 'PurchaseID', pk: 'PurchaseID' }
    },

    // ================= SALES =================
    'Sales Summary': { 
      api: '/GetSalesSummaryStatic', 
      filters: [
        dateFilter, customerDropdown, 
        { type: 'dropdown', label: 'Salesman', key: 'SalesManID', api: '/GetAllSalesmanStatic', valueField: 'ID', labelField: 'Name' },
        { type: 'text', label: 'Type', key: 'type', defaultValue: 'All' },
        showBtn
      ],
      hasSubGrid: true, subApi: '/GetSalesSummaryDetailStatic', subGridKey: 'Sales Summary_Sub', pk: 'SalesID',
      rowPrintConfig: { reportName: 'SalesInvoiceMobile', idParam: 'SalesID', pk: 'SalesID' }
    },

    // ================= INVENTORY =================
    'Product Ledger': { 
      api: '/GetProductLedgerStatic', 
      filters: [
        dateFilter, 
        { ...productDropdown, required: true },
        { ...warehouseDropdown, required: true },
        showBtn, printBtn
      ],
      sidebarPrintConfig: { reportName: 'ProductLedgerReportMobile' }
    },

    'Product Running Stock': { 
      api: '/GetProductRunningStockStatic', 
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