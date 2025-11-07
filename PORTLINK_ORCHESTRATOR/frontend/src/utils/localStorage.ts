/**
 * LocalStorage utility functions with error handling
 * Prevents JSON.parse errors and handles edge cases
 */

export const localStorageUtils = {
  /**
   * Safely get and parse JSON from localStorage
   * @param key - localStorage key
   * @param defaultValue - default value if parsing fails
   * @returns Parsed value or default
   */
  getJSON: <T = any>(key: string, defaultValue: T | null = null): T | null => {
    try {
      const item = localStorage.getItem(key);
      
      // Handle null, undefined, or invalid values
      if (!item || item === 'undefined' || item === 'null') {
        return defaultValue;
      }
      
      return JSON.parse(item) as T;
    } catch (error) {
      console.error(`Error parsing localStorage key "${key}":`, error);
      return defaultValue;
    }
  },

  /**
   * Safely set JSON to localStorage
   * @param key - localStorage key
   * @param value - value to store
   */
  setJSON: (key: string, value: any): void => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error(`Error setting localStorage key "${key}":`, error);
    }
  },

  /**
   * Safely get string from localStorage
   * @param key - localStorage key
   * @returns String value or null
   */
  getString: (key: string): string | null => {
    try {
      const item = localStorage.getItem(key);
      
      // Handle undefined or null strings
      if (item === 'undefined' || item === 'null') {
        return null;
      }
      
      return item;
    } catch (error) {
      console.error(`Error getting localStorage key "${key}":`, error);
      return null;
    }
  },

  /**
   * Safely set string to localStorage
   * @param key - localStorage key
   * @param value - string value
   */
  setString: (key: string, value: string): void => {
    try {
      localStorage.setItem(key, value);
    } catch (error) {
      console.error(`Error setting localStorage key "${key}":`, error);
    }
  },

  /**
   * Remove item from localStorage
   * @param key - localStorage key
   */
  remove: (key: string): void => {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error(`Error removing localStorage key "${key}":`, error);
    }
  },

  /**
   * Clear all localStorage
   */
  clear: (): void => {
    try {
      localStorage.clear();
    } catch (error) {
      console.error('Error clearing localStorage:', error);
    }
  },

  /**
   * Check if key exists in localStorage
   * @param key - localStorage key
   * @returns true if exists and valid
   */
  has: (key: string): boolean => {
    try {
      const item = localStorage.getItem(key);
      return item !== null && item !== 'undefined' && item !== 'null';
    } catch (error) {
      return false;
    }
  },
};

export default localStorageUtils;
