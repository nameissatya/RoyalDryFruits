import { apiClient } from './apiConfig';

export async function fetchCategoriesApi() {
  return apiClient('/admin/AdminCategories');
}

export async function createCategoryApi(categoryData) {
  return apiClient('/admin/AdminCategories', {
    method: 'POST',
    body: JSON.stringify({
      name: categoryData.name,
      description: categoryData.description || '',
      icon: categoryData.icon || 'folder',
    }),
  });
}

export async function updateCategoryApi(id, categoryData) {
  return apiClient(`/admin/AdminCategories/${id}`, {
    method: 'PUT',
    body: JSON.stringify({
      name: categoryData.name,
      description: categoryData.description || '',
      icon: categoryData.icon || 'folder',
      isActive: categoryData.isActive !== false,
    }),
  });
}

export async function deleteCategoryApi(id) {
  return apiClient(`/admin/AdminCategories/${id}`, {
    method: 'DELETE',
  });
}

