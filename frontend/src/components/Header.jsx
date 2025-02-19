import React, { useEffect, useRef } from 'react';
import {
  Box,
  Flex,
  Text,
  Image,
  Button,
  VStack,
  Grid,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  useDisclosure,
  Drawer,
  DrawerContent,
  DrawerOverlay,
  IconButton,
  useBreakpointValue
} from "@chakra-ui/react";
import { Link as RouterLink } from "react-router-dom";
import { FaHome, FaReceipt, FaFileInvoice, FaCheckCircle, FaCog, FaBell, FaBars, FaDollarSign, FaClock, FaCoins } from "react-icons/fa";
import * as echarts from 'echarts';

const Header = ({ onShowSidebar }) => {
  return (
    <Box as="header" bg="white" borderBottom="1px" borderColor="gray.200">
      <Flex
        px={{ base: 4, md: 8 }}
        py={4}
        alignItems="center"
        justifyContent="space-between"
      >
        <Flex alignItems="center">
          <IconButton
            display={{ base: "flex", md: "none" }}
            onClick={onShowSidebar}
            variant="ghost"
            fontSize="20px"
            icon={<FaBars />}
            mr={4}
            aria-label="Open Menu"
          />
          <Text fontSize="2xl" fontWeight="semibold" color="gray.900">
            Dashboard
          </Text>
        </Flex>

        <Flex align="center" gap={4}>
          <Button position="relative" variant="ghost" p={0}>
            <FaBell />
            <Box
              position="absolute"
              top="-1"
              right="-1"
              bg="red.500"
              color="white"
              fontSize="xs"
              rounded="full"
              w="4"
              h="4"
              display="flex"
              alignItems="center"
              justifyContent="center"
            >
              3
            </Box>
          </Button>
          
          <Flex align="center">
            <Image
              w="10"
              h="10"
              rounded="full"
              src="/api/placeholder/40/40"
              alt="Profile"
            />
            <Box
              ml={3}
              display={{ base: "none", md: "block" }}
            >
              <Text fontSize="sm" fontWeight="medium" color="gray.700">
                John Smith
              </Text>
              <Text fontSize="xs" color="gray.500">
                Manager
              </Text>
            </Box>
          </Flex>
        </Flex>
      </Flex>
    </Box>
  );
};

export default Header;