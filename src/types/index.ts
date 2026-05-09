export type Track = {
  id: string
  title: string
  artist: string
  album: string
  duration: number
  audioBlobId: string
  artworkBlobId?: string
  year?: number
  genre?: string
  createdAt: number
  updatedAt: number
}

export type BlobDoc = {
  id: string
  type: "audio" | "artwork"
  blob: Blob
}

export type Playlist = {
  id: string
  name: string
  trackIds: string[]
  createdAt: number
  updatedAt: number
}

export type AppSettings = {
  theme: "light" | "dark"
  repeat: "off" | "one" | "all"
  shuffle: boolean
  lastQueue: string[]
  lastTrackId?: string
  lastPosition?: number
}