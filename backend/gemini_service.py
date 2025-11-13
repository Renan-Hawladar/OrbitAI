import httpx
import json
from typing import List, Dict, Any
from fastapi import HTTPException

class GeminiService:
    def __init__(self, api_key: str):
        self.api_key = api_key
        self.base_url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent"
    
    async def analyze_career_paths(self, profile_data: Dict[str, Any]) -> List[Dict[str, Any]]:
        """
        Analyze user profile and suggest top 5 career paths.
        """
        prompt = self._generate_analysis_prompt(profile_data)
        return await self._call_gemini(prompt)
    
    async def search_career_path(self, profile_data: Dict[str, Any], career_query: str) -> List[Dict[str, Any]]:
        """
        Search for a specific career path based on user query.
        """
        prompt = self._generate_search_prompt(profile_data, career_query)
        return await self._call_gemini(prompt)
    
    def _generate_analysis_prompt(self, profile: Dict[str, Any]) -> str:
        cv_text = profile.get('cv_text', 'Not provided')
        prompt = f"""
Analyze the following user profile:
- Name: {profile.get('name', 'Not provided')}
- Current Degree: {profile.get('degree', 'Not provided')}
- Qualifications: {profile.get('qualifications', 'Not provided')}
- Skills: {profile.get('skills', 'Not provided')}
- CV/Resume Text: {cv_text}

Based on the user's profile, identify the top 5 most suitable career paths.
For each path, provide a detailed, step-by-step roadmap for success.
The roadmap should include essential skills to learn, projects to build, certifications to get, and networking advice.

Respond with ONLY a valid JSON array in this exact format:
[
  {{{{
    "career_path": "Career Name",
    "suitability_reason": "Brief explanation of why this fits",
    "required_skills": ["Skill 1", "Skill 2", "Skill 3"],
    "roadmap": [
      {{{{
        "step": 1,
        "action": "Action title",
        "details": "Detailed description"
      }}}}
    ]
  }}}}
]
"""
        return prompt
    
    def _generate_search_prompt(self, profile: Dict[str, Any], career_query: str) -> str:
        cv_text = profile.get('cv_text', 'Not provided')
        prompt = f"""
Analyze the following user profile:
- Name: {profile.get('name', 'Not provided')}
- Current Degree: {profile.get('degree', 'Not provided')}
- Qualifications: {profile.get('qualifications', 'Not provided')}
- Skills: {profile.get('skills', 'Not provided')}
- CV/Resume Text: {cv_text}

The user is specifically interested in a career as a "{career_query}".
Based on their profile, create a single, detailed, personalized roadmap for them to achieve this career.
Explain why this path might be suitable or what challenges they might face.
The roadmap should include essential skills to learn, projects to build, certifications to get, and networking advice.

Respond with ONLY a valid JSON array containing a single career path object in this exact format:
[
  {{{{
    "career_path": "{career_query}",
    "suitability_reason": "Detailed explanation",
    "required_skills": ["Skill 1", "Skill 2", "Skill 3"],
    "roadmap": [
      {{{{
        "step": 1,
        "action": "Action title",
        "details": "Detailed description"
      }}}}
    ]
  }}}}
]
"""
        return prompt
    
    async def _call_gemini(self, prompt: str) -> List[Dict[str, Any]]:
        try:
            async with httpx.AsyncClient(timeout=60.0) as client:
                response = await client.post(
                    f"{self.base_url}?key={self.api_key}",
                    json={
                        "contents": [{
                            "parts": [{"text": prompt}]
                        }],
                        "generationConfig": {
                            "temperature": 0.5,
                            "topK": 40,
                            "topP": 0.95,
                            "maxOutputTokens": 8192,
                        }
                    },
                    headers={"Content-Type": "application/json"}
                )
                
                if response.status_code != 200:
                    raise HTTPException(
                        status_code=response.status_code,
                        detail=f"Gemini API error: {response.text}"
                    )
                
                result = response.json()
                
                # Extract text from response
                if 'candidates' in result and len(result['candidates']) > 0:
                    text_content = result['candidates'][0]['content']['parts'][0]['text']
                    
                    # Clean up the response to extract JSON
                    text_content = text_content.strip()
                    if text_content.startswith('```json'):
                        text_content = text_content[7:]
                    if text_content.startswith('```'):
                        text_content = text_content[3:]
                    if text_content.endswith('```'):
                        text_content = text_content[:-3]
                    text_content = text_content.strip()
                    
                    # Parse JSON
                    career_paths = json.loads(text_content)
                    return career_paths
                else:
                    raise HTTPException(status_code=500, detail="No valid response from Gemini API")
                    
        except json.JSONDecodeError as e:
            raise HTTPException(status_code=500, detail=f"Failed to parse Gemini response: {str(e)}")
        except httpx.TimeoutException:
            raise HTTPException(status_code=504, detail="Gemini API request timed out")
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Error calling Gemini API: {str(e)}")