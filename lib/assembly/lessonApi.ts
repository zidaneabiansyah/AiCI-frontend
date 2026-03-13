import type { CameraPreset } from "@/lib/assembly/AssemblyScene";
import type { AssemblyStep } from "@/lib/assembly/types";
import type {
  RadarGuideImages,
  RadarIntroContent,
  RadarLearningStepSpec,
  RadarPart,
  RadarPartPack,
  RadarStepRuntimeBehavior,
} from "@/lib/assembly/radarLessonTypes";

const DEFAULT_API_BASE = "http://localhost:5001/api/v1";

function getApiBase() {
  const base = process.env.NEXT_PUBLIC_3D_ENGINE_URL || DEFAULT_API_BASE;
  return base.replace(/\/+$/, "");
}

function getApiKey() {
  return process.env.NEXT_PUBLIC_3D_ENGINE_KEY;
}

async function apiFetch<T>(path: string): Promise<T> {
  const url = `${getApiBase()}${path}`;
  const headers: HeadersInit = {
    "Content-Type": "application/json",
  };
  const apiKey = getApiKey();
  if (apiKey) {
    headers["x-api-key"] = apiKey;
  }

  const response = await fetch(url, {
    headers,
    cache: "no-store",
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(
      `Lesson API ${response.status}: ${message || response.statusText}`,
    );
  }

  const payload = (await response.json()) as { data?: T };
  if (payload && typeof payload === "object" && "data" in payload) {
    return payload.data as T;
  }
  return payload as T;
}

export type LessonMetaResponse = {
  lessonId: string;
  title: string;
  totalSteps: number;
  defaultModelUrl: string;
  intro: RadarIntroContent;
  guideImages: RadarGuideImages;
  referencePreviewImage: string;
  transformDebugEnabled: boolean;
  parts: RadarPart[];
  partPacks: RadarPartPack[];
};

export type LessonStepResponse = {
  lessonId: string;
  stepNumber: number;
  partId: RadarPart["id"] | null;
  stepSpec: RadarLearningStepSpec;
  step: AssemblyStep;
  focusPoints: Array<[number, number, number]>;
  cameraPreset: CameraPreset & { id?: string };
  visibility: { show: string[]; hide: string[] };
  instructions: { id: string; en: string };
  runtimeBehavior: RadarStepRuntimeBehavior | null;
};

export type LessonNavigationResponse = {
  lessonId: string;
  from: number;
  to: number;
  action: "next" | "prev";
  totalSteps: number;
  cameraPresetStep: number | null;
  hidePartNamesBeforeNext: string[];
};

export async function fetchLessonMeta(
  lessonId: string,
): Promise<LessonMetaResponse> {
  return apiFetch<LessonMetaResponse>(`/lessons/${lessonId}`);
}

export async function fetchLessonStep(
  lessonId: string,
  stepNumber: number,
): Promise<LessonStepResponse> {
  return apiFetch<LessonStepResponse>(
    `/lessons/${lessonId}/steps/${stepNumber}`,
  );
}

export async function fetchLessonNavigation(
  lessonId: string,
  stepNumber: number,
  action: "next" | "prev",
): Promise<LessonNavigationResponse> {
  return apiFetch<LessonNavigationResponse>(
    `/lessons/${lessonId}/steps/${stepNumber}/navigate?action=${action}`,
  );
}

export async function fetchAllLessonSteps(
  lessonId: string,
  totalSteps: number,
): Promise<LessonStepResponse[]> {
  const responses: LessonStepResponse[] = [];
  for (let stepNumber = 1; stepNumber <= totalSteps; stepNumber += 1) {
    // Sequential fetch keeps ordering stable and is easier to debug.
    // If this becomes too slow, we can parallelize with a small concurrency limit.
    // eslint-disable-next-line no-await-in-loop
    const payload = await fetchLessonStep(lessonId, stepNumber);
    responses.push(payload);
  }
  return responses;
}
