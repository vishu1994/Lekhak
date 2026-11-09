const VIDEO_ID_PATTERN =
  /(?:youtube\.com\/(?:watch\?(?:.*&)?v=|embed\/|shorts\/)|youtu\.be\/)([A-Za-z0-9_-]{11})/

export type YouTubePreview = {
  id: string
  title: string
  channel: string
  thumbnailUrl: string
  watchUrl: string
  embeddable: boolean
}

type OEmbedResponse = {
  title?: string
  author_name?: string
  thumbnail_url?: string
}

export class YouTubePreviewError extends Error {
  constructor(message = "This YouTube link could not be loaded.") {
    super(message)
    this.name = "YouTubePreviewError"
  }
}

export function youtubeVideoId(input: string): string | null {
  const match = input.trim().match(VIDEO_ID_PATTERN)
  return match ? match[1] : null
}

/**
 * Loads the public YouTube preview for a pasted link.
 *
 * Returns null when the text is not a YouTube URL. A video that disallows
 * embedding is returned with embeddable set to false. Network failures throw
 * YouTubePreviewError.
 */
export async function fetchYouTubeDetails(
  input: string,
): Promise<YouTubePreview | null> {
  const id = youtubeVideoId(input)
  if (!id) return null

  const watchUrl = `https://www.youtube.com/watch?v=${id}`
  const thumbnailUrl = `https://i.ytimg.com/vi/${id}/hqdefault.jpg`
  let response: Response
  try {
    response = await fetch(
      `https://www.youtube.com/oembed?url=${encodeURIComponent(watchUrl)}&format=json`,
    )
  } catch {
    throw new YouTubePreviewError()
  }

  if (!response.ok) {
    return {
      id,
      title: "",
      channel: "",
      thumbnailUrl,
      watchUrl,
      embeddable: false,
    }
  }

  const data = (await response.json()) as OEmbedResponse
  return {
    id,
    title: data.title ?? "",
    channel: data.author_name ?? "",
    thumbnailUrl: data.thumbnail_url || thumbnailUrl,
    watchUrl,
    embeddable: true,
  }
}
