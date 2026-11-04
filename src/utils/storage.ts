/**
 * Resilient Storage wrapper that safely accesses localStorage.
 * When running inside sandboxed iframes (e.g. AI Studio preview),
 * direct localStorage access can throw a SecurityError (DOMException)
 * or ReferenceError. This wrapper catches errors and falls back to memory.
 */

class SafeStorage {
  private memoryStore = new Map<string, string>();

  getItem(key: string): string | null {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        return window.localStorage.getItem(key);
      }
    } catch (e) {
      // Storage access blocked or restricted in iframe
    }
    return this.memoryStore.get(key) || null;
  }

  setItem(key: string, value: string): void {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem(key, value);
        return;
      }
    } catch (e) {
      // Storage access blocked or restricted in iframe
    }
    this.memoryStore.set(key, value);
  }

  removeItem(key: string): void {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.removeItem(key);
      }
    } catch (e) {
      // Storage access blocked or restricted in iframe
    }
    this.memoryStore.delete(key);
  }

  clear(): void {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.clear();
      }
    } catch (e) {
      // Storage access blocked
    }
    this.memoryStore.clear();
  }
}

export const safeStorage = new SafeStorage();
