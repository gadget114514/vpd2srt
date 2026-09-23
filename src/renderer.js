let currentSubtitles = [];
let currentSRTContent = '';
let currentInputFilePath = '';
let currentOutputDir = '';

const openBtn = document.getElementById('openBtn');
const generateBtn = document.getElementById('generateBtn');
const saveBtn = document.getElementById('saveBtn');
const copyBtn = document.getElementById('copyBtn');
const searchBox = document.getElementById('searchBox');
const subtitleList = document.getElementById('subtitleList');
const srtOutput = document.getElementById('srtOutput');
const fileInfo = document.getElementById('fileInfo');
const fileName = document.getElementById('fileName');
const loading = document.getElementById('loading');
const previewSection = document.getElementById('previewSection');
const outputSection = document.getElementById('outputSection');
const outputFileName = document.getElementById('outputFileName');
const outputDir = document.getElementById('outputDir');
const selectDirBtn = document.getElementById('selectDirBtn');

function showLoading(show = true) {
  loading.style.display = show ? 'flex' : 'none';
}

function showToast(message, type = 'info') {
  const toast = document.getElementById('toast');
  toast.textContent = message;
  toast.className = `toast show ${type}`;
  setTimeout(() => {
    toast.classList.remove('show');
  }, 3000);
}

function formatTimeDisplay(seconds) {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

function displaySubtitles(subtitles, filter = '') {
  subtitleList.innerHTML = '';

  const filtered = subtitles.filter(sub =>
    filter === '' || sub.text.toLowerCase().includes(filter.toLowerCase())
  );

  if (filtered.length === 0) {
    subtitleList.innerHTML = '<p class="empty">字幕が見つかりません</p>';
    return;
  }

  filtered.forEach((subtitle) => {
    const div = document.createElement('div');
    div.className = 'subtitle-item';
    div.innerHTML = `
      <div class="time">${formatTimeDisplay(subtitle.startTime)} → ${formatTimeDisplay(subtitle.endTime)}</div>
      <div class="text">${escapeHtml(subtitle.text)}</div>
    `;
    subtitleList.appendChild(div);
  });
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

openBtn.addEventListener('click', async () => {
  const result = await window.api.selectVPDFile();
  if (result.success && result.filePath) {
    await loadVPDFile(result.filePath);
  }
});

window.api.onFileSelected(async (filePath) => {
  await loadVPDFile(filePath);
});

async function loadVPDFile(filePath) {
  showLoading(true);
  try {
    const result = await window.api.loadVPD(filePath);

    if (result.success) {
      currentSubtitles = result.subtitles;
      currentInputFilePath = filePath;

      // デフォルト出力パスを設定
      const pathParts = filePath.split(/[\\/]/);
      const fileNameWithoutExt = pathParts[pathParts.length - 1].replace(/\.[^.]+$/, '');
      const dirPath = pathParts.slice(0, -1).join('/');

      currentOutputDir = dirPath;

      fileName.textContent = pathParts[pathParts.length - 1];
      outputFileName.value = fileNameWithoutExt + '.srt';
      outputDir.value = currentOutputDir;

      fileInfo.style.display = 'block';
      previewSection.style.display = 'block';
      outputSection.style.display = 'none';
      currentSRTContent = '';

      displaySubtitles(currentSubtitles);
      showToast(`${currentSubtitles.length}個の字幕を読み込みました`, 'success');
    } else {
      showToast(`エラー: ${result.error}`, 'error');
    }
  } catch (error) {
    showToast(`エラーが発生しました: ${error.message}`, 'error');
  } finally {
    showLoading(false);
  }
}

generateBtn.addEventListener('click', async () => {
  if (currentSubtitles.length === 0) {
    showToast('先にVPDファイルを読み込んでください', 'warning');
    return;
  }

  showLoading(true);
  try {
    const result = await window.api.generateSRT(currentSubtitles);

    if (result.success) {
      currentSRTContent = result.srtContent;
      srtOutput.value = currentSRTContent;
      outputSection.style.display = 'block';
      showToast('SRTを生成しました', 'success');
    } else {
      showToast(`エラー: ${result.error}`, 'error');
    }
  } catch (error) {
    showToast(`エラーが発生しました: ${error.message}`, 'error');
  } finally {
    showLoading(false);
  }
});

selectDirBtn.addEventListener('click', async () => {
  const result = await window.api.selectDirectory();
  if (result.success && result.dirPath) {
    currentOutputDir = result.dirPath;
    outputDir.value = currentOutputDir;
    showToast('出力ディレクトリを変更しました', 'success');
  }
});

saveBtn.addEventListener('click', async () => {
  if (!currentSRTContent) {
    showToast('先にSRTを生成してください', 'warning');
    return;
  }

  const fileName = outputFileName.value.trim();
  console.log('Save button clicked. fileName:', fileName);

  if (!fileName) {
    showToast('ファイル名を入力してください', 'warning');
    return;
  }

  const dirPath = (outputDir.value || currentOutputDir).trim();
  console.log('dirPath:', dirPath);

  if (!dirPath) {
    showToast('出力ディレクトリを選択してください', 'warning');
    return;
  }

  // ファイル名の拡張子を確認
  const finalFileName = fileName.endsWith('.srt') ? fileName : fileName + '.srt';
  const fullPath = dirPath + '/' + finalFileName;

  console.log('fullPath:', fullPath);
  console.log('Calling saveSRTToPath with:', { fullPath, contentLength: currentSRTContent.length });

  const result = await window.api.saveSRTToPath(currentSRTContent, fullPath);

  if (result.success) {
    showToast(`SRTを保存しました: ${result.filePath}`, 'success');
  } else {
    showToast(`エラー: ${result.error}`, 'error');
  }
});

copyBtn.addEventListener('click', () => {
  srtOutput.select();
  document.execCommand('copy');
  showToast('クリップボードにコピーしました', 'success');
});

searchBox.addEventListener('input', (e) => {
  displaySubtitles(currentSubtitles, e.target.value);
});
