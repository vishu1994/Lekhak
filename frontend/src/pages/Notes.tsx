import {
  useEffect,
  useRef,
  useState,
  type FormEvent,
  type ReactNode,
} from "react"
import { CopyIcon, DownloadIcon, PencilIcon } from "../components/icons"
import {
  downloadNotesDoc,
  downloadNotesPdf,
  NotesExportError,
  sampleNotesHtml,
} from "../notes"

const quietButtonClass =
  "inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-50"

function commandState(command: string) {
  try {
    return document.queryCommandState(command)
  } catch {
    return false
  }
}

function ToolButton({
  label,
  pressed = false,
  onClick,
  children,
}: {
  label: string
  pressed?: boolean
  onClick: () => void
  children: ReactNode
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      aria-pressed={pressed}
      onMouseDown={(event) => event.preventDefault()}
      onClick={onClick}
      className={`flex h-8 min-w-8 cursor-pointer items-center justify-center rounded px-1.5 text-sm hover:bg-white ${
        pressed ? "bg-white text-blue-700 shadow-sm" : "text-slate-700"
      } ${label === "Bold" ? "font-bold" : ""} ${label === "Italic" ? "italic" : ""} ${
        label === "Underline" ? "underline" : ""
      } ${label === "Strikethrough" ? "line-through" : ""}`}
    >
      {children}
    </button>
  )
}

function EditorIcon({ children }: { children: ReactNode }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width="16"
      height="16"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {children}
    </svg>
  )
}

function ToolbarDivider() {
  return <span className="mx-1 h-5 w-px bg-slate-300" aria-hidden="true" />
}

function Notes() {
  const editorRef = useRef<HTMLDivElement>(null)
  const [html, setHtml] = useState(sampleNotesHtml)
  const [editing, setEditing] = useState(false)
  const [downloadOpen, setDownloadOpen] = useState(false)
  const [message, setMessage] = useState("")
  const [linkOpen, setLinkOpen] = useState(false)
  const [linkUrl, setLinkUrl] = useState("https://")
  const [, setRevision] = useState(0)

  useEffect(() => {
    if (!editing) return
    const refresh = () => setRevision((current) => current + 1)
    document.addEventListener("selectionchange", refresh)
    return () => document.removeEventListener("selectionchange", refresh)
  }, [editing])

  function readHtml() {
    return editorRef.current?.innerHTML ?? html
  }

  function applyFormat(command: string, value?: string) {
    editorRef.current?.focus()
    document.execCommand(command, false, value)
    if (command === "hiliteColor") {
      document.execCommand("backColor", false, value)
    }
    setRevision((current) => current + 1)
  }

  function applyBlock(tag: string) {
    editorRef.current?.focus()
    if (!document.execCommand("formatBlock", false, tag)) {
      document.execCommand("formatBlock", false, `<${tag}>`)
    }
    setRevision((current) => current + 1)
  }

  function applyLink(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    editorRef.current?.focus()
    document.execCommand("createLink", false, linkUrl)
    setLinkOpen(false)
    setLinkUrl("https://")
  }

  async function copyToClipboard() {
    const notesHtml = readHtml()
    setHtml(notesHtml)
    const text = editorRef.current?.innerText ?? ""
    try {
      await navigator.clipboard.writeText(text)
      setMessage("")
    } catch {
      setMessage("These notes could not be copied.")
    }
  }

  function downloadDoc() {
    downloadNotesDoc(readHtml())
    setDownloadOpen(false)
    setMessage("")
  }

  function downloadPdf() {
    const element = editorRef.current
    if (!element) return
    setHtml(element.innerHTML)
    setDownloadOpen(false)
    try {
      downloadNotesPdf(element)
      setMessage("")
    } catch (error) {
      setMessage(
        error instanceof NotesExportError
          ? error.message
          : "These notes could not be downloaded.",
      )
    }
  }

  function redo() {
    setHtml(sampleNotesHtml)
    setEditing(false)
    setDownloadOpen(false)
    setMessage("")
  }

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-4">
        <h2 className="text-base font-semibold text-slate-900">Your notes</h2>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            aria-pressed={editing}
            onClick={() => {
              setHtml(readHtml())
              setEditing((current) => !current)
              setDownloadOpen(false)
            }}
            className={quietButtonClass}
          >
            <PencilIcon />
            Edit
          </button>
          <button
            type="button"
            onClick={copyToClipboard}
            className={quietButtonClass}
          >
            <CopyIcon />
            Copy
          </button>
          <div className="relative">
            <button
              type="button"
              aria-expanded={downloadOpen}
              aria-haspopup="menu"
              onClick={() => {
                setHtml(readHtml())
                setDownloadOpen((current) => !current)
              }}
              className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-blue-600 bg-white px-3 py-1.5 text-sm font-medium text-blue-600 hover:bg-blue-50"
            >
              <DownloadIcon />
              Download
            </button>
            {downloadOpen && (
              <div
                role="menu"
                aria-label="Download format"
                className="absolute right-0 z-10 mt-1 w-28 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-md"
              >
                <button
                  type="button"
                  role="menuitem"
                  onClick={downloadPdf}
                  className="block w-full cursor-pointer px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-50"
                >
                  PDF
                </button>
                <button
                  type="button"
                  role="menuitem"
                  onClick={downloadDoc}
                  className="block w-full cursor-pointer px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-50"
                >
                  Doc
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {message && <p className="mt-3 text-sm text-red-600">{message}</p>}

      <div
        className={
          editing
            ? "mt-4 overflow-hidden rounded-xl border border-slate-300 bg-white"
            : ""
        }
      >
        {editing && (
          <div
            role="toolbar"
            aria-label="Note formatting"
            className="flex flex-wrap items-center gap-1 border-b border-slate-200 bg-slate-50 px-2 py-2"
          >
            <ToolButton label="Undo" onClick={() => applyFormat("undo")}>
              <EditorIcon>
                <path d="M9 14 4 9l5-5" />
                <path d="M4 9h10.5a5.5 5.5 0 0 1 0 11H12" />
              </EditorIcon>
            </ToolButton>
            <ToolButton label="Redo" onClick={() => applyFormat("redo")}>
              <EditorIcon>
                <path d="m15 14 5-5-5-5" />
                <path d="M20 9H9.5a5.5 5.5 0 0 0 0 11H12" />
              </EditorIcon>
            </ToolButton>
            <ToolbarDivider />
            <select
              aria-label="Text style"
              className="h-8 cursor-pointer rounded border border-slate-300 bg-white px-2 text-sm text-slate-700"
              defaultValue="p"
              onChange={(event) => applyBlock(event.target.value)}
            >
              <option value="p">Paragraph</option>
              <option value="h1">Heading 1</option>
              <option value="h2">Heading 2</option>
              <option value="h3">Heading 3</option>
              <option value="blockquote">Quote</option>
            </select>
            <ToolbarDivider />
            <ToolButton
              label="Bold"
              pressed={commandState("bold")}
              onClick={() => applyFormat("bold")}
            >
              B
            </ToolButton>
            <ToolButton
              label="Italic"
              pressed={commandState("italic")}
              onClick={() => applyFormat("italic")}
            >
              I
            </ToolButton>
            <ToolButton
              label="Underline"
              pressed={commandState("underline")}
              onClick={() => applyFormat("underline")}
            >
              U
            </ToolButton>
            <ToolButton
              label="Strikethrough"
              pressed={commandState("strikeThrough")}
              onClick={() => applyFormat("strikeThrough")}
            >
              S
            </ToolButton>
            <ToolbarDivider />
            <label
              title="Text color"
              className="relative flex h-8 w-8 cursor-pointer items-center justify-center rounded text-sm font-semibold hover:bg-white"
            >
              A
              <span className="absolute bottom-1 h-0.5 w-3 bg-slate-900" />
              <input
                type="color"
                aria-label="Text color"
                defaultValue="#0f172a"
                onChange={(event) =>
                  applyFormat("foreColor", event.target.value)
                }
                className="absolute inset-0 cursor-pointer opacity-0"
              />
            </label>
            <ToolButton
              label="Highlight"
              onClick={() => applyFormat("hiliteColor", "#fde047")}
            >
              <span className="rounded bg-yellow-200 px-1 font-semibold">
                H
              </span>
            </ToolButton>
            <label
              title="Highlight color"
              className="relative flex h-8 w-6 cursor-pointer items-center justify-center"
            >
              <span className="h-4 w-4 rounded-sm border border-slate-300 bg-yellow-200" />
              <input
                type="color"
                aria-label="Highlight color"
                defaultValue="#fde047"
                onChange={(event) =>
                  applyFormat("hiliteColor", event.target.value)
                }
                className="absolute inset-0 cursor-pointer opacity-0"
              />
            </label>
            <ToolbarDivider />
            <ToolButton
              label="Align left"
              pressed={commandState("justifyLeft")}
              onClick={() => applyFormat("justifyLeft")}
            >
              <EditorIcon>
                <path d="M4 6h16M4 12h10M4 18h14" />
              </EditorIcon>
            </ToolButton>
            <ToolButton
              label="Align center"
              pressed={commandState("justifyCenter")}
              onClick={() => applyFormat("justifyCenter")}
            >
              <EditorIcon>
                <path d="M4 6h16M7 12h10M5 18h14" />
              </EditorIcon>
            </ToolButton>
            <ToolButton
              label="Align right"
              pressed={commandState("justifyRight")}
              onClick={() => applyFormat("justifyRight")}
            >
              <EditorIcon>
                <path d="M4 6h16M10 12h10M6 18h14" />
              </EditorIcon>
            </ToolButton>
            <ToolbarDivider />
            <ToolButton
              label="Bulleted list"
              pressed={commandState("insertUnorderedList")}
              onClick={() => applyFormat("insertUnorderedList")}
            >
              <EditorIcon>
                <path d="M9 6h11M9 12h11M9 18h11" />
                <circle
                  cx="4.5"
                  cy="6"
                  r="1"
                  fill="currentColor"
                  stroke="none"
                />
                <circle
                  cx="4.5"
                  cy="12"
                  r="1"
                  fill="currentColor"
                  stroke="none"
                />
                <circle
                  cx="4.5"
                  cy="18"
                  r="1"
                  fill="currentColor"
                  stroke="none"
                />
              </EditorIcon>
            </ToolButton>
            <ToolButton
              label="Numbered list"
              pressed={commandState("insertOrderedList")}
              onClick={() => applyFormat("insertOrderedList")}
            >
              <EditorIcon>
                <path d="M10 6h10M10 12h10M10 18h10" />
                <path d="M4 6h1.5M4 10h2M5 6v4M4 18h2l-2-2.5h2" />
              </EditorIcon>
            </ToolButton>
            <ToolButton label="Outdent" onClick={() => applyFormat("outdent")}>
              <EditorIcon>
                <path d="M3 6h18M11 12h10M11 18h10M3 15l4-3-4-3" />
              </EditorIcon>
            </ToolButton>
            <ToolButton label="Indent" onClick={() => applyFormat("indent")}>
              <EditorIcon>
                <path d="M3 6h18M11 12h10M11 18h10M7 9l-4 3 4 3" />
              </EditorIcon>
            </ToolButton>
            <ToolbarDivider />
            <ToolButton
              label="Link"
              onClick={() => setLinkOpen((current) => !current)}
            >
              <EditorIcon>
                <path d="M10 13a5 5 0 0 0 7.5.4l2.5-2.5a5 5 0 0 0-7-7L11.5 5.4" />
                <path d="M14 11a5 5 0 0 0-7.5-.4L4 13.1a5 5 0 0 0 7 7L12.5 18.6" />
              </EditorIcon>
            </ToolButton>
            <ToolButton
              label="Remove link"
              onClick={() => applyFormat("unlink")}
            >
              <EditorIcon>
                <path d="m18.8 12.3 1.2-1.2a5 5 0 0 0-7-7l-1.5 1.5" />
                <path d="m5.2 11.7-1.2 1.2a5 5 0 0 0 7 7l1.5-1.5" />
                <path d="m8 8 8 8" />
              </EditorIcon>
            </ToolButton>
            <ToolButton
              label="Clear formatting"
              onClick={() => applyFormat("removeFormat")}
            >
              <EditorIcon>
                <path d="M4 7V5h12v2" />
                <path d="M8 5v8" />
                <path d="m14 19 6-6" />
                <path d="m16 15 4 4" />
              </EditorIcon>
            </ToolButton>
            {linkOpen && (
              <form
                onSubmit={applyLink}
                className="flex basis-full items-center gap-1 pt-1"
              >
                <input
                  aria-label="Link address"
                  value={linkUrl}
                  onChange={(event) => setLinkUrl(event.target.value)}
                  className="h-8 w-40 rounded border border-slate-300 px-2 text-sm outline-none focus:border-blue-500"
                />
                <button
                  type="submit"
                  className="h-8 cursor-pointer rounded bg-blue-600 px-2 text-xs font-medium text-white"
                >
                  Add link
                </button>
              </form>
            )}
          </div>
        )}

        <div
          ref={editorRef}
          role={editing ? "textbox" : undefined}
          aria-label={editing ? "Lecture notes" : undefined}
          aria-multiline={editing ? true : undefined}
          contentEditable={editing}
          suppressContentEditableWarning
          dangerouslySetInnerHTML={{ __html: html }}
          className={`text-sm leading-7 text-slate-800 outline-none [&_a]:text-blue-600 [&_a]:underline [&_blockquote]:my-2 [&_blockquote]:border-l-4 [&_blockquote]:border-slate-300 [&_blockquote]:pl-3 [&_blockquote]:text-slate-600 [&_h1]:mb-2 [&_h1]:text-2xl [&_h1]:font-semibold [&_h2]:mb-2 [&_h2]:text-xl [&_h2]:font-semibold [&_h3]:mb-1 [&_h3]:text-lg [&_h3]:font-semibold [&_mark]:rounded [&_mark]:bg-yellow-200 [&_mark]:px-0.5 [&_ol]:mt-1 [&_ol]:list-decimal [&_ol]:space-y-1 [&_ol]:pl-8 [&_ul]:mt-1 [&_ul]:list-disc [&_ul]:space-y-1 [&_ul]:pl-8 ${
            editing ? "min-h-72 px-4 py-3" : "mt-5"
          }`}
        />
      </div>

      <p className="mt-8 text-sm text-blue-600">
        Not happy with them?{" "}
        <button
          type="button"
          onClick={redo}
          className="cursor-pointer font-medium text-blue-600 hover:underline"
        >
          Redo notes
        </button>
      </p>
    </>
  )
}

export default Notes
