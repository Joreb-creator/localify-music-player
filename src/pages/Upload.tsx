import { useState } from "react"
import { parseAudioFile } from "../lib/id3"
import { db } from "../db/indexedDb"

export default function Upload() {
  const [loading, setLoading] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const [message, setMessage] = useState("")

  const handleFiles = async (files: FileList | File[] | null) => {
    if (!files) return

    const audioFiles = Array.from(files).filter((file) =>
      file.type.includes("audio")
    )

    if (audioFiles.length === 0) {
      setMessage("Please select MP3 or audio files.")
      return
    }

    setLoading(true)
    setMessage(`Processing ${audioFiles.length} file(s)...`)

    for (const file of audioFiles) {
      const meta = await parseAudioFile(file)

      const trackId = crypto.randomUUID()
      const audioBlobId = crypto.randomUUID()
      const artworkBlobId = meta.artwork ? crypto.randomUUID() : undefined

      await db.blobs.put({
        id: audioBlobId,
        type: "audio",
        blob: file,
      })

      if (meta.artwork && artworkBlobId) {
        await db.blobs.put({
          id: artworkBlobId,
          type: "artwork",
          blob: meta.artwork,
        })
      }

      await db.tracks.put({
        id: trackId,
        title: meta.title,
        artist: meta.artist,
        album: meta.album,
        duration: meta.duration,
        audioBlobId,
        artworkBlobId,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      })
    }

    setLoading(false)
    setMessage(`Imported ${audioFiles.length} file(s) successfully.`)
  }

  return (
    <main className="mx-auto max-w-5xl p-6">
      <section className="mb-8 rounded-3xl bg-gradient-to-br from-green-500/20 to-zinc-900 p-6">
        <p className="mb-2 text-sm font-medium text-green-400">Import</p>
        <h1 className="text-3xl font-bold">Upload Music</h1>
        <p className="mt-2 text-zinc-400">
          Drag and drop your local MP3 files or choose them manually.
        </p>
      </section>

      <div
        onDragOver={(e) => {
          e.preventDefault()
          setIsDragging(true)
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(e) => {
          e.preventDefault()
          setIsDragging(false)
          handleFiles(e.dataTransfer.files)
        }}
        className={`flex min-h-72 flex-col items-center justify-center rounded-3xl border-2 border-dashed p-8 text-center transition ${
          isDragging
            ? "border-green-400 bg-green-500/10"
            : "border-zinc-700 bg-zinc-900/70"
        }`}
      >
        <p className="text-xl font-semibold">
          {isDragging ? "Drop your music here" : "Drag MP3 files here"}
        </p>

        <p className="mt-2 max-w-md text-sm text-zinc-400">
          Files are stored locally in your browser using IndexedDB. Nothing is
          uploaded to a server.
        </p>

        <label className="mt-6 cursor-pointer rounded-xl bg-green-500 px-5 py-3 text-sm font-semibold text-black hover:bg-green-400">
          Choose Files
          <input
            type="file"
            accept="audio/mpeg,audio/*"
            multiple
            className="hidden"
            onChange={(e) => handleFiles(e.target.files)}
          />
        </label>

        {loading && <p className="mt-4 text-sm text-zinc-400">Processing...</p>}

        {message && !loading && (
          <p className="mt-4 text-sm text-green-400">{message}</p>
        )}
      </div>
    </main>
  )
}