import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { db } from "../db/indexedDb"
import type { Playlist } from "../types"

export default function Playlists() {
  const [playlists, setPlaylists] = useState<Playlist[]>([])
  const [name, setName] = useState("")

  const loadPlaylists = async () => {
    const allPlaylists = await db.playlists.orderBy("createdAt").reverse().toArray()
    setPlaylists(allPlaylists)
  }

  useEffect(() => {
    loadPlaylists()
  }, [])

  const createPlaylist = async () => {
    const trimmedName = name.trim()

    if (!trimmedName) return

    const now = Date.now()

    await db.playlists.put({
      id: crypto.randomUUID(),
      name: trimmedName,
      trackIds: [],
      createdAt: now,
      updatedAt: now,
    })

    setName("")
    await loadPlaylists()
  }

  const deletePlaylist = async (playlistId: string) => {
    const confirmed = window.confirm("Delete this playlist?")

    if (!confirmed) return

    await db.playlists.delete(playlistId)
    await loadPlaylists()
  }

  return (
    <main className="mx-auto max-w-5xl p-6">
      <section className="mb-8 rounded-3xl bg-gradient-to-br from-purple-500/20 to-zinc-900 p-6">
        <p className="mb-2 text-sm font-medium text-purple-300">Collections</p>
        <h1 className="text-3xl font-bold">Playlists</h1>
        <p className="mt-2 text-zinc-400">
          Create local playlists stored in your browser.
        </p>
      </section>

      <div className="mb-6 flex flex-col gap-3 sm:flex-row">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="New playlist name..."
          className="w-full rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-3 text-sm outline-none focus:border-purple-400"
        />

        <button
          onClick={createPlaylist}
          className="rounded-xl bg-purple-500 px-5 py-3 text-sm font-semibold text-black hover:bg-purple-400"
        >
          Create
        </button>
      </div>

      {playlists.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-zinc-700 p-8 text-center text-zinc-400">
          No playlists yet. Create your first one above.
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {playlists.map((playlist) => (
            <div
              key={playlist.id}
              className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5"
            >
              <Link to={`/playlists/${playlist.id}`}>
                <h2 className="text-lg font-semibold hover:text-purple-300">
                  {playlist.name}
                </h2>
              </Link>

              <p className="mt-2 text-sm text-zinc-400">
                {playlist.trackIds.length}{" "}
                {playlist.trackIds.length === 1 ? "song" : "songs"}
              </p>

              <button
                onClick={() => deletePlaylist(playlist.id)}
                className="mt-4 rounded-lg bg-zinc-800 px-3 py-2 text-sm text-zinc-300 hover:bg-red-600 hover:text-white"
              >
                Delete
              </button>
            </div>
          ))}
        </div>
      )}
    </main>
  )
}