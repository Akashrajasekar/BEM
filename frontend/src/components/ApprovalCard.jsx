import { Box, Flex, Text, Button, Image } from "@chakra-ui/react";

const ApprovalCard = ({
  name,
  department,
  amount,
  items,
  submitted,
  status, // This is the actual status from the database
  image,
  autoApproveEnabled,
}) => {
  const getStatusColor = () => {
    switch (status) {
      case "Approved":
        return {
          bg: "green.100",
          color: "green.800",
          text: "Approved",
        };
      case "Rejected":
        return {
          bg: "red.100",
          color: "red.800",
          text: "Rejected",
        };
      case "AutoFlagged":
        return {
          bg: "blue.100",
          color: "blue.800",
          text: "Auto-Flagged",
        };
      case "Pending":
        return {
          bg: "orange.100",
          color: "orange.800",
          text: "Pending",
        };
      default:
        return {
          bg: "gray.100",
          color: "gray.800",
          text: status || "Unknown",
        };
    }
  };

  const statusStyle = getStatusColor();

  return (
    <Box
      bg="white"
      rounded="lg"
      shadow="sm"
      p={6}
      cursor="pointer"
      transition="all 0.2s"
      _hover={{ shadow: "md" }}
    >
      <Flex justify="space-between" align="center" mb={4}>
        <Flex align="center">
          <Image src={image} alt={name} w={10} h={10} rounded="full" />
          <Box ml={3}>
            <Text fontWeight="medium">{name}</Text>
            <Text fontSize="sm" color="gray.500">
              {department}
            </Text>
          </Box>
        </Flex>
        <Box
          px={2}
          py={1}
          fontSize="xs"
          fontWeight="medium"
          bg={statusStyle.bg}
          color={statusStyle.color}
          rounded="full"
        >
          {statusStyle.text}
        </Box>
      </Flex>

      <Box>
        <Flex justify="space-between" fontSize="sm" mb={1}>
          <Text color="gray.500">Amount:</Text>
          <Text fontWeight="medium">{amount.toFixed(2)}</Text>
        </Flex>
        <Flex justify="space-between" fontSize="sm" mb={1}>
          <Text color="gray.500">Items:</Text>
          <Text fontWeight="medium">{items}</Text>
        </Flex>
        <Flex justify="space-between" fontSize="sm">
          <Text color="gray.500">Submitted:</Text>
          <Text fontWeight="medium">{submitted}</Text>
        </Flex>
      </Box>

      <Box mt={4} pt={4} borderTop="1px" borderColor="gray.200">
        <Button
          colorScheme="orange"
          size="sm"
          width="full"
          isDisabled={status === "AutoFlagged" && autoApproveEnabled}
        >
          Review Request
        </Button>
      </Box>
    </Box>
  );
};

export default ApprovalCard;
