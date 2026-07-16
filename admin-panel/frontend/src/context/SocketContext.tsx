import React, { createContext, useContext, useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from './AuthContext';

interface Notification {
  _id: string;
  title: string;
  message: string;
  type: 'NEW_ORDER' | 'LOW_STOCK' | 'CANCELLED_ORDER' | 'NEW_CUSTOMER' | 'SYSTEM';
  isRead: boolean;
  createdAt: string;
  metadata?: any;
}

interface SocketContextType {
  socket: Socket | null;
  notifications: Notification[];
  unreadCount: number;
  markAllRead: () => Promise<void>;
  triggerToast: (title: string, message: string) => void;
  activeToast: { title: string; message: string } | null;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { token, api } = useAuth();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [activeToast, setActiveToast] = useState<{ title: string; message: string } | null>(null);

  // Load existing notifications
  const fetchNotifications = async () => {
    try {
      const { data } = await api.get('/sync/notifications');
      setNotifications(data);
    } catch (err) {
      console.error('Error fetching notifications:', err);
    }
  };

  useEffect(() => {
    if (token) {
      fetchNotifications();

      // Establish Socket connection
      const socketUrl = import.meta.env.VITE_API_URL 
        ? import.meta.env.VITE_API_URL.replace(/\/api$/, '') 
        : window.location.origin;

      const socketInstance = io(socketUrl, {
        transports: ['websocket'],
      });

      socketInstance.on('connect', () => {
        console.log('⚡ Socket connected to Express server');
      });

      socketInstance.on('notification', (notif: Notification) => {
        setNotifications((prev) => [notif, ...prev]);
        triggerToast(notif.title, notif.message);
      });

      setSocket(socketInstance);

      return () => {
        socketInstance.disconnect();
      };
    } else {
      setSocket(null);
      setNotifications([]);
    }
  }, [token]);

  const triggerToast = (title: string, message: string) => {
    // Play alert sound if wanted
    try {
      const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-600.wav');
      audio.volume = 0.4;
      audio.play().catch(() => {}); // prevent autoplay blocking errors
    } catch (e) {}

    setActiveToast({ title, message });
    setTimeout(() => {
      setActiveToast(null);
    }, 4500);
  };

  const markAllRead = async () => {
    try {
      await api.put('/sync/notifications/read-all');
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch (err) {
      console.error('Error marking notifications read:', err);
    }
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <SocketContext.Provider
      value={{
        socket,
        notifications,
        unreadCount,
        markAllRead,
        triggerToast,
        activeToast,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) throw new Error('useSocket must be used within a SocketProvider');
  return context;
};
