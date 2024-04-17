type ArriveFrom = 'right' | 'left' | 'bottom' | 'top';

type TimeoutId = ReturnType<typeof setTimeout> | null;

export type { ArriveFrom, TimeoutId }