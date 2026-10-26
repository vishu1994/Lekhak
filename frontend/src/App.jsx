import { useState } from "react"
import AddLecturePage from "./pages/AddLecturePage"
import HomePage from "./pages/HomePage"
import LoginPage from "./pages/LoginPage"
import SignupPage from "./pages/SignupPage"

function App() {
  const [screen, setScreen] = useState("login")
  const [lectureUrl, setLectureUrl] = useState("")

  function openHome() {
    setScreen("home")
  }

  function openAddLecture(url) {
    setLectureUrl(url)
    setScreen("add-lecture")
  }

  if (screen === "signup") {
    return <SignupPage onLogin={() => setScreen("login")} onEnter={openHome} />
  }

  if (screen === "home") {
    return <HomePage onStartLearning={openAddLecture} />
  }

  if (screen === "add-lecture") {
    return <AddLecturePage initialUrl={lectureUrl} onHome={openHome} />
  }

  return <LoginPage onCreateAccount={() => setScreen("signup")} onEnter={openHome} />
}

export default App
