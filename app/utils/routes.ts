import type { UserRole } from '~/composables/useAuth'

/**
 * Get dashboard route based on user role
 */
export const getDashboardRoute = (role: UserRole | string): string => {
  switch (role) {
    case 'admin':
      return '/admin/dashboard'
    case 'employee':
      return '/employee/dashboard'
    case 'receptionist':
      return '/receptionist/dashboard'
    case 'customer':
    case 'client': // Support old role name for backward compatibility
      return '/customer/dashboard'
    default:
      return '/customer/dashboard'
  }
}

/**
 * Get layout name based on user role
 */
export const getLayoutName = (role: UserRole | string): string => {
  switch (role) {
    case 'admin':
      return 'admin'
    case 'employee':
      return 'employee'
    case 'receptionist':
      return 'receptionist'
    case 'customer':
    case 'client':
      return 'customer'
    default:
      return 'default'
  }
}

/**
 * Composable to use routes utilities
 */
export const useUtils = () => {
  return {
    getDashboardRoute,
    getLayoutName,
  }
}
