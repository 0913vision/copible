import React from 'react';
import VersesList from './VersesList.js';

const ResultsPanel = ({ verses, loading, error, focusedVerseIndex, onVerseCardClick }) => {
  // TXT 파일 저장 함수
  const handleSaveAll = () => {
    if (verses && verses.length > 1) { // 주소 카드 + 실제 구절들
      const addressCard = verses[0]; // 첫 번째는 주소 카드
      const actualVerses = verses.slice(1); // 나머지는 실제 구절들
      
      // TXT 내용 생성
      let content = addressCard.displayText + '\r\n\r\n'; // 주소 + 두 번의 줄바꿈
      
      if (actualVerses.length === 1) {
        content += `${actualVerses[0].text}\r\n\r\n`; // 단일 구절은 줄바꿈 1번
      }
      else {
        actualVerses.forEach(verse => {
          content += `${verse.id} ${verse.text}\r\n\r\n`; // 각 구절 + 두 번의 줄바꿈
        });
      }
      
      // 파일 다운로드 (파일명: parseBible.txt)
      const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'parseBible.txt';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }
  };
  return (
    <div className="results-panel">
      <div className="results-header">
        <h2>검색 결과</h2>
        {verses && verses.length > 1 && (
          <button 
            type="button" 
            onClick={handleSaveAll} 
            className="save-all-btn"
          >
            전체 저장
          </button>
        )}
      </div>
      <div className="results-content">
        {loading && <div className="loading">검색 중...</div>}
        {verses && verses.length > 0 && (
          <VersesList 
            verses={verses} 
            focusedVerseIndex={focusedVerseIndex} 
            onVerseCardClick={onVerseCardClick}
          />
        )}
        {verses && verses.length === 0 && !loading && !error && (
          <div className="no-results">검색 결과가 없습니다.</div>
        )}
      </div>
    </div>
  );
};

export default ResultsPanel;