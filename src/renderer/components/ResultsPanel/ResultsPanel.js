import React, { useEffect } from 'react';
import VersesList from './VersesList.js';

const ResultsPanel = ({ verses, loading, error, focusedVerseIndex, onVerseCardClick }) => {
  // TXT 파일 저장 함수
  const handleSaveAll = async () => {
    if (verses && verses.length > 1) { // 주소 카드 + 실제 구절들
      const addressCard = verses[0]; // 첫 번째는 주소 카드
      const actualVerses = verses.slice(1); // 나머지는 실제 구절들
      
      // 기본 파일명 생성 (주소에서 특수문자 제거)
      const defaultFileName = addressCard.displayText.replace(/[\/:*?"<>|]/g, '_') + '.txt';
      
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
      
      try {
        // Electron IPC로 main 프로세스에 저장 요청
        const { ipcRenderer } = window.require('electron');
        const result = await ipcRenderer.invoke('save-file', {
          defaultFileName,
          content
        });
        
        if (result.success) {
          console.log('파일이 저장되었습니다:', result.filePath);
        } else if (result.canceled) {
          console.log('저장이 취소되었습니다.');
        } else {
          console.error('파일 저장 실패:', result.error);
          // 폴백: 브라우저 다운로드
          downloadFallback(content, defaultFileName);
        }
      } catch (error) {
        console.error('파일 저장 중 오류:', error);
        // 폴백: 브라우저 다운로드
        downloadFallback(content, defaultFileName);
      }
    }
  };
  
  // 브라우저 다운로드 폴백 함수
  const downloadFallback = (content, fileName) => {
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // 단축키 이벤트 리스너 등록
  useEffect(() => {
    const handleSaveAllShortcut = () => {
      handleSaveAll();
    };

    document.addEventListener('save-all-shortcut', handleSaveAllShortcut);

    return () => {
      document.removeEventListener('save-all-shortcut', handleSaveAllShortcut);
    };
  }, [verses]); // verses를 dependency에 추가
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