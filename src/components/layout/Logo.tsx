import type { ComponentProps } from 'react'

export function Logo(props: ComponentProps<'svg'>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="m8 6-5 6 5 6" />
      <path d="m16 6 5 6-5 6" />
      <path d="m9 12 2 2 4-5" />
    </svg>
  )
}
