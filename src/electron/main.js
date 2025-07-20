const { app, BrowserWindow, Menu, globalShortcut } = require('electron');
const { autoUpdater } = require('electron-updater');
const path = require('path');

let mainWindow;

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
        { type: 'separator' },
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

  // 기본 단축키 동작 방지
  mainWindow.webContents.on('before-input-event', (event, input) => {
    // Mac에서는 meta(코맨드)키, Windows/Linux에서는 control키
    const isModifierPressed = process.platform === 'darwin' ? input.meta : input.control;
    
    if (isModifierPressed && input.key.toLowerCase() === 'f') {
      event.preventDefault();
      mainWindow.webContents.send('shortcut-search');
    }
    if (isModifierPressed && input.key.toLowerCase() === 'r') {
      event.preventDefault();
      mainWindow.webContents.send('shortcut-reset');
    }
    // Cmd+Q (Ctrl+Q) 종료 단축키
    if (isModifierPressed && input.key.toLowerCase() === 'q') {
      event.preventDefault();
      app.quit();
    }
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
  
  // 윈도우에서 창 닫기 시 강제 종료
  mainWindow.on('close', () => {
    app.quit();
  });
}

app.whenReady().then(() => {
  createWindow();

  // 자동 업데이트 설정 (프로덕션에서만)
  if (!process.env.NODE_ENV || process.env.NODE_ENV === 'production') {
    // 앱 시작 5초 후 업데이트 체크
    setTimeout(() => {
      autoUpdater.checkForUpdatesAndNotify();
    }, 5000);
    
    // 24시간마다 업데이트 체크
    setInterval(() => {
      autoUpdater.checkForUpdatesAndNotify();
    }, 24 * 60 * 60 * 1000);
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
});

autoUpdater.on('update-not-available', (info) => {
  console.log('최신 버전입니다.');
});

autoUpdater.on('error', (err) => {
  console.log('자동 업데이트 오류: ', err);
});

autoUpdater.on('download-progress', (progressObj) => {
  let log_message = "다운로드 속도: " + progressObj.bytesPerSecond;
  log_message = log_message + ' - 다운로드됨 ' + progressObj.percent + '%';
  log_message = log_message + ' (' + progressObj.transferred + "/" + progressObj.total + ')';
  console.log(log_message);
});

autoUpdater.on('update-downloaded', (info) => {
  console.log('업데이트 다운로드 완료');
  // 앱 재시작 시 자동으로 업데이트됩니다.
});