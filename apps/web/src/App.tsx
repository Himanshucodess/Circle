import { BrowserRouter, Routes, Route, Outlet } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { HomePage } from "@/pages/HomePage";
import { SellPage } from "@/pages/SellPage";
import { ProductDetailPage } from "@/pages/ProductDetailPage";
import { AdminDashboard } from "@/pages/admin/AdminDashboard";
import { CategoriesPage } from "@/pages/admin/CategoriesPage";
import { CategoryEditorPage } from "@/pages/admin/CategoryEditorPage";
import { FieldsPage } from "@/pages/admin/FieldsPage";
import { FieldEditorPage } from "@/pages/admin/FieldEditorPage";

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

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<PublicLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/sell" element={<SellPage />} />
          <Route path="/products/:id" element={<ProductDetailPage />} />
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
