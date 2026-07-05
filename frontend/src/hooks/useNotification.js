import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  fetchNotifications, 
  markAsRead, 
  markAllAsRead 
} from '../store/slices/notificationSlice';
import { toast } from 'react-toastify';

export const useNotification = () => {
  const dispatch = useDispatch();
  const { notifications, unreadCount, isLoading } = useSelector((state) => state.notifications);
  const [showNotifications, setShowNotifications] = useState(false);

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = () => {
    dispatch(fetchNotifications());
  };

  const markAsReadHandler = async (notificationId) => {
    await dispatch(markAsRead(notificationId));
    loadNotifications();
  };

  const markAllAsReadHandler = async () => {
    await dispatch(markAllAsRead());
    loadNotifications();
  };

  const getUnreadNotifications = () => {
    return notifications.filter(n => !n.isRead);
  };

  const getReadNotifications = () => {
    return notifications.filter(n => n.isRead);
  };

  const getNotificationsByType = (type) => {
    return notifications.filter(n => n.type === type);
  };

  const showToastNotification = (notification) => {
    const typeMap = {
      task_assigned: 'info',
      task_due: 'warning',
      task_completed: 'success'
    };
    
    toast[typeMap[notification.type] || 'info'](notification.message, {
      onClick: () => {
        setShowNotifications(true);
      }
    });
  };

  const toggleNotifications = () => {
    setShowNotifications(!showNotifications);
  };

  const getRecentNotifications = (limit = 5) => {
    return notifications.slice(0, limit);
  };

  return {
    notifications,
    unreadCount,
    isLoading,
    showNotifications,
    setShowNotifications,
    loadNotifications,
    markAsRead: markAsReadHandler,
    markAllAsRead: markAllAsReadHandler,
    getUnreadNotifications,
    getReadNotifications,
    getNotificationsByType,
    showToastNotification,
    toggleNotifications,
    getRecentNotifications
  };
};

export default useNotification;