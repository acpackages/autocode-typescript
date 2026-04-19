// AcEventEmitter for @AcOutput decorator
export class AcEventEmitter<T = any> {
    private listeners: Array<(value: T) => void> = [];

    emit(value?: T) {
        this.listeners.forEach(listener => listener(value as T));
    }

    subscribe(listener: (value: T) => void) {
        this.listeners.push(listener);
        return () => {
            const index = this.listeners.indexOf(listener);
            if (index > -1) {
                this.listeners.splice(index, 1);
            }
        };
    }
}
