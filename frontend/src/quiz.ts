export type QuizQuestion = {
  prompt: string
  choices: string[]
  answer: number
}

export const sampleQuiz: QuizQuestion[] = [
  {
    prompt: "What is the correct way to create a functional component?",
    choices: [
      "class Component {}",
      "function Component() {}",
      "const Component = new React()",
      "render Component()",
    ],
    answer: 1,
  },
  {
    prompt: "Which hook remembers a value that can change?",
    choices: ["useEffect", "useState", "useId", "useContext"],
    answer: 1,
  },
  {
    prompt: "What does a parent pass into a child component?",
    choices: ["props", "the virtual DOM", "a stylesheet", "a route"],
    answer: 0,
  },
  {
    prompt: "When does useEffect run?",
    choices: [
      "Before the component exists",
      "After the component renders",
      "Only when the file is saved",
      "Instead of rendering",
    ],
    answer: 1,
  },
  {
    prompt: "What tells React which item in a list is which?",
    choices: ["a key", "a class name", "a comment", "a margin"],
    answer: 0,
  },
  {
    prompt: "What is JSX turned into?",
    choices: [
      "A CSS file",
      "A database row",
      "React elements",
      "A JSON request",
    ],
    answer: 2,
  },
  {
    prompt: "Where does a controlled input get its value?",
    choices: [
      "From component state",
      "From a random number",
      "From the page title",
      "From local storage only",
    ],
    answer: 0,
  },
  {
    prompt: "What happens when you call the setter from useState?",
    choices: [
      "The component renders again with the new value",
      "The file is deleted",
      "React skips the next ten renders",
      "The browser closes",
    ],
    answer: 0,
  },
  {
    prompt: "What is a custom hook?",
    choices: [
      "A CSS class",
      "A function whose name starts with use",
      "A class component",
      "An image file",
    ],
    answer: 1,
  },
  {
    prompt: "Which statement about props is right?",
    choices: [
      "A child should change the props it receives",
      "Props are read-only inputs from the parent",
      "Props replace every hook",
      "Props only work in class components",
    ],
    answer: 1,
  },
]
