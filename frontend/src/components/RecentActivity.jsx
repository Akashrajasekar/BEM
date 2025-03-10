import { useState, useEffect } from 'react';
import { Box, VStack, HStack, Text, Heading, Icon, Spinner, Center } from "@chakra-ui/react";
import { 
  FaReceipt, 
  FaCheckCircle, 
  FaFileAlt, 
  FaPaperPlane, 
  FaTimes,
  FaExclamationTriangle,
  FaMoneyBillWave
} from "react-icons/fa";
import axios from 'axios';

const RecentActivity = () => {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRecentActivity = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        
        // Fetch recent expenses from the backend
        const response = await axios.get('http://localhost:5000/api/auth/expenses', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        // Process the data into activity format
        const processedActivities = processExpenses(response.data);
        setActivities(processedActivities);
      } catch (err) {
        console.error('Error fetching recent activity:', err);
        setError('Failed to load recent activity');
      } finally {
        setLoading(false);
      }
    };

    fetchRecentActivity();
    
    // Optional: Refresh activity periodically
    const intervalId = setInterval(fetchRecentActivity, 60000);
    return () => clearInterval(intervalId);
  }, []);

  // Process expenses into activity items
  const processExpenses = (expenses) => {
    // Get start of current day
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    return expenses
      // Filter for today's activities only
      .filter(expense => {
        const activityDate = new Date(expense.updatedAt || expense.createdAt);
        return activityDate >= today;
      })
      .sort((a, b) => new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt))
      .map(expense => {
        const details = getActivityDetails(expense);
        return {
          id: expense._id,
          icon: getIconComponent(details.icon),
          color: details.color,
          title: details.title,
          time: getRelativeTime(expense.updatedAt || expense.createdAt)
        };
      })
      .slice(0, 15); // Show more activities since we have scrolling
  };

  // Get the appropriate icon component
  const getIconComponent = (iconName) => {
    switch (iconName) {
      case 'FaReceipt': return FaReceipt;
      case 'FaCheckCircle': return FaCheckCircle;
      case 'FaFileAlt': return FaFileAlt;
      case 'FaPaperPlane': return FaPaperPlane;
      case 'FaTimes': return FaTimes;
      case 'FaExclamationTriangle': return FaExclamationTriangle;
      case 'FaMoneyBillWave': return FaMoneyBillWave;
      default: return FaFileAlt;
    }
  };

  // Function to determine appropriate icon and color based on activity type
  const getActivityDetails = (expense) => {
    if (expense.receiptUrl && expense.submissionStatus === 'Draft') {
      return {
        icon: 'FaReceipt',
        color: 'orange.500',
        title: `Receipt uploaded for ${expense.category}`
      };
    } else if (expense.submissionStatus === 'Submitted' && expense.approvalStatus === 'Pending') {
      return {
        icon: 'FaPaperPlane',
        color: 'blue.500',
        title: `${expense.category} expense submitted`
      };
    } else if (expense.approvalStatus === 'Approved') {
      return {
        icon: 'FaCheckCircle',
        color: 'green.500',
        title: `${expense.category} expense approved`
      };
    } else if (expense.approvalStatus === 'Rejected') {
      return {
        icon: 'FaTimes',
        color: 'red.500',
        title: `${expense.category} expense rejected`
      };
    } else if (expense.approvalStatus === 'AutoFlagged') {
      return {
        icon: 'FaExclamationTriangle',
        color: 'yellow.500',
        title: `${expense.category} expense flagged for review`
      };
    } else if (expense.submissionStatus === 'Draft') {
      return {
        icon: 'FaFileAlt',
        color: 'gray.400',
        title: `${expense.category} expense draft created`
      };
    } else {
      return {
        icon: 'FaMoneyBillWave',
        color: 'purple.500',
        title: `${expense.category} expense updated`
      };
    }
  };

  // Function to format relative time
  const getRelativeTime = (timestamp) => {
    const now = new Date();
    const activityTime = new Date(timestamp);
    const diffInHours = Math.floor((now - activityTime) / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInHours / 24);
    
    if (diffInHours < 1) {
      const diffInMinutes = Math.floor((now - activityTime) / (1000 * 60));
      return `${diffInMinutes} ${diffInMinutes === 1 ? 'minute' : 'minutes'} ago`;
    } else if (diffInHours < 24) {
      return `${diffInHours} ${diffInHours === 1 ? 'hour' : 'hours'} ago`;
    } else if (diffInDays === 1) {
      return 'Yesterday';
    } else if (diffInDays < 7) {
      return `${diffInDays} days ago`;
    } else {
      return activityTime.toLocaleDateString();
    }
  };

  // For loading state, match the exact original size
  if (loading) {
    return (
      <Box bg="white" rounded="lg" shadow="base" p={6}>
        <Heading size="md" mb={6}>Recent Activity</Heading>
        <Center minH="120px">
          <Spinner size="md" color="orange.500" />
        </Center>
      </Box>
    );
  }

  // For error state, match the exact original size
  if (error) {
    return (
      <Box bg="white" rounded="lg" shadow="base" p={6}>
        <Heading size="md" mb={6}>Recent Activity</Heading>
        <Box minH="120px" display="flex" alignItems="center">
          <Text color="red.500">{error}</Text>
        </Box>
      </Box>
    );
  }

  // Main component view - maintains original structure with scrolling
  return (
    <Box bg="white" rounded="lg" shadow="base" p={6}>
      <Heading size="md" mb={6}>Recent Activity</Heading>
      <Box 
        maxH="170px" 
        overflowY="auto"
        pr={2}
        css={{
          '&::-webkit-scrollbar': {
            width: '4px',
          },
          '&::-webkit-scrollbar-track': {
            width: '4px',
            background: '#f1f1f1',
          },
          '&::-webkit-scrollbar-thumb': {
            background: '#cccccc',
            borderRadius: '4px',
          },
          '&::-webkit-scrollbar-thumb:hover': {
            background: '#aaaaaa',
          },
          // Firefox scrollbar styling
          'scrollbarWidth': 'thin',
          'scrollbarColor': '#cccccc #f1f1f1',
        }}
      >
        <VStack spacing={4} align="stretch">
          {activities.length === 0 ? (
            <Text color="gray.500">No activity recorded today</Text>
          ) : (
            activities.map((activity, index) => (
              <HStack key={index} spacing={4}>
                <Icon as={activity.icon} w={5} h={5} color={activity.color} />
                <Box>
                  <Text fontWeight="medium" color="gray.700">
                    {activity.title}
                  </Text>
                  <Text fontSize="sm" color="gray.500">
                    {activity.time}
                  </Text>
                </Box>
              </HStack>
            ))
          )}
        </VStack>
      </Box>
    </Box>
  );
};

export default RecentActivity;