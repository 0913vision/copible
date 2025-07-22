const { app, BrowserWindow, Menu, globalShortcut, shell, dialog } = require('electron');
const { autoUpdater } = require('electron-updater');
const path = require('path');



let mainWindow;
let isCheckingForUpdate = false; // 업데이트 체크 중인지 확인

// Squirrel 이벤트 처리 (Windows)
if (process.platform === 'win32') {
  if (require('electron-squirrel-startup')) {
    app.quit();
  }
}

// Squirrel Windows 설치/업데이트 처리
if (process.platform === 'win32') {
  const handleSquirrelEvent = () => {
    if (process.argv.length === 1) {
      return false;
    }

    const ChildProcess = require('child_process');
    const appFolder = path.resolve(process.execPath, '..');
    const rootAtomFolder = path.resolve(appFolder, '..');
    const updateDotExe = path.resolve(path.join(rootAtomFolder, 'Update.exe'));
    const exeName = path.basename(process.execPath);

    const spawn = function(command, args) {
      let spawnedProcess;
      try {
        spawnedProcess = ChildProcess.spawn(command, args, {detached: true});
      } catch (error) {
        console.log('Spawn error:', error);
      }
      return spawnedProcess;
    };

    const spawnUpdate = function(args) {
      return spawn(updateDotExe, args);
    };

    const squirrelEvent = process.argv[1];
    console.log('Squirrel event:', squirrelEvent);

    switch (squirrelEvent) {
      case '--squirrel-install':
      case '--squirrel-updated':
        // 시작 메뉴와 바탕화면에 바로가기 생성
        spawnUpdate(['--createShortcut', exeName]);
        setTimeout(() => {
          app.quit();
        }, 500);
        return true;

      case '--squirrel-uninstall':
        // 바로가기 제거
        spawnUpdate(['--removeShortcut', exeName]);
        setTimeout(() => {
          app.quit();
        }, 500);
        return true;

      case '--squirrel-obsolete':
        app.quit();
        return true;
    }
    return false;
  };

  if (handleSquirrelEvent()) {
    // Squirrel 이벤트가 처리되었으므로 윈도우 생성 없이 앱 종료
    return;
  }
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

  // 자동 업데이트 설정 (Windows 프로덕션에서만)
  if (process.platform === 'win32' && (!process.env.NODE_ENV || process.env.NODE_ENV === 'production')) {
    // 앱 시작 5초 후 업데이트 체크 (백그라운드, UI 표시 안함)
    setTimeout(() => {
      autoUpdater.checkForUpdates();
    }, 5000);
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
  let log_message = "다운로드 속도: " + progressObj.bytesPerSecond;
  log_message = log_message + ' - 다운로드됨 ' + progressObj.percent + '%';
  log_message = log_message + ' (' + progressObj.transferred + "/" + progressObj.total + ')';
  console.log(log_message);
});

autoUpdater.on('update-downloaded', (info) => {
  console.log('업데이트 다운로드 완료');
  // 업데이트 완료 시 즉시 재시작
  autoUpdater.quitAndInstall();
});