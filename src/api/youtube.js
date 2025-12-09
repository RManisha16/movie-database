import axios from 'axios';

const YT_BASE = process.env.REACT_APP_YOUTUBE_BASE;
const YT_KEY = process.env.REACT_APP_YOUTUBE_KEY;

export const searchTrailerVideoId = async (title) => {
  try {
    const { data } = await axios.get(`${YT_BASE}/search`, {
      params: {
        key: YT_KEY,
        part: 'snippet',
        q: `${title} official trailer`,
        maxResults: 1,
        type: 'video',
        videoEmbeddable: 'true',
      },
    });

    const item = data?.items?.[0];
    return { ok: true, videoId: item?.id?.videoId};
  } catch (err) {
    // Return a structured error message
    return {
      ok: false,
      message:
        err?.response?.data?.error?.message ||
        err.message ||
        'Failed to fetch trailer video ID',
    };
  }
};
