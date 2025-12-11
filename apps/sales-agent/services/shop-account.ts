/**
 * Shop Account Service
 * Handles creation and management of shop owner login accounts
 */

import apiService from './api';
import { Alert } from 'react-native';
import * as Linking from 'expo-linking';

export interface CreateShopAccountData {
  shopId: string;
  email: string;
  password: string;
  phoneNumber: string;
  sendCredentialsBySMS: boolean;
}

export interface ShopAccountCredentials {
  email: string;
  password: string;
  shopId: string;
  shopName: string;
}

export interface CreateShopAccountResponse {
  success: boolean;
  message: string;
  credentials: ShopAccountCredentials;
}

class ShopAccountService {
  /**
   * Generate a secure temporary password
   * Format: 8 characters with uppercase, lowercase, and numbers
   */
  generateTempPassword(): string {
    const uppercaseChars = 'ABCDEFGHJKLMNPQRSTUVWXYZ'; // Removed confusing I, O
    const lowercaseChars = 'abcdefghijkmnpqrstuvwxyz'; // Removed confusing l, o
    const numberChars = '23456789'; // Removed confusing 0, 1

    let password = '';

    // Ensure at least one of each type
    password += uppercaseChars[Math.floor(Math.random() * uppercaseChars.length)];
    password += uppercaseChars[Math.floor(Math.random() * uppercaseChars.length)];
    password += lowercaseChars[Math.floor(Math.random() * lowercaseChars.length)];
    password += lowercaseChars[Math.floor(Math.random() * lowercaseChars.length)];
    password += numberChars[Math.floor(Math.random() * numberChars.length)];
    password += numberChars[Math.floor(Math.random() * numberChars.length)];

    // Add 2 more random characters
    const allChars = uppercaseChars + lowercaseChars + numberChars;
    password += allChars[Math.floor(Math.random() * allChars.length)];
    password += allChars[Math.floor(Math.random() * allChars.length)];

    // Shuffle the password
    return password.split('').sort(() => Math.random() - 0.5).join('');
  }

  /**
   * Validate email format
   */
  validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Validate password strength
   * Minimum 8 characters
   */
  validatePassword(password: string): { valid: boolean; message?: string } {
    if (password.length < 8) {
      return {
        valid: false,
        message: 'Password must be at least 8 characters long',
      };
    }
    return { valid: true };
  }

  /**
   * Create shop owner login account
   * This updates the existing shop user registration with login credentials
   */
  async createShopAccount(data: CreateShopAccountData): Promise<CreateShopAccountResponse> {
    try {
      // Validate inputs
      if (!this.validateEmail(data.email)) {
        throw new Error('Invalid email format');
      }

      const passwordValidation = this.validatePassword(data.password);
      if (!passwordValidation.valid) {
        throw new Error(passwordValidation.message);
      }

      // Update the shop user with email and password
      // The shop was already created during registration with role 'shop'
      // Now we're just adding login credentials
      const response = await apiService.put(`/user/update/${data.shopId}`, {
        email: data.email,
        password: data.password,
        accountActivated: true,
      });

      const shop = response.user || response;

      // Send credentials if requested
      if (data.sendCredentialsBySMS) {
        await this.sendCredentialsBySMS(data.phoneNumber, data.email, data.password);
      }

      return {
        success: true,
        message: 'Shop account created successfully',
        credentials: {
          email: data.email,
          password: data.password,
          shopId: data.shopId,
          shopName: shop.shopName || '',
        },
      };
    } catch (error: any) {
      console.error('Error creating shop account:', error);

      // Handle duplicate email error
      if (error.response?.data?.message?.includes('email already exists')) {
        throw new Error('This email is already registered. Please use a different email.');
      }

      throw new Error(
        error.response?.data?.message ||
        error.message ||
        'Failed to create shop account'
      );
    }
  }

  /**
   * Resend credentials to shop owner
   */
  async resendCredentials(shopId: string): Promise<void> {
    try {
      const shop = await apiService.getShopById(shopId);

      if (!shop.email) {
        throw new Error('Shop does not have an email registered');
      }

      // Send credentials via SMS
      await this.sendCredentialsBySMS(
        shop.phoneNumber,
        shop.email,
        'Please contact support to reset your password'
      );

      Alert.alert(
        'Success',
        'Login credentials have been sent to the shop owner via SMS'
      );
    } catch (error: any) {
      console.error('Error resending credentials:', error);
      throw new Error(
        error.response?.data?.message ||
        error.message ||
        'Failed to resend credentials'
      );
    }
  }

  /**
   * Send credentials via SMS (using device SMS app)
   * In production, this would integrate with an SMS API like Twilio or Africa's Talking
   */
  async sendCredentialsBySMS(
    phoneNumber: string,
    email: string,
    password: string
  ): Promise<void> {
    try {
      const message = `Your Kenix Shop Login Credentials:\n\nEmail: ${email}\nPassword: ${password}\n\nDownload the Kenix Shop app to start ordering!\n\nKeep these credentials safe.`;

      // Format: sms:phoneNumber?body=message
      const smsUrl = `sms:${phoneNumber}?body=${encodeURIComponent(message)}`;

      const canOpen = await Linking.canOpenURL(smsUrl);
      if (canOpen) {
        await Linking.openURL(smsUrl);
      } else {
        console.warn('Cannot open SMS app');
      }
    } catch (error) {
      console.error('Error sending SMS:', error);
      // Don't throw error, just log it - SMS is optional
    }
  }

  /**
   * Share credentials via WhatsApp
   */
  async shareViaWhatsApp(
    phoneNumber: string,
    email: string,
    password: string,
    shopName: string
  ): Promise<void> {
    try {
      const message = `Hello! Your ${shopName} login credentials for the Kenix Shop app:\n\nEmail: ${email}\nPassword: ${password}\n\nDownload the app and start ordering today!`;

      // Remove + from phone number for WhatsApp
      const cleanPhone = phoneNumber.replace('+', '');
      const whatsappUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;

      const canOpen = await Linking.canOpenURL(whatsappUrl);
      if (canOpen) {
        await Linking.openURL(whatsappUrl);
      } else {
        throw new Error('WhatsApp is not installed');
      }
    } catch (error: any) {
      console.error('Error sharing via WhatsApp:', error);
      Alert.alert(
        'Error',
        error.message || 'Could not open WhatsApp'
      );
    }
  }

  /**
   * Check if shop has login account
   */
  async hasLoginAccount(shopId: string): Promise<boolean> {
    try {
      const shop = await apiService.getShopById(shopId);
      // Shop has login account if email is set and account is activated
      return !!(shop.email && shop.accountActivated);
    } catch (error) {
      console.error('Error checking shop account status:', error);
      return false;
    }
  }
}

export default new ShopAccountService();
