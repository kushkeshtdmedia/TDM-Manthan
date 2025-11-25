const API_KEY = import.meta.env.VITE_YOUTUBE_API_KEY;
const CHANNEL_ID = import.meta.env.VITE_YOUTUBE_CHANNEL_ID;
const BASE_URL = 'https://www.googleapis.com/youtube/v3';

const categorizeVideo = (title, description) => {
  const text = `${title} ${description}`.toLowerCase();

  if (text.includes('cricket') || text.includes('sport') || text.includes('athlete') || text.includes('shooting')) {
    return 'Sports';
  }
  if (text.includes('trade') || text.includes('tariff') || text.includes('gdp') || text.includes('economy') || text.includes('business')) {
    return 'Business & Economy';
  }
  if (text.includes('entrepreneur') || text.includes('startup') || text.includes('business')) {
    return 'Entrepreneurship';
  }
  if (text.includes('ips') || text.includes('police') || text.includes('upsc') || text.includes('government')) {
    return 'Government & Service';
  }
  if (text.includes('story') || text.includes('journey') || text.includes('rise')) {
    return 'Inspirational Stories';
  }

  return 'General';
};

const formatDuration = (duration) => {
  const match = duration.match(/PT(\d+H)?(\d+M)?(\d+S)?/);
  if (!match) return 'N/A';

  const hours = (match[1] || '').replace('H', '');
  const minutes = (match[2] || '').replace('M', '');
  const seconds = (match[3] || '').replace('S', '');

  if (hours) {
    return `${hours}:${minutes.padStart(2, '0')}:${seconds.padStart(2, '0')}`;
  }
  return `${minutes || '0'}:${seconds.padStart(2, '0')}`;
};

const fetchYouTubeVideos = async (maxResults = 50) => {
  try {
    const searchUrl = `${BASE_URL}/search?key=${API_KEY}&channelId=${CHANNEL_ID}&part=snippet,id&order=date&maxResults=${maxResults}`;

    const searchResponse = await fetch(searchUrl);
    if (!searchResponse.ok) {
      throw new Error('Failed to fetch videos');
    }

    const searchData = await searchResponse.json();
    const videoItems = searchData.items.filter(item => item.id.kind === 'youtube#video');

    if (videoItems.length === 0) {
      return [];
    }

    const videoIds = videoItems.map(item => item.id.videoId).join(',');
    const detailsUrl = `${BASE_URL}/videos?key=${API_KEY}&id=${videoIds}&part=statistics,contentDetails`;
    const detailsResponse = await fetch(detailsUrl);

    if (!detailsResponse.ok) {
      throw new Error('Failed to fetch video details');
    }

    const detailsData = await detailsResponse.json();
    const detailsMap = {};

    detailsData.items.forEach(item => {
      detailsMap[item.id] = {
        statistics: item.statistics,
        contentDetails: item.contentDetails
      };
    });

    return videoItems.map(item => {
      const details = detailsMap[item.id.videoId] || {};
      const duration = details.contentDetails?.duration ? formatDuration(details.contentDetails.duration) : 'N/A';

      return {
        id: item.id.videoId,
        title: item.snippet.title,
        thumbnail_url: item.snippet.thumbnails.high?.url || item.snippet.thumbnails.medium?.url,
        video_url: `https://www.youtube.com/watch?v=${item.id.videoId}`,
        description: item.snippet.description,
        views: parseInt(details.statistics?.viewCount || '0'),
        duration: duration,
        upload_date: item.snippet.publishedAt,
        category: categorizeVideo(item.snippet.title, item.snippet.description),
        channel_title: item.snippet.channelTitle,
        publish_time: item.snippet.publishTime
      };
    });
  } catch (error) {
    console.error('Error fetching videos:', error);
    return [];
  }
};

export const videosApi = {
  async getAllVideos() {
    try {
      const videos = await fetchYouTubeVideos(50);
      return {
        videos,
        nextPageToken: null,
        prevPageToken: null,
        totalResults: videos.length
      };
    } catch (error) {
      console.error('Error in getAllVideos:', error);
      return { videos: [], nextPageToken: null, prevPageToken: null, totalResults: 0 };
    }
  },

  async getVideosByCategory(category) {
    try {
      const videos = await fetchYouTubeVideos(50);
      return videos.filter(video => video.category === category);
    } catch (error) {
      console.error('Error in getVideosByCategory:', error);
      return [];
    }
  },

  async getRecentVideos(limit = 5) {
    try {
      const videos = await fetchYouTubeVideos(50);
      return videos.slice(0, limit);
    } catch (error) {
      console.error('Error in getRecentVideos:', error);
      return [];
    }
  },

  async getMostWatchedVideos(limit = 10) {
    try {
      const videos = await fetchYouTubeVideos(50);
      return videos.sort((a, b) => b.views - a.views).slice(0, limit);
    } catch (error) {
      console.error('Error in getMostWatchedVideos:', error);
      return [];
    }
  },

  async getOlderVideos(limit = 10) {
    try {
      const videos = await fetchYouTubeVideos(50);
      return videos.sort((a, b) => new Date(a.upload_date) - new Date(b.upload_date)).slice(0, limit);
    } catch (error) {
      console.error('Error in getOlderVideos:', error);
      return [];
    }
  },

  async getVideosByCategories() {
    try {
      const videos = await fetchYouTubeVideos(50);
      const grouped = {};

      videos.forEach(video => {
        if (!grouped[video.category]) {
          grouped[video.category] = [];
        }
        grouped[video.category].push(video);
      });

      return grouped;
    } catch (error) {
      console.error('Error in getVideosByCategories:', error);
      return {};
    }
  },
};
