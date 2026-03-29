import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Products from './pages/Products';
import ProductForm from './pages/ProductForm';
import Dishes from './pages/Dishes';
import DishForm from './pages/DishForm';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Navigate to="/products" replace />} />
        
        <Route path="products" element={<Products />} />
        <Route path="products/new" element={<ProductForm />} />
        <Route path="products/edit/:id" element={<ProductForm />} />

        <Route path="dishes" element={<Dishes />} />
        <Route path="dishes/new" element={<DishForm />} />
        <Route path="dishes/edit/:id" element={<DishForm />} />
      </Route>
    </Routes>
  );
}

export default App;
