export class EventSystem {
  constructor() {
    this.listeners = new Map();
  }

  subscribe(eventType, listener) {
    if (!this.listeners.has(eventType)) {
      // set key, value
      this.listeners.set(eventType, []);
    }
    this.listeners.get(eventType).push(listener);
  }

  unsubscribe(eventType, listener) {
    if (this.listeners.has(eventType)) {
      const listeners = this.listeners.get(eventType);
      const index = listeners.indexOf(listener);
      if (index !== -1) {
        listeners.splice(index, 1);
      }
    }
  }

  triggerEvent(eventType, data = null) {
    if (this.listeners.has(eventType)) {
      const listeners = this.listeners.get(eventType);
      listeners.forEach(listener => listener(data));
    }
  }
}