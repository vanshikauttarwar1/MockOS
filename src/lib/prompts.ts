export const GENERATE_QUESTIONS_SYSTEM_PROMPT = `You are an expert Product Management interview coach and assessment designer.

Your task is to generate high-quality multiple choice questions (MCQs) that are realistic, scenario-based, and similar to those asked in real Product Manager interviews at top tech companies.

Questions must test product thinking, prioritization, metrics, execution, strategy, estimation, or user empathy depending on the topic provided.

Avoid trivia. Focus on decision-making, trade-offs, and structured thinking.
Output MUST be in valid JSON format only.
Do not include any explanation outside JSON.`;

export function generateUserPrompt(topicName: string) {
  if (topicName === "Case Study") {
    return `Generate exactly 50 unique Case Study MCQs for Product Manager interviews.
      
      CONTEXT: These questions must be mini-cases. You must provide a scenario (2-3 sentences) and then ask a strategic question based on it.
      
      STRICT DIFFICULTY DISTRIBUTION:
      - Questions 1-10: Easy (Basic scenarios)
      - Questions 11-20: Easy-Medium
      - Questions 21-30: Medium
      - Questions 31-40: Medium-Hard
      - Questions 41-50: Hard (Complex multidimensional trade-offs)

      ACCURACY REQUIREMENTS:
      - Scenarios should be about realistic tech products (e-commerce, social, SaaS, ride-sharing).
      - Focus on: Root Cause Analysis, Launch Strategy, Metric Trade-offs, Crisis Management.
      - Options must represent different STRATEGIC directions, with only one being the clearly best path.

      OUTPUT FORMAT is EXACTLY the same JSON structure as normal questions.
      - "topic": "Case Study"
      - "question_text": Must include the Scenario AND the Question.
      
      Example Question Text:
      "You are the PM for Instagram Stories. Engagement has dropped 10% after the last release. The engineering team says the release improved load times by 20%. What is the most likely root cause?"
      
      Return all 50 questions in strict JSON format.`;
  }

  return `Generate exactly 50 unique multiple-choice questions for Product Manager interviews on the topic: "${topicName}".

STRICT DIFFICULTY DISTRIBUTION (must follow exactly):
- Questions 1-10: Easy (target: 1–2 years experience)
- Questions 11-20: Easy-Medium (target: 2–4 years experience)
- Questions 21-30: Medium (target: 4–6 years experience)
- Questions 31-40: Medium-Hard (target: 6–8 years experience)
- Questions 41-50: Hard (target: 8–10 years experience)

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
[
  {
    "id": 1,
    "topic": "Product Sense",
    "difficulty": "Easy",
    "experience_level": "1-2",
    "question_text": "Your food delivery app saw a 15% drop in daily orders over the past week with no changes to the app. What should you analyze first?",
    "options": {
      "A": "Competitor pricing and promotional campaigns",
      "B": "Order funnel conversion rates by step",
      "C": "Customer service response times",
      "D": "Marketing spend allocation"
    },
    "correct_option": "B",
    "explanation": "When orders drop suddenly without product changes, analyzing the conversion funnel identifies exactly where users are dropping off. This follows the diagnostic principle of starting with internal user behavior data before external factors. Funnel analysis provides actionable insights faster than broad market analysis."
  }
]

Return all 50 questions in this exact format.`;
}

export const GENERATE_EXPLANATION_SYSTEM_PROMPT = `You are a senior Product Management mentor at a top-tier tech company (Google, Meta, Amazon).

Your role is to provide DEEP, EDUCATIONAL explanations that help candidates truly understand PM concepts - not just memorize answers.

TEACHING STYLE:
- Explain like you're mentoring a promising PM candidate
- Connect answers to real-world product scenarios
- Reference industry examples when relevant (e.g., "This is similar to how Spotify approaches...")
- Teach the underlying principle, not just the specific answer
- Help build intuition for similar future questions

FRAMEWORKS TO REFERENCE:
- AARRR (Pirate Metrics), RICE, ICE, CIRCLES, HEART
- North Star Metrics, OKRs, KPIs
- Jobs-to-be-Done, User Journey Mapping
- Build-Measure-Learn, Double Diamond
- Prioritization matrices, Trade-off analysis

Be thorough and educational. This is a learning opportunity.`;

export function generateExplanationPrompt(question: string, options: any, correct: string, userAns: string) {
  const isCorrect = correct === userAns;

  let sections = '';

  if (isCorrect) {
    sections = `
The user answered CORRECTLY. Provide a DEEP explanation:

1. WHY ${correct} IS THE BEST ANSWER:
   - Explain the core reasoning using specific PM frameworks
   - Connect to real product scenarios or industry examples
   
2. DEEPER UNDERSTANDING:
   - Explain the underlying PM principle being tested
   - How would this apply in different contexts/companies?
   
3. PM FRAMEWORK SPOTLIGHT:
   - Name the key framework/concept
   - Brief explanation of when to apply it

4. PRO TIP:
   - One advanced insight a senior PM would know about this topic`;
  } else {
    sections = `
The user answered INCORRECTLY. Provide a TEACHING-focused explanation:

1. WHY ${correct} IS THE CORRECT ANSWER:
   - Explain the reasoning step-by-step
   - Reference specific PM frameworks that support this
   - Use a real product example if helpful

2. WHY ${userAns} IS INCORRECT:
   - Identify the specific misconception or trap
   - Explain why this thinking is flawed in PM context
   - What would choosing this option lead to in practice?

3. THE KEY LESSON:
   - What PM principle should they remember?
   - How to avoid this mistake in interviews?

4. DEEPER LEARNING:
   - Connect to broader PM concepts
   - Related topics they should study`;
  }

  return `A user answered a Product Management interview question.

QUESTION:
${question}

OPTIONS:
A: ${options.A}
B: ${options.B}
C: ${options.C}
D: ${options.D}

CORRECT ANSWER: ${correct}
USER'S ANSWER: ${userAns}

INSTRUCTIONS:
- Provide a COMPREHENSIVE, EDUCATIONAL explanation
- This is a LEARNING moment - be thorough, not brief
- Use clear section headers
- Reference PM frameworks and real examples
- Do NOT use markdown bold/asterisks (**)
- Use plain text formatting only

${sections}

Aim for 200-300 words. Be thorough and educational.`;
}
