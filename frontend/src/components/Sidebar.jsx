import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
  VStack,
  Image,
  Button,
  Icon,
  Flex,
  IconButton,
  useColorModeValue
} from "@chakra-ui/react";
import {
  FaHome,
  FaPlusCircle,
  FaFileAlt,
  FaReceipt,
  FaCog,
  FaBars,
  FaTimes
} from "react-icons/fa";
import { Link as RouterLink } from "react-router-dom";
import logoImage from '../assets/Logo.png';

const Sidebar = () => {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  const handleNavigation = (path) => {
    navigate(path);
    setIsOpen(false); // Close sidebar on mobile after navigation
  };

  const menuItems = [
    { icon: FaHome, text: "Dashboard", path: "/employee" },
    { icon: FaPlusCircle, text: "Create Expense", path: "/manual_expense" },
    { icon: FaFileAlt, text: "My Reports", path: "/report" },
    { icon: FaReceipt, text: "Expenses", path: "/draft" },
    { icon: FaCog, text: "Settings", path: "/settings" },
  ];

  const toggleSidebar = () => setIsOpen(!isOpen);

  return (
    <>
      {/* Mobile Menu Toggle Button */}
      <IconButton
        icon={isOpen ? <FaTimes /> : <FaBars />}
        display={{ base: 'flex', lg: 'none' }}
        position="fixed"
        top="4"
        left="4"
        zIndex="1000"
        onClick={toggleSidebar}
        aria-label="Toggle Sidebar"
      />

      {/* Sidebar */}
      <Box
        as="aside"
        display={{
          base: isOpen ? 'flex' : 'none',
          lg: 'flex'
        }}
        flexDir="column"
        w={{
          base: "full",
          lg: "64"
        }}
        bg={useColorModeValue('white', 'gray.900')}
        borderRight="1px"
        borderColor={useColorModeValue('gray.200', 'gray.700')}
        position="fixed"
        h="100vh"
        zIndex="999"
      >
        <Flex h="16" alignItems="center" justifyContent="center" borderBottomWidth="1px">
          <Image
            h="12"
            src={logoImage}
            alt="Logo"
          />
        </Flex>

        <VStack spacing="1" align="stretch" px="2" mt="6">
          {menuItems.map((item) => (
            <Button
            key={item.text}
            leftIcon={<Icon as={item.icon} />}
            variant={location.pathname === item.path ? 'solid' : 'ghost'}
            colorScheme={location.pathname === item.path ? 'orange' : 'gray'}
            justifyContent="flex-start"
            size="lg"
            w="full"
            onClick={() => handleNavigation(item.path)}
            _hover={{
              bg: 'orange.500',
              color: 'white'
            }}
          >
            {item.text}
          </Button>
          
          ))}
        </VStack>
      </Box>

      {/* Overlay for mobile when sidebar is open */}
      {isOpen && (
        <Box
          display={{ base: 'block', lg: 'none' }}
          position="fixed"
          top="0"
          left="0"
          right="0"
          bottom="0"
          bg="rgba(0,0,0,0.5)"
          zIndex="998"
          onClick={toggleSidebar}
        />
      )}
    </>
  );
};

export default Sidebar;