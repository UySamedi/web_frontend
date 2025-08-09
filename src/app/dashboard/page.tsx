"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/AuthContext"
import Layout from "@/components/Layout"
import Button from "@/components/ui/Button"
import Input from "@/components/ui/Input"
import { type Course, coursesAPI, enrollmentsAPI, type CourseData } from "@/lib/api"
import { Plus, Edit, Trash2, BookOpen, Clock, Calendar, Users, X } from "lucide-react"

// Extended interface to include sessions
interface CourseFormData extends CourseData {
  sessions: Array<{
    status: string
    start_time: string
    end_time: string
  }>
}

// Interface for student enrollment
interface EnrollmentData {
  courseId: number
  selectedDate: string
  selectedSessionId?: number
}

const DashboardPage: React.FC = () => {
  const { user } = useAuth()
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [editingCourse, setEditingCourse] = useState<Course | null>(null)
  const [formData, setFormData] = useState<CourseFormData>({
    title: "",
    description: "",
    schedule: "",
    start_date: "",
    end_date: "",
    sessions: [],
  })
  const [enrollmentLoading, setEnrollmentLoading] = useState<number | null>(null)

  // Student enrollment state
  const [showEnrollmentModal, setShowEnrollmentModal] = useState(false)
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null)
  const [enrollmentData, setEnrollmentData] = useState<EnrollmentData>({
    courseId: 0,
    selectedDate: "",
    selectedSessionId: undefined,
  })

  useEffect(() => {
    fetchCourses()
  }, [])

  const fetchCourses = async (): Promise<void> => {
    try {
      const data = await coursesAPI.getAll()
      setCourses(data)
    } catch (error) {
      console.error("Failed to fetch courses:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault()
    try {
      if (editingCourse) {
        await coursesAPI.update(editingCourse.id, formData)
      } else {
        await coursesAPI.create(formData)
      }
      await fetchCourses()
      resetForm()
    } catch (error) {
      console.error("Failed to save course:", error)
    }
  }

  const handleDelete = async (id: number): Promise<void> => {
    if (confirm("Are you sure you want to delete this course?")) {
      try {
        await coursesAPI.delete(id)
        await fetchCourses()
      } catch (error) {
        console.error("Failed to delete course:", error)
      }
    }
  }

  // Updated enrollment function for students
  const handleEnrollClick = (course: Course): void => {
    setSelectedCourse(course)
    setEnrollmentData({
      courseId: course.id,
      selectedDate: course.start_date, // Default to course start date
      selectedSessionId: course.sessions?.[0]?.id || undefined,
    })
    setShowEnrollmentModal(true)
  }

  const handleEnrollSubmit = async (): Promise<void> => {
    if (!enrollmentData.selectedDate) {
      alert("Please select a date for enrollment")
      return
    }

    setEnrollmentLoading(enrollmentData.courseId)
    try {
      // Send enrollment data with selected date and session
      await enrollmentsAPI.enroll(enrollmentData.courseId, {
        selectedDate: enrollmentData.selectedDate,
        selectedSessionId: enrollmentData.selectedSessionId,
      })
      alert("Enrollment request submitted! Waiting for admin approval.")
      setShowEnrollmentModal(false)
      resetEnrollmentForm()
    } catch (error: any) {
      alert(error?.response?.data?.message || "Enrollment failed")
    } finally {
      setEnrollmentLoading(null)
    }
  }

  const resetForm = (): void => {
    setFormData({
      title: "",
      description: "",
      schedule: "",
      start_date: "",
      end_date: "",
      sessions: [],
    })
    setShowCreateForm(false)
    setEditingCourse(null)
  }

  const resetEnrollmentForm = (): void => {
    setEnrollmentData({
      courseId: 0,
      selectedDate: "",
      selectedSessionId: undefined,
    })
    setSelectedCourse(null)
    setShowEnrollmentModal(false)
  }

  const startEdit = (course: Course): void => {
    setFormData({
      title: course.title,
      description: course.description,
      schedule: course.schedule,
      start_date: course.start_date,
      end_date: course.end_date,
      sessions: course.sessions || [],
    })
    setEditingCourse(course)
    setShowCreateForm(true)
  }

  // Session management functions
  const addSession = (): void => {
    setFormData({
      ...formData,
      sessions: [
        ...formData.sessions,
        {
          status: "morning",
          start_time: "09:00:00",
          end_time: "11:00:00",
        },
      ],
    })
  }

  const removeSession = (index: number): void => {
    setFormData({
      ...formData,
      sessions: formData.sessions.filter((_, i) => i !== index),
    })
  }

  const updateSession = (index: number, field: string, value: string): void => {
    const updatedSessions = formData.sessions.map((session, i) =>
      i === index ? { ...session, [field]: value } : session,
    )
    setFormData({
      ...formData,
      sessions: updatedSessions,
    })
  }

  // Generate date options between course start and end date
  const generateDateOptions = (startDate: string, endDate: string): string[] => {
    const dates: string[] = []
    const start = new Date(startDate)
    const end = new Date(endDate)

    for (let date = new Date(start); date <= end; date.setDate(date.getDate() + 1)) {
      dates.push(date.toISOString().split("T")[0])
    }

    return dates
  }

  const formatDate = (dateString: string): string => {
    try {
      return new Date(dateString).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    } catch (error) {
      return dateString
    }
  }

  const formatTime = (timeString: string): string => {
    try {
      return new Date(`2000-01-01T${timeString}`).toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      })
    } catch (error) {
      return timeString
    }
  }

  const getSessionStatusColor = (status: string): string => {
    switch (status) {
      case "morning":
        return "bg-yellow-100 text-yellow-800"
      case "evening":
        return "bg-blue-100 text-blue-800"
      case "night":
        return "bg-purple-100 text-purple-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="px-4 sm:px-0">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {user?.role === "admin" ? "Course Management" : "Available Courses"}
            </h1>
            <p className="mt-2 text-gray-600">
              {user?.role === "admin"
                ? "Manage courses and enrollments"
                : "Browse and enroll in courses (maximum 3 courses)"}
            </p>
          </div>
          {user?.role === "admin" && (
            <Button onClick={() => setShowCreateForm(true)} className="flex items-center space-x-2">
              <Plus className="h-5 w-5" />
              <span>Add Course</span>
            </Button>
          )}
        </div>

        {/* Create/Edit Form - Admin Only */}
        {showCreateForm && user?.role === "admin" && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h2 className="text-xl font-semibold mb-4">{editingCourse ? "Edit Course" : "Create New Course"}</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <Input
                label="Course Title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
                placeholder="e.g., Full Day Course"
              />

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  required
                  rows={3}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="Course with morning, evening, and night sessions."
                />
              </div>

              <Input
                label="Schedule"
                value={formData.schedule}
                onChange={(e) => setFormData({ ...formData, schedule: e.target.value })}
                required
                placeholder="e.g., Daily"
              />

              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Start Date"
                  type="date"
                  value={formData.start_date}
                  onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                  required
                />
                <Input
                  label="End Date"
                  type="date"
                  value={formData.end_date}
                  onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                  required
                />
              </div>

              {/* Sessions Section */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium text-gray-900">Sessions</h3>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={addSession}
                    className="flex items-center space-x-2 bg-transparent"
                  >
                    <Plus className="h-4 w-4" />
                    <span>Add Session</span>
                  </Button>
                </div>

                {formData.sessions.length === 0 && (
                  <p className="text-sm text-gray-500 italic">
                    No sessions added yet. Click "Add Session" to create course sessions.
                  </p>
                )}

                {formData.sessions.map((session, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4 space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-medium text-gray-700">Session {index + 1}</h4>
                      <button
                        type="button"
                        onClick={() => removeSession(index)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                        <select
                          value={session.status}
                          onChange={(e) => updateSession(index, "status", e.target.value)}
                          className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        >
                          <option value="morning">Morning</option>
                          <option value="evening">Evening</option>
                          <option value="night">Night</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Start Time</label>
                        <input
                          type="time"
                          step="1"
                          value={session.start_time}
                          onChange={(e) => updateSession(index, "start_time", e.target.value)}
                          className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">End Time</label>
                        <input
                          type="time"
                          step="1"
                          value={session.end_time}
                          onChange={(e) => updateSession(index, "end_time", e.target.value)}
                          className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                          required
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex space-x-3">
                <Button type="submit">{editingCourse ? "Update Course" : "Create Course"}</Button>
                <Button type="button" variant="outline" onClick={resetForm}>
                  Cancel
                </Button>
              </div>
            </form>
          </div>
        )}

        {/* Student Enrollment Modal */}
        {showEnrollmentModal && user?.role === "student" && selectedCourse && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md mx-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Enroll in Course</h3>
                <button onClick={resetEnrollmentForm} className="text-gray-400 hover:text-gray-600">
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="mb-4">
                <h4 className="font-medium text-gray-900 mb-2">{selectedCourse.title}</h4>
                <p className="text-sm text-gray-600 mb-4">{selectedCourse.description}</p>
              </div>

              <div className="space-y-4">
                {/* Date Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Select Enrollment Date</label>
                  <select
                    value={enrollmentData.selectedDate}
                    onChange={(e) => setEnrollmentData({ ...enrollmentData, selectedDate: e.target.value })}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    required
                  >
                    <option value="">Select a date</option>
                    {generateDateOptions(selectedCourse.start_date, selectedCourse.end_date).map((date) => (
                      <option key={date} value={date}>
                        {formatDate(date)}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Session Selection */}
                {selectedCourse.sessions && selectedCourse.sessions.length > 0 && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Select Session (Optional)</label>
                    <select
                      value={enrollmentData.selectedSessionId || ""}
                      onChange={(e) =>
                        setEnrollmentData({
                          ...enrollmentData,
                          selectedSessionId: e.target.value ? Number.parseInt(e.target.value) : undefined,
                        })
                      }
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    >
                      <option value="">All sessions</option>
                      {selectedCourse.sessions.map((session) => (
                        <option key={session.id} value={session.id}>
                          {session.status} ({formatTime(session.start_time)} - {formatTime(session.end_time)})
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Course Details */}
                <div className="bg-gray-50 rounded-md p-3">
                  <div className="flex items-center space-x-2 text-sm text-gray-600 mb-1">
                    <Clock className="h-4 w-4" />
                    <span>{selectedCourse.schedule}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <Calendar className="h-4 w-4" />
                    <span>
                      {formatDate(selectedCourse.start_date)} - {formatDate(selectedCourse.end_date)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex space-x-3 mt-6">
                <Button
                  onClick={handleEnrollSubmit}
                  loading={enrollmentLoading === selectedCourse.id}
                  className="flex-1"
                >
                  Confirm Enrollment
                </Button>
                <Button type="button" variant="outline" onClick={resetEnrollmentForm} className="flex-1 bg-transparent">
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Courses Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {courses.map((course) => (
            <div key={course.id} className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    <BookOpen className="h-6 w-6 text-blue-600" />
                    <h3 className="text-lg font-semibold text-gray-900">{course.title}</h3>
                  </div>
                  {user?.role === "admin" && (
                    <div className="flex space-x-2">
                      <button
                        onClick={() => startEdit(course)}
                        className="text-blue-600 hover:text-blue-800"
                        type="button"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(course.id)}
                        className="text-red-600 hover:text-red-800"
                        type="button"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  )}
                </div>

                <p className="text-gray-600 mb-4">{course.description}</p>

                {/* Course Details */}
                <div className="space-y-3 mb-4">
                  <div className="flex items-center space-x-2 text-sm text-gray-500">
                    <Clock className="h-4 w-4" />
                    <span>{course.schedule}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-gray-500">
                    <Calendar className="h-4 w-4" />
                    <span>
                      {formatDate(course.start_date)} - {formatDate(course.end_date)}
                    </span>
                  </div>
                </div>

                {/* Sessions */}
                {course.sessions && course.sessions.length > 0 && (
                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                      <Users className="h-4 w-4 mr-1" />
                      Sessions
                    </h4>
                    <div className="space-y-2">
                      {course.sessions.map((session) => (
                        <div key={session.id} className="flex items-center justify-between p-2 bg-gray-50 rounded-md">
                          <div className="flex items-center space-x-2">
                            <span
                              className={`px-2 py-1 text-xs font-medium rounded-full ${getSessionStatusColor(
                                session.status,
                              )}`}
                            >
                              {session.status}
                            </span>
                          </div>
                          <div className="text-sm text-gray-600">
                            {formatTime(session.start_time)} - {formatTime(session.end_time)}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Course Metadata */}
                <div className="text-xs text-gray-400 mb-4">
                  <p>Created: {formatDate(course.created_at)}</p>
                  <p>Updated: {formatDate(course.updated_at)}</p>
                </div>

                {/* Updated Enrollment Button for Students */}
                {user?.role === "student" && (
                  <Button
                    onClick={() => handleEnrollClick(course)}
                    loading={enrollmentLoading === course.id}
                    className="w-full"
                    size="sm"
                  >
                    Select Date & Enroll
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>

        {courses.length === 0 && (
          <div className="text-center py-12">
            <BookOpen className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No courses available</h3>
            <p className="mt-1 text-sm text-gray-500">
              {user?.role === "admin" ? "Get started by creating a new course." : "Check back later for new courses."}
            </p>
          </div>
        )}
      </div>
    </Layout>
  )
}

export default DashboardPage
