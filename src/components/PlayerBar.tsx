import { useAudioPlayer } from "../hooks/useAudioPlayer"
import { formatTime } from "../lib/audio"
import Artwork from "./Artwork"

export default function PlayerBar() {
  const {
    currentTrack,
    isPlaying,
    togglePlay,
    currentTime,
    duration,
    seekTo,
    playNext,
    playPrevious,
    shuffle,
    repeat,
    toggleShuffle,
    toggleRepeat,
    volume,
    setVolumeLevel,
  } = useAudioPlayer()

  if (!currentTrack) return null

  return (
    <footer className="fixed bottom-0 left-0 right-0 border-t border-zinc-800 bg-zinc-950 p-4">
      <div className="flex items-center justify-between gap-4">
        <div className="flex min-w-0 items-center gap-3">
          <Artwork
            artworkBlobId={currentTrack.artworkBlobId}
            title={currentTrack.title}
            size="sm"
          />

          <div className="min-w-0">
            <p className="truncate font-medium">{currentTrack.title}</p>
            <p className="truncate text-sm text-zinc-400">
              {currentTrack.artist} • {currentTrack.album}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={toggleShuffle}
            className={`rounded-full px-3 py-2 text-sm ${
              shuffle ? "bg-green-500 text-black" : "bg-zinc-800 text-white"
            }`}
          >
            Shuffle
          </button>

          <button
            onClick={playPrevious}
            className="rounded-full bg-zinc-800 px-3 py-2 text-sm"
          >
            Prev
          </button>

          <button
            onClick={togglePlay}
            className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-black"
          >
            {isPlaying ? "Pause" : "Play"}
          </button>

          <button
            onClick={playNext}
            className="rounded-full bg-zinc-800 px-3 py-2 text-sm"
          >
            Next
          </button>

          <button
            onClick={toggleRepeat}
            className={`rounded-full px-3 py-2 text-sm ${
              repeat ? "bg-green-500 text-black" : "bg-zinc-800 text-white"
            }`}
          >
            Repeat
          </button>
        </div>
      </div>

      <div className="mt-3 flex items-center gap-3">
        <span className="w-10 text-xs text-zinc-400">
          {formatTime(currentTime)}
        </span>

        <input
          type="range"
          min="0"
          max={duration || 0}
          value={currentTime}
          onChange={(e) => seekTo(Number(e.target.value))}
          className="w-full"
          aria-label="Song progress"
        />

        <span className="w-10 text-right text-xs text-zinc-400">
          {formatTime(duration)}
        </span>
        <div className="flex items-center gap-2">
  <span className="text-xs text-zinc-400">Vol</span>

  <input
    type="range"
    min="0"
    max="1"
    step="0.01"
    value={volume}
    onChange={(e) => setVolumeLevel(Number(e.target.value))}
    className="w-24"
    aria-label="Volume"
  />
</div>
      </div>
    </footer>
  )
}