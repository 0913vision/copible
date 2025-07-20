import { crawlChapterVerses, getVersesFromArray, buildCrawlUrl, isValidChapter, areValidVerses } from '../bible-crawler.js';

describe('bible-crawler', () => {
  
  describe('URL 생성', () => {
    test('창세기 1장', () => {
      const url = buildCrawlUrl(1, 1);
      expect(url).toBe('http://www.holybible.or.kr/B_GAE/cgi/bibleftxt.php?VR=GAE&VL=1&CN=1&CV=99');
    });
    test('출애굽기 2장', () => {
      const url = buildCrawlUrl(2, 2);
      expect(url).toBe('http://www.holybible.or.kr/B_GAE/cgi/bibleftxt.php?VR=GAE&VL=2&CN=2&CV=99');
    });

    test('이사야 51장', () => {
      const url = buildCrawlUrl(23, 51);
      expect(url).toBe('http://www.holybible.or.kr/B_GAE/cgi/bibleftxt.php?VR=GAE&VL=23&CN=51&CV=99');
    });
  });

  describe('유효한 절 검사', () => {
    test('시작절이 0이거나 음수인 경우', () => {
      expect(areValidVerses(null, 1, 1, 0, 5)).toBe(false);
      expect(areValidVerses(null, 1, 1, -1, 5)).toBe(false);
      expect(areValidVerses(null, 1, 1, -10, 1)).toBe(false);
    });

    test('끝절이 0이거나 음수인 경우', () => {
      expect(areValidVerses(null, 1, 1, 1, 0)).toBe(false);
      expect(areValidVerses(null, 1, 1, 1, -1)).toBe(false);
      expect(areValidVerses(null, 1, 1, 5, -5)).toBe(false);
    });

    test('시작절 > 끝절인 경우', () => {
      expect(areValidVerses(null, 1, 1, 5, 1)).toBe(false);
      expect(areValidVerses(null, 1, 1, 10, 3)).toBe(false);
      expect(areValidVerses(null, 1, 1, 100, 50)).toBe(false);
    });

    test('데이터가 null이거나 빈 배열인 경우', () => {
      expect(areValidVerses(null, 1, 1, 1, 1)).toBe(false);
      expect(areValidVerses([], 1, 1, 1, 1)).toBe(false);
      expect(areValidVerses(undefined, 1, 1, 1, 1)).toBe(false);
    });

    test('시작절 또는 끝절이 범위를 벗어난 경우', () => {
      const mockData = [{id: '1', text: '절1'}, {id: '2', text: '절2'}, {id: '3', text: '절3'}]; // 3개 절
      expect(areValidVerses(mockData, 1, 1, 1, 5)).toBe(false); // 끝절이 범위 초과
      expect(areValidVerses(mockData, 1, 1, 4, 4)).toBe(false); // 시작절이 범위 초과
      expect(areValidVerses(mockData, 1, 1, 5, 10)).toBe(false); // 둘 다 범위 초과
    });

    test('유효한 절 범위', () => {
      const mockData = [{id: '1', text: '절1'}, {id: '2', text: '절2'}, {id: '3', text: '절3'}]; // 3개 절
      expect(areValidVerses(mockData, 1, 1, 1, 1)).toBe(true);
      expect(areValidVerses(mockData, 1, 1, 1, 3)).toBe(true);
      expect(areValidVerses(mockData, 1, 1, 2, 3)).toBe(true);
    });
  });

  describe('잘못된 장 검사', () => {
    test('음수 장', () => {
      expect(isValidChapter(1, -1)).toBe(false);
      expect(isValidChapter(2, -5)).toBe(false);
    });

    test('0장', () => {
      expect(isValidChapter(1, 0)).toBe(false);
      expect(isValidChapter(40, 0)).toBe(false);
    });

    test('존재하지 않는 장', () => {
      expect(isValidChapter(1, 51)).toBe(false); // 창세기 51장
      expect(isValidChapter(2, 41)).toBe(false); // 출애굽기 41장
      expect(isValidChapter(40, 29)).toBe(false); // 마태복음 29장
      expect(isValidChapter(66, 23)).toBe(false); // 요한계시록 23장
    });

    test('유효한 장', () => {
      expect(isValidChapter(1, 1)).toBe(true); // 창세기 1장
      expect(isValidChapter(1, 50)).toBe(true); // 창세기 50장
      expect(isValidChapter(40, 1)).toBe(true); // 마태복음 1장
      expect(isValidChapter(40, 28)).toBe(true); // 마태복음 28장
      expect(isValidChapter(66, 22)).toBe(true); // 요한계시록 22장
    });
  });
  describe('내용 검사', () => {
    test('이사야 51장 10-13절', async () => {
      const allVerses = await crawlChapterVerses(23, 51);
      const result = getVersesFromArray(allVerses, 10, 13);
      expect(result).toEqual([
        {id: '10', text: '바다를 말리신 이, 큰 깊음의 물을 말리신 이, 바다 깊은 곳을 길로 만드사 구속함을 받은 자들로 건너게 하신 이가 아니시냐'},
        {id: '11', text: '여호와께 구속함을 받은 자들이 돌아와서 노래하며 시온에 이르러 그들의 머리 위에 영영한 희락을 띠고 기쁨과 즐거움을 얻으리니 슬픔과 탄식이 도망하리로다'},
        {id: '12', text: '나 곧 나는 너희를 위로하는 이라 너는 어떠한 자이기에 죽을 사람을 두려워하며 풀과 같이 될 인자를 두려워하느냐'},
        {id: '13', text: '하늘을 펴시며 땅의 기초를 정하시고 너를 지으신 여호와를 어찌하여 잊어버렸느냐 압제자가 멸하려고 준비할 때에 그 압제자의 분노를 어찌하여 항상 종일 두려워하느냐 압제자의 분노가 어디 있느냐'}
      ]);
    });

    test('창세기 1장 1절', async () => {
      const allVerses = await crawlChapterVerses(1, 1);
      const result = getVersesFromArray(allVerses, 1, 1);
      
      expect(result).toEqual([
        {id: '1', text: '태초에 하나님이 천지를 창조하시니라'}
      ]);
    });

    test('크롤링 후 필터링 기능 테스트', async () => {
      // 창세기 1장 전체 크롤링
      const allVerses = await crawlChapterVerses(1, 1);
      expect(allVerses.length).toBeGreaterThan(0);
      
      // 1-5절 필터링
      const verses1to5 = getVersesFromArray(allVerses, 1, 5);
      expect(verses1to5).toHaveLength(5);
      expect(verses1to5[0].id).toBe('1');
      expect(verses1to5[4].id).toBe('5');
      
      // 10절 단일 절 필터링
      const verse10 = getVersesFromArray(allVerses, 10, 10);
      expect(verse10).toHaveLength(1);
      expect(verse10[0].id).toBe('10');
      
      // 범위 초과 체크
      const emptyResult = getVersesFromArray(allVerses, 100, 200);
      expect(emptyResult).toHaveLength(0);
    });

    test('getVersesFromArray 에러 처리', () => {
      // 빈 배열
      expect(getVersesFromArray([], 1, 5)).toEqual([]);
      
      // null 또는 undefined
      expect(getVersesFromArray(null, 1, 5)).toEqual([]);
      expect(getVersesFromArray(undefined, 1, 5)).toEqual([]);
      
      // 잘못된 범위
      const mockData = [{id: '1', text: '절 1'}, {id: '2', text: '절 2'}];
      expect(getVersesFromArray(mockData, 0, 1)).toEqual([{id: '1', text: '절 1'}]); // start가 1로 보정
      expect(getVersesFromArray(mockData, 1, 10)).toEqual(mockData); // end가 최대값으로 보정
    });
  });
});