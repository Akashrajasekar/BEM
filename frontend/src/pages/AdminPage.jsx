import React, { useEffect, useRef, useState } from 'react';
import {
    Box,
    Flex,
    Icon,
    Image,
    Text,
    Button,
    Table,
    Thead,
    Tbody,
    Tr,
    Th,
    Td,
    useDisclosure,
    Input,
    VStack,
    HStack,
    Heading,
    SimpleGrid,
    Container,
    Avatar,
    Badge,
    IconButton,
    useColorModeValue,
    Drawer,
    DrawerContent,
} from '@chakra-ui/react';
import * as echarts from 'echarts';
import {
    FaChartLine,
    FaUsers,
    FaWallet,
    FaFileAlt,
    FaHeadset,
    FaKey,
    FaBars,
    FaBell,
    FaDollarSign,
    FaFileInvoiceDollar,
    FaChartPie,
    FaEdit,
    FaTrash,
    FaRobot,
    FaPaperPlane
} from 'react-icons/fa';
import { useNavigate } from 'react-router-dom'; // Import useNavigate

const AdminPage = () => {
    const { isOpen, onOpen, onClose } = useDisclosure();
    const chartRef = useRef(null);
    const [chart, setChart] = useState(null);
    const [userName, setUserName] = useState('Admin User'); // Default value
    const navigate = useNavigate();
    const handleNavigation = (path) => {
        navigate(path);
    };

    const navItems = [
        { icon: FaChartLine, text: 'Dashboard', active: true, path: '/admin-report' },
        { icon: FaUsers, text: 'User Management', path: "/user" },
        { icon: FaWallet, text: 'Budget Management',path: '/budget' },
        { icon: FaFileAlt, text: 'Reports', path: '/admin-report' },
        { icon: FaHeadset, text: 'Support', path: '/admin-report'},
        { icon: FaKey, text: 'Generate Credentials', path: '/credentials' }
    ];

    const statsData = [
        { icon: FaUsers, label: 'Total Users', value: '1,234', bgColor: 'orange.100', iconColor: 'orange.600' },
        { icon: FaDollarSign, label: 'Total Budget', value: '$250K', bgColor: 'green.100', iconColor: 'green.600' },
        { icon: FaFileInvoiceDollar, label: 'Pending Claims', value: '45', bgColor: 'yellow.100', iconColor: 'yellow.600' },
        { icon: FaChartPie, label: 'Departments', value: '8', bgColor: 'red.100', iconColor: 'red.600' }
    ];

    useEffect(() => {
        // Retrieve user's name from localStorage
        const storedUserName = localStorage.getItem('userName') || 'Admin User'; // Default if not found
        setUserName(storedUserName);

        if (chartRef.current) {
            const newChart = echarts.init(chartRef.current);
            setChart(newChart);

            const option = {
                animation: false,
                tooltip: {
                    trigger: 'item'
                },
                legend: {
                    top: '5%',
                    left: 'center'
                },
                series: [{
                    name: 'Expense Distribution',
                    type: 'pie',
                    radius: ['40%', '70%'],
                    avoidLabelOverlap: false,
                    itemStyle: {
                        borderRadius: 10,
                        borderColor: '#fff',
                        borderWidth: 2
                    },
                    label: {
                        show: false,
                        position: 'center'
                    },
                    emphasis: {
                        label: {
                            show: true,
                            fontSize: '20',
                            fontWeight: 'bold'
                        }
                    },
                    labelLine: {
                        show: false
                    },
                    data: [
                        { value: 35000, name: 'IT Equipment' },
                        { value: 25000, name: 'Travel' },
                        { value: 15000, name: 'Office Supplies' },
                        { value: 10000, name: 'Training' },
                        { value: 15000, name: 'Others' }
                    ]
                }]
            };

            newChart.setOption(option);
        }

        const handleResize = () => {
            chart?.resize();
        };

        window.addEventListener('resize', handleResize);
        return () => {
            window.removeEventListener('resize', handleResize);
            chart?.dispose();
        };
    }, [chartRef.current]);

    const Sidebar = ({ onClose }) => {
        return (
            <Box
                bg={useColorModeValue('white', 'gray.900')}
                borderRight="1px"
                borderRightColor={useColorModeValue('gray.200', 'gray.700')}
                w={{ base: 'full', lg: 64 }}
                pos="fixed"
                h="full"
            >
                <Flex h="16" alignItems="center" justifyContent="center" borderBottomWidth="1px">
                    <Image h="8" src="https://ai-public.creatie.ai/gen_page/logo_placeholder.png" alt="Logo" />
                </Flex>
                <VStack spacing="1" align="stretch" px="2" mt="6">
                    {navItems.map((item, index) => (
                        <Button
                            key={index}
                            leftIcon={<Icon as={item.icon} />}
                            variant={item.active ? 'solid' : 'ghost'}
                            colorScheme={item.active ? 'orange' : 'gray'}
                            justifyContent="flex-start"
                            size="lg"
                            w="full"
                            onClick={() => {
                                if (item.path) {
                                    handleNavigation(item.path);
                                } else {
                                    console.log(`No path defined for ${item.text}`);
                                }
                                onClose();
                            }}
                        >
                            {item.text}
                        </Button>
                    ))}
                </VStack>
            </Box>
        );
    };

    return (
        <Box minH="100vh" bg={useColorModeValue('gray.50', 'gray.900')}>
            {/* Sidebar for desktop */}
            <Box display={{ base: 'none', lg: 'block' }}>
                <Sidebar />
            </Box>

            {/* Drawer for mobile */}
            <Drawer
                autoFocus={false}
                isOpen={isOpen}
                placement="left"
                onClose={onClose}
                returnFocusOnClose={false}
                onOverlayClick={onClose}
            >
                <DrawerContent>
                    <Sidebar onClose={onClose} />
                </DrawerContent>
            </Drawer>

            {/* Main Content */}
            <Box ml={{ base: 0, lg: 64 }}>
                {/* Navbar */}
                <Flex
                    bg={useColorModeValue('white', 'gray.900')}
                    borderBottomWidth="1px"
                    h="16"
                    alignItems="center"
                    px="4"
                >
                    <IconButton
                        display={{ base: 'flex', lg: 'none' }}
                        onClick={onOpen}
                        variant="outline"
                        aria-label="open menu"
                        icon={<FaBars />}
                    />
                    <Flex alignItems="center" ml="auto">
                        <IconButton
                            size="lg"
                            variant="ghost"
                            aria-label="notifications"
                            icon={<FaBell />}
                            mr="4"
                        />
                        <HStack spacing="4">
                            <Avatar size="sm" src="https://bit.ly/dan-abramov" />
                            <Text display={{ base: 'none', md: 'flex' }}>{userName}</Text> {/* Display user name */}
                        </HStack>
                    </Flex>
                </Flex>

                {/* Main Content Area */}
                <Box p="6">
                    {/* Stats Grid */}
                    <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing="5">
                        {statsData.map((stat, index) => (
                            <Box key={index} bg="white" rounded="lg" shadow="base" p="5">
                                <Flex align="center">
                                    <Flex
                                        rounded="full"
                                        bg={stat.bgColor}
                                        p="3"
                                        alignItems="center"
                                        justifyContent="center"
                                    >
                                        <Icon as={stat.icon} color={stat.iconColor} boxSize="5" />
                                    </Flex>
                                    <Box ml="5">
                                        <Text fontSize="sm" color="gray.500">{stat.label}</Text>
                                        <Text fontSize="2xl" fontWeight="semibold">{stat.value}</Text>
                                    </Box>
                                </Flex>
                            </Box>
                        ))}
                    </SimpleGrid>

                    {/* User Management Section */}
                    <Box mt="8" bg="white" rounded="lg" shadow="base">
                        <Flex px="6" py="4" borderBottomWidth="1px" justify="space-between" align="center">
                            <Heading size="md">User Management</Heading>
                            <Button colorScheme="orange">Add New User</Button>
                        </Flex>
                        <Box overflowX="auto">
                            <Table variant="simple">
                                <Thead>
                                    <Tr>
                                        <Th>Name</Th>
                                        <Th>Role</Th>
                                        <Th>Department</Th>
                                        <Th>Status</Th>
                                        <Th>Actions</Th>
                                    </Tr>
                                </Thead>
                                <Tbody>
                                    <Tr>
                                        <Td>
                                            <HStack>
                                                <Avatar size="sm" src="https://bit.ly/dan-abramov" />
                                                <Box>
                                                    <Text fontWeight="medium">John Smith</Text>
                                                    <Text fontSize="sm" color="gray.500">john@example.com</Text>
                                                </Box>
                                            </HStack>
                                        </Td>
                                        <Td>Manager</Td>
                                        <Td>Finance</Td>
                                        <Td><Badge colorScheme="green">Active</Badge></Td>
                                        <Td>
                                            <HStack spacing="2">
                                                <IconButton
                                                    icon={<FaEdit />}
                                                    aria-label="Edit"
                                                    colorScheme="orange"
                                                    variant="ghost"
                                                    size="sm"
                                                />
                                                <IconButton
                                                    icon={<FaTrash />}
                                                    aria-label="Delete"
                                                    colorScheme="red"
                                                    variant="ghost"
                                                    size="sm"
                                                />
                                            </HStack>
                                        </Td>
                                    </Tr>
                                </Tbody>
                            </Table>
                        </Box>
                    </Box>

                    {/* Charts and Chatbot Grid */}
                    <SimpleGrid columns={{ base: 1, lg: 2 }} spacing="5" mt="8">
                        {/* Expense Chart */}
                        <Box bg="white" rounded="lg" shadow="base">
                            <Flex px="6" py="4" borderBottomWidth="1px">
                                <Heading size="md">Expense Distribution</Heading>
                            </Flex>
                            <Box p="6" h="300px" ref={chartRef} />
                        </Box>

                        {/* Chatbot */}
                        <Box bg="white" rounded="lg" shadow="base">
                            <Flex px="6" py="4" borderBottomWidth="1px">
                                <Heading size="md">Report Assistant</Heading>
                            </Flex>
                            <Box p="6">
                                <VStack spacing="4" align="stretch">
                                    <HStack align="start">
                                        <Icon as={FaRobot} color="orange.500" boxSize="6" />
                                        <Box bg="gray.100" p="3" rounded="lg">
                                            <Text>How can I help you with reports today?</Text>
                                        </Box>
                                    </HStack>
                                    <Flex>
                                        <Input placeholder="Type your question..." />
                                        <IconButton
                                            ml="2"
                                            icon={<FaPaperPlane />}
                                            colorScheme="orange"
                                            aria-label="Send message"
                                        />
                                    </Flex>
                                </VStack>
                            </Box>
                        </Box>
                    </SimpleGrid>
                </Box>
            </Box>
        </Box>
    );
};

export default AdminPage;
