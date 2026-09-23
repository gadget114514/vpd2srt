function formatTime(seconds) {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  const millis = Math.floor((seconds % 1) * 1000);

  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')},${String(millis).padStart(3, '0')}`;
}

function generateSRT(subtitles) {
  if (!Array.isArray(subtitles) || subtitles.length === 0) {
    return '';
  }

  // タイムスタンプでソートしてからインデックスを付け直す
  const sorted = [...subtitles].sort((a, b) => a.startTime - b.startTime);

  return sorted
    .map((subtitle, index) => {
      const startTime = formatTime(subtitle.startTime);
      const endTime = formatTime(subtitle.endTime);
      const text = subtitle.text;

      return `${index + 1}\n${startTime} --> ${endTime}\n${text}`;
    })
    .join('\n\n');
}

module.exports = { generateSRT, formatTime };
