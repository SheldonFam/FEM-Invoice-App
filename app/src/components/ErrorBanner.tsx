interface Props {
  message: string
}

export default function ErrorBanner({ message }: Props) {
  return (
    <p role="alert" className="rounded-sm bg-delete/10 px-4 py-3 text-sm font-bold text-delete">
      {message}
    </p>
  )
}
