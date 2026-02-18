export default function EmptyState() {
  return (
    <div className="flex flex-col items-center gap-10 pt-24 text-center">
      <img
        src="/assets/illustration-empty.svg"
        alt=""
        width={242}
        height={200}
      />
      <div className="flex flex-col gap-5">
        <h2 className="text-xl font-bold text-ink dark:text-white">
          There is nothing here
        </h2>
        <p className="max-w-[220px] text-sm leading-relaxed text-muted">
          Create an invoice by clicking the{' '}
          <strong className="text-ink dark:text-white">New Invoice</strong>{' '}
          button and get started
        </p>
      </div>
    </div>
  )
}
