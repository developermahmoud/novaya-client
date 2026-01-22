import type { LocalService, Booking } from '~/composables/useData'

export const getStatusConfig = (status: 'pending' | 'completed' | 'cancelled') => {
  const configs = {
    pending: {
      text: 'في الانتظار',
      color: 'bg-yellow-100 text-yellow-800',
    },
    completed: {
      text: 'مكتمل',
      color: 'bg-green-100 text-green-800',
    },
    cancelled: {
      text: 'إلغاء',
      color: 'bg-red-100 text-red-800',
    },
  }
  return configs[status]
}

export const getServiceNames = (serviceIds: string[], services: LocalService[]): string => {
  return serviceIds
    .map((id) => {
      const service = services.find((s) => s.id === id)
      return service?.name || ''
    })
    .filter(Boolean)
    .join('، ')
}

export const formatCurrency = (amount: number): string => {
  return `${amount} ريال`
}

export const formatTime12Hour = (time24: string): string => {
  const [hours, minutes] = time24.split(':')
  const hour24 = parseInt(hours, 10)
  const mins = minutes || '00'
  
  if (hour24 === 0) {
    return `12:${mins} ص`
  } else if (hour24 === 12) {
    return `12:${mins} م`
  } else if (hour24 < 12) {
    return `${hour24}:${mins} ص`
  } else {
    return `${hour24 - 12}:${mins} م`
  }
}

export const formatDate = (dateString: string | Date): string => {
  const dateObj = typeof dateString === 'string' ? new Date(dateString) : dateString
  const days = ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت']
  const months = ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر']
  const day = days[dateObj.getDay()]
  const dayNum = dateObj.getDate()
  const month = months[dateObj.getMonth()]
  const year = dateObj.getFullYear()
  return `${day}، ${dayNum} ${month} ${year}`
}
