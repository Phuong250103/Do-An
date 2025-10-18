import { Route, Routes } from "react-router-dom";
import AuthRegister from "./pages/auth/register.jsx";
import AuthLayout from "./components/auth/layout";
import AuthLogin from "./pages/auth/login";
import AdminLayout from "./components/admin-view/layout.jsx";
import AdminDashboard from "./pages/admin-view/dashboard.jsx";
import AdminProducts from "./pages/admin-view/products.jsx";
import AdminOrders from "./pages/admin-view/orders.jsx";
import AdminFeatures from "./pages/admin-view/features.jsx";
import NotFound from "./pages/not-found/index.jsx";
import ShoppingLayout from "./components/shopping-view/layout.jsx";
import ShoppingHome from "./pages/shopping-view/home.jsx";
import ShoppingCheckout from "./pages/shopping-view/checkout.jsx";
import ShoppingListing from "./pages/shopping-view/listing.jsx";
import ShoppingAccount from "./pages/shopping-view/account.jsx";

function App() {
  return (
    <div className="flex flex-col overflow-hidden bg-white">
      <Routes>
        <Route path="/auth" element={<AuthLayout />}>
          <Route path="login" element={<AuthLogin />} />
          <Route path="register" element={<AuthRegister />} />
        </Route>
        <Route path="/admin" element={<AdminLayout />}>
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="products" element={<AdminProducts />} />
          <Route path="orders" element={<AdminOrders />} />
          <Route path="features" element={<AdminFeatures />} />
        </Route>
        <Route path="/shop" element={<ShoppingLayout />}>
          <Route path="home" element={<ShoppingHome />} />
          <Route path="listing" element={<ShoppingListing />} />
          <Route path="checkout" element={<ShoppingCheckout />} />
          <Route path="account" element={<ShoppingAccount />} />
        </Route>
        <Route path="*" element={<NotFound />} />
      </Routes>
    </div>
  );
}

export default App;
