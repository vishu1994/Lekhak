import { useState } from "react"
import AuthLayout, { AuthCardHeader } from "../components/AuthLayout"
import TextField from "../components/TextField"
import { LockIcon, MailIcon, UserIcon } from "../components/icons"

function SignupPage({ onLogin }) {
  const [fullName, setFullName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [acceptedTerms, setAcceptedTerms] = useState(false)

  function handleSubmit(event) {
    event.preventDefault()
  }

  return (
    <AuthLayout
      stepTitle="2. Sign Up"
      stepSubtitle="New users create an account in a few seconds"
    >
      <AuthCardHeader
        title="Create your account"
        subtitle="Start learning from any YouTube video"
      />

      <form onSubmit={handleSubmit} className="space-y-4">
        <TextField
          id="fullName"
          label="Full name"
          placeholder="Your name"
          autoComplete="name"
          value={fullName}
          onChange={(event) => setFullName(event.target.value)}
          icon={<UserIcon />}
        />
        <TextField
          id="signupEmail"
          label="Email address"
          type="email"
          placeholder="you@example.com"
          autoComplete="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          icon={<MailIcon />}
        />
        <div>
          <TextField
            id="signupPassword"
            label="Password"
            type="password"
            placeholder="••••••••"
            autoComplete="new-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            icon={<LockIcon />}
          />
          <p className="mt-1.5 text-xs text-slate-500">Use at least 8 characters</p>
        </div>

        <label className="flex items-start gap-2 text-sm text-slate-700">
          <input
            type="checkbox"
            checked={acceptedTerms}
            onChange={(event) => setAcceptedTerms(event.target.checked)}
            className="mt-0.5 h-4 w-4 rounded border-slate-300"
          />
          <span>
            I agree to the{" "}
            <button type="button" className="font-medium text-blue-600 hover:text-blue-700">
              Terms
            </button>{" "}
            and{" "}
            <button type="button" className="font-medium text-blue-600 hover:text-blue-700">
              Privacy Policy
            </button>
          </span>
        </label>

        <button
          type="submit"
          className="mt-1 w-full rounded-lg bg-blue-600 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
        >
          Create account
        </button>
      </form>

      <p className="mt-5 border-t border-slate-200 pt-4 text-center text-sm text-slate-500">
        Already have an account?{" "}
        <button
          type="button"
          onClick={onLogin}
          className="font-semibold text-blue-600 hover:text-blue-700"
        >
          Login
        </button>
      </p>
    </AuthLayout>
  )
}

export default SignupPage
