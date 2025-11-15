import { Mic2, Menu, Search } from 'lucide-react';

export function Header() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-b from-black to-transparent">
      <div className="px-8 md:px-16 py-4 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <button className="text-white md:hidden">
            <Menu size={28} />
          </button>

          <div className="flex items-center gap-3">
            <Mic2 size={36} className="text-orange-600" />
            <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">
              TDM Manthan
            </h1>
          </div>

          <nav className="hidden md:flex items-center gap-8 ml-12">
            <a
              href="#home"
              className="text-white hover:text-orange-400 transition-colors font-medium"
            >
              Home
            </a>
            <a
              href="#recent"
              className="text-gray-300 hover:text-orange-400 transition-colors font-medium"
            >
              Recent
            </a>
            <a
              href="#trending"
              className="text-gray-300 hover:text-orange-400 transition-colors font-medium"
            >
              Trending
            </a>
            <a
              href="#categories"
              className="text-gray-300 hover:text-orange-400 transition-colors font-medium"
            >
              Categories
            </a>
          </nav>
        </div>

        <div className="flex items-center gap-4">
          <button className="text-white hover:text-orange-400 transition-colors">
            <Search size={24} />
          </button>
        </div>
      </div>
    </header>
  );
}
