import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  Link,
} from "react-router-dom";
import Login from "./pages/Login";
import Home from "./pages/Home";
import Signup from "./pages/Signup";
import SparePartsPage from "./pages/systemPages/SparePartsPage";
import StockInPage from "./pages/systemPages/StockInPage";
import StockOutPage from "./pages/systemPages/StockOutPage";
import ReportPage from "./pages/systemPages/ReportPage";
import Navbar from "./components/Navbar"; // Assuming Navbar is in components folder

// Helper to check for authentication
const isAuthenticated = () => !!localStorage.getItem("token");

// ProtectedRoute component
const ProtectedRoute = ({ children }) => {
  if (!isAuthenticated()) {
    return <Navigate to="/" replace />;
  }
  return <>{children}</>;
};

// Layout for authenticated routes
const AppLayout = ({ children }) => (
  <div className="min-h-screen bg-base-200">
    <Navbar />
    <main className="container mx-auto p-4 sm:p-6 lg:p-8">{children}</main>
  </div>
);

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/signup" element={<Signup />} />
        <Route path="/" element={<Login />} />

        {/* Protected Routes */}
        <Route
          path="/home"
          element={
            <ProtectedRoute>
              <AppLayout>
                <Home />
              </AppLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/spare-parts"
          element={
            <ProtectedRoute>
              <AppLayout>
                <SparePartsPage />
              </AppLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/stock-in"
          element={
            <ProtectedRoute>
              <AppLayout>
                <StockInPage />
              </AppLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/stock-out"
          element={
            <ProtectedRoute>
              <AppLayout>
                <StockOutPage />
              </AppLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/reports"
          element={
            <ProtectedRoute>
              <AppLayout>
                <ReportPage />
              </AppLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="*"
          element={
            <div className="min-h-screen flex flex-col items-center justify-center bg-base-200">
              <h1 className="text-4xl font-bold text-primary mb-4">404</h1>
              <p className="text-xl text-base-content mb-8">Page Not Found</p>
              <Link to="/home" className="btn btn-primary">
                Go Home
              </Link>
            </div>
          }
        />
      </Routes>
    </Router>
  );
}
export default App;
