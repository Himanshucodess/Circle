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
          <Route path="/products/:id" element={<ProductDetailPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/auth/callback" element={<AuthCallbackPage />} />
        </Route>
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/categories" element={<CategoriesPage />} />
        <Route path="/admin/categories/:id" element={<CategoryEditorPage />} />
        <Route path="/admin/fields" element={<FieldsPage />} />
        <Route path="/admin/fields/new" element={<FieldEditorPage />} />
        <Route path="/admin/fields/:id" element={<FieldEditorPage />} />
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
