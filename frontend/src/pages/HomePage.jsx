import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  VStack,
  HStack,
  Heading,
  Text,
  Button,
  SimpleGrid,
  Image,
  Icon,
  Flex,
  Grid,
  GridItem,
  Divider
} from '@chakra-ui/react';
import { 
  FaRoute, 
  FaChartLine, 
  FaReceipt, 
  FaFileAlt,
  FaTwitter,
  FaLinkedin,
  FaGithub
} from 'react-icons/fa';
import logoImage from '../assets/Logo.png';

const HomePage = () => {
  const navigate = useNavigate();

  const handleSignIn = () => {
    navigate('/signin');
  };

  const handleSignUp = () => {
    navigate('/signup');
  };

  const features = [
    {
      icon: FaRoute,
      title: 'Automated Workflows',
      description: 'Streamline approvals with customizable rules and smart routing'
    },
    {
      icon: FaChartLine,
      title: 'Real-time Tracking',
      description: 'Monitor expenses and budgets with live updates and insights'
    },
    {
      icon: FaReceipt,
      title: 'Smart Scanning',
      description: 'Extract data from receipts automatically with AI technology'
    },
    {
      icon: FaFileAlt,
      title: 'Advanced Reporting',
      description: 'Generate detailed reports and analytics for better insights'
    }
  ];

  const stats = [
    { value: '75%', label: 'Processing Time Saved' },
    { value: '10,000+', label: 'Companies Trust Us' },
    { value: '30%', label: 'Average Cost Reduction' }
  ];

  const partners = [
    { id: 1, name: "Acme Corp", logoUrl: "https://upload.wikimedia.org/wikipedia/en/thumb/f/f4/Malabar_Gold_and_Diamonds_New_Logo.jpg/220px-Malabar_Gold_and_Diamonds_New_Logo.jpg" },
    { id: 2, name: "TechGiant", logoUrl: "data:image/png;base64,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" },
    { id: 3, name: "Global Finance", logoUrl: "https://klipit.co/wp-content/uploads/2023/09/klipit_Logo_NEW.svg" },
    { id: 4, name: "Innovate Inc", logoUrl: "data:image/png;base64,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" },
    { id: 5, name: "Enterprise Solutions", logoUrl: "data:image/png;base64,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" }
  ];

  return (
    <Box>
      {/* Navigation */}
      <Box as="nav" bg="white" borderBottom="1px" borderColor="gray.200" position="sticky" top="0" zIndex="10" boxShadow="sm">
        <Container maxW="container.xl">
          <Flex justify="space-between" h={16} alignItems="center">
            <Image src={logoImage} h={12} alt="ExpenseFlow" />
            <HStack spacing={4}>
              <Button variant="outline" colorScheme="orange" onClick={handleSignIn}>Sign In</Button>
              <Button colorScheme="orange" onClick={handleSignUp}>Sign Up Free</Button>
            </HStack>
          </Flex>
        </Container>
      </Box>

      {/* Hero Section */}
      <Box 
        backgroundImage="linear-gradient(to right, rgba(255,255,255,0.9), rgba(255,255,255,0.7)), url('https://ai-public.creatie.ai/gen_page/background_placeholder.png')"
        backgroundSize="cover"
        py={20}
        borderBottom="1px"
        borderColor="gray.200"
      >
        <Container maxW="container.xl">
          <Grid templateColumns={{ base: '1fr', lg: 'repeat(2, 1fr)'}} gap={8} alignItems="center">
            <GridItem>
              <VStack align="start" spacing={6}>
                <Heading 
                  as="h1" 
                  size="3xl" 
                  lineHeight="shorter"
                  fontWeight="bold"
                >
                  Simplify Your <br />
                  <Text as="span" color="orange.500">Business Expense</Text> <br />
                  Management
                </Heading>
                <Text fontSize="xl" color="gray.600">
                  Automate your expense workflows, track spending in real-time, and make smarter financial decisions with our powerful platform.
                </Text>
                <HStack spacing={4} pt={4}>
                  <Button size="lg" colorScheme="orange" onClick={handleSignUp} boxShadow="md">Start Free Trial</Button>
                  <Button size="lg" variant="outline" colorScheme="orange">Schedule Demo</Button>
                </HStack>
              </VStack>
            </GridItem>
            <GridItem>
              <Box boxShadow="2xl" borderRadius="lg" overflow="hidden">
                <Image src="https://blenderartists.org/uploads/default/original/4X/b/1/c/b1c87d5e236f4de783ff6bc9314588473f067042.png" alt="ExpenseFlow Dashboard" />
              </Box>
            </GridItem>
          </Grid>
        </Container>
      </Box>

      {/* Features Section */}
      <Box py={20} bg="gray.50" borderBottom="1px" borderColor="gray.200">
        <Container maxW="container.xl">
          <VStack textAlign="center" mb={16}>
            <Heading size="2xl" mb={4}>Powerful Features for Modern Businesses</Heading>
            <Text fontSize="xl" color="gray.600" maxW="container.md">Everything you need to manage expenses efficiently</Text>
            <Divider width="100px" borderWidth="4px" borderRadius="full" borderColor="orange.500" mt={6} />
          </VStack>
          
          <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={8}>
            {features.map((feature, index) => (
              <Box 
                key={index} 
                bg="white" 
                p={8} 
                borderRadius="lg" 
                boxShadow="lg"
                textAlign="center"
                transition="transform 0.3s, box-shadow 0.3s"
                _hover={{ transform: 'translateY(-5px)', boxShadow: 'xl' }}
              >
                <Icon 
                  as={feature.icon} 
                  w={12} 
                  h={12} 
                  color="orange.500" 
                  mb={6} 
                />
                <Heading size="md" mb={4}>{feature.title}</Heading>
                <Text color="gray.600">{feature.description}</Text>
              </Box>
            ))}
          </SimpleGrid>
        </Container>
      </Box>

      {/* Stats Section */}
      <Box py={20} bg="white" borderBottom="1px" borderColor="gray.200">
        <Container maxW="container.xl">
          <VStack textAlign="center" mb={16}>
            <Heading size="2xl" mb={4}>The Results Speak for Themselves</Heading>
            <Divider width="100px" borderWidth="4px" borderRadius="full" borderColor="orange.500" mt={6} />
          </VStack>
          
          <SimpleGrid columns={{ base: 1, md: 3 }} spacing={12}>
            {stats.map((stat, index) => (
              <Box 
                key={index} 
                bg="white" 
                p={10} 
                borderRadius="lg" 
                textAlign="center"
                boxShadow="lg"
                borderTop="4px solid"
                borderColor="orange.500"
              >
                <Heading size="3xl" color="orange.500" mb={4}>{stat.value}</Heading>
                <Text fontSize="lg" fontWeight="medium" color="gray.700">{stat.label}</Text>
              </Box>
            ))}
          </SimpleGrid>
        </Container>
      </Box>

      {/* Partners Section */}
         <Box py={20} bg="gray.50" borderBottom="1px" borderColor="gray.200">
        <Container maxW="container.xl">
          <VStack textAlign="center" mb={16}>
            <Heading size="2xl" mb={4}>Trusted by Leading Companies</Heading>
            <Divider width="100px" borderWidth="4px" borderRadius="full" borderColor="orange.500" mt={6} />
          </VStack>
          
          <SimpleGrid columns={{ base: 2, md: 3, lg: 5 }} spacing={12} justifyItems="center">
            {partners.map((partner) => (
              <Box
                key={partner.id}
                p={6}
                bg="white"
                borderRadius="md"
                boxShadow="md"
                display="flex"
                alignItems="center"
                justifyContent="center"
                transition="transform 0.3s, opacity 0.3s"
                _hover={{ transform: 'scale(1.05)', opacity: 1 }}
                height="100px"
              >
                <Image 
                  src={partner.logoUrl} 
                  maxH="60px"
                  maxW="120px"
                  opacity={0.8}
                  _hover={{ opacity: 1 }}
                  alt={partner.name}
                />
              </Box>
            ))}
          </SimpleGrid>
        </Container>
      </Box>

      {/* Call to Action */}
      <Box 
        py={24} 
        textAlign="center" 
        bg="orange.500" 
        color="white"
        position="relative"
        overflow="hidden"
      >
        <Box 
          position="absolute"
          top="0"
          left="0"
          right="0"
          bottom="0"
          opacity="0.1"
          bgImage="url('https://ai-public.creatie.ai/gen_page/pattern_placeholder.png')"
        />
        <Container maxW="container.xl" position="relative">
          <VStack spacing={8}>
            <Heading size="2xl" mb={4}>Ready to Transform Your Expense Management?</Heading>
            <Text fontSize="xl" fontWeight="medium" mb={8} maxW="container.md" mx="auto">
              Start your 14-day free trial today. No credit card required.
            </Text>
            <Button 
              size="lg" 
              bg="white" 
              color="orange.500" 
              _hover={{ bg: "gray.100" }}
              fontSize="lg"
              fontWeight="bold"
              py={7}
              px={10}
              boxShadow="xl"
              onClick={handleSignUp}
            >
              Get Started Free
            </Button>
          </VStack>
        </Container>
      </Box>

      {/* Footer */}
      <Box bg="gray.900" color="white">
        <Container maxW="container.xl" py={20}>
          <SimpleGrid columns={{ base: 1, md: 4 }} spacing={10}>
            {/* Brand */}
            <VStack align="start" spacing={6}>
              <Image src={logoImage} h={8} alt="ExpenseFlow" />
              <Text color="gray.400">Making expense management easy for businesses worldwide since 2020.</Text>
            </VStack>
            
            {/* Quick Links */}
            <VStack align="start" spacing={6}>
              <Heading size="sm" color="gray.300" textTransform="uppercase">Product</Heading>
              {['Features', 'Pricing', 'Security'].map((link, index) => (
                <Button key={index} variant="link" color="gray.400" _hover={{ color: "orange.300" }}>{link}</Button>
              ))}
            </VStack>

            {/* Company Links */}
            <VStack align="start" spacing={6}>
              <Heading size="sm" color="gray.300" textTransform="uppercase">Company</Heading>
              {['About', 'Blog', 'Careers'].map((link, index) => (
                <Button key={index} variant="link" color="gray.400" _hover={{ color: "orange.300" }}>{link}</Button>
              ))}
            </VStack>

            {/* Support Links */}
            <VStack align="start" spacing={6}>
              <Heading size="sm" color="gray.300" textTransform="uppercase">Support</Heading>
              {['Help Center', 'Contact', 'API'].map((link, index) => (
                <Button key={index} variant="link" color="gray.400" _hover={{ color: "orange.300" }}>{link}</Button>
              ))}
            </VStack>
          </SimpleGrid>

          <Divider my={12} borderColor="gray.700" />

          <Flex 
            direction={{ base: 'column', md: 'row' }} 
            justify="space-between" 
            align="center"
          >
            <Text color="gray.400">&copy; 2024 ExpenseSync. All rights reserved.</Text>
            
            <HStack spacing={8} mt={{ base: 6, md: 0 }}>
              <HStack spacing={4}>
                {[FaTwitter, FaLinkedin, FaGithub].map((Icon, index) => (
                  <Box 
                    key={index} 
                    as="a" 
                    href="#" 
                    p={2} 
                    borderRadius="full" 
                    bg="gray.800"
                    _hover={{ bg: "gray.700" }}
                  >
                    <Icon size="18px" color="orange.400" />
                  </Box>
                ))}
              </HStack>
              
              <HStack spacing={6}>
                <Button variant="link" color="gray.400" _hover={{ color: "orange.300" }}>Privacy</Button>
                <Button variant="link" color="gray.400" _hover={{ color: "orange.300" }}>Terms</Button>
              </HStack>
            </HStack>
          </Flex>
        </Container>
      </Box>
    </Box>
  );
};

export default HomePage;