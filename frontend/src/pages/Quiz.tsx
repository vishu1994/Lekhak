import { useState } from "react"
import { CheckIcon } from "../components/icons"
import { sampleQuiz } from "../quiz"

function Quiz() {
  const [index, setIndex] = useState(0)
  const [selected, setSelected] = useState<number | null>(null)
  const [checked, setChecked] = useState(false)
  const question = sampleQuiz[index]
  const correct = selected === question.answer

  function goTo(nextIndex: number) {
    setIndex(nextIndex)
    setSelected(null)
    setChecked(false)
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
          const isSelected = selected === choiceIndex
          const isAnswer = choiceIndex === question.answer
          let rowClass = "border-slate-200 hover:bg-slate-50"
          if (checked && isAnswer) {
            rowClass = "border-green-500 bg-green-50"
          } else if (checked && isSelected) {
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
                disabled={checked}
                onChange={() => setSelected(choiceIndex)}
              />
              {choice}
            </label>
          )
        })}
      </fieldset>
      {checked && (
        <p
          className={`mt-4 text-sm ${correct ? "text-green-700" : "text-red-600"}`}
        >
          {correct ? "Correct" : "Not quite. The right answer is highlighted."}
        </p>
      )}
      <div className="mt-6 flex justify-end">
        {checked && index < sampleQuiz.length - 1 ? (
          <button
            type="button"
            onClick={() => goTo(index + 1)}
            className="inline-flex cursor-pointer items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700"
          >
            Next question
          </button>
        ) : (
          <button
            type="button"
            disabled={selected === null || checked}
            onClick={() => setChecked(true)}
            className="inline-flex cursor-pointer items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <CheckIcon className="h-4 w-4" />
            {checked ? "Checked" : "Check answer"}
          </button>
        )}
      </div>
    </div>
  )
}

export default Quiz
