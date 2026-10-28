import { useEffect, useState } from "react"
import { CheckIcon, EyeIcon, RetryIcon, TrophyIcon } from "../components/icons"
import { sampleQuiz } from "../quiz"

type QuizProps = {
  onViewChange: (view: "questions" | "result") => void
}

function Quiz({ onViewChange }: QuizProps) {
  const [index, setIndex] = useState(0)
  const [selected, setSelected] = useState<number | null>(null)
  const [checked, setChecked] = useState(false)
  const [answers, setAnswers] = useState<(number | null)[]>(() =>
    sampleQuiz.map(() => null),
  )
  const [view, setView] = useState<"questions" | "result" | "review">(
    "questions",
  )

  useEffect(() => {
    onViewChange(view === "questions" ? "questions" : "result")
  }, [onViewChange, view])

  const question = sampleQuiz[index]
  const shownChoice = view === "review" ? answers[index] : selected
  const showingResult = view === "review" || checked
  const correct = shownChoice === question.answer
  const score = answers.filter(
    (choice, choiceIndex) => choice === sampleQuiz[choiceIndex].answer,
  ).length
  const missed = sampleQuiz.flatMap((item, itemIndex) =>
    answers[itemIndex] === item.answer
      ? []
      : [{ number: itemIndex + 1, prompt: item.prompt }],
  )

  function goTo(nextIndex: number) {
    setIndex(nextIndex)
    setSelected(null)
    setChecked(false)
  }

  function checkAnswer() {
    if (selected === null) return
    setAnswers((current) =>
      current.map((choice, choiceIndex) =>
        choiceIndex === index ? selected : choice,
      ),
    )
    setChecked(true)
  }

  function tryAgain() {
    setIndex(0)
    setSelected(null)
    setChecked(false)
    setAnswers(sampleQuiz.map(() => null))
    setView("questions")
  }

  if (view === "result") {
    return (
      <div className="px-4 py-8 text-center">
        <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-green-100 text-green-600">
          <TrophyIcon />
        </span>
        <h2 className="mt-4 text-2xl font-semibold text-slate-900">
          {score >= 7 ? "Great job!" : "Nice try"}
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          You scored{" "}
          <span className="text-xl font-semibold text-blue-600">
            {score} / {sampleQuiz.length}
          </span>
        </p>
        {missed.length > 0 ? (
          <div className="mx-auto mt-8 max-w-xl text-left">
            <p className="text-sm text-slate-500">Worth another look</p>
            <ul className="mt-3 space-y-2">
              {missed.map((item) => (
                <li
                  key={item.number}
                  className="flex items-center gap-3 rounded-lg border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700"
                >
                  <span aria-hidden="true">✕</span>Q{item.number}. {item.prompt}
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <p className="mt-8 text-sm text-slate-500">
            You got every question right.
          </p>
        )}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <button
            type="button"
            onClick={() => {
              setIndex(0)
              setView("review")
            }}
            className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-blue-600 bg-white px-4 py-2.5 text-sm font-medium text-blue-600 hover:bg-blue-50"
          >
            <EyeIcon className="h-4 w-4" />
            Review answers
          </button>
          <button
            type="button"
            onClick={tryAgain}
            className="inline-flex cursor-pointer items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700"
          >
            <RetryIcon className="h-4 w-4" />
            Try again
          </button>
        </div>
      </div>
    )
  }

  return (
    <div>
      <p className="inline-flex rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700">
        Question {index + 1} of {sampleQuiz.length}
      </p>
      <h2
        id="quiz-prompt"
        className="mt-4 text-base font-semibold text-slate-900"
      >
        {question.prompt}
      </h2>
      <fieldset aria-labelledby="quiz-prompt" className="mt-4 space-y-3">
        {question.choices.map((choice, choiceIndex) => {
          const isSelected = shownChoice === choiceIndex
          const isAnswer = choiceIndex === question.answer
          let rowClass = "border-slate-200 hover:bg-slate-50"
          if (showingResult && isAnswer) {
            rowClass = "border-green-500 bg-green-50"
          } else if (showingResult && isSelected) {
            rowClass = "border-red-400 bg-red-50"
          } else if (isSelected) {
            rowClass = "border-blue-500 bg-blue-50"
          }
          return (
            <label
              key={choice}
              className={`flex cursor-pointer items-center gap-3 rounded-lg border px-4 py-3 text-sm text-slate-800 ${rowClass}`}
            >
              <input
                type="radio"
                name={`quiz-question-${index}`}
                className="h-4 w-4 accent-blue-600"
                checked={isSelected}
                disabled={showingResult}
                onChange={() => setSelected(choiceIndex)}
              />
              {choice}
            </label>
          )
        })}
      </fieldset>
      {showingResult && view === "questions" && (
        <p
          className={`mt-4 text-sm ${correct ? "text-green-700" : "text-red-600"}`}
        >
          {correct ? "Correct" : "Not quite. The right answer is highlighted."}
        </p>
      )}
      <div className="mt-6 flex justify-end gap-2">
        {view === "review" ? (
          <>
            <button
              type="button"
              className="cursor-pointer rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
              disabled={index === 0}
              onClick={() => setIndex(index - 1)}
            >
              Previous
            </button>
            <button
              type="button"
              onClick={() => setView("result")}
              className="cursor-pointer rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Back to score
            </button>
            <button
              type="button"
              className="cursor-pointer rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-40"
              disabled={index === sampleQuiz.length - 1}
              onClick={() => setIndex(index + 1)}
            >
              Next
            </button>
          </>
        ) : checked && index < sampleQuiz.length - 1 ? (
          <button
            type="button"
            onClick={() => goTo(index + 1)}
            className="inline-flex cursor-pointer items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700"
          >
            Next question
          </button>
        ) : checked ? (
          <button
            type="button"
            onClick={() => setView("result")}
            className="inline-flex cursor-pointer items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700"
          >
            See results
          </button>
        ) : (
          <button
            type="button"
            disabled={selected === null}
            onClick={checkAnswer}
            className="inline-flex cursor-pointer items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <CheckIcon className="h-4 w-4" />
            Check answer
          </button>
        )}
      </div>
    </div>
  )
}

export default Quiz
