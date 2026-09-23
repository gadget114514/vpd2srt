const { app, BrowserWindow, Menu, dialog, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');
const { parseVPD, extractSubtitles } = require('./src/vpd-parser');
const { generateSRT } = require('./src/srt-generator');

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1000,
    height: 700,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true
    }
  });

  mainWindow.loadFile('src/index.html');

  const menu = Menu.buildFromTemplate([
    {
      label: 'ファイル',
      submenu: [
        {
          label: 'VPDを開く',
          accelerator: 'CmdOrCtrl+O',
          click: () => openVPDFile()
        },
        { type: 'separator' },
        {
          label: '終了',
          accelerator: 'CmdOrCtrl+Q',
          click: () => app.quit()
        }
      ]
    },
    {
      label: 'ヘルプ',
      submenu: [
        {
          label: 'このアプリについて',
          click: () => {
            dialog.showMessageBox(mainWindow, {
              type: 'info',
              title: 'VPD to SRT',
              message: 'VPDファイルからSRT字幕を生成するツール',
              detail: 'v1.0.0'
            });
          }
        }
      ]
    }
  ]);

  Menu.setApplicationMenu(menu);
}

async function openVPDFile() {
  const result = await dialog.showOpenDialog(mainWindow, {
    properties: ['openFile'],
    filters: [
      { name: 'VPDファイル', extensions: ['vpd'] },
      { name: 'すべてのファイル', extensions: ['*'] }
    ]
  });

  if (!result.canceled && result.filePaths.length > 0) {
    mainWindow.webContents.send('file-selected', result.filePaths[0]);
  }
}

ipcMain.handle('select-vpd-file', async (event) => {
  try {
    const result = await dialog.showOpenDialog(mainWindow, {
      properties: ['openFile'],
      filters: [
        { name: 'VPDファイル', extensions: ['vpd'] },
        { name: 'すべてのファイル', extensions: ['*'] }
      ]
    });

    if (!result.canceled && result.filePaths.length > 0) {
      return { success: true, filePath: result.filePaths[0] };
    }
    return { success: false, error: 'キャンセルされました' };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('load-vpd', async (event, filePath) => {
  try {
    const fileContent = fs.readFileSync(filePath, 'utf-8');
    const vpdData = JSON.parse(fileContent);
    const subtitles = extractSubtitles(vpdData);
    return { success: true, subtitles };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('generate-srt', async (event, subtitles) => {
  try {
    const srtContent = generateSRT(subtitles);
    return { success: true, srtContent };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('save-srt', async (event, srtContent, defaultName) => {
  try {
    const result = await dialog.showSaveDialog(mainWindow, {
      defaultPath: defaultName || 'output.srt',
      filters: [
        { name: 'SRTファイル', extensions: ['srt'] },
        { name: 'テキストファイル', extensions: ['txt'] }
      ]
    });

    if (!result.canceled) {
      fs.writeFileSync(result.filePath, srtContent, 'utf-8');
      return { success: true, filePath: result.filePath };
    }
    return { success: false, error: 'キャンセルされました' };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('save-srt-to-path', async (event, srtContent, filePath) => {
  try {
    // ファイル名にパス区切り文字が含まれている場合は修正
    const normalizedPath = filePath.replace(/\//g, path.sep);
    fs.writeFileSync(normalizedPath, srtContent, 'utf-8');
    return { success: true, filePath: normalizedPath };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('select-directory', async (event) => {
  try {
    const result = await dialog.showOpenDialog(mainWindow, {
      properties: ['openDirectory']
    });

    if (!result.canceled && result.filePaths.length > 0) {
      return { success: true, dirPath: result.filePaths[0] };
    }
    return { success: false, error: 'キャンセルされました' };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

app.on('ready', createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
  if (mainWindow === null) createWindow();
});
