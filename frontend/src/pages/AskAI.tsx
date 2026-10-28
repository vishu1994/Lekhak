import { useState, type FormEvent } from "react"
import { BotIcon, MessageIcon, PlayIcon, SendIcon } from "../components/icons"
import {
  openingReply,
  replyFor,
  suggestedQuestions,
  type LectureReply,
} from "../ask"

type AskAIProps = {
  watchUrl: string
}

function AskAI({ watchUrl }: AskAIProps) {
  const [messages, setMessages] = useState<LectureReply[]>([openingReply])
  const [draft, setDraft] = useState("")

  function ask(question: string) {
    const trimmed = question.trim()
    if (!trimmed) return
    setMessages((current) => [...current, replyFor(trimmed)])
    setDraft("")
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    ask(draft)
  }

  return (
    <div>
      <div className="min-h-80 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-wrap gap-2">
          {suggestedQuestions.map((question) => (
            <button
              key={question}
              type="button"
              onClick={() => ask(question)}
              className="cursor-pointer rounded-full bg-blue-50 px-3 py-1.5 text-sm font-medium text-blue-700 hover:bg-blue-100"
            >
              {question}
            </button>
          ))}
        </div>

        <div className="mt-6 space-y-4">
          {messages.map((message, index) => (
            <div key={`${message.question}-${index}`} className="space-y-3">
              <p className="ml-auto w-fit max-w-md rounded-lg bg-blue-600 px-4 py-2.5 text-sm text-white">
                {message.question}
              </p>
              <div className="flex items-start gap-3">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-50 text-blue-600">
                  <BotIcon className="h-4 w-4" />
                </span>
                <div className="max-w-xl rounded-xl bg-slate-100 px-4 py-3 text-sm leading-6 text-slate-700">
                  <p>{message.answer}</p>
                  <a
                    href={watchUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700 hover:bg-blue-100"
                  >
                    <PlayIcon className="h-3.5 w-3.5" />
                    Watch this part · {message.timestamp}
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <form onSubmit={submit} className="mt-4 flex items-center gap-3">
        <label className="relative min-w-0 flex-1">
          <span className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-slate-400">
            <MessageIcon />
          </span>
          <input
            aria-label="Ask a question about this lecture"
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            placeholder="Ask a question about this lecture..."
            className="h-10 w-full rounded-lg border border-slate-200 bg-white pr-3 pl-10 text-sm text-slate-800 outline-none placeholder:text-slate-400 focus:border-blue-500"
          />
        </label>
        <button
          type="submit"
          className="inline-flex h-10 cursor-pointer items-center gap-2 rounded-lg bg-blue-600 px-4 text-sm font-medium text-white hover:bg-blue-700"
        >
          <SendIcon className="h-4 w-4" />
          Send
        </button>
      </form>
    </div>
  )
}

export default AskAI
