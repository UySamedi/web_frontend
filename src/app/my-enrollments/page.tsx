'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import Layout from '@/components/Layout';
import { Enrollment, enrollmentsAPI } from '@/lib/api';
import { BookOpen, Clock, CheckCircle, XCircle, User } from 'lucide-react';
import Badge from '@/components/ui/Badge';

const MyEnrollmentsPage: React.FC = () => {
  const { user } = useAuth();
  const router = useRouter();
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [loading, setLoading] = useState(true);

  // Redirect non-student users
  useEffect(() => {
    if (user && user.role !== 'student') {
      router.push('/dashboard');
    }
  }, [user, router]);

  useEffect(() => {
    if (user?.role === 'student') {
      fetchMyEnrollments();
    }
  }, [user]);

  const fetchMyEnrollments = async () => {
    try {
      // Note: This would need a specific endpoint for student's own enrollments
      // For now, we'll use the general endpoint and filter client-side
      const data = await enrollmentsAPI.myEnrollments();
      const myEnrollments = data.filter(enrollment => enrollment.user_id === user?.id);
      setEnrollments(myEnrollments);
    } catch (error) {
      console.error('Failed to fetch enrollments:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-5 w-5 text-yellow-500" />;
      case 'approved':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'rejected':
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Clock className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusVariant = (status: string): 'success' | 'warning' | 'danger' | 'default' => {
    switch (status) {
      case 'approved':
        return 'success';
      case 'pending':
        return 'warning';
      case 'rejected':
        return 'danger';
      default:
        return 'default';
    }
  };

  if (user?.role !== 'student') {
    return (
      <Layout>
        <div className="text-center py-12">
          <XCircle className="mx-auto h-12 w-12 text-red-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">Access Denied</h3>
          <p className="mt-1 text-sm text-gray-500">
            This page is only available for students.
          </p>
        </div>
      </Layout>
    );
  }

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
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-4">
            <User className="h-8 w-8 text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-900">My Enrollments</h1>
          </div>
          <p className="text-gray-600">
            Track the status of your course enrollment requests
          </p>
        </div>

        {/* Enrollments List */}
        {enrollments.length === 0 ? (
          <div className="text-center py-12">
            <BookOpen className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No enrollments yet</h3>
            <p className="mt-1 text-sm text-gray-500">
              You haven't enrolled in any courses yet. Visit the dashboard to browse available courses.
            </p>
            <div className="mt-6">
              <a
                href="/dashboard"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Browse Courses
              </a>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {enrollments.map((enrollment) => (
              <div key={enrollment.id} className="bg-white shadow rounded-lg p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0">
                      {getStatusIcon(enrollment.status)}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-medium text-gray-900">
                          {enrollment.course?.title || 'Unknown Course'}
                        </h3>
                        <Badge variant={getStatusVariant(enrollment.status)}>
                          {enrollment.status.charAt(0).toUpperCase() + enrollment.status.slice(1)}
                        </Badge>
                      </div>
                      
                      {enrollment.course?.description && (
                        <p className="text-gray-600 mb-3">
                          {enrollment.course.description}
                        </p>
                      )}
                      
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        {enrollment.course?.schedule && (
                          <div className="flex items-center space-x-1">
                            <Clock className="h-4 w-4" />
                            <span>Schedule: {enrollment.course.schedule}</span>
                          </div>
                        )}
                        <div>
                          Enrolled: {new Date(enrollment.created_at).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Status Message */}
                <div className="mt-4 p-3 rounded-md bg-gray-50">
                  <p className="text-sm text-gray-700">
                    {enrollment.status === 'pending' && (
                      <>
                        <strong>Status:</strong> Your enrollment request is pending review by an administrator.
                      </>
                    )}
                    {enrollment.status === 'approved' && (
                      <>
                        <strong>Congratulations!</strong> Your enrollment has been approved. You are now enrolled in this course.
                      </>
                    )}
                    {enrollment.status === 'rejected' && (
                      <>
                        <strong>Sorry,</strong> your enrollment request has been rejected. Please contact the administrator for more information.
                      </>
                    )}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Summary */}
        {enrollments.length > 0 && (
          <div className="mt-8 bg-blue-50 border border-blue-200 rounded-md p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <BookOpen className="h-5 w-5 text-blue-400" />
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-blue-800">
                  Enrollment Summary
                </h3>
                <div className="mt-2 text-sm text-blue-700">
                  <p>
                    Total enrollments: {enrollments.length} / 3 (maximum allowed)
                  </p>
                  <div className="mt-1 space-x-4">
                    <span>Pending: {enrollments.filter(e => e.status === 'pending').length}</span>
                    <span>Approved: {enrollments.filter(e => e.status === 'approved').length}</span>
                    <span>Rejected: {enrollments.filter(e => e.status === 'rejected').length}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default MyEnrollmentsPage;

