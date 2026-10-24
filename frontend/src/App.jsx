import { useState } from "react"
import LoginPage from "./pages/LoginPage"
import SignupPage from "./pages/SignupPage"

function App() {
  const [screen, setScreen] = useState("login")

  if (screen === "signup") {
    return <SignupPage onLogin={() => setScreen("login")} />
  }

  return <LoginPage onCreateAccount={() => setScreen("signup")} />
}

export default App
