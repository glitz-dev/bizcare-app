import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Login from './components/auth/Login'
import Dashboard from './pages/Dashboard'
import MainLayout from './common/MainLayout'
import InventoryPage from './pages/Inventory'
import Accounts from './pages/Accounts'
import SettingsPage from './pages/Settings'
import UserPage from './pages/UserPage'
import PurchaseIndent from './pages/procurement/PurchaseIndent'
import { Toaster } from './components/ui/sonner'
import PurchaseOrder from './pages/procurement/PurchaseOrder'
import Purchase from './pages/procurement/Purchase'
import PurchaseReturn from './pages/procurement/PurchaseReturn'
import ServiceBill from './pages/procurement/ServiceBill'
import SalesQuotation from './pages/sales/SalesQuotation'
import SalesOrder from './pages/sales/SalesOrder'
import DeliveryNote from './pages/sales/DeliveryNote'
import SalesInvoice from './pages/sales/SalesInvoice'
import SalesReturn from './pages/sales/SalesReturn'
import RetailInvoice from './pages/sales/RetailInvoice'
import SalesServiceBill from './pages/sales/SalesServiceBill';
import OpeningStock from './pages/stock management/OpeningStock'
import PhysicalStock from './pages/stock management/Physicalstock'
import ItemTransferRequest from './pages/stock management/ItemTransferRequest'
import ItemTransferApproval from './pages/stock management/ItemTransferApproval'
import MaterialIssueDetail from './pages/stock management/MaterialIssueDetail'
import MaterialReceive from './pages/stock management/MaterialReceive'
import BarcodePrint from './pages/stock management/BarcodePrint'
import JournalVoucher from './pages/Accounts/Accounts-sub/General/JournalVoucher'
import ContraEntry from './pages/Accounts/Accounts-sub/General/ContraDetails'
import PaymentEntry from './pages/Accounts/Accounts-sub/General/Paymententry'
import ReceiptEntry from './pages/Accounts/Accounts-sub/General/ReceiptEntry'
import ChartOfAccounts from './pages/Accounts/Accounts-sub/General/ChartofAccounts'
import BankReconciliationPage from './pages/Accounts/Accounts-sub/Accounts-Tools/BankReconciliation'
import SupplierPaymentEntryPage from './pages/Accounts/Accounts-sub/Accounts-Tools/SupplierPaymentEntry'
import CustomerReceiptEntry from './pages/Accounts/Accounts-sub/Accounts-Tools/CustomerReceiptEntry'
import { TrialBalance } from './pages/Accounts/Reports/Trialbalance'
import ProfitAndLoss from './pages/Accounts/Reports/Profitandloss'
import BalanceSheet from './pages/Accounts/Reports/BalanceSheet'
import GoodsReceipt from './pages/procurement/Goodsreceipt'

const App = () => {
  return (
    <BrowserRouter>
      <Toaster />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<Navigate to="/login" />} />
        
        <Route element={<MainLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/Inventory" element={<InventoryPage />} />
          <Route path="/Accounts" element={<Accounts />} />
          <Route path="/Settings" element={<SettingsPage />} />
          <Route path="/user" element={<UserPage />} />
          <Route path="/Inventory/indentdetail" element ={<PurchaseIndent />} />
          <Route path="/Inventory/purchase-order" element ={<PurchaseOrder />} />
          <Route path="/Inventory/purchase" element={<Purchase />} />
          <Route path="/Inventory/goods-receipt" element={<GoodsReceipt />} />
          <Route path="/Inventory/purchase-return" element={<PurchaseReturn />} />
          <Route path="/Inventory/service-bill" element={<ServiceBill />} />
          <Route path="/inventory/salesquotationdetail" element={<SalesQuotation />} />
          <Route path="/inventory/sales-order" element={<SalesOrder />} />
          <Route path="/inventory/delivery-note" element={<DeliveryNote />} />
          <Route path="/inventory/sales-invoice" element={<SalesInvoice />} />
          <Route path="/inventory/sales-return" element={<SalesReturn />} />
          <Route path="/inventory/retail-invoice" element={<RetailInvoice />} />
          <Route path="/inventory/sales/service-bill" element={<SalesServiceBill />} />
          <Route path="/inventory/stock-management/opening-stock" element={<OpeningStock />} />
          <Route path="/inventory/stock-management/physical-stock" element={<PhysicalStock />} />
          <Route path="/inventory/stock-management/item-transfer-request" element={<ItemTransferRequest />} />
          <Route path="/inventory/stock-management/item-transfer-approval" element={<ItemTransferApproval />} />
          <Route path="/inventory/stock-management/material-issue-detail" element={<MaterialIssueDetail />} />
          <Route path="/inventory/stock-management/material-receive" element={<MaterialReceive />} />
          <Route path="/inventory/stock-management/barcode-print" element={<BarcodePrint />} />
          <Route path="/Accounts/accounts/journal-voucher" element={<JournalVoucher />} />
          <Route path="/Accounts/accounts/contra-entry" element={<ContraEntry />} />  
          <Route path="/Accounts/accounts/payment-entry" element={<PaymentEntry />} />  
          <Route path="/Accounts/accounts/receipt-entry" element={<ReceiptEntry/>} />  
          <Route path="/Accounts/accounts/chart-account" element={<ChartOfAccounts />} />  
          <Route path="/Accounts/accounts/bank-reconciliation" element={<BankReconciliationPage />} />
          <Route path="/Accounts/accounts/supplier-payment-entry" element={<SupplierPaymentEntryPage />} />
          <Route path="/Accounts/accounts/customer-receipt-entry" element={<CustomerReceiptEntry />} />
          <Route path="/Accounts/reports/trial-balance" element={<TrialBalance />} />
          <Route path="/Accounts/reports/profit-and-loss" element={<ProfitAndLoss />} />
          <Route path="/Accounts/reports/balance-sheet" element={<BalanceSheet />} />
        </Route>
        
        {/* 404 Route */}
        <Route path="*" element={<div>Page Not Found</div>} />
      </Routes>
    </BrowserRouter>
  )
}

export default App