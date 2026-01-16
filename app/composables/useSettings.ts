import type { ApiResponse } from './useAuth'

export interface WorkingHour {
  from_time: string
  to_time: string
  is_open: boolean
}

export interface WorkingHours {
  saturday: WorkingHour
  sunday: WorkingHour
  monday: WorkingHour
  tuesday: WorkingHour
  wednesday: WorkingHour
  thursday: WorkingHour
  friday: WorkingHour
}

export interface Settings {
  id?: number
  address: string
  latitude: number
  longitude: number
  mobile: string
  whatsapp: string
  email: string
  facebook_link: string
  instagram_link: string
  twitter_link: string
  youtube_link: string
  working_hours: WorkingHours
  created_at?: string
  updated_at?: string
}

export const useSettings = () => {
  const api = useApi()

  // Get settings
  const getSettings = async (): Promise<Settings> => {
    try {
      const response = await api.get<ApiResponse<Settings>>('/settings')
      return response.data.data
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'فشل جلب الإعدادات')
    }
  }

  // Update settings
  const updateSettings = async (data: Partial<Settings>): Promise<Settings> => {
    try {
      const response = await api.put<ApiResponse<Settings>>('/settings', data)
      return response.data.data
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'فشل تحديث الإعدادات'
      throw new Error(errorMessage)
    }
  }

  return {
    getSettings,
    updateSettings,
  }
}
