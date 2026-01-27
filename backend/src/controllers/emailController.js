import { scanAllUserInboxes } from '../services/emailScanner.js';

export const triggerScan = (req, res) => {
  console.log(`--- Manual email scan triggered by user: ${req.userId} ---`);
  // Run the job in the background (don't wait for it to finish)
  scanAllUserInboxes(); 
  // Respond immediately to the user
  res.status(202).json({ message: 'Email scan has been triggered and will run in the background.' });
};