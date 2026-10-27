import { jsPDF } from "jspdf"

export const sampleNotesHtml = [
  "<p><strong>1. Introduction to React</strong></p>",
  "<ul><li>What React is and when to use it</li></ul>",
  "<p><strong>2. Components</strong></p>",
  "<ul><li>Functional components</li><li>Props and state</li></ul>",
  "<p><strong>3. Hooks</strong></p>",
  "<ul><li>useState</li><li>useEffect</li></ul>",
].join("")

export class NotesExportError extends Error {
  constructor(message = "These notes could not be downloaded.") {
    super(message)
    this.name = "NotesExportError"
  }
}

/**
 * Wraps lecture notes HTML in a document Microsoft Word can open.
 */
export function notesWordDocument(html: string): string {
  return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
  body { font-family: Calibri, sans-serif; color: #0f172a; }
  p { margin: 0 0 8px; }
  ul, ol { margin: 0 0 12px 1.2em; }
  mark { background: #fde047; }
</style>
</head>
<body>${html}</body>
</html>`
}

export function saveFile(contents: Blob, filename: string) {
  const url = URL.createObjectURL(contents)
  const link = document.createElement("a")
  link.href = url
  link.download = filename
  link.click()
  URL.revokeObjectURL(url)
}

export function downloadNotesDoc(html: string) {
  const file = new Blob([notesWordDocument(html)], {
    type: "application/msword",
  })
  saveFile(file, "react-complete-course-notes.doc")
}

type TextRun = {
  text: string
  bold: boolean
  italic: boolean
  underline: boolean
  strike: boolean
  highlight: boolean
}

type NoteBlock = {
  bullet: boolean
  runs: TextRun[]
}

const plainRun: TextRun = {
  text: "",
  bold: false,
  italic: false,
  underline: false,
  strike: false,
  highlight: false,
}

function highlighted(element: HTMLElement) {
  const background = element.style.backgroundColor
  return (
    element.tagName === "MARK" ||
    (background !== "" && background !== "transparent")
  )
}

function textRuns(node: Node, style: TextRun): TextRun[] {
  if (node.nodeType === Node.TEXT_NODE) {
    const text = node.textContent ?? ""
    return text ? [{ ...style, text }] : []
  }
  if (!(node instanceof HTMLElement)) return []

  const next = { ...style }
  const tag = node.tagName
  if (
    tag === "STRONG" ||
    tag === "B" ||
    tag === "H1" ||
    tag === "H2" ||
    tag === "H3"
  ) {
    next.bold = true
  }
  if (tag === "EM" || tag === "I") next.italic = true
  if (tag === "U") next.underline = true
  if (tag === "S" || tag === "STRIKE" || tag === "DEL") next.strike = true
  if (highlighted(node)) next.highlight = true

  return [...node.childNodes].flatMap((child) => textRuns(child, next))
}

function noteBlocks(element: HTMLElement): NoteBlock[] {
  const blocks: NoteBlock[] = []

  function visit(node: HTMLElement, bullet: boolean) {
    const tag = node.tagName
    if (tag === "UL" || tag === "OL") {
      ;[...node.children].forEach((child) => {
        if (child instanceof HTMLElement) visit(child, true)
      })
      return
    }

    const nested = [...node.children].some(
      (child) =>
        child instanceof HTMLElement &&
        ["P", "UL", "OL", "DIV"].includes(child.tagName),
    )
    if (nested) {
      ;[...node.children].forEach((child) => {
        if (child instanceof HTMLElement) visit(child, bullet)
      })
      return
    }

    const runs = textRuns(node, plainRun)
    if (runs.length > 0) blocks.push({ bullet, runs })
  }

  ;[...element.children].forEach((child) => {
    if (child instanceof HTMLElement) visit(child, false)
  })
  return blocks
}

function fontStyle(run: TextRun) {
  if (run.bold && run.italic) return "bolditalic"
  if (run.bold) return "bold"
  if (run.italic) return "italic"
  return "normal"
}

/**
 * Renders the visible notes into a PDF file and starts the download.
 */
export function downloadNotesPdf(element: HTMLElement) {
  try {
    const pdf = new jsPDF({ unit: "pt", format: "a4" })
    const margin = 48
    const pageHeight = pdf.internal.pageSize.getHeight()
    let y = margin

    pdf.setFontSize(12)
    pdf.setTextColor(15, 23, 42)

    for (const block of noteBlocks(element)) {
      if (y > pageHeight - margin) {
        pdf.addPage()
        y = margin
      }

      let x = margin
      if (block.bullet) {
        pdf.setFont("helvetica", "normal")
        pdf.text("•", margin, y)
        x += 16
      }

      for (const run of block.runs) {
        pdf.setFont("helvetica", fontStyle(run))
        const width = pdf.getTextWidth(run.text)
        if (run.highlight) {
          pdf.setFillColor(253, 224, 71)
          pdf.rect(x, y - 11, width, 15, "F")
          pdf.setTextColor(15, 23, 42)
        }
        pdf.text(run.text, x, y)
        if (run.underline) pdf.line(x, y + 2, x + width, y + 2)
        if (run.strike) pdf.line(x, y - 3, x + width, y - 3)
        x += width
      }

      y += block.bullet ? 18 : 22
    }

    pdf.save("react-complete-course-notes.pdf")
  } catch {
    throw new NotesExportError()
  }
}
