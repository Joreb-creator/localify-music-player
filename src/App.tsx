import { Routes, Route, NavLink } from "react-router-dom"
import Upload from "./pages/Upload"
import Songs from "./pages/Songs"
import Playlists from "./pages/Playlists"
import NowPlaying from "./pages/NowPlaying"
import PlayerBar from "./components/PlayerBar"
import { AudioPlayerProvider } from "./hooks/useAudioPlayer"
import PlaylistDetail from "./pages/PlaylistDetail"

const navItems = [
  { to: "/", label: "Upload" },
  { to: "/songs", label: "All Songs" },
  { to: "/playlists", label: "Playlists" },
  { to: "/now", label: "Now Playing" },
]

export default function App() {
  return (
    <AudioPlayerProvider>
      <div className="min-h-screen bg-zinc-950 text-white">
        <div className="flex min-h-screen pb-28">
          <aside className="hidden w-64 border-r border-zinc-800 bg-black p-6 md:block">
            <h1 className="mb-8 text-2xl font-bold">Localify</h1>

            <nav className="space-y-2">
              {navItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    `block rounded-xl px-4 py-3 text-sm font-medium transition ${
                      isActive
                        ? "bg-green-500 text-black"
                        : "text-zinc-400 hover:bg-zinc-900 hover:text-white"
                    }`
                  }
                >
                  {item.label}
                </NavLink>
              ))}
            </nav>
          </aside>

          <div className="flex min-w-0 flex-1 flex-col">
            <header className="sticky top-0 z-10 border-b border-zinc-800 bg-zinc-950/90 p-4 backdrop-blur md:hidden">
              <h1 className="text-xl font-bold">Localify</h1>

              <nav className="mt-4 flex gap-2 overflow-x-auto">
                {navItems.map((item) => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    className={({ isActive }) =>
                      `rounded-full px-4 py-2 text-sm whitespace-nowrap ${
                        isActive
                          ? "bg-green-500 text-black"
                          : "bg-zinc-900 text-zinc-300"
                      }`
                    }
                  >
                    {item.label}
                  </NavLink>
                ))}
              </nav>
            </header>

            <main className="flex-1">
              <Routes>
                <Route path="/" element={<Upload />} />
                <Route path="/songs" element={<Songs />} />
                <Route path="/playlists" element={<Playlists />} />
                <Route path="/playlists/:id" element={<PlaylistDetail />} />
                <Route path="/now" element={<NowPlaying />} />
              </Routes>
            </main>
          </div>
        </div>

        <PlayerBar />
      </div>
    </AudioPlayerProvider>
  )
}