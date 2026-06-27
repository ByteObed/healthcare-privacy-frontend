

// import { Routes, Route, Navigate } from "react-router-dom"
// import LoginPage from "@/pages/LoginPage"
// import RegisterPage from "@/pages/RegisterPage"
// import PatientsPage from "@/pages/PatientsPage"
// import ProtectedRoute from "@/components/ProtectedRoute"
// import DashboardLayout from "@/components/DashboardLayout"

// function App() {
//   return (
//     <Routes>
//       <Route path="/" element={<Navigate to="/login" replace />} />
//       <Route path="/login" element={<LoginPage />} />
//       <Route path="/register" element={<RegisterPage />} />

//       <Route
//         path="/dashboard"
//         element={
//           <ProtectedRoute>
//             <DashboardLayout />
//           </ProtectedRoute>
//         }
//       >
//         <Route index element={<Navigate to="/dashboard/patients" replace />} />
//         <Route path="patients" element={<PatientsPage />} />
//         {/* more routes (encryption, anonymization, masking, differential-privacy, comparison) added next */}
//       </Route>
//     </Routes>
//   )
// }

// export default App
import { Routes, Route, Navigate } from "react-router-dom"
import LoginPage from "@/pages/LoginPage"
import RegisterPage from "@/pages/RegisterPage"
import PatientsPage from "@/pages/PatientsPage"
import EncryptionPage from "@/pages/EncryptionPage"
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
        {/* anonymization, masking, differential-privacy, comparison added next */}
      </Route>
    </Routes>
  )
}

export default App