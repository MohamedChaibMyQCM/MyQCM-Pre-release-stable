import { create } from "zustand";
import { persist } from "zustand/middleware";

export const quizStore = create(
  persist(
    (set) => ({
      quiz: {
        quiz_data: [],
      },
      updateQuiz: (newQuiz) =>
        set((state) => ({
          quiz: {
            ...state.quiz, 
            quiz_data: newQuiz, 
          },
        })),
    }),
    {
      name: "quiz-storage", 
      getStorage: () => localStorage,
    }
  )
);