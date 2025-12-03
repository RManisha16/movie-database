export async function searchTrailerVideoId(title) {
  if (!YT_KEY) {
    console.warn("REACT_APP_YOUTUBE_KEY not set in .env");
    return null;
  }
  if (!title) return null;

  const YT_BASE = process.env.REACT_APP_YOUTUBE_BASE
  const YT_KEY = process.env.REACT_APP_YOUTUBE_KEY;
  
  const q = `${title} trailer`;
  const url = `${YT_BASE}/search?part=snippet&type=video&maxResults=1&q=${encodeURIComponent(q)}&key=${YT_KEY}`;
 
  try {
    const res = await fetch(url);
    if (!res.ok) {
      console.warn("YouTube API returned status", res.status);
      return null;
    }
    const data = await res.json();
    const item = (data.items && data.items[0]) || null;
    return item && item.id && item.id.videoId ? item.id.videoId : null;
  } catch (err) {
    console.error("YouTube search error:", err);
    return null;
  }
}
 