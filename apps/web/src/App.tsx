import { BrowserRouter, Routes, Route, Outlet } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { HomePage } from "@/pages/HomePage";
import { SellPage } from "@/pages/SellPage";
import { ProductDetailPage } from "@/pages/ProductDetailPage";
import { LoginPage } from "@/pages/LoginPage";
import { AuthCallbackPage } from "@/pages/AuthCallbackPage";
import { AdminDashboard } from "@/pages/admin/AdminDashboard";
import { CategoriesPage } from "@/pages/admin/CategoriesPage";
import { CategoryEditorPage } from "@/pages/admin/CategoryEditorPage";
import { FieldsPage } from "@/pages/admin/FieldsPage";
import { FieldEditorPage } from "@/pages/admin/FieldEditorPage";
import { AuthProvider } from "@/context/AuthContext";
import { ClerkProvider } from "@clerk/clerk-react";
import { ClerkAuthProvider } from "@/context/ClerkAuthContext";
import { AdminLoginPage } from "@/pages/admin/AdminLoginPage";
import { AdminGate } from "@/pages/admin/AdminGate";
import { RequestsPage } from "@/pages/admin/RequestsPage";
import { MyListingsPage } from "@/pages/MyListingsPage";

function PublicLayout() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}

const CLERK_KEY = (import.meta as any).env?.VITE_CLERK_PUBLISHABLE_KEY as string | undefined;
const isClerkValid = !!CLERK_KEY && /^pk_(test|live)_[A-Za-z0-9_\-]{10,}$/.test(CLERK_KEY);

function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<PublicLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/sell" element={<SellPage />} />
          <Route path="/my-listings" element={<MyListingsPage />} />
          <Route path="/products/:id" element={<ProductDetailPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/auth/callback" element={<AuthCallbackPage />} />
        </Route>
        <Route path="/admin/login" element={<AdminLoginPage />} />
        <Route path="/admin" element={<AdminGate><AdminDashboard /></AdminGate>} />
        <Route path="/admin/categories" element={<AdminGate><CategoriesPage /></AdminGate>} />
        <Route path="/admin/categories/:id" element={<AdminGate><CategoryEditorPage /></AdminGate>} />
        <Route path="/admin/fields" element={<AdminGate><FieldsPage /></AdminGate>} />
        <Route path="/admin/fields/new" element={<AdminGate><FieldEditorPage /></AdminGate>} />
        <Route path="/admin/fields/:id" element={<AdminGate><FieldEditorPage /></AdminGate>} />
        <Route path="/admin/requests" element={<AdminGate><RequestsPage /></AdminGate>} />
      </Routes>
    </BrowserRouter>
  );
}

export default function App() {
  if (isClerkValid) {
    return (
      <ClerkProvider publishableKey={CLERK_KEY!} afterSignOutUrl="/">
        <ClerkAuthProvider>
          <AuthProvider>
            <AppRoutes />
          </AuthProvider>
        </ClerkAuthProvider>
      </ClerkProvider>
    );
  }
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
}
