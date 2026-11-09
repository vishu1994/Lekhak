import { afterEach, describe, expect, it, vi } from "vitest"
import {
  fetchYouTubeDetails,
  YouTubePreviewError,
  youtubeVideoId,
} from "./youtube"

describe("youtubeVideoId", () => {
  it("reads an id from watch, short, and youtu.be links", () => {
    expect(youtubeVideoId("https://www.youtube.com/watch?v=gsI5Pw2Y63U")).toBe(
      "gsI5Pw2Y63U",
    )
    expect(youtubeVideoId("https://youtu.be/gsI5Pw2Y63U?si=abc")).toBe(
      "gsI5Pw2Y63U",
    )
    expect(youtubeVideoId("https://www.youtube.com/shorts/gsI5Pw2Y63U")).toBe(
      "gsI5Pw2Y63U",
    )
  })

  it("rejects text that is not a YouTube link", () => {
    expect(youtubeVideoId("https://example.com/watch?v=gsI5Pw2Y63U")).toBeNull()
    expect(youtubeVideoId("not a url")).toBeNull()
  })
})

describe("fetchYouTubeDetails", () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it("returns title and channel when YouTube allows a preview", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          title: "Async tasks",
          author_name: "Zubair Khan",
          thumbnail_url: "https://i.ytimg.com/vi/gsI5Pw2Y63U/hqdefault.jpg",
        }),
      }),
    )

    const details = await fetchYouTubeDetails("https://youtu.be/gsI5Pw2Y63U")

    expect(details).toMatchObject({
      id: "gsI5Pw2Y63U",
      title: "Async tasks",
      channel: "Zubair Khan",
      embeddable: true,
    })
  })

  it("keeps a thumbnail when YouTube refuses the preview", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: false }))

    const details = await fetchYouTubeDetails("https://youtu.be/b2kdhkUXI2U")

    expect(details).toMatchObject({
      id: "b2kdhkUXI2U",
      title: "",
      embeddable: false,
      thumbnailUrl: "https://i.ytimg.com/vi/b2kdhkUXI2U/hqdefault.jpg",
    })
  })

  it("throws a YouTubePreviewError when the request cannot be sent", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new TypeError("offline")))

    await expect(
      fetchYouTubeDetails("https://youtu.be/gsI5Pw2Y63U"),
    ).rejects.toBeInstanceOf(YouTubePreviewError)
  })
})
