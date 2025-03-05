import { createContext, useState, useContext, useEffect } from 'react';

// Create the context
const NotificationContext = createContext();

// Create a provider component
export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  
  // Load notifications from localStorage on component mount
  useEffect(() => {
    const storedNotifications = JSON.parse(localStorage.getItem('notifications') || '[]');
    // Sort by timestamp if available (newest first)
    const sortedNotifications = storedNotifications.sort((a, b) => {
      return new Date(b.timestamp || 0) - new Date(a.timestamp || 0);
    });
    setNotifications(sortedNotifications);
  }, []);
  
  // Add a new notification
  const addNotification = (message, type = 'info') => {
    // Generate a more unique ID by combining timestamp with a random string
    const id = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    // Check if a similar notification already exists to prevent duplicates
    const existingSimilar = notifications.find(n => 
      n.message === message && 
      n.type === type && 
      // Only consider notifications from the last minute as potential duplicates
      (new Date() - new Date(n.timestamp)) < 60000
    );
    
    // If a similar notification exists, don't add a new one
    if (existingSimilar) {
      return existingSimilar.id;
    }
    
    const newNotification = {
      id,
      message,
      type,
      read: false,
      timestamp: new Date().toISOString(),
      // Add a processed flag to track notifications across sessions
      processed: false
    };
    
    // Update state
    setNotifications(prev => [newNotification, ...prev]);
    
    // Update localStorage
    const storedNotifications = JSON.parse(localStorage.getItem('notifications') || '[]');
    const updatedNotifications = [newNotification, ...storedNotifications]
      .slice(0, 20) // Keep only last 20 notifications
      // Filter out possible duplicates based on message and timestamp
      .filter((notif, index, self) => 
        index === self.findIndex(n => n.message === notif.message && 
          Math.abs(new Date(n.timestamp) - new Date(notif.timestamp)) < 1000)
      );
    
    localStorage.setItem('notifications', JSON.stringify(updatedNotifications));
    
    return id;
  };
  
  // Mark notification as read
  const markAsRead = (id) => {
    // Update state
    setNotifications(prev =>
      prev.map(notif => notif.id === id ? { ...notif, read: true } : notif)
    );
    
    // Update localStorage - make sure we're getting the latest from localStorage
    const storedNotifications = JSON.parse(localStorage.getItem('notifications') || '[]');
    const updatedNotifications = storedNotifications.map(notif => 
      notif.id === id ? { ...notif, read: true } : notif
    );
    localStorage.setItem('notifications', JSON.stringify(updatedNotifications));
  };
  
  // Mark notification as processed (will not show again after logout/login)
  const markAsProcessed = (id) => {
    // Update state
    setNotifications(prev =>
      prev.map(notif => notif.id === id ? { ...notif, processed: true } : notif)
    );
    
    // Update localStorage
    const storedNotifications = JSON.parse(localStorage.getItem('notifications') || '[]');
    const updatedNotifications = storedNotifications.map(notif => 
      notif.id === id ? { ...notif, processed: true } : notif
    );
    localStorage.setItem('notifications', JSON.stringify(updatedNotifications));
  };
  
  // Mark all as read
  const markAllAsRead = () => {
    // Update state
    setNotifications(prev =>
      prev.map(notif => ({ ...notif, read: true }))
    );
    
    // Update localStorage - make sure we're getting the latest from localStorage
    const storedNotifications = JSON.parse(localStorage.getItem('notifications') || '[]');
    const updatedNotifications = storedNotifications.map(notif => ({ ...notif, read: true }));
    localStorage.setItem('notifications', JSON.stringify(updatedNotifications));
  };
  
  // Mark all as processed
  const markAllAsProcessed = () => {
    // Update state
    setNotifications(prev =>
      prev.map(notif => ({ ...notif, processed: true }))
    );
    
    // Update localStorage
    const storedNotifications = JSON.parse(localStorage.getItem('notifications') || '[]');
    const updatedNotifications = storedNotifications.map(notif => ({ ...notif, processed: true }));
    localStorage.setItem('notifications', JSON.stringify(updatedNotifications));
  };
  
  // Remove a notification
  const removeNotification = (id) => {
    // Instead of deleting, mark as processed
    markAsProcessed(id);
    
    // Then remove from current view
    setNotifications(prev => prev.filter(notif => notif.id !== id));
    
    // In localStorage, we mark as processed but keep the record
    const storedNotifications = JSON.parse(localStorage.getItem('notifications') || '[]');
    const updatedNotifications = storedNotifications.map(notif => 
      notif.id === id ? { ...notif, processed: true } : notif
    );
    localStorage.setItem('notifications', JSON.stringify(updatedNotifications));
  };
  
  // Clear all notifications
  const clearAllNotifications = () => {
    // Mark all as processed instead of deleting
    markAllAsProcessed();
    
    // Remove from current view
    setNotifications([]);
    
    // In localStorage, we mark all as processed but keep the records
    const storedNotifications = JSON.parse(localStorage.getItem('notifications') || '[]');
    const updatedNotifications = storedNotifications.map(notif => ({ ...notif, processed: true }));
    localStorage.setItem('notifications', JSON.stringify(updatedNotifications));
  };

  return (
    <NotificationContext.Provider value={{
      notifications,
      addNotification,
      markAsRead,
      markAllAsRead,
      removeNotification,
      clearAllNotifications,
      unreadCount: notifications.filter(n => !n.read).length
    }}>
      {children}
    </NotificationContext.Provider>
  );
};

// Custom hook for using notifications
export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

export default NotificationContext;