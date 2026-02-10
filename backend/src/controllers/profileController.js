import { PrismaClient } from '@prisma/client';
import Groq from 'groq-sdk';
import { createRequire } from 'module';

const prisma = new PrismaClient();
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
const require = createRequire(import.meta.url);

export const getProfile = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.userId },
      select: { profile: true, phoneNumber: true }, 
    });
    res.status(200).json({ profile: user.profile || '', phoneNumber: user.phoneNumber || '' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch profile.' });
  }
};

export const updateProfile = async (req, res) => {
  const { profile, phoneNumber } = req.body;
  try {
    const updatedUser = await prisma.user.update({
      where: { id: req.userId },
      data: { profile, phoneNumber },
    });
    res.status(200).json({ message: 'Profile updated.', profile: updatedUser.profile });
  } catch (error) {
    res.status(500).json({ message: 'Failed to update profile.' });
  }
};

export const parseResume = async (req, res) => {
  console.log('🚀 [BACKEND]: parseResume route hit successfully!');

  if (!req.file) {
    return res.status(400).json({ message: "No file uploaded." });
  }

  try {
    // USING THE COMPATIBLE LIBRARY
    const pdf = require('pdf-extraction');
    
    console.log('📄 [BACKEND]: Extracting text from PDF Buffer...');
    
    // pdf-extraction is a pure function and works perfectly in Node 22
    const data = await pdf(req.file.buffer);
    const rawText = data.text;

    if (!rawText || rawText.trim().length < 50) {
      throw new Error("Text extraction failed or result was too short.");
    }

    console.log('🤖 [BACKEND]: Text extracted. Requesting AI professional summary...');
    
    const prompt = `
      Extract professional details from this resume text and format as a 
      concise "Master Profile" (Summary, Skills, Experience).
      
      TEXT:
      """
      ${rawText.substring(0, 6000)}
      """
    `;

    const chatCompletion = await groq.chat.completions.create({
      messages: [{ role: 'user', content: prompt }],
      model: 'llama-3.1-8b-instant',
      temperature: 0.1,
    });

    const parsedProfile = chatCompletion.choices[0]?.message?.content || rawText;

    await prisma.user.update({
      where: { id: req.userId },
      data: { profile: parsedProfile }
    });

    console.log('✅ [SUCCESS]: Profile updated successfully.');
    res.status(200).json({ profile: parsedProfile });

  } catch (error) {
    console.error('🔥 [PARSER ERROR]:', error.message);
    res.status(500).json({ message: `Parser error: ${error.message}` });
  }
};