import { useEffect, useRef } from "react"

type AudioVisualizerProps = {
  audioElement: HTMLAudioElement | null
  isPlaying: boolean
}

const audioNodes = new WeakMap<
  HTMLAudioElement,
  {
    audioContext: AudioContext
    analyser: AnalyserNode
  }
>()

export default function AudioVisualizer({
  audioElement,
  isPlaying,
}: AudioVisualizerProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const animationRef = useRef<number | null>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || !audioElement) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    let audioSetup = audioNodes.get(audioElement)

    if (!audioSetup) {
      const audioContext = new AudioContext()
      const analyser = audioContext.createAnalyser()
      analyser.fftSize = 256

      const source = audioContext.createMediaElementSource(audioElement)
      source.connect(analyser)
      analyser.connect(audioContext.destination)

      audioSetup = { audioContext, analyser }
      audioNodes.set(audioElement, audioSetup)
    }

    if (audioSetup.audioContext.state === "suspended") {
      audioSetup.audioContext.resume()
    }

    const draw = () => {
      const analyser = audioSetup.analyser
      const bufferLength = analyser.frequencyBinCount
      const dataArray = new Uint8Array(bufferLength)

      analyser.getByteFrequencyData(dataArray)

      const width = canvas.width
      const height = canvas.height
      const barWidth = width / bufferLength

      ctx.clearRect(0, 0, width, height)

      dataArray.forEach((value, index) => {
        const barHeight = isPlaying
          ? Math.max((value / 255) * height, 8)
          : Math.sin(index * 0.35) * 10 + 22

        const x = index * barWidth
        const y = height - barHeight

        ctx.fillStyle = "#22c55e"
        ctx.fillRect(x, y, Math.max(barWidth - 2, 2), barHeight)
      })

      animationRef.current = requestAnimationFrame(draw)
    }

    draw()

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [audioElement, isPlaying])

  return (
    <canvas
      ref={canvasRef}
      width={900}
      height={260}
      className="h-64 w-full rounded-3xl border border-zinc-800 bg-black"
      aria-label="Audio visualizer"
    />
  )
}