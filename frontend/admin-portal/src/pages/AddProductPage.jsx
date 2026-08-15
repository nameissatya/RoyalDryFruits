import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAdmin } from '../context/AdminContext';
import { uploadProductImageApi } from '../services/productApi';
import Button from '../components/ui/Button';

export default function AddProductPage() {
  const navigate = useNavigate();
  const { addProduct, categories, showToast } = useAdmin();

  const [activeStatus, setActiveStatus] = useState(true);
  const [featured, setFeatured] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [images, setImages] = useState([]);

  const [formData, setFormData] = useState({
    name: '',
    categoryId: categories[0]?.id || '',
    shortDesc: '',
    fullDesc: '',
    badge: 'Bestseller',
    rating: '4.8',
    reviewsCount: '120',
    origin: 'India',
    price250g: '',
    price500g: '',
    price1kg: '',
    stock: '',
  });

  useEffect(() => {
    if (!formData.categoryId && categories.length > 0) {
      setFormData(prev => ({ ...prev, categoryId: categories[0].id }));
    }
  }, [categories]);

  const handleCategoryChange = (e) => {
    setFormData({ ...formData, categoryId: e.target.value });
  };

  const handleImageFileChange = async (e) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    try {
      const file = files[0];
      const result = await uploadProductImageApi(file);
      setImages(prev => [...prev, result.fullUrl]);
      showToast('Image uploaded successfully to server wwwroot!');
    } catch (err) {
      console.warn('Image upload error:', err);
      // Fallback local preview if offline
      const localUrl = URL.createObjectURL(files[0]);
      setImages(prev => [...prev, localUrl]);
      showToast('Image added (Local Preview)');
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveImage = (indexToRemove) => {
    setImages(prev => prev.filter((_, idx) => idx !== indexToRemove));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name) return;

    const matchedCat = categories.find(c => c.id === formData.categoryId);

    await addProduct({
      name: formData.name,
      categoryId: formData.categoryId || categories[0]?.id,
      category: matchedCat ? matchedCat.name : 'General',
      description: formData.fullDesc || formData.shortDesc,
      imageUrl: images[0] || 'https://images.unsplash.com/photo-1508061252222-1d5f3083e589?w=150&auto=format&fit=crop&q=60',
      badge: formData.badge,
      rating: Number(formData.rating) || 4.8,
      reviewsCount: Number(formData.reviewsCount) || 120,
      origin: formData.origin || 'India',
      isFeatured: featured,
      stock: Number(formData.stock) || 0,
      status: activeStatus ? 'Active' : 'Inactive',
      variants: [
        { weightLabel: '250g', price: Number(formData.price250g) || 0, stockQuantity: Number(formData.stock) || 0, sku: '' },
        { weightLabel: '500g', price: Number(formData.price500g) || 0, stockQuantity: Number(formData.stock) || 0, sku: '' },
        { weightLabel: '1kg', price: Number(formData.price1kg) || 0, stockQuantity: Number(formData.stock) || 0, sku: '' },
      ]
    });

    navigate('/products');
  };

  return (
    <div className="space-y-lg max-w-max-content-width mx-auto">
      {/* Top Header & Breadcrumbs matching Figma design */}
      <div className="space-y-xs">
        <div className="flex items-center space-x-2 text-xs text-on-surface-variant">
          <Link to="/products" className="hover:text-primary transition-colors">Products</Link>
          <span>&gt;</span>
          <span className="font-semibold text-on-surface">Add New Product</span>
        </div>
        <div>
          <h1 className="font-bold text-2xl text-on-surface">Add New Product</h1>
          <p className="text-xs text-on-surface-variant">Create a new product listing in your catalog.</p>
        </div>
      </div>

      {/* Main Card Container */}
      <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-md md:p-lg shadow-sm">
        <form onSubmit={handleSubmit} className="space-y-lg">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-xl">
            {/* Left Column: Basic Information */}
            <div className="space-y-md text-xs">
              <h3 className="text-base font-bold text-on-surface border-b border-outline-variant/60 pb-xs">
                Basic Information
              </h3>

              <div>
                <label className="block font-semibold text-on-surface mb-1" htmlFor="product-name">
                  Product Name *
                </label>
                <input
                  required
                  id="product-name"
                  type="text"
                  placeholder="e.g., Premium Roasted Almonds"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-surface border border-outline-variant rounded-lg px-3 py-2.5 text-on-surface outline-none focus:border-primary placeholder:text-outline"
                />
              </div>

              <div>
                <label className="block font-semibold text-on-surface mb-1" htmlFor="category">
                  Category *
                </label>
                <div className="relative">
                  <select
                    required
                    id="category"
                    value={formData.categoryId}
                    onChange={handleCategoryChange}
                    className="w-full bg-surface border border-outline-variant rounded-lg px-3 py-2.5 text-on-surface outline-none focus:border-primary appearance-none cursor-pointer pr-10"
                  >
                    <option value="" disabled>Select a category</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                  <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none text-lg">
                    expand_more
                  </span>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-on-surface mb-1" htmlFor="badge">
                  Tag / Badge (e.g. Bestseller, Organic, Popular)
                </label>
                <input
                  id="badge"
                  type="text"
                  placeholder="e.g., Bestseller, Fresh Import, Organic"
                  value={formData.badge}
                  onChange={(e) => setFormData({ ...formData, badge: e.target.value })}
                  className="w-full bg-surface border border-outline-variant rounded-lg px-3 py-2.5 text-on-surface outline-none focus:border-primary placeholder:text-outline font-medium"
                />
              </div>

              <div className="grid grid-cols-3 gap-sm">
                <div>
                  <label className="block font-semibold text-on-surface mb-1" htmlFor="rating">
                    Rating (1-5)
                  </label>
                  <input
                    id="rating"
                    type="number"
                    step="0.1"
                    min="1"
                    max="5"
                    value={formData.rating}
                    onChange={(e) => setFormData({ ...formData, rating: e.target.value })}
                    className="w-full bg-surface border border-outline-variant rounded-lg px-2 py-2 text-on-surface outline-none focus:border-primary font-medium"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-on-surface mb-1" htmlFor="reviews">
                    Reviews Count
                  </label>
                  <input
                    id="reviews"
                    type="number"
                    min="0"
                    value={formData.reviewsCount}
                    onChange={(e) => setFormData({ ...formData, reviewsCount: e.target.value })}
                    className="w-full bg-surface border border-outline-variant rounded-lg px-2 py-2 text-on-surface outline-none focus:border-primary font-medium"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-on-surface mb-1" htmlFor="origin">
                    Origin
                  </label>
                  <input
                    id="origin"
                    type="text"
                    placeholder="e.g., California, USA"
                    value={formData.origin}
                    onChange={(e) => setFormData({ ...formData, origin: e.target.value })}
                    className="w-full bg-surface border border-outline-variant rounded-lg px-2 py-2 text-on-surface outline-none focus:border-primary font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-on-surface mb-1" htmlFor="short-desc">
                  Short Description
                </label>
                <input
                  id="short-desc"
                  type="text"
                  placeholder="Brief summary for product cards"
                  value={formData.shortDesc}
                  onChange={(e) => setFormData({ ...formData, shortDesc: e.target.value })}
                  className="w-full bg-surface border border-outline-variant rounded-lg px-3 py-2.5 text-on-surface outline-none focus:border-primary placeholder:text-outline"
                />
              </div>

              <div>
                <label className="block font-semibold text-on-surface mb-1" htmlFor="full-desc">
                  Full Description
                </label>
                <textarea
                  id="full-desc"
                  rows={4}
                  placeholder="Detailed product description..."
                  value={formData.fullDesc}
                  onChange={(e) => setFormData({ ...formData, fullDesc: e.target.value })}
                  className="w-full bg-surface border border-outline-variant rounded-lg px-3 py-2.5 text-on-surface outline-none focus:border-primary placeholder:text-outline resize-y"
                />
              </div>
            </div>

            {/* Right Column: Media & Inventory */}
            <div className="space-y-md text-xs">
              <h3 className="text-base font-bold text-on-surface border-b border-outline-variant/60 pb-xs">
                Media & Inventory
              </h3>

              {/* Drag & Drop Upload Zone matching Figma design */}
              <div>
                <label className="block font-semibold text-on-surface mb-1">
                  Product Images
                </label>
                <div className="relative border-2 border-dashed border-outline-variant hover:border-primary rounded-xl p-md text-center bg-surface transition-colors cursor-pointer group">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageFileChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <div className="flex flex-col items-center space-y-1 py-2">
                    <span className="material-symbols-outlined text-3xl text-on-surface-variant group-hover:text-primary transition-colors">
                      cloud_upload
                    </span>
                    <span className="font-bold text-on-surface">Drag and drop images here</span>
                    <span className="text-[11px] text-on-surface-variant">or click to browse (PNG, JPG, up to 5MB)</span>
                  </div>
                </div>

                {/* Uploaded Image Thumbnails matching Figma design */}
                {images.length > 0 && (
                  <div className="flex items-center space-x-sm mt-3 overflow-x-auto pb-1">
                    {images.map((imgUrl, idx) => (
                      <div key={idx} className="relative group w-16 h-16 rounded-xl border border-outline-variant overflow-hidden shrink-0">
                        <img src={imgUrl} alt={`Upload ${idx}`} className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => handleRemoveImage(idx)}
                          className="absolute top-1 right-1 bg-error text-on-error rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                          title="Remove image"
                        >
                          <span className="material-symbols-outlined text-xs">close</span>
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                {isUploading && (
                  <p className="text-xs text-primary font-medium mt-1 animate-pulse">Uploading image to wwwroot...</p>
                )}
              </div>

              {/* Pricing Variants (₹) matching Figma design */}
              <div>
                <label className="block font-semibold text-on-surface mb-1">
                  Pricing Variants (₹)
                </label>
                <div className="grid grid-cols-3 gap-sm">
                  <div>
                    <span className="block text-[11px] text-on-surface-variant text-center mb-1 font-medium">250g</span>
                    <input
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      value={formData.price250g}
                      onChange={(e) => setFormData({ ...formData, price250g: e.target.value })}
                      className="w-full text-center bg-surface border border-outline-variant rounded-lg px-2 py-2 text-on-surface outline-none focus:border-primary font-medium"
                    />
                  </div>
                  <div>
                    <span className="block text-[11px] text-on-surface-variant text-center mb-1 font-medium">500g</span>
                    <input
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      value={formData.price500g}
                      onChange={(e) => setFormData({ ...formData, price500g: e.target.value })}
                      className="w-full text-center bg-surface border border-outline-variant rounded-lg px-2 py-2 text-on-surface outline-none focus:border-primary font-medium"
                    />
                  </div>
                  <div>
                    <span className="block text-[11px] text-on-surface-variant text-center mb-1 font-medium">1kg</span>
                    <input
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      value={formData.price1kg}
                      onChange={(e) => setFormData({ ...formData, price1kg: e.target.value })}
                      className="w-full text-center bg-surface border border-outline-variant rounded-lg px-2 py-2 text-on-surface outline-none focus:border-primary font-medium"
                    />
                  </div>
                </div>
              </div>

              {/* Stock Qty & Active Status Toggle matching Figma design */}
              <div className="flex items-center space-x-md">
                <div className="flex-1">
                  <label className="block font-semibold text-on-surface mb-1" htmlFor="stock">
                    Stock Qty
                  </label>
                  <input
                    required
                    id="stock"
                    type="number"
                    min="0"
                    placeholder="0"
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                    className="w-full bg-surface border border-outline-variant rounded-lg px-3 py-2 text-on-surface outline-none focus:border-primary font-medium"
                  />
                </div>

                <div className="flex items-center space-x-2 pt-5">
                  <button
                    type="button"
                    onClick={() => setActiveStatus(!activeStatus)}
                    className={`w-11 h-6 rounded-full transition-colors relative p-0.5 ${
                      activeStatus ? 'bg-primary' : 'bg-outline-variant'
                    }`}
                  >
                    <div
                      className={`w-5 h-5 rounded-full bg-surface shadow-sm transition-transform ${
                        activeStatus ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                  <span className="font-semibold text-on-surface">Active Status</span>
                </div>
              </div>

              {/* Featured Product Checkbox matching Figma design */}
              <div className="pt-2">
                <label className="flex items-start space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={featured}
                    onChange={(e) => setFeatured(e.target.checked)}
                    className="mt-0.5 rounded text-primary focus:ring-primary h-4 w-4"
                  />
                  <div>
                    <span className="font-bold text-on-surface block">Featured Product</span>
                    <span className="text-[11px] text-on-surface-variant">Display this product prominently on the storefront homepage.</span>
                  </div>
                </label>
              </div>
            </div>
          </div>

          {/* Action Buttons matching Figma design */}
          <div className="flex justify-end space-x-md pt-md border-t border-outline-variant">
            <Button variant="outline" type="button" onClick={() => navigate('/products')}>
              Cancel
            </Button>
            <Button type="submit">
              Save Product
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
