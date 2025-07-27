import { disassemble, convertQwertyToHangul } from 'es-hangul';

const bibleBooks = [
  // 구약 39권
  { id: 1, korean: "창세기", koreanShort: "창", english: "Genesis", englishShort: "gen", testament: "old", chapters: 50 },
  { id: 2, korean: "출애굽기", koreanShort: "출", english: "Exodus", englishShort: "exo", testament: "old", chapters: 40 },
  { id: 3, korean: "레위기", koreanShort: "레", english: "Leviticus", englishShort: "lev", testament: "old", chapters: 27 },
  { id: 4, korean: "민수기", koreanShort: "민", english: "Numbers", englishShort: "num", testament: "old", chapters: 36 },
  { id: 5, korean: "신명기", koreanShort: "신", english: "Deuteronomy", englishShort: "deu", testament: "old", chapters: 34 },
  { id: 6, korean: "여호수아", koreanShort: "수", english: "Joshua", englishShort: "jos", testament: "old", chapters: 24 },
  { id: 7, korean: "사사기", koreanShort: "삿", english: "Judges", englishShort: "jdg", testament: "old", chapters: 21 },
  { id: 8, korean: "룻기", koreanShort: "룻", english: "Ruth", englishShort: "rut", testament: "old", chapters: 4 },
  { id: 9, korean: "사무엘상", koreanShort: "삼상", english: "1 Samuel", englishShort: "1sa", testament: "old", chapters: 31 },
  { id: 10, korean: "사무엘하", koreanShort: "삼하", english: "2 Samuel", englishShort: "2sa", testament: "old", chapters: 24 },
  { id: 11, korean: "열왕기상", koreanShort: "왕상", english: "1 Kings", englishShort: "1ki", testament: "old", chapters: 22 },
  { id: 12, korean: "열왕기하", koreanShort: "왕하", english: "2 Kings", englishShort: "2ki", testament: "old", chapters: 25 },
  { id: 13, korean: "역대상", koreanShort: "대상", english: "1 Chronicles", englishShort: "1ch", testament: "old", chapters: 29 },
  { id: 14, korean: "역대하", koreanShort: "대하", english: "2 Chronicles", englishShort: "2ch", testament: "old", chapters: 36 },
  { id: 15, korean: "에스라", koreanShort: "스", english: "Ezra", englishShort: "ezr", testament: "old", chapters: 10 },
  { id: 16, korean: "느헤미야", koreanShort: "느", english: "Nehemiah", englishShort: "neh", testament: "old", chapters: 13 },
  { id: 17, korean: "에스더", koreanShort: "에", english: "Esther", englishShort: "est", testament: "old", chapters: 10 },
  { id: 18, korean: "욥기", koreanShort: "욥", english: "Job", englishShort: "job", testament: "old", chapters: 42 },
  { id: 19, korean: "시편", koreanShort: "시", english: "Psalms", englishShort: "psa", testament: "old", chapters: 150 },
  { id: 20, korean: "잠언", koreanShort: "잠", english: "Proverbs", englishShort: "pro", testament: "old", chapters: 31 },
  { id: 21, korean: "전도서", koreanShort: "전", english: "Ecclesiastes", englishShort: "ecc", testament: "old", chapters: 12 },
  { id: 22, korean: "아가", koreanShort: "아", english: "Song of Solomon", englishShort: "sng", testament: "old", chapters: 8 },
  { id: 23, korean: "이사야", koreanShort: "사", english: "Isaiah", englishShort: "isa", testament: "old", chapters: 66 },
  { id: 24, korean: "예레미야", koreanShort: "렘", english: "Jeremiah", englishShort: "jer", testament: "old", chapters: 52 },
  { id: 25, korean: "예레미야애가", koreanShort: "애", english: "Lamentations", englishShort: "lam", testament: "old", chapters: 5 },
  { id: 26, korean: "에스겔", koreanShort: "겔", english: "Ezekiel", englishShort: "ezk", testament: "old", chapters: 48 },
  { id: 27, korean: "다니엘", koreanShort: "단", english: "Daniel", englishShort: "dan", testament: "old", chapters: 12 },
  { id: 28, korean: "호세아", koreanShort: "호", english: "Hosea", englishShort: "hos", testament: "old", chapters: 14 },
  { id: 29, korean: "요엘", koreanShort: "욜", english: "Joel", englishShort: "jol", testament: "old", chapters: 3 },
  { id: 30, korean: "아모스", koreanShort: "암", english: "Amos", englishShort: "amo", testament: "old", chapters: 9 },
  { id: 31, korean: "오바댜", koreanShort: "옵", english: "Obadiah", englishShort: "oba", testament: "old", chapters: 1 },
  { id: 32, korean: "요나", koreanShort: "욘", english: "Jonah", englishShort: "jnh", testament: "old", chapters: 4 },
  { id: 33, korean: "미가", koreanShort: "미", english: "Micah", englishShort: "mic", testament: "old", chapters: 7 },
  { id: 34, korean: "나훔", koreanShort: "나", english: "Nahum", englishShort: "nam", testament: "old", chapters: 3 },
  { id: 35, korean: "하박국", koreanShort: "합", english: "Habakkuk", englishShort: "hab", testament: "old", chapters: 3 },
  { id: 36, korean: "스바냐", koreanShort: "습", english: "Zephaniah", englishShort: "zep", testament: "old", chapters: 3 },
  { id: 37, korean: "학개", koreanShort: "학", english: "Haggai", englishShort: "hag", testament: "old", chapters: 2 },
  { id: 38, korean: "스가랴", koreanShort: "슥", english: "Zechariah", englishShort: "zec", testament: "old", chapters: 14 },
  { id: 39, korean: "말라기", koreanShort: "말", english: "Malachi", englishShort: "mal", testament: "old", chapters: 4 },
  
  // 신약 27권
  { id: 40, korean: "마태복음", koreanShort: "마", english: "Matthew", englishShort: "mat", testament: "new", chapters: 28 },
  { id: 41, korean: "마가복음", koreanShort: "막", english: "Mark", englishShort: "mrk", testament: "new", chapters: 16 },
  { id: 42, korean: "누가복음", koreanShort: "눅", english: "Luke", englishShort: "luk", testament: "new", chapters: 24 },
  { id: 43, korean: "요한복음", koreanShort: "요", english: "John", englishShort: "jhn", testament: "new", chapters: 21 },
  { id: 44, korean: "사도행전", koreanShort: "행", english: "Acts", englishShort: "act", testament: "new", chapters: 28 },
  { id: 45, korean: "로마서", koreanShort: "롬", english: "Romans", englishShort: "rom", testament: "new", chapters: 16 },
  { id: 46, korean: "고린도전서", koreanShort: "고전", english: "1 Corinthians", englishShort: "1co", testament: "new", chapters: 16 },
  { id: 47, korean: "고린도후서", koreanShort: "고후", english: "2 Corinthians", englishShort: "2co", testament: "new", chapters: 13 },
  { id: 48, korean: "갈라디아서", koreanShort: "갈", english: "Galatians", englishShort: "gal", testament: "new", chapters: 6 },
  { id: 49, korean: "에베소서", koreanShort: "엡", english: "Ephesians", englishShort: "eph", testament: "new", chapters: 6 },
  { id: 50, korean: "빌립보서", koreanShort: "빌", english: "Philippians", englishShort: "php", testament: "new", chapters: 4 },
  { id: 51, korean: "골로새서", koreanShort: "골", english: "Colossians", englishShort: "col", testament: "new", chapters: 4 },
  { id: 52, korean: "데살로니가전서", koreanShort: "살전", english: "1 Thessalonians", englishShort: "1th", testament: "new", chapters: 5 },
  { id: 53, korean: "데살로니가후서", koreanShort: "살후", english: "2 Thessalonians", englishShort: "2th", testament: "new", chapters: 3 },
  { id: 54, korean: "디모데전서", koreanShort: "딤전", english: "1 Timothy", englishShort: "1ti", testament: "new", chapters: 6 },
  { id: 55, korean: "디모데후서", koreanShort: "딤후", english: "2 Timothy", englishShort: "2ti", testament: "new", chapters: 4 },
  { id: 56, korean: "디도서", koreanShort: "딛", english: "Titus", englishShort: "tit", testament: "new", chapters: 3 },
  { id: 57, korean: "빌레몬서", koreanShort: "몬", english: "Philemon", englishShort: "phm", testament: "new", chapters: 1 },
  { id: 58, korean: "히브리서", koreanShort: "히", english: "Hebrews", englishShort: "heb", testament: "new", chapters: 13 },
  { id: 59, korean: "야고보서", koreanShort: "약", english: "James", englishShort: "jas", testament: "new", chapters: 5 },
  { id: 60, korean: "베드로전서", koreanShort: "벧전", english: "1 Peter", englishShort: "1pe", testament: "new", chapters: 5 },
  { id: 61, korean: "베드로후서", koreanShort: "벧후", english: "2 Peter", englishShort: "2pe", testament: "new", chapters: 3 },
  { id: 62, korean: "요한일서", koreanShort: "요일", english: "1 John", englishShort: "1jn", testament: "new", chapters: 5 },
  { id: 63, korean: "요한이서", koreanShort: "요이", english: "2 John", englishShort: "2jn", testament: "new", chapters: 1 },
  { id: 64, korean: "요한삼서", koreanShort: "요삼", english: "3 John", englishShort: "3jn", testament: "new", chapters: 1 },
  { id: 65, korean: "유다서", koreanShort: "유", english: "Jude", englishShort: "jud", testament: "new", chapters: 1 },
  { id: 66, korean: "요한계시록", koreanShort: "계", english: "Revelation", englishShort: "rev", testament: "new", chapters: 22 }
];

const hangulIncludes = (target, searchTerm) => {
  if (!target || !searchTerm) return false;
  
  try {
    // 둘 다 분리하고 공백 제거
    const disassembledTarget = disassemble(target).replace(/\s/g, '');
    const disassembledSearch = disassemble(searchTerm).replace(/\s/g, '');
    
    return disassembledTarget.includes(disassembledSearch);
  } catch (error) {
    // 정규식 에러나 기타 파싱 에러 시 조용히 false 반환
    return false;
  }
};

/**
 * 성경책 ID로 성경책 정보 찾기
 * @param {number} bookId - 성경책 번호
 * @returns {Object|null} 성경책 정보 또는 null
 */
export const findBookById = (bookId) => {
  return bibleBooks.find(b => b.id === bookId) || null;
};

/**
 * 정확한 이름으로 성경책 찾기
 * @param {string} input - 입력값 (한글, 영어, QWERTY 변환)
 * @returns {Object|null} 성경책 정보 또는 null
 */
export const findBookByExactName = (input) => {
  if (!input || input.trim() === '') {
    return null;
  }

  const trimmedInput = input.trim();
  const lowerInput = trimmedInput.toLowerCase();
  
  let convertedInput = trimmedInput;
  try {
    convertedInput = convertQwertyToHangul(trimmedInput);
  } catch (error) {
    // QWERTY 변환 실패 시 원본 값 사용
    convertedInput = trimmedInput;
  }

  return bibleBooks.find(book =>
    book.korean === trimmedInput ||
    book.korean === convertedInput ||  // QWERTY 변환 정확 매칭
    book.koreanShort === trimmedInput ||
    book.koreanShort === convertedInput ||
    book.english.toLowerCase() === lowerInput ||
    book.englishShort.toLowerCase() === lowerInput
  ) || null;
};

/**
 * 정확한 이름 매칭 여부 확인
 * @param {string} input - 입력값 (한글, 영어, QWERTY 변환)
 * @returns {boolean} 정확히 매칭되면 true, 아니면 false
 */
export const hasBookByExactName = (input) => {
  if (!input || input.trim() === '') {
    return false;
  }

  const trimmedInput = input.trim();
  const lowerInput = trimmedInput.toLowerCase();
  
  let convertedInput = trimmedInput;
  try {
    convertedInput = convertQwertyToHangul(trimmedInput);
  } catch (error) {
    // QWERTY 변환 실패 시 원본 값 사용
    convertedInput = trimmedInput;
  }

  return bibleBooks.some(book =>
    book.korean === trimmedInput ||
    book.korean === convertedInput ||  // QWERTY 변환 정확 매칭
    book.koreanShort === trimmedInput ||
    book.koreanShort === convertedInput ||
    book.english.toLowerCase() === lowerInput ||
    book.englishShort.toLowerCase() === lowerInput
  );
};

/**
 * 부분 이름으로 성경책들 찾기
 * @param {string} input - 입력값 (한글, 영어, QWERTY 변환)
 * @returns {Array} 매칭되는 성경책 배열
 */
export const findBooksByPartialName = (input) => {
  if (!input || input.trim() === '') {
    return [];
  }

  const trimmedInput = input.trim();
  const lowerInput = trimmedInput.toLowerCase();
  
  let convertedInput = trimmedInput;
  try {
    convertedInput = convertQwertyToHangul(trimmedInput);
  } catch (error) {
    // QWERTY 변환 실패 시 원본 값 사용
    convertedInput = trimmedInput;
  }

  return bibleBooks.filter(book => 
    hangulIncludes(book.korean, trimmedInput) ||  // 원본 한글 검색
    hangulIncludes(book.korean, convertedInput) ||  // QWERTY 변환 검색
    hangulIncludes(book.koreanShort, trimmedInput) ||  // 한글 줄임말 검색
    hangulIncludes(book.koreanShort, convertedInput) ||  // QWERTY 변환 줄임말 검색
    book.english.toLowerCase().includes(lowerInput) ||  // 영어 부분 검색
    book.englishShort.toLowerCase().includes(lowerInput)  // 영어 축약 검색
  );
};

export { bibleBooks };