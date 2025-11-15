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

const transformYouTubeVideo = (item, statistics = {}, contentDetails = {}) => {
  const duration = contentDetails.duration ? formatDuration(contentDetails.duration) : 'N/A';

  return {
    id: item.id.videoId || item.id,
    title: item.snippet.title,
    thumbnail_url: item.snippet.thumbnails.high?.url || item.snippet.thumbnails.medium?.url,
    video_url: `https://www.youtube.com/watch?v=${item.id.videoId || item.id}`,
    description: item.snippet.description,
    views: parseInt(statistics.viewCount || 0),
    duration: duration,
    upload_date: item.snippet.publishedAt,
    category: categorizeVideo(item.snippet.title, item.snippet.description),
    channelTitle: item.snippet.channelTitle,
    publishTime: item.snippet.publishTime
  };
};

const formatDuration = (duration) => {
  const match = duration.match(/PT(\d+H)?(\d+M)?(\d+S)?/);
  const hours = (match[1] || '').replace('H', '');
  const minutes = (match[2] || '').replace('M', '');
  const seconds = (match[3] || '').replace('S', '');

  if (hours) {
    return `${hours}:${minutes.padStart(2, '0')}:${seconds.padStart(2, '0')}`;
  }
  return `${minutes || '0'}:${seconds.padStart(2, '0')}`;
};

export const videosApi = {
  async getAllVideos(maxResults = 50, pageToken = '') {
    try {
      const searchUrl = `${BASE_URL}/search?key=${API_KEY}&channelId=${CHANNEL_ID}&part=snippet,id&order=date&maxResults=${maxResults}${pageToken ? `&pageToken=${pageToken}` : ''}`;
      const searchResponse = await fetch(searchUrl);

      if (!searchResponse.ok) {
        throw new Error('Failed to fetch videos');
      }

      const searchData = await searchResponse.json();
      const videoItems = searchData.items.filter(item => item.id.kind === 'youtube#video');

      if (videoItems.length === 0) {
        return { videos: [], nextPageToken: null, prevPageToken: null, totalResults: 0 };
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

      const videos = videoItems.map(item => {
        const details = detailsMap[item.id.videoId] || {};
        return transformYouTubeVideo(item, details.statistics, details.contentDetails);
      });

      return {
        videos,
        nextPageToken: searchData.nextPageToken,
        prevPageToken: searchData.prevPageToken,
        totalResults: searchData.pageInfo.totalResults
      };
    } catch (error) {
      console.error('Error fetching YouTube videos:', error);
      return { videos: [], nextPageToken: null, prevPageToken: null, totalResults: 0 };
    }
  },

  async getVideosByCategory(category) {
    const { videos } = await this.getAllVideos(50);
    return videos.filter(video => video.category === category);
  },

  async getRecentVideos(limit = 5) {
    const { videos } = await this.getAllVideos(limit);
    return videos;
  },

  async getMostWatchedVideos(limit = 10) {
    const { videos } = await this.getAllVideos(50);
    return videos
      .sort((a, b) => b.views - a.views)
      .slice(0, limit);
  },

  async getVideosByCategories() {
    const { videos } = await this.getAllVideos(50);
    const grouped = {};

    videos.forEach((video) => {
      if (!grouped[video.category]) {
        grouped[video.category] = [];
      }
      grouped[video.category].push(video);
    });

    return grouped;
  },
};
