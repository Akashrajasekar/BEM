import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Box, 
  VStack, 
  Image, 
  Link, 
  Icon, 
  Flex, 
  IconButton 
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

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  const handleNavigation = (path) => {
    navigate(path);
    setIsOpen(false); // Close sidebar on mobile after navigation
  }; 
  const menuItems = [
    { icon: FaHome, text: "Dashboard", path: "/employee", active: true },
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
        bg="white"
        borderRight="1px"
        borderColor="gray.200"
        position="fixed"
        h="100vh"
        zIndex="999"
      >
        <Box p="6">
          <Image 
            h="8" 
            src="https://ai-public.creatie.ai/gen_page/logo_placeholder.png" 
            alt="Logo"
          />
        </Box>
        
        <VStack spacing="1" px="4" flex="1">
          {menuItems.map((item) => (
            <Link
              as={RouterLink}
              key={item.text}
              to={item.path}
              w="full"
              display="flex"
              alignItems="center"
              px="4"
              py="3"
              rounded="lg"
              fontSize="sm"
              fontWeight="medium"
              color={item.active ? "orange.600" : "gray.600"}
              bg={item.active ? "orange.100" : "transparent"}
              _hover={{ bg: item.active ? "orange.100" : "gray.50" }}
              onClick={() => handleNavigation(item.path)}
            >
              <Icon as={item.icon} w="5" h="5" mr="3" />
              {item.text}
            </Link>
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