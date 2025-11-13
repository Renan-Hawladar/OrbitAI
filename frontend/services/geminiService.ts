
import { GoogleGenAI, Type } from '@google/genai';
import { UserProfile, CareerPath } from '../types';

if (!process.env.API_KEY) {
  // This is a placeholder check. In a real environment, the API key is expected to be set.
  console.warn("API_KEY environment variable not set. Using a placeholder. This will fail if not replaced.");
  process.env.API_KEY = "YOUR_API_KEY_HERE";
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const careerPathSchema = {
  type: Type.ARRAY,
  items: {
    type: Type.OBJECT,
    properties: {
      career_path: {
        type: Type.STRING,
        description: "The name of the career path.",
      },
      suitability_reason: {
        type: Type.STRING,
        description: "A brief explanation of why this career path is a good fit for the user.",
      },
      required_skills: {
        type: Type.ARRAY,
        items: {
          type: Type.STRING,
        },
        description: "A list of essential domain-specific skills to acquire.",
      },
      roadmap: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            step: {
              type: Type.INTEGER,
            },
            action: {
              type: Type.STRING,
              description: "A clear action for this step.",
            },
            details: {
              type: Type.STRING,
              description: "More details about the action to be taken.",
            },
          },
          required: ["step", "action", "details"],
        },
        description: "A sequential, step-by-step plan to achieve this career.",
      },
    },
    required: ["career_path", "suitability_reason", "required_skills", "roadmap"],
  },
};

const generatePrompt = (profile: UserProfile, careerQuery?: string): string => {
  let prompt = `
    Analyze the following user profile:
    - Name: ${profile.name}
    - Current Degree: ${profile.degree}
    - Qualifications: ${profile.qualifications}
    - Skills: ${profile.skills}
    - CV/Resume Text: """${profile.cvText}"""
  `;

  if (careerQuery) {
    prompt += `
      The user is specifically interested in a career as a "${careerQuery}". 
      Based on their profile, create a single, detailed, personalized roadmap for them to achieve this career. 
      Explain why this path might be suitable or what challenges they might face.
      The roadmap should include essential skills to learn, projects to build, certifications to get, and networking advice.
      Provide only the single most relevant career path object in the JSON array.
    `;
  } else {
    prompt += `
      Based on the user's profile, identify the top 5 most suitable career paths. 
      For each path, provide a detailed, step-by-step roadmap for success.
      The roadmap should include essential skills to learn, projects to build, certifications to get, and networking advice.
    `;
  }
  return prompt;
};

const callGemini = async <T,>(prompt: string): Promise<T> => {
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: 'application/json',
                responseSchema: careerPathSchema,
                temperature: 0.5,
            },
        });

        const jsonText = response.text.trim();
        return JSON.parse(jsonText) as T;
    } catch (error) {
        console.error("Error calling Gemini API:", error);
        if (error instanceof Error && error.message.includes('429')) {
             throw new Error("The AI service is currently busy due to high demand. Please wait a moment and try again.");
        }
        throw new Error("Failed to get a valid response from the AI. Please check your profile details and try again.");
    }
}

export const analyzeCareerPaths = async (profile: UserProfile): Promise<CareerPath[]> => {
  const prompt = generatePrompt(profile);
  return callGemini<CareerPath[]>(prompt);
};

export const searchCareerPath = async (profile: UserProfile, careerQuery: string): Promise<CareerPath[]> => {
  const prompt = generatePrompt(profile, careerQuery);
  return callGemini<CareerPath[]>(prompt);
};
