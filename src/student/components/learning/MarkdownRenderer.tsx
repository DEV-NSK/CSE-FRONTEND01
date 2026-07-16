import { cn } from '@/shared/lib/utils'

interface MarkdownRendererProps {
  content: string
  className?: string
}

/**
 * Simple markdown renderer.
 * For production replace with: react-markdown + remark-gfm + rehype-highlight + rehype-sanitize
 * Those packages are not in package.json yet — this provides a working fallback.
 */
export default function MarkdownRenderer({ content, className }: MarkdownRendererProps) {
  // Basic markdown to HTML conversion (handles most common patterns)
  const html = convertMarkdown(content)

  return (
    <div
      className={cn(
        'prose prose-sm dark:prose-invert max-w-none',
        // code blocks
        '[&_pre]:bg-muted [&_pre]:rounded-lg [&_pre]:p-4 [&_pre]:overflow-x-auto',
        '[&_code]:bg-muted [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded [&_code]:text-xs',
        '[&_pre_code]:bg-transparent [&_pre_code]:p-0',
        // blockquotes
        '[&_blockquote]:border-l-4 [&_blockquote]:border-primary/40 [&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:text-muted-foreground',
        // tables
        '[&_table]:w-full [&_table]:border-collapse',
        '[&_th]:border [&_th]:border-border [&_th]:bg-muted [&_th]:px-3 [&_th]:py-2 [&_th]:text-left [&_th]:text-sm [&_th]:font-semibold',
        '[&_td]:border [&_td]:border-border [&_td]:px-3 [&_td]:py-2 [&_td]:text-sm',
        // images
        '[&_img]:rounded-lg [&_img]:max-w-full [&_img]:h-auto',
        // links
        '[&_a]:text-primary [&_a]:underline-offset-4 hover:[&_a]:underline',
        className
      )}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  )
}

function convertMarkdown(md: string): string {
  let html = md
    // Escape HTML entities first
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')

  // Code blocks (``` ... ```)
  html = html.replace(/```(\w*)\n?([\s\S]*?)```/g, (_, lang, code) =>
    `<pre><code class="language-${lang}">${code.trim()}</code></pre>`
  )

  // Inline code
  html = html.replace(/`([^`]+)`/g, '<code>$1</code>')

  // Headings
  html = html.replace(/^#{6} (.+)$/gm, '<h6>$1</h6>')
  html = html.replace(/^#{5} (.+)$/gm, '<h5>$1</h5>')
  html = html.replace(/^#{4} (.+)$/gm, '<h4>$1</h4>')
  html = html.replace(/^### (.+)$/gm, '<h3>$1</h3>')
  html = html.replace(/^## (.+)$/gm, '<h2>$1</h2>')
  html = html.replace(/^# (.+)$/gm, '<h1>$1</h1>')

  // Bold + italic
  html = html.replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>')
  html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
  html = html.replace(/\*(.+?)\*/g, '<em>$1</em>')
  html = html.replace(/__(.+?)__/g, '<strong>$1</strong>')
  html = html.replace(/_(.+?)_/g, '<em>$1</em>')

  // Strikethrough
  html = html.replace(/~~(.+?)~~/g, '<del>$1</del>')

  // Blockquotes
  html = html.replace(/^> (.+)$/gm, '<blockquote>$1</blockquote>')

  // Unordered lists
  html = html.replace(/^\s*[-*+] (.+)$/gm, '<li>$1</li>')
  html = html.replace(/(<li>[\s\S]*?<\/li>)/g, (match) => {
    if (!match.startsWith('<ul>')) return `<ul>${match}</ul>`
    return match
  })

  // Ordered lists
  html = html.replace(/^\d+\. (.+)$/gm, '<li>$1</li>')

  // Images
  html = html.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" loading="lazy" />')

  // Links
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>')

  // Horizontal rule
  html = html.replace(/^---$/gm, '<hr />')

  // Paragraphs — wrap lines not already wrapped
  const lines = html.split('\n')
  const result: string[] = []
  let inBlock = false

  for (const line of lines) {
    const trimmed = line.trim()
    if (!trimmed) {
      inBlock = false
      result.push('')
      continue
    }
    const isBlock = /^<(h[1-6]|ul|ol|li|pre|blockquote|hr|img|table)/.test(trimmed)
    if (isBlock) {
      inBlock = false
      result.push(trimmed)
    } else if (!inBlock) {
      result.push(`<p>${trimmed}`)
      inBlock = true
    } else {
      result[result.length - 1] += ` ${trimmed}`
    }
  }

  html = result.join('\n')

  // Close unclosed paragraphs
  html = html.replace(/<p>([^<]*?)(\n|$)/g, '<p>$1</p>\n')

  return html
}
