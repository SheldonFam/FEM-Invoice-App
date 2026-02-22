import { useEffect, useId, useRef, useState } from "react";

export interface MenuItem {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  loadingLabel?: string;
}

interface ActionMenuProps {
  items: MenuItem[];
}

export default function ActionMenu({ items }: ActionMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const id = useId();
  const menuId = `${id}-menu`;

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsOpen(false);
      }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [isOpen]);

  // Focus first item when menu opens
  useEffect(() => {
    if (isOpen && menuRef.current) {
      const first =
        menuRef.current.querySelector<HTMLButtonElement>('[role="menuitem"]');
      first?.focus();
    }
  }, [isOpen]);

  function handleKeyDown(e: React.KeyboardEvent) {
    if (!menuRef.current) return;
    const items = Array.from(
      menuRef.current.querySelectorAll<HTMLButtonElement>('[role="menuitem"]'),
    );
    const current = document.activeElement as HTMLButtonElement;
    const idx = items.indexOf(current);

    if (e.key === "ArrowDown") {
      e.preventDefault();
      items[(idx + 1) % items.length]?.focus();
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      items[(idx - 1 + items.length) % items.length]?.focus();
    }
  }

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setIsOpen((o) => !o)}
        aria-expanded={isOpen}
        aria-haspopup="menu"
        aria-controls={isOpen ? menuId : undefined}
        className="flex h-11 w-11 cursor-pointer items-center justify-center rounded-full bg-surface text-label transition-colors hover:bg-border dark:bg-input-dark dark:text-fog dark:hover:bg-sidebar"
        aria-label="More actions"
      >
        <svg
          width="4"
          height="16"
          viewBox="0 0 4 16"
          fill="currentColor"
          aria-hidden="true"
        >
          <circle cx="2" cy="2" r="2" />
          <circle cx="2" cy="8" r="2" />
          <circle cx="2" cy="14" r="2" />
        </svg>
      </button>

      {isOpen && (
        <div
          ref={menuRef}
          id={menuId}
          role="menu"
          aria-label="More actions"
          onKeyDown={handleKeyDown}
          className="absolute right-0 top-[calc(100%+8px)] z-10 min-w-[180px] rounded-lg bg-card py-2 shadow-[0_10px_20px_rgba(0,0,0,0.25)] dark:bg-input-dark"
        >
          {items.map((item) => (
            <button
              type="button"
              key={item.label}
              role="menuitem"
              disabled={item.disabled}
              onClick={() => {
                item.onClick();
                setIsOpen(false);
              }}
              className="flex w-full cursor-pointer items-center px-5 py-3 text-left text-sm font-bold text-ink transition-colors hover:bg-surface disabled:opacity-60 dark:text-fog dark:hover:bg-sidebar"
            >
              {item.disabled && item.loadingLabel
                ? item.loadingLabel
                : item.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
