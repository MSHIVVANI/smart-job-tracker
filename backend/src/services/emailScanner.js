import { google } from 'googleapis';
import { PrismaClient } from '@prisma/client';
import axios from 'axios';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET;

export const scanAllUserInboxes = async () => {
  console.log('--- [EMAIL SCANNER]: Starting periodic email scan job ---');
  
  const credentials = await prisma.serviceCredential.findMany({
    where: { service: 'gmail' },
    include: { user: { include: { applications: true } } },
  });

  if (credentials.length === 0) {
    console.log('--- [EMAIL SCANNER]: No users with connected Gmail accounts. Job finished. ---');
    return;
  }
  
  for (const cred of credentials) {
    if (cred.user.applications.length === 0) {
      console.log(`--- [EMAIL SCANNER]: User ${cred.user.email} has no applications to track. Skipping. ---`);
      continue;
    }
    console.log(`--- [EMAIL SCANNER]: Scanning inbox for user: ${cred.user.email} ---`);
    
    try {
      const oauth2Client = new google.auth.OAuth2(
        process.env.GOOGLE_CLIENT_ID,
        process.env.GOOGLE_CLIENT_SECRET
      );
      oauth2Client.setCredentials({
        access_token: cred.accessToken,
        refresh_token: cred.refreshToken,
        expiry_date: Number(cred.expiryDate),
      });

      oauth2Client.on('tokens', async (tokens) => {
        console.log(`--- [EMAIL SCANNER]: Refreshing token for ${cred.user.email} ---`);
        await prisma.serviceCredential.update({
          where: { id: cred.id },
          data: { 
            accessToken: tokens.access_token,
            expiryDate: tokens.expiry_date,
            refreshToken: tokens.refresh_token || cred.refreshToken,
          },
        });
      });

      const gmail = google.gmail({ version: 'v1', auth: oauth2Client });

      const res = await gmail.users.messages.list({
        userId: 'me',
        q: 'is:unread',
      });
      const messages = res.data.messages;

      if (!messages || messages.length === 0) {
        console.log(`--- [EMAIL SCANNER]: No unread emails found for ${cred.user.email}.`);
        continue;
      }

      console.log(`--- [EMAIL SCANNER]: Found ${messages.length} unread email(s). Filtering...`);
      let foundMatch = false;

      for (const message of messages) {
        const email = await gmail.users.messages.get({ 
          userId: 'me', 
          id: message.id, 
          format: 'full' // Get full email data to decode body
        });
        const subjectHeader = email.data.payload.headers.find(h => h.name.toLowerCase() === 'subject')?.value || '';
        
        // --- NEW DEBUGGING LOGS ---
        console.log(`\n--- [DEBUG] Checking Email ---`);
        console.log(`  Subject: "${subjectHeader}"`);

        const matchedApp = cred.user.applications.find(app => {
          const companyName = app.company.toLowerCase().trim();
          const subjectLower = subjectHeader.toLowerCase().trim();
          
          console.log(`    -> Comparing subject with Company: "${companyName}"`);
          const isMatch = subjectLower.includes(companyName);
          if (isMatch) {
            console.log(`    ✅ MATCH FOUND!`);
          }
          
          return isMatch;
        });
        // -------------------------

        if (matchedApp) {
          foundMatch = true;
          console.log(`--- [EMAIL SCANNER]: Found a matching email for application at "${matchedApp.company}" based on subject.`);
          
          let body = '';
          if (email.data.payload.parts) {
            const part = email.data.payload.parts.find(p => p.mimeType === 'text/plain');
            if (part && part.body.data) {
              body = Buffer.from(part.body.data, 'base64').toString('utf-8');
            }
          } else if (email.data.payload.body.data) {
            body = Buffer.from(email.data.payload.body.data, 'base64').toString('utf-8');
          }
          if (!body) continue;

          if (!JWT_SECRET) throw new Error("JWT_SECRET is not defined!");
          const internalToken = jwt.sign({ id: cred.userId }, JWT_SECRET);
          
          const classificationResponse = await axios.post(
            `${process.env.BACKEND_URL}/api/ai/classify-email`,
            { subject: subjectHeader, body },
            { headers: { Authorization: `Bearer ${internalToken}` } }
          );
          const { classification } = classificationResponse.data;
          console.log(`--- [EMAIL SCANNER]: Email classified as: ${classification}`);

          let newStatus = null;
          if (classification === 'INTERVIEW') newStatus = 'Interviewing';
          else if (classification === 'REJECTION') newStatus = 'Rejected';
          else if (classification === 'NEXT_STEPS') newStatus = 'Interviewing';
          if (newStatus && matchedApp.status !== newStatus) {
            await prisma.application.update({ where: { id: matchedApp.id }, data: { status: newStatus } });
            console.log(`--- [EMAIL SCANNER]: SUCCESS! Updated application "${matchedApp.roleTitle}" to status: ${newStatus}`);
          }

          await gmail.users.messages.modify({
            userId: 'me',
            id: message.id,
            requestBody: { removeLabelIds: ['UNREAD'] },
          });
          
          // Stop after finding and processing one match for this test run to keep logs clean
          break; 
        }
      }

      if (!foundMatch) {
        console.log('--- [EMAIL SCANNER]: Finished filtering. No emails matched the subject criteria.');
      }

    } catch (error) {
      console.error(`--- [EMAIL SCANNER]: ERROR!`, error);
    }
  }
  console.log('--- [EMAIL SCANNER]: Finished periodic email scan job ---');
};