export class AcSignal<T> {
    private _value: T;
    private readonly _onChange?: (newValue: T, oldValue: T) => void;

    constructor(options: {
        value: T;
        onChange?: (newValue: T, oldValue: T) => void;
    }) {
        const { value, onChange } = options;
        this._value = value;
        this._onChange = onChange;
    }

    public get(): T {
        return this._value;
    }

    public set(options: { value: T; oldValue?: T }): void {
        const { value, oldValue = this._value } = options;
        if (oldValue === value) return;
        this._value = value;
        if (this._onChange) {
            this._onChange(value, oldValue);
        }
    }
}
