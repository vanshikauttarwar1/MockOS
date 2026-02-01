import { calculateProgress } from './progress';

describe('calculateProgress business logic', () => {
    test('marks stage as complete with 10 answers', () => {
        const answers = Array(10).fill({ stageNumber: 1 });
        const progress = calculateProgress(answers);
        expect(progress.completedStages).toBe(1);
        expect(progress.currentStage).toBe(2);
        expect(progress.questionsRemainingInStage).toBe(10);
    });

    test('marks stage as incomplete with 9 answers', () => {
        const answers = Array(9).fill({ stageNumber: 1 });
        const progress = calculateProgress(answers);
        expect(progress.completedStages).toBe(0);
        expect(progress.currentStage).toBe(1);
        expect(progress.questionsRemainingInStage).toBe(1);
    });

    test('calculates correct stage when multiple stages are partially filled', () => {
        const answers = [
            ...Array(10).fill({ stageNumber: 1 }),
            ...Array(5).fill({ stageNumber: 2 })
        ];
        const progress = calculateProgress(answers);
        expect(progress.completedStages).toBe(1);
        expect(progress.currentStage).toBe(2);
        expect(progress.questionsRemainingInStage).toBe(5);
    });

    test('marks allComplete when all 5 stages have 10 answers', () => {
        const answers = [
            ...Array(10).fill({ stageNumber: 1 }),
            ...Array(10).fill({ stageNumber: 2 }),
            ...Array(10).fill({ stageNumber: 3 }),
            ...Array(10).fill({ stageNumber: 4 }),
            ...Array(10).fill({ stageNumber: 5 })
        ];
        const progress = calculateProgress(answers);
        expect(progress.allStagesCompleted).toBe(true);
        expect(progress.completedStages).toBe(5);
    });
});
