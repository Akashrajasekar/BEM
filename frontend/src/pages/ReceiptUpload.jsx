import React, { useState, useCallback } from 'react';
import {
  Box,
  Container,
  VStack,
  HStack,
  Heading,
  Text,
  Button,
  Grid,
  GridItem,
  Icon,
  Flex,
  useToast,
  Image,
  Progress,
  Table,
  Tbody,
  Tr,
  Th,
  Td,
} from '@chakra-ui/react';
import { 
  FaUpload,
  FaCamera, 
  FaCloudArrowUp,
  FaRotate, 
  FaCrop, 
  FaSliders,
  FaCircleQuestion 
} from 'react-icons/fa6';

const ReceiptUpload = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [extractedData, setExtractedData] = useState(null);
  const toast = useToast();

  const handleFileSelect = useCallback((event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedFile(file);
      setExtractedData(null);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result);
      };
      reader.readAsDataURL(file);
    }
  }, []);

  const handleDrop = useCallback((event) => {
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    if (file) {
      setSelectedFile(file);
      setExtractedData(null);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result);
      };
      reader.readAsDataURL(file);
    }
  }, []);

  const handleSubmit = async () => {
    if (!selectedFile) {
      toast({
        title: 'No file selected',
        description: 'Please select a receipt to upload',
        status: 'warning',
        duration: 3000,
      });
      return;
    }
    
    setIsUploading(true);
    setUploadProgress(0);

    const formData = new FormData();
    formData.append('receipt', selectedFile);

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch('http://localhost:5000/api/auth/extract-receipt-text', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        // Handle duplicate receipt error specifically
        if (response.status === 409) {
          toast({
            title: 'Duplicate Receipt',
            description: 'This receipt appears to be a duplicate',
            status: 'warning',
            duration: 5000,
          });
        } else {
          throw new Error(data.message || 'Failed to save receipt as draft');
        }
        return;
      }

      const data = await response.json();

      if (data.success) {
        setExtractedData(data.data);
        toast({
          title: 'Receipt uploaded successfully',
          description: 'The receipt has been processed and saved',
          status: 'success',
          duration: 5000,
        });
      } else {
        throw new Error(data.message || 'Failed to process receipt');
      }
    } catch (error) {
      toast({
        title: 'Upload failed',
        description: error.message,
        status: 'error',
        duration: 5000,
      });
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const handleSaveAsDraft = async () => {
    if (!selectedFile) {
      toast({
        title: 'No file selected',
        description: 'Please select a receipt to save as draft',
        status: 'warning',
        duration: 3000,
      });
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    const formData = new FormData();
    formData.append('receipt', selectedFile);

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch('http://localhost:5000/api/auth/save-receipt-draft', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        // Handle duplicate receipt error specifically
        if (response.status === 409) {
          toast({
            title: 'Duplicate Receipt',
            description: 'This receipt appears to be a duplicate',
            status: 'warning',
            duration: 5000,
          });
        } else {
          throw new Error(data.message || 'Failed to save receipt as draft');
        }
        return;
      }

      const data = await response.json();

      if (data.success) {
        toast({
          title: 'Draft saved successfully',
          description: 'The receipt has been saved as a draft',
          status: 'success',
          duration: 5000,
        });
        
        // Don't reset the form after saving as draft
        setExtractedData(data.data);
      } else {
        throw new Error(data.message || 'Failed to save draft');
      }
    } catch (error) {
      toast({
        title: 'Save failed',
        description: error.message,
        status: 'error',
        duration: 5000,
      });
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const ExtractedDataPreview = () => {
    if (!extractedData) return null;

    return (
      <Box mt={6}>
        <Heading size="md" mb={4}>Extracted Receipt Data</Heading>
        <Table variant="simple" size="sm">
          <Tbody>
            <Tr>
              <Th>Merchant</Th>
              <Td>{extractedData.merchant}</Td>
            </Tr>
            <Tr>
              <Th>Amount</Th>
              <Td>{extractedData.amount} {extractedData.currency}</Td>
            </Tr>
            <Tr>
              <Th>Category</Th>
              <Td>{extractedData.category}</Td>
            </Tr>
            <Tr>
              <Th>Date</Th>
              <Td>{new Date(extractedData.expenseDate).toLocaleDateString()}</Td>
            </Tr>
            <Tr>
              <Th>Status</Th>
              <Td>{extractedData.submissionStatus}</Td>
            </Tr>
          </Tbody>
        </Table>
      </Box>
    );
  };

  const UploadSection = () => (
    <VStack spacing={6} align="stretch">
      <HStack spacing={4}>
        <Button
          as="label"
          htmlFor="file-upload"
          flex={1}
          colorScheme="orange"
          leftIcon={<Icon as={FaUpload} />}
          size="lg"
          cursor="pointer"
        >
          Upload File
          <input
            id="file-upload"
            type="file"
            accept="image/*,.pdf"
            onChange={handleFileSelect}
            style={{ display: 'none' }}
          />
        </Button>

        <Button
          flex={1}
          variant="outline"
          leftIcon={<Icon as={FaCamera} />}
          size="lg"
          borderColor="gray.300"
          _hover={{ bg: 'gray.50' }}
        >
          Use Camera
        </Button>
      </HStack>

      <Box
        borderWidth="2px"
        borderStyle="dashed"
        borderColor="gray.300"
        rounded="lg"
        p={8}
        textAlign="center"
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
      >
        <VStack spacing={2}>
          <Icon as={FaCloudArrowUp} fontSize="4xl" color="gray.400" />
          <Text color="gray.600">
            Drag and drop your files here or click to browse
          </Text>
          <Text fontSize="sm" color="gray.500">
            Supported formats: JPG, PNG, PDF (Max. 10MB)
          </Text>
        </VStack>
      </Box>

      <Box bg="orange.50" rounded="lg" p={4}>
        <Text fontSize="sm" fontWeight="medium" color="orange.800" mb={2}>
          Submission Guidelines
        </Text>
        <VStack spacing={1} align="stretch" fontSize="sm" color="orange.700">
          <Text>• Ensure receipt is clearly visible and all text is readable</Text>
          <Text>• Include itemized details when available</Text>
          <Text>• Submit within 30 days of expense</Text>
          <Text>• Keep original receipts for 60 days after submission</Text>
        </VStack>
      </Box>
      
      {isUploading && (
        <Progress
          size="sm"
          colorScheme="orange"
          hasStripe
          isAnimated
          value={uploadProgress}
        />
      )}

      <ExtractedDataPreview />
    </VStack>
  );

  const PreviewSection = () => (
    <VStack spacing={6} align="stretch">
      <Box>
        <Heading size="md" color="gray.900" mb={4}>
          Preview
        </Heading>
        <Box
          border="1px"
          borderColor="gray.200"
          rounded="lg"
          p={4}
          bg="gray.50"
          minH="300px"
          display="flex"
          alignItems="center"
          justifyContent="center"
        >
          {previewUrl ? (
            <Image
              src={previewUrl}
              alt="Receipt preview"
              maxH="300px"
              objectFit="contain"
            />
          ) : (
            <Text color="gray.500">No receipt uploaded yet</Text>
          )}
        </Box>
      </Box>

      <Box>
        <Heading size="md" color="gray.900" mb={4}>
          Image Tools
        </Heading>
        <HStack spacing={4}>
          <Button
            flex={1}
            variant="outline"
            leftIcon={<Icon as={FaRotate} />}
            isDisabled={!selectedFile}
            borderColor="gray.300"
          >
            Rotate
          </Button>
          <Button
            flex={1}
            variant="outline"
            leftIcon={<Icon as={FaCrop} />}
            isDisabled={!selectedFile}
            borderColor="gray.300"
          >
            Crop
          </Button>
          <Button
            flex={1}
            variant="outline"
            leftIcon={<Icon as={FaSliders} />}
            isDisabled={!selectedFile}
            borderColor="gray.300"
          >
            Adjust
          </Button>
        </HStack>
      </Box>
    </VStack>
  );

  return (
    <Box minH="100vh" bg="gray.50">
      <Container maxW="8xl" py={8} px={{ base: 4, sm: 6, lg: 8 }}>
        <Box bg="white" rounded="lg" shadow="base" p={6}>
          <Heading size="xl" color="gray.900" mb={6}>
            Upload Expense Receipt
          </Heading>

          <Grid
            templateColumns={{ base: '1fr', lg: 'repeat(2, 1fr)' }}
            gap={8}
            mb={8}
          >
            <GridItem>
              <UploadSection />
            </GridItem>
            <GridItem>
              <PreviewSection />
            </GridItem>
          </Grid>

          <Flex
            borderTop="1px"
            borderColor="gray.200"
            pt={6}
            justify="space-between"
            align="center"
            flexWrap={{ base: 'wrap', md: 'nowrap' }}
            gap={4}
          >
            <HStack spacing={2} color="gray.600" fontSize="sm">
              <Icon as={FaCircleQuestion} />
              <Text>Need help? Contact support at support@company.com</Text>
            </HStack>
            <HStack spacing={4}>
              <Button
                variant="outline"
                borderColor="gray.300"
                _hover={{ bg: 'gray.50' }}
                isDisabled={isUploading || !selectedFile}
                onClick={handleSaveAsDraft}
              >
                Save as Draft
              </Button>
              <Button
                colorScheme="orange"
                px={6}
                onClick={handleSubmit}
                isLoading={isUploading}
                loadingText="Uploading..."
                isDisabled={!selectedFile}
              >
                Submit Expense
              </Button>
            </HStack>
          </Flex>
        </Box>
      </Container>
    </Box>
  );
};

export default ReceiptUpload;