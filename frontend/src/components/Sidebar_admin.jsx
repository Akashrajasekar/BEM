import React from "react";
import {
  Box,
  Flex,
  Icon,
  Image,
  Text,
  Button,
  VStack,
  useColorModeValue,
} from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import {
  FaChartLine,
  FaUsers,
  FaWallet,
  FaFileAlt,
  FaHeadset,
} from "react-icons/fa";
import logoImage from "../assets/logo.png";

const Sidebar_admin = ({ onClose, activePage }) => {
  const navigate = useNavigate();

  const navItems = [
    {
      icon: FaChartLine,
      text: "Dashboard",
      active: activePage === "admin",
      path: "/admin",
    },
    {
      icon: FaUsers,
      text: "User Management",
      active: activePage === "user",
      path: "/user",
    },
    {
      icon: FaWallet,
      text: "Budget Management",
      active: activePage === "budget",
      path: "/budget",
    },
    {
      icon: FaHeadset,
      text: "Support",
      active: activePage === "support",
      path: "/support",
    },
  ];

  const handleNavigation = (path) => {
    navigate(path);
    if (onClose) onClose();
  };

  return (
    <Box
      bg={useColorModeValue("white", "gray.900")}
      borderRight="1px"
      borderRightColor={useColorModeValue("gray.200", "gray.700")}
      w={{ base: "full", lg: 64 }}
      pos="fixed"
      h="full"
    >
      <Flex
        h="16"
        alignItems="center"
        justifyContent="center"
        borderBottomWidth="1px"
      >
        <Image h="12" src={logoImage} alt="Logo" />
      </Flex>
      <VStack spacing="1" align="stretch" px="2" mt="6">
        {navItems.map((item, index) => (
          <Button
            key={index}
            leftIcon={<Icon as={item.icon} />}
            variant={item.active ? "solid" : "ghost"}
            colorScheme={item.active ? "orange" : "gray"}
            justifyContent="flex-start"
            size="lg"
            w="full"
            onClick={() => handleNavigation(item.path)}
          >
            {item.text}
          </Button>
        ))}
      </VStack>
    </Box>
  );
};

export default Sidebar_admin;
