import Dexie, { Table } from "dexie"
import { Track, BlobDoc, Playlist, AppSettings } from "../types"

class AppDB extends Dexie {
  tracks!: Table<Track, string>
  blobs!: Table<BlobDoc, string>
  playlists!: Table<Playlist, string>
  app!: Table<AppSettings, string>

  constructor() {
    super("spotify-player-db")

    this.version(1).stores({
      tracks: "id, title, artist, album, createdAt",
      blobs: "id, type",
      playlists: "id, name, createdAt",
      app: "++id",
    })
  }
}

export const db = new AppDB()