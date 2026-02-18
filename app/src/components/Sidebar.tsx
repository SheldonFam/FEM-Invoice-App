import { useThemeStore } from '../store/useThemeStore'

export default function Sidebar() {
  const { isDark, toggle } = useThemeStore()

  return (
    <aside className="fixed left-0 top-0 z-50 flex bg-sidebar
      h-[72px] w-full flex-row
      md:h-screen md:w-[103px] md:flex-col">

      {/* Logo */}
      <div className="flex items-center justify-center rounded-br-[20px] bg-purple
        h-full w-[72px]
        md:h-auto md:w-full md:aspect-square">
        <img src="/assets/logo.svg" alt="Invoice App" width={28} height={26} />
      </div>

      {/* Controls */}
      <div className="flex items-center
        ml-auto flex-row gap-6 px-6
        md:ml-0 md:mt-auto md:flex-col md:gap-6 md:px-0 md:pb-8">

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

        {/* Divider: vertical on mobile, horizontal on desktop */}
        <div className="bg-[#494E6E] h-10 w-px md:h-px md:w-full" />

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
