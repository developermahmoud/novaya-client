import type { ApiResponse } from './useAuth'
import type { UserRole } from './useAuth'

export interface EmployeeCreatedBy {
  id: number
  name: string
  email: string
  mobile: string
  status: string
  role: string
  created_at: string
  updated_at: string
}

export interface Employee {
  id: number
  name: string
  email: string
  mobile: string
  role: UserRole
  status: 'active' | 'inactive'
  created_by?: EmployeeCreatedBy
  created_at: string
  updated_at: string
}

export interface EmployeeDropdown {
  id: number
  name: string
}

export const useEmployees = () => {
  const api = useApi()

  // Get all employees
  const getEmployees = async (): Promise<Employee[]> => {
    try {
      const response = await api.get<ApiResponse<Employee[]>>('/employees')
      const employees = response.data.data || []
      return employees
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'فشل جلب الموظفين')
    }
  }

  // Get employees for dropdown
  const getEmployeesDropdown = async (): Promise<EmployeeDropdown[]> => {
    try {
      const response = await api.get<ApiResponse<EmployeeDropdown[]>>('/employees/dropdown')
      const employees = response.data.data || []
      return employees
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'فشل جلب الموظفين')
    }
  }

  // Create employee
  const createEmployee = async (data: {
    name: string
    email: string
    mobile: string
    password: string
    role: UserRole
  }): Promise<Employee> => {
    try {
      const response = await api.post<ApiResponse<Employee>>('/employees', data)
      return response.data.data
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'فشل إنشاء الموظف'
      throw new Error(errorMessage)
    }
  }

  // Update employee
  const updateEmployee = async (
    id: number,
    data: {
      name?: string
      email?: string
      mobile?: string
      password?: string
      role?: UserRole
      status?: 'active' | 'inactive'
    }
  ): Promise<Employee> => {
    try {
      const response = await api.put<ApiResponse<Employee>>(`/employees/${id}`, data)
      return response.data.data
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'فشل تحديث الموظف'
      throw new Error(errorMessage)
    }
  }

  // Delete employee
  const deleteEmployee = async (id: number): Promise<void> => {
    try {
      await api.delete(`/employees/${id}`)
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'فشل حذف الموظف'
      throw new Error(errorMessage)
    }
  }

  return {
    getEmployees,
    getEmployeesDropdown,
    createEmployee,
    updateEmployee,
    deleteEmployee,
  }
}
