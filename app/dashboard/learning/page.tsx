"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import {
  ChevronLeft,
  ChevronRight,
  Copy,
  Eye,
  EyeOff,
  Layers3,
  RotateCcw,
  SlidersHorizontal,
  X,
} from "lucide-react";
import {
  AssemblyScene,
  ASSEMBLY_SCENE_SIGNATURE,
} from "@/lib/assembly/AssemblyScene";
import { PartPreview3D } from "@/app/dashboard/learning/PartPreview3D";
import { AssemblyStep, StepStateSnapshot } from "@/lib/assembly/types";
import {
  radarLessonRuntime,
  RADAR_BASE_STAND_PART_NAME,
} from "@/lib/assembly/radarLesson";
import type {
  RadarLearningStepSpec,
  RadarLessonDerivedState,
  RadarPart,
  RadarPartPack,
} from "@/lib/assembly/radarLessonTypes";
import {
  fetchAllLessonSteps,
  fetchLessonMeta,
  type LessonMetaResponse,
  type LessonStepResponse,
} from "@/lib/assembly/lessonApi";

type DebugTransformState = {
  position: { x: number; y: number; z: number };
  rotation: { x: number; y: number; z: number };
};

type CameraDebugState = {
  position: { x: number; y: number; z: number };
  target: { x: number; y: number; z: number };
};

const WORKSPACE_TRANSITION_MS = 560;
const INTRO_MODAL_TRANSITION_MS = 220;

function roundDebugValue(value: number): number {
  return Number(value.toFixed(3));
}

function wrapAngle(value: number): number {
  const fullTurn = Math.PI * 2;
  let nextValue = value % fullTurn;

  if (nextValue > Math.PI) nextValue -= fullTurn;
  if (nextValue < -Math.PI) nextValue += fullTurn;

  return roundDebugValue(nextValue);
}

function formatDebugTransform(
  transform: DebugTransformState | null,
): DebugTransformState | null {
  if (!transform) return null;

  return {
    position: {
      x: roundDebugValue(transform.position.x),
      y: roundDebugValue(transform.position.y),
      z: roundDebugValue(transform.position.z),
    },
    rotation: {
      x: roundDebugValue(transform.rotation.x),
      y: roundDebugValue(transform.rotation.y),
      z: roundDebugValue(transform.rotation.z),
    },
  };
}

function formatCameraDebugState(
  state: CameraDebugState | null,
): CameraDebugState | null {
  if (!state) return null;

  return {
    position: {
      x: roundDebugValue(state.position.x),
      y: roundDebugValue(state.position.y),
      z: roundDebugValue(state.position.z),
    },
    target: {
      x: roundDebugValue(state.target.x),
      y: roundDebugValue(state.target.y),
      z: roundDebugValue(state.target.z),
    },
  };
}

type LessonDerivedStateInput = {
  stepState: StepStateSnapshot;
  steps: AssemblyStep[];
  stepSpecs: RadarLearningStepSpec[];
  parts: RadarPart[];
  partPacks: readonly RadarPartPack[];
  getWorkspacePreviewImage: (stepNumber: number) => string;
};

function getLessonDerivedState({
  stepState,
  steps,
  stepSpecs,
  parts,
  partPacks,
  getWorkspacePreviewImage,
}: LessonDerivedStateInput): RadarLessonDerivedState {
  const totalSteps = steps.length;
  const hasRemainingSteps = stepState.currentStepIndex < totalSteps;
  const upcomingStepNumber = hasRemainingSteps
    ? stepState.currentStepIndex + 1
    : totalSteps;
  const currentLearningStep = hasRemainingSteps
    ? (steps[stepState.currentStepIndex] ?? null)
    : null;
  const currentLearningSpec = hasRemainingSteps
    ? (stepSpecs[stepState.currentStepIndex] ?? null)
    : null;
  const currentPack =
    partPacks.find(
      (pack) =>
        upcomingStepNumber >= pack.startStep &&
        upcomingStepNumber <= pack.endStep,
    ) ?? partPacks[partPacks.length - 1];
  const partsById = new Map(parts.map((part) => [part.id, part]));
  const currentPart = currentLearningSpec?.partId
    ? (partsById.get(currentLearningSpec.partId) ?? null)
    : null;
  const currentStepQuantity = currentLearningSpec?.quantity ?? 0;
  const currentInstruction =
    currentLearningStep?.instruction ??
    "Assembly selesai. Semua part sudah ditempatkan.";
  const currentPartEmptyMessage = hasRemainingSteps
    ? currentLearningSpec?.hidePartNamesOnComplete?.includes(
        RADAR_BASE_STAND_PART_NAME,
      )
      ? "Subassembly radarbot_1 sedang disiapkan supaya fokus pindah ke komponen akhir."
      : "Belum ada part yang dimunculkan. Tekan Next untuk mulai dari MC."
    : "Semua part sudah selesai ditempatkan.";
  const desiredWorkspacePreviewSrc =
    getWorkspacePreviewImage(upcomingStepNumber);
  const sequenceProgressPercent =
    totalSteps <= 1
      ? 0
      : (Math.max(upcomingStepNumber - 1, 0) / (totalSteps - 1)) * 100;
  const sequenceHandlePercent = Math.min(
    98,
    Math.max(2, sequenceProgressPercent),
  );
  const sequenceMarkers = partPacks.slice(0, -1).map(
    (pack) => (pack.endStep / totalSteps) * 100,
  );

  return {
    hasRemainingSteps,
    upcomingStepNumber,
    currentLearningStep,
    currentLearningSpec,
    currentPack,
    currentPart,
    currentStepQuantity,
    currentInstruction,
    currentPartEmptyMessage,
    desiredWorkspacePreviewSrc,
    sequenceProgressPercent,
    sequenceHandlePercent,
    sequenceMarkers,
  };
}
export default function Learning3DPage() {
  const [mode, setMode] = useState<"catalog" | "workspace">("catalog");
  const [introOpen, setIntroOpen] = useState(false);
  const [sceneReady, setSceneReady] = useState(false);
  const [loadingScene, setLoadingScene] = useState(false);
  const [lessonMeta, setLessonMeta] = useState<LessonMetaResponse | null>(null);
  const [remoteSteps, setRemoteSteps] = useState<AssemblyStep[] | null>(null);
  const [remoteStepSpecs, setRemoteStepSpecs] = useState<
    RadarLearningStepSpec[] | null
  >(null);
  const [stepPayloads, setStepPayloads] = useState<
    Record<number, LessonStepResponse>
  >({});
  const [lessonLoading, setLessonLoading] = useState(false);
  const [lessonError, setLessonError] = useState<string | null>(null);
  const [stepState, setStepState] =
    useState<StepStateSnapshot>(radarLessonRuntime.initialStepState);
  const stepsForScene = remoteSteps ?? radarLessonRuntime.steps;
  const stepSpecsForScene = remoteStepSpecs ?? radarLessonRuntime.stepSpecs;
  const lessonIntro = lessonMeta?.intro ?? radarLessonRuntime.intro;
  const lessonGuideImages =
    lessonMeta?.guideImages ?? radarLessonRuntime.guideImages;
  const lessonReferencePreview =
    lessonMeta?.referencePreviewImage ?? radarLessonRuntime.referencePreviewImage;
  const lessonParts = lessonMeta?.parts ?? radarLessonRuntime.parts;
  const lessonPartPacks = lessonMeta?.partPacks ?? radarLessonRuntime.partPacks;
  const lessonTotalSteps =
    lessonMeta?.totalSteps ?? radarLessonRuntime.totalSteps;
  const transformDebugEnabled =
    lessonMeta?.transformDebugEnabled ?? radarLessonRuntime.transformDebugEnabled;
  const modelUrl = lessonMeta?.defaultModelUrl ?? radarLessonRuntime.defaultModelUrl;
  const lessonReady =
    !lessonLoading &&
    !lessonError &&
    Boolean(lessonMeta && remoteSteps && remoteStepSpecs);
  const initialStepState = useMemo<StepStateSnapshot>(
    () => ({
      currentStepIndex: 0,
      totalSteps: stepsForScene.length,
      isAnimating: false,
    }),
    [stepsForScene.length],
  );
  const [sceneError, setSceneError] = useState<string | null>(null);
  const [workspaceVisible, setWorkspaceVisible] = useState(false);
  const [showReferenceCard, setShowReferenceCard] = useState(true);
  const [partsListOpen, setPartsListOpen] = useState(false);
  const [debugOpen, setDebugOpen] = useState(
    radarLessonRuntime.transformDebugEnabled,
  );
  const [selectedDebugPartName, setSelectedDebugPartName] = useState("");
  const [debugTransform, setDebugTransform] =
    useState<DebugTransformState | null>(null);
  const [debugBaseline, setDebugBaseline] =
    useState<DebugTransformState | null>(null);
  const [debugCopied, setDebugCopied] = useState(false);
  const [cameraDebug, setCameraDebug] = useState<CameraDebugState | null>(null);
  const [cameraBaseline, setCameraBaseline] =
    useState<CameraDebugState | null>(null);
  const [cameraCopied, setCameraCopied] = useState(false);
  const [catalogPreviewSrc, setCatalogPreviewSrc] = useState(
    radarLessonRuntime.referencePreviewImage,
  );

  const canvasHostRef = useRef<HTMLDivElement | null>(null);
  const sceneRef = useRef<AssemblyScene | null>(null);
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const sceneConfigSignature = useMemo(() => {
    const stepSignature = stepsForScene.map((step) => step.id).join("|");
    const sourceTag = remoteSteps ? "remote" : "local";
    return `${ASSEMBLY_SCENE_SIGNATURE}:${sourceTag}:${stepSignature}`;
  }, [remoteSteps, stepsForScene]);
  const {
    upcomingStepNumber,
    currentLearningStep,
    currentLearningSpec,
    currentPack,
    currentPart,
    currentStepQuantity,
    currentInstruction,
    currentPartEmptyMessage,
    desiredWorkspacePreviewSrc,
    sequenceHandlePercent,
    sequenceMarkers,
  } = useMemo(
    () =>
      getLessonDerivedState({
        stepState,
        steps: stepsForScene,
        stepSpecs: stepSpecsForScene,
        parts: lessonParts,
        partPacks: lessonPartPacks,
        getWorkspacePreviewImage: radarLessonRuntime.getWorkspacePreviewImage,
      }),
    [
      lessonPartPacks,
      lessonParts,
      stepSpecsForScene,
      stepState,
      stepsForScene,
    ],
  );
  const currentDebugPartNames = useMemo(() => {
    if (!transformDebugEnabled || !currentLearningSpec?.partId) {
      return [];
    }
    return currentLearningStep?.parts.map((part) => part.name) ?? [];
  }, [currentLearningSpec?.partId, currentLearningStep, transformDebugEnabled]);
  const currentDebugPartSignature = currentDebugPartNames.join("|");
  const [workspacePreviewSrc, setWorkspacePreviewSrc] = useState(
    desiredWorkspacePreviewSrc,
  );
  const currentStepRuntimeBehavior = useMemo(() => {
    return (
      stepPayloads[upcomingStepNumber]?.runtimeBehavior ??
      radarLessonRuntime.resolveStepRuntimeBehavior(upcomingStepNumber)
    );
  }, [stepPayloads, upcomingStepNumber]);
  const showSceneSkeleton = loadingScene || !sceneReady;

  const readDebugTransform = useCallback(
    (partName: string): DebugTransformState | null => {
      const configuredTransform = sceneRef.current?.getConfiguredPartTransform(
        stepState.currentStepIndex,
        partName,
      );

      if (configuredTransform) {
        return formatDebugTransform({
          position: {
            x: configuredTransform.finalPosition[0],
            y: configuredTransform.finalPosition[1],
            z: configuredTransform.finalPosition[2],
          },
          rotation: {
            x: configuredTransform.finalRotation[0],
            y: configuredTransform.finalRotation[1],
            z: configuredTransform.finalRotation[2],
          },
        });
      }

      const transform = sceneRef.current?.getPartTransform(partName);
      if (!transform) return null;

      return formatDebugTransform({
        position: {
          x: transform.position[0],
          y: transform.position[1],
          z: transform.position[2],
        },
        rotation: {
          x: transform.rotation[0],
          y: transform.rotation[1],
          z: transform.rotation[2],
        },
      });
    },
    [stepState.currentStepIndex],
  );

  const syncDebugTransform = useCallback(
    (partName: string) => {
      sceneRef.current?.focusPart(partName || null);
      const transform = readDebugTransform(partName);
      if (partName && transform) {
        sceneRef.current?.setPartVisible(partName, true);
        sceneRef.current?.setPartTransform(partName, {
          position: [
            transform.position.x,
            transform.position.y,
            transform.position.z,
          ],
          rotation: [
            transform.rotation.x,
            transform.rotation.y,
            transform.rotation.z,
          ],
        });
      }
      setDebugTransform(transform);
      setDebugBaseline(transform);
      setDebugCopied(false);
    },
    [readDebugTransform],
  );

  const readCameraDebugState = useCallback((): CameraDebugState | null => {
    const cameraState = sceneRef.current?.getCameraState();
    if (!cameraState) return null;

    return formatCameraDebugState({
      position: {
        x: cameraState.position[0],
        y: cameraState.position[1],
        z: cameraState.position[2],
      },
      target: {
        x: cameraState.target[0],
        y: cameraState.target[1],
        z: cameraState.target[2],
      },
    });
  }, []);

  const syncCameraDebugState = useCallback(() => {
    const state = readCameraDebugState();
    setCameraDebug(state);
    setCameraBaseline(state);
    setCameraCopied(false);
  }, [readCameraDebugState]);

  const getResolvedCameraPreset = useCallback(
    (stepNumber: number) => {
      const payload = stepPayloads[stepNumber];
      if (payload?.cameraPreset) {
        return payload.cameraPreset;
      }

      const stepIndex = Math.min(
        Math.max(stepNumber - 1, 0),
        stepsForScene.length - 1,
      );
      const focusPoints = sceneRef.current
        ? stepsForScene
            .slice(0, stepIndex + 1)
            .flatMap((step, index) =>
              step.parts
                .map((part) =>
                  sceneRef.current?.getConfiguredPartTransform(
                    index,
                    part.name,
                  ),
                )
                .filter(Boolean)
                .map((transform) => transform!.finalPosition),
            )
        : [];

      return radarLessonRuntime.resolveCameraPreset({
        stepNumber,
        currentStepIndex: stepIndex,
        currentPartId: stepSpecsForScene[stepIndex]?.partId ?? null,
        focusPoints,
      });
    },
    [stepPayloads, stepSpecsForScene, stepsForScene],
  );

  const prepareSceneBoot = () => {
    setLoadingScene(true);
    setSceneReady(false);
    setSceneError(null);
    setStepState(initialStepState);
  };

  const openIntroModal = () => {
    if (!lessonReady) return;
    setCatalogPreviewSrc(lessonReferencePreview);
    setIntroOpen(true);
  };

  const openWorkspace = () => {
    if (!lessonReady) return;
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }

    setCatalogPreviewSrc(lessonReferencePreview);
    setIntroOpen(false);
    setPartsListOpen(false);
    prepareSceneBoot();
    setWorkspaceVisible(false);
    setMode("workspace");
  };

  const closeWorkspace = () => {
    setWorkspaceVisible(false);

    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
    }

    closeTimerRef.current = setTimeout(() => {
      setMode("catalog");
      setPartsListOpen(false);
      closeTimerRef.current = null;
    }, WORKSPACE_TRANSITION_MS);
  };

  useEffect(() => {
    setWorkspacePreviewSrc(desiredWorkspacePreviewSrc);
  }, [desiredWorkspacePreviewSrc]);

  useEffect(() => {
    setCatalogPreviewSrc(lessonReferencePreview);
  }, [lessonReferencePreview]);

  useEffect(() => {
    if (!transformDebugEnabled) {
      setDebugOpen(false);
    }
  }, [transformDebugEnabled]);

  useEffect(() => {
    let active = true;
    setLessonLoading(true);
    setLessonError(null);

    (async () => {
      try {
        const meta = await fetchLessonMeta("radar");
        const stepsPayload = await fetchAllLessonSteps(
          "radar",
          meta.totalSteps,
        );

        if (!active) return;

        const payloadMap: Record<number, LessonStepResponse> = {};
        stepsPayload.forEach((payload) => {
          payloadMap[payload.stepNumber] = payload;
        });

        setLessonMeta(meta);
        setRemoteSteps(stepsPayload.map((payload) => payload.step));
        setRemoteStepSpecs(stepsPayload.map((payload) => payload.stepSpec));
        setStepPayloads(payloadMap);
      } catch (error) {
        if (!active) return;
        setLessonError(
          error instanceof Error
            ? error.message
            : "Failed to load lesson data.",
        );
      } finally {
        if (active) setLessonLoading(false);
      }
    })();

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (mode === "workspace" && lessonError) {
      closeWorkspace();
    }
  }, [lessonError, mode]);

  useEffect(() => {
    return () => {
      if (closeTimerRef.current) {
        clearTimeout(closeTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (mode !== "workspace" && !introOpen) return;

    const frame = window.requestAnimationFrame(() => {
      if (mode === "workspace") {
        setWorkspaceVisible(true);
      }
    });

    const previousBodyOverflow = document.body.style.overflow;
    const previousHtmlOverflow = document.documentElement.style.overflow;

    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";

    return () => {
      window.cancelAnimationFrame(frame);
      document.body.style.overflow = previousBodyOverflow;
      document.documentElement.style.overflow = previousHtmlOverflow;
    };
  }, [introOpen, mode]);

  useEffect(() => {
    if (!introOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIntroOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [introOpen]);

  useEffect(() => {
    if (!partsListOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setPartsListOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [partsListOpen]);

  useEffect(() => {
    if (mode !== "workspace") return;
    if (!canvasHostRef.current) return;

    let disposed = false;
    const host = canvasHostRef.current;
    host.innerHTML = "";
    setLoadingScene(true);
    setSceneReady(false);
    setSceneError(null);

    const scene = new AssemblyScene({
      container: host,
      modelUrl,
      steps: stepsForScene,
      offsetY: 5,
    });
    sceneRef.current = scene;

    scene
      .init()
      .then(() => {
        if (disposed) return;
        setSceneReady(true);
        setStepState(scene.getStepManager().getState());
        scene.setCameraPreset(getResolvedCameraPreset(1), true);
        syncCameraDebugState();
      })
      .catch((error) => {
        if (disposed) return;
        setSceneError(
          error instanceof Error
            ? error.message
            : "Failed to initialize 3D scene.",
        );
      })
      .finally(() => {
        if (!disposed) setLoadingScene(false);
      });

    return () => {
      disposed = true;
      sceneRef.current?.dispose();
      sceneRef.current = null;
    };
  }, [
    getResolvedCameraPreset,
    mode,
    modelUrl,
    sceneConfigSignature,
    syncCameraDebugState,
  ]);

  useEffect(() => {
    if (mode !== "workspace" || !sceneReady) return;
    setSelectedDebugPartName("");
  }, [mode, sceneReady, stepState.currentStepIndex]);

  useEffect(() => {
    if (mode !== "workspace" || !sceneReady) return;

    if (!currentDebugPartNames.length) {
      sceneRef.current?.focusPart(null);
      setSelectedDebugPartName("");
      setDebugTransform(null);
      setDebugBaseline(null);
      return;
    }

    const nextPartName = currentDebugPartNames.includes(selectedDebugPartName)
      ? selectedDebugPartName
      : currentDebugPartNames[0];

    if (nextPartName !== selectedDebugPartName) {
      setSelectedDebugPartName(nextPartName);
    }

    syncDebugTransform(nextPartName);
  }, [
    currentDebugPartNames,
    currentDebugPartSignature,
    mode,
    sceneReady,
    selectedDebugPartName,
    syncDebugTransform,
    stepState.currentStepIndex,
  ]);

  useEffect(() => {
    if (mode !== "workspace" || !sceneReady) return;

    const previewRule = currentStepRuntimeBehavior.enterPreview;
    if (!previewRule) return;

    previewRule.hidePartNames?.forEach((partName) => {
      sceneRef.current?.setPartVisible(partName, false);
    });

    previewRule.parts.forEach(({ name, transform }) => {
      const partTransform = sceneRef.current?.getConfiguredPartTransform(
        stepState.currentStepIndex,
        name,
      );
      if (!partTransform) return;

      sceneRef.current?.setPartVisible(name, true);
      sceneRef.current?.setPartTransform(name, {
        position:
          transform === "start"
            ? partTransform.startPosition
            : partTransform.finalPosition,
        rotation:
          transform === "start"
            ? partTransform.startRotation
            : partTransform.finalRotation,
      });
    });

    if (previewRule.highlightParts?.length) {
      previewRule.highlightParts.forEach((partName) => {
        void sceneRef.current?.getStepManager().pulsePart(partName);
      });
    }
  }, [
    currentStepRuntimeBehavior.enterPreview,
    mode,
    sceneReady,
    stepState.currentStepIndex,
  ]);

  useEffect(() => {
    if (mode !== "workspace" || !sceneReady) return;

    const preset = getResolvedCameraPreset(upcomingStepNumber);
    sceneRef.current?.setCameraPreset(preset, false);

    const formattedPreset = formatCameraDebugState({
      position: {
        x: preset.position[0],
        y: preset.position[1],
        z: preset.position[2],
      },
      target: {
        x: preset.target[0],
        y: preset.target[1],
        z: preset.target[2],
      },
    });
    setCameraDebug(formattedPreset);
    setCameraBaseline(formattedPreset);
    setCameraCopied(false);
  }, [getResolvedCameraPreset, mode, sceneReady, upcomingStepNumber]);

  const syncStateFromManager = () => {
    const manager = sceneRef.current?.getStepManager();
    if (!manager) return;
    setStepState(manager.getState());
  };

  const handleNext = async () => {
    const manager = sceneRef.current?.getStepManager();
    if (!manager || !manager.canGoNext()) return;

    const navigationRule = currentStepRuntimeBehavior.navigation;

    if (navigationRule?.cameraPresetStepOnNext) {
      sceneRef.current?.setCameraPreset(
        getResolvedCameraPreset(navigationRule.cameraPresetStepOnNext),
        false,
      );
    }

    navigationRule?.hidePartNamesBeforeNext?.forEach((partName) => {
      sceneRef.current?.setPartVisible(partName, false);
    });

    await manager.nextStep();

    for (
      let skippedStep = 0;
      skippedStep < (navigationRule?.skipForwardSteps ?? 0);
      skippedStep += 1
    ) {
      if (!manager.canGoNext()) break;
      await manager.nextStep();
    }

    syncStateFromManager();
  };

  const handlePrev = async () => {
    const manager = sceneRef.current?.getStepManager();
    if (!manager || !manager.canGoPrev()) return;

    const navigationRule = currentStepRuntimeBehavior.navigation;

    await manager.prevStep();

    for (
      let skippedStep = 0;
      skippedStep < (navigationRule?.skipBackwardSteps ?? 0);
      skippedStep += 1
    ) {
      if (!manager.canGoPrev()) break;
      await manager.prevStep();
    }

    syncStateFromManager();
  };

  const handleJumpToStep = async (targetIndex: number) => {
    const manager = sceneRef.current?.getStepManager();
    if (!manager || stepState.isAnimating) return;
    await manager.goToStep(targetIndex);
    syncStateFromManager();
  };

  const jumpToSequenceRatio = async (ratio: number) => {
    const clampedRatio = Math.min(1, Math.max(0, ratio));
    const targetIndex = Math.round(
      clampedRatio * (stepsForScene.length - 1),
    );
    await handleJumpToStep(targetIndex);
  };

  const applyDebugTransform = (nextTransform: DebugTransformState | null) => {
    if (!selectedDebugPartName || !nextTransform) return;

    sceneRef.current?.setPartTransform(selectedDebugPartName, {
      position: [
        nextTransform.position.x,
        nextTransform.position.y,
        nextTransform.position.z,
      ],
      rotation: [
        nextTransform.rotation.x,
        nextTransform.rotation.y,
        nextTransform.rotation.z,
      ],
    });
    setDebugTransform(formatDebugTransform(nextTransform));
    setDebugCopied(false);
  };

  const handleDebugPositionChange = (
    axis: keyof DebugTransformState["position"],
    value: string,
  ) => {
    if (!debugTransform) return;

    const numericValue = Number(value);
    if (!Number.isFinite(numericValue)) return;

    applyDebugTransform({
      ...debugTransform,
      position: {
        ...debugTransform.position,
        [axis]: numericValue,
      },
    });
  };

  const handleDebugRotationChange = (
    axis: keyof DebugTransformState["rotation"],
    value: string,
  ) => {
    if (!debugTransform) return;

    const numericValue = Number(value);
    if (!Number.isFinite(numericValue)) return;

    applyDebugTransform({
      ...debugTransform,
      rotation: {
        ...debugTransform.rotation,
        [axis]: numericValue,
      },
    });
  };

  const handleDebugRotationFlip = (
    axis: keyof DebugTransformState["rotation"],
  ) => {
    if (!debugTransform) return;

    applyDebugTransform({
      ...debugTransform,
      rotation: {
        ...debugTransform.rotation,
        [axis]: wrapAngle(debugTransform.rotation[axis] + Math.PI),
      },
    });
  };

  const resetDebugPart = () => {
    if (!debugBaseline) return;
    applyDebugTransform(debugBaseline);
  };

  const copyDebugValues = async () => {
    if (!debugTransform || !selectedDebugPartName) return;

    const payload = [
      `${selectedDebugPartName}`,
      `position: [${debugTransform.position.x}, ${debugTransform.position.y}, ${debugTransform.position.z}]`,
      `rotation: [${debugTransform.rotation.x}, ${debugTransform.rotation.y}, ${debugTransform.rotation.z}]`,
    ].join("\n");

    try {
      await navigator.clipboard.writeText(payload);
      setDebugCopied(true);
    } catch {
      setDebugCopied(false);
    }
  };

  const applyCameraDebugState = (nextState: CameraDebugState | null) => {
    if (!nextState) return;

    sceneRef.current?.setCameraPreset(
      {
        position: [
          nextState.position.x,
          nextState.position.y,
          nextState.position.z,
        ],
        target: [nextState.target.x, nextState.target.y, nextState.target.z],
        duration: 0,
      },
      true,
    );

    const formattedState = formatCameraDebugState(nextState);
    setCameraDebug(formattedState);
    setCameraCopied(false);
  };

  const handleCameraDebugChange = (
    section: keyof CameraDebugState,
    axis: keyof CameraDebugState["position"],
    value: string,
  ) => {
    if (!cameraDebug) return;

    const numericValue = Number(value);
    if (!Number.isFinite(numericValue)) return;

    applyCameraDebugState({
      ...cameraDebug,
      [section]: {
        ...cameraDebug[section],
        [axis]: numericValue,
      },
    });
  };

  const resetCameraDebug = () => {
    if (!cameraBaseline) return;
    applyCameraDebugState(cameraBaseline);
  };

  const copyCameraDebugValues = async () => {
    if (!cameraDebug) return;

    const payload = [
      `position: [${cameraDebug.position.x}, ${cameraDebug.position.y}, ${cameraDebug.position.z}]`,
      `target: [${cameraDebug.target.x}, ${cameraDebug.target.y}, ${cameraDebug.target.z}]`,
    ].join("\n");

    try {
      await navigator.clipboard.writeText(payload);
      setCameraCopied(true);
    } catch {
      setCameraCopied(false);
    }
  };

  if (mode === "catalog") {
    return (
      <section className="space-y-5">
        <header className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#255d74]/10 text-[#255d74]">
            <Layers3 className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[#255d74]">Model Center</h1>
            <p className="text-sm text-[#255d74]/65">
              Guided 3D assembly - Sonar Radar
            </p>
          </div>
        </header>

        <article className="rounded-[1.75rem] border border-[#255d74]/12 bg-white p-5 shadow-sm">
          <div className="grid gap-5 lg:grid-cols-[340px_minmax(0,1fr)]">
            <div className="relative h-[240px] overflow-hidden rounded-2xl border border-[#255d74]/10 bg-slate-100">
              <Image
                src={catalogPreviewSrc}
                alt="Sonar Radar"
                fill
                sizes="340px"
                className="object-contain scale-[0.86]"
                onError={() => {
                  if (catalogPreviewSrc !== lessonGuideImages.story) {
                    setCatalogPreviewSrc(lessonGuideImages.story);
                  }
                }}
              />
            </div>

            <div className="space-y-4">
              <span className="inline-flex rounded-full bg-indigo-100 px-3 py-1 text-xs font-semibold text-indigo-700">
                uKit Advanced
              </span>
              <h2 className="text-2xl font-bold text-[#255d74]">Sonar Radar</h2>
              <p className="text-sm leading-relaxed text-[#255d74]/75">
                Mode belajar step-by-step. Klik Next untuk menggerakkan satu
                aksi assembly ke posisi final. Satu step bisa berisi satu atau
                beberapa part yang memang dipasang bersamaan.
              </p>
              {lessonLoading ? (
                <p className="text-xs text-[#255d74]/60">
                  Sinkronisasi data lesson...
                </p>
              ) : lessonError ? (
                <p className="text-xs text-rose-500">
                  Lesson API bermasalah: {lessonError}
                </p>
              ) : null}
              <div className="flex flex-wrap gap-2 text-xs text-[#255d74]/70">
                <span className="rounded-full border border-[#255d74]/20 px-2 py-1">
                  {lessonTotalSteps} steps
                </span>
                <span className="rounded-full border border-[#255d74]/20 px-2 py-1">
                  GLB + named parts
                </span>
                <span className="rounded-full border border-[#255d74]/20 px-2 py-1">
                  GSAP animation
                </span>
              </div>
              <button
                onClick={openIntroModal}
                disabled={!lessonReady}
                className="inline-flex items-center rounded-xl bg-[#255d74] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#1d4d61] disabled:cursor-not-allowed disabled:opacity-60"
              >
                Buka Modul Sonar Radar
              </button>
            </div>
          </div>
        </article>

        <div
          className={`fixed inset-0 z-[60] transition-opacity ${
            introOpen
              ? "pointer-events-auto opacity-100"
              : "pointer-events-none opacity-0"
          }`}
          style={{ transitionDuration: `${INTRO_MODAL_TRANSITION_MS}ms` }}
        >
          <div
            className="absolute inset-0 bg-[#0d1822]/38 backdrop-blur-[2px]"
            onClick={() => setIntroOpen(false)}
          />

          <div className="absolute inset-0 flex items-center justify-center px-4 py-6 md:px-8">
            <div
              className={`relative w-full max-w-[980px] rounded-[1.7rem] border border-white/80 bg-[#f7f8fa] shadow-[0_20px_55px_rgba(24,44,62,0.18)] transition-[opacity,transform] ${
                introOpen
                  ? "opacity-100 translate-y-0 scale-100"
                  : "opacity-0 translate-y-4 scale-[0.985]"
              }`}
              style={{ transitionDuration: `${INTRO_MODAL_TRANSITION_MS}ms` }}
            >
              <button
                onClick={() => setIntroOpen(false)}
                className="absolute right-4 top-4 z-10 flex h-11 w-11 items-center justify-center rounded-full bg-[#e8edf3] text-[#f07f72] transition hover:bg-[#dfe7ef]"
                aria-label="Tutup popup sonar radar"
              >
                <X className="h-5 w-5" />
              </button>

              <div className="grid gap-5 p-5 md:grid-cols-[260px_minmax(0,1fr)] md:p-7 lg:gap-7 lg:p-8">
                <div className="flex flex-col items-center justify-center gap-3">
                  <div className="relative flex h-[212px] w-[212px] items-center justify-center rounded-full bg-[#62ace8] shadow-inner">
                    <div className="absolute left-0 top-5 flex h-14 w-14 items-center justify-center rounded-full bg-[#b4c8dd] text-[1.45rem] font-semibold text-white shadow-sm">
                      3D
                    </div>
                    <div className="relative h-[134px] w-[134px] overflow-hidden rounded-full bg-white/78">
                      <Image
                        src={catalogPreviewSrc}
                        alt="Preview modul Sonar Radar"
                        fill
                        sizes="134px"
                        className="object-contain scale-[0.84]"
                        onError={() => {
                          if (catalogPreviewSrc !== lessonGuideImages.story) {
                            setCatalogPreviewSrc(lessonGuideImages.story);
                          }
                        }}
                      />
                    </div>
                  </div>
                </div>

                <div className="flex min-h-[360px] flex-col">
                  <div className="pr-8">
                    <h2 className="text-center text-[2.3rem] font-semibold tracking-tight text-[#1e2330] md:text-left">
                      {lessonIntro.title}
                    </h2>
                  </div>

                  <div className="mt-4 flex-1 space-y-4 overflow-y-auto pr-1 text-[#1e2330] md:max-h-[320px]">
                    <p className="text-[1rem] leading-[1.65]">
                      {lessonIntro.description}
                    </p>

                    <div className="space-y-2.5 text-[15px] leading-[1.65]">
                      {lessonIntro.outcomes.map((item) => (
                        <p key={item}>{item}</p>
                      ))}
                    </div>
                  </div>

                  <div className="mt-5 flex justify-center md:justify-start">
                    <button
                      onClick={openWorkspace}
                      className="inline-flex min-w-[220px] items-center justify-center rounded-full bg-[linear-gradient(90deg,#5860e6_0%,#7f9bf9_100%)] px-6 py-3.5 text-[1.05rem] font-semibold text-white shadow-[0_14px_24px_rgba(93,111,229,0.22)] transition hover:brightness-105"
                    >
                      Start Building
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section
      className={`fixed inset-0 z-[70] bg-[#c7d7e1] transition-[opacity,transform] duration-300 ease-out ${
        workspaceVisible
          ? "opacity-100 scale-100"
          : "pointer-events-none opacity-0 scale-[1.015]"
      }`}
      style={{ transitionDuration: `${WORKSPACE_TRANSITION_MS}ms` }}
    >
      <div className="absolute inset-0 bg-[linear-gradient(90deg,#dff1f2_0%,#f1eee1_100%)]" />

      {showSceneSkeleton ? (
        <div className="pointer-events-none absolute inset-0 z-20">
          <div className="absolute inset-0 bg-[#d8e5eb]/26 backdrop-blur-[2px]" />
          <div className="absolute left-1/2 top-7 h-6 w-32 -translate-x-1/2 animate-pulse rounded-full bg-[#d4e1e8]" />
          <div className="absolute inset-x-2 top-24 bottom-4 animate-pulse rounded-[2rem] bg-[#c1d2dc]/86 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.3)]" />
          <div className="absolute left-6 top-34 hidden h-[388px] w-[272px] animate-pulse rounded-[1.75rem] bg-[#e6eef3] md:block" />
          <div className="absolute right-6 top-34 hidden h-[250px] w-[250px] animate-pulse rounded-[1.75rem] bg-[#e6eef3] xl:block" />
          <div className="absolute left-1/2 top-1/2 h-[24vh] w-[min(28vw,360px)] -translate-x-1/2 -translate-y-[52%] animate-pulse rounded-[2rem] bg-white/20" />
          <div className="absolute bottom-10 left-6 right-6 h-20 animate-pulse rounded-[1.75rem] bg-[#e6eef3]" />
        </div>
      ) : null}

      <div className="absolute inset-x-0 top-0 z-30 h-20 px-4 py-4 md:px-6">
        <button
          onClick={closeWorkspace}
          className="absolute left-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-[#53c6dd] text-white shadow-[0_10px_22px_rgba(66,149,171,0.22)] transition hover:bg-[#47b5ca] md:left-6"
          aria-label="Kembali ke model center"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>

        <div className="absolute left-1/2 top-3.5 -translate-x-1/2 text-center">
          <p className="text-[1.55rem] font-semibold tracking-tight text-[#5d7990]">
            Sonar Radar
          </p>
          <p className="text-[10px] uppercase tracking-[0.28em] text-[#7b92a3]">
            {currentPack.title}
          </p>
        </div>
      </div>

      <div className="absolute inset-x-2 top-20 bottom-4 overflow-hidden rounded-[2rem] bg-[#c2d3dc] shadow-[0_18px_45px_rgba(94,121,138,0.18)]">
        <div
          ref={canvasHostRef}
          className="absolute inset-0 overflow-hidden bg-transparent"
        />

        <aside className="absolute left-6 top-8 z-30 hidden w-[272px] overflow-hidden rounded-[1.8rem] bg-[#eef4f8]/94 shadow-[0_14px_34px_rgba(93,117,134,0.12)] md:block">
          <div className="p-5">
            <div className="text-[2.2rem] font-light leading-none tracking-tight text-[#6b8190]">
              <span className="text-[#f2b324]">{upcomingStepNumber}</span>/
              {stepState.totalSteps}
            </div>

            {currentPart ? (
              <div className="mt-6 flex items-start gap-4">
                <div
                  className={`flex h-[76px] w-[76px] shrink-0 items-center justify-center rounded-[1.2rem] ${currentPart.previewBg}`}
                >
                  <PartPreview3D
                    file={currentPart.stlFile}
                    color={currentPart.accent}
                    rotation={currentPart.previewRotation}
                    className="h-16 w-16"
                  />
                </div>

                <div className="min-w-0 pt-1">
                  <p className="text-[1.65rem] font-light leading-none text-slate-900">
                    x{currentStepQuantity || 1}
                  </p>
                  <p className="mt-3 text-[1.55rem] font-medium leading-none text-[#5d7790]">
                    {currentPart.code}
                  </p>
                  <p className="mt-2 text-[13px] font-semibold text-[#255d74]">
                    {currentPart.name}
                  </p>
                </div>
              </div>
            ) : (
              <div className="mt-6 rounded-[1.2rem] bg-white/72 p-4 text-sm text-[#255d74]/65">
                {currentPartEmptyMessage}
              </div>
            )}

            <div className="mt-6">
              <p className="text-[11px] uppercase tracking-[0.2em] text-[#7c92a2]">
                Current Step
              </p>
              <p className="mt-2 text-[13px] leading-relaxed text-[#5a7487]">
                {currentInstruction}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setPartsListOpen(true)}
            className="flex w-full items-center justify-center gap-2 bg-[#8ca3b6] px-4 py-3 text-white transition hover:bg-[#8098ac]"
          >
            <Layers3 className="h-3.5 w-3.5" />
            <span className="text-[1.35rem] font-medium tracking-tight">
              Parts List
            </span>
          </button>
        </aside>

        <div className="absolute right-6 top-8 z-30 hidden xl:block">
          {showReferenceCard ? (
            <div className="relative w-[250px] overflow-hidden rounded-[1.8rem] bg-[#eef4f8]/94 shadow-[0_14px_34px_rgba(93,117,134,0.12)]">
              <button
                onClick={() => setShowReferenceCard(false)}
                className="absolute right-3 top-3 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-white/86 text-[#7290a4] shadow-sm transition hover:bg-white"
                aria-label="Sembunyikan preview assembly"
              >
                <EyeOff className="h-4 w-4" />
              </button>

              <div className="relative aspect-square">
                <Image
                  src={workspacePreviewSrc}
                  alt="Preview assembly Sonar Radar"
                  fill
                  sizes="300px"
                  className="object-contain scale-[0.86]"
                  onError={() => {
                  if (workspacePreviewSrc !== lessonGuideImages.story) {
                    setWorkspacePreviewSrc(lessonGuideImages.story);
                  }
                  }}
                />
              </div>
            </div>
          ) : (
            <button
              onClick={() => setShowReferenceCard(true)}
              className="flex h-11 w-11 items-center justify-center rounded-full bg-[#eef4f8]/96 text-[#7290a4] shadow-[0_10px_22px_rgba(93,117,134,0.14)] transition hover:bg-white"
              aria-label="Tampilkan preview assembly"
            >
              <Eye className="h-4.5 w-4.5" />
            </button>
          )}
        </div>

        {transformDebugEnabled ? (
          <div className="absolute bottom-28 right-6 z-30 hidden w-[280px] xl:block">
            {debugOpen ? (
              <div className="overflow-hidden rounded-[1.55rem] border border-white/75 bg-[#eef4f8]/96 shadow-[0_14px_34px_rgba(93,117,134,0.12)]">
              <div className="flex items-center justify-between border-b border-[#dce5eb] px-4 py-3">
                <div>
                  <p className="text-[12px] font-semibold uppercase tracking-[0.18em] text-[#7b92a3]">
                    Transform Debug
                  </p>
                  <p className="mt-1 text-[12px] text-[#5f788b]">
                    Edit live, lalu kirim nilainya ke aku.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setDebugOpen(false)}
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-white/85 text-[#7290a4] shadow-sm transition hover:bg-white"
                  aria-label="Sembunyikan panel debug transform"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="space-y-4 px-4 py-4">
                <div className="space-y-2">
                  <label className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#7b92a3]">
                    Part aktif
                  </label>
                  <select
                    value={selectedDebugPartName}
                    onChange={(event) => {
                      const nextPartName = event.target.value;
                      setSelectedDebugPartName(nextPartName);
                      syncDebugTransform(nextPartName);
                    }}
                    className="w-full rounded-xl border border-[#d7e1e8] bg-white px-3 py-2 text-sm text-[#3a5568] outline-none transition focus:border-[#53c6dd]"
                  >
                    {currentDebugPartNames.length ? (
                      currentDebugPartNames.map((partName) => (
                        <option key={partName} value={partName}>
                          {radarLessonRuntime.getDebugPartLabel(partName)}
                        </option>
                      ))
                    ) : (
                      <option value="">Tidak ada part aktif</option>
                    )}
                  </select>
                </div>

                {debugTransform ? (
                  <>
                    <div className="space-y-2">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#7b92a3]">
                        Position
                      </p>
                      <div className="grid grid-cols-3 gap-2">
                        {(["x", "y", "z"] as const).map((axis) => (
                          <label key={`position-${axis}`} className="space-y-1">
                            <span className="block text-[11px] uppercase tracking-[0.14em] text-[#91a4b1]">
                              {axis}
                            </span>
                            <input
                              type="number"
                              step="0.01"
                              value={debugTransform.position[axis]}
                              onChange={(event) =>
                                handleDebugPositionChange(axis, event.target.value)
                              }
                              className="w-full rounded-xl border border-[#d7e1e8] bg-white px-2 py-2 text-sm text-[#3a5568] outline-none transition focus:border-[#53c6dd]"
                            />
                          </label>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#7b92a3]">
                          Rotation
                        </p>
                        <p className="text-[11px] text-[#91a4b1]">radian</p>
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                        {(["x", "y", "z"] as const).map((axis) => (
                          <label key={`rotation-${axis}`} className="space-y-1">
                            <span className="block text-[11px] uppercase tracking-[0.14em] text-[#91a4b1]">
                              {axis}
                            </span>
                            <input
                              type="number"
                              step="0.01"
                              value={debugTransform.rotation[axis]}
                              onChange={(event) =>
                                handleDebugRotationChange(axis, event.target.value)
                              }
                              className="w-full rounded-xl border border-[#d7e1e8] bg-white px-2 py-2 text-sm text-[#3a5568] outline-none transition focus:border-[#53c6dd]"
                            />
                          </label>
                        ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                      {(["x", "y", "z"] as const).map((axis) => (
                        <button
                          key={`flip-${axis}`}
                          type="button"
                          onClick={() => handleDebugRotationFlip(axis)}
                          className="rounded-xl bg-white px-3 py-2 text-sm font-medium text-[#4d697e] shadow-sm transition hover:bg-[#f8fbfd]"
                        >
                          Flip {axis.toUpperCase()}
                        </button>
                      ))}
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={resetDebugPart}
                        className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-3 py-2 text-sm font-medium text-[#4d697e] shadow-sm transition hover:bg-[#f8fbfd]"
                      >
                        <RotateCcw className="h-4 w-4" />
                        Reset
                      </button>
                      <button
                        type="button"
                        onClick={copyDebugValues}
                        className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#53c6dd] px-3 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-[#49b7cd]"
                      >
                        <Copy className="h-4 w-4" />
                        {debugCopied ? "Copied" : "Copy"}
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="rounded-xl bg-white/72 px-3 py-3 text-sm text-[#5f788b]">
                    Belum ada part yang bisa diedit pada step ini.
                  </div>
                )}

                <div className="border-t border-[#dce5eb] pt-4">
                  <div className="flex items-center justify-between">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#7b92a3]">
                      Camera
                    </p>
                    <button
                      type="button"
                      onClick={syncCameraDebugState}
                      className="rounded-xl bg-white px-3 py-2 text-sm font-medium text-[#4d697e] shadow-sm transition hover:bg-[#f8fbfd]"
                    >
                      Read View
                    </button>
                  </div>

                  {cameraDebug ? (
                    <div className="mt-3 space-y-4">
                      <div className="space-y-2">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#7b92a3]">
                          Position
                        </p>
                        <div className="grid grid-cols-3 gap-2">
                          {(["x", "y", "z"] as const).map((axis) => (
                            <label key={`camera-position-${axis}`} className="space-y-1">
                              <span className="block text-[11px] uppercase tracking-[0.14em] text-[#91a4b1]">
                                {axis}
                              </span>
                              <input
                                type="number"
                                step="0.01"
                                value={cameraDebug.position[axis]}
                                onChange={(event) =>
                                  handleCameraDebugChange(
                                    "position",
                                    axis,
                                    event.target.value,
                                  )
                                }
                                className="w-full rounded-xl border border-[#d7e1e8] bg-white px-2 py-2 text-sm text-[#3a5568] outline-none transition focus:border-[#53c6dd]"
                              />
                            </label>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#7b92a3]">
                          Target
                        </p>
                        <div className="grid grid-cols-3 gap-2">
                          {(["x", "y", "z"] as const).map((axis) => (
                            <label key={`camera-target-${axis}`} className="space-y-1">
                              <span className="block text-[11px] uppercase tracking-[0.14em] text-[#91a4b1]">
                                {axis}
                              </span>
                              <input
                                type="number"
                                step="0.01"
                                value={cameraDebug.target[axis]}
                                onChange={(event) =>
                                  handleCameraDebugChange(
                                    "target",
                                    axis,
                                    event.target.value,
                                  )
                                }
                                className="w-full rounded-xl border border-[#d7e1e8] bg-white px-2 py-2 text-sm text-[#3a5568] outline-none transition focus:border-[#53c6dd]"
                              />
                            </label>
                          ))}
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-2">
                        <button
                          type="button"
                          onClick={syncCameraDebugState}
                          className="rounded-xl bg-white px-3 py-2 text-sm font-medium text-[#4d697e] shadow-sm transition hover:bg-[#f8fbfd]"
                        >
                          Refresh
                        </button>
                        <button
                          type="button"
                          onClick={() => applyCameraDebugState(cameraDebug)}
                          className="rounded-xl bg-white px-3 py-2 text-sm font-medium text-[#4d697e] shadow-sm transition hover:bg-[#f8fbfd]"
                        >
                          Apply
                        </button>
                        <button
                          type="button"
                          onClick={resetCameraDebug}
                          className="rounded-xl bg-white px-3 py-2 text-sm font-medium text-[#4d697e] shadow-sm transition hover:bg-[#f8fbfd]"
                        >
                          Reset
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={copyCameraDebugValues}
                        className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#53c6dd] px-3 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-[#49b7cd]"
                      >
                        <Copy className="h-4 w-4" />
                        {cameraCopied ? "Camera Copied" : "Copy Camera"}
                      </button>
                    </div>
                  ) : (
                    <div className="mt-3 rounded-xl bg-white/72 px-3 py-3 text-sm text-[#5f788b]">
                      Kamera belum siap dibaca.
                    </div>
                  )}
                </div>
              </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setDebugOpen(true)}
                className="ml-auto flex h-11 w-11 items-center justify-center rounded-full bg-[#eef4f8]/96 text-[#7290a4] shadow-[0_10px_22px_rgba(93,117,134,0.14)] transition hover:bg-white"
                aria-label="Tampilkan panel debug transform"
              >
                <SlidersHorizontal className="h-4.5 w-4.5" />
              </button>
            )}
          </div>
        ) : null}

        <div className="absolute bottom-5 left-5 right-5 z-30">
          <div className="flex items-center gap-4">
            <button
              onClick={handlePrev}
              disabled={
                !sceneReady ||
                !stepState.currentStepIndex ||
                stepState.isAnimating
              }
              className="flex h-[54px] w-[54px] shrink-0 items-center justify-center rounded-full bg-[#eef4f8] text-[#8698a5] shadow-sm transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-45"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>

            <div className="flex-1 rounded-[1.6rem] bg-[#eef4f8]/94 px-5 py-4 shadow-[0_14px_28px_rgba(93,117,134,0.12)]">
              <button
                type="button"
                onClick={async (event) => {
                  const rect = event.currentTarget.getBoundingClientRect();
                  const ratio = (event.clientX - rect.left) / rect.width;
                  await jumpToSequenceRatio(ratio);
                }}
                disabled={!sceneReady || stepState.isAnimating}
                className="relative block h-7 w-full overflow-visible rounded-full bg-[#f9fbfd] disabled:cursor-not-allowed"
              >
                <span
                  className="absolute inset-y-0 left-0 rounded-full bg-[#53c6dd]"
                  style={{ width: `${sequenceHandlePercent}%` }}
                />

                {sequenceMarkers.map((marker) => (
                  <span
                    key={marker}
                    className="absolute top-1/2 h-7 w-1 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#d5dce1]"
                    style={{ left: `${marker}%` }}
                  />
                ))}

                <span
                  className="absolute top-1/2 flex h-[60px] w-8 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-[#98d13a] shadow-[0_8px_18px_rgba(133,186,47,0.24)]"
                  style={{ left: `${sequenceHandlePercent}%` }}
                >
                  <span className="flex flex-col gap-3.5">
                    <span className="h-3 w-3 rounded-full bg-white" />
                    <span className="h-3 w-3 rounded-full bg-white" />
                  </span>
                </span>
              </button>
            </div>

            <button
              onClick={handleNext}
              disabled={
                !sceneReady ||
                stepState.currentStepIndex >= stepState.totalSteps ||
                stepState.isAnimating
              }
              className="flex h-[54px] w-[54px] shrink-0 items-center justify-center rounded-full bg-[#eef4f8] text-[#8698a5] shadow-sm transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-45"
            >
              <ChevronRight className="h-6 w-6" />
            </button>
          </div>
        </div>

        {partsListOpen ? (
          <div className="absolute inset-0 z-40">
            <div
              className="absolute inset-0 bg-[#d5e2e8]/82 backdrop-blur-[4px]"
              onClick={() => setPartsListOpen(false)}
            />

            <div className="absolute inset-0 p-4 md:p-6">
              <div className="flex h-full flex-col overflow-hidden rounded-[2rem] border border-white/70 bg-white/96 shadow-[0_18px_40px_rgba(94,121,138,0.18)]">
                <div className="flex items-center justify-between border-b border-[#d8e1e8] px-5 py-4 md:px-7">
                  <button
                    type="button"
                    onClick={() => setPartsListOpen(false)}
                    className="flex h-10 w-10 items-center justify-center rounded-full bg-[#53c6dd] text-white shadow-[0_10px_22px_rgba(66,149,171,0.22)] transition hover:bg-[#47b5ca]"
                    aria-label="Tutup parts list"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>

                  <div className="text-center">
                    <p className="text-[1.45rem] font-semibold tracking-tight text-[#5d7990]">
                      Parts List
                    </p>
                    <p className="text-[10px] uppercase tracking-[0.26em] text-[#8ca0af]">
                      {lessonParts.length} jenis /{" "}
                      {lessonParts.reduce(
                        (total, part) => total + part.qty,
                        0,
                      )}{" "}
                      total pieces
                    </p>
                  </div>

                  <div className="w-10" />
                </div>

                <div className="flex-1 overflow-y-auto px-5 py-5 md:px-7 md:py-6">
                  <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
                    {lessonParts.map((part) => (
                      <article
                        key={part.id}
                        className={`rounded-[1.6rem] border px-4 py-5 shadow-sm transition ${
                          currentPart?.id === part.id
                            ? "border-[#53c6dd]/60 bg-white ring-1 ring-[#53c6dd]/30"
                            : "border-[#e6edf2] bg-transparent"
                        }`}
                      >
                        <div
                          className={`mx-auto flex h-28 w-28 items-center justify-center rounded-[1.35rem] ${part.previewBg}`}
                        >
                          <span
                            className="text-[1.45rem] font-semibold tracking-tight"
                            style={{ color: part.accent }}
                          >
                            {part.code}
                          </span>
                        </div>

                        <div className="mt-4 text-center">
                          <p className="text-[1.1rem] font-medium tracking-tight text-[#304f64]">
                            {part.code}
                          </p>
                          <p className="mt-1 text-sm text-[#688093]">
                            {part.name}
                          </p>
                          <p className="mt-3 text-[1.35rem] font-light text-slate-900">
                            x{part.qty}
                          </p>
                        </div>
                      </article>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : null}
      </div>

      {sceneError ? (
        <div className="absolute left-1/2 top-24 z-40 w-[min(92vw,420px)] -translate-x-1/2 rounded-2xl bg-rose-50/95 px-4 py-3 text-sm text-rose-700 shadow-lg backdrop-blur">
          {sceneError}
        </div>
      ) : null}
    </section>
  );
}
