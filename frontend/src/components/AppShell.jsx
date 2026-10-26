import { GraduationCapIcon, HomeIcon, LecturesIcon, SettingsIcon } from "./icons"

const navItemClass =
  "flex w-full cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium"

function AppShell({ activeItem, onHome, children }) {
  return (
    <div className="flex min-h-svh bg-[#f3f5f9] text-slate-900">
      <aside className="flex w-56 shrink-0 flex-col bg-[#1b2d4a] px-4 py-5 text-white">
        <div className="mb-8 flex items-center gap-2 px-2">
          <GraduationCapIcon className="h-5 w-5" />
          <span className="text-sm font-semibold tracking-wide">LEKHAK</span>
        </div>

        <nav className="space-y-1">
          <button
            type="button"
            onClick={onHome}
            className={`${navItemClass} ${
              activeItem === "home" ? "bg-blue-600 text-white" : "text-slate-300 hover:bg-white/10"
            }`}
          >
            <HomeIcon />
            Home
          </button>
          <button type="button" className={`${navItemClass} text-slate-300 hover:bg-white/10`}>
            <LecturesIcon />
            My Lectures
          </button>
        </nav>

        <button
          type="button"
          className={`${navItemClass} mt-auto border-t border-white/10 pt-4 text-slate-300 hover:bg-white/10`}
        >
          <SettingsIcon />
          Settings
        </button>
      </aside>

      <main className="min-w-0 flex-1 px-8 py-7">{children}</main>
    </div>
  )
}

export function PageHeading({ title, subtitle }) {
  return (
    <header className="mb-6">
      <h1 className="text-2xl font-semibold text-[#1e3a8a]">{title}</h1>
      <p className="mt-1 text-sm text-slate-500">{subtitle}</p>
    </header>
  )
}

export default AppShell
