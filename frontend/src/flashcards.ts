export type Flashcard = {
  question: string
  answer: string
}

export const sampleFlashcards: Flashcard[] = [
  {
    question: "What is the purpose of useState in React?",
    answer:
      "useState lets a component remember a value and update the screen when that value changes.",
  },
  {
    question: "What is a component?",
    answer:
      "A component is a reusable piece of the interface, usually a function that returns elements.",
  },
  {
    question: "What are props?",
    answer:
      "Props are inputs a parent passes to a child. The child can read them, but does not change them.",
  },
  {
    question: "What is state?",
    answer:
      "State is data a component owns and can change, such as a counter or a typed answer.",
  },
  {
    question: "When does useEffect run?",
    answer:
      "useEffect runs after the component renders. It is for work that reaches outside the component, such as loading data.",
  },
  {
    question: "What is JSX?",
    answer:
      "JSX is a syntax for writing interface elements inside JavaScript. It becomes React elements.",
  },
  {
    question: "What is the virtual DOM?",
    answer:
      "The virtual DOM is React's in-memory description of the interface. React updates only the parts that changed.",
  },
  {
    question: "What does a key do in a list?",
    answer:
      "A key tells React which item is which, so the right row updates when the list changes.",
  },
  {
    question: "What is a controlled input?",
    answer:
      "A controlled input takes its value from state and writes every change back to that state.",
  },
  {
    question: "What is conditional rendering?",
    answer:
      "Conditional rendering shows different elements based on a value, such as a question or its answer.",
  },
  {
    question: "What is lifting state up?",
    answer:
      "Lifting state up stores shared data in the closest parent so more than one child can use it.",
  },
  {
    question: "What is a custom hook?",
    answer:
      "A custom hook is a function whose name starts with use. It shares stateful logic between components.",
  },
  {
    question: "What is React.memo used for?",
    answer:
      "React.memo skips rendering a component again when its props have not changed.",
  },
  {
    question: "What is the difference between props and state?",
    answer:
      "Props come from a parent and stay read-only. State belongs to the component and can change.",
  },
  {
    question: "What happens when you call the setter from useState?",
    answer:
      "React stores the new value and renders the component again so the screen shows that value.",
  },
]
