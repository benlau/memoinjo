import React from "react";

export class AbortedError extends Error {
    constructor(message: string = "Operation aborted") {
        super(message);
        this.name = "AbortedError";
    }
}

export class Debouncer {
    private timer: NodeJS.Timeout | null = null;
    private currentPromise: Promise<any> | null = null;
    private rejectFn: ((_reason?: any) => void) | null = null;
    private readonly debounceTime: number;

    constructor(debounceTime: number) {
        this.debounceTime = debounceTime;
    }

    async debounce<T>(
        func: (..._args: any[]) => Promise<T>,
        ...args: any[]
    ): Promise<T> {
        if (this.timer) {
            clearTimeout(this.timer);
            this.rejectFn?.(new AbortedError());
        }

        return new Promise<T>((resolve, reject) => {
            this.rejectFn = reject;

            this.timer = setTimeout(async () => {
                try {
                    this.currentPromise = func(...args);
                    const result = await this.currentPromise;
                    this.currentPromise = null;
                    resolve(result);
                } catch (error) {
                    this.currentPromise = null;
                    reject(error);
                } finally {
                    this.timer = null;
                    this.rejectFn = null;
                }
            }, this.debounceTime);
        });
    }

    abort(): void {
        if (this.timer) {
            clearTimeout(this.timer);
            this.timer = null;
            this.rejectFn?.(new AbortedError());
            this.rejectFn = null;
        }
    }
}

import { useRef } from "react";

export const useDebouncer = (debounceTime: number) => {
    const debouncerRef = useRef<Debouncer | null>(null);

    if (!debouncerRef.current) {
        debouncerRef.current = new Debouncer(debounceTime);
    }

    React.useEffect(() => {
        return () => {
            debouncerRef.current?.abort();
        };
    }, []);

    return debouncerRef.current;
};

export function useDebouncedFunc<T>(
    func: () => Promise<T>,
    debounceTime: number,
) {
    const debouncer = useDebouncer(debounceTime);

    const debouncedFunc = React.useCallback(
        async (...args: any[]) => {
            return debouncer.debounce(func, ...args);
        },
        [debouncer, func],
    );

    return debouncedFunc;
}
