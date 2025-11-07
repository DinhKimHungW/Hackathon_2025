import { useEffect } from 'react';

interface KeyboardShortcutOptions {
  ctrlKey?: boolean;
  shiftKey?: boolean;
  altKey?: boolean;
  preventDefault?: boolean;
}

/**
 * Keyboard shortcut hook
 * @param key - The key to listen for (e.g., 'k', 's', 'Escape')
 * @param callback - Function to call when shortcut is pressed
 * @param options - Modifier keys and options
 * 
 * @example
 * // Ctrl+K for global search
 * useKeyboardShortcut('k', () => openSearch(), { ctrlKey: true });
 * 
 * // Escape to close modal
 * useKeyboardShortcut('Escape', () => closeModal());
 * 
 * // Ctrl+Shift+S for save as
 * useKeyboardShortcut('s', () => saveAs(), { ctrlKey: true, shiftKey: true });
 */
export const useKeyboardShortcut = (
  key: string,
  callback: () => void,
  options: KeyboardShortcutOptions = {}
): void => {
  const {
    ctrlKey = false,
    shiftKey = false,
    altKey = false,
    preventDefault = true,
  } = options;

  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      // Check if the key matches
      const keyMatch = event.key.toLowerCase() === key.toLowerCase();

      // Check if modifiers match
      const ctrlMatch = ctrlKey === (event.ctrlKey || event.metaKey); // Support Cmd on Mac
      const shiftMatch = shiftKey === event.shiftKey;
      const altMatch = altKey === event.altKey;

      if (keyMatch && ctrlMatch && shiftMatch && altMatch) {
        if (preventDefault) {
          event.preventDefault();
        }
        callback();
      }
    };

    window.addEventListener('keydown', handler);

    return () => {
      window.removeEventListener('keydown', handler);
    };
  }, [key, callback, ctrlKey, shiftKey, altKey, preventDefault]);
};

export default useKeyboardShortcut;
