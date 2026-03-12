export interface Options {
    [key: string]: string;
}

export interface Question {
    id: number;
    text: string;
    options: Options;
    correctOption: string;
    explanation: string;
    subcategoryName?: string;
    categoryName?: string;
    difficulty?: string;
    experience_level?: string;
}

export interface Session {
    sessionId: number;
    subcategoryName: string;
    categoryName: string;
    stageNumber: number;
    difficulty: string;
    questions: Question[];
    answers?: Answers;
}

export interface TestAnswer {
    selected: string;
    isCorrect: boolean;
}

export interface Answers {
    [questionId: number]: string;
}
