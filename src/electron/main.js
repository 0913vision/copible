const { app, BrowserWindow, Menu, globalShortcut, shell, dialog, ipcMain } = require('electron');
const { autoUpdater } = require('electron-updater');
const path = require('path');

let mainWindow;
let isCheckingForUpdate = false; // 업데이트 체크 중인지 확인
let downloadProgressWindow = null; // 다운로드 진행상황 창
let isDownloading = false; // 다운로드 중인지 확인

// 다운로드 진행상황 창 생성
function createDownloadProgressWindow() {
  if (downloadProgressWindow) {
    downloadProgressWindow.focus();
    return;
  }

  downloadProgressWindow = new BrowserWindow({
    width: 400,
    height: 200,
    parent: mainWindow,
    modal: true,
    show: false,
    resizable: false,
    maximizable: false,
    minimizable: false,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  });

  const progressHTML = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>업데이트 다운로드</title>
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          margin: 0;
          padding: 30px;
          background: #f5f5f5;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 100vh;
          box-sizing: border-box;
        }
        .container {
          text-align: center;
          width: 100%;
        }
        h2 {
          color: #333;
          margin-bottom: 20px;
          font-size: 16px;
        }
        .progress-container {
          width: 100%;
          background-color: #e0e0e0;
          border-radius: 10px;
          margin: 20px 0;
          height: 20px;
        }
        .progress-bar {
          width: 0%;
          height: 100%;
          background: linear-gradient(45deg, #4CAF50, #45a049);
          border-radius: 10px;
          transition: width 0.3s ease;
        }
        .progress-text {
          margin-top: 10px;
          color: #666;
          font-size: 14px;
        }
        .speed-text {
          color: #999;
          font-size: 12px;
          margin-top: 5px;
        }
        .cancel-btn {
          margin-top: 20px;
          padding: 8px 16px;
          background-color: #f44336;
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-size: 12px;
        }
        .cancel-btn:hover {
          background-color: #d32f2f;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <h2>업데이트 다운로드 중...</h2>
        <div class="progress-container">
          <div class="progress-bar" id="progressBar"></div>
        </div>
        <div class="progress-text" id="progressText">준비 중...</div>
        <div class="speed-text" id="speedText"></div>
        <button class="cancel-btn" onclick="cancelDownload()">취소</button>
      </div>
      
      <script>
        const { ipcRenderer } = require('electron');
        
        // 진행상황 업데이트 수신
        ipcRenderer.on('download-progress', (event, progress) => {
          const progressBar = document.getElementById('progressBar');
          const progressText = document.getElementById('progressText');
          const speedText = document.getElementById('speedText');
          
          progressBar.style.width = progress.percent + '%';
          progressText.textContent = progress.percent.toFixed(1) + '% (' + 
            formatBytes(progress.transferred) + ' / ' + formatBytes(progress.total) + ')';
          speedText.textContent = '다운로드 속도: ' + formatBytes(progress.bytesPerSecond) + '/s';
        });
        
        // 다운로드 완료 시 창 닫기
        ipcRenderer.on('download-complete', () => {
          window.close();
        });
        
        // 다운로드 취소 함수
        function cancelDownload() {
          ipcRenderer.send('cancel-download');
        }
        
        // 바이트를 읽기 쉬운 형태로 변환
        function formatBytes(bytes) {
          if (bytes === 0) return '0 B';
          const k = 1024;
          const sizes = ['B', 'KB', 'MB', 'GB'];
          const i = Math.floor(Math.log(bytes) / Math.log(k));
          return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
        }
      </script>
    </body>
    </html>
  `;

  downloadProgressWindow.loadURL('data:text/html;charset=utf-8,' + encodeURIComponent(progressHTML));

  downloadProgressWindow.once('ready-to-show', () => {
    downloadProgressWindow.show();
  });

  downloadProgressWindow.on('closed', () => {
    if (isDownloading) {
      // 창이 닫히면 다운로드도 중단
      isDownloading = false;
      console.log('다운로드가 취소되었습니다.');
    }
    downloadProgressWindow = null;
  });
}

// 수동 업데이트 체크 함수
function manualUpdateCheck() {
  if (isCheckingForUpdate) {
    dialog.showMessageBox(mainWindow, {
      type: 'info',
      title: '업데이트',
      message: '이미 업데이트를 확인하고 있습니다.',
      buttons: ['확인']
    });
    return;
  }
  
  isCheckingForUpdate = true;
  autoUpdater.checkForUpdates();
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 550,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      enableRemoteModule: true,
      webSecurity: false  // 기본 단축키 오버라이드를 위해 추가
    },
    resizable: true,
    minWidth: 600,
    minHeight: 300
  });

  // 개발/프로덕션 환경에 따른 URL 설정
  const isDev = process.env.NODE_ENV === 'development';
  
  if (isDev) {
    mainWindow.loadURL('http://localhost:3000');
    mainWindow.webContents.openDevTools();
  } else {
    // 프로덕션에서는 빌드된 HTML 파일 로드
    mainWindow.loadFile(path.join(__dirname, '../../build/index.html'));
  }

  mainWindow.webContents.once('did-finish-load', () => {
    // 창에 포커스 설정
    mainWindow.focus();
    // 약간의 지연 후 reset 이벤트 전송 (성경책 필드 포커스)
    setTimeout(() => {
      mainWindow.webContents.send('shortcut-reset');
    }, 100);
  });

  // 기본 메뉴를 완전히 교체하여 기본 단축키 동작 방지
  const menuTemplate = [
    {
      label: '파일',
      submenu: [
        {
          label: '검색',
          accelerator: 'CmdOrCtrl+F',
          click: () => {
            mainWindow.webContents.send('shortcut-search');
          }
        },
        {
          label: '초기화',
          accelerator: 'CmdOrCtrl+R',
          click: () => {
            mainWindow.webContents.send('shortcut-reset');
          }
        },
        {
          label: '전체 저장',
          accelerator: 'CmdOrCtrl+Shift+S',
          click: () => {
            mainWindow.webContents.send('shortcut-save-all');
          }
        },
        { type: 'separator' },
        // Windows에서만 업데이트 메뉴 표시
        ...(process.platform === 'win32' ? [{
          label: '업데이트',
          click: () => {
            // 수동 업데이트 체크
            manualUpdateCheck();
          }
        }, { type: 'separator' }] : []),
        {
          label: '종료',
          accelerator: process.platform === 'darwin' ? 'Cmd+Q' : 'Ctrl+Q',
          click: () => {
            app.quit();
          }
        }
      ]
    },
    {
      label: '편집',
      submenu: [
        { label: '되돌리기', accelerator: 'CmdOrCtrl+Z', role: 'undo' },
        { label: '다시 실행', accelerator: 'Shift+CmdOrCtrl+Z', role: 'redo' },
        { type: 'separator' },
        { label: '잘라내기', accelerator: 'CmdOrCtrl+X', role: 'cut' },
        { label: '복사', accelerator: 'CmdOrCtrl+C', role: 'copy' },
        { label: '붙여넣기', accelerator: 'CmdOrCtrl+V', role: 'paste' },
        { label: '전체 선택', accelerator: 'CmdOrCtrl+A', role: 'selectAll' }
      ]
    },
    {
      label: '개발',
      submenu: [
        {
          label: '개발자 도구',
          accelerator: 'F12',
          click: () => {
            mainWindow.webContents.toggleDevTools();
          }
        }
      ]
    }
  ];

  const menu = Menu.buildFromTemplate(menuTemplate);
  Menu.setApplicationMenu(menu);

  // 기본 단축키 동작 방지 (특정 단축키만)
  mainWindow.webContents.on('before-input-event', (event, input) => {
    // Mac에서는 meta(코맨드)키, Windows/Linux에서는 control키
    const isModifierPressed = process.platform === 'darwin' ? input.meta : input.control;
    
    // 사용자 정의 단축키만 처리
    if (isModifierPressed && input.key.toLowerCase() === 'f') {
      event.preventDefault();
      mainWindow.webContents.send('shortcut-search');
      return;
    }
    if (isModifierPressed && input.key.toLowerCase() === 'r') {
      event.preventDefault();
      mainWindow.webContents.send('shortcut-reset');
      return;
    }
    // Ctrl+Shift+S (Cmd+Shift+S) 전체 저장 단축키
    if (isModifierPressed && input.shift && input.key.toLowerCase() === 's') {
      event.preventDefault();
      mainWindow.webContents.send('shortcut-save-all');
      return;
    }
    // Cmd+Q (Ctrl+Q) 종료 단축키
    if (isModifierPressed && input.key.toLowerCase() === 'q') {
      event.preventDefault();
      app.quit();
      return;
    }
    
    // 다른 모든 단축키는 기본 동작 허용 (Ctrl+A, Ctrl+C, Ctrl+V, Ctrl+Z 등)
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
  
  // 윈도우에서 창 닫기 시 강제 종료
  mainWindow.on('close', () => {
    app.quit();
  });
}

// IPC 이벤트 리스너 설정
ipcMain.on('cancel-download', () => {
  if (downloadProgressWindow) {
    isDownloading = false;
    downloadProgressWindow.close();
    
    dialog.showMessageBox(mainWindow, {
      type: 'info',
      title: '다운로드 취소',
      message: '다운로드가 취소되었습니다.',
      buttons: ['확인']
    });
  }
});

// 파일 저장 IPC 핸들러
ipcMain.handle('save-file', async (event, { defaultFileName, content }) => {
  try {
    const result = await dialog.showSaveDialog(mainWindow, {
      title: '파일 저장',
      defaultPath: defaultFileName,
      filters: [
        { name: 'Text Files', extensions: ['txt'] },
        { name: 'All Files', extensions: ['*'] }
      ]
    });
    
    if (result.canceled) {
      return { canceled: true };
    }
    
    const fs = require('fs');
    fs.writeFileSync(result.filePath, content, 'utf8');
    
    return { success: true, filePath: result.filePath };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

app.whenReady().then(() => {
  createWindow();

  // 자동 업데이트 설정 (Windows 프로덕션에서만)
  if (process.platform === 'win32' && (!process.env.NODE_ENV || process.env.NODE_ENV === 'production')) {
    // NSIS 기반 자동 업데이트 설정
    autoUpdater.setFeedURL({
      provider: 'github',
      owner: '0913vision',
      repo: 'copible'
    });
    
    // 앱 시작 5초 후 업데이트 체크 (백그라운드, UI 표시 안함)
    setTimeout(() => {
      autoUpdater.checkForUpdates();
    }, 1000);
  }

  // 전역 단축키 등록
  const quitAccelerator = process.platform === 'darwin' ? 'Command+Q' : 'Control+Q';
  globalShortcut.register(quitAccelerator, () => {
    app.quit();
  });

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  // 전역 단축키 해제
  globalShortcut.unregisterAll();
  
  // 모든 플랫폼에서 완전히 종료
  app.quit();
});

// 강제 종료 이벤트 추가
app.on('before-quit', () => {
  // 모든 리소스 정리
  globalShortcut.unregisterAll();
});

// 완전히 종료될 때
app.on('will-quit', (event) => {
  globalShortcut.unregisterAll();
});

// 자동 업데이트 이벤트 핸들러
autoUpdater.on('checking-for-update', () => {
  console.log('업데이트 확인 중...');
});

autoUpdater.on('update-available', (info) => {
  console.log('업데이트가 사용 가능합니다.');
  
  // 수동 체크인 경우 사용자에게 확인
  if (isCheckingForUpdate) {
    isCheckingForUpdate = false;
    
    const response = dialog.showMessageBoxSync(mainWindow, {
      type: 'question',
      title: '업데이트 사용 가능',
      message: `새로운 버전이 있습니다. (v${info.version})\n\n업데이트를 다운로드하시겠습니다?`,
      buttons: ['예', '아니오'],
      defaultId: 0
    });
    
    if (response === 0) {
      // 예 선택 시 다운로드 시작
      isDownloading = true;
      createDownloadProgressWindow();
      autoUpdater.downloadUpdate();
    }
  }
});

autoUpdater.on('update-not-available', (info) => {
  console.log('최신 버전입니다.');
  
  // 수동 체크인 경우 사용자에게 알림
  if (isCheckingForUpdate) {
    isCheckingForUpdate = false;
    
    dialog.showMessageBox(mainWindow, {
      type: 'info',
      title: '업데이트',
      message: '현재 최신 버전을 사용하고 있습니다.',
      buttons: ['확인']
    });
  }
});

autoUpdater.on('error', (err) => {
  console.log('자동 업데이트 오류: ', err);
  console.log('오류 메시지:', err.message);
  console.log('오류 스택:', err.stack);
  console.log('전체 오류 객체:', JSON.stringify(err, Object.getOwnPropertyNames(err), 2));
  
  // 수동 체크인 경우 오류 메시지 표시
  if (isCheckingForUpdate) {
    isCheckingForUpdate = false;
    
    dialog.showMessageBox(mainWindow, {
      type: 'error',
      title: '업데이트 오류',
      message: `업데이트 확인 중 오류가 발생했습니다.\n\n오류: ${err.message}\n\n네트워크 연결을 확인해주세요.`,
      buttons: ['확인']
    });
  }
});

autoUpdater.on('download-progress', (progressObj) => {
  if (downloadProgressWindow && isDownloading) {
    downloadProgressWindow.webContents.send('download-progress', {
      percent: Math.round(progressObj.percent * 100) / 100,
      transferred: progressObj.transferred,
      total: progressObj.total,
      bytesPerSecond: progressObj.bytesPerSecond
    });
  }
  
  let log_message = "다운로드 속도: " + progressObj.bytesPerSecond;
  log_message = log_message + ' - 다운로드됨 ' + progressObj.percent + '%';
  log_message = log_message + ' (' + progressObj.transferred + "/" + progressObj.total + ')';
  console.log(log_message);
});

autoUpdater.on('update-downloaded', (info) => {
  console.log('업데이트 다운로드 완료');
  
  isDownloading = false;
  
  // 다운로드 창 닫기
  if (downloadProgressWindow) {
    downloadProgressWindow.webContents.send('download-complete');
  }
  
  // 사용자에게 업데이트 설치 확인
  const response = dialog.showMessageBoxSync(mainWindow, {
    type: 'question',
    title: '업데이트 준비 완료',
    message: `새로운 버전(v${info.version})을 다운로드했습니다.\n\n지금 업데이트를 설치하시겠습니까? 앱이 재시작됩니다.`,
    buttons: ['예, 지금 설치', '나중에'],
    defaultId: 0
  });
  
  if (response === 0) {
    // NSIS 인스톨러를 사용하여 업데이트 설치 및 재시작
    autoUpdater.quitAndInstall(true, true);
  }
});