import { getDashboardRoute } from '~/utils/routes'

export default defineNuxtRouteMiddleware(async (to, from) => {
  const { user, isLoading } = useAuth()
  
  // Wait for auth to initialize
  if (isLoading.value) {
    // Wait for auth to finish loading with timeout
    let timeoutId: NodeJS.Timeout | null = null
    let intervalId: NodeJS.Timeout | null = null
    
    await new Promise<void>((resolve) => {
      intervalId = setInterval(() => {
        if (!isLoading.value) {
          if (intervalId) clearInterval(intervalId)
          if (timeoutId) clearTimeout(timeoutId)
          resolve()
        }
      }, 50)
      
      // Timeout after 2 seconds
      timeoutId = setTimeout(() => {
        if (intervalId) clearInterval(intervalId)
        resolve()
      }, 2000)
    })
  }
  
  if (!user.value) {
    return navigateTo('/')
  }
  
  if (user.value.role !== 'admin') {
    // Redirect to appropriate dashboard based on role
    const dashboardRoute = getDashboardRoute(user.value.role)
    return navigateTo(dashboardRoute)
  }
})
