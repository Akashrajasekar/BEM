import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Container,
    Heading,
    FormControl,
    FormLabel,
    Input,
    Button,
    Alert,
    AlertIcon
} from '@chakra-ui/react';

const ResetPassword = () => {
    const [formData, setFormData] = useState({
        email: '',
        tempPassword: '',
        newPassword: '',
        confirmPassword: ''
    });
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const validateForm = () => {
        if (formData.newPassword !== formData.confirmPassword) {
            setError('New passwords do not match');
            return false;
        }
        if (formData.newPassword.length < 8) {
            setError('New password must be at least 8 characters long');
            return false;
        }
        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;

        setIsLoading(true);
        setMessage('');
        setError('');

        try {
            const response = await fetch('http://localhost:5000/api/auth/reset-password', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({
                    email: formData.email,
                    tempPassword: formData.tempPassword,
                    newPassword: formData.newPassword
                })
            });

            const data = await response.json();

            if (response.ok) {
                setMessage(data.message);
                setTimeout(() => {
                    const userRole = localStorage.getItem('access');
                    navigate(userRole === 'manager' ? '/manager' : '/employee');
                }, 2000);
            } else {
                setError(data.message || 'Failed to reset password');
            }
        } catch (err) {
            setError('Network error. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Container maxW="md" py={10}>
            <Heading as="h2" size="xl" textAlign="center" mb={6}>
                Reset Your Password
            </Heading>
            {message && (
                <Alert status="success" mb={4}>
                    <AlertIcon />
                    {message}
                </Alert>
            )}
            {error && (
                <Alert status="error" mb={4}>
                    <AlertIcon />
                    {error}
                </Alert>
            )}
            <form onSubmit={handleSubmit}>
                <FormControl mb={4}>
                    <FormLabel>Email address</FormLabel>
                    <Input
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                    />
                </FormControl>
                <FormControl mb={4}>
                    <FormLabel>Temporary Password</FormLabel>
                    <Input
                        name="tempPassword"
                        type="password"
                        value={formData.tempPassword}
                        onChange={handleChange}
                        required
                    />
                </FormControl>
                <FormControl mb={4}>
                    <FormLabel>New Password</FormLabel>
                    <Input
                        name="newPassword"
                        type="password"
                        value={formData.newPassword}
                        onChange={handleChange}
                        required
                    />
                </FormControl>
                <FormControl mb={6}>
                    <FormLabel>Confirm New Password</FormLabel>
                    <Input
                        name="confirmPassword"
                        type="password"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        required
                    />
                </FormControl>
                <Button 
                    colorScheme="orange" 
                    type="submit" 
                    width="full"
                    isLoading={isLoading}
                >
                    Reset Password
                </Button>
            </form>
        </Container>
    );
};

export default ResetPassword;