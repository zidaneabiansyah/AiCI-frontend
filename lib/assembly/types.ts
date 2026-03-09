export type StepOffset = {
    x?: number;
    y?: number;
    z?: number;
};

export type StepRotation = [number, number, number];
export type StepPosition = [number, number, number];

export type AssemblyStepPart = {
    name: string;
    startOffset?: StepOffset;
    targetOffset?: StepOffset;
    targetPosition?: StepPosition;
    targetRotation?: StepRotation;
    disableHighlight?: boolean;
};

export type AssemblyStep = {
    id: string;
    label: string;
    instruction: string;
    parts: AssemblyStepPart[];
    hidePartsBeforeStart?: string[];
    hidePartsOnComplete?: string[];
};

export type StepStatus = "pending" | "active" | "done";

export type StepStateSnapshot = {
    currentStepIndex: number;
    totalSteps: number;
    isAnimating: boolean;
};
