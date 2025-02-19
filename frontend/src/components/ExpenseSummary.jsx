import {
    Box,
    Table,
    Thead,
    Tbody,
    Tr,
    Th,
    Td,
    Badge,
    Heading,
    Flex,
    Select,
  } from "@chakra-ui/react";
  
  const ExpenseSummary = () => {
    const expenses = [
      {
        date: "Aug 15, 2023",
        category: "Travel",
        amount: "$245.00",
        status: "Approved"
      },
      {
        date: "Aug 14, 2023",
        category: "Office Supplies",
        amount: "$89.99",
        status: "Pending"
      },
      {
        date: "Aug 13, 2023",
        category: "Meals",
        amount: "$65.50",
        status: "Approved"
      }
    ];
  
    return (
      <Box bg="white" rounded="lg" shadow="base" p={6}>
        <Flex justify="space-between" align="center" mb={6}>
          <Heading size="md">Expense Summary</Heading>
          <Select w="auto" size="sm" maxW="200px">
            <option>Last 7 days</option>
            <option>Last 30 days</option>
            <option>Last 90 days</option>
          </Select>
        </Flex>
        <Box overflowX="auto">
          <Table variant="simple">
            <Thead>
              <Tr>
                <Th>Date</Th>
                <Th>Category</Th>
                <Th>Amount</Th>
                <Th>Status</Th>
              </Tr>
            </Thead>
            <Tbody>
              {expenses.map((expense, index) => (
                <Tr key={index}>
                  <Td>{expense.date}</Td>
                  <Td>{expense.category}</Td>
                  <Td>{expense.amount}</Td>
                  <Td>
                    <Badge
                      colorScheme={expense.status === "Approved" ? "green" : "yellow"}
                      rounded="full"
                      px={2}
                      py={1}
                    >
                      {expense.status}
                    </Badge>
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </Box>
      </Box>
    );
  };
  
  export default ExpenseSummary;