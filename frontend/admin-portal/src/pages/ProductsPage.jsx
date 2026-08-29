import React, { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCategoriesQuery, useDeleteProductMutation, useProductsQuery } from '../hooks/useQueries';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';

export default function ProductsPage() {
  const navigate = useNavigate();
  const { data: products = [], isLoading, isError } = useProductsQuery();
  const { data: categories = [] } = useCategoriesQuery();
  const deleteMutation = useDeleteProductMutation();
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [status, setStatus] = useState('All');
  const [viewProduct, setViewProduct] = useState(null);
  const [deleteProduct, setDeleteProduct] = useState(null);
  const [actionError, setActionError] = useState('');

  const filteredProducts = useMemo(() => {
    const query = search.trim().toLowerCase();
    return products.filter((product) => {
      const matchesSearch =
        !query ||
        product.name.toLowerCase().includes(query) ||
        product.variants.some((variant) => variant.sku?.toLowerCase().includes(query));
      const matchesCategory = category === 'All' || product.category === category;
      const inStock = product.variants.some(
        (variant) => variant.isActive !== false && Number(variant.stockQuantity) > 0
      );
      const displayStatus = !product.isActive ? 'Inactive' : inStock ? 'Active' : 'Out of stock';
      return matchesSearch && matchesCategory && (status === 'All' || status === displayStatus);
    });
  }, [category, products, search, status]);

  const confirmDelete = async () => {
    if (!deleteProduct) return;
    setActionError('');
    try {
      await deleteMutation.mutateAsync(deleteProduct.id);
      setDeleteProduct(null);
    } catch (err) {
      setActionError(err.message || 'Unable to delete product.');
    }
  };

  const getStatus = (product) => {
    if (!product.isActive) return 'Inactive';
    return product.variants.some(
      (variant) => variant.isActive !== false && Number(variant.stockQuantity) > 0
    )
      ? 'Active'
      : 'Out of stock';
  };

  return (
    <div className="space-y-lg max-w-max-content-width mx-auto">
      <div className="flex items-center justify-between gap-md">
        <div>
          <h1 className="font-bold text-2xl text-on-surface">Products</h1>
          <p className="text-xs text-on-surface-variant mt-1">Manage product content, prices, and stock.</p>
        </div>
        <Link to="/products/add"><Button icon="add">Add New Product</Button></Link>
      </div>

      {(isError || actionError) && (
        <div role="alert" className="rounded-lg border border-error/30 bg-error-container/20 text-error p-sm text-xs">
          {actionError || 'Products could not be loaded. Check the API connection and try again.'}
        </div>
      )}

      <div className="bg-surface-container-lowest border border-outline-variant rounded-xl shadow-sm overflow-hidden">
        <div className="p-sm md:p-md border-b border-outline-variant flex flex-col lg:flex-row gap-sm justify-between bg-surface-bright">
          <div className="relative w-full lg:w-96">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-base">search</span>
            <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search by product name or SKU" className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-outline-variant bg-surface text-xs outline-none focus:border-primary" />
          </div>
          <div className="flex flex-col sm:flex-row gap-sm">
            <select value={category} onChange={(event) => setCategory(event.target.value)} className="bg-surface border border-outline-variant text-xs font-semibold px-3 py-2.5 rounded-lg outline-none">
              <option value="All">All categories</option>
              {categories.map((item) => <option key={item.id} value={item.name}>{item.name}</option>)}
            </select>
            <select value={status} onChange={(event) => setStatus(event.target.value)} className="bg-surface border border-outline-variant text-xs font-semibold px-3 py-2.5 rounded-lg outline-none">
              <option value="All">All statuses</option>
              <option value="Active">Active</option>
              <option value="Out of stock">Out of stock</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>
        </div>

        {isLoading ? (
          <div className="py-16 text-center">
            <span className="material-symbols-outlined text-4xl text-primary animate-spin">progress_activity</span>
            <p className="text-xs text-on-surface-variant mt-2">Loading product catalog...</p>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="py-16 text-center space-y-sm">
            <span className="material-symbols-outlined text-5xl text-outline">inventory_2</span>
            <h2 className="font-bold">No products found</h2>
            <p className="text-xs text-on-surface-variant">Change the filters or add a new product.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] text-xs text-left">
              <thead className="bg-surface-container-low border-b border-outline-variant text-on-surface-variant uppercase tracking-wider text-[11px]">
                <tr><th className="p-md">Product</th><th className="p-md">Category</th><th className="p-md">Variants</th><th className="p-md">Total stock</th><th className="p-md">Status</th><th className="p-md text-right">Actions</th></tr>
              </thead>
              <tbody className="divide-y divide-outline-variant">
                {filteredProducts.map((product) => {
                  const productStatus = getStatus(product);
                  const totalStock = product.variants.reduce((sum, variant) => sum + (Number(variant.stockQuantity) || 0), 0);
                  return (
                    <tr key={product.id} className="hover:bg-surface transition-colors">
                      <td className="p-md">
                        <button type="button" onClick={() => setViewProduct(product)} className="flex items-center gap-3 text-left group">
                          <img src={product.img} alt="" className="w-11 h-11 rounded-lg object-cover border border-outline-variant bg-surface-container" />
                          <span><strong className="block text-sm group-hover:text-primary">{product.name}</strong><span className="text-on-surface-variant">{product.isFeatured ? 'Featured' : 'Standard listing'}</span></span>
                        </button>
                      </td>
                      <td className="p-md font-medium">{product.category}</td>
                      <td className="p-md">
                        <div className="flex flex-wrap gap-1">
                          {product.variants.map((variant) => <span key={variant.id || variant.weightLabel} className="px-2 py-1 rounded-md bg-surface-container">₹{variant.price} / {variant.weightLabel}</span>)}
                        </div>
                      </td>
                      <td className="p-md font-semibold">{totalStock} units</td>
                      <td className="p-md"><Badge variant={productStatus === 'Active' ? 'success' : productStatus === 'Inactive' ? 'neutral' : 'warning'}>{productStatus}</Badge></td>
                      <td className="p-md">
                        <div className="flex justify-end gap-1">
                          <button type="button" onClick={() => setViewProduct(product)} className="p-2 text-on-surface-variant hover:text-primary rounded-lg hover:bg-surface-container" title="View details"><span className="material-symbols-outlined text-lg">visibility</span></button>
                          <button type="button" onClick={() => navigate(`/products/${product.id}/edit`)} className="p-2 text-on-surface-variant hover:text-primary rounded-lg hover:bg-surface-container" title="Edit product"><span className="material-symbols-outlined text-lg">edit</span></button>
                          <button type="button" onClick={() => setDeleteProduct(product)} className="p-2 text-on-surface-variant hover:text-error rounded-lg hover:bg-error-container/20" title="Delete product"><span className="material-symbols-outlined text-lg">delete</span></button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
        <div className="p-md border-t border-outline-variant bg-surface text-xs text-on-surface-variant">
          Showing {filteredProducts.length} of {products.length} products
        </div>
      </div>

      <Modal isOpen={Boolean(viewProduct)} onClose={() => setViewProduct(null)} title="Product details">
        {viewProduct && (
          <div className="space-y-md text-xs">
            <div className="flex gap-md">
              <img src={viewProduct.img} alt={viewProduct.name} className="w-20 h-20 rounded-xl object-cover border border-outline-variant" />
              <div><h3 className="font-bold text-base">{viewProduct.name}</h3><p className="text-on-surface-variant">{viewProduct.category}</p><p className="mt-2">{viewProduct.description || 'No description provided.'}</p></div>
            </div>
            <div className="border border-outline-variant rounded-lg divide-y divide-outline-variant">
              {viewProduct.variants.map((variant) => (
                <div key={variant.id || variant.weightLabel} className="grid grid-cols-4 gap-2 p-sm">
                  <strong>{variant.weightLabel}</strong><span>₹{variant.price}</span><span>{variant.stockQuantity} units</span><span className="font-mono">{variant.sku || 'No SKU'}</span>
                </div>
              ))}
            </div>
            <div className="flex justify-end gap-sm"><Button variant="outline" onClick={() => setViewProduct(null)}>Close</Button><Button onClick={() => navigate(`/products/${viewProduct.id}/edit`)}>Edit Product</Button></div>
          </div>
        )}
      </Modal>

      <Modal isOpen={Boolean(deleteProduct)} onClose={() => setDeleteProduct(null)} title="Delete product">
        <div className="space-y-md text-xs">
          <p>Delete <strong>{deleteProduct?.name}</strong>? This cannot be undone.</p>
          <div className="flex justify-end gap-sm"><Button variant="outline" onClick={() => setDeleteProduct(null)}>Cancel</Button><Button variant="danger" onClick={confirmDelete} disabled={deleteMutation.isPending}>{deleteMutation.isPending ? 'Deleting...' : 'Delete Product'}</Button></div>
        </div>
      </Modal>
    </div>
  );
}
