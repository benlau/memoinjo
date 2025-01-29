import React from "react";

export function useStateRef<T>(
    initialValue: T,
): [T, (_value: T) => void, React.MutableRefObject<T>] {
    const [state, setState] = React.useState<T>(initialValue);
    const ref = React.useRef<T>(state);

    const dispatch = React.useCallback((value: T) => {
        ref.current = value;
        setState(value);
    }, []);

    return [state, dispatch, ref];
}
