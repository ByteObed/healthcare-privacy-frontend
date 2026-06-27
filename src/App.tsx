import { Routes, Route, Navigate } from "react-router-dom"
import LoginPage from "@/pages/LoginPage"
import RegisterPage from "@/pages/RegisterPage"
import PatientsPage from "@/pages/PatientsPage"
import EncryptionPage from "@/pages/EncryptionPage"
import AnonymizationPage from "@/pages/AnonymizationPage"
import MaskingPage from "@/pages/MaskingPage"
import DifferentialPrivacyPage from "@/pages/DifferentialPrivacyPage"
import ComparisonPage from "@/pages/ComparisonPage"
import ProtectedRoute from "@/components/ProtectedRoute"
import DashboardLayout from "@/components/DashboardLayout"

function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/dashboard/patients" replace />} />
        <Route path="patients" element={<PatientsPage />} />
        <Route path="encryption" element={<EncryptionPage />} />
        <Route path="anonymization" element={<AnonymizationPage />} />
        <Route path="masking" element={<MaskingPage />} />
        <Route path="differential-privacy" element={<DifferentialPrivacyPage />} />
        <Route path="comparison" element={<ComparisonPage />} />
        
      </Route>
    </Routes>
  )
}

export default App