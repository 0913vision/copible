import React, { useState, useRef, useEffect } from 'react';
import BookDropdown from './BookDropdown.js';
import { isValidChapter, crawlChapterVerses } from '../../../data/bible-crawler.js';
import {
  shouldShowDropdown,
  canProceedToNextField,
  getValidBookName,
  getDropdownItems,
  getExactBook
} from '../../../data/bible-search.js';

const BibleSearchForm = ({
  bookName,
  setBookName,
  chapter,
  setChapter,
  startVerse,
  setStartVerse,
  endVerse,
  setEndVerse,
  onSearch,
  onReset,
  onInputFocus,
  onChapterDataChange
}) => {
  // 드롭다운 상태
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [dropdownItems, setDropdownItems] = useState([]);
  
  // 한글 입력 상태 추적
  const [isComposing, setIsComposing] = useState(false);

  // 장 확정 및 크롤링 상태
  const [isChapterConfirmed, setIsChapterConfirmed] = useState(false);
  const [isCrawling, setIsCrawling] = useState(false);
  const [maxVerses, setMaxVerses] = useState(0);
  
  // 인라인 에러 메시지 상태
  const [fieldErrors, setFieldErrors] = useState({
    bookName: '',
    chapter: '',
    startVerse: '',
    endVerse: ''
  });

  // refs
  const bookInputRef = useRef(null);
  const chapterInputRef = useRef(null);
  const startVerseInputRef = useRef(null);
  const endVerseInputRef = useRef(null);

  // 인라인 에러 메시지 설정 함수
  const setFieldError = (fieldName, message) => {
    setFieldErrors(prev => ({
      ...prev,
      [fieldName]: message
    }));
  };
  
  // 인라인 에러 메시지 제거 함수
  const clearFieldError = (fieldName) => {
    setFieldErrors(prev => ({
      ...prev,
      [fieldName]: ''
    }));
  };
  
  // 입력 필드 활성화/비활성화 로직
  const currentBook = getExactBook(bookName);
  const isBookValid = currentBook !== null;
  const isChapterValid = isBookValid && chapter && isValidChapter(currentBook.id, parseInt(chapter));
  const isStartVerseValid = isChapterValid && startVerse && parseInt(startVerse) > 0 && (isChapterConfirmed || maxVerses === 0 || parseInt(startVerse) <= maxVerses);
  // 끝절은 입력 자체는 허용하고, 검색 시에만 유효성 검사
  const isEndVerseInputEnabled = isStartVerseValid; // 끝절 입력 허용 여부
  const isEndVerseValid = isStartVerseValid && endVerse && parseInt(endVerse) >= parseInt(startVerse) && (maxVerses === 0 || parseInt(endVerse) <= maxVerses); // 끝절 값 유효성

  // 장 확정 및 크롤링 함수
  const confirmChapterAndCrawl = async () => {
    if (!currentBook || !chapter || !isValidChapter(currentBook.id, parseInt(chapter))) {
      return;
    }

    const chapterNum = parseInt(chapter);
    setIsCrawling(true);
    setIsChapterConfirmed(true);

    try {
      // 해당 장의 모든 절을 크롤링하여 최대 절 수 계산
      const verses = await crawlChapterVerses(currentBook.id, chapterNum);
      setMaxVerses(verses.length);
      
      // 크롤링된 데이터를 App.js로 전달
      if (onChapterDataChange) {
        onChapterDataChange(verses);
      }
    } catch (error) {
      console.error('크롤링 오류:', error);
      setMaxVerses(0);
    } finally {
      setIsCrawling(false);
      // 크롤링 완료 후 시작절에 자동 포커스
      setTimeout(() => {
        if (startVerseInputRef.current) {
          startVerseInputRef.current.focus();
        }
      }, 100);
    }
  };

  // 시작절 포커스 핸들러
  const handleStartVerseFocus = () => {
    onInputFocus();
    
    // 장이 유효하고 아직 확정되지 않았다면 확정 및 크롤링
    if (isChapterValid && !isChapterConfirmed) {
      confirmChapterAndCrawl();
    }
  };
  
  // 검색 버튼 활성화 로직 - 성경책, 장, 시작절이 모두 있고, 끝절이 있다면 유효해야 함
  const canSearch = isBookValid && isChapterValid && isStartVerseValid && (!endVerse || isEndVerseValid);

  // 단계별 값 지우기 - 상위 단계 변경 시에만 (포커스된 필드는 지우지 않음)
  useEffect(() => {
    if (!isBookValid) {
      // 성경책이 비활성화되면 장/절 모두 지우기
      setChapter('');
      setStartVerse('');
      setEndVerse('');
      setIsChapterConfirmed(false);
      setIsCrawling(false);
      setMaxVerses(0);
    } else if (!isChapterValid) {
      // 장이 비활성화되면 절 지우기
      setStartVerse('');
      setEndVerse('');
      setIsChapterConfirmed(false);
      setIsCrawling(false);
      setMaxVerses(0);
    } else if (!isStartVerseValid) {
      // 시작절이 비활성화되면 끝절 지우기 (끝절에 포커스가 없을 때만)
      setEndVerse('');
    }
    // 시작절 > 끝절 체크는 제거 (입력 중에는 허용)
  }, [isBookValid, isChapterValid, isStartVerseValid, setChapter, setStartVerse, setEndVerse]);

  // 장 변경 감지 및 확정 상태 리셋
  useEffect(() => {
    // 장이 변경되었고 이전에 확정된 상태였다면 리셋
    if (isChapterConfirmed) {
      setIsChapterConfirmed(false);
      setIsCrawling(false);
      setMaxVerses(0);
    }
  }, [chapter]); // chapter 변경시만 실행

  // 성경책 입력 핸들러
  const handleBookNameChange = (e) => {
    const value = e.target.value;
    setBookName(value);
    
    const shouldShow = shouldShowDropdown(value);
    setShowDropdown(shouldShow);
    
    if (shouldShow) {
      const items = getDropdownItems(value);
      setDropdownItems(items);
      setSelectedIndex(-1);
    }
  };

  // 키보드 이벤트 핸들러
  const handleBookNameKeyDown = (e) => {
    // 한글 입력 중일 때는 키보드 네비게이션 무시
    if (isComposing) {
      return;
    }
    
    // Tab 키 처리 (드롭다운 여부와 무관하게 항상 검사)
    if (e.key === 'Tab') {
      if (canProceedToNextField(bookName, selectedIndex)) {
        const validBookName = getValidBookName(bookName, selectedIndex);
        if (validBookName) {
          setBookName(validBookName);
        }
        setShowDropdown(false);
        // TAB은 기본 동작으로 다음 필드로 이동
      } else {
        e.preventDefault(); // TAB 막기
      }
      return;
    }
    
    if (!showDropdown) {
      return;
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < dropdownItems.length - 1 ? prev + 1 : prev
        );
        break;
        
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => prev > 0 ? prev - 1 : -1);
        break;
        
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0) {
          selectBook(dropdownItems[selectedIndex]);
        }
        break;
        
      case 'Escape':
        setShowDropdown(false);
        setSelectedIndex(-1);
        break;
    }
  };

  // 성경책 선택
  const selectBook = (book) => {
    setBookName(book.korean);
    setShowDropdown(false);
    setSelectedIndex(-1);
    // 한글 입력 완료 후 포커스 이동
    setTimeout(() => {
      chapterInputRef.current?.focus();
    }, 0);
  };

  // 드롭다운 항목 클릭
  const handleDropdownItemClick = (book) => {
    selectBook(book);
  };

  // 숫자만 입력 가능하도록 제한
  const handleNumberInput = (e, setValue, fieldName) => {
    const value = e.target.value;
    // 숫자만 허용 (빈 문자열도 허용)
    if (value === '' || /^\d+$/.test(value)) {
      setValue(value);
      // 입력 시 에러 메시지 자동 제거
      if (fieldName) {
        clearFieldError(fieldName);
      }
    }
  };

  // 숫자가 아닌 키 입력 방지
  const handleNumberKeyPress = (e) => {
    // Ctrl/Cmd 조합 단축키들은 허용
    if (e.ctrlKey || e.metaKey) {
      return; // Ctrl+A, Ctrl+C, Ctrl+V, Ctrl+X 등 허용
    }
    
    // 숫자, Backspace, Delete, Tab, Enter, 방향키만 허용
    const allowedKeys = [
      'Backspace', 'Delete', 'Tab', 'Enter',
      'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown',
      'Home', 'End' // 커서 이동도 허용
    ];
    
    if (!allowedKeys.includes(e.key) && !/^[0-9]$/.test(e.key)) {
      e.preventDefault();
    }
  };

  // 숫자 입력 키 이벤트 (장, 절 필드용)
  const handleNumberKeyDown = (e, isFieldEnabled, isCurrentFieldValid, fieldName) => {
    // Tab 키 처리
    if (e.key === 'Tab') {
      // Shift+Tab(역방향)은 항상 허용
      if (e.shiftKey) {
        clearFieldError(fieldName); // 역방향일 때 에러 제거
        return; // 기본 동작 허용
      }
      // 일반 Tab(순방향)은 필드가 유효할 때만 허용
      if (!isFieldEnabled || !isCurrentFieldValid) {
        e.preventDefault();
        // 에러 메시지 설정
        if (!isFieldEnabled) {
          setFieldError(fieldName, '이전 단계를 먼저 올바르게 입력해주세요.');
        } else if (!isCurrentFieldValid) {
          if (fieldName === 'chapter') {
            setFieldError(fieldName, `유효한 장 번호를 입력해주세요. (1~${currentBook?.chapters || '?'})`);
          } else if (fieldName === 'startVerse') {
            setFieldError(fieldName, `유효한 시작절을 입력해주세요. (1~${maxVerses || '?'})`);
          } else if (fieldName === 'endVerse') {
            setFieldError(fieldName, `유효한 끝절을 입력해주세요. (${startVerse || 1}~${maxVerses || '?'})`);
          }
        }
        return;
      } else {
        // 유효한 경우 에러 제거
        clearFieldError(fieldName);
      }
    }
    
    // 기존 숫자 입력 처리
    handleNumberKeyPress(e);
  };

  return (
    <div className="bible-search-form">
      {/* 성경책 입력 */}
      <div className="form-group">
        <label htmlFor="bookName">성경책</label>
        <div className="input-container">
          <input
            ref={bookInputRef}
            id="bookName"
            type="text"
            value={bookName}
            onChange={handleBookNameChange}
            onKeyDown={handleBookNameKeyDown}
            onKeyPress={e => {
              if (e.key === 'Enter') {
                onSearch();
              }
            }}
            onCompositionStart={() => setIsComposing(true)}
            onCompositionEnd={() => setIsComposing(false)}
            onFocus={onInputFocus}
            placeholder="예) 창세기, genesis"
            autoComplete="off"
          />
          {showDropdown && (
            <BookDropdown
              items={dropdownItems}
              selectedIndex={selectedIndex}
              onItemClick={handleDropdownItemClick}
            />
          )}
        </div>
      </div>

      {/* 장 입력 */}
      <div className="form-group">
        <label htmlFor="chapter">장</label>
        <input
          ref={chapterInputRef}
          id="chapter"
          type="text"
          value={chapter}
          onChange={(e) => handleNumberInput(e, setChapter, 'chapter')}
          onKeyDown={(e) => handleNumberKeyDown(e, isBookValid, isChapterValid, 'chapter')}
          onKeyPress={e => {
            if (e.key === 'Enter') {
              onSearch();
            }
          }}
          onFocus={onInputFocus}
          placeholder={isBookValid && currentBook ? `장 (1~${currentBook.chapters})` : "장"}
          min="1"
          disabled={!isBookValid}
          className={fieldErrors.chapter ? 'input-error' : ''}
        />
        {fieldErrors.chapter && (
          <div className="field-error-message">{fieldErrors.chapter}</div>
        )}
      </div>

      {/* 절 범위 입력 */}
      <div className="form-group verse-range">
        <div className="verse-input">
          <label htmlFor="startVerse">시작절</label>
          <input
            ref={startVerseInputRef}
            id="startVerse"
            type="text"
            value={startVerse}
            onChange={(e) => handleNumberInput(e, setStartVerse, 'startVerse')}
            onKeyDown={(e) => handleNumberKeyDown(e, isChapterValid, isStartVerseValid, 'startVerse')}
            onKeyPress={e => {
              if (e.key === 'Enter') {
                onSearch();
              }
            }}
            onFocus={handleStartVerseFocus}
            placeholder={isCrawling ? "불러오는 중..." : (maxVerses > 0 ? `시작절 (1~${maxVerses})` : "시작절")}
            min="1"
            disabled={!isChapterValid || isCrawling}
            className={fieldErrors.startVerse ? 'input-error' : ''}
          />
          {fieldErrors.startVerse && (
            <div className="field-error-message">{fieldErrors.startVerse}</div>
          )}
        </div>
        <div className="verse-input">
          <label htmlFor="endVerse">끝절</label>
          <input
            ref={endVerseInputRef}
            id="endVerse"
            type="text"
            value={endVerse}
            onChange={(e) => handleNumberInput(e, setEndVerse, 'endVerse')}
            onKeyDown={(e) => handleNumberKeyDown(e, isEndVerseInputEnabled, isEndVerseValid, 'endVerse')}
            onKeyPress={e => {
              if (e.key === 'Enter') {
                onSearch();
              }
            }}
            onFocus={onInputFocus}
            placeholder={
              // 크롤링 완료 상태이고 시작절이 입력되었을 때
              maxVerses > 0 && startVerse && parseInt(startVerse) > 0 && parseInt(startVerse) <= maxVerses
                ? `끝절 (${startVerse}~${maxVerses})`
                : // 크롤링 완료 상태이지만 시작절이 비어있을 때
                  maxVerses > 0
                ? `끝절 (1~${maxVerses})`
                : "끝절"
            }
            min="1"
            disabled={!isEndVerseInputEnabled}
            className={fieldErrors.endVerse ? 'input-error' : ''}
          />
          {fieldErrors.endVerse && (
            <div className="field-error-message">{fieldErrors.endVerse}</div>
          )}
        </div>
      </div>

      {/* 버튼들 */}
      <div className="form-buttons">
        <button type="button" onClick={onSearch} className="search-btn" disabled={!canSearch}>
          검색
        </button>
        <button type="button" onClick={onReset} className="reset-btn">
          리셋
        </button>
      </div>
    </div>
  );
};

export default BibleSearchForm;