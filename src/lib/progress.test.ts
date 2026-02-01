/**
 * Unit Tests for Progress & Scoring Rules
 * 
 * Rules:
 * 1. Each stage = 10 questions
 * 2. Stage is "completed" only when answered >= 10
 * 3. Score is shown ONLY for completed stages
 * 4. Incomplete stages show "X Left" (no score)
 * 5. Topic is fully complete only when all 50 questions answered
 */

describe('Stage Completion Logic', () => {
    const QUESTIONS_PER_STAGE = 10;

    function isStageCompleted(answered: number): boolean {
        return answered >= QUESTIONS_PER_STAGE;
    }

    function shouldShowScore(answered: number): boolean {
        return isStageCompleted(answered);
    }

    function getRemainingQuestions(answered: number): number {
        return Math.max(0, QUESTIONS_PER_STAGE - answered);
    }

    function getStageStatus(answered: number): 'completed' | 'in_progress' | 'not_started' {
        if (answered === 0) return 'not_started';
        if (answered >= QUESTIONS_PER_STAGE) return 'completed';
        return 'in_progress';
    }

    // Test: Stage Completion
    test('Stage with 0 answers is NOT completed', () => {
        expect(isStageCompleted(0)).toBe(false);
    });

    test('Stage with 5 answers is NOT completed', () => {
        expect(isStageCompleted(5)).toBe(false);
    });

    test('Stage with 9 answers is NOT completed', () => {
        expect(isStageCompleted(9)).toBe(false);
    });

    test('Stage with 10 answers IS completed', () => {
        expect(isStageCompleted(10)).toBe(true);
    });

    test('Stage with 11+ answers IS completed (retake scenario)', () => {
        expect(isStageCompleted(11)).toBe(true);
        expect(isStageCompleted(15)).toBe(true);
    });

    // Test: Score Visibility
    test('Score should NOT be shown for 0 answers', () => {
        expect(shouldShowScore(0)).toBe(false);
    });

    test('Score should NOT be shown for 5 answers', () => {
        expect(shouldShowScore(5)).toBe(false);
    });

    test('Score should NOT be shown for 9 answers', () => {
        expect(shouldShowScore(9)).toBe(false);
    });

    test('Score SHOULD be shown for 10 answers', () => {
        expect(shouldShowScore(10)).toBe(true);
    });

    test('Score SHOULD be shown for 11+ answers', () => {
        expect(shouldShowScore(11)).toBe(true);
    });

    // Test: Remaining Questions
    test('0 answers means 10 remaining', () => {
        expect(getRemainingQuestions(0)).toBe(10);
    });

    test('7 answers means 3 remaining', () => {
        expect(getRemainingQuestions(7)).toBe(3);
    });

    test('10 answers means 0 remaining', () => {
        expect(getRemainingQuestions(10)).toBe(0);
    });

    test('11+ answers still means 0 remaining (no negative)', () => {
        expect(getRemainingQuestions(15)).toBe(0);
    });

    // Test: Stage Status
    test('0 answers = not_started', () => {
        expect(getStageStatus(0)).toBe('not_started');
    });

    test('1-9 answers = in_progress', () => {
        expect(getStageStatus(1)).toBe('in_progress');
        expect(getStageStatus(5)).toBe('in_progress');
        expect(getStageStatus(9)).toBe('in_progress');
    });

    test('10+ answers = completed', () => {
        expect(getStageStatus(10)).toBe('completed');
        expect(getStageStatus(11)).toBe('completed');
    });
});

describe('Topic Completion Logic', () => {
    const TOTAL_QUESTIONS = 50;
    const TOTAL_STAGES = 5;

    function isTopicCompleted(totalAnswered: number): boolean {
        return totalAnswered >= TOTAL_QUESTIONS;
    }

    function getCompletedStages(stageAnswers: number[]): number {
        return stageAnswers.filter(ans => ans >= 10).length;
    }

    function shouldShowTopicScore(totalAnswered: number): boolean {
        return isTopicCompleted(totalAnswered);
    }

    // Test: Topic Completion
    test('Topic with 0 answers is NOT completed', () => {
        expect(isTopicCompleted(0)).toBe(false);
    });

    test('Topic with 30 answers is NOT completed', () => {
        expect(isTopicCompleted(30)).toBe(false);
    });

    test('Topic with 49 answers is NOT completed', () => {
        expect(isTopicCompleted(49)).toBe(false);
    });

    test('Topic with 50 answers IS completed', () => {
        expect(isTopicCompleted(50)).toBe(true);
    });

    // Test: Completed Stages Count
    test('No stages completed when all have < 10 answers', () => {
        expect(getCompletedStages([5, 3, 7, 0, 0])).toBe(0);
    });

    test('2 stages completed when 2 have >= 10 answers', () => {
        expect(getCompletedStages([10, 11, 5, 0, 0])).toBe(2);
    });

    test('5 stages completed when all have >= 10 answers', () => {
        expect(getCompletedStages([10, 10, 10, 10, 10])).toBe(5);
    });

    // Test: Topic Score Visibility
    test('Topic score NOT shown until all 50 answered', () => {
        expect(shouldShowTopicScore(40)).toBe(false);
        expect(shouldShowTopicScore(49)).toBe(false);
    });

    test('Topic score IS shown when 50 answered', () => {
        expect(shouldShowTopicScore(50)).toBe(true);
    });
});

describe('Score Color Coding', () => {
    function getScoreColor(score: number): 'green' | 'orange' | 'red' {
        if (score >= 70) return 'green';
        if (score >= 40) return 'orange';
        return 'red';
    }

    test('Score 0-39% is RED', () => {
        expect(getScoreColor(0)).toBe('red');
        expect(getScoreColor(20)).toBe('red');
        expect(getScoreColor(39)).toBe('red');
    });

    test('Score 40-69% is ORANGE', () => {
        expect(getScoreColor(40)).toBe('orange');
        expect(getScoreColor(55)).toBe('orange');
        expect(getScoreColor(69)).toBe('orange');
    });

    test('Score 70-100% is GREEN', () => {
        expect(getScoreColor(70)).toBe('green');
        expect(getScoreColor(85)).toBe('green');
        expect(getScoreColor(100)).toBe('green');
    });
});
