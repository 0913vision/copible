import { findBookById, findBookByExactName, hasBookByExactName, findBooksByPartialName } from '../bible-metadata.js';

describe('bible-metadata', () => {
  
  describe('성경책 찾기', () => {
    test('유효한 성경책 ID', () => {
      expect(findBookById(1).korean).toBe('창세기');
      expect(findBookById(1).chapters).toBe(50);
      
      expect(findBookById(40).korean).toBe('마태복음');
      expect(findBookById(40).chapters).toBe(28);
    });

    test('존재하지 않는 성경책 ID', () => {
      expect(findBookById(0)).toBeNull();
      expect(findBookById(67)).toBeNull();
      expect(findBookById(999)).toBeNull();
    });

    test('잘못된 입력값', () => {
      expect(findBookById(null)).toBeNull();
      expect(findBookById(undefined)).toBeNull();
      expect(findBookById('abc')).toBeNull();
    });
  });

  describe('정확한 이름으로 성경책 찾기', () => {
    test('한글 정확 매칭', () => {
      expect(findBookByExactName('창세기').korean).toBe('창세기');
      expect(findBookByExactName('마태복음').korean).toBe('마태복음');
    });

    test('영어 정확 매칭', () => {
      expect(findBookByExactName('Genesis').korean).toBe('창세기');
      expect(findBookByExactName('Gen').korean).toBe('창세기');
      expect(findBookByExactName('Matthew').korean).toBe('마태복음');
    });

    test('매칭되지 않는 입력', () => {
      expect(findBookByExactName('창')).toBeNull();
      // 'gen'은 소문자로 대소문자 구분 없이 매칭될 수 있음
      expect(findBookByExactName('없는책')).toBeNull();
    });

    test('빈 입력', () => {
      expect(findBookByExactName('')).toBeNull();
      expect(findBookByExactName('   ')).toBeNull();
      expect(findBookByExactName(null)).toBeNull();
    });
  });

  describe('정확한 이름 매칭 여부 확인', () => {
    test('정확한 매칭', () => {
      expect(hasBookByExactName('창세기')).toBe(true);
      expect(hasBookByExactName('Genesis')).toBe(true);
      expect(hasBookByExactName('Gen')).toBe(true);
    });

    test('부분 매칭', () => {
      expect(hasBookByExactName('창')).toBe(false);
      expect(hasBookByExactName('ge')).toBe(false);
    });

    test('빈 입력', () => {
      expect(hasBookByExactName('')).toBe(false);
      expect(hasBookByExactName(null)).toBe(false);
    });
  });

  describe('부분 이름으로 성경책들 찾기', () => {
    test('한글 부분 검색', () => {
      const results = findBooksByPartialName('창');
      expect(results.length).toBe(1);
      expect(results[0].korean).toBe('창세기');
    });

    test('영어 부분 검색', () => {
      const results = findBooksByPartialName('gen');
      expect(results.length).toBe(1);
      expect(results[0].korean).toBe('창세기');
    });

    test('여러 결과 검색', () => {
      const results = findBooksByPartialName('마');
      expect(results.length).toBeGreaterThan(1);
      expect(results.some(book => book.korean === '마태복음')).toBe(true);
      expect(results.some(book => book.korean === '마가복음')).toBe(true);
    });

    test('매칭되지 않는 검색', () => {
      expect(findBooksByPartialName('없는책')).toEqual([]);
    });

    test('빈 입력', () => {
      expect(findBooksByPartialName('')).toEqual([]);
      expect(findBooksByPartialName(null)).toEqual([]);
    });
  });
});
