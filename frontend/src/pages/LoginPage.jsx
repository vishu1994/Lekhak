import { useState } from "react"
import TextField from "../components/TextField"
import { GraduationCapIcon, LockIcon, MailIcon } from "../components/icons"

function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [rememberMe, setRememberMe] = useState(false)

  function handleSubmit(event) {
    event.preventDefault()
  }

  return (
    <main className="min-h-svh bg-[#f3f5f9] px-8 py-7 text-slate-900">
      <header>
        <h1 className="text-xl font-semibold text-[#1e3a8a]">1. Login / Sign Up</h1>
        <p className="mt-1 text-sm text-slate-500">
          Welcome screen: sign in or create an account
        </p>
      </header>

      <section className="mx-auto mt-16 w-full max-w-[400px] rounded-2xl border border-slate-200 bg-white px-8 pt-8 pb-6 shadow-sm">
        <div className="mb-6 text-center">
          <div className="mb-3 flex justify-center text-blue-600">
            <GraduationCapIcon />
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">Welcome to Lekhak</h2>
          <p className="mt-1 text-sm text-slate-500">Sign in to continue</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <TextField
            id="email"
            label="Email address"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            icon={<MailIcon />}
          />
          <TextField
            id="password"
            label="Password"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            icon={<LockIcon />}
          />

          <label className="flex items-center gap-2 text-sm text-slate-700">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(event) => setRememberMe(event.target.checked)}
              className="h-4 w-4 rounded border-slate-300"
            />
            Remember me
          </label>

          <button
            type="submit"
            className="mt-1 w-full rounded-lg bg-blue-600 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
          >
            Login
          </button>
        </form>

        <div className="mt-6 flex items-center justify-between text-sm font-medium">
          <button type="button" className="text-blue-600 hover:text-blue-700">
            Forgot password?
          </button>
          <button type="button" className="text-blue-600 hover:text-blue-700">
            Create account
          </button>
        </div>
      </section>
    </main>
  )
}

export default LoginPage
