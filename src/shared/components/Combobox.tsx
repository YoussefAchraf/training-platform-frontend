import { forwardRef, useEffect, useId, useMemo, useRef, useState } from 'react';
import type { ChangeEvent, CSSProperties, InputHTMLAttributes, KeyboardEvent, ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/shared/utils/cn';
import styles from './Combobox.module.css';

export interface ComboboxOption {
  value: string;
  label: string;
  icon?: ReactNode;
}

interface ComboboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'value' | 'onSelect'> {
  value: string;
  options: ComboboxOption[];
  onSelect: (value: string) => void;
  invalid?: boolean;
  visibleCount?: number;
}







export const Combobox = forwardRef<HTMLInputElement, ComboboxProps>(
  (
    {
      value,
      options,
      onSelect,
      onChange,
      onFocus,
      onBlur,
      onKeyDown,
      invalid = false,
      visibleCount = 5,
      className,
      id,
      ...rest
    },
    ref,
  ) => {
    const { t } = useTranslation('common');
    const [isOpen, setIsOpen] = useState(false);
    const [activeIndex, setActiveIndex] = useState(-1);
    const wrapperRef = useRef<HTMLDivElement>(null);
    const listboxId = useId();

    const filteredOptions = useMemo(() => {
      const query = value.trim().toLowerCase();
      if (!query) return options;
      const isExactMatch = options.some((option) => option.label.toLowerCase() === query);
      if (isExactMatch) return options;
      return options.filter((option) => option.label.toLowerCase().includes(query));
    }, [value, options]);

    useEffect(() => {
      setActiveIndex(-1);
    }, [isOpen, filteredOptions]);

    useEffect(() => {
      if (!isOpen) return;
      const handlePointerDown = (event: MouseEvent) => {
        if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
          setIsOpen(false);
        }
      };
      document.addEventListener('mousedown', handlePointerDown);
      return () => document.removeEventListener('mousedown', handlePointerDown);
    }, [isOpen]);

    const openList = () => setIsOpen(true);

    const selectOption = (option: ComboboxOption) => {
      onSelect(option.value);
      setIsOpen(false);
    };

    const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
      setIsOpen(true);
      onChange?.(event);
    };

    const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
      if (event.key === 'ArrowDown') {
        event.preventDefault();
        setIsOpen(true);
        setActiveIndex((prev) => (prev + 1 >= filteredOptions.length ? 0 : prev + 1));
      } else if (event.key === 'ArrowUp') {
        event.preventDefault();
        setIsOpen(true);
        setActiveIndex((prev) => (prev - 1 < 0 ? filteredOptions.length - 1 : prev - 1));
      } else if (event.key === 'Enter') {
        if (isOpen && activeIndex >= 0 && filteredOptions[activeIndex]) {
          event.preventDefault();
          selectOption(filteredOptions[activeIndex]);
        }
      } else if (event.key === 'Escape') {
        if (isOpen) {
          event.preventDefault();
          setIsOpen(false);
        }
      }
      onKeyDown?.(event);
    };

    const showEmptyState = isOpen && filteredOptions.length === 0;

    return (
      <div ref={wrapperRef} className={styles.wrapper}>
        <input
          ref={ref}
          id={id}
          value={value}
          role="combobox"
          aria-expanded={isOpen}
          aria-controls={listboxId}
          aria-autocomplete="list"
          autoComplete="off"
          className={cn(styles.input, invalid && styles.invalid, className)}
          aria-invalid={invalid || undefined}
          onChange={handleChange}
          onFocus={(event) => {
            openList();
            onFocus?.(event);
          }}
          onClick={openList}
          onBlur={onBlur}
          onKeyDown={handleKeyDown}
          {...rest}
        />
        {isOpen && (
          <ul
            id={listboxId}
            role="listbox"
            className={styles.list}
            style={{ '--combobox-visible-count': visibleCount } as CSSProperties}
          >
            {filteredOptions.map((option, index) => {
              const isSelected = option.label.toLowerCase() === value.trim().toLowerCase();
              return (
                <li
                  key={option.value}
                  role="option"
                  aria-selected={isSelected}
                  className={cn(styles.option, index === activeIndex && styles.active, isSelected && styles.selected)}
                  onMouseDown={(event) => {
                    
                    event.preventDefault();
                    selectOption(option);
                  }}
                  onMouseEnter={() => setActiveIndex(index)}
                >
                  {option.icon}
                  <span className={styles.optionLabel}>{option.label}</span>
                </li>
              );
            })}
            {showEmptyState && <li className={styles.empty}>{t('Combobox.noMatch')}</li>}
          </ul>
        )}
      </div>
    );
  },
);

Combobox.displayName = 'Combobox';
