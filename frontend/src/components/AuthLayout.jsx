import { GraduationCapIcon } from "./icons"

function AuthLayout({ stepTitle, stepSubtitle, children }) {
  return (
    <main className="min-h-svh bg-[#f3f5f9] px-8 py-7 text-slate-900">
      <header>
        <h1 className="text-xl font-semibold text-[#1e3a8a]">{stepTitle}</h1>
        <p className="mt-1 text-sm text-slate-500">{stepSubtitle}</p>
      </header>

      <section className="mx-auto mt-16 w-full max-w-[400px] rounded-2xl border border-slate-200 bg-white px-8 pt-8 pb-6 shadow-sm">
        {children}
      </section>
    </main>
  )
}

export function AuthCardHeader({ title, subtitle }) {
  return (
    <div className="mb-6 text-center">
      <div className="mb-3 flex justify-center text-blue-600">
        <GraduationCapIcon />
      </div>
      <h2 className="text-2xl font-bold tracking-tight text-slate-900">{title}</h2>
      <p className="mt-1 text-sm text-slate-500">{subtitle}</p>
    </div>
  )
}

export default AuthLayout
