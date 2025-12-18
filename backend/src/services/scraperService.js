// backend/src/services/scraperService.js

import { chromium } from 'playwright';
import fs from 'fs'; // Import the Node.js file system module to save debug files

export const scrapeWWR_interactive = async (filters = {}) => {
  const { category = '', keywords = '', country = '', salary = '', skills = '' } = filters;

  console.log('--- LAUNCHING HEADLESS BROWSER ---');
  const browser = await chromium.launch({
    headless: true, // This MUST be true for a server/Codespaces environment
  });
  
  // Create a browser context that mimics a real user to help avoid bot detection
  const context = await browser.newContext({
    userAgent: 'Mozilla/5.o (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
  });
  const page = await context.newPage();

  const baseUrl = 'https://weworkremotely.com/remote-jobs/search';
  console.log(`Navigating to: ${baseUrl}`);

  try {
    // Navigate to the page and wait for it to be ready
    await page.goto(baseUrl, { waitUntil: 'domcontentloaded', timeout: 30000 }); // 30-second timeout
    console.log('Page navigation complete. Applying filters if any...');
    
    // --- Dynamically apply the filters that are provided ---
    if (category) {
      await page.locator('input[data-input="categories"]').fill(category);
      await page.keyboard.press('Enter');
    }
    if (keywords) {
      await page.locator('input#search--input').fill(keywords);
    }
    if (country) {
      await page.locator('input[data-input="countries"]').fill(country);
      await page.keyboard.press('Enter');
    }
    if (salary) {
      await page.locator('input[data-input="salary_ranges"]').fill(salary);
      await page.keyboard.press('Enter');
    }
    if (skills) {
      await page.locator('input[data-input="skills"]').fill(skills);
      await page.keyboard.press('Enter');
    }
    
    // Check if any filter was actually applied
    if (Object.values(filters).some(val => val && String(val).trim() !== '')) {
      console.log('Applying filters and waiting for navigation...');
      const navigationPromise = page.waitForNavigation({ waitUntil: 'domcontentloaded' });
      await page.locator('input#apply-filters-cta').click();
      await navigationPromise;
      console.log('Filtered results page loaded.');
    } else {
      console.log('No filters applied, scraping all jobs on the main page.');
    }
    
    // --- Save a screenshot for debugging to see what the final page looks like ---
    await page.screenshot({ path: 'debug_headless_view.png', fullPage: true });
    console.log('📸 Screenshot of the results page saved to debug_headless_view.png');

    const jobs = await page.evaluate(() => {
      const jobData = [];
      const jobElements = document.querySelectorAll('li.new-listing-container');
      
      jobElements.forEach(jobEl => {
        const titleElement = jobEl.querySelector('h3.new-listing__header__title');
        const companyElement = jobEl.querySelector('p.new-listing__company-name');
        const linkElement = jobEl.querySelector('a.listing-link--unlocked');
        
        if (titleElement && companyElement && linkElement) {
          const roleTitle = titleElement.innerText.trim();
          const company = companyElement.innerText.trim();
          const relativeUrl = linkElement.getAttribute('href');
          const jobUrl = `https://weworkremotely.com${relativeUrl}`;
          jobData.push({ company, roleTitle, jobUrl });
        }
      });
      return jobData;
    });
    
    console.log(`Scraping finished. Found ${jobs.length} jobs.`);
    return jobs;

  } catch (error) {
    console.error(`❌ An error occurred during scraping: ${error.message}`);
    
    // --- On error, save the page state for inspection ---
    console.log('Saving error state for debugging...');
    await page.screenshot({ path: 'error_screenshot.png', fullPage: true });
    const errorHtml = await page.content();
    fs.writeFileSync('error_page.html', errorHtml);
    console.log('📸 Error screenshot and HTML page saved to error_screenshot.png and error_page.html');

    throw error; // Propagate the error up to the controller
  } finally {
    await browser.close();
    console.log('Browser closed.');
  }
};