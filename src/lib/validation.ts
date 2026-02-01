/**
 * Utility to validate AI generated questions.
 */
export function validateQuestions(questions: { id: number; question_text: string; options: Record<string, string>; correct_option: string; explanation: string }[]): boolean {
    if (!Array.isArray(questions) || questions.length !== 50) return false;

    const ids = new Set();
    for (const q of questions) {
        if (!q.id || ids.has(q.id)) return false;
        ids.add(q.id);

        if (!q.question_text || !q.options || !q.correct_option || !q.explanation) return false;
        if (Object.keys(q.options).length !== 4) return false;
    }

    return true;
}

/**
 * Utility to validate AI generated explanations.
 */
export function validateExplanation(text: string): boolean {
    if (!text || text.length < 50) return false;

    // Must contain an example
    if (!text.toLowerCase().includes('example')) return false;

    // Banned phrases check (Post-Refactor)
    const banned = ['real-world', 'real-life'];
    for (const b of banned) {
        if (text.toLowerCase().includes(b)) return false;
    }
    return true;
}
