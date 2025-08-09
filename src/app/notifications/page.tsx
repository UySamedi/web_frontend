'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import Layout from '@/components/Layout';
import axios from 'axios';

interface Notification {
  id: string;
  data: {
    status: string;
    course: string;
    message: string;
  };
  read_at: string | null;
  created_at: string;
}

const NotificationsPage: React.FC = () => {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      router.replace('/login');
    }

    if (user && user.role !== 'student') {
      router.replace('/dashboard');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user?.role === 'student') {
      fetchNotifications();
    }
  }, [user]);

  const fetchNotifications = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('/api/notifications', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNotifications(res.data);
    } catch (err) {
      console.error('Failed to fetch notifications:', err);
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || loading) {
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
        <h1 className="text-3xl font-bold mb-6">Notifications</h1>
        {notifications.length === 0 ? (
          <p>No notifications yet.</p>
        ) : (
          <ul className="space-y-4">
            {notifications.map((n) => (
              <li key={n.id} className={`p-4 border rounded-md ${n.read_at ? 'bg-gray-100' : 'bg-white'}`}>
                <p>{n.data.message}</p>
                <small className="text-gray-500">{new Date(n.created_at).toLocaleString()}</small>
              </li>
            ))}
          </ul>
        )}
      </div>
    </Layout>
  );
};

export default NotificationsPage;
