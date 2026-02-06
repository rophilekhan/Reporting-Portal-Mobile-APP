import { useState, useMemo, useEffect, useContext } from 'react';
import { Alert } from 'react-native';
import { getReportConfig } from '../config/reportConfig';
import { getReportColumns } from '../config/columnConfig';
import { BranchContext } from '../context/BranchContext'; // Context Import

export const useReportLogic = (reportName) => {
  const config = getReportConfig(reportName);
  const { companyBranchId } = useContext(BranchContext); // Branch ID uthayien

  const [activeType, setActiveType] = useState(
    config.isSpecial && config.specialTypes ? config.specialTypes[0] : null
  );

  const columns = useMemo(() => {
    if (config.isSpecial && activeType) {
      return getReportColumns(reportName, activeType.label);
    }
    return getReportColumns(reportName);
  }, [reportName, config.isSpecial, activeType]);

  const [isLoading, setIsLoading] = useState(false);
  const [data, setData] = useState([]);

  const [filters, setFilters] = useState(() => {
    const defaults = {
      fromDate: new Date(new Date().setMonth(new Date().getMonth() - 1)), 
      toDate: new Date(),
    };
    if (config.filters) {
      config.filters.forEach(f => {
        if (f.type === 'dropdown' || f.type === 'text') {
          defaults[f.key] = ''; 
        }
      });
    }
    return defaults;
  });

  const updateFilter = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  // ✅ BRANCH CHANGE OBSERVER: Jab branch change ho, data refresh karein
  useEffect(() => {
    if (companyBranchId) {
      loadReportData();
    }
  }, [companyBranchId, activeType]); // activeType tab change hota hai jab Income Statement ke tabs switch hon

  const generateBulk = (count, callback) => Array.from({ length: count }, (_, i) => callback(i + 1));

  const loadReportData = async () => {
    if (config.filters) {
      for (const filter of config.filters) {
        if (filter.required && (!filters[filter.key] || filters[filter.key] === '')) {
          Alert.alert('Missing Input', `Please select a ${filter.label} to proceed.`);
          return; 
        }
      }
    }

    setIsLoading(true);

    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Multiplier logic: Branch ID ke mutabiq amounts change honge
      const multiplier = companyBranchId ? parseInt(companyBranchId) : 1;
      let mockData = [];

      // ================= DYNAMIC BULK DATA GENERATOR =================

      if (reportName.includes('Sales Summary')) {
        mockData = generateBulk(25, (id) => ({
          SerialNo: id,
          SalesNo: `INV-26-${1000 + id}`,
          InvoiceDate: `2026-02-${(id % 28) + 1}`,
          CustomerName: id % 2 === 0 ? "Codesphinx VIP Client" : "Alpha Tech Ltd",
          SalesmanName: id % 3 === 0 ? "Ali Khan" : "Zahid Ahmed",
          GrossAmount: (15000 * id) * multiplier,
          DiscountAmount: 500 * multiplier,
          SalesTaxAmount: 200 * multiplier,
          NetAmount: ((15000 * id) - 300) * multiplier,
          SalesID: id 
        }));
      } 

      else if (reportName.includes('Purchase Summary')) {
        mockData = generateBulk(20, (id) => ({
          SerialNo: id,
          PurchaseNo: `PUR-BK-${2000 + id}`,
          EDate: `2026-01-15`,
          SupplierName: id % 2 === 0 ? "Eastern Traders" : "Global Sourcing",
          GrossAmount: (25000 * id) * multiplier,
          NetAmount: (24000 * id) * multiplier,
          PaidAmount: 20000 * multiplier,
          BalanceAmount: (4000 * id) * multiplier,
          ReturnAmount: 0,
          PurchaseID: id 
        }));
      }

      else if (reportName.includes('Expense Payment Summary')) {
        mockData = generateBulk(15, (id) => ({
          SerialNo: id,
          EDate: `2026-02-05`,
          VoucherNo: `EXP-VCH-${id}`,
          ParentExpenseName: "Administrative",
          ExpenseName: id % 2 === 0 ? "Electricity Bill" : "Staff Refreshment",
          BankName: "HBL Islamic",
          ChequeDate: `2026-02-28`,
          ChequeNo: `CHQ-99${id}`,
          ChequeAmount: (8000 * id) * multiplier,
          CashAmount: 0,
          Remarks: "Monthly Operational Expense",
          VoucherID: id
        }));
      }

      else if (reportName.includes('Account Payment') || reportName.includes('Receiving')) {
        mockData = generateBulk(18, (id) => ({
          SerialNo: id,
          EntryDate: `2026-02-10`,
          VoucherNo: `VCH-00${id}`,
          AccountCode: `ACC-${100 + id}`,
          OnlineBankAccount: "Bank Alfalah Main",
          CashAmount: id % 2 === 0 ? (5000 * id) * multiplier : 0,
          ChequeDate: `2026-03-01`,
          BankAccount: "Meezan Bank Ltd",
          BankAcount: "Meezan Bank Ltd", // Single 'c' casing sync
          ChequeNo: `CHQ-${8800 + id}`,
          WHTax: 150 * multiplier,
          WithHoldingTax: 150 * multiplier,
          ChequeAmount: id % 2 !== 0 ? (12000 * id) * multiplier : 0
        }));
      }

      else if (reportName.includes('Product Ledger')) {
        mockData = generateBulk(30, (id) => ({
          SerialNo: id,
          EDate: `2026-02-${(id % 28) + 1}`,
          ProductName: id % 2 === 0 ? "Cement 50KG Bag" : "Steel Bar 12mm",
          Details: id % 2 === 0 ? "Sale Invoice" : "Purchase GRN",
          Particular: `REF-${500 + id}`,
          In: id % 2 !== 0 ? 100 * multiplier : 0,
          Out: id % 2 === 0 ? 50 * multiplier : 0,
          Balance: (1000 + (id * 10)) * multiplier
        }));
      }

      else if (reportName.includes('Trial Balance')) {
        mockData = generateBulk(25, (id) => ({
          SerialNo: id,
          AccountTitle: id % 2 === 0 ? `Trade Debtor ${id}` : `Staff Payable ${id}`,
          DEBIT: id % 2 === 0 ? (2500 * id) * multiplier : 0,
          CREDIT: id % 2 !== 0 ? (1800 * id) * multiplier : 0
        }));
      }

      else if (reportName.includes('Petty Cash')) {
        mockData = generateBulk(15, (id) => ({
          ID: id,
          EDate: `2026-02-10`,
          AccountTitle: "Office Maintenance",
          Debit: (2000 * id) * multiplier,
          Credit: 0,
          Remarks: "Approved by Rophile Khan"
        }));
      }

      else {
        // Fallback for all other 15 reports
        mockData = generateBulk(20, (id) => ({
          SerialNo: id,
          Account: `AC-CODE-00${id}`,
          AccountTitle: `Generic Head ${id}`,
          Opening: 10000 * multiplier,
          Amount: 5000 * multiplier,
          ClosingAmount: 15000 * multiplier,
          HeadName: "Operations",
          TotalAmounts: 1000 * id,
          AssetsAccountTitle: `Asset A/C ${id}`,
          EquityAccountTitle: `Equity A/C ${id}`,
          CreditAmount: 5000 * multiplier
        }));
      }

      setData(mockData);

    } catch (error) {
      console.error("Static Logic Error:", error);
      setData([]);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    data, columns, config, filters, isLoading, 
    updateFilter, loadReportData, 
    activeType, setActiveType 
  };
};