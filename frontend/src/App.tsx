import { useState } from "react"

type Screen = "login" | "signup" | "home" | "add-lecture" | "lecture-ready"
import AddLecturePage from "./pages/AddLecturePage"
import HomePage from "./pages/HomePage"
import LectureReadyPage from "./pages/LectureReadyPage"
import LoginPage from "./pages/LoginPage"
import SignupPage from "./pages/SignupPage"

function App() {
  const [screen, setScreen] = useState<Screen>("login")
  const [lectureUrl, setLectureUrl] = useState("")

  function openHome() {
    setScreen("home")
  }

  function openAddLecture(url: string) {
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
    return (
      <AddLecturePage
        initialUrl={lectureUrl}
        onHome={openHome}
        onLectureAdded={() => setScreen("lecture-ready")}
      />
    )
  }

  if (screen === "lecture-ready") {
    return <LectureReadyPage onHome={openHome} onMyLectures={openHome} />
  }

  return (
    <LoginPage onCreateAccount={() => setScreen("signup")} onEnter={openHome} />
  )
}

export default App
