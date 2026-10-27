import { useState } from "react"
import { EyeIcon } from "../components/icons"
import { sampleFlashcards } from "../flashcards"

const pagerClass =
  "inline-flex cursor-pointer items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"

function Flashcards() {
  const [index, setIndex] = useState(0)
  const [showingAnswer, setShowingAnswer] = useState(false)
  const card = sampleFlashcards[index]

  function goTo(nextIndex: number) {
    setIndex(nextIndex)
    setShowingAnswer(false)
  }

  function flip() {
    setShowingAnswer((current) => !current)
  }

  return (
    <div>
      <p className="text-center text-sm text-slate-500">
        Card {index + 1} of {sampleFlashcards.length}
      </p>

      <div
        className="mx-auto mt-4 flex min-h-72 max-w-3xl cursor-pointer flex-col items-center justify-center rounded-2xl border border-slate-200 bg-white px-8 py-10 text-center shadow-sm"
        onClick={flip}
      >
        <p className="text-xs font-medium tracking-[0.2em] text-slate-400">
          {showingAnswer ? "ANSWER" : "QUESTION"}
        </p>
        <p
          className={`mt-6 max-w-2xl leading-snug text-slate-900 ${
            showingAnswer ? "text-lg font-normal" : "text-2xl font-semibold"
          }`}
        >
          {showingAnswer ? card.answer : card.question}
        </p>
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation()
            flip()
          }}
          className="mt-10 inline-flex cursor-pointer items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-700"
        >
          <EyeIcon className="h-4 w-4" />
          {showingAnswer ? "Hide answer" : "Show answer"}
        </button>
      </div>

      <div className="mx-auto mt-6 flex max-w-3xl items-center justify-between gap-3">
        <button
          type="button"
          className={pagerClass}
          disabled={index === 0}
          onClick={() => goTo(index - 1)}
        >
          <span aria-hidden="true">←</span>
          Previous
        </button>
        <p className="text-sm text-slate-500">Tap the card to flip</p>
        <button
          type="button"
          className={pagerClass}
          disabled={index === sampleFlashcards.length - 1}
          onClick={() => goTo(index + 1)}
        >
          Next
          <span aria-hidden="true">→</span>
        </button>
      </div>
    </div>
  )
}

export default Flashcards
