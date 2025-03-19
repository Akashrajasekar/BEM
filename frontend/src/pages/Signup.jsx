import React, { useState, useEffect } from 'react';
import {
    Box,
    Button,
    Container,
    Flex,
    FormControl,
    FormLabel,
    Input,
    InputGroup,
    InputLeftElement,
    InputRightElement,
    Select,
    Text,
    VStack,
    Link,
    Image,
    useColorModeValue,
    IconButton,
    Heading,
    Center,
    useToast
} from '@chakra-ui/react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import {
    FaUser,
    FaEnvelope,
    FaLock,
    FaBuilding,
    FaUserTag,
    FaCamera,
    FaEye,
    FaEyeSlash,
    FaChevronDown,
    FaUserCircle
} from 'react-icons/fa';
import logoImage from '../assets/Logo.png';

const Signup = () => {
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [department, setDepartment] = useState('');
    const [departmentsList, setDepartmentsList] = useState([]); // State for fetched departments
    const [isLoading, setIsLoading] = useState(false);
    const [apiUrl, setApiUrl] = useState('http://localhost:5000');

    const toast = useToast();
    const navigate = useNavigate();


    // Get API URL with Vite-specific environment variables
      useEffect(() => {
        // For Vite apps, environment variables must be prefixed with VITE_
        const envApiUrl = import.meta.env.VITE_API_URL;
        
        if (envApiUrl) {
          setApiUrl(envApiUrl);
          console.log('Using API URL from environment:', envApiUrl);
        } else {
          console.log('No VITE_API_URL found, using default:', apiUrl);
          console.log('Available environment variables:', import.meta.env);
        }
      }, []);

    // Fetch departments from the API
    useEffect(() => {
        const fetchDepartments = async () => {
            try {
                const response = await fetch(`${apiUrl}/api/admin/list`);
                if (!response.ok) {
                    throw new Error(`Failed to fetch departments: ${response.status}`);
                }
                const data = await response.json();
                setDepartmentsList(data); // Update state with fetched departments
            } catch (error) {
                console.error('Error fetching departments:', error.message);
                toast({
                    title: 'Error',
                    description: 'Failed to load departments.',
                    status: 'error',
                    duration: 3000,
                    isClosable: true
                });
            }
        };

        fetchDepartments();
    }, [toast]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const response = await fetch(`${apiUrl}/api/admin/signup`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ fullName, email, password}),
            });

            if (!response.ok) {
                // Handle non-2xx responses
                let errorMessage = `HTTP error! Status: ${response.status}`;
                try {
                    const errorData = await response.json();  // Try to parse JSON error
                    errorMessage = errorData.message || errorMessage;  // Use error message from JSON if available
                } catch (jsonError) {
                    // If JSON parsing fails, use default error message
                    console.error("Failed to parse error JSON:", jsonError);
                }
                toast({
                    title: 'Error',
                    description: errorMessage,
                    status: 'error',
                    duration: 3000,
                    isClosable: true,
                });
            } else {
                try {
                    const data = await response.json();
                    toast({
                        title: 'Success',
                        description: 'Admin registered successfully.',
                        status: 'success',
                        duration: 3000,
                        isClosable: true,
                    });
                    navigate('/signin'); // Redirect to login
                } catch (jsonError) {
                    console.error("Failed to parse JSON:", jsonError);
                    toast({
                        title: 'Error',
                        description: 'Failed to parse response from server.',
                        status: 'error',
                        duration: 3000,
                        isClosable: true,
                    });
                }
            }
        } catch (error) {
            console.error("Fetch error:", error);
            toast({
                title: 'Error',
                description: 'Something went wrong: ' + error.message,
                status: 'error',
                duration: 3000,
                isClosable: true,
            });
        } finally {
            setIsLoading(false);
        }
    };

    const borderColor = useColorModeValue('gray.200', 'gray.600');
    const inputBg = useColorModeValue('white', 'gray.800');
    const iconColor = useColorModeValue('gray.400', 'gray.500');

    return (
        <Box minH="100vh" bg={useColorModeValue('white', 'gray.800')}>
            <Container maxW="8xl" px={{ base: 4, sm: 6, lg: 8 }}>
                <Flex h="16" alignItems="center" justifyContent="space-between">
                    <Image
                        src={logoImage}
                        alt="Logo"
                        h="12"
                    />
                    <Heading size="lg">Admin Sign Up</Heading>
                    <Box w="24" /> {/* Spacer */}
                </Flex>
            </Container>

            <Container maxW="8xl" px={{ base: 4, sm: 6, lg: 8 }} py="12">
                <Box maxW="xl" mx="auto">
                    <Box
                        bg={useColorModeValue('white', 'gray.700')}
                        shadow="lg"
                        rounded="lg"
                        p="8"
                        borderWidth="1px"
                        borderColor={borderColor}
                    >
                        <VStack spacing="6">
                            Profile Photo Upload
                            <Box textAlign="center">
                                <Box position="relative" display="inline-block">
                                    <Center
                                        w="24"
                                        h="24"
                                        rounded="full"
                                        bg="gray.100"
                                        borderWidth="2px"
                                        borderStyle="dashed"
                                        borderColor="gray.300"
                                        mb="4"
                                    >
                                        <FaUserCircle size="2.5rem" color={iconColor} />
                                    </Center>
                                    <IconButton
                                        icon={<FaCamera />}
                                        aria-label="Upload photo"
                                        position="absolute"
                                        bottom="0"
                                        right="0"
                                        rounded="full"
                                        size="sm"
                                        colorScheme="orange"
                                    />
                                </Box>
                                <Text fontSize="sm" color="gray.400">
                                    Upload Profile Photo (Optional)
                                </Text>
                            </Box>

                            <VStack spacing="6" w="100%">
                                <FormControl isRequired>
                                    <FormLabel>Full Name</FormLabel>
                                    <InputGroup>
                                        <InputLeftElement pointerEvents="none">
                                            <FaUser color={iconColor} />
                                        </InputLeftElement>
                                        <Input
                                            type="text"
                                            placeholder="Enter your full name"
                                            bg={inputBg}
                                            value={fullName}
                                            onChange={(e) => setFullName(e.target.value)}
                                        />
                                    </InputGroup>
                                </FormControl>

                                <FormControl isRequired>
                                    <FormLabel>Company Email</FormLabel>
                                    <InputGroup>
                                        <InputLeftElement pointerEvents="none">
                                            <FaEnvelope color={iconColor} />
                                        </InputLeftElement>
                                        <Input
                                            type="email"
                                            placeholder="you@company.com"
                                            bg={inputBg}
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                        />
                                    </InputGroup>
                                </FormControl>

                                <FormControl isRequired>
                                    <FormLabel>Password</FormLabel>
                                    <InputGroup>
                                        <InputLeftElement pointerEvents="none">
                                            <FaLock color={iconColor} />
                                        </InputLeftElement>
                                        <Input
                                            type={showPassword ? 'text' : 'password'}
                                            placeholder="Create a password"
                                            bg={inputBg}
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                        />
                                        <InputRightElement>
                                            <IconButton
                                                variant="ghost"
                                                onClick={() => setShowPassword(!showPassword)}
                                                icon={showPassword ? <FaEye /> : <FaEyeSlash />}
                                                size="sm"
                                                aria-label={showPassword ? 'Hide password' : 'Show password'}
                                            />
                                        </InputRightElement>
                                    </InputGroup>
                                </FormControl>

                                <FormControl isRequired>
                                    <FormLabel>Confirm Password</FormLabel>
                                    <InputGroup>
                                        <InputLeftElement pointerEvents="none">
                                            <FaLock color={iconColor} />
                                        </InputLeftElement>
                                        <Input
                                            type={showConfirmPassword ? 'text' : 'password'}
                                            placeholder="Confirm your password"
                                            bg={inputBg}
                                        />
                                        <InputRightElement>
                                            <IconButton
                                                variant="ghost"
                                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                                icon={showConfirmPassword ? <FaEye /> : <FaEyeSlash />}
                                                size="sm"
                                                aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                                            />
                                        </InputRightElement>
                                    </InputGroup>
                                </FormControl>

                                <FormControl >
                                <FormLabel>Department</FormLabel>
                                <InputGroup>
                                    <InputLeftElement pointerEvents="none">
                                        <FaBuilding color={useColorModeValue('gray.400', 'gray.500')} />
                                    </InputLeftElement>
                                    <Select
                                        placeholder="Select Department"
                                        bg={inputBg}
                                        value={department}
                                        onChange={(e) => setDepartment(e.target.value)}
                                    >
                                        {departmentsList.map((dept) => (
                                            <option key={dept._id} value={dept.name}>
                                                {dept.name}
                                            </option>
                                            
                                        ))}
                                    </Select>
                                </InputGroup>
                            </FormControl>

                                <FormControl>
                                    <FormLabel>Role</FormLabel>
                                    <InputGroup>
                                        <InputLeftElement pointerEvents="none">
                                            <FaUserTag color={iconColor} />
                                        </InputLeftElement>
                                        <Input
                                            value="Admin"
                                            readOnly
                                            bg={inputBg}
                                            opacity="0.75"
                                            cursor="not-allowed"
                                        />
                                    </InputGroup>
                                </FormControl>

                                <Button
                                    w="100%"
                                    colorScheme="orange"
                                    size="md"
                                    type="submit"
                                    onClick={handleSubmit}
                                    isLoading={isLoading}
                                >
                                    Create Admin Account
                                </Button>
                            </VStack>

                            <Text fontSize="sm" color="gray.600" textAlign="center">
                                Already have an account?{' '}
                                <Link
                                    as={RouterLink}
                                    to="/signin"
                                    color="orange.500"
                                    fontWeight="medium"
                                    _hover={{ color: 'orange.600' }}
                                >
                                    Sign In
                                </Link>
                            </Text>
                        </VStack>
                    </Box>
                </Box>
            </Container>
        </Box>
    );
};

export default Signup;
