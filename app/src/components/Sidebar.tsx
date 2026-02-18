import { useThemeStore } from '../store/useThemeStore'

export default function Sidebar() {
  const { isDark, toggle } = useThemeStore()

  return (
    <aside className="fixed left-0 top-0 z-50 flex h-screen w-[103px] flex-col bg-sidebar">
      {/* Logo */}
      <div className="flex aspect-square w-full items-center justify-center rounded-br-[20px] bg-purple">
        <img src="/assets/logo.svg" alt="Invoice App" width={28} height={26} />
      </div>

      {/* Bottom controls */}
      <div className="mt-auto flex flex-col items-center gap-6 pb-8">
        <button
          onClick={toggle}
          aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
          className="cursor-pointer opacity-60 transition-opacity hover:opacity-100"
        >
          <img
            src={isDark ? '/assets/icon-sun.svg' : '/assets/icon-moon.svg'}
            alt=""
            width={20}
            height={20}
          />
        </button>

        <div className="h-px w-full bg-[#494E6E]" />

        <img
          src="/assets/image-avatar.jpg"
          alt="User avatar"
          width={32}
          height={32}
          className="rounded-full"
        />
      </div>
    </aside>
  )
}
