import { GoogleGenAI, Type } from '@google/genai';
import type { MemorizationVerse, QuizData } from '../types';

export const generateQuiz = async (verse: MemorizationVerse, apiKey: string, excludeAnswers: string[] = []): Promise<QuizData> => {
    if (!apiKey) {
      throw new Error("API 키가 설정되지 않았습니다. 설정 메뉴에서 API 키를 입력해주세요.");
    }
  
    try {
        const ai = new GoogleGenAI({ apiKey });
        let prompt = `'${verse.koreanBookName} ${verse.chapter}:${verse.verse} - "${verse.text}"' 구절을 위한 빈칸 채우기 퀴즈를 만들어줘.
        중요: 입력된 구절 텍스트에 포함된 줄바꿈(\\n)을 출력 'quizText'에서도 그대로 유지해줘.
        1. 구절에서 2개 또는 3개의 핵심 단어를 빈칸으로 만들어줘.
        2. 빈칸은 '__BLANK__'로 표시해줘.
        3. 정답 단어들과 함께, 문법적으로 유사하지만 틀린 선택지 3-4개를 만들어줘.
        4. 응답은 반드시 다음 JSON 스키마를 준수해야 해. 다른 설명은 절대 추가하지 마.`;

        if (excludeAnswers.length > 0) {
            prompt += `\n\n중요: 이전 퀴즈와 다른 단어를 빈칸으로 만들어줘. 다음 단어들은 정답으로 사용하지 마: [${excludeAnswers.join(', ')}]`;
        }
        
        prompt += `
        
        퀴즈 생성 예시:
        입력 구절: "믿음은 바라는 것들의 실상이요\\n보이지 않는 것들의 증거니"
        출력 JSON 예시:
        {
          "quizText": "믿음은 바라는 것들의 __BLANK__\\n보이지 않는 것들의 __BLANK__",
          "answers": ["실상이요", "증거니"],
          "distractors": ["소망이요", "기쁨이요", "약속이니"]
        }`;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        quizText: {
                            type: Type.STRING,
                            description: "The verse text with blanks represented by '__BLANK__'."
                        },
                        answers: {
                            type: Type.ARRAY,
                            items: { type: Type.STRING },
                            description: "An array of the correct words for the blanks, in order."
                        },
                        distractors: {
                            type: Type.ARRAY,
                            items: { type: Type.STRING },
                            description: "An array of plausible but incorrect word choices."
                        }
                    },
                    required: ["quizText", "answers", "distractors"]
                }
            }
        });

        const jsonText = response.text.trim();
        const parsedQuiz = JSON.parse(jsonText) as QuizData;

        if (!parsedQuiz.quizText || !parsedQuiz.answers || !parsedQuiz.distractors) {
            throw new Error("AI로부터 잘못된 형식의 퀴즈 데이터를 받았습니다.");
        }
        
        return parsedQuiz;

    } catch (error) {
        console.error("Error generating quiz from Gemini API:", error);
        throw new Error("퀴즈를 생성하는 데 실패했습니다. 잠시 후 다시 시도해주세요.");
    }
};