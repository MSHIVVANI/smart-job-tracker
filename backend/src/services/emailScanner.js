import { google } from 'googleapis';
import { PrismaClient } from '@prisma/client';
import axios from 'axios';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET;

export const scanAllUserInboxes = async () => {
  console.log('--- [SCANNER]: Starting periodic scan job ---');
  
  const credentials = await prisma.serviceCredential.findMany({
    where: { service: 'gmail', status: 'active' },
    include: { user: { include: { applications: true } } },
  });

  if (credentials.length === 0) { 
    console.log('--- [SCANNER]: No active users to scan. Job finished. ---'); 
    return; 
  }
  
  for (const cred of credentials) {
    if (cred.user.applications.length === 0) { 
      console.log(`--- [SCANNER]: User ${cred.user.email} has no applications. Skipping. ---`); 
      continue; 
    }
    
    try {
      const oauth2Client = new google.auth.OAuth2(
        process.env.GOOGLE_CLIENT_ID, 
        process.env.GOOGLE_CLIENT_SECRET
      );

      // Convert back to Number for Google Client logic
      oauth2Client.setCredentials({ 
        access_token: cred.accessToken, 
        refresh_token: cred.refreshToken, 
        expiry_date: Number(cred.expiryDate) 
      });

      // FIXED: Added String() conversion here to prevent Prisma validation crash
      oauth2Client.on('tokens', async (tokens) => { 
        console.log('--- [SCANNER]: Received new tokens from Google. Updating DB... ---');
        await prisma.serviceCredential.update({ 
          where: { id: cred.id }, 
          data: { 
            accessToken: tokens.access_token, 
            expiryDate: tokens.expiry_date ? String(tokens.expiry_date) : null, // FIX: Convert Int to String
            refreshToken: tokens.refresh_token || cred.refreshToken 
          } 
        }); 
      });

      const gmail = google.gmail({ version: 'v1', auth: oauth2Client });
      const res = await gmail.users.messages.list({ userId: 'me', q: 'is:unread' });
      const messages = res.data.messages;

      if (!messages || messages.length === 0) { 
        console.log(`--- [SCANNER]: No unread emails for ${cred.user.email}.`); 
        continue; 
      }

      console.log(`--- [SCANNER]: Found ${messages.length} unread email(s) for ${cred.user.email}. Starting AI relevance check...`);
      
      for (const message of messages) {
        const emailMetadata = await gmail.users.messages.get({ 
          userId: 'me', 
          id: message.id, 
          format: 'metadata', 
          metadataHeaders: ['Subject'] 
        });
        
        const subject = emailMetadata.data.payload.headers.find(h => h.name.toLowerCase() === 'subject')?.value || '';
        const snippet = emailMetadata.data.snippet || '';

        const internalToken = jwt.sign({ id: cred.userId }, JWT_SECRET);
        const relevanceResponse = await axios.post(
          `${process.env.BACKEND_URL}/api/ai/find-relevant-app`,
          { subject, snippet, applications: cred.user.applications },
          { headers: { Authorization: `Bearer ${internalToken}` } }
        );
        
        const matchedAppId = relevanceResponse.data.decision;
        console.log(`--- [RELEVANCE]: Subject "${subject}" -> Matched App ID: ${matchedAppId}`);

        if (matchedAppId !== 'NONE') {
          const matchedApp = cred.user.applications.find(app => app.id === matchedAppId);
          if (!matchedApp) continue;

          console.log(`--- [RELEVANCE]: SUCCESS. Proceeding to full classification for "${matchedApp.company}".`);
          
          const emailFull = await gmail.users.messages.get({ userId: 'me', id: message.id, format: 'full' });
          let body = '';
          if (emailFull.data.payload.parts) {
            const part = emailFull.data.payload.parts.find(p => p.mimeType === 'text/plain');
            if (part?.body.data) body = Buffer.from(part.body.data, 'base64').toString('utf-8');
          } else if (emailFull.data.payload.body.data) {
            body = Buffer.from(emailFull.data.payload.body.data, 'base64').toString('utf-8');
          }
          if (!body) continue;

          const classificationResponse = await axios.post(`${process.env.BACKEND_URL}/api/ai/classify-email`, { subject, body }, { headers: { Authorization: `Bearer ${internalToken}` } });
          const { classification } = classificationResponse.data;
          console.log(`--- [CLASSIFICATION]: Email classified as: ${classification}`);

          let newStatus = null;
          if (classification === 'INTERVIEW') newStatus = 'Interviewing';
          else if (classification === 'REJECTION') newStatus = 'Rejected';
          else if (classification === 'OFFER') newStatus = 'Offer';
          else if (classification === 'NEXT_STEPS') newStatus = 'Interviewing';
          
          if (newStatus && matchedApp.status !== newStatus) {
            const updatedApp = await prisma.application.update({ where: { id: matchedApp.id }, data: { status: newStatus, updatedAt: new Date() } });
            console.log(`--- [SUCCESS]: Updated application "${updatedApp.roleTitle}" to status: ${newStatus}`);
            global.io.emit('application-updated', { userId: cred.userId, updatedApp });
          }

          // Mark as read so we don't process it again next time
          await gmail.users.messages.modify({ userId: 'me', id: message.id, requestBody: { removeLabelIds: ['UNREAD'] } });
        }
      }
    } catch (error) {
      if (error.response?.data?.error === 'invalid_grant' || error.message?.includes('invalid_grant')) {
        console.error(`--- [SCANNER]: ERROR! Token for ${cred.user.email} is invalid. Marking as revoked.`);
        await prisma.serviceCredential.update({ where: { id: cred.id }, data: { status: 'revoked' } });
      } else {
        console.error(`--- [SCANNER]: ERROR! A non-auth error occurred for ${cred.user.email}:`, error);
      }
    }
  }
  console.log('--- [SCANNER]: Finished periodic scan job ---');
};