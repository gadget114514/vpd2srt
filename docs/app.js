let currentSubtitles = [];
let currentSRTContent = '';
let currentBaseName = 'output';

const openBtn = document.getElementById('openBtn');
const fileInput = document.getElementById('fileInput');
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

openBtn.addEventListener('click', () => {
  fileInput.click();
});

fileInput.addEventListener('change', async () => {
  const file = fileInput.files[0];
  if (file) {
    await loadVPDFile(file);
  }
  fileInput.value = '';
});

async function loadVPDFile(file) {
  showLoading(true);
  try {
    const text = await file.text();
    const vpdData = JSON.parse(text);
    const subtitles = extractSubtitles(vpdData);

    currentSubtitles = subtitles;
    currentBaseName = file.name.replace(/\.[^.]+$/, '');

    fileName.textContent = file.name;
    outputFileName.value = currentBaseName + '.srt';

    fileInfo.style.display = 'block';
    previewSection.style.display = 'block';
    outputSection.style.display = 'none';
    currentSRTContent = '';
    srtOutput.value = '';

    displaySubtitles(currentSubtitles);
    showToast(`${currentSubtitles.length}個の字幕を読み込みました`, 'success');
  } catch (error) {
    showToast(`エラーが発生しました: ${error.message}`, 'error');
  } finally {
    showLoading(false);
  }
}

generateBtn.addEventListener('click', () => {
  if (currentSubtitles.length === 0) {
    showToast('先にVPDファイルを読み込んでください', 'warning');
    return;
  }

  showLoading(true);
  try {
    currentSRTContent = generateSRT(currentSubtitles);
    srtOutput.value = currentSRTContent;
    outputSection.style.display = 'block';
    showToast('SRTを生成しました', 'success');
  } catch (error) {
    showToast(`エラーが発生しました: ${error.message}`, 'error');
  } finally {
    showLoading(false);
  }
});

saveBtn.addEventListener('click', () => {
  if (!currentSRTContent) {
    showToast('先にSRTを生成してください', 'warning');
    return;
  }

  const nameInput = outputFileName.value.trim();
  if (!nameInput) {
    showToast('ファイル名を入力してください', 'warning');
    return;
  }

  const finalFileName = nameInput.endsWith('.srt') ? nameInput : nameInput + '.srt';

  const blob = new Blob([currentSRTContent], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = finalFileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);

  showToast(`SRTをダウンロードしました: ${finalFileName}`, 'success');
});

copyBtn.addEventListener('click', async () => {
  try {
    await navigator.clipboard.writeText(srtOutput.value);
  } catch (error) {
    srtOutput.select();
    document.execCommand('copy');
  }
  showToast('クリップボードにコピーしました', 'success');
});

searchBox.addEventListener('input', (e) => {
  displaySubtitles(currentSubtitles, e.target.value);
});
