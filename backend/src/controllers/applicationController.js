import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export const getApplications = async (req, res) => {
  try {
    const applications = await prisma.application.findMany({ where: { userId: req.userId }, orderBy: { id: 'desc' } });
    res.status(200).json(applications);
  } catch (error) {
    res.status(500).json({ message: 'Failed to retrieve applications.' });
  }
};
export const createApplication = async (req, res) => {
  const { company, roleTitle, status, jobUrl } = req.body;
  if (!company || !roleTitle) return res.status(400).json({ message: 'Company and Role Title are required.' });
  try {
    const newApplication = await prisma.application.create({ data: { company, roleTitle, status: status || 'Applied', jobUrl, userId: req.userId } });
    res.status(201).json(newApplication);
  } catch (error) {
    res.status(500).json({ message: 'Failed to create application.' });
  }
};
export const updateApplication = async (req, res) => {
  const { id } = req.params;
  const { company, roleTitle, status, jobUrl } = req.body;
  try {
    const result = await prisma.application.updateMany({ where: { id: id, userId: req.userId }, data: { company, roleTitle, status, jobUrl } });
    if (result.count === 0) return res.status(404).json({ message: 'Application not found or user not authorized.' });
    const updatedApplication = await prisma.application.findUnique({ where: { id } });
    res.status(200).json(updatedApplication);
  } catch (error) {
    res.status(500).json({ message: 'Failed to update application.' });
  }
};
export const deleteApplication = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await prisma.application.deleteMany({ where: { id: id, userId: req.userId } });
    if (result.count === 0) return res.status(404).json({ message: 'Application not found or user not authorized.' });
    res.status(200).json({ message: 'Application deleted successfully.' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete application.' });
  }
};