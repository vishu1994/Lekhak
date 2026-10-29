import { useState } from "react"
import { SearchIcon } from "../components/icons"

const filters = ["All", "Ready", "Getting ready", "Couldn't process"] as const

type LectureFilter = (typeof filters)[number]

function LecturesPage() {
  const [query, setQuery] = useState("")
  const [filter, setFilter] = useState<LectureFilter>("All")

  return (
    <>
      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex flex-wrap items-center gap-3">
          <label className="relative w-full max-w-xs">
            <span className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-slate-400">
              <SearchIcon />
            </span>
            <input
              aria-label="Search your lectures"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search your lectures"
              className="h-10 w-full rounded-lg border border-slate-200 bg-white pr-3 pl-10 text-sm text-slate-800 outline-none placeholder:text-slate-400 focus:border-blue-500"
            />
          </label>
          <div
            className="flex flex-wrap gap-2"
            role="group"
            aria-label="Lecture status"
          >
            {filters.map((item) => {
              const selected = filter === item
              return (
                <button
                  key={item}
                  type="button"
                  aria-pressed={selected}
                  onClick={() => setFilter(item)}
                  className={`cursor-pointer rounded-full px-4 py-1.5 text-sm font-medium ${
                    selected
                      ? "bg-blue-600 text-white"
                      : "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  {item}
                </button>
              )
            })}
          </div>
        </div>
      </section>

      <section className="mt-4 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-slate-100 text-xs tracking-wide text-slate-400 uppercase">
            <tr>
              <th className="px-5 py-3 font-medium">Lecture</th>
              <th className="px-5 py-3 font-medium">Length</th>
              <th className="px-5 py-3 font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td colSpan={3} className="px-5 py-10 text-center text-slate-500">
                No lectures yet.
              </td>
            </tr>
          </tbody>
        </table>
      </section>
    </>
  )
}

export default LecturesPage
