import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useAdmin } from '../context/AdminContext';
import {
  createProductApi,
  fetchProductByIdApi,
  updateProductApi,
  uploadProductImageApi,
} from '../services/productApi';
import { useCategoriesQuery } from '../hooks/useQueries';
import { resolveImageUrl } from '../services/apiConfig';
import Button from '../components/ui/Button';

const newVariant = (weightLabel = '') => ({
  weightLabel,
  price: '',
  stockQuantity: '',
  sku: '',
  isActive: true,
});

const initialForm = {
  name: '',
  categoryId: '',
  description: '',
  imageUrl: '',
  origin: 'India',
  badge: '',
  rating: '4.8',
  reviewsCount: '0',
  isActive: true,
  isFeatured: false,
  variants: [newVariant('250g')],
};

const inputClass =
  'w-full bg-surface border border-outline-variant rounded-lg px-3 py-2.5 text-on-surface outline-none focus:border-primary';

export default function ProductFormPage() {
  const { productId } = useParams();
  const isEditing = Boolean(productId);
  const navigate = useNavigate();
  const { data: queryCategories = [], refetch: refetchCategories } = useCategoriesQuery();
  const { categories: contextCategories, showToast, loadProducts, loadCategories } = useAdmin();
  const categories = queryCategories.length > 0 ? queryCategories : contextCategories;

  const [form, setForm] = useState(initialForm);
  const [imagePreview, setImagePreview] = useState('');
  const [isLoading, setIsLoading] = useState(isEditing);
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');

  // Fetch latest categories from DB immediately on page mount
  useEffect(() => {
    refetchCategories();
    loadCategories();
  }, []);

  useEffect(() => {
    if (!isEditing && !form.categoryId && categories.length > 0) {
      setForm((current) => ({ ...current, categoryId: categories[0].id }));
    }
  }, [categories, form.categoryId, isEditing]);

  useEffect(() => {
    if (!isEditing) return;
    let active = true;

    async function loadProduct() {
      try {
        const product = await fetchProductByIdApi(productId);
        if (!active) return;
        setForm({
          name: product.name || '',
          categoryId: product.categoryId || '',
          description: product.description || '',
          imageUrl: product.imageUrl || '',
          origin: product.origin || 'India',
          badge: product.badge || '',
          rating: String(product.rating ?? 4.8),
          reviewsCount: String(product.reviewsCount ?? 0),
          isActive: product.isActive !== false,
          isFeatured: Boolean(product.isFeatured),
          variants: product.variants?.length
            ? product.variants.map((variant) => ({
              id: variant.id,
              weightLabel: variant.weightLabel || '',
              price: String(variant.price ?? ''),
              stockQuantity: String(variant.stockQuantity ?? ''),
              sku: variant.sku || '',
              isActive: variant.isActive !== false,
            }))
            : [newVariant('500g')],
        });
        setImagePreview(resolveImageUrl(product.imageUrl));
      } catch (err) {
        if (active) setError(err.message || 'Unable to load this product.');
      } finally {
        if (active) setIsLoading(false);
      }
    }

    loadProduct();
    return () => {
      active = false;
    };
  }, [isEditing, productId]);

  const totalStock = useMemo(
    () => form.variants.reduce((sum, variant) => sum + (Number(variant.stockQuantity) || 0), 0),
    [form.variants]
  );

  const setField = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const setVariantField = (index, field, value) => {
    setForm((current) => ({
      ...current,
      variants: current.variants.map((variant, currentIndex) =>
        currentIndex === index ? { ...variant, [field]: value } : variant
      ),
    }));
  };

  const handleImageChange = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      setError('Image must be 5MB or smaller.');
      return;
    }

    setIsUploading(true);
    setError('');
    try {
      const uploaded = await uploadProductImageApi(file);
      setField('imageUrl', uploaded.imageUrl);
      setImagePreview(uploaded.fullUrl);
      showToast('Product image uploaded.');
    } catch (err) {
      setError(err.message || 'Image upload failed.');
    } finally {
      setIsUploading(false);
      event.target.value = '';
    }
  };

  const validate = () => {
    if (!form.name.trim()) return 'Product name is required.';
    if (!form.categoryId) return 'Please select a category.';
    if (!form.variants.length) return 'Add at least one variant.';
    const labels = form.variants.map((variant) => variant.weightLabel.trim().toLowerCase());
    if (labels.some((label) => !label)) return 'Every variant needs a weight or size label.';
    if (new Set(labels).size !== labels.length) return 'Variant labels must be unique.';
    if (form.variants.some((variant) => Number(variant.price) <= 0)) {
      return 'Every variant must have a price greater than zero.';
    }
    if (form.variants.some((variant) => Number(variant.stockQuantity) < 0)) {
      return 'Stock cannot be negative.';
    }
    return '';
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    const payload = {
      ...form,
      name: form.name.trim(),
      description: form.description.trim(),
      origin: form.origin.trim(),
      badge: form.badge.trim(),
      rating: Number(form.rating) || 0,
      reviewsCount: Number(form.reviewsCount) || 0,
      variants: form.variants.map((variant) => ({
        ...(variant.id ? { id: variant.id } : {}),
        weightLabel: variant.weightLabel.trim(),
        price: Number(variant.price),
        stockQuantity: Number(variant.stockQuantity) || 0,
        sku: variant.sku.trim(),
        isActive: variant.isActive !== false,
      })),
    };

    setIsSaving(true);
    setError('');
    try {
      if (isEditing) {
        await updateProductApi(productId, payload);
        showToast(`Product "${payload.name}" updated.`);
      } else {
        await createProductApi(payload);
        showToast(`Product "${payload.name}" created.`);
      }
      await Promise.all([loadProducts(), loadCategories()]);
      navigate('/products');
    } catch (err) {
      setError(err.message || `Unable to ${isEditing ? 'update' : 'create'} product.`);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-80 flex flex-col items-center justify-center gap-sm">
        <span className="material-symbols-outlined text-4xl text-primary animate-spin">progress_activity</span>
        <p className="text-xs text-on-surface-variant">Loading product details...</p>
      </div>
    );
  }

  return (
    <div className="space-y-lg max-w-max-content-width mx-auto">
      <header className="space-y-xs">
        <div className="flex items-center gap-2 text-xs text-on-surface-variant">
          <Link to="/products" className="hover:text-primary">Products</Link>
          <span>/</span>
          <span className="font-semibold text-on-surface">{isEditing ? 'Edit Product' : 'Add New Product'}</span>
        </div>
        <h1 className="font-bold text-2xl text-on-surface">{isEditing ? 'Edit Product' : 'Add New Product'}</h1>
        <p className="text-xs text-on-surface-variant">Manage storefront content, pricing, and inventory in one place.</p>
      </header>

      {error && (
        <div role="alert" className="bg-error-container/20 border border-error/30 text-error rounded-lg p-sm text-xs flex gap-2">
          <span className="material-symbols-outlined text-base">error</span>
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-lg">
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-lg">
          <section className="xl:col-span-2 bg-surface-container-lowest border border-outline-variant rounded-2xl p-md md:p-lg space-y-md">
            <h2 className="font-bold text-base">Product information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-md text-xs">
              <label className="space-y-1">
                <span className="font-semibold">Product name *</span>
                <input value={form.name} onChange={(event) => setField('name', event.target.value)} className={inputClass} placeholder="e.g. Premium California Almonds" required />
              </label>
              <label className="space-y-1">
                <span className="font-semibold">Category *</span>
                <select value={form.categoryId} onChange={(event) => setField('categoryId', event.target.value)} className={inputClass} required>
                  <option value="">Select a category</option>
                  {categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
                </select>
              </label>
            </div>
            <label className="space-y-1 text-xs block">
              <span className="font-semibold">Description</span>
              <textarea value={form.description} onChange={(event) => setField('description', event.target.value)} rows={5} className={`${inputClass} resize-y`} placeholder="Describe quality, taste, sourcing, and benefits." />
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-md text-xs">
              <label className="space-y-1"><span className="font-semibold">Badge</span><input value={form.badge} onChange={(event) => setField('badge', event.target.value)} className={inputClass} placeholder="Bestseller" /></label>
              <label className="space-y-1"><span className="font-semibold">Origin</span><input value={form.origin} onChange={(event) => setField('origin', event.target.value)} className={inputClass} /></label>
              <label className="space-y-1"><span className="font-semibold">Rating</span><input type="number" min="0" max="5" step="0.1" value={form.rating} onChange={(event) => setField('rating', event.target.value)} className={inputClass} /></label>
              <label className="space-y-1"><span className="font-semibold">Reviews</span><input type="number" min="0" value={form.reviewsCount} onChange={(event) => setField('reviewsCount', event.target.value)} className={inputClass} /></label>
            </div>
          </section>

          <aside className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-md space-y-md">
            <h2 className="font-bold text-base">Image & visibility</h2>
            <div className="aspect-square rounded-xl overflow-hidden bg-surface-container border border-outline-variant flex items-center justify-center">
              {imagePreview ? <img src={imagePreview} alt="Product preview" className="w-full h-full object-cover" /> : <span className="material-symbols-outlined text-5xl text-outline">image</span>}
            </div>
            <label className="block">
              <input type="file" accept=".jpg,.jpeg,.png,.webp" onChange={handleImageChange} className="hidden" disabled={isUploading} />
              <span className="flex items-center justify-center gap-2 border border-outline-variant rounded-lg px-3 py-2 text-xs font-semibold cursor-pointer hover:bg-surface-container">
                <span className="material-symbols-outlined text-base">upload</span>
                {isUploading ? 'Uploading...' : imagePreview ? 'Replace image' : 'Upload image'}
              </span>
            </label>
            <p className="text-[11px] text-on-surface-variant">JPG, PNG or WEBP, up to 5MB.</p>
            <label className="flex items-start gap-2 text-xs cursor-pointer">
              <input type="checkbox" checked={form.isActive} onChange={(event) => setField('isActive', event.target.checked)} className="mt-0.5 h-4 w-4" />
              <span><strong className="block">Active listing</strong><span className="text-on-surface-variant">Visible on the storefront.</span></span>
            </label>
            <label className="flex items-start gap-2 text-xs cursor-pointer">
              <input type="checkbox" checked={form.isFeatured} onChange={(event) => setField('isFeatured', event.target.checked)} className="mt-0.5 h-4 w-4" />
              <span><strong className="block">Featured product</strong><span className="text-on-surface-variant">Eligible for homepage promotion.</span></span>
            </label>
          </aside>
        </div>

        <section className="bg-surface-container-lowest border border-outline-variant rounded-2xl overflow-hidden">
          <div className="p-md border-b border-outline-variant flex items-center justify-between">
            <div><h2 className="font-bold text-base">Price & inventory variants</h2><p className="text-[11px] text-on-surface-variant">{totalStock} total units across variants</p></div>
            <Button type="button" variant="outline" icon="add" onClick={() => setForm((current) => ({ ...current, variants: [...current.variants, newVariant()] }))}>Add variant</Button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-xs">
              <thead className="bg-surface-container-low text-on-surface-variant text-left"><tr><th className="p-sm">Weight / size *</th><th className="p-sm">Price (₹) *</th><th className="p-sm">Stock units</th><th className="p-sm">SKU</th><th className="p-sm">Active</th><th className="p-sm"><span className="sr-only">Actions</span></th></tr></thead>
              <tbody className="divide-y divide-outline-variant">
                {form.variants.map((variant, index) => (
                  <tr key={variant.id || index}>
                    <td className="p-sm"><input value={variant.weightLabel} onChange={(event) => setVariantField(index, 'weightLabel', event.target.value)} className={inputClass} placeholder="e.g. 250g" /></td>
                    <td className="p-sm"><input type="number" min="0.01" step="0.01" value={variant.price} onChange={(event) => setVariantField(index, 'price', event.target.value)} className={inputClass} /></td>
                    <td className="p-sm"><input type="number" min="0" value={variant.stockQuantity} onChange={(event) => setVariantField(index, 'stockQuantity', event.target.value)} className={inputClass} /></td>
                    <td className="p-sm"><input value={variant.sku} onChange={(event) => setVariantField(index, 'sku', event.target.value)} className={`${inputClass} font-mono`} placeholder="Auto-generated if blank" /></td>
                    <td className="p-sm text-center"><input type="checkbox" checked={variant.isActive} onChange={(event) => setVariantField(index, 'isActive', event.target.checked)} className="h-4 w-4" /></td>
                    <td className="p-sm text-right"><button type="button" disabled={form.variants.length === 1} onClick={() => setForm((current) => ({ ...current, variants: current.variants.filter((_, currentIndex) => currentIndex !== index) }))} className="p-2 text-on-surface-variant hover:text-error disabled:opacity-30" title="Remove variant"><span className="material-symbols-outlined text-lg">delete</span></button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <div className="sticky bottom-0 z-10 bg-background/95 backdrop-blur border-t border-outline-variant py-sm flex justify-end gap-sm">
          <Button variant="outline" onClick={() => navigate('/products')} disabled={isSaving}>Cancel</Button>
          <Button type="submit" disabled={isSaving || isUploading}>{isSaving ? 'Saving...' : isEditing ? 'Update Product' : 'Save Product'}</Button>
        </div>
      </form>
    </div>
  );
}
