import AppShell, { PageHeading } from "../components/AppShell"
import { HourglassIcon } from "../components/icons"

type LectureReadyPageProps = {
  onHome: () => void
  onMyLectures: () => void
}

function LectureReadyPage({ onHome, onMyLectures }: LectureReadyPageProps) {
  return (
    <AppShell activeItem="home" onHome={onHome}>
      <PageHeading
        title="Getting Your Lecture Ready"
        subtitle="Simple waiting screen; the user can leave and come back"
      />

      <section className="mx-auto mt-16 w-full max-w-xl rounded-2xl border border-slate-200 bg-white px-8 py-12 text-center shadow-sm">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-blue-100 text-blue-600">
          <HourglassIcon />
        </div>
        <h2 className="mt-5 text-2xl font-semibold text-slate-900">
          Getting your lecture ready
        </h2>
        <p className="mt-2 text-sm text-slate-500">
          This takes a few minutes. We'll let you know when it's done.
        </p>
        <button
          type="button"
          onClick={onMyLectures}
          className="mt-8 cursor-pointer rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
        >
          Go to My Lectures
        </button>
      </section>
    </AppShell>
  )
}

export default LectureReadyPage
