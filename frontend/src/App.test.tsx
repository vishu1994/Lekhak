import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { afterEach, describe, expect, it, vi } from "vitest"
import App from "./App"

const videoUrl = "https://youtu.be/gsI5Pw2Y63U"

function previewResponse() {
  return {
    ok: true,
    json: async () => ({
      title: "Async tasks",
      author_name: "Zubair Khan",
      thumbnail_url: "https://i.ytimg.com/vi/gsI5Pw2Y63U/hqdefault.jpg",
    }),
  }
}

afterEach(() => {
  vi.unstubAllGlobals()
})

describe("lecture flow", () => {
  it("opens home from login and ignores a link that is not YouTube", async () => {
    const user = userEvent.setup()
    render(<App />)

    await user.click(screen.getByRole("button", { name: "Login" }))
    expect(screen.getByRole("heading", { name: "2. Home" })).toBeInTheDocument()

    await user.type(
      screen.getByLabelText("YouTube link"),
      "https://example.com/lesson",
    )
    expect(
      screen.queryByText("Is this the right video?"),
    ).not.toBeInTheDocument()
  })

  it("shows a loading state, then the preview and waiting screen", async () => {
    let resolveFetch: (
      value: ReturnType<typeof previewResponse>,
    ) => void = () => {}
    vi.stubGlobal(
      "fetch",
      vi.fn().mockImplementation(
        () =>
          new Promise((resolve) => {
            resolveFetch = resolve
          }),
      ),
    )
    const user = userEvent.setup()
    render(<App />)

    await user.click(screen.getByRole("button", { name: "Login" }))
    await user.type(screen.getByLabelText("YouTube link"), videoUrl)

    expect(
      await screen.findByText("Loading video details…"),
    ).toBeInTheDocument()
    await waitFor(() => expect(fetch).toHaveBeenCalled())
    resolveFetch(previewResponse())
    expect(
      await screen.findByRole("heading", { name: "Async tasks" }),
    ).toBeInTheDocument()
    expect(screen.getByText("Zubair Khan")).toBeInTheDocument()

    await user.click(screen.getByRole("button", { name: "Add lecture" }))
    expect(
      screen.getByRole("heading", { name: "Getting your lecture ready" }),
    ).toBeInTheDocument()

    await user.click(screen.getByRole("button", { name: "Go to My Lectures" }))
    expect(
      screen.getByRole("heading", { name: "5. Your Lecture is Ready" }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole("heading", { name: "React Complete Course" }),
    ).toBeInTheDocument()
    expect(screen.getByText("Ready")).toBeInTheDocument()
    expect(
      screen.getByText("What React is and why people use it"),
    ).toBeInTheDocument()
    expect(
      screen.getByRole("link", { name: /watch on youtube/i }),
    ).toHaveAttribute("target", "_blank")

    await user.click(screen.getByRole("tab", { name: "Notes" }))
    expect(screen.queryByText("Quick summary")).not.toBeInTheDocument()
    expect(
      screen.getByRole("heading", { name: "6. Notes" }),
    ).toBeInTheDocument()
    expect(screen.getByText("1. Introduction to React")).toBeInTheDocument()
    expect(screen.getByText("useEffect")).toBeInTheDocument()

    await user.click(screen.getByRole("button", { name: "Home" }))
    expect(screen.getByRole("heading", { name: "2. Home" })).toBeInTheDocument()
  })

  it("edits lecture notes and restores them", async () => {
    const user = userEvent.setup()
    render(<App />)

    await user.click(screen.getByRole("button", { name: "Login" }))
    await user.click(screen.getByRole("button", { name: "My Lectures" }))
    await user.click(screen.getByRole("tab", { name: "Notes" }))
    await user.click(screen.getByRole("button", { name: "Edit" }))
    expect(
      screen.getByRole("toolbar", { name: "Note formatting" }),
    ).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "Bold" })).toBeInTheDocument()
    expect(
      screen.getByRole("button", { name: "Highlight" }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole("textbox", { name: "Lecture notes" }),
    ).toBeInTheDocument()

    await user.click(screen.getByRole("button", { name: "Download" }))
    expect(screen.getByRole("menuitem", { name: "PDF" })).toBeInTheDocument()
    expect(screen.getByRole("menuitem", { name: "Doc" })).toBeInTheDocument()

    await user.click(screen.getByRole("button", { name: "Redo notes" }))
    expect(screen.getByText("1. Introduction to React")).toBeInTheDocument()
    expect(
      screen.queryByRole("toolbar", { name: "Note formatting" }),
    ).not.toBeInTheDocument()
  })

  it("reveals a flashcard answer and moves through the deck", async () => {
    const user = userEvent.setup()
    render(<App />)

    await user.click(screen.getByRole("button", { name: "Login" }))
    await user.click(screen.getByRole("button", { name: "My Lectures" }))
    await user.click(screen.getByRole("tab", { name: "Flashcards" }))

    expect(
      screen.getByRole("heading", { name: "7. Flashcards" }),
    ).toBeInTheDocument()
    expect(screen.getByText("Card 1 of 15")).toBeInTheDocument()
    expect(
      screen.getByText("What is the purpose of useState in React?"),
    ).toBeInTheDocument()
    expect(
      screen.queryByText(/useState lets a component remember a value/),
    ).not.toBeInTheDocument()

    await user.click(screen.getByRole("button", { name: "Show answer" }))
    expect(
      screen.getByText(
        "useState lets a component remember a value and update the screen when that value changes.",
      ),
    ).toBeInTheDocument()

    await user.click(screen.getByRole("button", { name: "Next" }))
    expect(screen.getByText("Card 2 of 15")).toBeInTheDocument()
    expect(screen.getByText("What is a component?")).toBeInTheDocument()
    expect(
      screen.queryByText(/useState lets a component remember a value/),
    ).not.toBeInTheDocument()

    await user.click(screen.getByText("What is a component?"))
    expect(
      screen.getByText(
        "A component is a reusable piece of the interface, usually a function that returns elements.",
      ),
    ).toBeInTheDocument()

    await user.click(screen.getByRole("button", { name: "Previous" }))
    expect(screen.getByText("Card 1 of 15")).toBeInTheDocument()
    expect(
      screen.getByText("What is the purpose of useState in React?"),
    ).toBeInTheDocument()
  })

  it("checks a quiz answer and moves to the next question", async () => {
    const user = userEvent.setup()
    render(<App />)

    await user.click(screen.getByRole("button", { name: "Login" }))
    await user.click(screen.getByRole("button", { name: "My Lectures" }))
    await user.click(screen.getByRole("tab", { name: "Quiz" }))

    expect(screen.getByRole("heading", { name: "Quiz" })).toBeInTheDocument()
    expect(
      screen.queryByRole("heading", { name: "8. Quiz" }),
    ).not.toBeInTheDocument()
    expect(screen.getByText("Question 1 of 10")).toBeInTheDocument()
    expect(
      screen.getByRole("heading", {
        name: "What is the correct way to create a functional component?",
      }),
    ).toBeInTheDocument()

    await user.click(screen.getByLabelText("function Component() {}"))
    await user.click(screen.getByRole("button", { name: "Check answer" }))
    expect(screen.getByText("Correct")).toBeInTheDocument()

    await user.click(screen.getByRole("button", { name: "Next question" }))
    expect(screen.getByText("Question 2 of 10")).toBeInTheDocument()
    expect(
      screen.getByText("Which hook remembers a value that can change?"),
    ).toBeInTheDocument()
  })

  it("opens the ready lecture from the My Lectures sidebar", async () => {
    const user = userEvent.setup()
    render(<App />)

    await user.click(screen.getByRole("button", { name: "Login" }))
    await user.click(screen.getByRole("button", { name: "My Lectures" }))

    expect(
      screen.getByRole("heading", { name: "5. Your Lecture is Ready" }),
    ).toBeInTheDocument()
    expect(screen.getByText("Using state and hooks")).toBeInTheDocument()
  })

  it("shows the preview error when YouTube cannot be reached", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new TypeError("offline")))
    const user = userEvent.setup()
    render(<App />)

    await user.click(screen.getByRole("button", { name: "Login" }))
    await user.type(screen.getByLabelText("YouTube link"), videoUrl)

    expect(
      await screen.findByText("This YouTube link could not be loaded."),
    ).toBeInTheDocument()
    await waitFor(() => {
      expect(
        screen.queryByText("Loading video details…"),
      ).not.toBeInTheDocument()
    })
  })
})
