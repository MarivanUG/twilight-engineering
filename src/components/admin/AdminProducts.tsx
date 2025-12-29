import React, { useState, useEffect } from 'react';
import type { Product } from '../../types';
import { getProducts, addProduct, updateProduct, deleteProduct, uploadFile } from '../../lib/firestoreService';
import { Trash2, Edit, Save, XCircle } from 'lucide-react'; // Removed ShoppingCart, ArrowUpFromLine, PlusCircle
import { formatPrice } from '../../lib/utils';

const AdminProducts: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [newProductData, setNewProductData] = useState<Partial<Product> & { imageFile?: File | null }>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    setError('');
    try {
      const fetchedProducts = await getProducts();
      setProducts(fetchedProducts as Product[]);
    } catch (err) {
      setError('Failed to fetch products.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type, checked } = e.target as HTMLInputElement;
    setNewProductData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setNewProductData({ ...newProductData, imageFile: e.target.files[0] });
    }
  };

  const handleSaveProduct = async () => {
    setLoading(true);
    setError('');
    try {
      let imageUrl = (newProductData as any).imageUrl; // Use as any for imageUrl

      if (newProductData.imageFile) {
        imageUrl = await uploadFile('products', newProductData.imageFile);
      }

      const productToSave: Partial<Product> = { ...(newProductData as Partial<Product>), imageUrl: imageUrl as string };

      if (editingProduct) {
        await updateProduct(editingProduct.id as string, productToSave as any);
      } else {
        await addProduct(productToSave as any);
      }
      setNewProductData({});
      setEditingProduct(null);
      fetchProducts();
    } catch (err) {
      setError('Failed to save product.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      setLoading(true);
      setError('');
      try {
        await deleteProduct(id);
        fetchProducts();
      } catch (err) {
        setError('Failed to delete product.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleEditClick = (product: Product) => {
    setEditingProduct(product);
    setNewProductData(product);
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-slate-800 mb-6">Manage Products</h2>

      {loading && <p className="text-blue-500 mb-4">Loading...</p>}
      {error && <p className="text-red-500 mb-4">{error}</p>}

      {/* Add/Edit Form */}
      <div className="mb-8 border p-4 rounded-lg bg-slate-50">
        <h3 className="text-xl font-semibold mb-4">{editingProduct ? 'Edit Product' : 'Add New Product'}</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            type="text"
            name="name"
            placeholder="Product Name"
            value={newProductData.name || ''}
            onChange={handleInputChange}
            className="p-2 border rounded-md"
          />
          <input
            type="number"
            name="price"
            placeholder="Price"
            value={newProductData.price || 0}
            onChange={handleInputChange}
            className="p-2 border rounded-md"
          />
          <textarea
            name="description"
            placeholder="Description"
            value={newProductData.description || ''}
            onChange={handleInputChange}
            className="p-2 border rounded-md col-span-2"
          />
          <input
            type="text"
            name="category"
            placeholder="Category"
            value={newProductData.category || ''}
            onChange={handleInputChange}
            className="p-2 border rounded-md"
          />
          <div className="flex items-center space-x-2">
            <input
              type="file"
              name="imageFile"
              onChange={handleFileChange}
              className="p-2 border rounded-md w-full"
            />
            {newProductData.imageUrl && <img src={newProductData.imageUrl} alt="Preview" className="h-10 w-10 object-cover rounded-md" />}
          </div>
          <div className="flex items-center space-x-2 col-span-2">
            <input
              type="checkbox"
              name="inStock"
              checked={newProductData.inStock || false}
              onChange={handleInputChange}
              className="p-2"
            />
            <label htmlFor="inStock">In Stock</label>
            <input
              type="checkbox"
              name="featured"
              checked={newProductData.featured || false}
              onChange={handleInputChange}
              className="p-2"
            />
            <label htmlFor="featured">Featured</label>
          </div>
        </div>
        <div className="mt-4 flex justify-end space-x-2">
          <button
            onClick={handleSaveProduct}
            className="px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 flex items-center"
            disabled={loading}
          >
            <Save size={18} className="mr-2" /> {editingProduct ? 'Update Product' : 'Add Product'}
          </button>
          {editingProduct && (
            <button
              onClick={() => { setEditingProduct(null); setNewProductData({}); }}
              className="px-4 py-2 bg-gray-300 rounded-md hover:bg-gray-400 flex items-center"
              disabled={loading}
            >
              <XCircle size={18} className="mr-2" /> Cancel Edit
            </button>
          )}
        </div>
      </div>

      {/* Products List */}
      <h3 className="text-xl font-semibold mb-4">Existing Products</h3>
      <div className="space-y-4">
        {products.map((product) => (
          <div key={product.id} className="flex items-center justify-between p-3 border rounded-md bg-white">
            <div className="flex items-center space-x-3">
              <img src={product.imageUrl} alt={product.name} className="w-16 h-16 object-cover rounded-md" />
              <div>
                <p className="font-semibold text-slate-800">{product.name} - {formatPrice(product.price)}</p>
                <p className="text-sm text-slate-600">{product.category} {product.inStock ? '(In Stock)' : '(Out of Stock)'}</p>
              </div>
            </div>
            <div className="flex space-x-2">
              <button onClick={() => handleEditClick(product)} className="p-2 text-blue-500 hover:text-blue-700">
                <Edit size={18} />
              </button>
              <button onClick={() => handleDeleteProduct(product.id as string)} className="p-2 text-red-500 hover:text-red-700">
                <Trash2 size={18} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminProducts;