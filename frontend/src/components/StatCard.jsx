// components/StatCard.jsx
import { Box, Flex, Text } from "@chakra-ui/react";

const StatCard = ({ icon: Icon, iconBg, title, value, subtitle }) => {
  return (
    <Box bg="white" rounded="lg" shadow="base" p={6}>
      <Flex align="center">
        <Flex
          p={3}
          bg={iconBg}
          rounded="lg"
          align="center"
          justify="center"
        >
          <Box as={Icon} w={6} h={6} color={`${iconBg.split('.')[0]}.600`} />
        </Flex>
        <Box ml={4}>
          <Text fontSize="sm" fontWeight="medium" color="gray.500">
            {title}
          </Text>
          <Text fontSize="2xl" fontWeight="semibold" color="gray.900">
            {value}
          </Text>
          <Text fontSize="sm" color="gray.500">
            {subtitle}
          </Text>
        </Box>
      </Flex>
    </Box>
  );
};

export default StatCard;