function extractSubtitles(vpdData) {
  const subtitles = [];

  function getAllSubtitleTracks(items) {
    if (!items || !Array.isArray(items)) return [];

    const tracks = [];
    for (const item of items) {
      if (item.type === 'SubtitleTrack') {
        tracks.push(item);
      }
      if (item.subitems) {
        tracks.push(...getAllSubtitleTracks(item.subitems));
      }
    }
    return tracks;
  }

  const subtitleTracks = getAllSubtitleTracks(vpdData.timeline?.subitems || []);

  // すべての字幕トラックから字幕を抽出
  subtitleTracks.forEach((track) => {
    if (track.subitems && Array.isArray(track.subitems)) {
      track.subitems.forEach((block) => {
        if (block.type === 'TextEffectBlock' && block.attribute) {
          const startTime = (block.tstart || 0) / 1000;
          const duration = (block.tduration || 0) / 1000;
          const endTime = startTime + duration;

          // テキストをdialoguesから取得
          let text = '';
          if (block.attribute.dialogues && Array.isArray(block.attribute.dialogues)) {
            text = block.attribute.dialogues.map(d => d.text || '').join('\n');
          }

          if (text) {
            subtitles.push({
              index: subtitles.length + 1,
              startTime: startTime,
              endTime: endTime,
              text: text
            });
          }
        }
      });
    }
  });

  return subtitles.sort((a, b) => a.startTime - b.startTime);
}
