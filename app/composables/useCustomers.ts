import type { ApiResponse } from './useAuth'

export interface CustomerCreatedBy {
  id: number
  name: string
  email: string
  mobile: string
  status: string
  role: string
  created_at: string
  updated_at: string
}

export interface Customer {
  id: number
  name: string
  email: string
  mobile: string
  status: 'active' | 'inactive'
  created_by?: CustomerCreatedBy
  created_at: string
  updated_at: string
}

export const useCustomers = () => {
  const api = useApi()

  // Get all customers
  const getCustomers = async (): Promise<Customer[]> => {
    try {
      const response = await api.get<ApiResponse<Customer[]>>('/customers')
      const customers = response.data.data || []
      return customers
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'فشل جلب العملاء')
    }
  }

  // Create customer
  const createCustomer = async (data: {
    name: string
    email: string
    mobile: string
    password: string
  }): Promise<Customer> => {
    try {
      const response = await api.post<ApiResponse<Customer>>('/customers', data)
      return response.data.data
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'فشل إنشاء العميل'
      throw new Error(errorMessage)
    }
  }

  // Update customer
  const updateCustomer = async (
    id: number,
    data: {
      name?: string
      email?: string
      mobile?: string
      password?: string
      status?: 'active' | 'inactive'
    }
  ): Promise<Customer> => {
    try {
      const response = await api.put<ApiResponse<Customer>>(`/customers/${id}`, data)
      return response.data.data
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'فشل تحديث العميل'
      throw new Error(errorMessage)
    }
  }

  // Delete customer
  const deleteCustomer = async (id: number): Promise<void> => {
    try {
      await api.delete(`/customers/${id}`)
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'فشل حذف العميل'
      throw new Error(errorMessage)
    }
  }

  return {
    getCustomers,
    createCustomer,
    updateCustomer,
    deleteCustomer,
  }
}
