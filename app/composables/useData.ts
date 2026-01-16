import type { User, UserRole } from './useAuth'

export interface Service {
  id: string
  name: string
  price: number
  duration: number // in minutes
  category: 'شعر' | 'حواجب' | 'رموش' | 'مانيكير' | 'باديكير'
  createdAt: Date
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

  const initializeData = () => {
    if (typeof window !== 'undefined') {
      // Load from localStorage
      const storedServices = localStorage.getItem('novaya_services')
      const storedBookings = localStorage.getItem('novaya_bookings')
      const storedEmployees = localStorage.getItem('novaya_employees')
      const storedHours = localStorage.getItem('novaya_workingHours')

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

  // Initialize on client side
  if (typeof window !== 'undefined') {
    initializeData()
  }

  return {
    services: readonly(services),
    bookings: readonly(bookings),
    employees: readonly(employees),
    workingHours: readonly(workingHours),
    addService,
    updateService,
    deleteService,
    addBooking,
    updateBooking,
    addEmployee,
    updateWorkingHours,
  }
}
