export const demoBody = `# Code that feels at home

Code Block Studio makes code easier to read, format and reuse. Choose a language after the opening three backticks for accurate colours. Use **Copy** to copy just the code, **Wrap** to keep long lines in view, and **Format** to preview formatting for supported languages before applying it. Everything runs locally; code is never executed.

## Python · readable by default

\`\`\`python title="hello.py"
from pathlib import Path

def greet(name: str) -> str:
    """A small example with proper syntax colours."""
    return f"Hello, {name}!"

for name in ["Lee", "Joplin", "Code Block Studio"]:
    print(greet(name))
\`\`\`

## JavaScript · colours that explain the code

\`\`\`javascript title="example.js"
const languages = ["Python", "JavaScript", "SQL"];

async function loadExample(name) {
  const response = await fetch(\`https://example.com/api/\${name}\`);
  if (!response.ok) throw new Error("Could not load example");
  return response.json();
}

console.log(languages.join(" · "));
\`\`\`

## SQL · queries, clearly presented

\`\`\`sql title="recent-notes.sql"
SELECT title, updated_time
FROM notes
WHERE is_conflict = 0
ORDER BY updated_time DESC
LIMIT 10;
\`\`\`

## Shell · exact copying

\`\`\`bash
# Copy preserves indentation and quotes, without line numbers.
printf '%s\\n' "Hello from Code Block Studio"
\`\`\`

Short inline snippets like \`const answer = 42\` get the same code font.

### Make your own

In the Markdown editor, type three backticks followed by a language (for example, python), add your code on the next line, then close with three backticks. The styled card appears in the rendered note pane. An optional \`title="filename.py"\` adds a filename to its header.

Preferences are under **Tools → Options → Code Block Studio**. The note stays ordinary Markdown and works without this plugin. Copy, Wrap and Format work in both the Markdown preview and the Rich Text editor. Use the editor's normal Undo to restore applied formatting. The Markdown source editor continues to show the editable source.

---

Concept and design: **Leonard Powers**. Coding and implementation: **Ada (OpenAI Codex)**, under Leonard Powers' direction. This plugin uses no AI services at runtime.
`;
