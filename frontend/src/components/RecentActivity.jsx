import { Box, VStack, HStack, Text, Heading, Icon } from "@chakra-ui/react";
import { FaReceipt, FaCheckCircle, FaFileAlt } from "react-icons/fa";

const RecentActivity = () => {
  const activities = [
    {
      icon: FaReceipt,
      color: "orange.500",
      title: "Receipt uploaded for Office Supplies",
      time: "2 hours ago"
    },
    {
      icon: FaCheckCircle,
      color: "green.500",
      title: "Travel expense report approved",
      time: "Yesterday"
    },
    {
      icon: FaFileAlt,
      color: "gray.400",
      title: "New report drafted",
      time: "2 days ago"
    }
  ];

  return (
    <Box bg="white" rounded="lg" shadow="base" p={6}>
      <Heading size="md" mb={6}>Recent Activity</Heading>
      <VStack spacing={4} align="stretch">
        {activities.map((activity, index) => (
          <HStack key={index} spacing={4}>
            <Icon as={activity.icon} w={5} h={5} color={activity.color} />
            <Box>
              <Text fontWeight="medium" color="gray.700">
                {activity.title}
              </Text>
              <Text fontSize="sm" color="gray.500">
                {activity.time}
              </Text>
            </Box>
          </HStack>
        ))}
      </VStack>
    </Box>
  );
};

export default RecentActivity;