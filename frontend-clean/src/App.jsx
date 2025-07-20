import React from 'react'
import { Routes, Route } from 'react-router-dom'
import CreateSmartLink from './components/smartlinks/CreateSmartLink'
import Dashboard from './components/smartlinks/Dashboard'
import SmartLinkLanding from './components/smartlinks/SmartLinkLanding'
import AdminDashboard from './components/admin/AdminDashboard'
import './App.css'

function App() {
  return (
    <div className="App">
      <Routes>
        {/* Page principale - Création de SmartLinks */}
        <Route path="/" element={<CreateSmartLink />} />
        
        {/* Dashboard utilisateur */}
        <Route path="/dashboard" element={<Dashboard />} />
        
        {/* Landing page pour les SmartLinks */}
        <Route path="/link/:slug" element={<SmartLinkLanding />} />
        <Route path="/l/:slug" element={<SmartLinkLanding />} />
        
        {/* Dashboard admin */}
        <Route path="/admin" element={<AdminDashboard />} />
        
        {/* Route par défaut */}
        <Route path="*" element={<CreateSmartLink />} />
      </Routes>
    </div>
  )
}

export default App