import React, { useState,useEffect } from 'react';
import { useToast } from '@chakra-ui/react';
import { useNotifications } from './NotificationContext';

const AuthenticationCheck = () => {
  const [apiUrl, setApiUrl] = useState('http://localhost:5000');
  const toast = useToast();
  const { addNotification } = useNotifications();
  
  useEffect(() => {
    const checkForNotifications = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return; // Not logged in
        
        const response = await fetch(`${apiUrl}/api/auth/expenses`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch expenses');
        }

        const data = await response.json();
        
        // Check for newly approved expenses
        const lastCheckTime = localStorage.getItem('lastNotificationCheck') 
          ? new Date(localStorage.getItem('lastNotificationCheck')) 
          : new Date(0);
        
        // Get notifications from localStorage to check which ones are already processed
        const storedNotifications = JSON.parse(localStorage.getItem('notifications') || '[]');
        
        // Find newly approved expenses since last check
        const newlyApproved = data.filter(expense => 
          expense.approvalStatus === 'Approved' && 
          expense.submissionStatus === 'Submitted' &&
          new Date(expense.updatedAt) > lastCheckTime &&
          // Check if notification about this expense has already been processed
          !storedNotifications.some(n => 
            n.message.includes(expense.merchant) && 
            n.message.includes(expense.amount.toFixed(2)) && 
            n.type === 'success' && 
            n.processed === true
          )
        );
        
        // Find newly rejected expenses
        const newlyRejected = data.filter(expense => 
          expense.approvalStatus === 'Rejected' && 
          expense.submissionStatus === 'Submitted' &&
          new Date(expense.updatedAt) > lastCheckTime &&
          // Check if notification about this expense has already been processed
          !storedNotifications.some(n => 
            n.message.includes(expense.merchant) && 
            n.message.includes(expense.amount.toFixed(2)) && 
            n.type === 'error' && 
            n.processed === true
          )
        );
        
        // Send notifications for approved expenses
        newlyApproved.forEach(expense => {
          addNotification(
            `Expense for ${expense.merchant} (${expense.currency} ${expense.amount.toFixed(2)}) has been approved!`,
            'success'
          );
        });
        
        // Send notifications for rejected expenses
        newlyRejected.forEach(expense => {
          addNotification(
            `Expense for ${expense.merchant} (${expense.currency} ${expense.amount.toFixed(2)}) has been rejected: ${expense.reasonForRejection || 'No reason provided'}.`,
            'error'
          );
        });
        
        // Update last check time
        localStorage.setItem('lastNotificationCheck', new Date().toISOString());
        
      } catch (error) {
        console.error('Failed to check for notifications:', error);
      }
    };

    // Check for notifications immediately when component loads
    checkForNotifications();
    
    // Set up interval to periodically check for new notifications
    const interval = setInterval(checkForNotifications, 60000); // Check every minute
    
    return () => clearInterval(interval);
  }, [addNotification, toast]);

  // This component doesn't render anything visible
  return null;
};

export default AuthenticationCheck;