import { useEffect, useState } from 'react';
import { Header } from './components/Header';
import { BannerCarousel } from './components/BannerCarousel';
import { VideoSection } from './components/VideoSection';
import { videosApi } from './api/videos';

function App() {
  const [recentVideos, setRecentVideos] = useState([]);
  const [mostWatchedVideos, setMostWatchedVideos] = useState([]);
  const [categorizedVideos, setCategorizedVideos] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [recent, mostWatched, categorized] = await Promise.all([
          videosApi.getRecentVideos(5),
          videosApi.getMostWatchedVideos(10),
          videosApi.getVideosByCategories(),
        ]);

        setRecentVideos(recent);
        setMostWatchedVideos(mostWatched);
        setCategorizedVideos(categorized);
      } catch (error) {
        console.error('Error fetching videos:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      <Header />

      <main>
        <BannerCarousel videos={recentVideos} />

        <div className="py-12">
          <VideoSection title="Most Watched" videos={mostWatchedVideos} />

          {Object.entries(categorizedVideos).map(([category, videos]) => (
            <VideoSection key={category} title={category} videos={videos} />
          ))}
        </div>
      </main>

      <footer className="bg-black border-t border-gray-800 py-8 px-8 md:px-16">
        <div className="text-center text-gray-400">
          <p className="text-sm">© 2025 TDM Manthan. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

export default App;
