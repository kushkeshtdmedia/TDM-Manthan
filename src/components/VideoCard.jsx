import { Eye } from 'lucide-react';

export function VideoCard({ video, onClick }) {
  const formatViews = (views) => {
    if (views >= 1000000) {
      return `${(views / 1000000).toFixed(1)}M`;
    } else if (views >= 1000) {
      return `${(views / 1000).toFixed(1)}K`;
    }
    return views.toString();
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) return '1 day ago';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
    return `${Math.floor(diffDays / 365)} years ago`;
  };

  const handleClick = () => {
    if (onClick) {
      onClick();
    } else {
      window.open(video.video_url, '_blank');
    }
  };

  return (
    <div
      onClick={handleClick}
      className="group cursor-pointer transition-transform duration-300 hover:scale-105"
    >
      <div className="relative overflow-hidden rounded-lg bg-gray-900">
        <img
          src={video.thumbnail_url}
          alt={video.title}
          className="w-full aspect-video object-cover transition-opacity duration-300 group-hover:opacity-75"
        />
        <div className="absolute bottom-2 right-2 bg-black bg-opacity-80 px-2 py-1 rounded text-white text-xs font-medium">
          {video.duration}
        </div>
      </div>

      <div className="mt-3">
        <h3 className="text-white font-medium text-sm line-clamp-2 leading-tight group-hover:text-orange-400 transition-colors">
          {video.title}
        </h3>

        <div className="mt-2 flex items-center gap-2 text-gray-400 text-xs">
          <div className="flex items-center gap-1">
            <Eye size={14} />
            <span>{formatViews(video.views)} views</span>
          </div>
          <span>•</span>
          <span>{formatDate(video.upload_date)}</span>
        </div>

        <p className="mt-1 text-gray-400 text-xs line-clamp-2 leading-relaxed">
          {video.description}
        </p>
      </div>
    </div>
  );
}
