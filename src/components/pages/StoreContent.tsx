import { useState, useEffect } from 'react';
import type { Product } from '../../types';
import { getProducts } from '../../lib/firestoreService';
import { DEFAULT_PRODUCTS } from '../../lib/constants';
import { formatPrice } from '../../lib/utils';
import { ShoppingCart } from 'lucide-react';
import { useCartStore } from '../../lib/cartStore';

export const StoreContent: React.FC = () => {
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  // @ts-expect-error
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [categories, setCategories] = useState<string[]>([]);
  const { addToCart, setIsCartOpen, cartItemCount } = useCartStore();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const fetched = await getProducts();
        const productsData = (fetched && fetched.length > 0) ? (fetched as Product[]) : (DEFAULT_PRODUCTS as Product[]);
        setAllProducts(productsData);
        setFilteredProducts(productsData);

        // Extract unique categories
        const uniqueCategories = Array.from(new Set(productsData.map(p => p.category)));
        setCategories(['All', ...uniqueCategories]);

      } catch (error) {
        console.error("Failed to fetch products, using default:", error);
        setAllProducts(DEFAULT_PRODUCTS as Product[]);
        setFilteredProducts(DEFAULT_PRODUCTS as Product[]);
        const uniqueCategories = Array.from(new Set(DEFAULT_PRODUCTS.map(p => p.category)));
        setCategories(['All', ...uniqueCategories]);
      }
    };
    fetchProducts();
  }, []);

  useEffect(() => {
    let results = allProducts;

    // Filter by category
    if (selectedCategory !== 'All') {
      results = results.filter(product => product.category === selectedCategory);
    }

    // Filter by search term
    if (searchTerm) {
      results = results.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredProducts(results);
  }, [searchTerm, selectedCategory, allProducts]);

  return (
    <div className="bg-slate-50 min-h-screen pb-20 animate-fade-in">
      <div className="bg-slate-900 text-white py-20 px-6 flex justify-between items-center max-w-7xl mx-auto">
        <div><h1 className="text-4xl font-bold">TECL Store</h1></div>
        <button onClick={() => setIsCartOpen(true)} className="bg-orange-600 text-white px-6 py-3 rounded-full font-bold flex items-center">
          <ShoppingCart className="mr-2" /> Cart ({cartItemCount()})
        </button>
      </div>
      <div className="max-w-7xl mx-auto px-6 -mt-8 relative z-10 mb-12">
        <div className="bg-white rounded-xl shadow-lg p-4 flex gap-2">
          {categories.map(cat => (
            <button key={cat} onClick={() => setSelectedCategory(cat)} className={`px-4 py-2 rounded-full text-sm font-medium ${selectedCategory === cat ? 'bg-orange-600 text-white' : 'bg-slate-100 hover:bg-slate-200'}`}>{cat}</button>
          ))}
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {filteredProducts.map(p => (
          <div key={p.id} className="bg-white rounded-2xl p-4 shadow-sm hover:shadow-xl transition-all flex flex-col group">
            <div className="relative h-48 bg-slate-100 rounded-xl mb-4 overflow-hidden">
              <img src={p.imageUrl} className="w-full h-full object-cover mix-blend-multiply" />
            </div>
            <h4 className="font-bold text-slate-900 line-clamp-1">{p.name}</h4>
            <div className="flex justify-between items-center mt-auto pt-4 border-t border-slate-100">
              <span className="font-bold text-slate-900">{formatPrice(p.price)}</span>
              <button onClick={() => addToCart(p)} className="p-2 rounded-full bg-orange-100 text-orange-600 hover:bg-orange-600 hover:text-white">
                <ShoppingCart size={20} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};