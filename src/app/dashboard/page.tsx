'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import Layout from '@/components/Layout';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { Course, coursesAPI, enrollmentsAPI, CourseData } from '@/lib/api';
import { Plus, Edit, Trash2, BookOpen, Clock } from 'lucide-react';

const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [formData, setFormData] = useState<CourseData>({
    title: '',
    description: '',
    schedule: '',
  });
  const [enrollmentLoading, setEnrollmentLoading] = useState<number | null>(null);

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      const data = await coursesAPI.getAll();
      setCourses(data);
    } catch (error) {
      console.error('Failed to fetch courses:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingCourse) {
        await coursesAPI.update(editingCourse.id, formData);
      } else {
        await coursesAPI.create(formData);
      }
      await fetchCourses();
      resetForm();
    } catch (error) {
      console.error('Failed to save course:', error);
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm('Are you sure you want to delete this course?')) {
      try {
        await coursesAPI.delete(id);
        await fetchCourses();
      } catch (error) {
        console.error('Failed to delete course:', error);
      }
    }
  };

  const handleEnroll = async (courseId: number) => {
    setEnrollmentLoading(courseId);
    try {
      await enrollmentsAPI.enroll(courseId);
      alert('Enrollment request submitted! Waiting for admin approval.');
    } catch (error: unknown) {
      alert((error as any)?.response?.data?.message || 'Enrollment failed');
    } finally {
      setEnrollmentLoading(null);
    }
  };

  const resetForm = () => {
    setFormData({ title: '', description: '', schedule: '' });
    setShowCreateForm(false);
    setEditingCourse(null);
  };

  const startEdit = (course: Course) => {
    setFormData({
      title: course.title,
      description: course.description,
      schedule: course.schedule,
    });
    setEditingCourse(course);
    setShowCreateForm(true);
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="px-4 sm:px-0">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {user?.role === 'admin' ? 'Course Management' : 'Available Courses'}
            </h1>
            <p className="mt-2 text-gray-600">
              {user?.role === 'admin' 
                ? 'Manage courses and enrollments' 
                : 'Browse and enroll in courses (maximum 3 courses)'}
            </p>
          </div>
          
          {user?.role === 'admin' && (
            <Button
              onClick={() => setShowCreateForm(true)}
              className="flex items-center space-x-2"
            >
              <Plus className="h-5 w-5" />
              <span>Add Course</span>
            </Button>
          )}
        </div>

        {/* Create/Edit Form */}
        {showCreateForm && user?.role === 'admin' && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h2 className="text-xl font-semibold mb-4">
              {editingCourse ? 'Edit Course' : 'Create New Course'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="Course Title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
                placeholder="e.g., Mathematics 101"
              />
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  required
                  rows={3}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="Course description..."
                />
              </div>
              
              <Input
                label="Schedule"
                value={formData.schedule}
                onChange={(e) => setFormData({ ...formData, schedule: e.target.value })}
                required
                placeholder="e.g., Mon-Wed 9AM-11AM"
              />
              
              <div className="flex space-x-3">
                <Button type="submit">
                  {editingCourse ? 'Update Course' : 'Create Course'}
                </Button>
                <Button type="button" variant="outline" onClick={resetForm}>
                  Cancel
                </Button>
              </div>
            </form>
          </div>
        )}

        {/* Courses Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course) => (
            <div key={course.id} className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    <BookOpen className="h-6 w-6 text-blue-600" />
                    <h3 className="text-lg font-semibold text-gray-900">{course.title}</h3>
                  </div>
                  
                  {user?.role === 'admin' && (
                    <div className="flex space-x-2">
                      <button
                        onClick={() => startEdit(course)}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(course.id)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  )}
                </div>
                
                <p className="text-gray-600 mb-4">{course.description}</p>
                
                <div className="flex items-center space-x-2 text-sm text-gray-500 mb-4">
                  <Clock className="h-4 w-4" />
                  <span>{course.schedule}</span>
                </div>
                
                {user?.role === 'student' && (
                  <Button
                    onClick={() => handleEnroll(course.id)}
                    loading={enrollmentLoading === course.id}
                    className="w-full"
                    size="sm"
                  >
                    Enroll
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
              {user?.role === 'admin' 
                ? 'Get started by creating a new course.' 
                : 'Check back later for new courses.'}
            </p>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default DashboardPage;

