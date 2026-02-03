import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

// --- GET all applications for the logged-in user ---
export const getApplications = async (req, res) => {
  try {
    const applications = await prisma.application.findMany({
      where: { userId: req.userId },
      orderBy: { id: 'desc' },
    });
    res.status(200).json(applications);
  } catch (error) {
    res.status(500).json({ message: 'Failed to retrieve applications.' });
  }
};

// --- CREATE a new application ---
export const createApplication = async (req, res) => {
  const { company, roleTitle, status, jobUrl, notes, interviewDate, offerDeadline, followUpDate } = req.body;
  
  if (!company || !roleTitle) {
      return res.status(400).json({ message: 'Company and Role Title are required.' });
  }

  try {
    const newApplication = await prisma.application.create({
      data: {
        company,
        roleTitle,
        status: status || 'Applied',
        jobUrl,
        notes,
        // Convert empty strings to null, otherwise save the date
        interviewDate: interviewDate ? new Date(interviewDate) : null,
        offerDeadline: offerDeadline ? new Date(offerDeadline) : null,
        followUpDate: followUpDate ? new Date(followUpDate) : null,
        userId: req.userId,
      },
    });
    res.status(201).json(newApplication);
  } catch (error) {
    console.error('Create Application Error:', error);
    res.status(500).json({ message: 'Failed to create application.' });
  }
};

// --- UPDATE an existing application ---
export const updateApplication = async (req, res) => {
  const { id } = req.params;
  // EXTRACT ALL FIELDS FROM BODY
  const { company, roleTitle, status, jobUrl, notes, interviewDate, offerDeadline, followUpDate } = req.body;
  
  try {
    const result = await prisma.application.updateMany({
      where: { id: id, userId: req.userId },
      data: { 
        company, 
        roleTitle, 
        status, 
        jobUrl,
        notes,
        // Convert strings back to Date objects for Prisma
        interviewDate: interviewDate ? new Date(interviewDate) : null,
        offerDeadline: offerDeadline ? new Date(offerDeadline) : null,
        followUpDate: followUpDate ? new Date(followUpDate) : null,
      },
    });

    if (result.count === 0) {
      return res.status(404).json({ message: 'Application not found or user not authorized.' });
    }
    const updatedApplication = await prisma.application.findUnique({ where: { id } });
    res.status(200).json(updatedApplication);
  } catch (error) {
    console.error('Update Application Error:', error);
    res.status(500).json({ message: 'Failed to update application.' });
  }
};

// --- DELETE an application ---
export const deleteApplication = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await prisma.application.deleteMany({
      where: { id: id, userId: req.userId },
    });

    if (result.count === 0) {
      return res.status(404).json({ message: 'Application not found or user not authorized.' });
    }
    res.status(200).json({ message: 'Application deleted successfully.' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete application.' });
  }
};