import React from 'react';
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

const HomePage = () => {
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

  const partners = [1, 2, 3, 4, 5];

  return (
    <Box>
      {/* Navigation */}
      <Box as="nav" bg="white" borderBottom="1px" borderColor="gray.200">
        <Container maxW="container.xl">
          <Flex justify="space-between" h={16} alignItems="center">
            <Image src="https://ai-public.creatie.ai/gen_page/logo_placeholder.png" h={8} alt="ExpenseFlow" />
            <HStack spacing={4}>
              <Button variant="outline" colorScheme="orange">Sign In</Button>
              <Button colorScheme="orange">Sign Up Free</Button>
            </HStack>
          </Flex>
        </Container>
      </Box>

      {/* Hero Section */}
      <Container maxW="container.xl" py={16}>
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
              <Text fontSize="xl" color="gray.500">
                Automate your expense workflows, track spending in real-time, and make smarter financial decisions with our powerful platform.
              </Text>
              <HStack spacing={4}>
                <Button size="lg" colorScheme="orange">Start Free Trial</Button>
                <Button size="lg" variant="outline" colorScheme="orange">Schedule Demo</Button>
              </HStack>
            </VStack>
          </GridItem>
          <GridItem>
            <Image src="IMG@1x.png" alt="ExpenseFlow Dashboard" />
          </GridItem>
        </Grid>
      </Container>

      {/* Features Section */}
      <Container maxW="container.xl" py={16} bg="gray.50">
        <VStack textAlign="center" mb={12}>
          <Heading size="2xl" mb={4}>Powerful Features for Modern Businesses</Heading>
          <Text fontSize="xl" color="gray.500">Everything you need to manage expenses efficiently</Text>
        </VStack>
        
        <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={8}>
          {features.map((feature, index) => (
            <Box 
              key={index} 
              bg="white" 
              p={8} 
              borderRadius="lg" 
              boxShadow="md"
              textAlign="center"
            >
              <Icon 
                as={feature.icon} 
                w={10} 
                h={10} 
                color="orange.500" 
                mb={4} 
              />
              <Heading size="md" mb={4}>{feature.title}</Heading>
              <Text color="gray.500">{feature.description}</Text>
            </Box>
          ))}
        </SimpleGrid>
      </Container>

      {/* Stats Section */}
      <Container maxW="container.xl" py={16}>
        <SimpleGrid columns={{ base: 1, md: 3 }} spacing={8}>
          {stats.map((stat, index) => (
            <Box 
              key={index} 
              bg="gray.50" 
              p={8} 
              borderRadius="lg" 
              textAlign="center"
            >
              <Heading size="2xl" color="orange.500" mb={2}>{stat.value}</Heading>
              <Text color="gray.500">{stat.label}</Text>
            </Box>
          ))}
        </SimpleGrid>
      </Container>

      {/* Partners Section */}
      <Container maxW="container.xl" py={16} bg="gray.50">
        <VStack textAlign="center" mb={12}>
          <Heading size="2xl" mb={4}>Trusted by Leading Companies</Heading>
        </VStack>
        <SimpleGrid columns={{ base: 2, md: 3, lg: 5 }} spacing={8} justifyItems="center">
          {partners.map((partner, index) => (
            <Image 
              key={index}
              src="https://ai-public.creatie.ai/gen_page/logo_placeholder.png" 
              h={12} 
              opacity={0.6}
              _hover={{ opacity: 1 }}
              transition="opacity 0.3s"
              alt={`Partner ${partner}`}
            />
          ))}
        </SimpleGrid>
      </Container>

      {/* Call to Action */}
      <Container maxW="container.xl" py={16} textAlign="center">
        <Heading size="2xl" mb={4}>Ready to Transform Your Expense Management?</Heading>
        <Text fontSize="xl" color="gray.500" mb={8}>
          Start your 14-day free trial today. No credit card required.
        </Text>
        <Button size="lg" colorScheme="orange">Get Started Free</Button>
      </Container>

      {/* Footer */}
      <Box bg="gray.900" color="white">
        <Container maxW="container.xl" py={16}>
          <SimpleGrid columns={{ base: 1, md: 4 }} spacing={8}>
            {/* Product Links */}
            <VStack align="start" spacing={4}>
              <Heading size="sm" color="gray.400" textTransform="uppercase">Product</Heading>
              {['Features', 'Pricing', 'Security'].map((link, index) => (
                <Button key={index} variant="link" color="gray.300">{link}</Button>
              ))}
            </VStack>

            {/* Company Links */}
            <VStack align="start" spacing={4}>
              <Heading size="sm" color="gray.400" textTransform="uppercase">Company</Heading>
              {['About', 'Blog', 'Careers'].map((link, index) => (
                <Button key={index} variant="link" color="gray.300">{link}</Button>
              ))}
            </VStack>

            {/* Support Links */}
            <VStack align="start" spacing={4}>
              <Heading size="sm" color="gray.400" textTransform="uppercase">Support</Heading>
              {['Help Center', 'Contact', 'API'].map((link, index) => (
                <Button key={index} variant="link" color="gray.300">{link}</Button>
              ))}
            </VStack>

            {/* Social Links */}
            <VStack align="start" spacing={4}>
              <Heading size="sm" color="gray.400" textTransform="uppercase">Connect</Heading>
              <HStack spacing={4}>
                {[FaTwitter, FaLinkedin, FaGithub].map((Icon, index) => (
                  <Icon key={index} size="24px" color="gray.300" />
                ))}
              </HStack>
            </VStack>
          </SimpleGrid>

          <Divider my={8} borderColor="gray.700" />

          <Flex 
            direction={{ base: 'column', md: 'row' }} 
            justify="space-between" 
            align="center"
          >
            <Text color="gray.400">&copy; 2024 ExpenseFlow. All rights reserved.</Text>
            <HStack spacing={4}>
              <Button variant="link" color="gray.300">Privacy</Button>
              <Button variant="link" color="gray.300">Terms</Button>
            </HStack>
          </Flex>
        </Container>
      </Box>
    </Box>
  );
};

export default HomePage;