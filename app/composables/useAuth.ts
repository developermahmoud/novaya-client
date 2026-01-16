export type UserRole = 'admin' | 'reception' | 'employee' | 'client'

export interface User {
  id: string
  name: string
  email: string
  phone: string
  role: UserRole
  createdAt: string | Date
}

interface ApiResponse<T> {
  success: boolean
  message?: string
  data: T
}

interface LoginResponseData {
  token: string
  user?: User
}

interface RegisterResponseData {
  token: string
}

export const useAuth = () => {
  const user = useState<User | null>('auth_user', () => null)
  const isLoading = useState<boolean>('auth_loading', () => true)
  const api = useApi()

  // Get current user from API
  const fetchCurrentUser = async (): Promise<boolean> => {
    try {
      const response = await api.get('/auth/me')
      
      // Handle both response formats: { data: {...} } or direct {...}
      const userData = response.data?.data || response.data
      
      if (!userData) {
        throw new Error('No user data received')
      }
      
      user.value = {
        id: userData.id?.toString() || userData.id,
        name: userData.name,
        email: userData.email,
        phone: userData.phone || userData.mobile,
        role: userData.role || 'client',
        createdAt: userData.created_at ? new Date(userData.created_at) : (userData.createdAt ? new Date(userData.createdAt) : new Date()),
      }
      
      return true
    } catch (error) {
      // If unauthorized, clear tokens
      if (typeof window !== 'undefined') {
        localStorage.removeItem('access_token')
        localStorage.removeItem('refresh_token')
      }
      user.value = null
      return false
    }
  }

  // Initialize auth - check for existing token and fetch user
  const initializeAuth = async () => {
    if (typeof window === 'undefined') {
      isLoading.value = false
      return
    }

    const accessToken = localStorage.getItem('access_token')
    
    if (accessToken) {
      // Try to fetch current user
      await fetchCurrentUser()
    } else {
      user.value = null
    }
    
    isLoading.value = false
  }

  // Login
  const login = async (phone: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const response = await api.post<ApiResponse<LoginResponseData>>('/auth/login', {
        phone,
        password,
      })

      const { data } = response.data
      const token = data.token

      // Store token
      if (typeof window !== 'undefined') {
        localStorage.setItem('access_token', token)
      }

      // Fetch user data
      if (data.user) {
        user.value = {
          ...data.user,
          createdAt: data.user.created_at ? new Date(data.user.created_at) : new Date(),
        }
      } else {
        // If user not in response, fetch it
        await fetchCurrentUser()
      }

      return { success: true }
    } catch (error: any) {
      console.error('Login error:', error)
      
      // Handle 422 validation errors
      if (error.response?.status === 422 && error.response?.data?.errors) {
        const errors = error.response.data.errors
        const errorMessages: string[] = []
        
        // Collect all error messages
        Object.keys(errors).forEach((field) => {
          if (Array.isArray(errors[field])) {
            errors[field].forEach((msg: string) => {
              errorMessages.push(msg)
            })
          }
        })
        
        // Return combined error message or first error
        const errorMessage = errorMessages.length > 0 
          ? errorMessages.join('، ') 
          : error.response?.data?.message || 'فشل تسجيل الدخول'
        
        return { success: false, error: errorMessage }
      }
      
      // Handle other errors
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.error || 
                          error.message || 
                          'فشل تسجيل الدخول'
      return { success: false, error: errorMessage }
    }
  }

  // Register
  const register = async (
    name: string,
    email: string,
    mobile: string,
    password: string,
    role: UserRole = 'client'
  ): Promise<{ success: boolean; error?: string; fieldErrors?: Record<string, string[]> }> => {
    try {
      const response = await api.post<ApiResponse<RegisterResponseData>>('/auth/register', {
        name,
        email,
        mobile,
        password,
        role,
      })

      const { data } = response.data
      const token = data.token

      // Store token
      if (typeof window !== 'undefined') {
        localStorage.setItem('access_token', token)
      }

      // Fetch user data from /auth/me
      await fetchCurrentUser()

      return { success: true }
    } catch (error: any) {
      console.error('Register error:', error)
      
      // Handle 422 validation errors
      if (error.response?.status === 422 && error.response?.data?.errors) {
        const validationErrors = error.response.data.errors
        const errorMessages: string[] = []
        const fieldErrors: Record<string, string[]> = {}
        
        // Collect all error messages and field-specific errors
        Object.keys(validationErrors).forEach((field) => {
          if (Array.isArray(validationErrors[field])) {
            fieldErrors[field] = validationErrors[field]
            validationErrors[field].forEach((msg: string) => {
              errorMessages.push(msg)
            })
          }
        })
        
        // Return combined error message or first error
        const errorMessage = errorMessages.length > 0 
          ? errorMessages.join('، ') 
          : error.response?.data?.message || 'فشل التسجيل'
        
        return { success: false, error: errorMessage, fieldErrors }
      }
      
      // Handle other errors
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.error || 
                          error.message || 
                          'فشل التسجيل'
      return { success: false, error: errorMessage }
    }
  }

  // Logout
  const logout = async () => {
    try {
      // Call logout endpoint
      await api.post('/auth/logout')
    } catch (error) {
      // Even if logout fails, clear local state
      console.error('Logout error:', error)
    } finally {
      // Clear user and tokens
      user.value = null
      if (typeof window !== 'undefined') {
        localStorage.removeItem('access_token')
        localStorage.removeItem('refresh_token')
      }
    }
  }

  // Initialize on client side
  if (typeof window !== 'undefined') {
    initializeAuth()
  }

  return {
    user: readonly(user),
    isLoading: readonly(isLoading),
    login,
    register,
    logout,
    fetchCurrentUser,
  }
}
