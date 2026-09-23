const fs = require('fs');
const { extractSubtitles } = require('./src/vpd-parser');
const { generateSRT } = require('./src/srt-generator');

// VPDファイルを読み込み
const vpdContent = fs.readFileSync('D:/ws/vpdsrt/202608-22-1_karaoke.vpd', 'utf-8');
const vpdData = JSON.parse(vpdContent);

console.log('📁 VPDファイルを読み込みました');
console.log('---');

// 字幕を抽出
const subtitles = extractSubtitles(vpdData);

console.log(`✅ ${subtitles.length}個の字幕を抽出しました`);
console.log('---');

// 字幕の詳細情報を表示
if (subtitles.length > 0) {
  console.log('最初の5個の字幕:');
  subtitles.slice(0, 5).forEach((sub, i) => {
    console.log(`\n${i + 1}. [${formatTime(sub.startTime)} → ${formatTime(sub.endTime)}]`);
    console.log(`   "${sub.text}"`);
  });
}

console.log('\n---');

// SRTを生成
const srtContent = generateSRT(subtitles);

if (srtContent) {
  console.log('✨ SRTを生成しました');
  console.log('最初の500文字:');
  console.log(srtContent.substring(0, 500));
  console.log('...\n');

  // SRTファイルを保存
  fs.writeFileSync('D:/ws/vpdsrt/output.srt', srtContent, 'utf-8');
  console.log('💾 SRTファイルを保存しました: output.srt');
} else {
  console.log('❌ SRTの生成に失敗しました');
}

function formatTime(seconds) {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}
