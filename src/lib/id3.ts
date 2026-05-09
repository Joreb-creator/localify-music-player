import * as mm from "music-metadata-browser"

export async function parseAudioFile(file: File) {
  try {
    const metadata = await mm.parseBlob(file)

    const title = metadata.common.title || file.name
    const artist = metadata.common.artist || "Unknown Artist"
    const album = metadata.common.album || "Unknown Album"
    const duration = metadata.format.duration || 0

    let artwork: Blob | null = null

    if (metadata.common.picture && metadata.common.picture.length > 0) {
      const pic = metadata.common.picture[0]
      const artworkBytes = new Uint8Array(pic.data)
      artwork = new Blob([artworkBytes], { type: pic.format })
    }

    return {
      title,
      artist,
      album,
      duration,
      artwork,
    }
  } catch (err) {
    console.error("Metadata parse error:", err)

    return {
      title: file.name,
      artist: "Unknown Artist",
      album: "Unknown Album",
      duration: 0,
      artwork: null,
    }
  }
}