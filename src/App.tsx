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
          <Route path="/Inventory/purchase-return" element={<PurchaseReturn />} />
          <Route path="/Inventory/service-bill" element={<ServiceBill />} />
          <Route path="/inventory/salesquotationdetail" element={<SalesQuotation />} />
          <Route path="/inventory/sales-order" element={<SalesOrder />} />
        </Route>
        
        {/* 404 Route */}
        <Route path="*" element={<div>Page Not Found</div>} />
      </Routes>
    </BrowserRouter>
  )
}

export default App