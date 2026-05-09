import Artwork from "../components/Artwork"
import AudioVisualizer from "../components/AudioVisualizer"
import { useAudioPlayer } from "../hooks/useAudioPlayer"
import { formatTime } from "../lib/audio"

export default function NowPlaying() {
  const {
    currentTrack,
    isPlaying,
    currentTime,
    duration,
    audioElement,
    togglePlay,
  } = useAudioPlayer()

  if (!currentTrack) {
    return (
      <main className="mx-auto max-w-5xl p-6">
        <section className="rounded-3xl border border-dashed border-zinc-700 p-10 text-center">
          <h1 className="text-3xl font-bold">Now Playing</h1>
          <p className="mt-3 text-zinc-400">
            Play a song from your library to start the visualizer.
          </p>
        </section>
      </main>
    )
  }

  return (
    <main className="mx-auto max-w-5xl p-6">
      <section className="mb-8 rounded-3xl bg-gradient-to-br from-green-500/20 to-zinc-900 p-6">
        <p className="mb-2 text-sm font-medium text-green-400">Now Playing</p>
        <h1 className="text-3xl font-bold">{currentTrack.title}</h1>
        <p className="mt-2 text-zinc-400">
          {currentTrack.artist} • {currentTrack.album}
        </p>
      </section>

      <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
        <div className="rounded-3xl border border-zinc-800 bg-zinc-900 p-6">
          <Artwork
            artworkBlobId={currentTrack.artworkBlobId}
            title={currentTrack.title}
            size="lg"
          />

          <button
            onClick={togglePlay}
            className="mt-6 w-full rounded-full bg-green-500 px-5 py-3 font-semibold text-black hover:bg-green-400"
          >
            {isPlaying ? "Pause" : "Play"}
          </button>

          <p className="mt-4 text-center text-sm text-zinc-400">
            {formatTime(currentTime)} / {formatTime(duration)}
          </p>
        </div>

        <AudioVisualizer audioElement={audioElement} isPlaying={isPlaying} />
      </div>
    </main>
  )
}