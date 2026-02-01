export interface Options {
    [key: string]: string;
}

export interface Question {
    id: number;
    text: string;
    options: Options;
    correctOption: string;
    explanation: string;
    topic?: string;
    difficulty?: string;
    experience_level?: string;
}

export interface Session {
    sessionId: string;
    topicName: string;
    stage: number;
    questions: Question[];
}

export interface TestAnswer {
    selected: string;
    isCorrect: boolean;
}

export interface Answers {
    [questionId: number]: string;
}
