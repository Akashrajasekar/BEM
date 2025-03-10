// components/StatCard.jsx
import { Box, Flex, Text } from "@chakra-ui/react";
import { useState, useEffect } from "react";

const StatCard = ({ icon: Icon, iconBg, title, value, subtitle }) => {
  // State to track font size based on value length
  const [fontSize, setFontSize] = useState("2xl");
  
  // Dynamically adjust font size based on value length
  useEffect(() => {
    if (typeof value === "string") {
      if (value.length > 12) {
        setFontSize("lg");
      } else if (value.length > 8) {
        setFontSize("xl");
      } else {
        setFontSize("2xl");
      }
    }
  }, [value]);

  return (
    <Box 
      bg="white" 
      rounded="lg" 
      shadow="base" 
      p={6}
      height="100%"
      minHeight="140px"
      display="flex"
      alignItems="center"
    >
      <Flex align="center" width="100%">
        <Flex
          p={3}
          bg={iconBg}
          rounded="lg"
          align="center"
          justify="center"
          flexShrink={0}
        >
          <Box as={Icon} w={6} h={6} color={`${iconBg.split('.')[0]}.600`} />
        </Flex>
        <Box ml={4} overflow="hidden" width="100%">
          <Text fontSize="sm" fontWeight="medium" color="gray.500">
            {title}
          </Text>
          <Text 
            fontSize={fontSize} 
            fontWeight="semibold" 
            color="gray.900"
            overflow="hidden"
            textOverflow="ellipsis"
            whiteSpace="nowrap"
          >
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