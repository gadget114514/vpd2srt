const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
  selectVPDFile: () => ipcRenderer.invoke('select-vpd-file'),
  loadVPD: (filePath) => ipcRenderer.invoke('load-vpd', filePath),
  generateSRT: (subtitles) => ipcRenderer.invoke('generate-srt', subtitles),
  saveSRT: (srtContent, defaultName) => ipcRenderer.invoke('save-srt', srtContent, defaultName),
  saveSRTToPath: (srtContent, filePath) => ipcRenderer.invoke('save-srt-to-path', srtContent, filePath),
  selectDirectory: () => ipcRenderer.invoke('select-directory'),
  onFileSelected: (callback) => ipcRenderer.on('file-selected', (event, filePath) => callback(filePath))
});
