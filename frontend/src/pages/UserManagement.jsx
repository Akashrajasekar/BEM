import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  Checkbox,
  Container,
  Flex,
  Heading,
  Input,
  Table,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
  IconButton,
  InputGroup,
  InputLeftElement,
  Select,
  useColorModeValue,
  Image,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  FormControl,
  FormLabel,
  Stack,
  useToast,
  FormErrorMessage,
  VStack,
  HStack,
  useDisclosure,
} from "@chakra-ui/react";
import {
  FaSearch,
  FaPlus,
  FaUserPlus,
  FaEdit,
  FaTrash,
  FaBuilding,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";

const UserManagement = () => {
  const token = localStorage.getItem('token');
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [isNewUserModalOpen, setIsNewUserModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [departments, setDepartments] = useState([]);
  const [users, setUsers] = useState({});
  const [formErrors, setFormErrors] = useState({});
  const toast = useToast();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const navigate = useNavigate();

  const [newUser, setNewUser] = useState({
    name: "",
    email: "",
    access: "",
    role: "",
    department: "",
  });

  const borderColor = useColorModeValue("gray.200", "gray.700");
  const headerBg = useColorModeValue("white", "gray.800");
  const tableBg = useColorModeValue("white", "gray.800");
  const hoverBg = useColorModeValue("gray.50", "gray.700");

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await fetch(
        "http://localhost:5000/api/admin/department-users", {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
        }
      );
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      const data = await response.json();

      const departmentUserMap = {};
      data.forEach((dept) => {
        departmentUserMap[dept._id] = dept.users;
      });

      setUsers(departmentUserMap);
    } catch (error) {
      console.error("Error fetching users:", error);
      toast({
        title: "Error",
        description: "Failed to fetch users: " + error.message,
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleDeleteUser = async (userId) => {
    try {
      const response = await fetch(
        `http://localhost:5000/api/admin/deleteUser/${userId}`,
        {
          method: "DELETE",
          headers: { 'Authorization': `Bearer ${token}`,
          "Content-Type": "application/json" },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to delete user");
      }

      toast({
        title: "Success",
        description: "User moved to Deleted Users.",
        status: "success",
        duration: 3000,
        isClosable: true,
      });

      fetchUsers();
    } catch (error) {
      toast({
        title: "Error",
        description: error.message,
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleEditUser = (user) => {
    setSelectedUser(user);
    setIsEditModalOpen(true);
  };

  const handleUpdateUser = async () => {
    try {
      const response = await fetch(
        `http://localhost:5000/api/admin/updateUser/${selectedUser._id}`,
        {
          method: "PUT",
          headers: { 'Authorization': `Bearer ${token}`,
          "Content-Type": "application/json" },
          body: JSON.stringify({
            access: selectedUser.access,
            role: selectedUser.role,
            department: selectedUser.department,
          }),
        }
      );

      if (!response.ok) throw new Error("Failed to update user");

      toast({
        title: "Success",
        description: "User updated successfully",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      fetchUsers();
      setIsEditModalOpen(false);
    } catch (error) {
      toast({
        title: "Error",
        description: error.message,
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const validateForm = () => {
    const errors = {};
    if (!newUser.name) errors.name = "Name is required";
    if (!newUser.access) errors.access = "Access is required";
    if (!newUser.role) errors.role = "Role is required";
    if (!newUser.department) errors.department = "Department is required";

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewUser((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (formErrors[name]) {
      setFormErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const handleCreateUser = async () => {
    if (!validateForm()) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch("http://localhost:5000/api/admin/newUser", {
        method: "POST",
        headers: { 'Authorization': `Bearer ${token}`,
        "Content-Type": "application/json" },
        body: JSON.stringify(newUser),
      });

      if (!response.ok) {
        let errorMessage = `HTTP error! Status: ${response.status}`;
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorMessage;
        } catch (jsonError) {
          console.error("Failed to parse error JSON:", jsonError);
        }
        throw new Error(errorMessage);
      }

      const data = await response.json();
      toast({
        title: "Success",
        description: `${newUser.name} has been added to the system`,
        status: "success",
        duration: 3000,
        isClosable: true,
      });

      setIsNewUserModalOpen(false);
      setNewUser({
        name: "",
        email: "",
        access: "",
        role: "",
        department: "",
        auth_provider: "",
      });
      fetchUsers();
    } catch (error) {
      toast({
        title: "Error",
        description: "Something went wrong: " + error.message,
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box minH="100vh" bg={useColorModeValue("gray.50", "gray.900")}>
      {/* Main Content */}
      <Box ml={{ base: 0, lg: 0 }}>
        {/* Edit User Modal */}
        <Modal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
        >
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>Edit User</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <FormControl>
                <FormLabel>Access</FormLabel>
                <Select
                  value={selectedUser?.access}
                  onChange={(e) =>
                    setSelectedUser({ ...selectedUser, access: e.target.value })
                  }
                >
                  <option value="employee">Employee</option>
                  <option value="manager">Manager</option>
                </Select>
              </FormControl>
              <FormControl>
                <FormLabel>Role</FormLabel>
                <Input
                  value={selectedUser?.role}
                  onChange={(e) =>
                    setSelectedUser({ ...selectedUser, role: e.target.value })
                  }
                />
              </FormControl>
              <FormControl>
                <FormLabel>Department</FormLabel>
                <Input
                  value={selectedUser?.department}
                  onChange={(e) =>
                    setSelectedUser({
                      ...selectedUser,
                      department: e.target.value,
                    })
                  }
                />
              </FormControl>
            </ModalBody>
            <ModalFooter>
              <Button variant="ghost" onClick={() => setIsEditModalOpen(false)}>
                Cancel
              </Button>
              <Button colorScheme="orange" onClick={handleUpdateUser}>
                Update
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>

        {/* Create User Modal */}
        <Modal
          isOpen={isNewUserModalOpen}
          onClose={() => setIsNewUserModalOpen(false)}
          size="md"
        >
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>Create New User</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <Stack spacing={4}>
                <FormControl isInvalid={!!formErrors.name}>
                  <FormLabel>Name</FormLabel>
                  <Input
                    name="name"
                    value={newUser.name}
                    onChange={handleInputChange}
                    placeholder="Enter name"
                  />
                  <FormErrorMessage>{formErrors.name}</FormErrorMessage>
                </FormControl>

                <FormControl isInvalid={!!formErrors.email}>
                  <FormLabel>Email</FormLabel>
                  <Input
                    name="email"
                    value={newUser.email}
                    onChange={handleInputChange}
                    placeholder="Enter email"
                  />
                  <FormErrorMessage>{formErrors.email}</FormErrorMessage>
                </FormControl>

                <FormControl isInvalid={!!formErrors.access}>
                  <FormLabel>Access</FormLabel>
                  <Select
                    name="access"
                    value={newUser.access}
                    onChange={handleInputChange}
                    placeholder="Select access"
                  >
                    <option value="employee">Employee</option>
                    <option value="manager">Manager</option>
                  </Select>
                  <FormErrorMessage>{formErrors.access}</FormErrorMessage>
                </FormControl>

                <FormControl isInvalid={!!formErrors.role}>
                  <FormLabel>Role</FormLabel>
                  <Input
                    name="role"
                    value={newUser.role}
                    onChange={handleInputChange}
                    placeholder="User role"
                  />
                  <FormErrorMessage>{formErrors.role}</FormErrorMessage>
                </FormControl>

                <FormControl isInvalid={!!formErrors.department}>
                  <FormLabel>Department</FormLabel>
                  <Input
                    name="department"
                    value={newUser.department}
                    onChange={handleInputChange}
                    placeholder="User department"
                  />
                  <FormErrorMessage>{formErrors.department}</FormErrorMessage>
                </FormControl>
              </Stack>
            </ModalBody>

            <ModalFooter>
              <Button
                variant="ghost"
                mr={3}
                onClick={() => setIsNewUserModalOpen(false)}
                isDisabled={isLoading}
              >
                Cancel
              </Button>
              <Button
                colorScheme="orange"
                onClick={handleCreateUser}
                isLoading={isLoading}
                loadingText="Creating"
              >
                Create User
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>

        {/* User Management Content */}
        <Container maxW="container.xl" py={6}>
          <Box bg={tableBg} rounded="lg" shadow="sm">
            <Box p={4} borderBottom="1px" borderColor={borderColor}>
              <Flex
                direction={{ base: "column", md: "row" }}
                align="start"
                gap={4}
              >
                <Box flex="1" minW="240px">
                  <InputGroup>
                    <InputLeftElement pointerEvents="none">
                      <FaSearch color="gray.400" />
                    </InputLeftElement>
                    <Input placeholder="Search departments or users..." />
                  </InputGroup>
                </Box>
                <Flex gap={4}>
                  <Button leftIcon={<FaPlus />} colorScheme="orange">
                    Add Department
                  </Button>
                  <Button
                    leftIcon={<FaUserPlus />}
                    colorScheme="orange"
                    onClick={() => setIsNewUserModalOpen(true)}
                  >
                    New User
                  </Button>
                </Flex>
              </Flex>
            </Box>

            <Box overflowX="auto">
              <Table variant="simple">
                <Thead>
                  <Tr>
                    <Th>
                      <Checkbox colorScheme="orange" />
                    </Th>
                    <Th>User</Th>
                    <Th>Role</Th>
                    <Th>Company Email</Th>
                    <Th>Actions</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {Object.entries(users).map(
                    ([department, departmentUsers]) => (
                      <React.Fragment key={department}>
                        <Tr bg="gray.50">
                          <Td colSpan={5}>
                            <Flex justify="space-between" align="center">
                              <Flex align="center">
                                <FaBuilding style={{ marginRight: "0.5rem" }} />
                                <Text fontWeight="semibold">{department}</Text>
                              </Flex>
                            </Flex>
                          </Td>
                        </Tr>
                        {departmentUsers.map((user) => (
                          <Tr key={user._id}>
                            <Td>
                              <Checkbox colorScheme="orange" />
                            </Td>
                            <Td>
                              <Flex align="center">
                                <Image
                                  src="/api/placeholder/40/40"
                                  alt={user.name}
                                  boxSize="40px"
                                  rounded="full"
                                  mr={4}
                                />
                                <Box>
                                  <Text fontWeight="medium">{user.name}</Text>
                                  <Text fontSize="sm" color="gray.500">
                                    {user.email}
                                  </Text>
                                </Box>
                              </Flex>
                            </Td>
                            <Td>
                              <Select
                                size="sm"
                                variant="filled"
                                bg="orange.100"
                                color="orange.800"
                                border="none"
                                value={user.role}
                              >
                                <option value={user.role}>{user.role}</option>
                              </Select>
                            </Td>
                            <Td>
                              <Text color="gray.500">{user.email}</Text>
                            </Td>
                            <Td>
                              <IconButton
                                icon={<FaEdit />}
                                variant="ghost"
                                colorScheme="orange"
                                mr={2}
                                onClick={() => handleEditUser(user)}
                              />
                              <IconButton
                                icon={<FaTrash />}
                                variant="ghost"
                                colorScheme="red"
                                onClick={() => handleDeleteUser(user._id)}
                              />
                            </Td>
                          </Tr>
                        ))}
                      </React.Fragment>
                    )
                  )}
                </Tbody>
              </Table>
            </Box>

            <Box p={4} borderTop="1px" borderColor={borderColor}>
              <Flex
                direction={{ base: "column", md: "row" }}
                align={{ base: "stretch", md: "center" }}
                justify="space-between"
                gap={4}
              >
                <Flex align="center">
                  <Text fontSize="sm">Showing 1 to 10 of 97 results</Text>
                  <Select ml={4} w="auto" size="sm">
                    <option>10</option>
                    <option>25</option>
                    <option>50</option>
                  </Select>
                </Flex>
                <Flex gap={2}>
                  <Button size="sm" variant="outline">
                    Previous
                  </Button>
                  <Button size="sm" colorScheme="orange">
                    1
                  </Button>
                  <Button size="sm" variant="outline">
                    2
                  </Button>
                  <Button size="sm" variant="outline">
                    3
                  </Button>
                  <Button size="sm" variant="outline">
                    Next
                  </Button>
                </Flex>
              </Flex>
            </Box>
          </Box>
        </Container>
      </Box>
    </Box>
  );
};

export default UserManagement;
