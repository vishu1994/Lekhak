const VIDEO_ID_PATTERN =
  /(?:youtube\.com\/(?:watch\?(?:.*&)?v=|embed\/|shorts\/)|youtu\.be\/)([A-Za-z0-9_-]{11})/

export function youtubeVideoId(input) {
  const match = input.trim().match(VIDEO_ID_PATTERN)
  return match ? match[1] : null
}

export async function fetchYouTubeDetails(input) {
  const id = youtubeVideoId(input)
  if (!id) return null

  const watchUrl = `https://www.youtube.com/watch?v=${id}`
  const thumbnailUrl = `https://i.ytimg.com/vi/${id}/hqdefault.jpg`
  const response = await fetch(
    `https://www.youtube.com/oembed?url=${encodeURIComponent(watchUrl)}&format=json`,
  )

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

  const data = await response.json()
  return {
    id,
    title: data.title,
    channel: data.author_name ?? "",
    thumbnailUrl: data.thumbnail_url || thumbnailUrl,
    watchUrl,
    embeddable: true,
  }
}
