import Groq from 'groq-sdk';

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

const STABLE_MODEL = 'llama-3.1-8b-instant'; // Using the user-verified model for all tasks

// --- NEW, SMARTER RELEVANCE AGENT ---
export const findRelevantApplication = async (req, res) => {
  const { subject, snippet, applications } = req.body;
  if (!subject || !applications || applications.length === 0) {
    return res.status(400).json({ message: 'Subject and applications list are required.' });
  }

  const formattedApps = applications.map(app => `(ID: ${app.id}, Company: ${app.company}, Role: ${app.roleTitle})`).join('; ');

  const prompt = `
    You are an AI assistant. Your task is to identify which job application an email is for from a provided list.
    Respond with ONLY the ID of the matching application from the list, or the word "NONE" if there is no clear match.

    Here is the list of active job applications:
    [${formattedApps}]

    Now, analyze the following email subject and snippet. Does it clearly correspond to one of the applications in the list? Consider company names, role titles, or general job-related terms (like "interview", "application update").

    Email Subject: "${subject}"
    Email Snippet: "${snippet}..."

    RESPONSE (The single, most likely ID or NONE):
  `;

  try {
    const chatCompletion = await groq.chat.completions.create({
      messages: [{ role: 'user', content: prompt }],
      model: STABLE_MODEL,
      temperature: 0.0,
    });
    const decision = (chatCompletion.choices[0]?.message?.content || 'NONE').trim();
    res.status(200).json({ decision });
  } catch (error) {
    console.error('Groq Relevance Error:', error);
    res.status(500).json({ message: 'Failed to determine email relevance.' });
  }
};

// --- The Classification Agent ---
export const classifyEmail = async (req, res) => {
  const { subject, body } = req.body;
  if (!body) return res.status(400).json({ message: 'Email body is required.' });
  const prompt = `Classify the following email's intent into one of these categories: REJECTION, INTERVIEW, OFFER, NEXT_STEPS, or UNKNOWN. Respond with only a single word. Email: """Subject: ${subject}\nBody: ${body}""" Classification:`;

  try {
    const chatCompletion = await groq.chat.completions.create({ messages: [{ role: 'user', content: prompt }], model: STABLE_MODEL, temperature: 0.1 });
    const classification = (chatCompletion.choices[0]?.message?.content || 'UNKNOWN').trim().toUpperCase().replace(/[^A-Z_]/g, '');
    res.status(200).json({ classification });
  } catch (error) {
    console.error('Groq Classification Error:', error);
    res.status(500).json({ message: 'Failed to classify email.' });
  }
};

// --- The Resume Helper ---
export const suggestBulletPoints = async (req, res) => {
  const { master_profile, job_description } = req.body;
  if (!master_profile || !job_description) return res.status(400).json({ message: 'Master profile and job description are required.' });
  const prompt = `You are an expert resume writer. Based on this MASTER PROFILE: """${master_profile}""" and this JOB DESCRIPTION: """${job_description}""", generate exactly 3 impactful resume bullet points.`;
  
  try {
    const chatCompletion = await groq.chat.completions.create({ messages: [{ role: 'user', content: prompt }], model: STABLE_MODEL });
    const suggestions = chatCompletion.choices[0]?.message?.content || '';
    res.status(200).json({ suggestions });
  } catch (error) {
    console.error('Groq Suggestion Error:', error);
    res.status(500).json({ message: 'Failed to get AI suggestions.' });
  }
};