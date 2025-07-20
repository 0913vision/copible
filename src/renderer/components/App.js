import React, { useState, useEffect } from 'react';
import SearchPanel from './SearchPanel/SearchPanel.js';
import ResultsPanel from './ResultsPanel/ResultsPanel.js';
import { getVersesFromArray, isValidChapter } from '../../data/bible-crawler.js';
import { getExactBook } from '../../data/bible-search.js';
import './App.css';

const App = () => {
  // 검색 상태
  const [bookName, setBookName] = useState('');
  const [chapter, setChapter] = useState('');
  const [startVerse, setStartVerse] = useState('');
  const [endVerse, setEndVerse] = useState('');
  
  // 결과 상태
  const [verses, setVerses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // 크롤링된 장 데이터
  const [chapterData, setChapterData] = useState(null);
  
  // focus된 verse card 상태
  const [focusedVerseIndex, setFocusedVerseIndex] = useState(-1);

  // 검색 함수
  const handleSearch = async () => {
    if (!bookName || !chapter || !startVerse) {
      setError('성경책, 장, 시작절을 모두 입력해주세요.');
      return;
    }

    // 성경책 이름으로 ID 찾기
    const book = getExactBook(bookName);
    if (!book) {
      setError('올바른 성경책 이름을 입력해주세요.');
      return;
    }

    const chapterNum = parseInt(chapter);
    
    // 장 범위 확인 (기존 함수 활용)
    if (!isValidChapter(book.id, chapterNum)) {
      setError(`${book.korean}은 1장부터 ${book.chapters}장까지 있습니다.`);
      return;
    }

    setLoading(true);
    setError('');
    
    const start = parseInt(startVerse);
    
    // 시작절만 입력되고 끝절이 비어있다면 끝절을 시작절과 동일하게 설정
    let end;
    if (startVerse && !endVerse) {
      end = start;
      setEndVerse(startVerse); // UI에도 반영
    } else {
      end = parseInt(endVerse);
    }
    
    // 웹크롤링을 통한 성경 구절 가져오기 (크롤링된 데이터 사용)
    let verses;
    if (chapterData && chapterData.length > 0) {
      // 이미 크롤링된 데이터가 있으면 필터링만
      verses = getVersesFromArray(chapterData, start, end);
    } else {
      // 크롤링된 데이터가 없으면 에러 처리
      setError('장 데이터를 불러오는 중입니다. 잠시 후 다시 시도해주세요.');
      setLoading(false);
      return;
    }
    
    if (verses.length === 0) {
      setError('요청한 성경 구절을 찾을 수 없습니다. 장, 절 번호를 확인해주세요.');
      setFocusedVerseIndex(-1); // focus 초기화
      setLoading(false);
      return; // 검색 실패 시 포커스 해제하지 않음
    } else {
      // 주소 카드 생성
      const addressCard = createAddressCard(book, chapterNum, start, end);
      
      // 주소 카드를 맨 앞에 추가
      const versesWithAddress = [addressCard, ...verses];
      setVerses(versesWithAddress);
      setFocusedVerseIndex(0); // 첫 번째(주소) card에 focus
      
      // 검색 성공 시에만 모든 input field와 button focus 해제
      const inputs = document.querySelectorAll('#bookName, #chapter, #startVerse, #endVerse');
      inputs.forEach(input => input.blur());
      
      // 검색 버튼 focus 해제
      const searchButton = document.querySelector('.search-btn');
      if (searchButton) {
        searchButton.blur();
      }
    }
    
    setLoading(false);
  };

  // 리셋 함수
  const handleReset = () => {
    setBookName('');
    setChapter('');
    setStartVerse('');
    setEndVerse('');
    setVerses([]);
    setError('');
    setFocusedVerseIndex(-1); // focus 초기화
  };

  // 주소 카드 생성 함수
  const createAddressCard = (book, chapter, startVerse, endVerse) => {
    // 주소 텍스트 생성
    let addressText;
    if (startVerse === endVerse) {
      // 단일 절
      addressText = `${book.korean} ${chapter}:${startVerse}`;
    } else {
      // 범위 절
      addressText = `${book.korean} ${chapter}:${startVerse}~${endVerse}`;
    }
    
    // 복사용 텍스트 (줄바꿈 포함)
    let copyText;
    if (startVerse === endVerse) {
      copyText = `${book.korean}\r\n${chapter}:${startVerse}`;
    } else {
      copyText = `${book.korean}\r\n${chapter}:${startVerse}~${endVerse}`;
    }
    
    return {
      id: 'address',
      text: copyText,
      isAddress: true,
      displayText: addressText
    };
  };
  const copyVerseToClipboard = async (verse, versesLength) => {
    try {
      let textToCopy;
      if (verse.isAddress) {
        // 주소 카드의 경우 text 속성을 그대로 사용 (줄바꿈 포함)
        textToCopy = verse.text;
      } else {
        // 일반 verse의 경우 기존 방식
        versesLength === 2 ? textToCopy = `${verse.text}` : textToCopy = `${verse.id} ${verse.text}`;
      }
      await navigator.clipboard.writeText(textToCopy);
    } catch (error) {
      // 폴백: execCommand 사용
      const textArea = document.createElement('textarea');
      if (verse.isAddress) {
        textArea.value = verse.text;
      } else {
        textArea.value = `${verse.id} ${verse.text}`;
      }
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
    }
  };

  // verse card 클릭 핸들러
  const handleVerseCardClick = (index) => {
    // 선택된 verse로 focus 변경
    setFocusedVerseIndex(index);
    
    // SearchPanel의 모든 input field focus 해제
    const inputs = document.querySelectorAll('#bookName, #chapter, #startVerse, #endVerse');
    inputs.forEach(input => input.blur());
  };

  // SearchPanel input field focus 핸들러
  const handleSearchInputFocus = () => {
    // ResultsPanel의 verse focus 해제
    setFocusedVerseIndex(-1);
  };

  // 다음 verse card로 이동 (키보드 네비게이션용)
  const moveToNextVerse = () => {
    if (focusedVerseIndex < verses.length - 1) {
      setFocusedVerseIndex(focusedVerseIndex + 1);
    }
    // 더 이상 넘어갈 verse가 없으면 ignore
  };

  // 이전 verse card로 이동 (방향키용)
  const moveToPreviousVerse = () => {
    if (focusedVerseIndex > 0) {
      setFocusedVerseIndex(focusedVerseIndex - 1);
    }
    // 더 이상 되돌아갈 verse가 없으면 ignore
  };

  // Electron 단축키 IPC 리스너 등록
  useEffect(() => {
    if (typeof window !== 'undefined' && window.require) {
      try {
        const { ipcRenderer } = window.require('electron');
        
        // Ctrl+F: 검색 실행 (검색 버튼과 동일)
        const handleShortcutSearch = () => {
          handleSearch();
        };
        
        // Ctrl+R: 성경책 입력 필드로 포커스 + 전체 선택
        const handleShortcutReset = () => {
          const bookInput = document.querySelector('#bookName');
          if (bookInput) {
            bookInput.focus();
            bookInput.select();
          }
        };
        
        ipcRenderer.on('shortcut-search', handleShortcutSearch);
        ipcRenderer.on('shortcut-reset', handleShortcutReset);
        
        // 컴포넌트 언마운트 시 리스너 제거
        return () => {
          ipcRenderer.removeListener('shortcut-search', handleShortcutSearch);
          ipcRenderer.removeListener('shortcut-reset', handleShortcutReset);
        };
      } catch (error) {
        // Electron이 아닌 환경에서는 무시
        console.error('Not in Electron environment');
      }
    }
  }, [bookName, chapter, startVerse, endVerse]); // 상태값들을 dependency에 추가

  // focus된 verse에 따른 복사 및 키보드 이벤트 처리
  useEffect(() => {
    // focus된 verse가 있으면 자동 복사
    if (focusedVerseIndex >= 0 && verses[focusedVerseIndex]) {
      copyVerseToClipboard(verses[focusedVerseIndex], verses.length);
    }

    // 키보드 이벤트 리스너
    const handleKeyDown = (e) => {
      // focus된 verse가 있을 때만 처리
      if (focusedVerseIndex >= 0) {
        // 방향키 처리
        if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
          e.preventDefault();
          moveToPreviousVerse();
          return;
        }
        if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
          e.preventDefault();
          moveToNextVerse();
          return;
        }
        
        // 제외할 키들: Ctrl, Shift, Alt, Cmd, Option, Function, Esc, Home, Delete 등
        const excludedKeys = [
          'Control', 'Shift', 'Alt', 'Meta', 'Option', 
          'Escape', 'Home', 'End', 'Delete', 'Backspace',
          'F1', 'F2', 'F3', 'F4', 'F5', 'F6', 'F7', 'F8', 'F9', 'F10', 'F11', 'F12',
          'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown' // 방향키도 제외 (이미 위에서 처리됨)
        ];
        
        // modifier 키가 눌렸거나 제외 키들이면 무시
        if (e.ctrlKey || e.shiftKey || e.altKey || e.metaKey || excludedKeys.includes(e.key)) {
          return;
        }
        
        // 알파벳, 숫자, 탭, 스페이스, 일부 특수문자만 허용
        const allowedPattern = /^[a-zA-Z0-9\t ]$|^[-=+\[\]\\.`~!@#$%^&*()_+{}|:"<>?]$/;
        
        if (allowedPattern.test(e.key)) {
          e.preventDefault();
          moveToNextVerse();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [focusedVerseIndex, verses]);

  return (
    <div className="app">
      <div className="app-container">
        <SearchPanel
          bookName={bookName}
          setBookName={setBookName}
          chapter={chapter}
          setChapter={setChapter}
          startVerse={startVerse}
          setStartVerse={setStartVerse}
          endVerse={endVerse}
          setEndVerse={setEndVerse}
          onSearch={handleSearch}
          onReset={handleReset}
          onInputFocus={handleSearchInputFocus}
          loading={loading}
          error={error}
          verses={verses}
          onChapterDataChange={setChapterData}
        />
        
        <ResultsPanel
          verses={verses}
          loading={loading}
          error={error}
          focusedVerseIndex={focusedVerseIndex}
          onVerseCardClick={handleVerseCardClick}
        />
      </div>
    </div>
  );
};

export default App;