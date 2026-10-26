import { useState } from "react"
import AuthLayout, { AuthCardHeader } from "../components/AuthLayout"
import TextField from "../components/TextField"
import { LockIcon, MailIcon } from "../components/icons"

function LoginPage({ onCreateAccount, onEnter }) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [rememberMe, setRememberMe] = useState(false)

  function handleSubmit(event) {
    event.preventDefault()
    onEnter()
  }

  return (
    <AuthLayout
      stepTitle="1. Login / Sign Up"
      stepSubtitle="Welcome screen: sign in or create an account"
    >
      <AuthCardHeader title="Welcome to Lekhak" subtitle="Sign in to continue" />

      <form onSubmit={handleSubmit} className="space-y-4">
        <TextField
          id="email"
          label="Email address"
          type="email"
          placeholder="you@example.com"
          autoComplete="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          icon={<MailIcon />}
        />
        <TextField
          id="password"
          label="Password"
          type="password"
          placeholder="••••••••"
          autoComplete="current-password"
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
            className="mt-1 w-full cursor-pointer rounded-lg bg-blue-600 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
        >
          Login
        </button>
      </form>

      <div className="mt-6 flex items-center justify-between text-sm font-medium">
        <button type="button" className="cursor-pointer text-blue-600 hover:text-blue-700">
          Forgot password?
        </button>
        <button
          type="button"
          onClick={onCreateAccount}
          className="cursor-pointer text-blue-600 hover:text-blue-700"
        >
          Create account
        </button>
      </div>
    </AuthLayout>
  )
}

export default LoginPage
