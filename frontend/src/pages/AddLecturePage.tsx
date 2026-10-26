import { useEffect, useState, type FormEvent } from "react"
import AppShell, { PageHeading } from "../components/AppShell"
import { CheckIcon, LinkIcon } from "../components/icons"
import {
  fetchYouTubeDetails,
  youtubeVideoId,
  type YouTubePreview,
} from "../youtube"

type AddLecturePageProps = {
  initialUrl: string
  onHome: () => void
  onLectureAdded: () => void
}

function AddLecturePage({
  initialUrl,
  onHome,
  onLectureAdded,
}: AddLecturePageProps) {
  const [url, setUrl] = useState(initialUrl)
  const [video, setVideo] = useState<YouTubePreview | null>(null)
  const [loading, setLoading] = useState(() =>
    Boolean(youtubeVideoId(initialUrl)),
  )
  const [error, setError] = useState("")

  function changeUrl(nextUrl: string) {
    setUrl(nextUrl)
    if (!youtubeVideoId(nextUrl)) {
      setVideo(null)
      setLoading(false)
      setError("")
      return
    }
    setLoading(true)
    setError("")
  }

  useEffect(() => {
    if (!youtubeVideoId(url)) return

    let cancelled = false
    const timer = setTimeout(() => {
      fetchYouTubeDetails(url)
        .then((details) => {
          if (!cancelled) setVideo(details)
        })
        .catch((loadError: unknown) => {
          if (!cancelled) {
            setVideo(null)
            setError(
              loadError instanceof Error
                ? loadError.message
                : "This YouTube link could not be loaded.",
            )
          }
        })
        .finally(() => {
          if (!cancelled) setLoading(false)
        })
    }, 300)

    return () => {
      cancelled = true
      clearTimeout(timer)
    }
  }, [url])

  const showPreview = loading || error || video

  return (
    <AppShell activeItem="home" onHome={onHome}>
      <PageHeading
        title="3. Add a Lecture"
        subtitle="Paste a link, check it is the right video, then start"
      />

      <form
        onSubmit={(event: FormEvent<HTMLFormElement>) => {
          event.preventDefault()
          if (youtubeVideoId(url)) onLectureAdded()
        }}
        className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
      >
        <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold text-slate-900">
          <LinkIcon />
          Add a YouTube lecture
        </h2>
        <div className="flex items-center gap-4">
          <label className="relative min-w-0 flex-1">
            <span className="sr-only">YouTube link</span>
            <span className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-slate-400">
              <LinkIcon />
            </span>
            <input
              value={url}
              onChange={(event) => changeUrl(event.target.value)}
              placeholder="https://www.youtube.com/watch?v=abc123"
              className="w-full rounded-lg border border-slate-300 py-2.5 pr-3 pl-10 text-sm outline-none placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </label>
          <button
            type="submit"
            className="cursor-pointer rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold whitespace-nowrap text-white hover:bg-blue-700"
          >
            Add lecture
          </button>
        </div>
      </form>

      {showPreview && (
        <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between gap-4">
            <h2 className="flex items-center gap-2 text-sm font-semibold text-slate-900">
              <CheckIcon className="h-4 w-4 shrink-0 text-slate-700" />
              Is this the right video?
            </h2>
            {video?.watchUrl && (
              <a
                href={video.watchUrl}
                target="_blank"
                rel="noreferrer"
                className="shrink-0 text-sm font-medium text-blue-600 hover:text-blue-700"
              >
                Watch on YouTube
              </a>
            )}
          </div>

          {loading && (
            <p className="mt-4 text-sm text-slate-500">
              Loading video details…
            </p>
          )}
          {error && <p className="mt-4 text-sm text-red-600">{error}</p>}

          {video && (
            <div className="mt-5 flex items-start gap-6">
              <img
                src={video.thumbnailUrl}
                alt=""
                className="pointer-events-none h-40 w-64 shrink-0 rounded-xl bg-slate-100 object-cover"
              />

              <div className="min-w-0 flex-1">
                <h3 className="text-xl font-semibold text-[#1e3a8a]">
                  {video.title || "YouTube video"}
                </h3>
                {video.channel && (
                  <p className="mt-1 text-sm text-slate-500">{video.channel}</p>
                )}
                <p className="mt-4 border-t border-slate-200 pt-4 text-sm text-slate-500">
                  {video.embeddable
                    ? "We'll get this lecture ready for you. It usually takes a few minutes and you can leave the page while you wait."
                    : "The owner of this video has turned off sharing the title from other sites. Use Watch on YouTube to open it."}
                </p>
              </div>
            </div>
          )}
        </section>
      )}
    </AppShell>
  )
}

export default AddLecturePage
