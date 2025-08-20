import { VerseData } from "../types";

const API_BASE_URL = 'https://getbible.net/index.php?option=com_getbible&view=bible&format=jsonp&v=krv';

const fetchJsonp = (url: string): Promise<any> => {
    return new Promise((resolve, reject) => {
        const callbackName = `jsonp_callback_${Math.round(100000 * Math.random())}`;
        
        const script = document.createElement('script');
        script.src = `${url}&callback=${callbackName}`;
        
        (window as any)[callbackName] = (data: any) => {
            delete (window as any)[callbackName];
            document.body.removeChild(script);
            // The getbible.net API sometimes wraps the response in an extra object with a 'book' key
            // and sometimes not. We normalize it here.
             if (data && data.book) {
                resolve({ book: data.book });
            } else if (data && !data.book) {
                 // The actual book data might be the first and only key
                 const firstKey = Object.keys(data)[0];
                 if (firstKey && Array.isArray(data[firstKey])) {
                     resolve({ book: data[firstKey] });
                 } else {
                     resolve(data);
                 }
            } else {
               resolve(data);
            }
        };

        script.onerror = (err) => {
            delete (window as any)[callbackName];
            document.body.removeChild(script);
            reject(err);
        };

        document.body.appendChild(script);
    });
};


interface GetBibleResponse {
    book: {
        book_name: string;
        chapter_nr: string;
        chapter: {
            [verseNumber: string]: {
                verse_nr: string;
                verse: string;
            };
        };
    }[];
}

export const fetchVerse = async (
    book: string, 
    koreanBookName: string, 
    chapter: number, 
    verse: number
): Promise<{ text: string; reference: string } | null> => {
    try {
        const data: GetBibleResponse = await fetchJsonp(`${API_BASE_URL}&p=${book}+${chapter}:${verse}`);

        if (data?.book?.[0]?.chapter?.[verse]) {
            const verseData = data.book[0].chapter[verse];
            const cleanText = verseData.verse.replace(/<[^>]*>/g, '').trim();
            return {
                text: cleanText,
                reference: `${koreanBookName} ${chapter}:${verse}`,
            };
        }
        return null;
    } catch (error) {
        console.error("Failed to fetch verse:", error);
        return null;
    }
};

export const fetchVersesInRange = async (
    book: string, 
    koreanBookName: string, 
    chapter: number, 
    startVerse: number,
    endVerse: number
): Promise<VerseData[] | null> => {
    try {
        const data: GetBibleResponse = await fetchJsonp(`${API_BASE_URL}&p=${book}+${chapter}`);
        
        if (!data?.book?.[0]?.chapter) {
             console.error("Chapter data not found in response:", data);
            return null;
        }

        const chapterData = data.book[0].chapter;
        const verses: VerseData[] = [];

        for (let i = startVerse; i <= endVerse; i++) {
            const verseNumberStr = i.toString();
            if (chapterData[verseNumberStr]) {
                const verseData = chapterData[verseNumberStr];
                const cleanText = verseData.verse.replace(/<[^>]*>/g, '').trim();
                verses.push({
                    bookName: book,
                    koreanBookName: koreanBookName,
                    chapter: chapter,
                    verse: i,
                    text: cleanText,
                });
            }
        }
        
        return verses.length > 0 ? verses : null;

    } catch (error) {
        console.error("Failed to fetch verses in range:", error);
        return null;
    }
};

export const fetchChapterVerseCount = async (book: string, chapter: number): Promise<number> => {
    try {
        const data: GetBibleResponse = await fetchJsonp(`${API_BASE_URL}&p=${book}+${chapter}`);
        if (data?.book?.[0]?.chapter) {
            return Object.keys(data.book[0].chapter).length;
        }
        return 0;
    } catch (error) {
        console.error("Failed to fetch chapter verse count:", error);
        return 0;
    }
};