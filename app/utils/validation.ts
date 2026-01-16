// Validation utilities

export interface ValidationResult {
  isValid: boolean
  error?: string
}

// Validate Saudi mobile number
export const validateSaudiMobile = (mobile: string): ValidationResult => {
  if (!mobile || mobile.trim() === '') {
    return { isValid: false, error: 'رقم الجوال مطلوب' }
  }

  // Remove spaces and dashes
  const cleaned = mobile.replace(/\s|-/g, '')

  // Check if it starts with 05 or +966
  const saudiPattern = /^(05|9665|\+9665)\d{8}$/
  
  // Also check if it's 9 digits starting with 5 (05xxxxxxxx)
  const simplePattern = /^05\d{8}$/

  if (simplePattern.test(cleaned)) {
    return { isValid: true }
  }

  // Check full format with country code
  if (cleaned.startsWith('9665') && cleaned.length === 12) {
    return { isValid: true }
  }

  if (cleaned.startsWith('+9665') && cleaned.length === 13) {
    return { isValid: true }
  }

  return {
    isValid: false,
    error: 'رقم الجوال يجب أن يكون سعودي (يبدأ بـ 05) ويتكون من 10 أرقام'
  }
}

// Validate email
export const validateEmail = (email: string): ValidationResult => {
  if (!email || email.trim() === '') {
    return { isValid: false, error: 'البريد الإلكتروني مطلوب' }
  }

  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  
  if (!emailPattern.test(email)) {
    return { isValid: false, error: 'البريد الإلكتروني غير صحيح' }
  }

  return { isValid: true }
}

// Validate password
export const validatePassword = (password: string): ValidationResult => {
  if (!password || password.trim() === '') {
    return { isValid: false, error: 'كلمة المرور مطلوبة' }
  }

  if (password.length < 8) {
    return { isValid: false, error: 'كلمة المرور يجب أن تكون 8 أحرف على الأقل' }
  }

  // Check for at least one uppercase, one lowercase, one number, and one special character
  const hasUpperCase = /[A-Z]/.test(password)
  const hasLowerCase = /[a-z]/.test(password)
  const hasNumber = /\d/.test(password)
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password)

  if (!hasUpperCase || !hasLowerCase || !hasNumber || !hasSpecialChar) {
    return {
      isValid: false,
      error: 'كلمة المرور يجب أن تحتوي على حرف كبير، حرف صغير، رقم ورمز خاص'
    }
  }

  return { isValid: true }
}

// Validate name
export const validateName = (name: string): ValidationResult => {
  if (!name || name.trim() === '') {
    return { isValid: false, error: 'الاسم مطلوب' }
  }

  if (name.trim().length < 2) {
    return { isValid: false, error: 'الاسم يجب أن يكون حرفين على الأقل' }
  }

  return { isValid: true }
}

// Normalize Saudi mobile number to format: 05xxxxxxxx
export const normalizeSaudiMobile = (mobile: string): string => {
  if (!mobile) return ''
  
  // Remove spaces, dashes, and plus signs
  let cleaned = mobile.replace(/\s|-|\+/g, '')
  
  // If starts with 9665, remove 966
  if (cleaned.startsWith('9665')) {
    cleaned = '0' + cleaned.substring(3)
  }
  
  // If starts with 5 and has 9 digits, add 0 at the beginning
  if (cleaned.startsWith('5') && cleaned.length === 9) {
    cleaned = '0' + cleaned
  }
  
  return cleaned
}
