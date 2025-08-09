'use client';

import React, { useState } from 'react';
import Layout from '@/components/Layout';
import Button from '@/components/ui/Button';
import { UserCheck, Clock, CheckCircle, XCircle, User, BookOpen, Calendar } from 'lucide-react';

// Mock data for demonstration
const mockUser = {
  id: 1,
  name: 'Admin User',
  email: 'admin@example.com',
  role: 'admin' as const,
  created_at: '2024-01-01T00:00:00.000Z',
  updated_at: '2024-01-01T00:00:00.000Z',
};

const mockEnrollments = [
  {
    id: 1,
    user_id: 2,
    course_id: 1,
    status: 'pending' as const,
    created_at: '2024-01-15T10:30:00.000Z',
    updated_at: '2024-01-15T10:30:00.000Z',
    user: {
      id: 2,
      name: 'John Smith',
      email: 'john@example.com',
      role: 'student' as const,
      created_at: '2024-01-01T00:00:00.000Z',
      updated_at: '2024-01-01T00:00:00.000Z',
    },
    course: {
      id: 1,
      title: 'Mathematics 101',
      description: 'Introduction to basic mathematical concepts and problem-solving techniques.',
      schedule: 'Mon-Wed-Fri 9:00 AM - 10:30 AM',
      created_at: '2024-01-01T00:00:00.000Z',
      updated_at: '2024-01-01T00:00:00.000Z',
    },
  },
  {
    id: 2,
    user_id: 3,
    course_id: 2,
    status: 'approved' as const,
    created_at: '2024-01-14T14:20:00.000Z',
    updated_at: '2024-01-16T09:15:00.000Z',
    user: {
      id: 3,
      name: 'Sarah Johnson',
      email: 'sarah@example.com',
      role: 'student' as const,
      created_at: '2024-01-01T00:00:00.000Z',
      updated_at: '2024-01-01T00:00:00.000Z',
    },
    course: {
      id: 2,
      title: 'Computer Science Fundamentals',
      description: 'Basic programming concepts, algorithms, and data structures.',
      schedule: 'Tue-Thu 2:00 PM - 4:00 PM',
      created_at: '2024-01-01T00:00:00.000Z',
      updated_at: '2024-01-01T00:00:00.000Z',
    },
  },
  {
    id: 3,
    user_id: 4,
    course_id: 3,
    status: 'rejected' as const,
    created_at: '2024-01-13T16:45:00.000Z',
    updated_at: '2024-01-17T11:30:00.000Z',
    user: {
      id: 4,
      name: 'Mike Davis',
      email: 'mike@example.com',
      role: 'student' as const,
      created_at: '2024-01-01T00:00:00.000Z',
      updated_at: '2024-01-01T00:00:00.000Z',
    },
    course: {
      id: 3,
      title: 'Advanced Physics',
      description: 'Advanced topics in physics including quantum mechanics and relativity.',
      schedule: 'Mon-Wed 1:00 PM - 3:00 PM',
      created_at: '2024-01-01T00:00:00.000Z',
      updated_at: '2024-01-01T00:00:00.000Z',
    },
  },
  {
    id: 4,
    user_id: 5,
    course_id: 1,
    status: 'pending' as const,
    created_at: '2024-01-16T08:15:00.000Z',
    updated_at: '2024-01-16T08:15:00.000Z',
    user: {
      id: 5,
      name: 'Emily Wilson',
      email: 'emily@example.com',
      role: 'student' as const,
      created_at: '2024-01-01T00:00:00.000Z',
      updated_at: '2024-01-01T00:00:00.000Z',
    },
    course: {
      id: 1,
      title: 'Mathematics 101',
      description: 'Introduction to basic mathematical concepts and problem-solving techniques.',
      schedule: 'Mon-Wed-Fri 9:00 AM - 10:30 AM',
      created_at: '2024-01-01T00:00:00.000Z',
      updated_at: '2024-01-01T00:00:00.000Z',
    },
  },
];

// Mock AuthContext
const MockAuthProvider = ({ children }: { children: React.ReactNode }) => {
  return (
    <div>
      {React.cloneElement(children as React.ReactElement, { 
        user: mockUser,
        login: async () => {},
        register: async () => {},
        logout: () => {},
        loading: false 
      } as any)}
    </div>
  );
};

const DemoEnrollmentsPage: React.FC = () => {
  const [enrollments] = useState(mockEnrollments);
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');

  const handleApprove = async (enrollmentId: number) => {
    setActionLoading(enrollmentId);
    // Simulate API call
    setTimeout(() => {
      setActionLoading(null);
      alert('Enrollment approved successfully!');
    }, 1000);
  };

  const handleReject = async (enrollmentId: number) => {
    setActionLoading(enrollmentId);
    // Simulate API call
    setTimeout(() => {
      setActionLoading(null);
      alert('Enrollment rejected successfully!');
    }, 1000);
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

  const getStatusBadge = (status: string) => {
    const baseClasses = "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium";
    switch (status) {
      case 'pending':
        return `${baseClasses} bg-yellow-100 text-yellow-800`;
      case 'approved':
        return `${baseClasses} bg-green-100 text-green-800`;
      case 'rejected':
        return `${baseClasses} bg-red-100 text-red-800`;
      default:
        return `${baseClasses} bg-gray-100 text-gray-800`;
    }
  };

  const filteredEnrollments = enrollments.filter(enrollment => {
    if (filter === 'all') return true;
    return enrollment.status === filter;
  });

  const getStatusCounts = () => {
    return {
      all: enrollments.length,
      pending: enrollments.filter(e => e.status === 'pending').length,
      approved: enrollments.filter(e => e.status === 'approved').length,
      rejected: enrollments.filter(e => e.status === 'rejected').length,
    };
  };

  const statusCounts = getStatusCounts();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <BookOpen className="h-8 w-8 text-blue-600" />
              <span className="ml-2 text-xl font-semibold text-gray-900">
                University Enrollment
              </span>
            </div>
            
            {/* Navigation Links for Admin */}
            <div className="hidden md:flex items-center space-x-8">
              <a
                href="/dashboard"
                className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium"
              >
                Courses
              </a>
              <a
                href="/enrollments"
                className="text-blue-600 bg-blue-50 px-3 py-2 rounded-md text-sm font-medium flex items-center space-x-1"
              >
                <UserCheck className="h-4 w-4" />
                <span>Enrollments</span>
              </a>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <User className="h-5 w-5 text-gray-500" />
                <span className="text-sm text-gray-700">Admin User</span>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  admin
                </span>
              </div>
              
              <Button
                variant="outline"
                size="sm"
                className="flex items-center space-x-1"
              >
                <span>Logout</span>
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 sm:px-0">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center space-x-3 mb-4">
              <UserCheck className="h-8 w-8 text-blue-600" />
              <h1 className="text-3xl font-bold text-gray-900">Enrollment Management</h1>
            </div>
            <p className="text-gray-600">
              Manage student enrollments - approve or reject enrollment requests
            </p>
          </div>

          {/* Status Filter Tabs */}
          <div className="mb-6">
            <div className="border-b border-gray-200">
              <nav className="-mb-px flex space-x-8">
                {[
                  { key: 'all', label: 'All', count: statusCounts.all },
                  { key: 'pending', label: 'Pending', count: statusCounts.pending },
                  { key: 'approved', label: 'Approved', count: statusCounts.approved },
                  { key: 'rejected', label: 'Rejected', count: statusCounts.rejected },
                ].map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => setFilter(tab.key as any)}
                    className={`${
                      filter === tab.key
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    } whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm flex items-center space-x-2`}
                  >
                    <span>{tab.label}</span>
                    <span className={`${
                      filter === tab.key ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'
                    } inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none rounded-full`}>
                      {tab.count}
                    </span>
                  </button>
                ))}
              </nav>
            </div>
          </div>

          {/* Enrollments List */}
          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            <ul className="divide-y divide-gray-200">
              {filteredEnrollments.map((enrollment) => (
                <li key={enrollment.id} className="px-6 py-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="flex-shrink-0">
                        {getStatusIcon(enrollment.status)}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-3 mb-2">
                          <div className="flex items-center space-x-2">
                            <User className="h-4 w-4 text-gray-400" />
                            <p className="text-sm font-medium text-gray-900">
                              {enrollment.user?.name || 'Unknown User'}
                            </p>
                          </div>
                          <span className={getStatusBadge(enrollment.status)}>
                            {enrollment.status.charAt(0).toUpperCase() + enrollment.status.slice(1)}
                          </span>
                        </div>
                        
                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          <div className="flex items-center space-x-1">
                            <BookOpen className="h-4 w-4" />
                            <span>{enrollment.course?.title || 'Unknown Course'}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Calendar className="h-4 w-4" />
                            <span>{new Date(enrollment.created_at).toLocaleDateString()}</span>
                          </div>
                        </div>
                        
                        {enrollment.course?.description && (
                          <p className="mt-1 text-sm text-gray-600 truncate">
                            {enrollment.course.description}
                          </p>
                        )}
                        
                        {enrollment.course?.schedule && (
                          <p className="mt-1 text-sm text-gray-500">
                            Schedule: {enrollment.course.schedule}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Action Buttons */}
                    {enrollment.status === 'pending' && (
                      <div className="flex items-center space-x-2">
                        <Button
                          size="sm"
                          onClick={() => handleApprove(enrollment.id)}
                          loading={actionLoading === enrollment.id}
                          className="bg-green-600 hover:bg-green-700 focus:ring-green-500"
                        >
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="danger"
                          onClick={() => handleReject(enrollment.id)}
                          loading={actionLoading === enrollment.id}
                        >
                          <XCircle className="h-4 w-4 mr-1" />
                          Reject
                        </Button>
                      </div>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </main>
    </div>
  );
};

export default DemoEnrollmentsPage;

