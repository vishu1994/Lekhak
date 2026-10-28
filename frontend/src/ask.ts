export type LectureReply = {
  question: string
  answer: string
  timestamp: string
}

export const suggestedQuestions = [
  "Summarise this lecture",
  "Explain the key idea",
  "Give me an example",
]

const replies: LectureReply[] = [
  {
    question: "Explain the difference between props and state.",
    answer:
      "Props are values a component receives from outside. State is data the component manages itself and can change over time.",
    timestamp: "01:35",
  },
  {
    question: "Summarise this lecture",
    answer:
      "This lecture introduces React, then components and props, and finishes with state and hooks.",
    timestamp: "00:40",
  },
  {
    question: "Explain the key idea",
    answer:
      "The key idea is that the screen is built from components. Each component renders from its props and state.",
    timestamp: "03:10",
  },
  {
    question: "Give me an example",
    answer:
      "A counter component receives a start value as a prop and keeps the current count in state with useState.",
    timestamp: "05:20",
  },
]

export const openingReply = replies[0]

export function replyFor(question: string): LectureReply {
  const trimmed = question.trim()
  const match = replies.find(
    (reply) => reply.question.toLowerCase() === trimmed.toLowerCase(),
  )
  if (match) return match
  return {
    question: trimmed,
    answer:
      "This lecture covers that idea in the sections on components, props, and hooks.",
    timestamp: "02:10",
  }
}
