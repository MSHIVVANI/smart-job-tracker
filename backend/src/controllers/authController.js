import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { google } from 'googleapis';

const prisma = new PrismaClient();

// --- Standard User Registration ---
export const register = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password || password.length < 6) {
    return res.status(400).json({ message: 'Valid email and a password of at least 6 characters are required.' });
  }
  try {
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) return res.status(400).json({ message: 'User with this email already exists.' });
    const hashedPassword = await bcrypt.hash(password, 12);
    await prisma.user.create({ data: { email, password: hashedPassword } });
    res.status(201).json({ message: 'User created successfully!' });
  } catch (error) {
    console.error('Registration Error:', error);
    res.status(500).json({ message: 'Server error during registration.' });
  }
};

// --- Standard User Login ---
export const login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(404).json({ message: "User not found." });
    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect) return res.status(400).json({ message: 'Invalid credentials.' });
    const token = jwt.sign({ email: user.email, id: user.id }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.status(200).json({ token });
  } catch (error) {
    console.error('Login Error:', error);
    res.status(500).json({ message: 'Server error during login.' });
  }
};

// ===============================================
// --- NEW: Google OAuth2 Integration Logic ---
// ===============================================

// 1. Create the OAuth2 client using the credentials from your .env file
const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  // This MUST match the "Authorized redirect URI" you set in the Google Cloud Console
  `${process.env.BACKEND_URL}/api/auth/google/callback` 
);

// 2. The function to start the auth process by redirecting the user to Google
export const googleAuth = (req, res) => {
  // Define the permissions we are asking for (read-only access to Gmail)
  const scopes = [
    'https://www.googleapis.com/auth/gmail.readonly',
    'https://www.googleapis.com/auth/gmail.modify'
  ];

  // Generate the unique URL for the user's consent screen
  const url = oauth2Client.generateAuthUrl({
    access_type: 'offline', // 'offline' is required to get a refresh_token
    scope: scopes,
    state: req.userId,
    prompt: 'consent', // Pass our internal user ID so we know who to link the token to on callback
  });

  res.redirect(url); // Redirect the user's browser to the Google consent screen
};

// 3. The function that Google calls after the user gives consent
export const googleAuthCallback = async (req, res) => {
  const { code, state: userId } = req.query; // Google sends us a one-time 'code' and our 'state'

  if (!code || !userId) {
    return res.status(400).redirect(`${process.env.FRONTEND_URL}/dashboard?gmail_connected=false`);
  }

  try {
    // Exchange the one-time code for a set of tokens
    const { tokens } = await oauth2Client.getToken(code);
    const { access_token, refresh_token, expiry_date } = tokens;

    // Check if we already have credentials for this user
    const existingCredential = await prisma.serviceCredential.findFirst({
      where: { userId, service: 'gmail' },
    });

    if (existingCredential) {
      // If so, update them with the new tokens
      await prisma.serviceCredential.update({
        where: { id: existingCredential.id },
        data: {
          accessToken: access_token,
          refreshToken: refresh_token || existingCredential.refreshToken,
          expiryDate: expiry_date ? String(expiry_date) : null,
          status: 'active'
        },
      });
    } else {
      // Otherwise, create a new record in our database
      await prisma.serviceCredential.create({
        data: {
          userId: userId,
          service: 'gmail',
          accessToken: access_token,
          refreshToken: refresh_token,
          expiryDate: expiry_date ? String(expiry_date) : null,
          status: 'active'
        },
      });
    }

    // Redirect the user back to their dashboard with a success message
    res.redirect(`${process.env.FRONTEND_URL}/dashboard?gmail_connected=true`);

  } catch (error) {
    console.error('Error during Google OAuth callback:', error);
    // Redirect with a failure message
    res.redirect(`${process.env.FRONTEND_URL}/dashboard?gmail_connected=false`);
  }
};
export const getGoogleAuthStatus = async (req, res) => {
  try {
    const credential = await prisma.serviceCredential.findFirst({
      where: { userId: req.userId, service: 'gmail' },
    });
    res.status(200).json({ isConnected: !!credential,
      status: credential ? credential.status : 'disconnected'
     });
  } catch (error) {
    res.status(500).json({ message: 'Server error.' });
  }
};