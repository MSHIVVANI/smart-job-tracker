// backend/src/controllers/profileController.js

import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export const getProfile = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.userId },
      // Select both profile and phoneNumber
      select: { profile: true, phoneNumber: true }, 
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    res.status(200).json({ 
      profile: user.profile || '', 
      phoneNumber: user.phoneNumber || '' // Return the phone number
    });
  } catch (error) {
    console.error('Get Profile Error:', error);
    res.status(500).json({ message: 'Failed to fetch profile.' });
  }
};

export const updateProfile = async (req, res) => {
  const { profile, phoneNumber } = req.body; // Accept phoneNumber

  try {
    const updatedUser = await prisma.user.update({
      where: { id: req.userId },
      data: { 
        profile, 
        phoneNumber // Update the phone number
      },
    });
    res.status(200).json({ 
      message: 'Profile updated successfully.', 
      profile: updatedUser.profile,
      phoneNumber: updatedUser.phoneNumber 
    });
  } catch (error) {
    console.error('Update Profile Error:', error);
    res.status(500).json({ message: 'Failed to update profile.' });
  }
};