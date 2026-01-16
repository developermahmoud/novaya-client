import type { ApiResponse } from './useAuth'
import type { CategoryCreatedBy } from './useCategories'

export interface ServiceCreatedBy {
  id: number
  name: string
  email: string
  mobile: string
  status: string
  role: string
  created_at: string
  updated_at: string
}

export interface ServiceCategory {
  id: number
  name: string
  status: 'active' | 'inactive'
  created_at: string
  updated_at: string
}

export interface Service {
  id: number
  name: string
  category_id: number
  category?: ServiceCategory
  price: number
  duration: number
  description?: string
  status: 'active' | 'inactive'
  created_by?: ServiceCreatedBy
  created_at: string
  updated_at: string
}

export const useServices = () => {
  const api = useApi()

  // Get all services
  const getServices = async (): Promise<Service[]> => {
    try {
      const response = await api.get<ApiResponse<Service[]>>('/services')
      const services = response.data.data || []
      return services
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'فشل جلب الخدمات')
    }
  }

  // Create service
  const createService = async (data: {
    name: string
    category_id: number
    price: number
    duration: number
    description?: string
  }): Promise<Service> => {
    try {
      const response = await api.post<ApiResponse<Service>>('/services', data)
      return response.data.data
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'فشل إنشاء الخدمة'
      throw new Error(errorMessage)
    }
  }

  // Update service
  const updateService = async (
    id: number,
    data: {
      name: string
      category_id: number
      price: number
      duration: number
      description?: string
      status?: 'active' | 'inactive'
    }
  ): Promise<Service> => {
    try {
      const response = await api.put<ApiResponse<Service>>(`/services/${id}`, data)
      return response.data.data
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'فشل تحديث الخدمة'
      throw new Error(errorMessage)
    }
  }

  // Delete service
  const deleteService = async (id: number): Promise<void> => {
    try {
      await api.delete(`/services/${id}`)
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'فشل حذف الخدمة'
      throw new Error(errorMessage)
    }
  }

  return {
    getServices,
    createService,
    updateService,
    deleteService,
  }
}
