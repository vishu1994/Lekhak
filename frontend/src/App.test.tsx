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
    expect(screen.getByRole("heading", { name: "Notes" })).toBeInTheDocument()

    await user.click(screen.getByRole("button", { name: "Home" }))
    expect(screen.getByRole("heading", { name: "2. Home" })).toBeInTheDocument()
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
