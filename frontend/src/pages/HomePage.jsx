import { useState } from "react"
import AppShell, { PageHeading } from "../components/AppShell"
import { LecturesIcon, LinkIcon, PlayIcon } from "../components/icons"
import { youtubeVideoId } from "../youtube"

const lectures = []

function HomePage({ onStartLearning }) {
  const [url, setUrl] = useState("")

  function openLecture(nextUrl) {
    if (!youtubeVideoId(nextUrl)) return
    onStartLearning(nextUrl.trim())
  }

  function handleSubmit(event) {
    event.preventDefault()
    openLecture(url)
  }

  return (
    <AppShell activeItem="home" onHome={() => {}}>
      <PageHeading
        title="2. Home"
        subtitle="Paste a YouTube link to start learning, or pick up where you left off"
      />

      <form
        onSubmit={handleSubmit}
        className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
      >
        <label className="relative min-w-0 flex-1">
          <span className="sr-only">YouTube link</span>
          <span className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-slate-400">
            <LinkIcon />
          </span>
          <input
            value={url}
            onChange={(event) => {
              const nextUrl = event.target.value
              setUrl(nextUrl)
              openLecture(nextUrl)
            }}
            placeholder="Paste a YouTube link here"
            className="w-full rounded-lg border border-slate-300 py-2.5 pr-3 pl-10 text-sm outline-none placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          />
        </label>
        <button
          type="submit"
          className="cursor-pointer rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold whitespace-nowrap text-white hover:bg-blue-700"
        >
          Start learning
        </button>
      </form>

      <section className="mt-6 rounded-2xl border border-slate-200 bg-white px-5 py-4 shadow-sm">
        <div className="flex items-center justify-between">
          <h2 className="flex items-center gap-2 text-sm font-semibold text-slate-900">
            <LecturesIcon />
            Your lectures
          </h2>
          <button type="button" className="cursor-pointer text-sm font-medium text-blue-600">
            See all
          </button>
        </div>

        <ul className="mt-2">
          {lectures.map((lecture) => (
            <LectureRow key={lecture.id} lecture={lecture} />
          ))}
        </ul>
      </section>
    </AppShell>
  )
}

function LectureRow({ lecture }) {
  const statusClass =
    lecture.status === "Getting ready"
      ? "bg-amber-100 text-amber-700"
      : "bg-green-100 text-green-700"

  return (
    <li className="flex items-center gap-4 border-t border-slate-100 py-3">
      <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100 text-slate-500">
        <PlayIcon />
      </span>
      <div className="min-w-0 flex-1">
        <p className="font-semibold text-slate-900">{lecture.title}</p>
        <p className="text-xs text-slate-500">{lecture.duration}</p>
      </div>
      <span className={`rounded-full px-3 py-1 text-xs font-medium ${statusClass}`}>
        {lecture.status}
      </span>
      <span className="text-slate-400">›</span>
    </li>
  )
}

export default HomePage
