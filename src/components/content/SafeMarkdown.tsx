import ReactMarkdown from 'react-markdown'

import { validateResourceUrl } from '@/lib/utils/validateResourceUrl'

export function SafeMarkdown({ children }: { children: string }) {
  return (
    <div className="space-y-3 break-words text-sm leading-6 [&_a]:font-medium [&_a]:text-foreground [&_a]:underline [&_a]:underline-offset-4 [&_code]:rounded [&_code]:bg-muted [&_code]:px-1 [&_ol]:list-decimal [&_ol]:pl-5 [&_p]:text-pretty [&_ul]:list-disc [&_ul]:pl-5">
      <ReactMarkdown
        components={{
          a: ({ href, children: linkChildren }) =>
            href && validateResourceUrl(href) ? (
              <a href={href} target="_blank" rel="noreferrer">
                {linkChildren}
              </a>
            ) : (
              <span>{linkChildren}</span>
            ),
          // Comments are public, user-authored Markdown. Do not let an author make
          // every reader's browser contact an arbitrary tracking host.
          img: ({ alt }) => (alt ? <span>{alt}</span> : null),
        }}
      >
        {children}
      </ReactMarkdown>
    </div>
  )
}
