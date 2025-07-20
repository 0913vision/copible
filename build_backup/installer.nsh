; Custom NSIS installer script for Bible Copy App

; Include necessary header files
!include "MUI2.nsh"
!include "FileFunc.nsh"
!include "WinVer.nsh"

; Installer section
Section
    SetDetailsPrint textonly
    DetailPrint "Installing Bible Copy App..."
    SetDetailsPrint both
    
    ; Ensure previous installation is properly cleaned up
    RMDir /r "$INSTDIR"
SectionEnd

; Uninstaller section
Section "Uninstall"
    SetDetailsPrint textonly
    DetailPrint "Removing Bible Copy App..."
    SetDetailsPrint both
    
    ; Kill any running instances with multiple possible executable names
    nsExec::ExecToLog 'taskkill /F /IM "Bible Copy App.exe" /T'
    nsExec::ExecToLog 'taskkill /F /IM "성경 구절 복사.exe" /T'
    nsExec::ExecToLog 'taskkill /F /IM "biblecopyapp.exe" /T'
    Sleep 2000
    
    ; Remove application data directories
    RMDir /r "$APPDATA\Bible Copy App"
    RMDir /r "$APPDATA\bible-copy-app"
    RMDir /r "$APPDATA\biblecopyapp"
    RMDir /r "$APPDATA\성경 구절 복사"
    RMDir /r "$LOCALAPPDATA\Bible Copy App"
    RMDir /r "$LOCALAPPDATA\bible-copy-app"
    RMDir /r "$LOCALAPPDATA\biblecopyapp"
    RMDir /r "$LOCALAPPDATA\성경 구절 복사"
    
    ; Remove registry entries
    DeleteRegKey HKCU "Software\Microsoft\Windows\CurrentVersion\Uninstall\{${UNINSTALL_REGISTRY_KEY}}"
    DeleteRegKey HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\{${UNINSTALL_REGISTRY_KEY}}"
    DeleteRegKey HKCU "Software\Bible Copy App"
    DeleteRegKey HKCU "Software\bible-copy-app"
    DeleteRegKey HKCU "Software\biblecopyapp"
    DeleteRegKey HKCU "Software\성경 구절 복사"
    DeleteRegKey HKLM "Software\Bible Copy App"
    DeleteRegKey HKLM "Software\bible-copy-app"
    DeleteRegKey HKLM "Software\biblecopyapp"
    DeleteRegKey HKLM "Software\성경 구절 복사"
    
    ; Remove shortcuts
    Delete "$DESKTOP\Bible Copy App.lnk"
    Delete "$DESKTOP\성경 구절 복사.lnk"
    Delete "$SMPROGRAMS\Bible Copy App.lnk"
    Delete "$SMPROGRAMS\성경 구절 복사.lnk"
    Delete "$SMPROGRAMS\Reference\Bible Copy App.lnk"
    Delete "$SMPROGRAMS\Reference\성경 구절 복사.lnk"
    RMDir "$SMPROGRAMS\Reference"
    
    ; Remove installation directory
    RMDir /r "$INSTDIR"
    
    ; Remove parent directory if empty
    RMDir "$INSTDIR\.."
    
    ; Clean up additional registry entries
    Call un.CleanRegistry
    
SectionEnd

; Function to handle installer initialization
Function .onInit
    ; Check if application is running using tasklist
    nsExec::ExecToStack 'tasklist /FI "IMAGENAME eq Bible Copy App.exe"'
    Pop $0 ; return value
    Pop $1 ; output
    StrCmp $1 "" continueCheck1
    StrCmp $1 "INFO: No tasks are running which match the specified criteria." continueCheck1
    MessageBox MB_ICONSTOP|MB_OK "Bible Copy App이 실행 중입니다. 먼저 종료하고 다시 시도해주세요."
    Abort
    
    continueCheck1:
    nsExec::ExecToStack 'tasklist /FI "IMAGENAME eq 성경 구절 복사.exe"'
    Pop $0 ; return value
    Pop $1 ; output
    StrCmp $1 "" continueInstall
    StrCmp $1 "INFO: No tasks are running which match the specified criteria." continueInstall
    MessageBox MB_ICONSTOP|MB_OK "성경 구절 복사가 실행 중입니다. 먼저 종료하고 다시 시도해주세요."
    Abort
    
    continueInstall:
FunctionEnd

; Function to handle uninstaller initialization
Function un.onInit
    ; Force kill any running processes
    nsExec::ExecToLog 'taskkill /F /IM "Bible Copy App.exe" /T'
    nsExec::ExecToLog 'taskkill /F /IM "성경 구절 복사.exe" /T'
    nsExec::ExecToLog 'taskkill /F /IM "biblecopyapp.exe" /T'
    Sleep 3000
FunctionEnd

; Uninstaller finished function
Function un.onUninstSuccess
    MessageBox MB_ICONINFORMATION|MB_OK "성경 구절 복사가 성공적으로 제거되었습니다."
FunctionEnd

; Clean up function
Function un.CleanRegistry
    ; Remove all possible registry entries
    DeleteRegKey HKCU "Software\Microsoft\Windows\CurrentVersion\App Paths\Bible Copy App.exe"
    DeleteRegKey HKCU "Software\Microsoft\Windows\CurrentVersion\App Paths\성경 구절 복사.exe"
    DeleteRegKey HKLM "Software\Microsoft\Windows\CurrentVersion\App Paths\Bible Copy App.exe"
    DeleteRegKey HKLM "Software\Microsoft\Windows\CurrentVersion\App Paths\성경 구절 복사.exe"
    
    ; Clean up file associations if any
    DeleteRegKey HKCR "Applications\Bible Copy App.exe"
    DeleteRegKey HKCR "Applications\성경 구절 복사.exe"
FunctionEnd
