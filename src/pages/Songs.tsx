import { useEffect, useMemo, useState } from "react"
import Artwork from "../components/Artwork"
import { db } from "../db/indexedDb"
import { useAudioPlayer } from "../hooks/useAudioPlayer"
import { formatTime } from "../lib/audio"
import type { Track } from "../types"

export default function Songs() {
  const [tracks, setTracks] = useState<Track[]>([])
  const [search, setSearch] = useState("")

  const { currentTrack, playTrack } = useAudioPlayer()

  const loadTracks = async () => {
    const allTracks = await db.tracks.orderBy("createdAt").reverse().toArray()

    setTracks(allTracks)
  }

  useEffect(() => {
    loadTracks()
  }, [])

  const filteredTracks = useMemo(() => {
    const query = search.toLowerCase()

    return tracks.filter((track) => {
      return (
        track.title.toLowerCase().includes(query) ||
        track.artist.toLowerCase().includes(query) ||
        track.album.toLowerCase().includes(query)
      )
    })
  }, [tracks, search])

  const clearLibrary = async () => {
    const confirmed = window.confirm(
      "Delete all songs and stored files?"
    )

    if (!confirmed) return

    await db.tracks.clear()
    await db.blobs.clear()

    setTracks([])
  }

  const deleteTrack = async (track: Track) => {
    const confirmed = window.confirm(
      `Delete "${track.title}"?`
    )

    if (!confirmed) return

    await db.tracks.delete(track.id)
    await db.blobs.delete(track.audioBlobId)

    if (track.artworkBlobId) {
      await db.blobs.delete(track.artworkBlobId)
    }

    await loadTracks()
  }

  return (
    <main className="mx-auto max-w-6xl p-6 pb-40">
      <section className="mb-8 rounded-3xl bg-gradient-to-br from-green-500/20 to-zinc-900 p-6">
        <p className="mb-2 text-sm font-medium text-green-400">
          Library
        </p>

        <h1 className="text-4xl font-bold">All Songs</h1>

        <p className="mt-2 text-zinc-400">
          {tracks.length} tracks stored locally
        </p>
      </section>

      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <input
          type="text"
          placeholder="Search songs, artists, or albums..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-3 text-sm outline-none transition focus:border-green-500 sm:max-w-md"
        />

        <button
          onClick={clearLibrary}
          className="rounded-xl bg-red-600 px-4 py-3 text-sm font-medium text-white transition hover:bg-red-500"
        >
          Clear Library
        </button>
      </div>

      <div className="overflow-hidden rounded-3xl border border-zinc-800 bg-zinc-900">
        {filteredTracks.length === 0 ? (
          <div className="p-10 text-center text-zinc-500">
            No songs found.
          </div>
        ) : (
          filteredTracks.map((track) => {
            const isActive = currentTrack?.id === track.id

            return (
              <div
                key={track.id}
                onClick={() => playTrack(track, filteredTracks)}
                className={`flex cursor-pointer items-center gap-4 border-b border-zinc-800 p-4 transition hover:bg-zinc-800/60 ${
                  isActive ? "bg-green-500/10" : ""
                }`}
              >
                <Artwork
                  artworkBlobId={track.artworkBlobId}
                  title={track.title}
                  size="sm"
                />

                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium">
                    {track.title}
                  </p>

                  <p className="truncate text-sm text-zinc-400">
                    {track.artist} • {track.album}
                  </p>
                </div>

                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    deleteTrack(track)
                  }}
                  className="rounded-lg bg-zinc-800 px-3 py-2 text-sm text-zinc-300 transition hover:bg-red-600 hover:text-white"
                >
                  Delete
                </button>

                <span className="text-sm text-zinc-500">
                  {formatTime(track.duration)}
                </span>
              </div>
            )
          })
        )}
      </div>
    </main>
  )
}