import React, { useState } from 'react';
import {
  Box,
  Button,
  Container,
  Flex,
  FormControl,
  FormLabel,
  Image,
  Input,
  InputGroup,
  InputLeftElement,
  InputRightElement,
  Link,
  Stack,
  Text,
  useToast,
  VStack,
  Alert,
  AlertIcon
} from '@chakra-ui/react';
import { FaUser, FaLock, FaEye, FaEyeSlash, FaExclamationCircle } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

const SignIn = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showError, setShowError] = useState(false);
  const toast = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setShowError(false);

    try {
      // 1. Try admin login endpoint first (keeping this separate as requested)
      let response = await fetch('http://localhost:5000/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      let data = await response.json();

      // If admin login succeeds, handle it
      if (response.ok && data.access === 'admin') {
        localStorage.setItem('token', data.token);
        localStorage.setItem('access', data.access);
        localStorage.setItem('adminId', data.adminId);
        localStorage.setItem('fullName', data.fullName);
        navigate('/admin');
        return;
      }

      // 2. If not admin or admin login fails, try employee/manager login
      response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      data = await response.json();

      if (response.ok) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('access', data.access);
        localStorage.setItem('userId', data.userId);
        localStorage.setItem('fullName', data.fullName);
        localStorage.setItem('department_id', data.department_id);
        // Reset the lastNotificationCheck to trigger checking notifications after login
        // This ensures users see notifications they missed while logged out
        const lastLoginTime = localStorage.getItem('lastLoginTime');
        if (lastLoginTime) {
          localStorage.setItem('lastNotificationCheck', lastLoginTime);
        }
    
    // Store current login time for next session
    localStorage.setItem('lastLoginTime', new Date().toISOString());
        // Handle employee/manager routing
        if (!data.isPasswordReset) {
          navigate('/reset-password');
        } else {
          navigate(data.access === 'manager' ? '/manager' : '/employee');
        }
      } else {
        setShowError(true);
        toast({
          title: 'Error',
          description: data.message || 'Invalid credentials. Please try again.',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
      }
    } catch (error) {
      setShowError(true);
      toast({
        title: 'Error',
        description: 'Failed to connect to the server.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box minH="100vh" bg="gray.50" py={[6, 12]} px={[4, 6, 8]}>
      <Container maxW="md">
        <VStack spacing={[6, 8]}>
          {/* Logo and Title */}
          <VStack spacing={[4, 6]}>
            <Image
              h={[10, 12]}
              src="/api/placeholder/48/48"
              alt="Company Logo"
            />
            <Text
              fontSize={['2xl', '3xl']}
              fontWeight="bold"
              color="gray.900"
              letterSpacing="tight"
            >
              Sign in to your account
            </Text>
          </VStack>

          {/* Sign In Form */}
          <Box
            w="full"
            bg="white"
            shadow="base"
            rounded={['none', 'lg']}
            p={[4, 8, 10]}
          >
            <form onSubmit={handleSubmit}>
              <Stack spacing={6}>
                <FormControl isRequired>
                  <FormLabel fontSize="sm">Email</FormLabel>
                  <InputGroup>
                    <InputLeftElement pointerEvents="none">
                      <FaUser color="gray.400" />
                    </InputLeftElement>
                    <Input
                      type="text"
                      placeholder="Enter your email"
                      focusBorderColor="orange.500"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </InputGroup>
                </FormControl>

                <FormControl isRequired>
                  <FormLabel fontSize="sm">Password</FormLabel>
                  <InputGroup>
                    <InputLeftElement pointerEvents="none">
                      <FaLock color="gray.400" />
                    </InputLeftElement>
                    <Input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Enter your password"
                      focusBorderColor="orange.500"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                    <InputRightElement>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <FaEyeSlash /> : <FaEye />}
                      </Button>
                    </InputRightElement>
                  </InputGroup>
                </FormControl>

                {showError && (
                  <Alert status="error" borderRadius="md">
                    <AlertIcon as={FaExclamationCircle} />
                    Invalid credentials. Please try again.
                  </Alert>
                )}

                <Button
                  type="submit"
                  colorScheme="orange"
                  size="md"
                  fontSize="sm"
                  isLoading={isLoading}
                  loadingText="Signing in..."
                >
                  Sign in
                </Button>

                <Flex justify="center">
                  <Link
                    fontSize="sm"
                    fontWeight="medium"
                    color="orange.500"
                    _hover={{ color: 'orange.600' }}
                  >
                    Forgot your password?
                  </Link>
                </Flex>
              </Stack>
            </form>
          </Box>

          {/* Footer */}
          <Text fontSize={['xs', 'sm']} color="gray.600" textAlign="center">
            Need help? Contact support at{' '}
            <Link
              href="mailto:support@company.com"
              fontWeight="medium"
              color="orange.500"
              _hover={{ color: 'orange.600' }}
            >
              support@company.com
            </Link>
          </Text>
        </VStack>
      </Container>
    </Box>
  );
};

export default SignIn;
