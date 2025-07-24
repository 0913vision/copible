import { findBookById } from './bible-metadata.js';

/**
 * 특정 장의 모든 절을 크롤링
 * @param {number} bookId - 성경책 번호
 * @param {number} chapter - 장 번호
 * @returns {Promise<Array<{id: string, text: string}>>} 성경 구절 객체 배열
 */
export const crawlChapterVerses = async (bookId, chapter) => {
  // 장 유효성 검사
  if (!isValidChapter(bookId, chapter)) {
    return [];
  }

  const url = buildCrawlUrl(bookId, chapter);
  
  const verses = await getVersesByUrl(url);
  return verses || [];
};

/**
 * 이미 크롤링된 데이터에서 절 범위 필터링
 * @param {Array<{id: string, text: string}>} versesArray - 크롤링된 전체 절 데이터
 * @param {number} startVerse - 시작 절 번호
 * @param {number} endVerse - 끝 절 번호
 * @returns {Array<{id: string, text: string}>} 필터링된 성경 구절 배열
 */
export const getVersesFromArray = (versesArray, startVerse, endVerse) => {
  if (!versesArray || !Array.isArray(versesArray) || versesArray.length === 0) {
    return [];
  }
  
  const start = Math.max(1, startVerse);
  const end = Math.min(versesArray[versesArray.length-1].id, endVerse);
  
  if (start === end) {
    return versesArray.filter(verse => parseInt(verse.id, 10) === start);
  }
  
  return versesArray.filter(verse => {
    if (verse.id === "18-19") {
      console.log(parseInt(verse.id, 10))
    }
    const verseNumber = parseInt(verse.id, 10);
    return verseNumber >= start && verseNumber <= end;
  });
};

/**
 * URL에서 성경 구절 크롤링
 * @param {string} url - 크롤링할 URL
 * @returns {Promise<Array<{id: string, text: string}>|null>} - 성경 구절 객체 배열 또는 null
 */
export const getVersesByUrl = async (url) => {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      return null;
    }
    
    const arrayBuffer = await response.arrayBuffer();
    const decoder = new TextDecoder('utf-8');
    const html = decoder.decode(arrayBuffer);    

    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    
    const verseElements = doc.querySelectorAll('#tdBible1 > span');
    
    if (verseElements.length === 0) {
      return null;
    }

    return Array.from(verseElements).map((element) => {
      const clonedElement = element.cloneNode(true);
      
      const numberElement = clonedElement.querySelector('.number');
      const number = numberElement ? numberElement.textContent.trim() : null;
      
      const divs = clonedElement.querySelectorAll('div');
      divs.forEach(div => div.remove());
      
      const smallFonts = clonedElement.querySelectorAll('font[size="2"]');
      smallFonts.forEach(font => font.remove());
      
      const nameFonts = clonedElement.querySelectorAll('font.name');
      nameFonts.forEach(font => {
        const textNode = document.createTextNode(font.textContent);
        font.parentNode.replaceChild(textNode, font);
      });

      let text = clonedElement.textContent;
      if (numberElement) {
        text = text.replace(numberElement.textContent, '').trim();
      }
      
      return {
        id: number,
        text: text
      };
    });

  } catch (error) {
    // 네트워크 오류나 파싱 오류 시 null 반환
    console.error('크롤링 오류:', error);
    return null;
  }
};

/**
 * 크롤링 URL 생성
 * @param {number} bookId - 성경책 번호
 * @param {number} chapter - 장 번호
 * @returns {string} 크롤링 URL
 */
export const buildCrawlUrl = (bookId, chapter) => {
  const englishShort = findBookById(bookId).englishShort;
  return `https://www.bskorea.or.kr/bible/korbibReadpage.php?version=GAE&book=${englishShort}&chap=${chapter}`
};

/**
 * 유효한 장 번호인지 검사
 * @param {number} bookId - 성경책 번호
 * @param {number} chapter - 장 번호
 * @returns {boolean} 유효하면 true, 아니면 false
 */
export const isValidChapter = (bookId, chapter) => {
  // 음수와 0 먼저 거르기
  if (chapter <= 0) {
    return false;
  }
  
  // 성경책 찾기
  const book = findBookById(bookId);
  if (!book) {
    return false;
  }
  
  // 해당 성경책의 최대 장 수보다 큰지 확인
  return chapter <= book.chapters;
};
