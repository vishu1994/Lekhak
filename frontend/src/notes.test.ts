import { describe, expect, it } from "vitest"
import {
  downloadNotesPdf,
  notesWordDocument,
  NotesExportError,
  sampleNotesHtml,
} from "./notes"

describe("notesWordDocument", () => {
  it("keeps bold text in a Word document", () => {
    const document = notesWordDocument("<p><strong>Hooks</strong></p>")

    expect(document).toContain("<strong>Hooks</strong>")
    expect(document).toContain("<!DOCTYPE html>")
  })
})

describe("downloadNotesPdf", () => {
  it("creates a PDF from the lecture notes", () => {
    const notes = document.createElement("div")
    notes.innerHTML = sampleNotesHtml

    expect(() => downloadNotesPdf(notes)).not.toThrow()
  })
})

describe("NotesExportError", () => {
  it("names a failed download", () => {
    const error = new NotesExportError()

    expect(error).toBeInstanceOf(Error)
    expect(error.name).toBe("NotesExportError")
    expect(error.message).toBe("These notes could not be downloaded.")
  })
})
