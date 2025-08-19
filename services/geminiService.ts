import { GoogleGenAI, Type } from "@google/genai";
import type { Verse, FillInTheBlanksExercise } from "../types";

export const fetchVerses = async (reference: string, apiKey: string): Promise<Pick<Verse, 'reference' | 'text'>[]> => {
    if (!apiKey) {
      throw new Error("API 키가 설정되지 않았습니다. 설정 메뉴에서 API 키를 입력해주세요.");
    }
  
    try {
      const ai = new GoogleGenAI({ apiKey });
      const prompt = `"${reference}"에 해당하는 성경 구절을 '개역개정' 한글 성경 버전으로 찾아주세요. 주소가 범위를 나타내는 경우(예: 창세기 1:1-5), 해당 범위의 모든 구절을 개별적으로 반환해야 합니다. 주소가 단일 구절인 경우에도 배열에 하나의 객체만 포함하여 반환해야 합니다. 응답은 반드시 다음 JSON 스키마를 따르는 JSON 배열이어야 합니다. 각 객체는 하나의 구절을 나타내며, 'reference' (정식 구절 주소, 예: '창세기 1:1')와 'text' (한국어 구절 본문) 필드를 포함해야 합니다. 다른 설명이나 텍스트는 절대 추가하지 마세요. 만약 유효한 구절을 찾을 수 없다면, 빈 배열을 반환해주세요.`;
      
      const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: prompt,
          config: {
              responseMimeType: "application/json",
              responseSchema: {
                  type: Type.ARRAY,
                  items: {
                      type: Type.OBJECT,
                      properties: {
                          reference: { 
                              type: Type.STRING,
                              description: "The full, canonical Bible reference (e.g., 'John 3:16')."
                          },
                          text: { 
                              type: Type.STRING,
                              description: "The full text of the verse in Korean."
                          }
                      },
                      required: ["reference", "text"]
                  }
              }
          }
      });
  
      const jsonText = response.text.trim();
      const parsedVerses = JSON.parse(jsonText);
  
      if (!Array.isArray(parsedVerses)) {
          throw new Error("AI로부터 잘못된 형식의 응답을 받았습니다.");
      }
      
      if (parsedVerses.length === 0) {
          throw new Error(`"${reference}"에 해당하는 구절을 찾을 수 없습니다. 구절 주소를 확인하고 다시 시도해주세요.`);
      }
  
      return parsedVerses;
    } catch (error) {
      console.error("Error fetching verses from Gemini API:", error);
      // Re-throwing a more user-friendly error
      if (error instanceof Error && error.message.includes("찾을 수 없습니다")) {
          throw error;
      }
      throw new Error(`"${reference}" 구절 텍스트를 가져오는 데 실패했습니다. API 키가 유효한지 확인하거나 네트워크 문제를 확인해주세요.`);
    }
  };
  

export const generateFillInTheBlanksExercise = async (verseText: string, apiKey: string): Promise<FillInTheBlanksExercise> => {
    if (!apiKey) {
        throw new Error("API 키가 설정되지 않았습니다. 설정 메뉴에서 API 키를 입력해주세요.");
    }

    try {
        const ai = new GoogleGenAI({ apiKey });
        const prompt = `다음 한국어 성경 구절 텍스트를 사용하여 빈칸 채우기 연습 문제를 만들어 주세요: "${verseText}". 
        지침:
        1. 신학적으로 중요하거나 핵심적인 어절(단어와 조사가 결합된 형태) 3~5개를 제거합니다. **매우 중요: 단어에서 조사를 분리하지 마세요. 예를 들어, '사도로'가 있다면 '사도'가 아닌 '사도로' 전체를 하나의 단위로 취급하여 제거해야 합니다.**
        2. 제거된 어절을 대체할 '____'가 포함된 구절을 만듭니다.
        3. 문맥상 그럴듯하지만 오답인 '오답 선택지' 단어 3개를 만듭니다. 오답 선택지는 정답 어절의 단순 변형이 아니어야 합니다.
        4. 제공된 JSON 스키마를 엄격히 준수하여 응답을 반환합니다. 'allChoices' 필드에는 정답 어절과 오답 단어가 모두 포함되어 무작위로 섞여 있어야 합니다.`;

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        verseWithBlanks: { type: Type.STRING },
                        correctWords: { 
                            type: Type.ARRAY,
                            items: { type: Type.STRING }
                        },
                        allChoices: {
                            type: Type.ARRAY,
                            items: { type: Type.STRING }
                        }
                    },
                    required: ["verseWithBlanks", "correctWords", "allChoices"],
                },
            },
        });
        
        const jsonText = response.text.trim();
        const parsed = JSON.parse(jsonText);
        
        // Basic validation
        if (!parsed.verseWithBlanks || !Array.isArray(parsed.correctWords) || !Array.isArray(parsed.allChoices)) {
            throw new Error("AI가 반환한 데이터 형식이 올바르지 않습니다.");
        }

        return parsed as FillInTheBlanksExercise;

    } catch (error) {
        console.error("Error generating fill-in-the-blanks exercise:", error);
        throw new Error("연습 문제를 생성하는 데 실패했습니다. API 키가 유효한지 확인하거나 잠시 후 다시 시도해주세요.");
    }
};