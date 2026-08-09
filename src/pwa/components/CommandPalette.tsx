import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { KeyboardEvent as ReactKeyboardEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'motion/react';
import { Search } from 'lucide-react';
import { easeOut } from '@/shared/motion/variants';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { useClickOutside } from '@/shared/hooks/useClickOutside';
import { usePrefetchRoute } from '@/routes/routeModules';
import { useUiStore } from '@/shared/store/uiStore';
import { visibleNavItems } from '@/layouts/components/navItems';
import styles from './CommandPalette.module.css';


export function CommandPalette() {
  const isOpen = useUiStore((state) => state.isCommandPaletteOpen);
  const closePalette = useUiStore((state) => state.closeCommandPalette);
  const togglePalette = useUiStore((state) => state.toggleCommandPalette);
  const [query, setQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const prefetchRoute = usePrefetchRoute();
  const { user } = useAuth();

  const items = useMemo(() => visibleNavItems(user?.role), [user?.role]);
  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter((item) => item.label.toLowerCase().includes(q));
  }, [items, query]);

  const close = useCallback(() => {
    closePalette();
    setQuery('');
    setActiveIndex(0);
  }, [closePalette]);

  useClickOutside(panelRef, close, isOpen);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        togglePalette();
        return;
      }
      if (event.key === 'Escape' && isOpen) {
        close();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, togglePalette, close]);

  useEffect(() => {
    if (isOpen) {
      setActiveIndex(0);
      requestAnimationFrame(() => inputRef.current?.focus());
    }
  }, [isOpen]);

  const handleInputKeyDown = (event: ReactKeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setActiveIndex((index) => Math.min(index + 1, results.length - 1));
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      setActiveIndex((index) => Math.max(index - 1, 0));
    } else if (event.key === 'Enter') {
      event.preventDefault();
      const item = results[activeIndex];
      if (item) {
        navigate(item.to);
        close();
      }
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className={styles.overlay}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
        >
          <motion.div
            ref={panelRef}
            className={styles.panel}
            role="dialog"
            aria-label="Quick navigation"
            initial={{ opacity: 0, y: -8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.98 }}
            transition={{ duration: 0.18, ease: easeOut }}
          >
            <div className={styles.inputRow}>
              <Search size={16} className={styles.searchIcon} />
              <input
                ref={inputRef}
                className={styles.input}
                placeholder="Jump to..."
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                onKeyDown={handleInputKeyDown}
                aria-label="Search pages"
              />
              <kbd className={styles.kbd}>Esc</kbd>
            </div>

            <ul className={styles.list} role="listbox">
              {results.length === 0 && <li className={styles.empty}>No matches</li>}
              {results.map((item, index) => (
                <li key={item.to}>
                  <button
                    type="button"
                    role="option"
                    aria-selected={index === activeIndex}
                    className={index === activeIndex ? styles.optionActive : styles.option}
                    onMouseEnter={() => {
                      setActiveIndex(index);
                      prefetchRoute(item.to);
                    }}
                    onClick={() => {
                      navigate(item.to);
                      close();
                    }}
                  >
                    <item.icon size={16} />
                    <span>{item.label}</span>
                  </button>
                </li>
              ))}
            </ul>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
