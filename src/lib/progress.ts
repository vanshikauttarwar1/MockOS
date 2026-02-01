
/**
 * Calculates the current stage and completion status based on user answers.
 * 
 * Rules:
 * - 5 Stages total.
 * - Each Stage has 10 questions.
 * - Stage 1: Questions 1-10
 * - Stage 2: Questions 11-20
 * ...
 * - A stage is "Complete" if >= 10 questions are answered in it.
 * - Current Stage is the first incomplete stage.
 * - If all stages are complete, Current Stage is 5 (or marked as All Complete).
 */
export function calculateProgress(userAnswers: { stageNumber: number }[]) {
    const answersByStage: Record<number, number> = {};

    // Count answers per stage
    userAnswers.forEach(a => {
        const s = a.stageNumber;
        answersByStage[s] = (answersByStage[s] || 0) + 1;
    });

    let completedStages = 0;
    let currentStage = 1;

    // Check stages 1 to 5
    for (let i = 1; i <= 5; i++) {
        const count = answersByStage[i] || 0;
        if (count >= 10) {
            completedStages = i;
        } else {
            currentStage = i;
            break;
        }
    }

    // Edge case: All 5 completed
    if (completedStages === 5) {
        currentStage = 5;
    }

    const allStagesCompleted = completedStages === 5;

    // Return counts for display (e.g., "3 remaining")
    const questionsAnsweredInCurrentStage = answersByStage[currentStage] || 0;
    const questionsRemainingInStage = Math.max(0, 10 - questionsAnsweredInCurrentStage);

    return {
        currentStage,
        allStagesCompleted,
        questionsRemainingInStage,
        completedStages // Export this
    };
}
