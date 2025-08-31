import type { Book, VerseData } from './types';

export const BIBLE_BOOKS: Book[] = [
    { name: 'Genesis', koreanName: '창세기', chapters: 50 },
    { name: 'Exodus', koreanName: '출애굽기', chapters: 40 },
    { name: 'Leviticus', koreanName: '레위기', chapters: 27 },
    { name: 'Numbers', koreanName: '민수기', chapters: 36 },
    { name: 'Deuteronomy', koreanName: '신명기', chapters: 34 },
    { name: 'Joshua', koreanName: '여호수아', chapters: 24 },
    { name: 'Judges', koreanName: '사사기', chapters: 21 },
    { name: 'Ruth', koreanName: '룻기', chapters: 4 },
    { name: '1 Samuel', koreanName: '사무엘상', chapters: 31 },
    { name: '2 Samuel', koreanName: '사무엘하', chapters: 24 },
    { name: '1 Kings', koreanName: '열왕기상', chapters: 22 },
    { name: '2 Kings', koreanName: '열왕기하', chapters: 25 },
    { name: '1 Chronicles', koreanName: '역대상', chapters: 29 },
    { name: '2 Chronicles', koreanName: '역대하', chapters: 36 },
    { name: 'Ezra', koreanName: '에스라', chapters: 10 },
    { name: 'Nehemiah', koreanName: '느헤미야', chapters: 13 },
    { name: 'Esther', koreanName: '에스더', chapters: 10 },
    { name: 'Job', koreanName: '욥기', chapters: 42 },
    { name: 'Psalms', koreanName: '시편', chapters: 150 },
    { name: 'Proverbs', koreanName: '잠언', chapters: 31 },
    { name: 'Ecclesiastes', koreanName: '전도서', chapters: 12 },
    { name: 'Song of Solomon', koreanName: '아가', chapters: 8 },
    { name: 'Isaiah', koreanName: '이사야', chapters: 66 },
    { name: 'Jeremiah', koreanName: '예레미야', chapters: 52 },
    { name: 'Lamentations', koreanName: '예레미야애가', chapters: 5 },
    { name: 'Ezekiel', koreanName: '에스겔', chapters: 48 },
    { name: 'Daniel', koreanName: '다니엘', chapters: 12 },
    { name: 'Hosea', koreanName: '호세아', chapters: 14 },
    { name: 'Joel', koreanName: '요엘', chapters: 3 },
    { name: 'Amos', koreanName: '아모스', chapters: 9 },
    { name: 'Obadiah', koreanName: '오바댜', chapters: 1 },
    { name: 'Jonah', koreanName: '요나', chapters: 4 },
    { name: 'Micah', koreanName: '미가', chapters: 7 },
    { name: 'Nahum', koreanName: '나훔', chapters: 3 },
    { name: 'Habakkuk', koreanName: '하박국', chapters: 3 },
    { name: 'Zephaniah', koreanName: '스바냐', chapters: 3 },
    { name: 'Haggai', koreanName: '학개', chapters: 2 },
    { name: 'Zechariah', koreanName: '스가랴', chapters: 14 },
    { name: 'Malachi', koreanName: '말라기', chapters: 4 },
    { name: 'Matthew', koreanName: '마태복음', chapters: 28 },
    { name: 'Mark', koreanName: '마가복음', chapters: 16 },
    { name: 'Luke', koreanName: '누가복음', chapters: 24 },
    { name: 'John', koreanName: '요한복음', chapters: 21 },
    { name: 'Acts', koreanName: '사도행전', chapters: 28 },
    { name: 'Romans', koreanName: '로마서', chapters: 16 },
    { name: '1 Corinthians', koreanName: '고린도전서', chapters: 16 },
    { name: '2 Corinthians', koreanName: '고린도후서', chapters: 13 },
    { name: 'Galatians', koreanName: '갈라디아서', chapters: 6 },
    { name: 'Ephesians', koreanName: '에베소서', chapters: 6 },
    { name: 'Philippians', koreanName: '빌립보서', chapters: 4 },
    { name: 'Colossians', koreanName: '골로새서', chapters: 4 },
    { name: '1 Thessalonians', koreanName: '데살로니가전서', chapters: 5 },
    { name: '2 Thessalonians', koreanName: '데살로니가후서', chapters: 3 },
    { name: '1 Timothy', koreanName: '디모데전서', chapters: 6 },
    { name: '2 Timothy', koreanName: '디모데후서', chapters: 4 },
    { name: 'Titus', koreanName: '디도서', chapters: 3 },
    { name: 'Philemon', koreanName: '빌레몬서', chapters: 1 },
    { name: 'Hebrews', koreanName: '히브리서', chapters: 13 },
    { name: 'James', koreanName: '야고보서', chapters: 5 },
    { name: '1 Peter', koreanName: '베드로전서', chapters: 5 },
    { name: '2 Peter', koreanName: '베드로후서', chapters: 3 },
    { name: '1 John', koreanName: '요한1서', chapters: 5 },
    { name: '2 John', koreanName: '요한2서', chapters: 1 },
    { name: '3 John', koreanName: '요한3서', chapters: 1 },
    { name: 'Jude', koreanName: '유다서', chapters: 1 },
    { name: 'Revelation', koreanName: '요한계시록', chapters: 22 }
];

export const LORDS_PRAYER: VerseData = {
    bookName: 'LordsPrayer',
    koreanBookName: '주기도문',
    chapter: 1,
    verse: 1,
    text: `하늘에 계신 우리 아버지,
아버지의 이름을 거룩하게 하시며,
아버지의 나라가 오게 하시며,
아버지의 뜻이 하늘에서와 같이 땅에서도 이루어지게 하소서.
오늘 우리에게 일용할 양식을 주시고,
우리가 우리에게 잘못한 사람을 용서하여 준 것같이
우리 죄를 용서하여 주시고,
우리를 시험에 빠지지 않게 하시고
악에서 구하소서.
나라와 권능과 영광이 영원히 아버지의 것입니다. 아멘.`
};

export const APOSTLES_CREED: VerseData = {
    bookName: 'ApostlesCreed',
    koreanBookName: '사도신경',
    chapter: 1,
    verse: 1,
    text: `나는 전능하신 아버지 하나님, 천지의 창조주를 믿습니다.
나는 그의 유일하신 아들, 우리 주 예수 그리스도를 믿습니다.
그는 성령으로 잉태되어 동정녀 마리아에게서 나시고,
본디오 빌라도에게 고난을 받아 십자가에 못 박혀 죽으시고,
장사된 지 사흘 만에 죽은 자 가운데서 다시 살아나셨으며,
하늘에 오르시어 전능하신 아버지 하나님 우편에 앉아 계시다가,
거기로부터 살아있는 자와 죽은 자를 심판하러 오십니다.
나는 성령을 믿으며,
거룩한 공교회와 성도의 교제와
죄를 용서받는 것과 몸의 부활과 영생을 믿습니다. 아멘.`
};