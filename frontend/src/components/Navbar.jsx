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
  } from "@chakra-ui/react";
  import { FaBars, FaBell, FaSignOutAlt } from "react-icons/fa";
  import { useState, useEffect } from 'react';
  import { useNavigate } from 'react-router-dom';
  
  const Navbar = () => {
    const { isOpen, onToggle } = useDisclosure();
    const [userName, setUserName] = useState('');
  
    useEffect(() => {
      // Get user's name from localStorage
      const fullName = localStorage.getItem('fullName');
      setUserName(fullName || 'User');
    }, []);
  
    const handleLogout = () => {
      // Clear all localStorage items
      localStorage.clear();
      // Navigate to login page
      navigate('/');
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
            <Button
              variant="ghost"
              color="gray.500"
              position="relative"
              p="0"
            >
              <FaBell />
              <Box
                position="absolute"
                top="0"
                right="0"
                h="2"
                w="2"
                bg="red.400"
                rounded="full"
              />
            </Button>
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