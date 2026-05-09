import { createContext, useContext, useRef, useState } from "react"
import { db } from "../db/indexedDb"
import type { Track } from "../types"

type AudioPlayerContextValue = {
  currentTrack: Track | null
  isPlaying: boolean
  currentTime: number
  duration: number
  volume: number
  queue: Track[]
  shuffle: boolean
  repeat: boolean
  audioElement: HTMLAudioElement | null
  playTrack: (track: Track, queueTracks?: Track[]) => Promise<void>
  togglePlay: () => void
  seekTo: (time: number) => void
  playNext: () => void
  playPrevious: () => void
  toggleShuffle: () => void
  toggleRepeat: () => void
  setVolumeLevel: (value: number) => void
}

const AudioPlayerContext = createContext<AudioPlayerContextValue | null>(null)

export function AudioPlayerProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const audioRef = useRef<HTMLAudioElement | null>(null)

  const [currentTrack, setCurrentTrack] = useState<Track | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(1)

  const [queue, setQueue] = useState<Track[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [shuffle, setShuffle] = useState(false)
  const [repeat, setRepeat] = useState(false)

  const ensureAudio = () => {
    if (!audioRef.current) {
      audioRef.current = new Audio()

      audioRef.current.volume = volume

      audioRef.current.onplay = () => setIsPlaying(true)

      audioRef.current.onpause = () => setIsPlaying(false)

      audioRef.current.ontimeupdate = () => {
        setCurrentTime(audioRef.current?.currentTime ?? 0)
      }

      audioRef.current.onloadedmetadata = () => {
        setDuration(audioRef.current?.duration ?? 0)
      }

      audioRef.current.onended = () => {
        playNext()
      }
    }

    return audioRef.current
  }

  const internalPlay = async (track: Track) => {
    const blobDoc = await db.blobs.get(track.audioBlobId)

    if (!blobDoc) {
      console.error("Audio file not found")
      return
    }

    const audio = ensureAudio()

    const url = URL.createObjectURL(blobDoc.blob)

    audio.src = url

    setCurrentTrack(track)
    setCurrentTime(0)

    await audio.play()
  }

  const playTrack = async (track: Track, queueTracks?: Track[]) => {
    if (queueTracks) {
      setQueue(queueTracks)

      const index = queueTracks.findIndex((t) => t.id === track.id)

      setCurrentIndex(index >= 0 ? index : 0)
    }

    await internalPlay(track)
  }

  const playNext = async () => {
    if (queue.length === 0) return

    if (shuffle) {
      const randomIndex = Math.floor(Math.random() * queue.length)

      setCurrentIndex(randomIndex)

      await internalPlay(queue[randomIndex])

      return
    }

    const nextIndex = currentIndex + 1

    if (nextIndex >= queue.length) {
      if (repeat) {
        setCurrentIndex(0)

        await internalPlay(queue[0])
      }

      return
    }

    setCurrentIndex(nextIndex)

    await internalPlay(queue[nextIndex])
  }

  const playPrevious = async () => {
    if (queue.length === 0) return

    const prevIndex = currentIndex - 1

    if (prevIndex < 0) return

    setCurrentIndex(prevIndex)

    await internalPlay(queue[prevIndex])
  }

  const togglePlay = () => {
    const audio = audioRef.current

    if (!audio) return

    if (audio.paused) {
      audio.play()
    } else {
      audio.pause()
    }
  }

  const seekTo = (time: number) => {
    const audio = audioRef.current

    if (!audio) return

    audio.currentTime = time

    setCurrentTime(time)
  }

  const toggleShuffle = () => {
    setShuffle((prev) => !prev)
  }

  const toggleRepeat = () => {
    setRepeat((prev) => !prev)
  }

  const setVolumeLevel = (value: number) => {
    const audio = audioRef.current

    if (!audio) return

    audio.volume = value

    setVolume(value)
  }

  return (
    <AudioPlayerContext.Provider
      value={{
        currentTrack,
        isPlaying,
        currentTime,
        duration,
        volume,
        queue,
        shuffle,
        repeat,
        audioElement: audioRef.current,
        playTrack,
        togglePlay,
        seekTo,
        playNext,
        playPrevious,
        toggleShuffle,
        toggleRepeat,
        setVolumeLevel,
      }}
    >
      {children}
    </AudioPlayerContext.Provider>
  )
}

export function useAudioPlayer() {
  const context = useContext(AudioPlayerContext)

  if (!context) {
    throw new Error("useAudioPlayer must be used inside AudioPlayerProvider")
  }

  return context
}