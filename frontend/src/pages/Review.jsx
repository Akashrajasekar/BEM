import {
    Box,
    Flex,
    Text,
    Button,
    Grid,
    Input,
    Select,
    Textarea,
    Image,
    VStack,
    HStack,
    Icon
  } from "@chakra-ui/react";
  import Header from "../components/Header";
  import { FaPlus, FaFilePdf } from "react-icons/fa";
  
  const Review = () => {
    return (
      <Box minH="100vh" bg="gray.50">
        
        <Box p={8}>
          <Box bg="white" rounded="lg" shadow="sm" mb={6}>
            <Box p={6} borderBottom="1px" borderColor="gray.200">
              <Flex 
                direction={{ base: "column", md: "row" }}
                justify="space-between" 
                align={{ base: "start", md: "center" }}
                gap={4}
              >
                <Flex align="center">
                  <Image
                    src="https://creatie.ai/ai/api/search-image?query=A professional headshot..."
                    alt="Employee"
                    w={12}
                    h={12}
                    rounded="full"
                  />
                  <Box ml={4}>
                    <Text fontWeight="semibold">Sarah Johnson</Text>
                    <Text fontSize="sm" color="gray.500">
                      EMP-2024-001 • Marketing Department
                    </Text>
                  </Box>
                </Flex>
                
                <Flex align="center" gap={4}>
                  <Box
                    px={3}
                    py={1}
                    fontSize="xs"
                    fontWeight="medium"
                    bg="red.100"
                    color="red.700"
                    rounded="full"
                  >
                    Urgent
                  </Box>
                  <Text fontSize="sm" color="gray.500">
                    Submitted: Feb 15, 2024
                  </Text>
                </Flex>
              </Flex>
            </Box>
  
            <Grid 
              templateColumns={{ base: "1fr", lg: "2fr 1fr" }}
              gap={6} 
              p={6}
            >
              <Box>
                <Text fontWeight="medium" mb={4}>Expense Details</Text>
                <VStack spacing={4} align="stretch">
                  <Grid 
                    templateColumns={{ base: "1fr", sm: "repeat(2, 1fr)", md: "repeat(4, 1fr)" }}
                    gap={4}
                    w="full"
                  >
                    <Box>
                      <Text fontSize="sm" fontWeight="medium" color="gray.700" mb={1}>
                        Category
                      </Text>
                      <Select defaultValue="Travel">
                        <option>Travel</option>
                        <option>Meals</option>
                        <option>Supplies</option>
                      </Select>
                    </Box>
                    
                    <Box>
                      <Text fontSize="sm" fontWeight="medium" color="gray.700" mb={1}>
                        Merchant
                      </Text>
                      <Input defaultValue="Delta Airlines" />
                    </Box>
                    
                    <Box>
                      <Text fontSize="sm" fontWeight="medium" color="gray.700" mb={1}>
                        Amount
                      </Text>
                      <Input type="number" defaultValue={850.00} />
                    </Box>
                    
                    <Box>
                      <Text fontSize="sm" fontWeight="medium" color="gray.700" mb={1}>
                        Currency
                      </Text>
                      <Select defaultValue="USD">
                        <option>USD</option>
                        <option>EUR</option>
                        <option>GBP</option>
                      </Select>
                    </Box>
                  </Grid>
  
                  <Box>
                    <Text fontSize="sm" fontWeight="medium" color="gray.700" mb={1}>
                      Description
                    </Text>
                    <Textarea 
                      defaultValue="Round-trip flight tickets for client meeting in New York"
                      rows={3}
                    />
                  </Box>
  
                  <Box border="1px" borderColor="gray.200" rounded="lg" p={4}>
                    <Flex justify="space-between" align="center" mb={2}>
                      <Text fontSize="sm" fontWeight="medium">
                        Attachments
                      </Text>
                      <Button
                        size="sm"
                        colorScheme="orange"
                        leftIcon={<Icon as={FaPlus} />}
                      >
                        Add Files
                      </Button>
                    </Flex>
                    <Grid templateColumns="repeat(4, 1fr)" gap={4}>
                      <Box border="1px" borderColor="gray.200" rounded="md" p={2}>
                        <Flex
                          aspect={3/4}
                          bg="gray.100"
                          rounded="md"
                          mb={2}
                          align="center"
                          justify="center"
                        >
                          <Icon as={FaFilePdf} fontSize="2xl" color="gray.400" />
                        </Flex>
                        <Text fontSize="xs" isTruncated>
                          flight-receipt.pdf
                        </Text>
                      </Box>
                    </Grid>
                  </Box>
                </VStack>
              </Box>
  
              <Box>
                <Box bg="gray.50" rounded="lg" p={6}>
                  <Text fontWeight="medium" mb={4}>Summary</Text>
                  <VStack spacing={4} align="stretch">
                    <Box>
                      <Flex justify="space-between" fontSize="sm" mb={1}>
                        <Text color="gray.600">Total Amount</Text>
                        <Text fontWeight="medium">$850.00</Text>
                      </Flex>
                      <Flex justify="space-between" fontSize="sm">
                        <Text color="gray.600">Currency</Text>
                        <Text>USD</Text>
                      </Flex>
                    </Box>
                    
                    <Box borderTop="1px" borderColor="gray.200" pt={4}>
                      <Text fontSize="sm" fontWeight="medium" mb={2}>
                        Category Breakdown
                      </Text>
                      <VStack spacing={2} align="stretch">
                        <Flex justify="space-between" fontSize="sm">
                          <Text color="gray.600">Travel</Text>
                          <Text>$850.00</Text>
                        </Flex>
                      </VStack>
                    </Box>
                  </VStack>
                </Box>
              </Box>
            </Grid>
  
            <Box p={6} borderTop="1px" borderColor="gray.200">
              <Text fontWeight="medium" mb={4}>Additional Information</Text>
              <Grid
                templateColumns={{ base: "1fr", md: "repeat(3, 1fr)" }}
                gap={6}
              >
                <Box>
                  <Text fontSize="sm" fontWeight="medium" color="gray.700" mb={1}>
                    Project Code
                  </Text>
                  <Input defaultValue="PRJ-2024-001" />
                </Box>
                
                <Box>
                  <Text fontSize="sm" fontWeight="medium" color="gray.700" mb={1}>
                    Cost Center
                  </Text>
                  <Select defaultValue="Marketing - US">
                    <option>Marketing - US</option>
                    <option>Sales - US</option>
                  </Select>
                </Box>
                
                <Box>
                  <Text fontSize="sm" fontWeight="medium" color="gray.700" mb={1}>
                    Payment Method
                  </Text>
                  <Select defaultValue="Corporate Card">
                    <option>Corporate Card</option>
                    <option>Personal Card</option>
                  </Select>
                </Box>
              </Grid>
            </Box>
          </Box>
  
          <Box bg="white" rounded="lg" shadow="sm" p={6}>
            <Text fontWeight="medium" mb={4}>Comments</Text>
            <Flex gap={4}>
              <Image
                src="https://creatie.ai/ai/api/search-image?query=A professional headshot..."
                alt="User"
                w={8}
                h={8}
                rounded="full"
              />
              <Box flex={1}>
                <Textarea
                  placeholder="Add a comment..."
                  rows={2}
                />
              </Box>
            </Flex>
          </Box>
        </Box>
  
        <Box
          position="fixed"
          bottom={0}
          right={0}
          left={{ base: 0, md: 64 }}
          bg="white"
          borderTop="1px"
          borderColor="gray.200"
          p={4}
        >
          <Flex justify="flex-end" gap={4}>
            <Button variant="ghost" bg="gray.100">
              Request More Info
            </Button>
            <Button colorScheme="red">
              Reject
            </Button>
            <Button colorScheme="orange">
              Approve
            </Button>
          </Flex>
        </Box>
      </Box>
    );
  };
  
  export default Review;