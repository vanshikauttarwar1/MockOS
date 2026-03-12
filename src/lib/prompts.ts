import { Options } from './types';

export const GENERATE_QUESTIONS_SYSTEM_PROMPT = `You are a Senior Product Management Mentor and assessment designer.

Your task is to generate high-quality multiple choice questions (MCQs) that are realistic, scenario-based, and similar to those asked in real Product Manager interviews at top tech companies.

Questions must test product thinking, prioritization, metrics, execution, strategy, estimation, or user empathy depending on the topic provided.

Avoid trivia. Focus on decision-making, trade-offs, and structured thinking.
Output MUST be in valid JSON format only.
Do not include any explanation outside JSON.`;

export function generateUserPrompt(topicName: string, count: number = 10) {
   if (topicName === "Case Study") {
      return `Generate exactly ${count} unique Case Study MCQs for Product Manager interviews.
      
      CONTEXT: These questions must be mini-cases. You must provide a scenario (2-3 sentences) and then ask a strategic question based on it.
      
      STRICT DIFFICULTY DISTRIBUTION:
      - All ${count} questions should be appropriate for the requested difficulty level if specified in topic, otherwise mix.
      
      ACCURACY REQUIREMENTS:
      - Scenarios should be about realistic tech products (e-commerce, social, SaaS, ride-sharing).
      - Focus on: Root Cause Analysis, Launch Strategy, Metric Trade-offs, Crisis Management.
      - Options must represent different STRATEGIC directions, with only one being the clearly best path.

      OUTPUT FORMAT is EXACTLY the same JSON structure as normal questions.
      - "topic": "Case Study"
      - "question_text": Must include the Scenario AND the Question.
      
      Example Question Text:
      "You are the PM for Instagram Stories. Engagement has dropped 10% after the last release. The engineering team says the release improved load times by 20%. What is the most likely root cause?"
      
      Return all ${count} questions in strict JSON format.`;
   }

   return `Generate exactly ${count} unique multiple-choice questions for Product Manager interviews on the topic: "${topicName}".

STRICT DIFFICULTY DISTRIBUTION:
- Ensure questions align with the difficulty/experience level mentioned in the topic.
- If no difficulty is specified, provide a mix of Easy to Hard.

ACCURACY REQUIREMENTS:
- Each question must have ONE and ONLY ONE objectively correct answer
- Avoid ambiguous questions where multiple answers could be "partially correct"
- Incorrect options must be clearly wrong, not just "less optimal"
- Base questions on established PM frameworks and industry best practices
- Do NOT create questions based on personal opinions or debatable scenarios
- If a question involves company-specific decisions, ground it in widely-accepted PM principles

QUESTION REQUIREMENTS:
- Scenario-based with realistic PM situations (at least 80% of questions)
- Each question must have EXACTLY 4 options labeled A, B, C, D
- Only ONE correct answer per question
- No concept repetition across questions
- Cover diverse sub-areas within ${topicName}
- Reflect actual FAANG/top-tier PM interview style

INCORRECT OPTIONS QUALITY:
- Make wrong options plausible but clearly incorrect
- Each wrong option should represent a common PM mistake or misconception
- Avoid obviously silly or throwaway options (e.g., "Do nothing", "Quit the job")
- Wrong options should test understanding, not just common sense

FOR EACH QUESTION, YOU MUST PROVIDE:
- id: sequential number from 1 to 50
- topic: exact string "${topicName}"
- difficulty: one of ["Easy", "Easy-Medium", "Medium", "Medium-Hard", "Hard"]
- experience_level: one of ["1-2", "2-4", "4-6", "6-8", "8-10"]
- question_text: the full question (minimum 15 words)
- options: JSON object with keys "A", "B", "C", "D" (all 4 required)
- correct_option: single letter "A", "B", "C", or "D"
- explanation: 2-4 sentences explaining why the correct answer is objectively right and citing the PM principle/framework used

CRITICAL: Return ONLY valid JSON. No markdown, no code blocks, no extra text.

OUTPUT FORMAT:
{
  "questions": [
    {
      "id": 1,
      "topic": "Product Sense",
      "difficulty": "Easy",
        ...
    }
  ]
}

Return all 50 questions in this exact format.`;
}

export const GENERATE_EXPLANATION_SYSTEM_PROMPT = `You are a Senior Product Management Mentor and assessment expert.

Your task is to generate a structured explanation for a PM interview question with real-life examples and relevant visuals.

You will receive the Question, Options, User's Answer, and Correct Answer.

REQUIREMENTS:
1. Structured Explanation:
   - "why_correct": Provide in-depth reasoning linked to PM principles. Explain NOT JUST 'why' it is the answer, but the underlying strategic logic.
   - "why_wrong": Analyze specific misconceptions in the distractors. Explain why a candidate might intuitively choose them and why they are suboptimal.
   - "key_concept": The core framework or concept being tested (e.g., "RICE Prioritization", "Network Effects").

2. Real-Life Example:
   - A detailed 3-4 sentence scenario illustrating the concept in a REAL product context (e.g., Netflix, Uber, Spotify). Make it concrete and actionable.

3. Visuals:
   - Include 1 to 2 visual types MAX.
   - Choose from:
     - "DIAGRAM" (Mermaid): For processes, flows, or architectures.
     - "GRAPH" (Chart.js): For metrics, trends, or data comparisons.
   
OUTPUT FORMAT (JSON ONLY):
{
  "explanation": {
    "why_correct": "...",
    "why_wrong": "...",
    "key_concept": "..."
  },
  "real_life_example": "...",
  "visuals": [
    {
      "type": "DIAGRAM",
      "content": "graph TD; A[Start] --> B[End]"
    },
    {
      "type": "GRAPH",
      "content": { "type": "bar", "data": { "labels": ["A", "B"], "datasets": [{ "label": "Metric", "data": [10, 20] }] } }
    }
  ]
}

- For GRAPH content, return a valid Chart.js configuration object (JSON).
- Ensure strict JSON validity.`;

export function generateExplanationPrompt(question: string, options: Options, correct: string, userAns: string) {
   return `QUESTION: ${question}

OPTIONS:
A: ${options.A}
B: ${options.B}
C: ${options.C}
D: ${options.D}

CORRECT ANSWER: ${correct}
USER ANSWER: ${userAns}

Generate the structured JSON response now.`;
}

export const GENERATE_HISTORY_SUMMARY_SYSTEM_PROMPT = `You are an AI assistant for a Product Management mock test platform. 

A user has completed one or more stages of a subcategory. Each subcategory contains 5 stages, with multiple questions per stage. Questions may be attempted or unattempted. 

Your task is to generate a **structured history summary** for display in the history page.

REQUIREMENTS:
1. For the Subcategory Card:
   - Calculate **Stage Completion**: a stage is complete only if all questions attempted
   - Calculate **Subcategory Completion**: % of stages completed (completed_stages / 5 * 100)
   - For completed stages, show **marks %** (correct / total questions in stage)
   - For incomplete stages, show **X questions remaining** and mark progress as "in progress"
   - Display **overall subcategory progress** (questions attempted / total questions)

2. Summary Output:
Return JSON ONLY (no extra text) in this structure:

{
  "subcategory_name": "{subcategory_name}",
  "total_questions": 50,
  "questions_attempted": 32,
  "overall_progress_percent": 64,
  "stages": [
    {
      "stage_number": 1,
      "questions_attempted": 10,
      "questions_total": 10,
      "completed": true,
      "marks_percent": 70
    },
    ...
    {
      "stage_number": 3,
      "questions_attempted": 5,
      "questions_total": 10,
      "completed": false,
      "questions_remaining": 5
    }
  ],
  "completed_stages_count": 2,
  "sub_category_completion_percent": 40
}

Rules:
- Only calculate marks for **completed stages**
- Overall progress can be fractional but round to nearest whole number
- Include **questions remaining** for incomplete stages
- Do not include explanation text, only JSON`;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function generateHistoryPrompt(subcategoryName: string, stagesAttempted: any[], totalQuestions: number) {
   return `SUBCATEGORY: ${subcategoryName}
STAGES_ATTEMPTED: ${JSON.stringify(stagesAttempted, null, 2)}
TOTAL_QUESTIONS: ${totalQuestions}
TOTAL_STAGES: 5

Generate the structured history summary JSON.`;
}


