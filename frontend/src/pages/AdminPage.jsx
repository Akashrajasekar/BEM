import React, { useEffect, useState } from "react";
import {
  Box,
  Flex,
  Icon,
  Text,
  Button,
  useDisclosure,
  VStack,
  HStack,
  Heading,
  SimpleGrid,
  Avatar,
  Badge,
  Input,
  InputGroup,
  InputLeftElement,
  Select,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Code,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  Grid,
  GridItem,
  useToast,
  Stack,
} from "@chakra-ui/react";
import {
  FaChartLine,
  FaUsers,
  FaWallet,
  FaFileAlt,
  FaHeadset,
  FaKey,
  FaDollarSign,
  FaFileInvoiceDollar,
  FaChartPie,
} from "react-icons/fa";
import { SearchIcon } from "@chakra-ui/icons";

const AdminPage = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedLog, setSelectedLog] = useState(null);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dashboardStats, setDashboardStats] = useState({
    totalUsers: 0,
    totalBudget: 0,
    pendingClaims: 0,
    departments: 0,
  });
  const [filters, setFilters] = useState({
    search: "",
    status: "",
    department: "",
    page: 1,
    limit: 10,
  });
  const [pagination, setPagination] = useState({
    total: 0,
    totalPages: 0,
  });
  const [apiUrl, setApiUrl] = useState("https://bem-47rp.onrender.com");
  const toast = useToast();

  const navItems = [
    { icon: FaChartLine, text: "Dashboard", active: true },
    { icon: FaUsers, text: "User Management" },
    { icon: FaWallet, text: "Budget Management" },
    { icon: FaFileAlt, text: "Reports" },
    { icon: FaHeadset, text: "Support" },
    { icon: FaKey, text: "Generate Credentials" },
  ];

   // Get API URL with Vite-specific environment variables
   useEffect(() => {
    // For Vite apps, environment variables must be prefixed with VITE_
    const envApiUrl = import.meta.env.VITE_API_URL;

    if (envApiUrl) {
      setApiUrl(envApiUrl);
      console.log("Using API URL from environment:", envApiUrl);
    } else {
      console.log("No VITE_API_URL found, using default:", apiUrl);
      console.log("Available environment variables:", import.meta.env);
    }
  }, []);

  // Fetch dashboard stats
  const fetchDashboardStats = async () => {
    try {
      const response = await fetch(
        `${apiUrl}/api/admin/dashboard-stats`
      );
      const data = await response.json();

      if (!response.ok) throw new Error(data.error);

      setDashboardStats({
        totalUsers: data.totalUsers,
        totalBudget: data.totalBudget,
        pendingClaims: data.pendingClaims,
        departments: data.totalDepartments,
      });
    } catch (error) {
      toast({
        title: "Error fetching dashboard stats",
        description: error.message,
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };

  // Fetch audit logs
  const fetchAuditLogs = async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams({
        page: filters.page,
        limit: filters.limit,
        ...(filters.status && { status: filters.status }),
        ...(filters.department && { department: filters.department }),
        ...(filters.search && { search: filters.search }),
      });

      const response = await fetch(
        `${apiUrl}/api/admin?${queryParams}`
      );
      const data = await response.json();

      if (!response.ok) throw new Error(data.error);

      setLogs(data.logs);
      setPagination({
        total: data.total,
        totalPages: data.totalPages,
      });
    } catch (error) {
      toast({
        title: "Error fetching audit logs",
        description: error.message,
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchExpenseDetails = async (id) => {
    try {
      const response = await fetch(`${apiUrl}/api/admin/${id}`);
      const data = await response.json();

      if (!response.ok) throw new Error(data.error);

      setSelectedLog(data);
      setIsModalOpen(true);
    } catch (error) {
      toast({
        title: "Error fetching expense details",
        description: error.message,
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };

  useEffect(() => {
    fetchDashboardStats();
    fetchAuditLogs();
  }, [filters]);

  const handleFilterChange = (field, value) => {
    setFilters((prev) => ({
      ...prev,
      [field]: value,
      page: 1, // Reset to first page when filters change
    }));
  };

  const handlePageChange = (newPage) => {
    setFilters((prev) => ({
      ...prev,
      page: newPage,
    }));
  };

  const getStatusColor = (status) => {
    const statusColors = {
      Pending: "yellow",
      Approved: "green",
      Rejected: "red",
      AutoFlagged: "orange",
    };
    return statusColors[status] || "gray";
  };

  const formatCurrency = (amount, currency = "AED") => {
    return new Intl.NumberFormat("en-AE", {
      style: "currency",
      currency: currency,
    }).format(amount);
  };

  const statsData = [
    {
      icon: FaUsers,
      label: "Total Users",
      value: dashboardStats.totalUsers.toString(),
      bgColor: "orange.100",
      iconColor: "orange.600",
    },
    {
      icon: FaDollarSign,
      label: "Total Budget",
      value: formatCurrency(dashboardStats.totalBudget),
      bgColor: "green.100",
      iconColor: "green.600",
    },
    {
      icon: FaFileInvoiceDollar,
      label: "Pending Claims",
      value: dashboardStats.pendingClaims.toString(),
      bgColor: "yellow.100",
      iconColor: "yellow.600",
    },
    {
      icon: FaChartPie,
      label: "Departments",
      value: dashboardStats.departments.toString(),
      bgColor: "red.100",
      iconColor: "red.600",
    },
  ];

  return (
    <Box p="6"> {/* Removed minHeight and unnecessary wrapper Box */}
      {/* Stats Grid */}
      <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing="5">
        {statsData.map((stat, index) => (
          <Box key={index} bg="white" rounded="lg" shadow="base" p="5">
            <Flex align="center">
              <Flex
                rounded="full"
                bg={stat.bgColor}
                p="3"
                alignItems="center"
                justifyContent="center"
              >
                <Icon as={stat.icon} color={stat.iconColor} boxSize="5" />
              </Flex>
              <Box ml="5">
                <Text fontSize="sm" color="gray.500">
                  {stat.label}
                </Text>
                <Text fontSize="2xl" fontWeight="semibold">
                  {stat.value}
                </Text>
              </Box>
            </Flex>
          </Box>
        ))}
      </SimpleGrid>

      {/* Audit Logs Section */}
      <Box mt="8" bg="white" rounded="lg" shadow="base">
        <Box p={6} borderBottom="1px" borderColor="gray.200">
          <Heading size="md" mb={4}>
            Audit Logs & Activity History
          </Heading>
          <Text color="gray.600" mb={4}>
            Track and monitor all expense-related actions and changes across
            your organization
          </Text>

          <Stack direction={{ base: "column", md: "row" }} spacing={4}>
            <Box flex="1">
              <InputGroup>
                <InputLeftElement pointerEvents="none">
                  <SearchIcon color="gray.400" />
                </InputLeftElement>
                <Input
                  placeholder="Search by merchant or category..."
                  value={filters.search}
                  onChange={(e) =>
                    handleFilterChange("search", e.target.value)
                  }
                />
              </InputGroup>
            </Box>
            <Stack direction={{ base: "column", sm: "row" }} spacing={4}>
              <Select
                placeholder="All Status"
                value={filters.status}
                onChange={(e) =>
                  handleFilterChange("status", e.target.value)
                }
              >
                <option value="Pending">Pending</option>
                <option value="Approved">Approved</option>
                <option value="Rejected">Rejected</option>
                <option value="AutoFlagged">Auto Flagged</option>
              </Select>
              <Select
                placeholder="All Departments"
                value={filters.department}
                onChange={(e) =>
                  handleFilterChange("department", e.target.value)
                }
              >
                <option value="Finance">Finance</option>
                <option value="Sales">Sales</option>
                <option value="Marketing">Marketing</option>
                <option value="IT">IT</option>
              </Select>
            </Stack>
          </Stack>
        </Box>

        <Box overflowX="auto">
          <Table variant="simple">
            <Thead>
              <Tr>
                <Th>Timestamp</Th>
                <Th>User</Th>
                <Th>Status</Th>
                <Th>Merchant</Th>
                <Th>Category</Th>
                <Th>Amount</Th>
              </Tr>
            </Thead>
            <Tbody>
              {logs.map((log) => (
                <Tr
                  key={log.id}
                  _hover={{ bg: "gray.50" }}
                  cursor="pointer"
                  onClick={() => fetchExpenseDetails(log.id)}
                >
                  <Td>{new Date(log.timestamp).toLocaleString()}</Td>
                  <Td>
                    <Flex align="center">
                      <Avatar size="sm" name={log.user.name} mr={3} />
                      <Box>
                        <Text fontWeight="medium">{log.user.name}</Text>
                        <Text fontSize="sm" color="gray.500">
                          {log.user.role}
                        </Text>
                      </Box>
                    </Flex>
                  </Td>
                  <Td>
                    <Badge
                      colorScheme={getStatusColor(log.status)}
                      borderRadius="full"
                    >
                      {log.status}
                    </Badge>
                  </Td>
                  <Td>{log.merchant}</Td>
                  <Td>{log.category}</Td>
                  <Td>{formatCurrency(log.amount, log.currency)}</Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </Box>

        <Box p={6} borderTop="1px" borderColor="gray.200">
          <Flex
            direction={{ base: "column", sm: "row" }}
            justify="space-between"
            align={{ base: "stretch", sm: "center" }}
            gap={4}
          >
            <Stack
              direction={{ base: "column", sm: "row" }}
              spacing={4}
              align={{ base: "stretch", sm: "center" }}
            >
              <Select
                w={{ base: "full", sm: "150px" }}
                value={filters.limit}
                onChange={(e) =>
                  handleFilterChange("limit", Number(e.target.value))
                }
              >
                <option value={10}>10 rows</option>
                <option value={25}>25 rows</option>
                <option value={50}>50 rows</option>
                <option value={100}>100 rows</option>
              </Select>
              <Text fontSize="sm" color="gray.500">
                Showing {(filters.page - 1) * filters.limit + 1} to{" "}
                {Math.min(filters.page * filters.limit, pagination.total)}{" "}
                of {pagination.total} entries
              </Text>
            </Stack>
            <Stack direction="row" spacing={2}>
              <Button
                variant="outline"
                colorScheme="orange"
                isDisabled={filters.page === 1}
                onClick={() => handlePageChange(filters.page - 1)}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                colorScheme="orange"
                isDisabled={filters.page === pagination.totalPages}
                onClick={() => handlePageChange(filters.page + 1)}
              >
                Next
              </Button>
            </Stack>
          </Flex>
        </Box>
      </Box>

      {/* Modal for expense details */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        size="2xl"
      >
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Expense Details</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {selectedLog && (
              <Grid templateColumns="repeat(2, 1fr)" gap={4}>
                <GridItem>
                  <Text fontWeight="medium" fontSize="sm">
                    Expense ID
                  </Text>
                  <Text mt={1}>#{selectedLog._id}</Text>
                </GridItem>
                <GridItem>
                  <Text fontWeight="medium" fontSize="sm">
                    Submission Date
                  </Text>
                  <Text mt={1}>
                    {new Date(selectedLog.createdAt).toLocaleString()}
                  </Text>
                </GridItem>
                <GridItem>
                  <Text fontWeight="medium" fontSize="sm">
                    User
                  </Text>
                  <Text mt={1}>
                    {selectedLog.userId.name} ({selectedLog.userId.role})
                  </Text>
                </GridItem>
                <GridItem>
                  <Text fontWeight="medium" fontSize="sm">
                    Department
                  </Text>
                  <Text mt={1}>{selectedLog.department}</Text>
                </GridItem>
                <GridItem colSpan={2}>
                  <Text fontWeight="medium" fontSize="sm">
                    Status
                  </Text>
                  <Badge
                    mt={1}
                    colorScheme={getStatusColor(selectedLog.approvalStatus)}
                  >
                    {selectedLog.approvalStatus}
                  </Badge>
                </GridItem>
                <GridItem colSpan={2}>
                  <Text fontWeight="medium" fontSize="sm">
                    Details
                  </Text>
                  <Code p={3} mt={1} display="block" whiteSpace="pre">
                    {JSON.stringify(
                      {
                        merchant: selectedLog.merchant,
                        category: selectedLog.category,
                        amount: formatCurrency(
                          selectedLog.amount,
                          selectedLog.currency
                        ),
                        expenseDate: new Date(
                          selectedLog.expenseDate
                        ).toLocaleDateString(),
                        submissionStatus: selectedLog.submissionStatus,
                        ...(selectedLog.reasonForRejection && {
                          reasonForRejection: selectedLog.reasonForRejection,
                        }),
                      },
                      null,
                      2
                    )}
                  </Code>
                </GridItem>
              </Grid>
            )}
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="orange" onClick={() => setIsModalOpen(false)}>
              Close
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default AdminPage;