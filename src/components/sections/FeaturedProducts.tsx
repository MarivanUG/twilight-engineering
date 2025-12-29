import { useState, useEffect } from 'react';
import type { Product } from '../../types';
import { getProducts } from '../../lib/firestoreService';
import { DEFAULT_PRODUCTS } from '../../lib/constants';
import { formatPrice } from '../../lib/utils';
import { ShoppingCart, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useCartStore } from '../../lib/cartStore';

interface FeaturedProductsProps {
  // addToCart: (product: Product) => void; // No longer passed as prop, directly use useCartStore
}

export const FeaturedProducts: React.FC<FeaturedProductsProps> = () => { // Removed props
  const [products, setProducts] = useState<Product[]>([]);
  const { addToCart } = useCartStore(); // Directly use useCartStore
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const fetchedProducts = await getProducts();
        if (fetchedProducts && fetchedProducts.length > 0) {
          // Filter for featured products
          setProducts((fetchedProducts as Product[]).filter(p => p.featured));
        } else {
          setProducts(DEFAULT_PRODUCTS.filter(p => p.featured) as Product[]);
        }
      } catch (error) {
        console.error("Failed to fetch products, using default:", error);
        setProducts(DEFAULT_PRODUCTS.filter(p => p.featured) as Product[]);
      }
    };

    fetchProducts();
  }, []);

  if (products.length === 0) {
    return (
      <section className="py-20 bg-slate-50 text-center">
        <div className="max-w-7xl mx-auto px-6">
          <p className="text-slate-500">No featured products available.</p>
        </div>
      </section>
    );
  }

  return (
    <section className="py-20 bg-slate-50">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex justify-between items-end mb-12">
          <div>
            <h2 className="text-orange-600 font-bold uppercase text-sm mb-2">Online Store</h2>
            <h3 className="text-3xl font-bold text-slate-900">Featured Equipment</h3>
          </div>
          <button
            onClick={() => navigate('/store')}
            className="flex items-center font-bold hover:text-orange-600 text-slate-900 transition-colors"
          >
            Visit Store <ArrowRight className="ml-2" />
          </button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.map((p) => (
            <div key={p.id} className="bg-white rounded-2xl p-4 shadow-sm hover:shadow-xl transition-all group flex flex-col">
              <div className="relative h-48 bg-slate-100 rounded-xl mb-4 overflow-hidden">
                <img src={p.imageUrl} alt={p.name} className="w-full h-full object-cover mix-blend-multiply group-hover:scale-105 transition-transform" />
                {!p.inStock && <div className="absolute inset-0 bg-white/60 flex items-center justify-center"><span className="bg-slate-800 text-white text-xs font-bold px-3 py-1 rounded-full">Out of Stock</span></div>}
              </div>
              <h4 className="font-bold text-slate-900 line-clamp-1">{p.name}</h4>
              <div className="flex justify-between items-center mt-auto pt-4 border-t border-slate-100">
                <span className="font-bold text-slate-900">{formatPrice(p.price)}</span>
                <button
                  onClick={() => addToCart(p)}
                  disabled={!p.inStock}
                  className="p-2 rounded-full bg-orange-100 text-orange-600 hover:bg-orange-600 hover:text-white disabled:opacity-50"
                >
                  <ShoppingCart size={20} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
