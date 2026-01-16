export default defineNuxtRouteMiddleware(async (to, from) => {
  const { user, isLoading } = useAuth()
  
  // Wait for auth to initialize
  if (isLoading.value) {
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
      
      timeoutId = setTimeout(() => {
        if (intervalId) clearInterval(intervalId)
        resolve()
      }, 2000)
    })
  }
  
  if (!user.value) {
    return navigateTo('/')
  }
})
