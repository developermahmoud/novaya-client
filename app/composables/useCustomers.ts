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
  role: string
  status: 'active' | 'inactive'
  completed_bookings_count?: number
  total_amount?: number
  created_by?: CustomerCreatedBy
  created_at: string
  updated_at: string
}

interface CustomersPaginationResponse {
  success: boolean
  message?: string
  data: Customer[]
  current_page: number
  per_page: number
  total: number
  last_page: number
  from?: number
  to?: number
}

interface CustomersPaginationData {
  customers: Customer[]
  pagination: {
    current_page: number
    per_page: number
    total: number
    last_page: number
    from?: number
    to?: number
  }
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

  // Fetch customers with pagination and search
  const fetchCustomers = async (
    page: number = 1,
    name?: string
  ): Promise<{ success: boolean; data?: CustomersPaginationData; error?: string }> => {
    try {
      let url = `/customers?paginate=true&per_page=15&page=${page}`
      if (name && name.trim()) {
        url += `&name=${encodeURIComponent(name.trim())}`
      }
      
      const response = await api.get<CustomersPaginationResponse>(url)
      
      if (response.data.success && response.data.data) {
        return {
          success: true,
          data: {
            customers: response.data.data,
            pagination: {
              current_page: response.data.current_page,
              per_page: response.data.per_page,
              total: response.data.total,
              last_page: response.data.last_page,
              from: response.data.from,
              to: response.data.to,
            }
          }
        }
      } else {
        return { success: false, error: response.data.message || 'فشل جلب العملاء' }
      }
    } catch (error: any) {
      console.error('Error fetching customers:', error)
      
      const errorMessage = error.response?.data?.message || error.response?.data?.error || 'حدث خطأ أثناء جلب العملاء'
      
      return { success: false, error: errorMessage }
    }
  }

  // Fetch customer bookings with pagination
  interface CustomerBooking {
    id: number
    booking_date: string
    booking_time: string
    status: string
    notes?: string
    total_amount: number
    customer_id: number
    customer?: {
      id: number
      name: string
      email: string
      mobile: string
      status: string
      role: string
    }
    services: Array<{
      id: number
      service_id: number
      service_name: string
      service: {
        id: number
        name: string
        description?: string
        price: number
        duration: number
      }
      employee_id?: number
      price: number
      duration: number
    }>
    created_at: string
    updated_at: string
  }

  interface CustomerBookingsResponse {
    success: boolean
    message?: string
    data: CustomerBooking[]
    current_page: number
    per_page: number
    total: number
    last_page: number
    from?: number
    to?: number
  }

  interface CustomerBookingsData {
    bookings: CustomerBooking[]
    pagination: {
      current_page: number
      per_page: number
      total: number
      last_page: number
      from?: number
      to?: number
    }
  }

  const fetchCustomerBookings = async (
    customerId: number,
    page: number = 1
  ): Promise<{ success: boolean; data?: CustomerBookingsData; error?: string }> => {
    try {
      const url = `/customers/${customerId}/bookings?page=${page}&per_page=15`
      
      const response = await api.get<CustomerBookingsResponse>(url)
      
      if (response.data.success && response.data.data) {
        return {
          success: true,
          data: {
            bookings: response.data.data,
            pagination: {
              current_page: response.data.current_page,
              per_page: response.data.per_page,
              total: response.data.total,
              last_page: response.data.last_page,
              from: response.data.from,
              to: response.data.to,
            }
          }
        }
      } else {
        return { success: false, error: response.data.message || 'فشل جلب الحجوزات' }
      }
    } catch (error: any) {
      console.error('Error fetching customer bookings:', error)
      
      const errorMessage = error.response?.data?.message || error.response?.data?.error || 'حدث خطأ أثناء جلب الحجوزات'
      
      return { success: false, error: errorMessage }
    }
  }

  return {
    getCustomers,
    createCustomer,
    updateCustomer,
    deleteCustomer,
    fetchCustomers,
    fetchCustomerBookings,
  }
}

export type { CustomerBooking }
