// backend/src/controllers/profileController.js

import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

// --- GET the profile for the logged-in user ---
export const getProfile = async (req, res) => {
  try {
    // We use the userId from the authMiddleware to find the correct user
    const user = await prisma.user.findUnique({
      where: { id: req.userId },
      select: { profile: true }, // Only select the profile field
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    res.status(200).json({ profile: user.profile || '' });
  } catch (error) {
    console.error('Get Profile Error:', error);
    res.status(500).json({ message: 'Failed to fetch profile.' });
  }
};

// --- UPDATE the profile for the logged-in user ---
export const updateProfile = async (req, res) => {
  const { profile } = req.body;

  try {
    const updatedUser = await prisma.user.update({
      where: { id: req.userId },
      data: { profile },
    });
    res.status(200).json({ message: 'Profile updated successfully.', profile: updatedUser.profile });
  } catch (error) {
    console.error('Update Profile Error:', error);
    res.status(500).json({ message: 'Failed to update profile.' });
  }
};