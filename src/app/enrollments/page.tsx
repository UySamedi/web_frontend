'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import Layout from '@/components/Layout';
import Button from '@/components/ui/Button';
import { Enrollment, enrollmentsAPI } from '@/lib/api';
import { UserCheck, Clock, CheckCircle, XCircle, User, BookOpen, Calendar } from 'lucide-react';

const EnrollmentsPage: React.FC = () => {
  const { user } = useAuth();
  const router = useRouter();

  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');

  // Redirect non-admin users away
  useEffect(() => {
    if (user && user.role !== 'admin') {
      router.push('/dashboard');
    }
  }, [user, router]);

  // Fetch enrollments when user is admin
  useEffect(() => {
    if (user?.role === 'admin') {
      fetchEnrollments();
    }
  }, [user]);

  const fetchEnrollments = async () => {
    setLoading(true);
    try {
      const data = await enrollmentsAPI.getAll();
      setEnrollments(data);
    } catch (error) {
      console.error('Failed to fetch enrollments:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (enrollmentId: number) => {
    setActionLoading(enrollmentId);
    try {
      await enrollmentsAPI.approve(enrollmentId);
      await fetchEnrollments(); // refresh list
    } catch (error) {
      console.error('Failed to approve enrollment:', error);
      alert('Failed to approve enrollment');
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (enrollmentId: number) => {
    setActionLoading(enrollmentId);
    try {
      await enrollmentsAPI.reject(enrollmentId);
      await fetchEnrollments(); // refresh list
    } catch (error) {
      console.error('Failed to reject enrollment:', error);
      alert('Failed to reject enrollment');
    } finally {
      setActionLoading(null);
    }
  };

  // Icons for statuses
  const getStatusIcon = (status: Enrollment['status']) => {
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

  // Badge classes for statuses
  const getStatusBadge = (status: Enrollment['status']) => {
    const base = "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium";
    switch (status) {
      case 'pending': return `${base} bg-yellow-100 text-yellow-800`;
      case 'approved': return `${base} bg-green-100 text-green-800`;
      case 'rejected': return `${base} bg-red-100 text-red-800`;
      default: return `${base} bg-gray-100 text-gray-800`;
    }
  };

  // Filter enrollments based on filter state
  const filteredEnrollments = enrollments.filter(e => filter === 'all' || e.status === filter);

  // Status counts for tabs
  const statusCounts = {
    all: enrollments.length,
    pending: enrollments.filter(e => e.status === 'pending').length,
    approved: enrollments.filter(e => e.status === 'approved').length,
    rejected: enrollments.filter(e => e.status === 'rejected').length,
  };

  // Access control fallback UI
  if (user?.role !== 'admin') {
    return (
      <Layout>
        <div className="text-center py-12">
          <XCircle className="mx-auto h-12 w-12 text-red-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">Access Denied</h3>
          <p className="mt-1 text-sm text-gray-500">
            You don't have permission to access this page.
          </p>
        </div>
      </Layout>
    );
  }

  // Loading state UI
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
            <UserCheck className="h-8 w-8 text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-900">Enrollment Management</h1>
          </div>
          <p className="text-gray-600">
            Manage student enrollments - approve or reject enrollment requests
          </p>
        </div>

        {/* Status filter tabs */}
        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              {[
                { key: 'all', label: 'All', count: statusCounts.all },
                { key: 'pending', label: 'Pending', count: statusCounts.pending },
                { key: 'approved', label: 'Approved', count: statusCounts.approved },
                { key: 'rejected', label: 'Rejected', count: statusCounts.rejected },
              ].map(({ key, label, count }) => (
                <button
                  key={key}
                  onClick={() => setFilter(key as any)}
                  className={`whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm flex items-center space-x-2
                    ${filter === key
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                >
                  <span>{label}</span>
                  <span className={`${filter === key ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'
                    } inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none rounded-full`}>
                    {count}
                  </span>
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Enrollment list or empty state */}
        {filteredEnrollments.length === 0 ? (
          <div className="text-center py-12">
            <UserCheck className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No enrollments found</h3>
            <p className="mt-1 text-sm text-gray-500">
              {filter === 'all'
                ? 'No enrollment requests have been submitted yet.'
                : `No ${filter} enrollments found.`}
            </p>
          </div>
        ) : (
          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            <ul className="divide-y divide-gray-200">
              {filteredEnrollments.map(enrollment => (
                <li key={enrollment.id} className="px-6 py-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="flex-shrink-0">{getStatusIcon(enrollment.status)}</div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-3 mb-2">
                          <div className="flex items-center space-x-2">
                            <User className="h-4 w-4 text-gray-400" />
                            <p className="text-sm font-medium text-gray-900">
                              {enrollment.user?.name ?? 'Unknown User'}
                            </p>
                          </div>
                          <span className={getStatusBadge(enrollment.status)}>
                            {enrollment.status.charAt(0).toUpperCase() + enrollment.status.slice(1)}
                          </span>
                        </div>

                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          <div className="flex items-center space-x-1">
                            <BookOpen className="h-4 w-4" />
                            <span>{enrollment.course?.title ?? 'Unknown Course'}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Calendar className="h-4 w-4" />
                            <span>{new Date(enrollment.created_at).toLocaleDateString()}</span>
                          </div>
                        </div>

                        {enrollment.course?.description && (
                          <p className="mt-1 text-sm text-gray-600 break-words">
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
                    {/* Empty space for layout balance or you can add extra details */}
                  </div>

                  {/* Approve / Reject buttons */}
                  {enrollment.status === 'pending' && (
                    <div className="flex items-center space-x-2 ml-8 mt-2">
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
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default EnrollmentsPage;
