import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
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
  Spinner,
  useToast,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  FormControl,
  FormLabel,
} from "@chakra-ui/react";

const Review = () => {
  const token = localStorage.getItem('token');
  const { expenseId } = useParams();
  const navigate = useNavigate();
  const [apiUrl, setApiUrl] = useState("http://localhost:5000");
  const toast = useToast();
  const [expense, setExpense] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");

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

  useEffect(() => {
    const fetchExpense = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          `${apiUrl}/api/manager/${expenseId}`, {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            },
          }
        );

        if (!response.ok) {
          throw new Error("Failed to fetch expense details");
        }

        const data = await response.json();
        setExpense(data);
      } catch (error) {
        console.error("Error fetching expense:", error);
        toast({
          title: "Error",
          description: "Failed to fetch expense details",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      } finally {
        setLoading(false);
      }
    };

    if (expenseId) {
      fetchExpense();
    }
  }, [expenseId, toast]);

  const handleApprove = async () => {
    try {
      setIsSubmitting(true);
      const response = await fetch(
        `${apiUrl}/api/manager/${expenseId}/approve`,
        {
          method: "POST",
          headers: {
            'Authorization': `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to approve expense");
      }

      toast({
        title: "Success",
        description: "Expense has been approved",
        status: "success",
        duration: 3000,
        isClosable: true,
      });

      navigate("/approvals");
    } catch (error) {
      console.error("Error approving expense:", error);
      toast({
        title: "Error",
        description: error.message,
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReject = async () => {
    try {
      setIsSubmitting(true);
      const response = await fetch(
        `${apiUrl}/api/manager/${expenseId}/reject`,
        {
          method: "POST",
          headers: {
            'Authorization': `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ reason: rejectionReason }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to reject expense");
      }

      toast({
        title: "Success",
        description: "Expense has been rejected",
        status: "success",
        duration: 3000,
        isClosable: true,
      });

      setIsRejectModalOpen(false);
      navigate("/approvals");
    } catch (error) {
      console.error("Error rejecting expense:", error);
      toast({
        title: "Error",
        description: error.message,
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Box
        minH="100vh"
        bg="gray.50"
        display="flex"
        justifyContent="center"
        alignItems="center"
      >
        <Spinner size="xl" />
      </Box>
    );
  }

  if (!expense) {
    return (
      <Box minH="100vh" bg="gray.50" p={8}>
        <Text>Expense not found</Text>
        <Button onClick={() => navigate("/approvals")} mt={4}>
          Back to Approvals
        </Button>
      </Box>
    );
  }

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
                  src={expense.receiptUrl || "https://via.placeholder.com/150"}
                  alt="Employee"
                  w={12}
                  h={12}
                  rounded="full"
                />
                <Box ml={4}>
                  <Text fontWeight="semibold">{expense.name}</Text>
                  <Text fontSize="sm" color="gray.500">
                    {expense.department}
                  </Text>
                </Box>
              </Flex>
              <Flex align="center" gap={4}>
                <Box
                  px={3}
                  py={1}
                  fontSize="xs"
                  fontWeight="medium"
                  bg={
                    expense.status === "AutoFlagged"
                      ? "orange.100"
                      : expense.status === "Pending"
                      ? "yellow.100"
                      : expense.status === "Approved"
                      ? "green.100"
                      : "red.100"
                  }
                  color={
                    expense.status === "AutoFlagged"
                      ? "orange.700"
                      : expense.status === "Pending"
                      ? "yellow.700"
                      : expense.status === "Approved"
                      ? "green.700"
                      : "red.700"
                  }
                  rounded="full"
                >
                  {expense.status}
                </Box>
                <Text fontSize="sm" color="gray.500">
                  Submitted: {expense.submitted}
                </Text>
              </Flex>
            </Flex>
          </Box>

          <Grid templateColumns={{ base: "1fr", lg: "2fr 1fr" }} gap={6} p={6}>
            <Box>
              <Text fontWeight="medium" mb={4}>
                Expense Details
              </Text>
              <VStack spacing={4} align="stretch">
                <Grid
                  templateColumns={{
                    base: "1fr",
                    sm: "repeat(2, 1fr)",
                    md: "repeat(4, 1fr)",
                  }}
                  gap={4}
                  w="full"
                >
                  <Box>
                    <Text
                      fontSize="sm"
                      fontWeight="medium"
                      color="gray.700"
                      mb={1}
                    >
                      Category
                    </Text>
                    <Select isReadOnly defaultValue={expense.items}>
                      <option>{expense.items}</option>
                    </Select>
                  </Box>

                  <Box>
                    <Text
                      fontSize="sm"
                      fontWeight="medium"
                      color="gray.700"
                      mb={1}
                    >
                      Merchant
                    </Text>
                    <Input defaultValue={expense.merchant} isReadOnly />
                  </Box>

                  <Box>
                    <Text
                      fontSize="sm"
                      fontWeight="medium"
                      color="gray.700"
                      mb={1}
                    >
                      Amount
                    </Text>
                    <Input
                      type="number"
                      defaultValue={expense.amount}
                      isReadOnly
                    />
                  </Box>

                  <Box>
                    <Text
                      fontSize="sm"
                      fontWeight="medium"
                      color="gray.700"
                      mb={1}
                    >
                      Currency
                    </Text>
                    <Select isReadOnly defaultValue={expense.currency || "USD"}>
                      <option>{expense.currency || "USD"}</option>
                    </Select>
                  </Box>
                </Grid>

                <Box>
                  <Text
                    fontSize="sm"
                    fontWeight="medium"
                    color="gray.700"
                    mb={1}
                  >
                    Submission Date
                  </Text>
                  <Input defaultValue={expense.submitted} isReadOnly />
                </Box>

                {expense.receiptUrl && (
                  <Box>
                    <Text
                      fontSize="sm"
                      fontWeight="medium"
                      color="gray.700"
                      mb={1}
                    >
                      Receipt
                    </Text>
                    <Box border="1px" borderColor="gray.200" p={2} rounded="md">
                      <Image
                        src={expense.receiptUrl}
                        alt="Receipt"
                        maxH="200px"
                        mx="auto"
                      />
                    </Box>
                  </Box>
                )}
              </VStack>
            </Box>
            <Box>
              <Box bg="gray.50" rounded="lg" p={6}>
                <Text fontWeight="medium" mb={4}>
                  Summary
                </Text>
                <VStack spacing={4} align="stretch">
                  <Box>
                    <Flex justify="space-between" fontSize="sm" mb={1}>
                      <Text color="gray.600">Total Amount</Text>
                      <Text fontWeight="medium">
                        ${expense.amount.toFixed(2)}
                      </Text>
                    </Flex>
                    <Flex justify="space-between" fontSize="sm">
                      <Text color="gray.600">Currency</Text>
                      <Text>{expense.currency || "USD"}</Text>
                    </Flex>
                  </Box>

                  <Box borderTop="1px" borderColor="gray.200" pt={4}>
                    <Text fontSize="sm" fontWeight="medium" mb={2}>
                      Category Breakdown
                    </Text>
                    <VStack spacing={2} align="stretch">
                      <Flex justify="space-between" fontSize="sm">
                        <Text color="gray.600">{expense.items}</Text>
                        <Text>${expense.amount.toFixed(2)}</Text>
                      </Flex>
                    </VStack>
                  </Box>
                </VStack>
              </Box>
            </Box>
          </Grid>
        </Box>
      </Box>

      {/* Rejection Reason Modal */}
      <Modal
        isOpen={isRejectModalOpen}
        onClose={() => setIsRejectModalOpen(false)}
      >
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Reject Expense</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <FormControl>
              <FormLabel>Reason for Rejection</FormLabel>
              <Textarea
                placeholder="Please provide a reason for rejecting this expense"
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
              />
            </FormControl>
          </ModalBody>
          <ModalFooter>
            <Button
              variant="ghost"
              mr={3}
              onClick={() => setIsRejectModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              colorScheme="red"
              onClick={handleReject}
              isLoading={isSubmitting}
            >
              Confirm Rejection
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      <Box
        position="fixed"
        bottom={0}
        right={0}
        left={0}
        bg="white"
        borderTop="1px"
        borderColor="gray.200"
        p={4}
      >
        <Flex justify="flex-end" gap={4}>
          <Button
            variant="ghost"
            bg="gray.100"
            onClick={() => navigate("/approvals")}
          >
            Back to Approvals
          </Button>
          <Button
            colorScheme="red"
            onClick={() => setIsRejectModalOpen(true)}
            isDisabled={isSubmitting}
          >
            Reject
          </Button>
          <Button
            colorScheme="green"
            onClick={handleApprove}
            isLoading={isSubmitting}
            loadingText="Approving"
            isDisabled={isSubmitting}
          >
            Approve
          </Button>
        </Flex>
      </Box>
    </Box>
  );
};

export default Review;
