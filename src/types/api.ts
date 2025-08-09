export interface User {
  id: number
  name: string
  email: string
  role: "admin" | "student"
  created_at: string
  updated_at: string
}

export interface Session {
  id: number
  course_id: number
  status: "morning" | "evening" | "night"
  start_time: string
  end_time: string
  created_at: string
  updated_at: string
}

export interface Course {
  id: number
  title: string
  description: string
  schedule: string
  start_date: string
  end_date: string
  created_at: string
  updated_at: string
  sessions: Session[]
}

export interface Enrollment {
  id: number
  user_id: number
  course_id: number
  status: "pending" | "approved" | "rejected"
  created_at: string
  updated_at: string
  course?: Course
  user?: User
}

export interface AuthResponse {
  message: string
  user: User
  token: string
}

export interface LoginData {
  email: string
  password: string
}

export interface RegisterData {
  name: string
  email: string
  password: string
  password_confirmation: string
}

export interface CourseData {
  title: string
  description: string
  schedule: string
  start_date: string
  end_date: string
}
