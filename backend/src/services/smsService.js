import twilio from 'twilio';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioNumber = process.env.TWILIO_PHONE_NUMBER;

const client = (accountSid && authToken) ? twilio(accountSid, authToken) : null;

export const sendInterviewReminders = async () => {
  console.log('--- [SMS SERVICE]: Checking for upcoming interviews... ---');

  if (!client) {
    console.log('--- [SMS SERVICE]: Twilio not configured. Skipping SMS sending. ---');
    return;
  }
  
  // 1. Calculate Date Range
  const today = new Date();
  const tomorrowStart = new Date(today);
  tomorrowStart.setDate(today.getDate() + 1);
  tomorrowStart.setHours(0, 0, 0, 0);
  
  const tomorrowEnd = new Date(tomorrowStart);
  tomorrowEnd.setHours(23, 59, 59, 999);

  console.log(`--- [SMS DEBUG]: Looking for dates between ${tomorrowStart.toISOString()} and ${tomorrowEnd.toISOString()}`);

  // 2. Fetch ALL applications in that date range (ignoring status and phone for now)
  const potentialMatches = await prisma.application.findMany({
    where: {
      interviewDate: {
        gte: tomorrowStart,
        lte: tomorrowEnd,
      },
    },
    include: { user: true },
  });

  console.log(`--- [SMS DEBUG]: Found ${potentialMatches.length} applications with a date of tomorrow.`);

  // 3. Loop through and tell us why they are accepted or rejected
  for (const app of potentialMatches) {
    console.log(`   -> Checking App: "${app.roleTitle}" at "${app.company}"`);
    console.log(`      Status: "${app.status}"`);
    console.log(`      Phone: "${app.user.phoneNumber}"`);

    // Check Status (Case Insensitive)
    const isInterview = app.status.toLowerCase().includes('interview');
    
    // Check Phone
    const hasPhone = !!app.user.phoneNumber;

    if (isInterview && hasPhone) {
      console.log(`      ✅ MATCH! Sending SMS...`);
      try {
        await client.messages.create({
          body: `Good luck! You have an interview with ${app.company} tomorrow for the ${app.roleTitle} role.`,
          from: twilioNumber,
          to: app.user.phoneNumber,
        });
        console.log(`      SENT to ${app.user.email}`);
      } catch (error) {
        console.error(`      ❌ Twilio Error:`, error.message);
      }
    } else {
      console.log(`      ❌ SKIPPED. Reasons:`);
      if (!isInterview) console.log(`         - Status is not 'Interviewing'`);
      if (!hasPhone) console.log(`         - User has no phone number saved`);
    }
  }
};