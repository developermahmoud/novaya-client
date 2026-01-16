import type { ApiResponse } from './useAuth'

export interface CategoryCreatedBy {
  id: number
  name: string
  email: string
  mobile: string
  status: string
  role: string
  created_at: string
  updated_at: string
}

export interface Category {
  id: number
  name: string
  status: 'active' | 'inactive'
  created_by?: CategoryCreatedBy
  created_at: string
  updated_at: string
}

export const useCategories = () => {
  const api = useApi()
  const { user } = useAuth()

  // Get all categories
  const getCategories = async (): Promise<Category[]> => {
    try {
      const response = await api.get<ApiResponse<Category[]>>('/categories')
      const categories = response.data.data || []
      return categories
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'فشل جلب الأقسام')
    }
  }

  // Create category
  const createCategory = async (name: string): Promise<Category> => {
    try {
      const response = await api.post<ApiResponse<Category>>('/categories', {
        name,
      })
      return response.data.data
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'فشل إنشاء القسم'
      throw new Error(errorMessage)
    }
  }

  // Update category
  const updateCategory = async (id: number, name: string, status?: 'active' | 'inactive'): Promise<Category> => {
    try {
      const payload: { name: string; status?: 'active' | 'inactive' } = { name }
      if (status) {
        payload.status = status
      }
      const response = await api.put<ApiResponse<Category>>(`/categories/${id}`, payload)
      return response.data.data
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'فشل تحديث القسم'
      throw new Error(errorMessage)
    }
  }

  // Delete category
  const deleteCategory = async (id: number): Promise<void> => {
    try {
      await api.delete(`/categories/${id}`)
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'فشل حذف القسم'
      throw new Error(errorMessage)
    }
  }

  return {
    getCategories,
    createCategory,
    updateCategory,
    deleteCategory,
  }
}
