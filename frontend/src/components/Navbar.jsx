import { 
  Box, 
  Flex, 
  IconButton, 
  Button, 
  Avatar, 
  Text, 
  useDisclosure, 
  Menu, 
  MenuButton, 
  MenuList, 
  MenuItem,
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverHeader,
  PopoverBody,
  PopoverFooter,
  Badge,
  VStack,
  HStack,
  Divider
} from "@chakra-ui/react";
import { FaBars, FaBell, FaSignOutAlt, FaCheckCircle, FaTimesCircle, FaCheck, FaTrash } from "react-icons/fa";
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNotifications } from './NotificationContext';

const Navbar = () => {
  const { isOpen, onToggle } = useDisclosure();
  const [userName, setUserName] = useState("");
  const navigate = useNavigate();
  const { 
    notifications, 
    unreadCount,
    markAsRead,
    markAllAsRead,
    removeNotification,
    clearAllNotifications
  } = useNotifications();
  
  // Filter out processed notifications
  const activeNotifications = notifications.filter(n => !n.processed);
  const activeUnreadCount = activeNotifications.filter(n => !n.read).length;
  
  useEffect(() => {
    // Get user's name from localStorage
    const fullName = localStorage.getItem('fullName');
    setUserName(fullName || 'User');
  }, []);
  
  const handleLogout = () => {
    // Modified to preserve notification data
    // Get current notifications
    const notificationsData = localStorage.getItem('notifications');
    const lastCheckTime = localStorage.getItem('lastNotificationCheck');
    
    // Clear all localStorage items
    localStorage.clear();
    
    // Restore notification data
    if (notificationsData) {
      localStorage.setItem('notifications', notificationsData);
    }
    if (lastCheckTime) {
      localStorage.setItem('lastNotificationCheck', lastCheckTime);
    }
    
    // Navigate to login page
    navigate('/');
  };
  
  // Format the notification date
  const formatNotificationTime = (timestamp) => {
    if (!timestamp) return '';
    
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);
    
    if (diffMins < 1) return 'just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };
  
  return (
    <Box as="header" bg="white" borderBottom="1px" borderColor="gray.200">
      <Flex
        px={{ base: "4", sm: "6", lg: "8" }}
        h="16"
        alignItems="center"
        justifyContent="space-between"
      >
        <IconButton
          display={{ base: "flex", lg: "none" }}
          onClick={onToggle}
          variant="ghost"
          color="gray.500"
          icon={<FaBars />}
          aria-label="Open menu"
        />
        
        <Flex flex="1" justifyContent="flex-end" alignItems="center" gap="4">
          <Popover placement="bottom-end">
            <PopoverTrigger>
              <Button
                variant="ghost"
                color="gray.500"
                position="relative"
                p="0"
              >
                <FaBell />
                {activeUnreadCount > 0 && (
                  <Badge
                    position="absolute"
                    top="0"
                    right="0"
                    colorScheme="red"
                    borderRadius="full"
                    fontSize="xs"
                    transform="translate(25%, -25%)"
                  >
                    {activeUnreadCount}
                  </Badge>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent width="320px" maxH="400px" overflow="auto">
              <PopoverHeader fontWeight="bold" borderBottomWidth="1px" display="flex" justifyContent="space-between" alignItems="center">
              <Text>Notifications</Text>
              <HStack spacing={2}>
                {activeUnreadCount > 0 && (
                  <Button size="xs" leftIcon={<FaCheck />} onClick={markAllAsRead}>
                    Mark all read
                  </Button>
                )}
                {activeNotifications.length > 0 && (
                  <Button 
                    size="xs" 
                    leftIcon={<FaTrash />} 
                    colorScheme="red" 
                    variant="ghost"
                    onClick={clearAllNotifications}
                  >
                    Clear all
                  </Button>
                )}
              </HStack>
            </PopoverHeader>
              <PopoverBody p={0}>
                {activeNotifications.length === 0 ? (
                  <Box p={4} textAlign="center">
                    <Text color="gray.500">No notifications</Text>
                  </Box>
                ) : (
                  <VStack spacing={0} align="stretch" divider={<Divider />}>
                {activeNotifications.map((notification) => (
                  <Box 
                    key={notification.id} 
                    p={3} 
                    bg={notification.read ? "white" : "gray.50"}
                    _hover={{ bg: "gray.100" }}
                  >
                    <HStack justifyContent="space-between">
                      <HStack flex="1">
                        {notification.type === 'success' && (
                          <Box color="green.500"><FaCheckCircle /></Box>
                        )}
                        {notification.type === 'error' && (
                          <Box color="red.500"><FaTimesCircle /></Box>
                        )}
                        <VStack spacing={0} align="start" flex="1">
                          <Text fontSize="sm">{notification.message}</Text>
                          {notification.timestamp && (
                            <Text fontSize="xs" color="gray.500">
                              {formatNotificationTime(notification.timestamp)}
                            </Text>
                          )}
                        </VStack>
                      </HStack>
                      <HStack spacing={2}>
                        {!notification.read && (
                          <IconButton
                            icon={<FaCheck />}
                            size="xs"
                            aria-label="Mark as read"
                            onClick={() => markAsRead(notification.id)}
                          />
                        )}
                        <IconButton
                          icon={<FaTrash />}
                          size="xs"
                          aria-label="Remove notification"
                          variant="ghost"
                          colorScheme="red"
                          onClick={(e) => {
                            e.stopPropagation();
                            removeNotification(notification.id);
                          }}
                        />
                      </HStack>
                    </HStack>
                  </Box>
                ))}
              </VStack>
                )}
              </PopoverBody>
            </PopoverContent>
          </Popover>
          
          <Menu>
          <MenuButton>
              <Flex alignItems="center" cursor="pointer">
                <Avatar
                  size="sm"
                  src="/api/placeholder/48/48"
                />
                <Text ml="3" fontSize="sm" fontWeight="medium" color="gray.700">
                  {userName}
                </Text>
              </Flex>
            </MenuButton>
            <MenuList>
              <MenuItem icon={<FaSignOutAlt />} onClick={handleLogout}>
                Sign Out
              </MenuItem>
            </MenuList>
        </Menu>

        </Flex>
      </Flex>
    </Box>
  );
};

export default Navbar;