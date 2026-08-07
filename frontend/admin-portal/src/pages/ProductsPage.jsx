import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  useProductsQuery,
  useCategoriesQuery,
  useDeleteProductMutation,
  useUpdateProductMutation,
} from '../hooks/useQueries';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import Modal from '../components/ui/Modal';

export default function ProductsPage() {
  const { data: products = [], isLoading: isProductsLoading } = useProductsQuery();
  const { data: categories = [] } = useCategoriesQuery();
  const deleteProductMutation = useDeleteProductMutation();
  const updateProductMutation = useUpdateProductMutation();

  const [categoryFilter, setCategoryFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [search, setSearch] = useState('');
  const [productToDelete, setProductToDelete] = useState(null);
  const [productToEdit, setProductToEdit] = useState(null);
  const [productToView, setProductToView] = useState(null);

  // Form state for editing
  const [editForm, setEditForm] = useState({
    id: '',
    name: '',
    category: '',
    price: '',
    stock: '',
    origin: '',
    badge: '',
    rating: '4.8',
    reviewsCount: '120',
    sku: '',
    img: '',
    isActive: true,
  });

  const handleOpenEdit = (product) => {
    setProductToEdit(product);
    setEditForm({
      id: product.id,
      name: product.name,
      category: product.category,
      price: product.price,
      stock: product.stock,
      origin: product.origin || '',
      badge: product.badge || '',
      rating: product.rating || '4.8',
      reviewsCount: product.reviewsCount || product.reviews || '120',
      sku: product.sku || '',
      img: product.img || product.imageUrl || '',
      isActive: product.status !== 'Inactive' && product.status !== 'Out of Stock',
    });
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!editForm.name) return;

    const matchedCategory = categories.find((c) => c.name.toLowerCase() === (editForm.category || '').toLowerCase());
    const categoryId = matchedCategory ? matchedCategory.id : (categories[0]?.id || '00000000-0000-0000-0000-000000000000');

    await updateProductMutation.mutateAsync({
      id: editForm.id,
      data: {
        ...productToEdit,
        categoryId,
        name: editForm.name,
        category: editForm.category,
        price: Number(editForm.price) || 0,
        stock: Number(editForm.stock) || 0,
        origin: editForm.origin,
        badge: editForm.badge,
        rating: Number(editForm.rating) || 4.8,
        reviewsCount: Number(editForm.reviewsCount) || 120,
        sku: editForm.sku,
        img: editForm.img || productToEdit.img,
        isActive: editForm.isActive,
        status: !editForm.isActive ? 'Inactive' : (Number(editForm.stock) === 0 ? 'Out of Stock' : 'Active'),
      },
    });

    setProductToEdit(null);
  };

  const confirmDelete = async () => {
    if (productToDelete) {
      await deleteProductMutation.mutateAsync(productToDelete.id);
      setProductToDelete(null);
    }
  };


  const filtered = (products || []).filter(p => {
    if (!p) return false;
    const matchCat = categoryFilter === 'All' || p.category === categoryFilter;
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) || (p.sku && p.sku.toLowerCase().includes(search.toLowerCase()));
    const isInactive = p.status === 'Inactive' || p.status === 'Out of Stock' || p.stock === 0;
    const matchStatus = statusFilter === 'All' || (statusFilter === 'Active' ? !isInactive : isInactive);
    return matchCat && matchSearch && matchStatus;
  });

  return (
    <div className="space-y-lg max-w-max-content-width mx-auto">
      {/* Top Header matching Figma design */}
      <div className="flex items-center justify-between">
        <h1 className="font-bold text-2xl text-on-surface">Products</h1>
        <Link to="/products/add">
          <Button icon="add">Add New Product</Button>
        </Link>
      </div>

      {/* Main Content Card matching Figma design */}
      <div className="bg-surface-container-lowest border border-outline-variant rounded-xl shadow-sm overflow-hidden text-xs">
        {/* Controls Bar matching Figma design */}
        <div className="p-sm md:p-md border-b border-outline-variant flex flex-col sm:flex-row items-center justify-between gap-md bg-surface-bright">
          <div className="relative w-full sm:w-80">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-base">
              search
            </span>
            <input
              type="text"
              placeholder="Search products..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-outline-variant bg-surface text-xs text-on-surface outline-none focus:border-primary transition-all"
            />
          </div>

          <div className="flex items-center space-x-sm w-full sm:w-auto justify-end">
            <div className="relative">
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="bg-surface border border-outline-variant text-xs font-semibold px-3 py-2 pr-8 rounded-lg text-on-surface outline-none cursor-pointer appearance-none"
              >
                <option value="All">All Categories</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.name}>{c.name}</option>
                ))}
              </select>
              <span className="material-symbols-outlined absolute right-2 top-1/2 -translate-y-1/2 text-on-surface-variant text-sm pointer-events-none">
                expand_more
              </span>
            </div>

            <div className="relative">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-surface border border-outline-variant text-xs font-semibold px-3 py-2 pr-8 rounded-lg text-on-surface outline-none cursor-pointer appearance-none"
              >
                <option value="All">All Status</option>
                <option value="Active">Active</option>
                <option value="Inactive">Inactive / Out of Stock</option>
              </select>
              <span className="material-symbols-outlined absolute right-2 top-1/2 -translate-y-1/2 text-on-surface-variant text-sm pointer-events-none">
                expand_more
              </span>
            </div>
          </div>
        </div>

        {/* Table matching Figma design */}
        {isProductsLoading ? (
          <div className="text-center py-16 bg-surface space-y-sm m-md">
            <span className="material-symbols-outlined text-4xl text-primary animate-spin">progress_activity</span>
            <p className="text-xs text-on-surface-variant font-medium">Loading products catalog...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 bg-surface border border-dashed border-outline-variant rounded-xl space-y-sm m-md">
            <span className="material-symbols-outlined text-5xl text-outline">search_off</span>
            <div>
              <h3 className="font-bold text-base text-on-surface">No Products Found</h3>
              <p className="text-xs text-on-surface-variant mt-1 max-w-sm mx-auto">
                No catalog items matched your search query or filter. Try clearing filters or create a new product.
              </p>
            </div>
            <Link to="/products/add">
              <Button icon="add">Add Product</Button>
            </Link>
          </div>
        ) : (

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[800px]">
              <thead>
                <tr className="border-b border-outline-variant bg-surface-container-low text-on-surface-variant font-semibold text-[11px] uppercase tracking-wider">
                  <th className="p-md font-medium">PRODUCT</th>
                  <th className="p-md font-medium">CATEGORY</th>
                  <th className="p-md font-medium">PRICE</th>
                  <th className="p-md font-medium">STOCK</th>
                  <th className="p-md font-medium">STATUS</th>
                  <th className="p-md font-medium text-right">ACTIONS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant">
                {filtered.map((p) => {
                  const isActive = p.status !== 'Inactive' && p.status !== 'Out of Stock' && p.stock > 0;
                  return (
                    <tr
                      key={p.id}
                      className={`hover:bg-surface transition-colors group ${productToDelete?.id === p.id ? 'bg-surface-container-high border-l-4 border-error' : ''
                        }`}
                    >
                      <td className="p-md">
                        <div className="flex items-center space-x-3">
                          <img
                            src={p.img || 'https://images.unsplash.com/photo-1508061252222-1d5f3083e589?w=150&auto=format&fit=crop&q=60'}
                            alt={p.name}
                            className="w-11 h-11 rounded-lg object-cover border border-outline-variant shrink-0 bg-surface-container-high"
                          />
                          <div>
                            <span className="font-bold text-sm text-on-surface block hover:text-primary transition-colors cursor-pointer" onClick={() => setProductToView(p)}>
                              {p.name}
                            </span>
                            <span className="text-on-surface-variant text-[11px] font-mono">
                              SKU: {p.sku || `PRD-${p.id.substring(0, 4)}`}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="p-md text-on-surface font-medium">{p.category}</td>
                      <td className="p-md text-on-surface font-bold">₹{p.price}</td>
                      <td className="p-md text-on-surface-variant font-medium">{p.stock} kg</td>
                      <td className="p-md">
                        <Badge variant={isActive ? 'success' : 'neutral'}>
                          {isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </td>
                      <td className="p-md text-right">
                        <div className="flex items-center justify-end space-x-1.5">
                          <button
                            onClick={() => setProductToView(p)}
                            className="p-1.5 text-on-surface-variant hover:text-primary rounded-lg hover:bg-surface-container-high transition-colors"
                            title="View Product Details"
                          >
                            <span className="material-symbols-outlined text-lg">visibility</span>
                          </button>
                          <button
                            onClick={() => handleOpenEdit(p)}
                            className="p-1.5 text-on-surface-variant hover:text-primary rounded-lg hover:bg-surface-container-high transition-colors"
                            title="Edit Product"
                          >
                            <span className="material-symbols-outlined text-lg">edit</span>
                          </button>
                          <button
                            onClick={() => setProductToDelete(p)}
                            className="p-1.5 text-on-surface-variant hover:text-error rounded-lg hover:bg-error-container/20 transition-colors"
                            title="Delete Product"
                          >
                            <span className="material-symbols-outlined text-lg">delete</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Footer matching Figma design */}
        <div className="p-md border-t border-outline-variant bg-surface flex items-center justify-between text-on-surface-variant text-xs">
          <span>Showing 1 to {filtered.length} of {products.length} results</span>
          <div className="flex items-center space-x-1">
            <button className="px-3 py-1 border border-outline-variant rounded-md hover:bg-surface-container-high transition-colors disabled:opacity-40" disabled>
              Previous
            </button>
            <button className="px-3 py-1 bg-primary text-on-primary font-bold rounded-md shadow-sm">
              1
            </button>
            <span className="px-1 text-on-surface-variant">...</span>
            <button className="px-3 py-1 border border-outline-variant rounded-md hover:bg-surface-container-high transition-colors">
              10
            </button>
            <button className="px-3 py-1 border border-outline-variant rounded-md hover:bg-surface-container-high transition-colors">
              Next
            </button>
          </div>
        </div>
      </div>

      {/* View Product Modal */}
      <Modal
        isOpen={!!productToView}
        onClose={() => setProductToView(null)}
        title="Product Details"
      >
        {productToView && (
          <div className="space-y-md text-xs">
            <div className="flex items-center space-x-md pb-sm border-b border-outline-variant">
              <img
                src={productToView.img}
                alt={productToView.name}
                className="w-16 h-16 rounded-xl object-cover border border-outline-variant"
              />
              <div>
                <h3 className="font-bold text-base text-on-surface">{productToView.name}</h3>
                <p className="text-on-surface-variant">Category: <span className="font-semibold text-on-surface">{productToView.category}</span></p>
                <p className="text-on-surface-variant">SKU: <span className="font-mono text-on-surface">{productToView.sku}</span></p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-md bg-surface-container-low p-sm rounded-lg">
              <div>
                <span className="text-on-surface-variant block font-medium">Base Price (250g):</span>
                <span className="font-bold text-sm text-primary">₹{productToView.price}</span>
              </div>
              <div>
                <span className="text-on-surface-variant block font-medium">Stock Inventory:</span>
                <span className="font-bold text-sm text-on-surface">{productToView.stock} kg</span>
              </div>
              <div>
                <span className="text-on-surface-variant block font-medium">Country of Origin:</span>
                <span className="font-semibold text-on-surface">{productToView.origin || 'India'}</span>
              </div>
              <div>
                <span className="text-on-surface-variant block font-medium">Status:</span>
                <Badge variant={productToView.status !== 'Inactive' ? 'success' : 'neutral'}>
                  {productToView.status || 'Active'}
                </Badge>
              </div>
            </div>

            <div>
              <h4 className="font-bold text-on-surface mb-1">Weight & Price Variants</h4>
              <div className="space-y-1 bg-surface p-2 rounded-lg border border-outline-variant">
                {productToView.variants && productToView.variants.length > 0 ? (
                  productToView.variants.sort((a, b) => a.price - b.price).map((v, idx) => (
                    <div
                      key={v.id || idx}
                      className={`flex justify-between items-center py-1 font-medium ${idx !== productToView.variants.length - 1 ? 'border-b border-outline-variant/50' : ''
                        }`}
                    >
                      <span className="text-on-surface">{v.weightLabel || 'Variant'} {v.sku ? `(${v.sku})` : ''}</span>
                      <div className="text-right">
                        <span className="font-bold text-on-surface">₹{v.price}</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="flex justify-between py-1 font-medium">
                    <span>Default Variant</span>
                    <span className="font-bold">₹{productToView.price}</span>
                  </div>
                )}
              </div>
            </div>


            <div className="flex justify-end pt-sm">
              <Button onClick={() => setProductToView(null)}>
                Close Preview
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Edit Product Modal */}
      <Modal
        isOpen={!!productToEdit}
        onClose={() => setProductToEdit(null)}
        title="Edit Product Details"
      >
        <form onSubmit={handleSaveEdit} className="space-y-md text-xs">
          <div>
            <label className="block font-semibold text-on-surface mb-1">Product Name</label>
            <input
              type="text"
              required
              value={editForm.name}
              onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
              className="w-full px-3 py-2 bg-surface border border-outline-variant rounded-lg text-on-surface outline-none focus:border-primary"
            />
          </div>

          <div className="grid grid-cols-2 gap-md">
            <div>
              <label className="block font-semibold text-on-surface mb-1">Category</label>
              <select
                value={editForm.category}
                onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}
                className="w-full px-3 py-2 bg-surface border border-outline-variant rounded-lg text-on-surface outline-none focus:border-primary"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.name}>{c.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-on-surface mb-1">SKU</label>
              <input
                type="text"
                value={editForm.sku}
                onChange={(e) => setEditForm({ ...editForm, sku: e.target.value })}
                className="w-full px-3 py-2 bg-surface border border-outline-variant rounded-lg text-on-surface outline-none focus:border-primary"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-md">
            <div>
              <label className="block font-semibold text-on-surface mb-1">Price (₹)</label>
              <input
                type="number"
                required
                value={editForm.price}
                onChange={(e) => setEditForm({ ...editForm, price: e.target.value })}
                className="w-full px-3 py-2 bg-surface border border-outline-variant rounded-lg text-on-surface outline-none focus:border-primary"
              />
            </div>

            <div>
              <label className="block font-semibold text-on-surface mb-1">Stock (kg)</label>
              <input
                type="number"
                required
                value={editForm.stock}
                onChange={(e) => setEditForm({ ...editForm, stock: e.target.value })}
                className="w-full px-3 py-2 bg-surface border border-outline-variant rounded-lg text-on-surface outline-none focus:border-primary"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-md">
            <div>
              <label className="block font-semibold text-on-surface mb-1">Tag / Badge</label>
              <input
                type="text"
                placeholder="e.g. Bestseller, Organic"
                value={editForm.badge}
                onChange={(e) => setEditForm({ ...editForm, badge: e.target.value })}
                className="w-full px-3 py-2 bg-surface border border-outline-variant rounded-lg text-on-surface outline-none focus:border-primary"
              />
            </div>

            <div>
              <label className="block font-semibold text-on-surface mb-1">Country of Origin</label>
              <input
                type="text"
                value={editForm.origin}
                onChange={(e) => setEditForm({ ...editForm, origin: e.target.value })}
                className="w-full px-3 py-2 bg-surface border border-outline-variant rounded-lg text-on-surface outline-none focus:border-primary"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-md">
            <div>
              <label className="block font-semibold text-on-surface mb-1">Rating (1-5)</label>
              <input
                type="number"
                step="0.1"
                min="1"
                max="5"
                value={editForm.rating}
                onChange={(e) => setEditForm({ ...editForm, rating: e.target.value })}
                className="w-full px-3 py-2 bg-surface border border-outline-variant rounded-lg text-on-surface outline-none focus:border-primary"
              />
            </div>

            <div>
              <label className="block font-semibold text-on-surface mb-1">Reviews Count</label>
              <input
                type="number"
                min="0"
                value={editForm.reviewsCount}
                onChange={(e) => setEditForm({ ...editForm, reviewsCount: e.target.value })}
                className="w-full px-3 py-2 bg-surface border border-outline-variant rounded-lg text-on-surface outline-none focus:border-primary"
              />
            </div>
          </div>

          <label className="flex items-center space-x-2 cursor-pointer pt-xs">
            <input
              type="checkbox"
              checked={editForm.isActive}
              onChange={(e) => setEditForm({ ...editForm, isActive: e.target.checked })}
              className="rounded text-primary focus:ring-primary h-4 w-4"
            />
            <span className="font-semibold text-on-surface">Active Product Listing</span>
          </label>

          <div className="flex justify-end space-x-sm pt-sm">
            <Button variant="secondary" onClick={() => setProductToEdit(null)}>
              Cancel
            </Button>
            <Button type="submit">
              Update Product
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Product Modal */}
      <Modal
        isOpen={!!productToDelete}
        onClose={() => setProductToDelete(null)}
        title=""
      >
        <div className="text-center space-y-md p-sm">
          <div className="w-12 h-12 rounded-full bg-error-container text-on-error-container flex items-center justify-center mx-auto">
            <span className="material-symbols-outlined text-2xl">delete</span>
          </div>
          <h3 className="font-bold text-lg text-on-surface">Delete Product?</h3>
          <p className="text-xs text-on-surface-variant">
            Are you sure you want to delete <span className="font-semibold text-on-surface">"{productToDelete?.name}"</span>? This action cannot be undone.
          </p>

          <div className="flex justify-center space-x-sm pt-sm">
            <Button variant="secondary" onClick={() => setProductToDelete(null)}>
              Cancel
            </Button>
            <Button variant="danger" onClick={confirmDelete}>
              Yes, Delete
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
