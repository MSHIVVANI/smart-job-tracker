import { scrapeWWR_interactive as scrapeWWR } from '../services/scraperService.js';

export const findJobs = async (req, res) => {
  const filters = req.body;
  const hasFilters = Object.values(filters).some(val => val && String(val).trim() !== '');
  if (!hasFilters) return res.status(400).json({ message: 'At least one filter field must be filled.' });
  try {
    console.log('Controller starting scrape with filters:', filters);
    const jobs = await scrapeWWR(filters);
    res.status(200).json(jobs);
  } catch (error) {
    console.error('Scraping failed in controller:', error);
    res.status(500).json({ message: 'An error occurred while scraping for jobs.' });
  }
};