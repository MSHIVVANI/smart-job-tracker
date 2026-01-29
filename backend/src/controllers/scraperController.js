import axios from 'axios';

const JOBS_PER_PAGE = 10; // The number of results JSearch returns per page

export const findJobs = async (req, res) => {
  const { filters, page } = req.body;
  const { category, keywords, country, skills, salary } = filters;
  const currentPage = parseInt(page || '1', 10);

  const query = [category, keywords, country, skills, salary].filter(Boolean).join(' ').trim();

  if (!query) {
    return res.status(400).json({ message: 'At least one filter field must be filled.' });
  }

  const options = {
    method: 'GET',
    url: 'https://jsearch.p.rapidapi.com/search',
    params: {
      query: query,
      page: currentPage.toString(),
    },
    headers: {
      'X-RapidAPI-Key': process.env.JSEARCH_API_KEY,
      'X-RapidAPI-Host': 'jsearch.p.rapidapi.com'
    }
  };

  try {
    console.log(`--- [JSEARCH]: Sending request for page ${currentPage} with query: "${query}"`);
    const response = await axios.request(options);

    const apiData = response.data.data || []; // Default to an empty array if data is missing
    
    // --- THIS IS THE DEFINITIVE FIX ---
    let totalPages = 0;
    if (apiData.length > 0) {
      // If we received a full page of results, we assume there is at least one more page.
      if (apiData.length === JOBS_PER_PAGE) {
        totalPages = currentPage + 1;
      } else {
        // If we received less than a full page, this must be the last page.
        totalPages = currentPage;
      }
    }
    // ------------------------------------

    const formattedJobs = apiData.map(job => ({
      company: job.employer_name,
      roleTitle: job.job_title,
      jobUrl: job.job_apply_link || `https://www.google.com/search?q=${encodeURIComponent(job.job_title + ' ' + job.employer_name)}`,
      source: job.job_publisher,
    }));
    
    console.log(`--- [JSEARCH]: Received ${formattedJobs.length} jobs. Reporting total pages as: ${totalPages}`);
    
    res.status(200).json({ jobs: formattedJobs, totalPages: totalPages });

  } catch (error) {
    console.error('JSearch API error:', error.response ? error.response.data : error.message);
    res.status(500).json({ message: 'An error occurred while fetching jobs from the Job Search API.' });
  }
};