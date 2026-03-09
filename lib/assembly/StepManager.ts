import { gsap } from "gsap";
import * as THREE from "three";
import { PartHighlighter } from "@/lib/assembly/PartHighlighter";
import { AssemblyStep, StepStateSnapshot } from "@/lib/assembly/types";

type PartTransform = {
    finalPosition: THREE.Vector3;
    finalRotation: THREE.Euler;
    startPosition: THREE.Vector3;
    startRotation: THREE.Euler;
};

type RegisteredStepPart = {
    name: string;
    part: THREE.Object3D;
    disableHighlight: boolean;
    transforms: PartTransform;
};

type StepPartTransformSnapshot = {
    startPosition: [number, number, number];
    startRotation: [number, number, number];
    finalPosition: [number, number, number];
    finalRotation: [number, number, number];
};

type BasePartTransform = {
    finalPosition: THREE.Vector3;
    finalRotation: THREE.Euler;
};

const TRANSFORM_EPSILON = 1e-4;

type StepManagerOptions = {
    steps: AssemblyStep[];
    highlighter: PartHighlighter;
    offsetY?: number;
};

export class StepManager {
    private readonly steps: AssemblyStep[];
    private readonly highlighter: PartHighlighter;
    private readonly offsetY: number;
    private readonly partMap = new Map<string, THREE.Object3D>();
    private readonly baseTransformMap = new Map<string, BasePartTransform>();
    private readonly firstAppearanceMap = new Map<string, number>();
    private readonly registeredStepParts: RegisteredStepPart[][] = [];
    private currentStepIndex = 0;
    private isAnimating = false;

    constructor(options: StepManagerOptions) {
        this.steps = options.steps;
        this.highlighter = options.highlighter;
        this.offsetY = options.offsetY ?? 5;
    }

    registerParts(root: THREE.Object3D): void {
        let flatIndex = 0;
        const latestStepTransformMap = new Map<string, { finalPosition: THREE.Vector3; finalRotation: THREE.Euler }>();

        this.partMap.clear();
        this.baseTransformMap.clear();
        this.firstAppearanceMap.clear();
        this.registeredStepParts.length = 0;

        this.steps.forEach((step, stepIndex) => {
            const resolvedParts: RegisteredStepPart[] = [];

            step.parts.forEach((stepPart) => {
                const existingPart = this.partMap.get(stepPart.name);
                const part = existingPart ?? root.getObjectByName(stepPart.name);
                if (!part) {
                    throw new Error(`Part "${stepPart.name}" not found in model. Check node names in Blender/GLB.`);
                }

                const existingBaseTransform = this.baseTransformMap.get(stepPart.name);
                const baseTransform =
                    existingBaseTransform ??
                    ({
                        finalPosition: part.position.clone(),
                        finalRotation: part.rotation.clone(),
                    } satisfies BasePartTransform);

                if (!existingBaseTransform) {
                    this.baseTransformMap.set(stepPart.name, baseTransform);
                    this.partMap.set(stepPart.name, part);
                    this.firstAppearanceMap.set(stepPart.name, stepIndex);
                }

                const previousStepTransform = latestStepTransformMap.get(stepPart.name);
                const finalPosition = stepPart.targetPosition
                    ? new THREE.Vector3(...stepPart.targetPosition)
                    : baseTransform.finalPosition.clone().add(
                          new THREE.Vector3(
                              stepPart.targetOffset?.x ?? 0,
                              stepPart.targetOffset?.y ?? 0,
                              stepPart.targetOffset?.z ?? 0
                          )
                      );
                const finalRotation = stepPart.targetRotation
                    ? new THREE.Euler(...stepPart.targetRotation)
                    : baseTransform.finalRotation.clone();
                const startOffsetX = stepPart.startOffset?.x ?? 0;
                const startOffsetY =
                    stepPart.startOffset?.y ?? (previousStepTransform ? 0 : this.offsetY + flatIndex * 0.1);
                const startOffsetZ = stepPart.startOffset?.z ?? 0;
                const startPositionBase = previousStepTransform
                    ? previousStepTransform.finalPosition.clone()
                    : stepPart.targetPosition
                      ? finalPosition.clone()
                      : baseTransform.finalPosition.clone();
                const startPosition = startPositionBase
                    .add(new THREE.Vector3(startOffsetX, startOffsetY, startOffsetZ));
                const startRotation = previousStepTransform
                    ? previousStepTransform.finalRotation.clone()
                    : baseTransform.finalRotation.clone();

                if (!existingPart) {
                    part.position.copy(startPosition);
                    part.rotation.copy(startRotation);
                    part.userData.locked = false;
                    part.visible = false;
                }

                resolvedParts.push({
                    name: stepPart.name,
                    part,
                    disableHighlight: stepPart.disableHighlight ?? false,
                    transforms: {
                        finalPosition,
                        finalRotation,
                        startPosition,
                        startRotation,
                    },
                });
                latestStepTransformMap.set(stepPart.name, {
                    finalPosition: finalPosition.clone(),
                    finalRotation: finalRotation.clone(),
                });
                flatIndex += 1;
            });

            this.registeredStepParts.push(resolvedParts);
        });

        this.syncSceneToCurrentState();
    }

    getState(): StepStateSnapshot {
        return {
            currentStepIndex: this.currentStepIndex,
            totalSteps: this.steps.length,
            isAnimating: this.isAnimating,
        };
    }

    canGoNext(): boolean {
        return !this.isAnimating && this.currentStepIndex < this.steps.length;
    }

    canGoPrev(): boolean {
        return !this.isAnimating && this.currentStepIndex > 0;
    }

    getStepPartTransform(
        stepIndex: number,
        partName: string
    ): StepPartTransformSnapshot | null {
        const registeredPart = (this.registeredStepParts[stepIndex] ?? []).find(
            (part) => part.name === partName
        );
        if (!registeredPart) return null;

        const { startPosition, startRotation, finalPosition, finalRotation } =
            registeredPart.transforms;

        return {
            startPosition: [
                startPosition.x,
                startPosition.y,
                startPosition.z,
            ],
            startRotation: [
                startRotation.x,
                startRotation.y,
                startRotation.z,
            ],
            finalPosition: [
                finalPosition.x,
                finalPosition.y,
                finalPosition.z,
            ],
            finalRotation: [
                finalRotation.x,
                finalRotation.y,
                finalRotation.z,
            ],
        };
    }

    async nextStep(): Promise<StepStateSnapshot> {
        if (!this.canGoNext()) return this.getState();

        this.syncSceneToCurrentState();
        const stepIndex = this.currentStepIndex;
        const step = this.steps[stepIndex];
        await this.animateStepParts(stepIndex, true);
        this.setPartsVisibility(step.hidePartsOnComplete, false);
        this.currentStepIndex += 1;
        return this.getState();
    }

    async prevStep(): Promise<StepStateSnapshot> {
        if (!this.canGoPrev()) return this.getState();

        this.syncSceneToCurrentState();
        this.currentStepIndex -= 1;
        const stepIndex = this.currentStepIndex;
        const step = this.steps[stepIndex];
        await this.animateStepParts(stepIndex, false);
        this.setPartsVisibility(step.hidePartsOnComplete, true);
        return this.getState();
    }

    async goToStep(targetStepIndex: number): Promise<StepStateSnapshot> {
        if (targetStepIndex < 0 || targetStepIndex > this.steps.length) return this.getState();
        if (this.isAnimating) return this.getState();

        this.syncSceneToCurrentState();
        while (this.currentStepIndex < targetStepIndex) {
            await this.nextStep();
        }
        while (this.currentStepIndex > targetStepIndex) {
            await this.prevStep();
        }
        return this.getState();
    }

    private async animateStepParts(stepIndex: number, toFinal: boolean): Promise<void> {
        const targets = this.registeredStepParts[stepIndex] ?? [];
        const step = this.steps[stepIndex];

        this.isAnimating = true;

        if (toFinal) {
            await this.animatePartsVisibility(step.hidePartsBeforeStart, false);

            targets.forEach(({ part }) => {
                part.visible = true;
                this.setObjectOpacity(part, 1);
            });

            if (targets.length) {
                await Promise.all(
                    targets
                        .filter(({ disableHighlight }) => !disableHighlight)
                        .map(({ part }) => this.highlighter.pulse(part))
                );
            }
        }

        if (targets.length) {
            await Promise.all(
                targets.map(({ name, part, transforms }) => {
                    const targetPosition = toFinal ? transforms.finalPosition : transforms.startPosition;
                    const targetRotation = toFinal ? transforms.finalRotation : transforms.startRotation;
                    const shouldAnimate =
                        !this.areVectorsEqual(part.position, targetPosition) ||
                        !this.areEulerEqual(part.rotation, targetRotation);

                    return new Promise<void>((resolve) => {
                        if (!shouldAnimate) {
                            part.position.copy(targetPosition);
                            part.rotation.copy(targetRotation);
                            part.userData.locked = toFinal;
                            if (!toFinal) {
                                const firstAppearanceStepIndex = this.firstAppearanceMap.get(name);
                                part.visible = firstAppearanceStepIndex !== stepIndex;
                            }
                            part.updateMatrix();
                            part.updateMatrixWorld(true);
                            resolve();
                            return;
                        }

                        gsap.timeline({
                            onComplete: () => {
                                part.userData.locked = toFinal;
                                if (!toFinal) {
                                    const firstAppearanceStepIndex = this.firstAppearanceMap.get(name);
                                    part.visible = firstAppearanceStepIndex !== stepIndex;
                                }
                                resolve();
                            },
                        })
                            .to(part.position, {
                                x: targetPosition.x,
                                y: targetPosition.y,
                                z: targetPosition.z,
                                duration: toFinal ? 0.9 : 0.65,
                                ease: toFinal ? "power3.out" : "power2.inOut",
                            })
                            .to(
                                part.rotation,
                                {
                                    x: targetRotation.x,
                                    y: targetRotation.y,
                                    z: targetRotation.z,
                                    duration: toFinal ? 0.9 : 0.65,
                                    ease: toFinal ? "power3.out" : "power2.inOut",
                                },
                                0
                            );
                    });
                })
            );
        }

        this.isAnimating = false;
    }

    private setPartsVisibility(partNames: string[] | undefined, visible: boolean): void {
        if (!partNames?.length) return;

        partNames.forEach((partName) => {
            const part = this.partMap.get(partName);
            if (!part) return;
            part.visible = visible;
            this.setObjectOpacity(part, 1);
            part.updateMatrixWorld(true);
        });
    }

    private async animatePartsVisibility(partNames: string[] | undefined, visible: boolean): Promise<void> {
        if (!partNames?.length) return;

        const targets = partNames
            .map((partName) => this.partMap.get(partName))
            .filter((part): part is THREE.Object3D => Boolean(part));

        if (!targets.length) return;

        if (visible) {
            targets.forEach((part) => {
                part.visible = true;
                this.setObjectOpacity(part, 1);
                part.updateMatrixWorld(true);
            });
            return;
        }

        await Promise.all(
            targets.map(
                (part) =>
                    new Promise<void>((resolve) => {
                        if (!part.visible) {
                            resolve();
                            return;
                        }

                        const opacityState = { value: 1 };
                        this.setObjectOpacity(part, 1);

                        gsap.to(opacityState, {
                            value: 0,
                            duration: 0.18,
                            ease: "power2.out",
                            onUpdate: () => {
                                this.setObjectOpacity(part, opacityState.value);
                            },
                            onComplete: () => {
                                part.visible = false;
                                this.setObjectOpacity(part, 1);
                                part.updateMatrixWorld(true);
                                resolve();
                            },
                        });
                    })
            )
        );
    }

    private setObjectOpacity(object: THREE.Object3D, opacity: number): void {
        object.traverse((child) => {
            if (!(child instanceof THREE.Mesh)) return;

            const materials = Array.isArray(child.material) ? child.material : [child.material];
            materials.forEach((material) => {
                material.transparent = opacity < 1;
                material.opacity = opacity;
                material.needsUpdate = true;
            });
        });
    }

    private areVectorsEqual(a: THREE.Vector3, b: THREE.Vector3): boolean {
        return (
            Math.abs(a.x - b.x) < TRANSFORM_EPSILON &&
            Math.abs(a.y - b.y) < TRANSFORM_EPSILON &&
            Math.abs(a.z - b.z) < TRANSFORM_EPSILON
        );
    }

    private areEulerEqual(a: THREE.Euler, b: THREE.Euler): boolean {
        return (
            Math.abs(a.x - b.x) < TRANSFORM_EPSILON &&
            Math.abs(a.y - b.y) < TRANSFORM_EPSILON &&
            Math.abs(a.z - b.z) < TRANSFORM_EPSILON
        );
    }

    private syncSceneToCurrentState(): void {
        this.partMap.forEach((part, partName) => {
            const firstAppearanceStepIndex = this.firstAppearanceMap.get(partName);
            if (firstAppearanceStepIndex === undefined) return;

            const firstRegisteredPart =
                this.registeredStepParts[firstAppearanceStepIndex]?.find(
                    (entry) => entry.name === partName
                );
            if (!firstRegisteredPart) return;

            part.position.copy(firstRegisteredPart.transforms.startPosition);
            part.rotation.copy(firstRegisteredPart.transforms.startRotation);
            part.visible = false;
            part.userData.locked = false;
            part.updateMatrix();
            part.updateMatrixWorld(true);
        });

        for (let stepIndex = 0; stepIndex < this.currentStepIndex; stepIndex += 1) {
            const step = this.steps[stepIndex];
            const targets = this.registeredStepParts[stepIndex] ?? [];

            targets.forEach(({ part, transforms }) => {
                part.visible = true;
                part.position.copy(transforms.finalPosition);
                part.rotation.copy(transforms.finalRotation);
                part.userData.locked = true;
                part.updateMatrix();
                part.updateMatrixWorld(true);
            });

            this.setPartsVisibility(step.hidePartsOnComplete, false);
        }
    }
}
