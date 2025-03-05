// QuickActions.jsx
import { Box, Button, Heading, SimpleGrid } from "@chakra-ui/react";
import { FaPlusCircle, FaUpload, FaPaperPlane, FaFolderOpen } from "react-icons/fa";
import { useNavigate } from 'react-router-dom';

const QuickActions = () => {
  const navigate = useNavigate();
  
  const handleNavigation = (path) => {
    navigate(path);
  };
  
  const actions = [
    {
      icon: FaPlusCircle,
      text: "Create New Expense",
      primary: true,
      path: "/manual_expense"
    },
    {
      icon: FaUpload,
      text: "Upload Expense",
      path: "/receipt_upload"
    },
    {
      icon: FaPaperPlane,
      text: "Generate Report",
      path: "/report"
    },
    {
      icon: FaFolderOpen,
      text: "View Expenses",
      path: "/draft"
    },
  ];
  
  return (
    <Box bg="white" rounded="lg" shadow="base" p={6}>
      <Heading size="md" mb={6}>Quick Actions</Heading>
      <SimpleGrid columns={{ base: 1, sm: 2 }} spacing={4}>
        {actions.map((action, index) => (
          <Button
            key={index}
            leftIcon={<Box as={action.icon} />}
            colorScheme={action.primary ? "orange" : "gray"}
            variant={action.primary ? "solid" : "outline"}
            size="lg"
            width="full"
            onClick={() => handleNavigation(action.path)}
          >
            {action.text}
          </Button>
        ))}
      </SimpleGrid>
    </Box>
  );
};

export default QuickActions;