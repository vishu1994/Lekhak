import { useState } from "react"
import AppShell, { PageHeading } from "../components/AppShell"
import {
  AskIcon,
  ExternalLinkIcon,
  FilledCheckIcon,
  FlashcardsIcon,
  HomeIcon,
  NotesIcon,
  PlayIcon,
  QuizIcon,
} from "../components/icons"
import Notes from "./Notes"

type LectureTab = "overview" | "notes" | "flashcards" | "quiz" | "ask"

type ReadyLecture = {
  title: string
  duration: string
  status: "Ready"
  watchUrl: string
  summary: string
  keyPoints: string[]
}

const readyLecture: ReadyLecture = {
  title: "React Complete Course",
  duration: "2h 15m",
  status: "Ready",
  watchUrl: "https://www.youtube.com",
  summary:
    "A short summary of the lecture appears here in two or three easy sentences.",
  keyPoints: [
    "What React is and why people use it",
    "How components and props work",
    "Using state and hooks",
  ],
}

const sectionCopy: Record<Exclude<LectureTab, "overview" | "notes">, string> = {
  flashcards: "Flashcards from this lecture appear here.",
  quiz: "A quiz from this lecture appears here.",
  ask: "Questions about this lecture appear here.",
}

const tabs: { id: LectureTab; label: string; icon: typeof HomeIcon }[] = [
  { id: "overview", label: "Overview", icon: HomeIcon },
  { id: "notes", label: "Notes", icon: NotesIcon },
  { id: "flashcards", label: "Flashcards", icon: FlashcardsIcon },
  { id: "quiz", label: "Quiz", icon: QuizIcon },
  { id: "ask", label: "Ask AI", icon: AskIcon },
]

type MyLecturesPageProps = {
  onHome: () => void
  onMyLectures: () => void
}

function MyLecturesPage({ onHome, onMyLectures }: MyLecturesPageProps) {
  const [tab, setTab] = useState<LectureTab>("overview")
  const heading =
    tab === "notes"
      ? {
          title: "6. Notes",
          subtitle: "Clear, organised notes you can read, edit and download",
        }
      : {
          title: "5. Your Lecture is Ready",
          subtitle: "Everything for one lecture in one place",
        }

  return (
    <AppShell activeItem="lectures" onHome={onHome} onMyLectures={onMyLectures}>
      <PageHeading title={heading.title} subtitle={heading.subtitle} />

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex items-start justify-between gap-4">
          <div className="flex min-w-0 items-center gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-500">
              <PlayIcon />
            </span>
            <div className="min-w-0">
              <h2 className="text-lg font-semibold text-slate-900">
                {readyLecture.title}
              </h2>
              <p className="text-sm text-slate-500">
                {readyLecture.duration}{" "}
                <span className="font-medium text-green-600">
                  {readyLecture.status}
                </span>
              </p>
            </div>
          </div>
          <a
            href={readyLecture.watchUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex shrink-0 items-center gap-1 rounded-md bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 hover:bg-blue-100"
          >
            <ExternalLinkIcon className="h-3 w-3 shrink-0" />
            Watch on YouTube
          </a>
        </div>

        <div
          role="tablist"
          aria-label="Lecture sections"
          className="mt-5 flex flex-wrap items-center gap-2"
        >
          {tabs.map((item) => {
            const Icon = item.icon
            const selected = tab === item.id
            return (
              <button
                key={item.id}
                type="button"
                role="tab"
                id={`${item.id}-tab`}
                aria-selected={selected}
                aria-controls={`${item.id}-panel`}
                onClick={() => setTab(item.id)}
                className={`flex cursor-pointer items-center gap-2.5 rounded-xl px-4 py-2.5 text-base font-medium ${
                  selected
                    ? "bg-blue-50 text-blue-700"
                    : "text-slate-600 hover:bg-slate-50"
                }`}
              >
                <Icon className="h-5 w-5 shrink-0" />
                {item.label}
              </button>
            )
          })}
        </div>
      </section>

      <section
        role="tabpanel"
        id={`${tab}-panel`}
        aria-labelledby={`${tab}-tab`}
        className="mt-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
      >
        {tab === "overview" && <Overview lecture={readyLecture} />}
        {tab === "notes" && <Notes />}
        {tab !== "overview" && tab !== "notes" && (
          <>
            <h2 className="text-sm font-semibold text-slate-900">
              {tabs.find((item) => item.id === tab)?.label}
            </h2>
            <p className="mt-2 text-sm text-slate-600">{sectionCopy[tab]}</p>
          </>
        )}
      </section>
    </AppShell>
  )
}

function Overview({ lecture }: { lecture: ReadyLecture }) {
  return (
    <>
      <h2 className="flex items-center gap-2 text-sm font-semibold text-slate-900">
        <NotesIcon />
        Quick summary
      </h2>
      <p className="mt-2 max-w-xl text-sm leading-6 text-slate-600">
        {lecture.summary}
      </p>
      <div className="my-5 border-t border-slate-200" />
      <h3 className="text-sm font-semibold text-slate-900">Key points</h3>
      <ul className="mt-3 space-y-3">
        {lecture.keyPoints.map((point) => (
          <li
            key={point}
            className="flex items-center gap-2 text-sm text-slate-700"
          >
            <FilledCheckIcon className="h-4 w-4 shrink-0 text-green-500" />
            {point}
          </li>
        ))}
      </ul>
    </>
  )
}

export default MyLecturesPage
