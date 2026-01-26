import type { ApiResponse } from './useAuth'

export interface AttendanceRecord {
  id: number
  user_id: number
  type: 'check_in' | 'check_out'
  latitude: number
  longitude: number
  check_in_time?: string
  check_out_time?: string
  date: string
  created_at: string
  updated_at: string
}

export interface AttendanceStatus {
  id: number
  employee_id: number
  date: string
  check_in: string | null
  check_out: string | null
}

export const useAttendance = () => {
  const api = useApi()

  // Get today's attendance status
  const getTodayAttendance = async (): Promise<{ success: boolean; data?: AttendanceStatus; error?: string }> => {
    try {
      const response = await api.get<ApiResponse<AttendanceStatus>>('/attendance/today')
      
      if (response.data.success && response.data.data) {
        return { success: true, data: response.data.data }
      } else {
        return { success: false, error: response.data.message || 'فشل جلب حالة الحضور' }
      }
    } catch (error: any) {
      console.error('Error fetching today attendance:', error)
      const errorMessage = error.response?.data?.message || error.response?.data?.error || 'حدث خطأ أثناء جلب حالة الحضور'
      return { success: false, error: errorMessage }
    }
  }

  // Check in
  const checkIn = async (latitude: number, longitude: number): Promise<{ success: boolean; data?: AttendanceRecord; error?: string }> => {
    try {
      const response = await api.post<ApiResponse<AttendanceRecord>>('/attendance/check-in', {
        latitude,
        longitude
      })
      
      if (response.data.success && response.data.data) {
        return { success: true, data: response.data.data }
      } else {
        return { success: false, error: response.data.message || 'فشل تسجيل الحضور' }
      }
    } catch (error: any) {
      console.error('Error checking in:', error)
      const errorMessage = error.response?.data?.message || error.response?.data?.error || 'حدث خطأ أثناء تسجيل الحضور'
      return { success: false, error: errorMessage }
    }
  }

  // Check out
  const checkOut = async (latitude: number, longitude: number): Promise<{ success: boolean; data?: AttendanceRecord; error?: string }> => {
    try {
      const response = await api.post<ApiResponse<AttendanceRecord>>('/attendance/check-out', {
        latitude,
        longitude
      })
      
      if (response.data.success && response.data.data) {
        return { success: true, data: response.data.data }
      } else {
        return { success: false, error: response.data.message || 'فشل تسجيل الانصراف' }
      }
    } catch (error: any) {
      console.error('Error checking out:', error)
      const errorMessage = error.response?.data?.message || error.response?.data?.error || 'حدث خطأ أثناء تسجيل الانصراف'
      return { success: false, error: errorMessage }
    }
  }

  // Get all attendance records
  const getAttendanceRecords = async (): Promise<{ success: boolean; data?: AttendanceRecord[]; error?: string }> => {
    try {
      const response = await api.get<ApiResponse<AttendanceRecord[]>>('/attendance')
      
      if (response.data.success && response.data.data) {
        return { success: true, data: response.data.data }
      } else {
        return { success: false, error: response.data.message || 'فشل جلب سجل الحضور' }
      }
    } catch (error: any) {
      console.error('Error fetching attendance records:', error)
      const errorMessage = error.response?.data?.message || error.response?.data?.error || 'حدث خطأ أثناء جلب سجل الحضور'
      return { success: false, error: errorMessage }
    }
  }

  // Get attendance record by ID
  const getAttendanceRecord = async (id: number): Promise<{ success: boolean; data?: AttendanceRecord; error?: string }> => {
    try {
      const response = await api.get<ApiResponse<AttendanceRecord>>(`/attendance/${id}`)
      
      if (response.data.success && response.data.data) {
        return { success: true, data: response.data.data }
      } else {
        return { success: false, error: response.data.message || 'فشل جلب سجل الحضور' }
      }
    } catch (error: any) {
      console.error('Error fetching attendance record:', error)
      const errorMessage = error.response?.data?.message || error.response?.data?.error || 'حدث خطأ أثناء جلب سجل الحضور'
      return { success: false, error: errorMessage }
    }
  }

  return {
    getTodayAttendance,
    checkIn,
    checkOut,
    getAttendanceRecords,
    getAttendanceRecord,
  }
}
