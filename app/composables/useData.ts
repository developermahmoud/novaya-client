import type { User, UserRole } from './useAuth'

export interface Service {
  id: string
  name: string
  price: number
  duration: number // in minutes
  category: 'شعر' | 'حواجب' | 'رموش' | 'مانيكير' | 'باديكير'
  createdAt: Date
}

interface ApiServiceResponse {
  id: number
  name: string
  description?: string
  price: number
  duration: number
  category: {
    id: number
    name: string
    status?: string
  }
  category_id?: number
  status?: string
  created_at?: string
  updated_at?: string
}

export interface Booking {
  id: string
  clientId: string
  employeeId?: string
  date: Date
  time: string // HH:mm format
  services: string[] // service IDs
  status: 'pending' | 'completed' | 'cancelled'
  totalPrice: number
  createdAt: Date
}

export interface WorkingHours {
  day: string // 'sunday' | 'monday' | etc.
  isOpen: boolean
  startTime: string // HH:mm
  endTime: string // HH:mm
}

export interface Settings {
  id: number
  address: string
  latitude?: number
  longitude?: number
  mobile: string
  whatsapp: string
  email: string
  facebook_link?: string
  instagram_link?: string
  twitter_link?: string
  youtube_link?: string
  working_hours: {
    [key: string]: {
      from_time: string
      to_time: string
      is_open: boolean
    }
  }
  created_at?: string
  updated_at?: string
}

interface ApiSettingsResponse {
  id: number
  address: string
  latitude?: number
  longitude?: number
  mobile: string
  whatsapp: string
  email: string
  facebook_link?: string
  instagram_link?: string
  twitter_link?: string
  youtube_link?: string
  working_hours: {
    [key: string]: {
      from_time: string
      to_time: string
      is_open: boolean
    }
  }
  created_at?: string
  updated_at?: string
}

// User Booking API Response Types
export interface ApiBookingService {
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
}

export interface ApiUserBooking {
  id: number
  booking_date: string
  booking_time: string
  status: string
  notes?: string
  total_amount: number
  customer_id: number
  services: ApiBookingService[]
  created_at: string
  updated_at: string
}

const defaultWorkingHours: WorkingHours[] = [
  { day: 'sunday', isOpen: true, startTime: '12:00', endTime: '00:00' },
  { day: 'monday', isOpen: true, startTime: '12:00', endTime: '00:00' },
  { day: 'tuesday', isOpen: true, startTime: '12:00', endTime: '00:00' },
  { day: 'wednesday', isOpen: true, startTime: '12:00', endTime: '00:00' },
  { day: 'thursday', isOpen: true, startTime: '12:00', endTime: '00:00' },
  { day: 'friday', isOpen: true, startTime: '12:00', endTime: '00:00' },
  { day: 'saturday', isOpen: true, startTime: '12:00', endTime: '00:00' },
]

export const useData = () => {
  const services = useState<Service[]>('data_services', () => [])
  const bookings = useState<Booking[]>('data_bookings', () => [])
  const employees = useState<User[]>('data_employees', () => [])
  const workingHours = useState<WorkingHours[]>('data_workingHours', () => defaultWorkingHours)
  const settings = useState<Settings | null>('data_settings', () => null)
  const isLoadingServices = useState<boolean>('data_loading_services', () => false)
  const isLoadingSettings = useState<boolean>('data_loading_settings', () => false)
  
  const api = useApi()

  const initializeData = () => {
    if (typeof window !== 'undefined') {
      // Load from localStorage
      const storedServices = localStorage.getItem('novaya_services')
      const storedBookings = localStorage.getItem('novaya_bookings')
      const storedEmployees = localStorage.getItem('novaya_employees')
      const storedHours = localStorage.getItem('novaya_workingHours')
      const storedSettings = localStorage.getItem('novaya_settings')

      if (storedServices) {
        const parsed = JSON.parse(storedServices)
        services.value = parsed.map((s: any) => ({
          ...s,
          createdAt: new Date(s.createdAt)
        }))
      }
      if (storedBookings) {
        const parsed = JSON.parse(storedBookings)
        bookings.value = parsed.map((b: any) => ({
          ...b,
          date: new Date(b.date),
          createdAt: new Date(b.createdAt)
        }))
      }
      if (storedEmployees) {
        const parsed = JSON.parse(storedEmployees)
        employees.value = parsed.map((e: any) => ({
          ...e,
          createdAt: new Date(e.createdAt)
        }))
      }
      if (storedHours) workingHours.value = JSON.parse(storedHours)
      if (storedSettings) {
        try {
          settings.value = JSON.parse(storedSettings)
        } catch (e) {
          console.error('Error parsing stored settings:', e)
        }
      }

      // Initialize default services if empty
      if (!storedServices) {
        const defaultServices: Service[] = [
          { id: '1', name: 'قص شعر', price: 100, duration: 60, category: 'شعر', createdAt: new Date() },
          { id: '2', name: 'صبغة شعر', price: 200, duration: 120, category: 'شعر', createdAt: new Date() },
          { id: '3', name: 'خيط الحواجب', price: 50, duration: 30, category: 'حواجب', createdAt: new Date() },
          { id: '4', name: 'رموش صناعية', price: 300, duration: 90, category: 'رموش', createdAt: new Date() },
          { id: '5', name: 'مانيكير', price: 80, duration: 45, category: 'مانيكير', createdAt: new Date() },
          { id: '6', name: 'باديكير', price: 100, duration: 60, category: 'باديكير', createdAt: new Date() },
        ]
        services.value = defaultServices
        localStorage.setItem('novaya_services', JSON.stringify(defaultServices))
      }
    }
  }

  const addService = (service: Omit<Service, 'id' | 'createdAt'>) => {
    const newService: Service = {
      ...service,
      id: Date.now().toString(),
      createdAt: new Date(),
    }
    const updated = [...services.value, newService]
    services.value = updated
    if (typeof window !== 'undefined') {
      localStorage.setItem('novaya_services', JSON.stringify(updated))
    }
  }

  const updateService = (id: string, service: Partial<Service>) => {
    const updated = services.value.map(s => s.id === id ? { ...s, ...service } : s)
    services.value = updated
    if (typeof window !== 'undefined') {
      localStorage.setItem('novaya_services', JSON.stringify(updated))
    }
  }

  const deleteService = (id: string) => {
    const updated = services.value.filter(s => s.id !== id)
    services.value = updated
    if (typeof window !== 'undefined') {
      localStorage.setItem('novaya_services', JSON.stringify(updated))
    }
  }

  const addBooking = (booking: Omit<Booking, 'id' | 'createdAt'>) => {
    const newBooking: Booking = {
      ...booking,
      id: Date.now().toString(),
      createdAt: new Date(),
    }
    const updated = [...bookings.value, newBooking]
    bookings.value = updated
    if (typeof window !== 'undefined') {
      localStorage.setItem('novaya_bookings', JSON.stringify(updated))
    }
  }

  const updateBooking = (id: string, booking: Partial<Booking>) => {
    const updated = bookings.value.map(b => b.id === id ? { ...b, ...booking } : b)
    bookings.value = updated
    if (typeof window !== 'undefined') {
      localStorage.setItem('novaya_bookings', JSON.stringify(updated))
    }
  }

  const addEmployee = (employee: Omit<User, 'id' | 'createdAt'> & { password?: string }) => {
    const newEmployee: User = {
      ...employee,
      id: Date.now().toString(),
      createdAt: new Date(),
    }
    const updated = [...employees.value, newEmployee]
    employees.value = updated
    if (typeof window !== 'undefined') {
      localStorage.setItem('novaya_employees', JSON.stringify(updated))
      
      // Also add to users list for login purposes
      if (employee.password) {
        const users = JSON.parse(localStorage.getItem('novaya_users') || '[]')
        const userWithPassword = {
          ...newEmployee,
          password: employee.password,
        }
        users.push(userWithPassword)
        localStorage.setItem('novaya_users', JSON.stringify(users))
      }
    }
  }

  const updateWorkingHours = (hours: WorkingHours[]) => {
    workingHours.value = hours
    if (typeof window !== 'undefined') {
      localStorage.setItem('novaya_workingHours', JSON.stringify(hours))
    }
  }

  // Fetch public services from API
  const fetchPublicServices = async () => {
    isLoadingServices.value = true
    try {
      const response = await api.get<{ success: boolean; message?: string; data: ApiServiceResponse[] }>('/public/services')
      
      if (response.data.success && response.data.data) {
        // Transform API response to Service interface
        const transformedServices: Service[] = response.data.data
          .filter(apiService => apiService.status === 'active') // Only include active services
          .map(apiService => ({
            id: apiService.id.toString(),
            name: apiService.name,
            price: apiService.price,
            duration: apiService.duration,
            category: (apiService.category?.name || 'شعر') as Service['category'],
            createdAt: apiService.created_at ? new Date(apiService.created_at) : new Date(),
          }))
        
        services.value = transformedServices
        
        // Optionally save to localStorage as backup
        if (typeof window !== 'undefined') {
          localStorage.setItem('novaya_services', JSON.stringify(transformedServices))
        }
      }
    } catch (error) {
      console.error('Error fetching public services:', error)
      // Keep existing services if API call fails
    } finally {
      isLoadingServices.value = false
    }
  }

  // Fetch public settings from API
  const fetchPublicSettings = async () => {
    isLoadingSettings.value = true
    try {
      const response = await api.get<{ success: boolean; message?: string; data: ApiSettingsResponse }>('/public/settings')
      
      if (response.data.success && response.data.data) {
        settings.value = response.data.data
        
        // Transform working hours from API format to WorkingHours interface
        const daysMap: Record<string, string> = {
          'saturday': 'saturday',
          'sunday': 'sunday',
          'monday': 'monday',
          'tuesday': 'tuesday',
          'wednesday': 'wednesday',
          'thursday': 'thursday',
          'friday': 'friday',
        }
        
        const transformedHours: WorkingHours[] = Object.entries(response.data.data.working_hours)
          .map(([dayKey, hours]) => ({
            day: daysMap[dayKey] || dayKey,
            isOpen: hours.is_open,
            startTime: hours.from_time,
            endTime: hours.to_time,
          }))
        
        workingHours.value = transformedHours
        
        // Save to localStorage as backup
        if (typeof window !== 'undefined') {
          localStorage.setItem('novaya_settings', JSON.stringify(response.data.data))
          localStorage.setItem('novaya_workingHours', JSON.stringify(transformedHours))
        }
      }
    } catch (error) {
      console.error('Error fetching public settings:', error)
      // Keep existing settings if API call fails
    } finally {
      isLoadingSettings.value = false
    }
  }

  // Create booking via API
  interface CreateBookingPayload {
    booking_date: string // YYYY-MM-DD format
    booking_time: string // HH:mm format
    status: string
    notes?: string
    services: Array<{
      service_id: number
      employee_id?: number
    }>
  }

  const createBooking = async (payload: CreateBookingPayload): Promise<{ success: boolean; error?: string; data?: any }> => {
    try {
      const response = await api.post<{ success: boolean; message?: string; data?: any }>('/bookings', payload)
      
      if (response.data.success) {
        return { success: true, data: response.data.data }
      } else {
        return { success: false, error: response.data.message || 'فشل إنشاء الحجز' }
      }
    } catch (error: any) {
      console.error('Error creating booking:', error)
      
      // Handle API error response
      const errorMessage = error.response?.data?.message || error.response?.data?.error || 'حدث خطأ أثناء إنشاء الحجز'
      
      return { success: false, error: errorMessage }
    }
  }

  interface ApiUserBookingsResponse {
    success: boolean
    message?: string
    data: ApiUserBooking[]
    current_page: number
    per_page: number
    total: number
    last_page: number
    from?: number
    to?: number
  }

  interface UserBookingsData {
    bookings: ApiUserBooking[]
    pagination: {
      current_page: number
      per_page: number
      total: number
      last_page: number
      from?: number
      to?: number
    }
  }

  // Fetch user bookings from API with pagination and optional status filter
  const fetchUserBookings = async (page: number = 1, status?: 'pending' | 'completed' | 'cancelled'): Promise<{ success: boolean; data?: UserBookingsData; error?: string }> => {
    try {
      let url = `/bookings/my-bookings?page=${page}`
      if (status) {
        url += `&status=${status}`
      }
      
      const response = await api.get<ApiUserBookingsResponse>(url)
      
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
      console.error('Error fetching user bookings:', error)
      
      const errorMessage = error.response?.data?.message || error.response?.data?.error || 'حدث خطأ أثناء جلب الحجوزات'
      
      return { success: false, error: errorMessage }
    }
  }

  // Cancel booking via API
  const cancelBooking = async (bookingId: number): Promise<{ success: boolean; error?: string }> => {
    try {
      const response = await api.put<{ success: boolean; message?: string }>(`/bookings/${bookingId}/cancel`)
      
      if (response.data.success) {
        return { success: true }
      } else {
        return { success: false, error: response.data.message || 'فشل إلغاء الحجز' }
      }
    } catch (error: any) {
      console.error('Error cancelling booking:', error)
      
      const errorMessage = error.response?.data?.message || error.response?.data?.error || 'حدث خطأ أثناء إلغاء الحجز'
      
      return { success: false, error: errorMessage }
    }
  }

  // Initialize on client side
  if (typeof window !== 'undefined') {
    initializeData()
  }

  return {
    services: readonly(services),
    bookings: readonly(bookings),
    employees: readonly(employees),
    workingHours: readonly(workingHours),
    settings: readonly(settings),
    isLoadingServices: readonly(isLoadingServices),
    isLoadingSettings: readonly(isLoadingSettings),
    addService,
    updateService,
    deleteService,
    addBooking,
    updateBooking,
    addEmployee,
    updateWorkingHours,
    fetchPublicServices,
    fetchPublicSettings,
    createBooking,
    fetchUserBookings,
    cancelBooking,
  }
}
