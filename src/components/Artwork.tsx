import { useEffect, useState } from "react"
import { db } from "../db/indexedDb"

type ArtworkProps = {
  artworkBlobId?: string
  title: string
  size?: "sm" | "md" | "lg"
}

const sizeClasses = {
  sm: "h-12 w-12 text-xs",
  md: "h-16 w-16 text-sm",
  lg: "h-32 w-32 text-xl",
}

export default function Artwork({ artworkBlobId, title, size = "sm" }: ArtworkProps) {
  const [url, setUrl] = useState<string | null>(null)

  useEffect(() => {
    let objectUrl: string | null = null

    const loadArtwork = async () => {
      if (!artworkBlobId) return

      const blobDoc = await db.blobs.get(artworkBlobId)

      if (!blobDoc) return

      objectUrl = URL.createObjectURL(blobDoc.blob)
      setUrl(objectUrl)
    }

    loadArtwork()

    return () => {
      if (objectUrl) URL.revokeObjectURL(objectUrl)
    }
  }, [artworkBlobId])

  if (url) {
    return (
      <img
        src={url}
        alt={`${title} artwork`}
        className={`${sizeClasses[size]} rounded-lg object-cover`}
      />
    )
  }

  return (
    <div
      className={`${sizeClasses[size]} flex items-center justify-center rounded-lg bg-gradient-to-br from-zinc-700 to-zinc-900 font-bold text-zinc-300`}
      aria-label={`${title} placeholder artwork`}
    >
      {title.slice(0, 1).toUpperCase()}
    </div>
  )
}