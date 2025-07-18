# Bible Copy App 프로젝트 인수인계 문서

- Written by Cluade AI chatbot.

## 🎯 프로젝트 개요

**Electron 기반 성경 구절 검색 및 복사 도구**

- **목적**: 성경 구절을 빠르게 검색하고 클립보드에 복사하는 데스크톱 앱
- **플랫폼**: Windows, Mac, Linux (크로스 플랫폼 지원)
- **기술 스택**: Electron + React + Webpack

## 📁 프로젝트 구조

```
bible-copy-app/
├── src/
│   ├── electron/
│   │   └── main.js                 # Electron 메인 프로세스
│   ├── renderer/
│   │   ├── index.js               # React 앱 엔트리포인트
│   │   ├── index.html             # HTML 템플릿
│   │   └── components/
│   │       ├── App.js             # 메인 앱 컴포넌트
│   │       ├── App.css            # 전체 스타일
│   │       ├── SearchPanel/       # 검색 패널
│   │       │   ├── SearchPanel.js
│   │       │   └── BibleSearchForm.js
│   │       └── ResultsPanel/      # 결과 패널
│   │           ├── ResultsPanel.js
│   │           ├── VersesList.js
│   │           └── VerseCard.js
│   └── data/
│       ├── bible-metadata.js      # 성경 메타데이터 (66권 정보)
│       ├── bible-crawler.js       # 웹크롤링 함수들
│       └── bible-search.js        # 성경책 검색 로직
├── package.json
├── webpack.config.js
└── README.md
```

## 🔧 핵심 기능

### 1. 성경 구절 검색

- **입력 형식**: "창세기 1:1-5", "창 1:1", "Genesis 1:1" 등 다양한 형식 지원
- **검색 로직**: 한글/영어/QWERTY 변환 지원, 부분 매칭
- **데이터 소스**: holybible.or.kr 웹사이트 크롤링

### 2. 키보드 네비게이션

- **Tab**: 폼 필드 간 이동
- **방향키**: 검색 결과 카드 간 이동
- **일반 키**: 다음 구절로 이동
- **전역 단축키**: Cmd/Ctrl+F(검색), Cmd/Ctrl+R(포커스), Cmd/Ctrl+Q(종료)

### 3. 자동 복사 기능

- **주소 카드**: "성경책명\\r\n장:절" 형태로 복사
- **구절 카드**: "절번호 구절내용" 형태로 복사
- **Focus 시 자동 복사**: 카드가 포커스되면 자동으로 클립보드에 복사

### 4. 전체 저장 기능

- **위치**: ResultsPanel 우상단 "전체 저장" 버튼
- **파일명**: parseBible.txt (고정)
- **형태**: 주소 + 각 구절을 줄바꿈으로 구분한 텍스트 파일

### 5. 도움말 시스템

- **위치**: SearchPanel 좌하단 "?" 버튼
- **표시**: 마우스 오버 시 툴팁으로 단축키 및 사용법 안내

## 🛠️ 개발 환경 설정

### 의존성 설치

```bash
npm install
```

### 개발 서버 실행

```bash
npm start
# React 개발서버(3000포트) + Electron 앱 동시 실행
```

### 빌드 명령어

```bash
# React 앱 빌드
npm run build

# 현재 OS용 Electron 앱 빌드
npm run dist

# 플랫폼별 빌드
npm run dist:win      # Windows용 (.exe)
npm run dist:mac      # Mac용 (.dmg)
npm run dist:linux    # Linux용 (.AppImage)
npm run dist:all      # 모든 플랫폼
```

## 📊 주요 데이터 구조

### 성경책 메타데이터

```javascript
{
  id: 1,
  korean: "창세기",
  english: "Genesis", 
  englishShort: "Gen",
  testament: "old",
  chapters: 50
}
```

### 검색 결과 구조

```javascript
[
  {
    id: "address",
    displayText: "창세기 1:1-3",
    isAddress: true
  },
  {
    id: "1",
    text: "태초에 하나님이 천지를 창조하시니라"
  }
]
```

## 🔍 핵심 알고리즘

### 1. 성경 구절 파싱

- **정규표현식**: `/^(.+?)\s*(\d+):(\d+)(?:-(\d+))?$/`
- **지원 형식**: "창세기 1:1", "창 1:1-5", "Genesis 1:1" 등

### 2. 웹크롤링

- **URL 패턴**: `http://www.holybible.or.kr/B_GAE/cgi/bibleftxt.php?VR=GAE&VL={bookId}&CN={chapter}&CV=99`
- **파싱**: `font.tk4l` 셀렉터로 구절 추출
- **인코딩**: EUC-KR → UTF-8 변환

### 3. 한글 검색

- **라이브러리**: es-hangul
- **기능**: 자소 분리 검색, QWERTY 변환 지원

## 🚨 주요 이슈 및 해결방법

### 1. Electron 빌드 관련

- **문제**: 개발/프로덕션 환경 구분 없이 localhost 참조
- **해결**: `process.env.NODE_ENV` 기반 조건부 로딩
- **개발**: `http://localhost:3000`
- **프로덕션**: `file://` 프로토콜로 로컬 HTML 파일

### 2. 프로세스 좀비 문제

- **문제**: Windows에서 창 닫아도 node.exe 프로세스 남음
- **해결**:
  ```javascript
  mainWindow.on('close', () => app.quit());
  app.on('window-all-closed', () => app.quit());
  ```

### 3. 웹크롤링 에러 처리

- **네트워크 오류**: 빈 배열 반환
- **파싱 실패**: null 반환 후 적절한 에러 메시지
- **절 범위 초과**: 기존 검증 함수 활용

## 🎨 UI/UX 특징

### 레이아웃

- **2단 구조**: 왼쪽 검색패널 + 오른쪽 결과패널
- **반응형**: 최소 크기 800x600, 리사이즈 가능
- **포커스 관리**: 시각적 하이라이트로 현재 위치 표시

### 스타일

- **색상**: 파란색 계열 포인트 컬러
- **폰트**: 시스템 기본 폰트
- **애니메이션**: 부드러운 hover 효과 및 전환

## 📦 빌드 결과물

### Windows

- **파일**: `Bible Copy App Setup 1.0.0.exe`
- **타입**: NSIS 인스톤러
- **크기**: ~100-200MB (Chromium 포함)

### Mac

- **파일**: `Bible Copy App-1.0.0.dmg`
- **타입**: DMG 이미지
- **지원**: Intel + Apple Silicon

### Linux

- **파일**: `Bible Copy App-1.0.0.AppImage`
- **실행**: `chmod +x && ./Bible-Copy-App-1.0.0.AppImage`

## 🔮 향후 개선 사항

### 단기

1. **성능 최적화**: 검색 결과 캐싱
2. **오프라인 모드**: 로컬 성경 데이터베이스
3. **다양한 번역본**: 개역개정, NIV, ESV 등

### 중기

1. **북마크 기능**: 자주 찾는 구절 저장
2. **검색 히스토리**: 최근 검색 기록
3. **테마 지원**: 다크모드 등

### 장기

1. **성경 주석**: 구절별 해설 연동
2. **클라우드 동기화**: 사용자 설정 백업
3. **모바일 앱**: React Native 포팅

## 📞 기술 지원

### 개발 문의

- **코드 리뷰**: 주요 컴포넌트별 역할 분담 명확
- **버그 리포트**: GitHub Issues 활용 권장
- **기능 요청**: 사용자 피드백 기반 우선순위 결정

### 배포 문의

- **빌드 이슈**: 플랫폼별 빌드 환경 차이점 고려
- **설치 문제**: 기존 버전과의 충돌 방지
- **업데이트**: electron-updater 도입 검토

---

**마지막 업데이트**: 2025년 6월 19일
**현재 버전**: v1.0.0
**개발 상태**: 안정화 단계, 배포 준비 완료
