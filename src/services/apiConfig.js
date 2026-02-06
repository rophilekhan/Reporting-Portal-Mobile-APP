// export const API_BASE_URL = "https://erp.hassoftsolutions.com/MobileReportsAPI";

// Mock Base URL for Static Reporting Portal
export const API_BASE_URL = "MOCK_MODE_ENABLED"; 

export const ENDPOINTS = {
  // ✅ AUTHENTICATION
  LOGIN: "/Login_Static",
  
  // ✅ DROPDOWNS & FILTERS (COMMENTED ORIGINAL ENDPOINTS)
  /*
  ACCOUNTS: "/GetChartOfAccountsWithAccountCode", 
  EXPENSES: "/GetExpenses",
  SUPPLIERS: "/GetAllActiveSuppliers",
  CUSTOMERS: "/GetCustomer",
  PRODUCTS: "/GetProducts",
  WAREHOUSES: "/GetAllWarehouse",
  CATEGORIES: "/GetProductCategory",
  SALESMEN: "/GetSalesMan", 
  */

  // STATIC MOCK MAPPING
  ACCOUNTS: "/Static_Accounts",
  EXPENSES: "/Static_Expenses",
  SUPPLIERS: "/Static_Suppliers",
  CUSTOMERS: "/Static_Customers",
  PRODUCTS: "/Static_Products",
  WAREHOUSES: "/Static_Warehouses",
  CATEGORIES: "/Static_Categories",
  SALESMEN: "/Static_Salesmen",
};