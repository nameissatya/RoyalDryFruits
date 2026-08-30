import React, { useState } from 'react';
import { useAdmin } from '../context/AdminContext';
import {
  useCategoriesQuery,
  useCreateCategoryMutation,
  useUpdateCategoryMutation,
  useDeleteCategoryMutation,
} from '../hooks/useQueries';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import Badge from '../components/ui/Badge';

export default function CategoriesPage() {
  const { loadCategories } = useAdmin();
  const { data: categories = [], isLoading: isCategoriesLoading } = useCategoriesQuery();
  const createCategoryMutation = useCreateCategoryMutation();
  const updateCategoryMutation = useUpdateCategoryMutation();
  const deleteCategoryMutation = useDeleteCategoryMutation();

  const [filterQuery, setFilterQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState(null);
  const [categoryToEdit, setCategoryToEdit] = useState(null);

  const [catName, setCatName] = useState('');
  const [catDesc, setCatDesc] = useState('');

  const [editName, setEditName] = useState('');
  const [editDesc, setEditDesc] = useState('');

  const handleAddCategory = async (e) => {
    e.preventDefault();
    if (!catName) return;
    await createCategoryMutation.mutateAsync({
      name: catName,
      slug: catName.toLowerCase().replace(/\s+/g, '-'),
      icon: 'spa',
      description: catDesc || 'Premium dry fruits category.',
    });
    if (loadCategories) loadCategories();
    setCatName('');
    setCatDesc('');
    setShowAddModal(false);
  };

  const handleOpenEdit = (cat) => {
    setCategoryToEdit(cat);
    setEditName(cat.name);
    setEditDesc(cat.description || cat.desc || '');
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!editName || !categoryToEdit) return;
    await updateCategoryMutation.mutateAsync({
      id: categoryToEdit.id,
      data: {
        ...categoryToEdit,
        name: editName,
        slug: editName.toLowerCase().replace(/\s+/g, '-'),
        description: editDesc,
      },
    });
    if (loadCategories) loadCategories();
    setCategoryToEdit(null);
  };

  const confirmDelete = async () => {
    if (categoryToDelete) {
      await deleteCategoryMutation.mutateAsync(categoryToDelete.id);
      if (loadCategories) loadCategories();
      setCategoryToDelete(null);
    }
  };


  const filteredCategories = categories.filter(c =>
    c.name.toLowerCase().includes(filterQuery.toLowerCase()) || (c.slug && c.slug.toLowerCase().includes(filterQuery.toLowerCase()))
  );

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return 'N/A';
      return d.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' });
    } catch {
      return 'N/A';
    }
  };

  return (
    <div className="space-y-lg max-w-max-content-width mx-auto">
      {/* Top Header matching Figma design */}
      <div className="flex items-center justify-between">
        <h1 className="font-bold text-2xl text-on-surface">Categories</h1>
        <Button icon="add" onClick={() => setShowAddModal(true)}>
          Add New Category
        </Button>
      </div>

      {/* Content Card */}
      <div className="bg-surface-container-lowest border border-outline-variant rounded-xl shadow-sm overflow-hidden text-xs">
        {/* Filter Bar matching Figma design */}
        <div className="p-sm md:p-md border-b border-outline-variant flex justify-between items-center bg-surface-bright">
          <div className="relative w-full max-w-xs">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-base">
              search
            </span>
            <input
              type="text"
              placeholder="Search categories..."
              value={filterQuery}
              onChange={(e) => setFilterQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-outline-variant bg-surface focus:border-primary outline-none text-xs text-on-surface transition-all"
            />
          </div>
          <button
            className="p-2 border border-outline-variant rounded-lg text-on-surface-variant hover:bg-surface-container-high transition-colors"
            title="Filter Categories"
          >
            <span className="material-symbols-outlined text-lg">tune</span>
          </button>
        </div>

        {isCategoriesLoading ? (
          <div className="py-16 text-center">
            <span className="material-symbols-outlined text-4xl text-primary animate-spin">progress_activity</span>
            <p className="text-xs text-on-surface-variant mt-2">Loading categories...</p>
          </div>
        ) : filteredCategories.length === 0 ? (
          <div className="py-16 text-center space-y-sm">
            <span className="material-symbols-outlined text-5xl text-outline">category</span>
            <h2 className="font-bold">No categories found</h2>
            <p className="text-xs text-on-surface-variant">Add your first product category using the button above.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[700px]">
              <thead>
                <tr className="border-b border-outline-variant bg-surface-container-low text-on-surface-variant font-semibold text-[11px] uppercase tracking-wider">
                  <th className="p-md font-medium">CATEGORY NAME</th>
                  <th className="p-md font-medium">PRODUCTS</th>
                  <th className="p-md font-medium">STATUS</th>
                  <th className="p-md font-medium">CREATED DATE</th>
                  <th className="p-md font-medium text-right">ACTIONS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant">
                {filteredCategories.map((cat) => (
                  <tr
                    key={cat.id}
                  className={`hover:bg-surface transition-colors group ${
                    categoryToDelete?.id === cat.id ? 'bg-surface-container-high border-l-4 border-error' : ''
                  }`}
                >
                  <td className="p-md">
                    <div className="flex items-center space-x-3">
                      <div className="w-9 h-9 rounded-lg bg-surface-container-high text-on-surface-variant flex items-center justify-center shrink-0 border border-outline-variant">
                        <span className="material-symbols-outlined text-lg">{cat.icon || 'spa'}</span>
                      </div>
                      <div>
                        <span className="font-bold text-sm text-on-surface block">{cat.name}</span>
                      </div>
                    </div>
                  </td>
                  <td className="p-md text-on-surface-variant font-medium">{cat.count ?? 0}</td>
                  <td className="p-md">
                    <Badge variant={cat.isActive !== false ? 'success' : 'neutral'}>
                      {cat.isActive !== false ? 'Active' : 'Inactive'}
                    </Badge>
                  </td>
                  <td className="p-md text-on-surface-variant font-medium">
                    {formatDate(cat.createdAt)}
                  </td>
                  <td className="p-md text-right">
                    <div className="flex items-center justify-end space-x-2">
                      <button
                        onClick={() => handleOpenEdit(cat)}
                        className="p-1.5 text-on-surface-variant hover:text-primary rounded-lg hover:bg-surface-container-high transition-colors"
                        title="Edit Category"
                      >
                        <span className="material-symbols-outlined text-base">edit</span>
                      </button>
                      <button
                        onClick={() => setCategoryToDelete(cat)}
                        className="p-1.5 text-on-surface-variant hover:text-error rounded-lg hover:bg-error-container/20 transition-colors"
                        title="Delete Category"
                      >
                        <span className="material-symbols-outlined text-base">delete</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        )}

        {/* Footer matching Figma design */}
        <div className="p-md border-t border-outline-variant bg-surface flex items-center justify-between text-on-surface-variant text-xs">
          <span>Showing 1 to {filteredCategories.length} of {categories.length} results</span>
          <div className="flex items-center space-x-1">
            <button className="px-2.5 py-1 border border-outline-variant rounded-md hover:bg-surface-container-high transition-colors disabled:opacity-40" disabled>
              &lt;
            </button>
            <button className="px-3 py-1 bg-primary text-on-primary font-bold rounded-md shadow-sm">
              1
            </button>
            <button className="px-2.5 py-1 border border-outline-variant rounded-md hover:bg-surface-container-high transition-colors disabled:opacity-40" disabled>
              &gt;
            </button>
          </div>
        </div>
      </div>

      {/* Add Category Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Add New Category"
      >
        <form onSubmit={handleAddCategory} className="space-y-md text-xs">
          <div>
            <label className="block font-semibold text-on-surface mb-1">Category Name</label>
            <input
              type="text"
              required
              placeholder="Enter category name"
              value={catName}
              onChange={(e) => setCatName(e.target.value)}
              className="w-full px-3 py-2 bg-surface border border-outline-variant rounded-lg text-on-surface outline-none focus:border-primary"
            />
          </div>
          <div>
            <label className="block font-semibold text-on-surface mb-1">Description</label>
            <textarea
              rows="3"
              placeholder="Enter category description..."
              value={catDesc}
              onChange={(e) => setCatDesc(e.target.value)}
              className="w-full px-3 py-2 bg-surface border border-outline-variant rounded-lg text-on-surface outline-none focus:border-primary resize-none"
            />
          </div>
          <div className="flex justify-end space-x-sm pt-sm">
            <Button variant="secondary" onClick={() => setShowAddModal(false)}>
              Cancel
            </Button>
            <Button type="submit">
              Save Category
            </Button>
          </div>
        </form>
      </Modal>

      {/* Edit Category Modal */}
      <Modal
        isOpen={!!categoryToEdit}
        onClose={() => setCategoryToEdit(null)}
        title="Edit Category"
      >
        <form onSubmit={handleSaveEdit} className="space-y-md text-xs">
          <div>
            <label className="block font-semibold text-on-surface mb-1">Category Name</label>
            <input
              type="text"
              required
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              className="w-full px-3 py-2 bg-surface border border-outline-variant rounded-lg text-on-surface outline-none focus:border-primary"
            />
          </div>
          <div>
            <label className="block font-semibold text-on-surface mb-1">Description</label>
            <textarea
              rows="3"
              value={editDesc}
              onChange={(e) => setEditDesc(e.target.value)}
              className="w-full px-3 py-2 bg-surface border border-outline-variant rounded-lg text-on-surface outline-none focus:border-primary resize-none"
            />
          </div>
          <div className="flex justify-end space-x-sm pt-sm">
            <Button variant="secondary" onClick={() => setCategoryToEdit(null)}>
              Cancel
            </Button>
            <Button type="submit">
              Update Category
            </Button>
          </div>
        </form>
      </Modal>

      {/* Category Delete Modal */}
      <Modal
        isOpen={!!categoryToDelete}
        onClose={() => setCategoryToDelete(null)}
        title=""
      >
        <div className="text-center space-y-md p-sm">
          <div className="w-12 h-12 rounded-full bg-error-container text-on-error-container flex items-center justify-center mx-auto">
            <span className="material-symbols-outlined text-2xl">delete</span>
          </div>
          <h3 className="font-bold text-lg text-on-surface">Delete Category?</h3>
          <p className="text-xs text-on-surface-variant">
            Are you sure you want to delete <span className="font-semibold text-on-surface">"{categoryToDelete?.name}"</span>? Products assigned to this category will need to be re-categorized.
          </p>

          <div className="flex justify-center space-x-sm pt-sm">
            <Button variant="secondary" onClick={() => setCategoryToDelete(null)}>
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
