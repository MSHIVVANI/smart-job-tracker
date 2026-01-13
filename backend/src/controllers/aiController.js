import Groq from 'groq-sdk';

// Initialize the Groq client with the API key from your .env file
const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export const suggestBulletPoints = async (req, res) => {
  const { master_profile, job_description } = req.body;

  if (!master_profile || !job_description) {
    return res.status(400).json({ message: 'Master profile and job description are required.' });
  }

  // Define the detailed prompt for the AI model
  const prompt = `
    You are an expert career coach specializing in resume optimization.
    Based on the following MASTER PROFILE and the JOB DESCRIPTION, generate exactly 3 concise, impactful resume bullet points.
    Each bullet point must start with a powerful action verb and focus on quantifiable achievements where possible.
    Do not add any introductory text, closing remarks, or markdown formatting like asterisks. Only provide the 3 bullet points, each on a new line.

    MASTER PROFILE:
    ---
    ${master_profile}
    ---

    JOB DESCRIPTION:
    ---
    ${job_description}
    ---

    TAILORED BULLET POINTS:
  `;

  try {
    // Define the model we are going to use.
    const modelToUse = 'llama-3.3-70b-versatile';

    // --- TRACER BULLET LOG ---
    // This will print to your terminal to prove the correct model is being used.
    console.log(`--- SENDING REQUEST TO GROQ WITH MODEL: ${modelToUse} ---`);

    const chatCompletion = await groq.chat.completions.create({
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
      model: modelToUse, // Use the variable here
      temperature: 0.7,  // Controls creativity of the response
      max_tokens: 300,   // Sets a limit on the length of the response
    });

    const suggestions = chatCompletion.choices[0]?.message?.content || '';
    console.log('--- RECEIVED SUGGESTIONS FROM GROQ API ---');
    res.status(200).json({ suggestions });

  } catch (error) {
    console.error('--- GROQ AI ERROR ---:', error);
    res.status(500).json({ message: 'Failed to get AI suggestions from Groq.' });
  }
};
export const classifyEmail = async (req, res) => {
  const { subject, body } = req.body;
  if (!body) {
    return res.status(400).json({ message: 'Email body is required.' });
  }

  const prompt = `
    Analyze the following email and classify its intent.
    The possible classifications are: REJECTION, INTERVIEW, NEXT_STEPS, UNKNOWN.
    You must respond with only a single word from this list and nothing else.

    Email to analyze:
    """
    Subject: ${subject}
    Body: ${body}
    """

    Classification:
  ` ;

  try {
    const chatCompletion = await groq.chat.completions.create({
      messages: [{ role: 'user', content: prompt }],
      model: 'allam-2-7b', // A smaller, faster model is perfect for classification
      temperature: 0.1, // Low temperature for consistent, non-creative answers
    });
    const classification = chatCompletion.choices[0]?.message?.content.trim().toUpperCase() || 'UNKNOWN';
    res.status(200).json({ classification });
  } catch (error) {
    console.error('Groq email classification error:', error);
    res.status(500).json({ message: 'Failed to classify email.' });
  }
};