import React from 'react';
import BibleSearchForm from './BibleSearchForm.js';

const SearchPanel = ({ 
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
  loading,
  error,
  verses,
  onChapterDataChange
}) => {
  // 메시지 생성
  const getStatusMessage = () => {
    if (loading) {
      return { type: 'loading', text: '검색 중...' };
    }
    if (error) {
      return { type: 'error', text: error };
    }
    if (verses && verses.length > 0) {
      return { type: 'success', text: `${verses.length-1}개의 구절을 찾았습니다.` };
    }
    return null;
  };

  const statusMessage = getStatusMessage();

  return (
    <div className="search-panel">
      <h2>성경 구절 검색</h2>
      <BibleSearchForm
        bookName={bookName}
        setBookName={setBookName}
        chapter={chapter}
        setChapter={setChapter}
        startVerse={startVerse}
        setStartVerse={setStartVerse}
        endVerse={endVerse}
        setEndVerse={setEndVerse}
        onSearch={onSearch}
        onReset={onReset}
        onInputFocus={onInputFocus}
        onChapterDataChange={onChapterDataChange}
      />
      
      {/* 상태 메시지 창 */}
      {statusMessage && (
        <div className={`status-message ${statusMessage.type}`}>
          {statusMessage.text}
        </div>
      )}
      
      {/* 도움말 버튼 */}
      <div className="help-section">
        <button type="button" className="help-btn" title="도움말">
          <span className="help-icon">?</span>
          <div className="help-tooltip">
            <strong>단축키</strong><br/>
            • Cmd/Ctrl + F: 검색<br/>
            • Cmd/Ctrl + R: 성경책 필드로 포커스<br/>
            • Cmd/Ctrl + S: 성경 전체 저장<br/>
            • Cmd/Ctrl + Q: 앱 종료<br/><br/>
            
            <strong>네비게이션</strong><br/>
            • Tab: 다음 필드로 이동<br/>
            • 방향키: verse 카드 간 이동<br/>
            • 일반 키: 다음 verse로 이동<br/><br/>
            
            <strong>복사</strong><br/>
            • verse 카드 focus 시 자동 복사<br/>
            • 주소 카드: "성경책\r\n장:절" 형태<br/>
            • 일반 카드: "절번호 내용" 형태<br/><br/>
            
            <strong>전체 저장</strong><br/>
            • 검색 결과 우상단 "전체 저장" 버튼<br/>
          </div>
        </button>
      </div>
    </div>
  );
};

export default SearchPanel;