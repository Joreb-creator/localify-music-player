import { useEffect, useMemo, useState } from "react"
import { Link, useParams } from "react-router-dom"
import { db } from "../db/indexedDb"
import type { Playlist, Track } from "../types"
import Artwork from "../components/Artwork"
import { formatTime } from "../lib/audio"
import { useAudioPlayer } from "../hooks/useAudioPlayer"

export default function PlaylistDetail() {
  const { id } = useParams()
  const [playlist, setPlaylist] = useState<Playlist | null>(null)
  const [tracks, setTracks] = useState<Track[]>([])
  const { playTrack, currentTrack } = useAudioPlayer()

  const loadData = async () => {
    if (!id) return

    const foundPlaylist = await db.playlists.get(id)
    const allTracks = await db.tracks.toArray()

    setPlaylist(foundPlaylist ?? null)
    setTracks(allTracks)
  }

  useEffect(() => {
    loadData()
  }, [id])

  const playlistTracks = useMemo(() => {
    if (!playlist) return []

    return playlist.trackIds
      .map((trackId) => tracks.find((track) => track.id === trackId))
      .filter(Boolean) as Track[]
  }, [playlist, tracks])

  const availableTracks = useMemo(() => {
    if (!playlist) return tracks

    return tracks.filter((track) => !playlist.trackIds.includes(track.id))
  }, [playlist, tracks])

  const addTrack = async (trackId: string) => {
    if (!playlist) return

    const updatedPlaylist: Playlist = {
      ...playlist,
      trackIds: [...playlist.trackIds, trackId],
      updatedAt: Date.now(),
    }

    await db.playlists.put(updatedPlaylist)
    setPlaylist(updatedPlaylist)
  }

  const removeTrack = async (trackId: string) => {
    if (!playlist) return

    const updatedPlaylist: Playlist = {
      ...playlist,
      trackIds: playlist.trackIds.filter((id) => id !== trackId),
      updatedAt: Date.now(),
    }

    await db.playlists.put(updatedPlaylist)
    setPlaylist(updatedPlaylist)
  }

  if (!playlist) {
    return (
      <main className="mx-auto max-w-5xl p-6">
        <p className="text-zinc-400">Playlist not found.</p>
        <Link to="/playlists" className="mt-4 inline-block text-purple-300">
          Back to playlists
        </Link>
      </main>
    )
  }

  return (
    <main className="mx-auto max-w-5xl p-6">
      <Link to="/playlists" className="mb-6 inline-block text-sm text-zinc-400">
        ← Back to playlists
      </Link>

      <section className="mb-8 rounded-3xl bg-gradient-to-br from-purple-500/20 to-zinc-900 p-6">
        <p className="mb-2 text-sm font-medium text-purple-300">Playlist</p>
        <h1 className="text-3xl font-bold">{playlist.name}</h1>
        <p className="mt-2 text-zinc-400">
          {playlist.trackIds.length}{" "}
          {playlist.trackIds.length === 1 ? "song" : "songs"}
        </p>
      </section>

      <section className="mb-8">
        <h2 className="mb-3 text-lg font-semibold">Songs in playlist</h2>

        {playlistTracks.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-zinc-700 p-6 text-zinc-400">
            This playlist is empty.
          </div>
        ) : (
          <div className="overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900/60">
            {playlistTracks.map((track) => {
              const isActive = currentTrack?.id === track.id

              return (
                <div
                  key={track.id}
                  className={`flex items-center gap-4 border-b border-zinc-800 p-4 last:border-b-0 ${
                    isActive ? "bg-purple-500/10" : ""
                  }`}
                >
                  <button
                    onClick={() => playTrack(track, playlistTracks)}
                    className="flex min-w-0 flex-1 items-center gap-4 text-left"
                  >
                    <Artwork artworkBlobId={track.artworkBlobId} title={track.title} />

                    <div className="min-w-0 flex-1">
                      <h3 className="truncate font-medium">{track.title}</h3>
                      <p className="truncate text-sm text-zinc-400">
                        {track.artist} • {track.album}
                      </p>
                    </div>

                    <span className="text-sm text-zinc-500">
                      {formatTime(track.duration)}
                    </span>
                  </button>

                  <button
                    onClick={() => removeTrack(track.id)}
                    className="rounded-lg bg-zinc-800 px-3 py-2 text-sm hover:bg-red-600"
                  >
                    Remove
                  </button>
                </div>
              )
            })}
          </div>
        )}
      </section>

      <section>
        <h2 className="mb-3 text-lg font-semibold">Add songs</h2>

        {availableTracks.length === 0 ? (
          <p className="text-zinc-400">No available songs to add.</p>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {availableTracks.map((track) => (
              <button
                key={track.id}
                onClick={() => addTrack(track.id)}
                className="flex items-center gap-3 rounded-xl border border-zinc-800 bg-zinc-900 p-3 text-left hover:bg-zinc-800"
              >
                <Artwork artworkBlobId={track.artworkBlobId} title={track.title} />

                <div className="min-w-0">
                  <p className="truncate font-medium">{track.title}</p>
                  <p className="truncate text-sm text-zinc-400">{track.artist}</p>
                </div>
              </button>
            ))}
          </div>
        )}
      </section>
    </main>
  )
}