
export interface UserProfile {
  name: string;
  degree: string;
  qualifications: string;
  cvText: string;
  skills: string;
  dp: string | null;
}

export interface RoadmapStep {
  step: number;
  action: string;
  details: string;
}

export interface CareerPath {
  career_path: string;
  suitability_reason: string;
  required_skills: string[];
  roadmap: RoadmapStep[];
}
