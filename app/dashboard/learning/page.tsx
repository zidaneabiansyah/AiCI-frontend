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
  type CameraPreset,
} from "@/lib/assembly/AssemblyScene";
import { PartPreview3D } from "@/app/dashboard/learning/PartPreview3D";
import {
  AssemblyStep,
  StepOffset,
  StepStateSnapshot,
} from "@/lib/assembly/types";

type RadarPart = {
  id: string;
  code: string;
  name: string;
  qty: number;
  note: string;
  previewBg: string;
  accent: string;
  stlFile: string;
  previewRotation?: [number, number, number];
};

type RadarLearningStepSpec = {
  partId: RadarPart["id"] | null;
  quantity: number;
  partIndexes: number[];
  customParts?: Array<{
    name: string;
    startOffset?: StepOffset;
    targetOffset?: StepOffset;
    targetPosition?: [number, number, number];
    targetRotation?: [number, number, number];
    disableHighlight?: boolean;
  }>;
  instruction: string;
  hidePartIndexesBeforeStart?: number[];
  hidePartIndexesOnComplete?: number[];
  hidePartNamesOnComplete?: string[];
  partOverrides?: Partial<
    Record<
      number,
      {
        startOffset?: StepOffset;
        targetOffset?: StepOffset;
        targetPosition?: [number, number, number];
        targetRotation?: [number, number, number];
      }
    >
  >;
};

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
const RADAR_REFERENCE_PREVIEW_IMAGE =
  "/learning/radar/guide/radar-right-preview.png";
const RADAR_BASE_STAND_PART_NAME = "radar_step_base_stand";
const RADAR_HEAD_CONTROL_PART_NAME = "radar_step_head_control";
const RADARBOT_1_PART_NAME = "radarbot_1";
const RADAR_HEAD_PART_NAME = "radar_head";
const RADAR_BEAM9_PART_NAME = "radar_step_37";
const RADAR_TRANSFORM_DEBUG_ENABLED = false;

const GUIDE_IMAGES = {
  story: "/learning/radar/guide/radar-02.png",
  progressive1: "/learning/radar/guide/guide1.png",
};

const RADAR_INTRO = {
  title: "Sonar Radar",
  description:
    "Bangun modul radar berbasis sensor secara bertahap. Anda akan merakit frame utama, connector tengah, panel samping, dan pengunci akhir sampai struktur radar lengkap dan siap dipelajari lebih lanjut.",
  outcomes: [
    "Kenali urutan assembly part inti dan posisi tiap connector pada struktur radar.",
    "Latih ketelitian membaca orientasi part, arah masuk, dan alignment antar frame.",
    "Gunakan workspace 3D untuk mengikuti step satu per satu sampai assembly final.",
  ],
};

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

function getDebugPartLabel(partName: string): string {
  if (partName === RADAR_MC_PART_NAME) return "MC";
  if (partName === RADAR_BASE_STAND_PART_NAME) return "BASE STAND";
  if (partName === RADAR_HEAD_CONTROL_PART_NAME) return "HEAD CONTROL";
  if (partName === RADARBOT_1_PART_NAME) return "RADARBOT_1";
  if (partName === RADAR_HEAD_PART_NAME) return "RADAR HEAD";
  return partName.replace("radar_step_", "step_");
}

function getWorkspacePreviewImage(stepNumber: number): string {
  if (stepNumber <= 26) return GUIDE_IMAGES.progressive1;
  return RADAR_REFERENCE_PREVIEW_IMAGE;
}

const RADAR_PARTS: RadarPart[] = [
  {
    id: "mc",
    code: "MC",
    name: "Main Controller",
    qty: 1,
    note: "Unit kontrol utama radar.",
    previewBg: "bg-[#edf1f4]",
    accent: "#9aa6b2",
    stlFile: "MC.obj",
    previewRotation: [-0.2, 0.62, 0],
  },
  {
    id: "p70",
    code: "P70",
    name: "Frame utama",
    qty: 2,
    note: "Dua frame kuning utama pada inti radar.",
    previewBg: "bg-[#fff1bf]",
    accent: "#d29a00",
    stlFile: "P70_version-1.STL",
    previewRotation: [-0.9, 0.15, 0],
  },
  {
    id: "fixed",
    code: "2780",
    name: "Fixed connector",
    qty: 44,
    note: "Pin merah samping, atas, bawah, tengah, dan lock depan.",
    previewBg: "bg-[#ffe0e0]",
    accent: "#d9485f",
    stlFile: "2780_fixed.stl",
    previewRotation: [0.5, 0.9, -0.25],
  },
  {
    id: "c11",
    code: "C11",
    name: "Konektor tengah",
    qty: 3,
    note: "Connector pusat dan connector tambahan di cluster atas.",
    previewBg: "bg-[#fff1bf]",
    accent: "#d29a00",
    stlFile: "C11.STL",
    previewRotation: [0.45, 0.75, 0],
  },
  {
    id: "s06",
    code: "S06",
    name: "Sensor S06",
    qty: 1,
    note: "Modul sensor S06 di depan cluster C11 dan fixed atas.",
    previewBg: "bg-[#e8f8ff]",
    accent: "#4fb8d3",
    stlFile: "S06.obj",
    previewRotation: [-0.12, 0.55, 0],
  },
  {
    id: "s05",
    code: "S05",
    name: "Sensor S05",
    qty: 2,
    note: "Dua modul S05 di sisi kiri dan kanan depan cluster fixed terakhir.",
    previewBg: "bg-[#e8f8ff]",
    accent: "#35b7d6",
    stlFile: "S05.obj",
    previewRotation: [-0.08, 0.62, 0],
  },
  {
    id: "s03",
    code: "S03",
    name: "Sensor S03",
    qty: 1,
    note: "Modul sensor S03 untuk tahap akhir assembly kepala radar.",
    previewBg: "bg-[#e8f8ff]",
    accent: "#3db3cf",
    stlFile: "S03.obj",
    previewRotation: [-0.08, 0.62, 0],
  },
  {
    id: "p72",
    code: "P72",
    name: "Panel samping",
    qty: 4,
    note: "Panel abu-abu pengapit empat sisi assembly.",
    previewBg: "bg-[#e7edf2]",
    accent: "#708397",
    stlFile: "P72_version-2.STL",
    previewRotation: [0.25, 0.85, 0],
  },
  {
    id: "p34",
    code: "P34",
    name: "Bracket P34",
    qty: 4,
    note: "Penguat bawah dan penguat area atas.",
    previewBg: "bg-[#eef2f6]",
    accent: "#94a3b8",
    stlFile: "P34.STL",
    previewRotation: [-0.6, 0.55, 0.12],
  },
  {
    id: "p35",
    code: "P35",
    name: "Connector P35",
    qty: 2,
    note: "Penghubung tengah untuk cluster atas dan bawah.",
    previewBg: "bg-[#feebec]",
    accent: "#ef4444",
    stlFile: "P35.STL",
    previewRotation: [-0.55, 0.75, 0],
  },
  {
    id: "p36",
    code: "P36",
    name: "Connector P36",
    qty: 1,
    note: "Connector akhir yang dipasang di depan pasangan fixed baru.",
    previewBg: "bg-[#e7efff]",
    accent: "#2563eb",
    stlFile: "P36.STL",
    previewRotation: [-0.55, 0.75, 0],
  },
  {
    id: "c6",
    code: "C6",
    name: "Connector C6",
    qty: 2,
    note: "Pengunci sisi atas kiri dan kanan.",
    previewBg: "bg-[#fff1bf]",
    accent: "#d4a000",
    stlFile: "C6.STL",
    previewRotation: [0.45, 0.7, 0.2],
  },
  {
    id: "s01",
    code: "S01",
    name: "Sensor S01",
    qty: 1,
    note: "Modul S01 untuk tahap assembly akhir setelah bracket P34.",
    previewBg: "bg-[#e8f8ff]",
    accent: "#4fb8d3",
    stlFile: "S01.obj",
    previewRotation: [-0.08, 0.62, 0],
  },
  {
    id: "radar-head",
    code: "R-HEAD",
    name: "Radar Head",
    qty: 1,
    note: "Subassembly kepala radar yang sudah dilas menjadi satu blok.",
    previewBg: "bg-[#e8f8ff]",
    accent: "#4fb8d3",
    stlFile: "S01.obj",
    previewRotation: [-0.08, 0.62, 0],
  },
  {
    id: "servo",
    code: "SERVO",
    name: "Servo Combined",
    qty: 1,
    note: "Modul servo gabungan untuk assembly radar bagian atas.",
    previewBg: "bg-[#eceff3]",
    accent: "#3d434c",
    stlFile: "SERVO_combined.obj",
    previewRotation: [-0.18, 0.62, 0],
  },
  {
    id: "base-stand",
    code: "BASE",
    name: "Base Stand",
    qty: 1,
    note: "Subassembly dasar yang sudah jadi sebagai satu blok utuh.",
    previewBg: "bg-[#eef5ff]",
    accent: "#6e88a6",
    stlFile: "P70_version-1.STL",
    previewRotation: [-0.55, 0.35, 0],
  },
  {
    id: "head-control",
    code: "HEAD",
    name: "Head Control",
    qty: 1,
    note: "Subassembly kepala radar sebagai satu blok utuh.",
    previewBg: "bg-[#eef4ff]",
    accent: "#6e88a6",
    stlFile: "SERVO_combined.obj",
    previewRotation: [-0.1, 0.5, 0],
  },
  {
    id: "c4",
    code: "C4",
    name: "Connector C4",
    qty: 6,
    note: "Connector kanan luar dan puncak assembly.",
    previewBg: "bg-[#fff1bf]",
    accent: "#d4a000",
    stlFile: "C4.STL",
    previewRotation: [0.4, 0.85, 0.1],
  },
  {
    id: "beam9",
    code: "9H",
    name: "Straight beam 9-hole",
    qty: 1,
    note: "Beam depan sebagai pengunci final.",
    previewBg: "bg-[#e7efff]",
    accent: "#2563eb",
    stlFile: "9holes_Straight_Beam_LEGO_Technic.stl",
    previewRotation: [-0.55, 0.72, 0],
  },
];

const RADAR_PARTS_BY_ID = new Map(
  RADAR_PARTS.map((part) => [part.id, part] as const),
);

const RADAR_PART_PACKS = [
  { id: "intro", title: "Intro", startStep: 1, endStep: 1 },
  { id: "base-1", title: "Frame 1", startStep: 2, endStep: 5 },
  { id: "base-2", title: "Frame 2", startStep: 6, endStep: 9 },
  { id: "center-lock", title: "Center Lock", startStep: 10, endStep: 12 },
  { id: "side-panels", title: "Side Panels", startStep: 13, endStep: 15 },
  { id: "mc-core", title: "Main Controller", startStep: 16, endStep: 21 },
  { id: "lower-support", title: "Lower Support", startStep: 22, endStep: 22 },
  { id: "upper-assembly", title: "Upper Assembly", startStep: 23, endStep: 51 },
];

const RADAR_CAMERA_PRESETS: Array<{
  startStep: number;
  endStep: number;
  preset: CameraPreset;
}> = [
  {
    startStep: 1,
    endStep: 15,
    preset: {
      position: [5.8, 4.6, 7.8],
      target: [0, 0.5, 0.42],
      duration: 0.72,
    },
  },
  {
    startStep: 16,
    endStep: 26,
    preset: {
      position: [3.9, 3.4, 4.8],
      target: [0, 1.3, 0.64],
      duration: 0.72,
    },
  },
  {
    startStep: 27,
    endStep: 27,
    preset: {
      position: [-1.32, 1.159, 4.514],
      target: [-1.05, 1.45, 0.55],
      duration: 0.82,
    },
  },
  {
    startStep: 28,
    endStep: 29,
    preset: {
      position: [2.02, 1.059, 2.24],
      target: [-1.05, 1.45, 0.55],
      duration: 0.82,
    },
  },
  {
    startStep: 30,
    endStep: 31,
    preset: {
      position: [0.933, 2.877, 2.239],
      target: [-0.72, 0.98, 0.22],
      duration: 0.82,
    },
  },
  {
    startStep: 32,
    endStep: 50,
    preset: {
      position: [-2.342, 2.146, 3.865],
      target: [-0.72, 0.98, 0.22],
      duration: 0.82,
    },
  },
];

const RADAR_AUTO_CAMERA_STEP_RANGE = {
  start: 2,
  end: 15,
};

const RADAR_AUTO_CAMERA_OFFSET: [number, number, number] = [2.05, 1.45, 2.61];

const RADAR_FIXED_CAMERA_POSITIONS: Array<{
  position: [number, number, number];
  target?: [number, number, number];
}> = [
  { position: [-2.563, 1.914, -1.197] },
  { position: [2.495, 1.769, 2.059] },
  { position: [1.264, 1.792, -2.946] },
  { position: [-2.889, 1.682, 0.312] },
  { position: [2.723, 2.713, 1.694] },
  { position: [2.232, 2.163, 0.935] },
  { position: [0.017, 2.53, -3.675] },
  { position: [-3.635, 2.1, -0.702] },
  {
    position: [-0.484, 2.069, 4.596],
    target: [0, 0.6, 1.59],
  },
  {
    position: [-0.484, 2.069, 4.596],
    target: [0, 0.6, 1.59],
  },
];

const RADAR_STEP_CAMERA_OVERRIDES = new Map<
  number,
  {
    position: [number, number, number];
    target?: [number, number, number];
  }
>([
  [4, { position: [2.412, 1.596, 1.114], target: [0.45, 0.6, 0.14] }],
  [5, { position: [1.044, 1.585, -2.437], target: [-0.15, 0.55, -0.018] }],
  [7, { position: [-2.556, 1.567, 0.241], target: [-0.095, 0.5, 0.979] }],
  [8, { position: [2.304, 1.356, 1.805], target: [-0.04, 0.39, 0.423] }],
  [9, { position: [-0.575, 1.648, 2.947], target: [0.32, 0.08, 0.489] }],
  [10, { position: [1.859, 2.1, 1.541] }],
  [11, { position: [1.859, 2.1, 1.541] }],
  [12, { position: [1.756, 1.711, 2.057] }],
  [13, { position: [0.744, 1.707, -2.985] }],
  [14, { position: [-3.393, 1.767, 0.048] }],
  [15, { position: [0.651, 2.232, 3.93], target: [0, 0.423, 0.487] }],
  [16, { position: [1.699, 2.812, 3.014], target: [-0.11, 0.59, -0.053] }],
  [17, { position: [1.699, 2.812, 3.014], target: [-0.11, 0.59, -0.053] }],
  [18, { position: [-1.063, 2.096, 2.476], target: [0.22, 1.081, 0.75] }],
  [19, { position: [-1.063, 2.096, 2.476], target: [0.22, 1.081, 0.75] }],
  [20, { position: [1.29, 2.544, -0.251], target: [-0.71, 0.75, 1.125] }],
  [21, { position: [2.254, 2.534, 1.443] }],
  [22, { position: [1.719, 3.078, 1.673], target: [0.38, 1.76, 0.64] }],
  [23, { position: [1.719, 3.078, 1.673], target: [0.38, 1.76, 0.64] }],
  [24, { position: [-1.553, 2.29, -0.576], target: [-0.318, 1.501, 0.528] }],
  [25, { position: [1.596, 2.212, 1.429], target: [0.47, 1.581, 0.527] }],
  [26, { position: [0.568, 2.397, -1.187], target: [-0.16, 1.471, 0.53] }],
  [28, { position: [-1.32, 1.159, 4.514], target: [-1.05, 1.45, 0.55] }],
  [29, { position: [2.02, 1.059, 2.24], target: [-1.05, 1.45, 0.55] }],
  [30, { position: [-0.513, 1.148, 1.847], target: [-1.86, 0.88, 0.53] }],
  [31, { position: [-3.548, 2.793, 2.996], target: [-1.59, 1.16, 0.22] }],
  [32, { position: [-3.548, 2.793, 2.996], target: [-1.59, 1.16, 0.22] }],
  [33, { position: [-1.739, 3.634, 0.037], target: [-2.65, 1.63, 1.77] }],
  [34, { position: [-1.42, 3.449, -1.188], target: [-2.63, 1.76, 0.43] }],
  [35, { position: [-1.42, 3.449, -1.188], target: [-2.63, 1.76, 0.43] }],
  [36, { position: [-3.658, 3.233, -1.387], target: [-2.63, 1.88, 0.1] }],
  [37, { position: [-2.916, 3.49, 1.522], target: [-2.51, 2.32, 0.31] }],
  [39, { position: [1.461, 2.46, -1.1], target: [-0.72, 0.98, 0.22] }],
  [40, { position: [1.461, 2.46, -1.1], target: [-0.72, 0.98, 0.22] }],
  [41, { position: [1.461, 2.46, -1.1], target: [-0.72, 0.98, 0.22] }],
  [42, { position: [1.461, 2.46, -1.1], target: [-0.72, 0.98, 0.22] }],
  [43, { position: [1.503, 3.255, -1.597], target: [-0.72, 0.98, 0.22] }],
  [44, { position: [1.503, 3.255, -1.597], target: [-0.72, 0.98, 0.22] }],
  [45, { position: [-2.434, 3.678, 0.824], target: [-0.72, 0.98, 0.22] }],
  [46, { position: [-2.434, 3.678, 0.824], target: [-0.72, 0.98, 0.22] }],
  [47, { position: [-3.323, 3.209, 1.199], target: [-0.85, 0.95, 0.63] }],
  [48, { position: [-2.278, 4.376, 0.808], target: [-2.02, 1.39, 0.8] }],
  [49, { position: [0.5, 3.224, 1.16], target: [-2.64, -0.11, 0.23] }],
  [50, { position: [0.5, 3.224, 1.16], target: [-2.64, -0.11, 0.23] }],
  [51, { position: [-3.823, 3.308, -2.764], target: [-1.68, 1.24, 0.25] }],
]);

function getRadarCameraPreset(stepNumber: number): CameraPreset {
  return (
    RADAR_CAMERA_PRESETS.find(
      (entry) => stepNumber >= entry.startStep && stepNumber <= entry.endStep,
    )?.preset ?? {
      position: [5, 4, 7.5],
      target: [0, 0.4, 0.25],
      duration: 0.72,
    }
  );
}

const LEGACY_RADAR_START_OFFSETS: Record<number, StepOffset> = {
  1: { x: -0.78, y: 0.02, z: 0 },
  2: { x: -0.78, y: 0.02, z: 0 },
  3: { x: 0.78, y: 0.02, z: 0 },
  4: { x: 0.78, y: 0.02, z: 0 },
  5: { x: 0, y: 0.02, z: -0.78 },
  6: { x: 0, y: 0.02, z: -0.78 },
  7: { x: 0, y: 0.02, z: -0.78 },
  8: { x: 0, y: 0.02, z: 0.18 },
  9: { x: -0.78, y: 0.02, z: 0 },
  10: { x: -0.78, y: 0.02, z: 0 },
  11: { x: 0.78, y: 0.02, z: 0 },
  12: { x: 0.78, y: 0.02, z: 0 },
  13: { x: 0, y: 0.02, z: 0.78 },
  14: { x: 0, y: 0.02, z: 0.78 },
  15: { x: 0, y: 0.02, z: 0.78 },
  16: { x: 0, y: 0.82, z: 0 },
  17: { x: 0, y: 0.82, z: 0 },
  18: { x: 0, y: 0.82, z: 0 },
  19: { x: 0, y: 0.82, z: 0 },
  20: { x: 0, y: 0.88, z: 0 },
  21: { x: 0, y: 0.02, z: -0.82 },
  22: { x: -0.92, y: 0.02, z: 0 },
  23: { x: 0.92, y: 0.02, z: 0 },
  24: { x: 0, y: 0.02, z: 0.82 },
};

const RADAR_MC_PART_NAME = "radar_step_mc";

function formatRadarPhysicalPartName(partIndex: number): string {
  if (partIndex === 0) return RADAR_MC_PART_NAME;
  return `radar_step_${String(partIndex).padStart(2, "0")}`;
}

function getRadarPhysicalStartOffset(
  partIndex: number,
): StepOffset | undefined {
  if (partIndex === 0) {
    return { x: 0, y: 0.92, z: 0 };
  }

  const legacyOffset = LEGACY_RADAR_START_OFFSETS[partIndex - 1];
  return legacyOffset ? { ...legacyOffset } : undefined;
}

const RADAR_PHASE_ONE_PART_INDEXES = Array.from(
  { length: 25 },
  (_, index) => index + 1,
);
const RADAR_HEAD_CONTROL_PART_INDEXES = [0, 33, 34, 40, 41, 42, 43, 44, 45, 46];
const RADAR_FRONT_LOCK_FIXED_PART_INDEXES = [66, 67, 68, 69, 70, 71];
const RADAR_HEAD_SOURCE_PART_INDEXES = [
  29,
  30,
  31,
  32,
  35,
  36,
  37,
  39,
  ...RADAR_FRONT_LOCK_FIXED_PART_INDEXES,
];
const RADARBOT_1_SOURCE_PART_INDEXES = Array.from(
  { length: 19 },
  (_, index) => index + 47,
);
const RADAR_HEAD_HIDE_PART_NAMES = RADAR_HEAD_SOURCE_PART_INDEXES.map(
  (partIndex) => formatRadarPhysicalPartName(partIndex),
);
const RADARBOT_1_HIDE_PART_NAMES = [
  RADARBOT_1_PART_NAME,
  RADAR_BASE_STAND_PART_NAME,
  RADAR_HEAD_CONTROL_PART_NAME,
  ...RADARBOT_1_SOURCE_PART_INDEXES.map((partIndex) =>
    formatRadarPhysicalPartName(partIndex),
  ),
];

const RADAR_LEARNING_STEP_SPECS: RadarLearningStepSpec[] = [
  {
    partId: null,
    quantity: 0,
    partIndexes: [],
    instruction:
      "Amati workspace awal terlebih dahulu. Semua part masih disembunyikan.",
  },
  {
    partId: "p70",
    quantity: 1,
    partIndexes: [1],
    instruction:
      "Mulai dengan menempatkan frame P70 pertama sebagai dasar assembly radar.",
  },
  {
    partId: "fixed",
    quantity: 2,
    partIndexes: [2, 3],
    instruction:
      "Pasang dua fixed connector sisi kiri pada frame pertama sekaligus.",
  },
  {
    partId: "fixed",
    quantity: 2,
    partIndexes: [4, 5],
    instruction: "Pasang dua fixed connector sisi kanan pada frame pertama.",
  },
  {
    partId: "fixed",
    quantity: 3,
    partIndexes: [6, 7, 8],
    instruction:
      "Lengkapi sisi bawah frame pertama dengan tiga fixed connector.",
  },
  {
    partId: "p70",
    quantity: 1,
    partIndexes: [9],
    instruction:
      "Tambahkan frame P70 kedua dan sejajarkan dengan frame pertama.",
  },
  {
    partId: "fixed",
    quantity: 2,
    partIndexes: [10, 11],
    instruction: "Pasang dua fixed connector sisi kiri pada frame kedua.",
  },
  {
    partId: "fixed",
    quantity: 2,
    partIndexes: [12, 13],
    instruction: "Pasang dua fixed connector sisi kanan pada frame kedua.",
  },
  {
    partId: "fixed",
    quantity: 3,
    partIndexes: [14, 15, 16],
    instruction: "Lengkapi sisi atas frame kedua dengan tiga fixed connector.",
  },
  {
    partId: "fixed",
    quantity: 2,
    partIndexes: [17, 18],
    instruction: "Pasang dua fixed connector tengah pada frame pertama.",
  },
  {
    partId: "fixed",
    quantity: 2,
    partIndexes: [19, 20],
    instruction: "Pasang dua fixed connector tengah pada frame kedua.",
  },
  {
    partId: "c11",
    quantity: 1,
    partIndexes: [21],
    instruction: "Turunkan konektor C11 dari atas ke pusat empat fixed tengah.",
  },
  {
    partId: "p72",
    quantity: 1,
    partIndexes: [22],
    instruction: "Pasang panel P72 bagian bawah sebagai penopang luar pertama.",
  },
  {
    partId: "p72",
    quantity: 2,
    partIndexes: [23, 24],
    instruction:
      "Pasang dua panel P72 samping kiri dan kanan untuk mengapit rangka tengah.",
  },
  {
    partId: "p72",
    quantity: 1,
    partIndexes: [25],
    instruction: "Lengkapi sisi atas dengan satu panel P72 terakhir.",
  },
  {
    partId: "mc",
    quantity: 1,
    partIndexes: [0],
    instruction:
      "Munculkan unit MC utama di atas struktur bawah yang sudah siap.",
    hidePartIndexesBeforeStart: RADAR_PHASE_ONE_PART_INDEXES,
    hidePartIndexesOnComplete: RADAR_PHASE_ONE_PART_INDEXES,
  },
  {
    partId: "mc",
    quantity: 1,
    partIndexes: [0],
    instruction:
      "Flip unit MC agar orientasinya berbalik sebelum support bawah dipasang.",
    partOverrides: {
      0: {
        startOffset: { x: 0, y: 0, z: 0 },
        targetRotation: [Math.PI, Math.PI, 0],
      },
    },
  },
  {
    partId: "c4",
    quantity: 2,
    partIndexes: [33, 34],
    instruction:
      "Munculkan dua connector C4 sejajar di atas MC terlebih dahulu, tanpa dipasang dulu.",
    partOverrides: {
      33: {
        startOffset: { x: 0, y: 0, z: 0 },
        targetPosition: [-0.38, 1.52, 0.54],
      },
      34: {
        startOffset: { x: 0, y: 0, z: 0 },
        targetPosition: [0.38, 1.52, 0.54],
      },
    },
  },
  {
    partId: "c4",
    quantity: 2,
    partIndexes: [33, 34],
    instruction:
      "Dorong dua connector C4 ke depan sampai masuk ke posisi final di atas MC.",
  },
  {
    partId: "c6",
    quantity: 2,
    partIndexes: [40, 41],
    instruction:
      "Munculkan dua connector C6 dari sisi kiri dan kanan terlebih dahulu.",
    partOverrides: {
      40: {
        startOffset: { x: 0, y: 0, z: 0 },
        targetPosition: [-0.95, 1.52, 0.67],
      },
      41: {
        startOffset: { x: 0, y: 0, z: 0 },
        targetPosition: [0.96, 1.52, 0.67],
      },
    },
  },
  {
    partId: "c6",
    quantity: 2,
    partIndexes: [40, 41],
    instruction:
      "Geser dua connector C6 dari sisi kiri dan kanan masuk ke arah tengah.",
  },
  {
    partId: "c4",
    quantity: 2,
    partIndexes: [42, 43],
    instruction:
      "Munculkan dua connector C4 berikutnya di area tengah terlebih dahulu.",
    partOverrides: {
      42: {
        startOffset: { x: 0, y: 0, z: 0 },
        targetPosition: [-0.38, 2.05, 0.49],
      },
      43: {
        startOffset: { x: 0, y: 0, z: 0 },
        targetPosition: [0.38, 2.05, 0.49],
      },
    },
  },
  {
    partId: "c4",
    quantity: 2,
    partIndexes: [42, 43],
    instruction:
      "Geser dua connector C4 dari tengah menuju posisi final di layer atas.",
  },
  {
    partId: "c4",
    quantity: 1,
    partIndexes: [44],
    instruction:
      "Munculkan connector C4 pertama dari tengah lalu geser ke posisi final kiri.",
    partOverrides: {
      44: {
        startOffset: { x: 0.35, y: 0, z: 0 },
      },
    },
  },
  {
    partId: "c4",
    quantity: 1,
    partIndexes: [45],
    instruction:
      "Munculkan connector C4 kedua dari tengah lalu geser ke posisi final kanan.",
    partOverrides: {
      45: {
        startOffset: { x: -0.35, y: 0, z: 0 },
      },
    },
  },
  {
    partId: "servo",
    quantity: 1,
    partIndexes: [46],
    instruction:
      "Turunkan modul SERVO combined ke pusat cluster atas sebagai aktuator utama radar.",
    hidePartIndexesOnComplete: RADAR_HEAD_CONTROL_PART_INDEXES,
    partOverrides: {
      46: {
        startOffset: { x: 0, y: 0, z: 0.71 },
      },
    },
  },
  {
    partId: "base-stand",
    quantity: 1,
    partIndexes: [],
    customParts: [
      {
        name: RADAR_BASE_STAND_PART_NAME,
        startOffset: { x: 0, y: 0, z: 0 },
        disableHighlight: true,
      },
      {
        name: RADAR_HEAD_CONTROL_PART_NAME,
        startOffset: { x: 0, y: 0, z: 0 },
        targetPosition: [0, 1.594, 0.55],
        targetRotation: [0, 0, 3.142],
        disableHighlight: true,
      },
    ],
    instruction:
      "Tampilkan kembali blok BASE STAND, lalu flip HEAD CONTROL sampai orientasinya menghadap arah yang benar.",
  },
  {
    partId: "head-control",
    quantity: 1,
    partIndexes: [],
    instruction:
      "Amati orientasi HEAD CONTROL sebentar sebelum digeser ke kiri.",
  },
  {
    partId: "head-control",
    quantity: 1,
    partIndexes: [],
    customParts: [
      {
        name: RADAR_HEAD_CONTROL_PART_NAME,
        targetPosition: [-2.44, 1.594, 0.55],
        targetRotation: [0, 0, 3.142],
      },
    ],
    instruction:
      "Geser HEAD CONTROL ke kiri sampai sejajar dengan blok BASE STAND.",
  },
  {
    partId: "head-control",
    quantity: 1,
    partIndexes: [],
    instruction:
      "Amati hasil posisi HEAD CONTROL terlebih dahulu sebelum connector C11 mulai ditambahkan.",
  },
  {
    partId: "c11",
    quantity: 2,
    partIndexes: [47, 48],
    instruction:
      "Tambahkan dua connector C11 di dekat cluster MC yang sudah jadi sebagai connector atas tambahan.",
    partOverrides: {
      47: {
        startOffset: { x: 0, y: 0.63, z: 0 },
      },
      48: {
        startOffset: { x: 0, y: 0.63, z: 0 },
      },
    },
  },
  {
    partId: "fixed",
    quantity: 4,
    partIndexes: [49, 50, 51, 52],
    instruction:
      "Tambahkan empat fixed connector di depan dua C11 atas, masing-masing dua connector per sisi.",
    partOverrides: {
      49: {
        startOffset: { x: 0, y: 0, z: 0.46 },
      },
      50: {
        startOffset: { x: 0, y: 0, z: 0.46 },
      },
      51: {
        startOffset: { x: 0, y: 0, z: 0.46 },
      },
      52: {
        startOffset: { x: 0, y: 0, z: 0.46 },
      },
    },
  },
  {
    partId: "s06",
    quantity: 1,
    partIndexes: [53],
    instruction:
      "Tambahkan modul S06 di depan cluster empat fixed atas sebagai komponen sensor berikutnya.",
    partOverrides: {
      53: {
        startOffset: { x: 0, y: 0, z: 0.45 },
      },
    },
  },
  {
    partId: "fixed",
    quantity: 4,
    partIndexes: [54, 55, 56, 57],
    instruction:
      "Tambahkan empat fixed connector berikutnya di depan modul S06, masing-masing dua connector per sisi.",
    partOverrides: {
      54: {
        startOffset: { x: -0.43, y: 0, z: 0 },
      },
      55: {
        startOffset: { x: -0.43, y: 0, z: 0 },
      },
      56: {
        startOffset: { x: 0.36, y: 0, z: 0 },
      },
      57: {
        startOffset: { x: 0.36, y: 0, z: 0 },
      },
    },
  },
  {
    partId: "p35",
    quantity: 2,
    partIndexes: [58, 59],
    instruction:
      "Tambahkan dua connector P35 di depan cluster fixed terbaru sebagai penghubung berikutnya.",
    partOverrides: {
      58: {
        startOffset: { x: 0.45, y: 0, z: 0 },
        targetPosition: [-2.01, 2.16, 0.07],
        targetRotation: [0, 0, 0],
      },
      59: {
        startOffset: { x: -0.46, y: 0, z: 0 },
        targetPosition: [-2.87, 2.16, 0.07],
        targetRotation: [0, 0, 3.142],
      },
    },
  },
  {
    partId: "fixed",
    quantity: 4,
    partIndexes: [60, 61, 62, 63],
    instruction:
      "Tambahkan empat fixed connector di depan dua connector P35 baru, masing-masing dua connector per sisi.",
    partOverrides: {
      60: {
        startOffset: { x: 0, y: 0, z: -0.43 },
        targetPosition: [-1.96, 2.16, -0.08],
        targetRotation: [0, 1.55, 3.142],
      },
      61: {
        startOffset: { x: 0, y: 0, z: -0.43 },
        targetPosition: [-2.15, 2.16, -0.08],
        targetRotation: [0, 1.55, 3.142],
      },
      62: {
        startOffset: { x: 0, y: 0, z: -0.43 },
        targetPosition: [-2.73, 2.16, -0.08],
        targetRotation: [0, 1.55, 3.142],
      },
      63: {
        startOffset: { x: 0, y: 0, z: -0.43 },
        targetPosition: [-2.92, 2.16, -0.08],
        targetRotation: [0, 1.55, 3.142],
      },
    },
  },
  {
    partId: "s05",
    quantity: 2,
    partIndexes: [64, 65],
    partOverrides: {
      64: {
        startOffset: { x: 0, y: 0, z: -0.52 },
        targetPosition: [-2.83, 2.25, -0.21],
        targetRotation: [-1.57, 0, 0],
      },
      65: {
        startOffset: { x: 0, y: 0, z: -0.52 },
        targetPosition: [-2.05, 2.25, -0.21],
        targetRotation: [-1.57, 0, 0],
      },
    },
    instruction:
      "Tambahkan dua modul S05 di sisi kiri dan kanan, tepat di depan cluster fixed terakhir.",
  },
  {
    partId: null,
    quantity: 0,
    partIndexes: [],
    hidePartNamesOnComplete: RADARBOT_1_HIDE_PART_NAMES,
    instruction:
      "Sembunyikan seluruh subassembly yang sudah jadi lalu satukan sebagai blok radarbot_1 agar fokus pindah ke komponen pengunci akhir.",
  },
  {
    partId: "beam9",
    quantity: 1,
    partIndexes: [37],
    partOverrides: {
      37: {
        targetPosition: [0, 1.46, -0.1],
        targetRotation: [1.57, 0, 0],
      },
    },
    instruction: "Pasang beam 9-hole di bagian depan sebagai pengunci utama.",
  },
  {
    partId: "fixed",
    quantity: 6,
    partIndexes: RADAR_FRONT_LOCK_FIXED_PART_INDEXES,
    partOverrides: {
      66: {
        startOffset: { x: 0, y: 0.43, z: 0 },
        targetPosition: [-0.44, 1.52, -0.1],
        targetRotation: [1.57, 1.55, 3.142],
      },
      67: {
        startOffset: { x: 0, y: 0.43, z: 0 },
        targetPosition: [-0.33, 1.52, -0.1],
        targetRotation: [1.57, 1.55, 3.142],
      },
      68: {
        startOffset: { x: 0, y: 0.43, z: 0 },
        targetPosition: [-0.22, 1.52, -0.1],
        targetRotation: [1.57, 1.55, 3.142],
      },
      69: {
        startOffset: { x: 0, y: 0.43, z: 0 },
        targetPosition: [0.22, 1.52, -0.1],
        targetRotation: [1.57, 1.55, 3.142],
      },
      70: {
        startOffset: { x: 0, y: 0.43, z: 0 },
        targetPosition: [0.33, 1.52, -0.1],
        targetRotation: [1.57, 1.55, 3.142],
      },
      71: {
        startOffset: { x: 0, y: 0.43, z: 0 },
        targetPosition: [0.44, 1.52, -0.1],
        targetRotation: [1.57, 1.55, 3.142],
      },
    },
    instruction:
      "Tambahkan enam fixed connector merah di sepanjang beam depan untuk mengunci rangkaian akhir.",
  },
  {
    partId: "p34",
    quantity: 2,
    partIndexes: [29, 39],
    partOverrides: {
      29: {
        startOffset: { x: 0, y: 0.27, z: 0 },
        targetPosition: [-0.5, 1.58, -0.1],
        targetRotation: [0, 3.131, 0],
      },
      39: {
        startOffset: { x: 0, y: 0.27, z: 0 },
        targetPosition: [0.5, 1.58, -0.1],
        targetRotation: [0, -0.011, 0],
      },
    },
    instruction:
      "Pasang dua bracket P34 sebagai pengunci tambahan setelah beam 9-hole terpasang.",
  },
  {
    partId: "s01",
    quantity: 1,
    partIndexes: [30],
    partOverrides: {
      30: {
        startOffset: { x: 0, y: 0.38, z: 0 },
        targetPosition: [0, 1.62, -0.21],
        targetRotation: [0, 0, 0],
      },
    },
    instruction:
      "Pasang modul S01 setelah bracket P34 selesai ditempatkan.",
  },
  {
    partId: "fixed",
    quantity: 4,
    partIndexes: [31, 32, 35, 36],
    partOverrides: {
      31: {
        startOffset: { x: 0, y: 0, z: -0.35 },
        targetPosition: [0.675, 1.58, -0.15],
        targetRotation: [3.14, 1.55, 3.142],
      },
      32: {
        startOffset: { x: 0, y: 0, z: -0.35 },
        targetPosition: [0.555, 1.58, -0.15],
        targetRotation: [3.14, 1.55, 3.142],
      },
      35: {
        startOffset: { x: 0, y: 0, z: -0.35 },
        targetPosition: [-0.555, 1.58, -0.15],
        targetRotation: [3.14, 1.55, 3.142],
      },
      36: {
        startOffset: { x: 0, y: 0, z: -0.35 },
        targetPosition: [-0.675, 1.58, -0.15],
        targetRotation: [3.14, 1.55, 3.142],
      },
    },
    instruction:
      "Tambahkan empat fixed connector merah di sekitar modul S01 sebagai pengunci tahap berikutnya.",
  },
  {
    partId: "radar-head",
    quantity: 1,
    partIndexes: [],
    hidePartNamesOnComplete: RADAR_HEAD_HIDE_PART_NAMES,
    instruction:
      "Amati area final terlebih dahulu sebelum subassembly radar_head dan radarbot_1 ditampilkan.",
  },
  {
    partId: "radar-head",
    quantity: 1,
    partIndexes: [],
    customParts: [
      {
        name: RADARBOT_1_PART_NAME,
        startOffset: { x: 0, y: 0, z: 0 },
        targetPosition: [-1.485, 1.561, 0.653],
        disableHighlight: true,
      },
      {
        name: RADAR_HEAD_PART_NAME,
        startOffset: { x: 0, y: 0, z: 0.48 },
        targetPosition: [-1.474, 2.35, -0.117],
        targetRotation: [0, 0, 0],
      },
    ],
    instruction:
      "Tampilkan kembali subassembly bawah, lalu turunkan radar_head ke posisi final di atas radarbot_1.",
  },
  {
    partId: "radar-head",
    quantity: 1,
    partIndexes: [],
    instruction:
      "Radar_head sudah berada di posisi final di atas radarbot_1. Lanjut ke pengunci berikutnya.",
  },
  {
    partId: "fixed",
    quantity: 2,
    partIndexes: [28, 38],
    partOverrides: {
      28: {
        startOffset: { x: -0.496, y: 0, z: 0 },
        targetPosition: [-2.004, 2.1, 0.543],
        targetRotation: [0, 0, 0],
      },
      38: {
        startOffset: { x: -0.486, y: 0, z: 0 },
        targetPosition: [-2.014, 2.1, 0.923],
        targetRotation: [0, 0, 0],
      },
    },
    instruction:
      "Pasang dua fixed connector merah sebagai pengunci tambahan di area bawah radar head.",
  },
  {
    partId: "s03",
    quantity: 1,
    partIndexes: [26],
    partOverrides: {
      26: {
        startOffset: { x: -0.39, y: 0, z: 0 },
        targetPosition: [-2.11, 2, 0.72],
        targetRotation: [-1.571, 0, 1.57],
      },
    },
    instruction:
      "Tambahkan modul S03 sebagai komponen sensor tahap akhir di area kepala radar.",
  },
  {
    partId: "fixed",
    quantity: 2,
    partIndexes: [72, 73],
    partOverrides: {
      72: {
        startOffset: { x: 0.4, y: 0, z: 0 },
        targetPosition: [-0.95, 2.2, 0.92],
        targetRotation: [-1.571, 0, 3.15],
      },
      73: {
        startOffset: { x: 0.4, y: 0, z: 0 },
        targetPosition: [-0.95, 2.1, 0.92],
        targetRotation: [-1.571, 0, 3.15],
      },
    },
    instruction: "Tambahkan dua fixed connector merah baru di sekitar modul S03.",
  },
  {
    partId: "p36",
    quantity: 1,
    partIndexes: [74],
    partOverrides: {
      74: {
        startOffset: { x: 0.35, y: 0, z: 0 },
        targetPosition: [-0.9, 2.1, 0.97],
        targetRotation: [-1.571, -1.55, 3.15],
      },
    },
    instruction:
      "Tambahkan connector P36 di depan radar_step_73 sebagai pengunci akhir area sensor.",
  },
  {
    partId: null,
    quantity: 0,
    partIndexes: [27],
    partOverrides: {
      27: {
        startOffset: { x: 0, y: 0, z: 0 },
        targetPosition: [0, -20, -0.21],
        targetRotation: [0, 0, 0],
      },
    },
    instruction: "Rapikan alignment akhir setelah semua pengunci utama terpasang.",
  },
];

const RADAR_STEPS: AssemblyStep[] = RADAR_LEARNING_STEP_SPECS.map(
  (stepSpec, index) => {
    const no = String(index + 1).padStart(2, "0");
    const hidePartsOnComplete = [
      ...(stepSpec.hidePartIndexesOnComplete?.map((partIndex) =>
        formatRadarPhysicalPartName(partIndex),
      ) ?? []),
      ...(stepSpec.hidePartNamesOnComplete ?? []),
    ];
    const hidePartsBeforeStart = [
      ...(stepSpec.hidePartIndexesBeforeStart?.map((partIndex) =>
        formatRadarPhysicalPartName(partIndex),
      ) ?? []),
    ];

    return {
      id: `step-${no}`,
      label: `Step ${no}`,
      instruction: stepSpec.instruction,
      hidePartsBeforeStart,
      parts: [
        ...stepSpec.partIndexes.map((partIndex) => {
          const partOverride = stepSpec.partOverrides?.[partIndex];

          return {
            name: formatRadarPhysicalPartName(partIndex),
            startOffset:
              partOverride?.startOffset ?? getRadarPhysicalStartOffset(partIndex),
            targetOffset: partOverride?.targetOffset,
            targetPosition: partOverride?.targetPosition,
            targetRotation: partOverride?.targetRotation,
          };
        }),
        ...(stepSpec.customParts ?? []).map((part) => ({
          name: part.name,
          startOffset: part.startOffset,
          targetOffset: part.targetOffset,
          targetPosition: part.targetPosition,
          targetRotation: part.targetRotation,
          disableHighlight: part.disableHighlight,
        })),
      ],
      hidePartsOnComplete: hidePartsOnComplete.length
        ? hidePartsOnComplete
        : undefined,
    };
  },
);

const RADAR_TOTAL_STEPS = RADAR_STEPS.length;
const RADAR_TOTAL_STEPS_LABEL = RADAR_TOTAL_STEPS.toString().padStart(2, "0");
const RADAR_STEP_SEQUENCE_SIGNATURE = RADAR_STEPS.map((step) =>
  [
    step.id,
    step.parts
      .map((part) =>
        [
          part.name,
          part.startOffset?.x ?? 0,
          part.startOffset?.y ?? 0,
          part.startOffset?.z ?? 0,
          part.targetOffset?.x ?? 0,
          part.targetOffset?.y ?? 0,
          part.targetOffset?.z ?? 0,
          part.targetPosition?.join(",") ?? "",
          part.targetRotation?.join(",") ?? "",
        ].join("@"),
      )
      .join(","),
    step.hidePartsOnComplete?.join(",") ?? "",
  ].join("|"),
).join("::");

const DEFAULT_MODEL_URL = "/learning/radar/models/radar-assembly.glb";

const INITIAL_STEP_STATE: StepStateSnapshot = {
  currentStepIndex: 0,
  totalSteps: RADAR_STEPS.length,
  isAnimating: false,
};

export default function Learning3DPage() {
  const [mode, setMode] = useState<"catalog" | "workspace">("catalog");
  const [introOpen, setIntroOpen] = useState(false);
  const [sceneReady, setSceneReady] = useState(false);
  const [loadingScene, setLoadingScene] = useState(false);
  const [stepState, setStepState] =
    useState<StepStateSnapshot>(INITIAL_STEP_STATE);
  const [modelUrl] = useState(DEFAULT_MODEL_URL);
  const [sceneError, setSceneError] = useState<string | null>(null);
  const [workspaceVisible, setWorkspaceVisible] = useState(false);
  const [showReferenceCard, setShowReferenceCard] = useState(true);
  const [partsListOpen, setPartsListOpen] = useState(false);
  const [debugOpen, setDebugOpen] = useState(RADAR_TRANSFORM_DEBUG_ENABLED);
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
    RADAR_REFERENCE_PREVIEW_IMAGE,
  );

  const canvasHostRef = useRef<HTMLDivElement | null>(null);
  const sceneRef = useRef<AssemblyScene | null>(null);
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const sceneConfigSignature = `${RADAR_TOTAL_STEPS_LABEL}:${RADAR_STEP_SEQUENCE_SIGNATURE}:${ASSEMBLY_SCENE_SIGNATURE}`;
  const hasRemainingSteps = stepState.currentStepIndex < stepState.totalSteps;
  const upcomingStepNumber = hasRemainingSteps
    ? stepState.currentStepIndex + 1
    : stepState.totalSteps;
  const currentLearningStep = hasRemainingSteps
    ? (RADAR_STEPS[stepState.currentStepIndex] ?? null)
    : null;
  const currentLearningSpec = hasRemainingSteps
    ? (RADAR_LEARNING_STEP_SPECS[stepState.currentStepIndex] ?? null)
    : null;
  const currentPack =
    RADAR_PART_PACKS.find(
      (pack) =>
        upcomingStepNumber >= pack.startStep &&
        upcomingStepNumber <= pack.endStep,
    ) ?? RADAR_PART_PACKS[RADAR_PART_PACKS.length - 1];
  const currentPart = currentLearningSpec
    ? (RADAR_PARTS_BY_ID.get(currentLearningSpec.partId) ?? null)
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
  const currentDebugPartNames = useMemo(() => {
    if (!RADAR_TRANSFORM_DEBUG_ENABLED || !currentLearningSpec?.partId) {
      return [];
    }
    return currentLearningStep?.parts.map((part) => part.name) ?? [];
  }, [currentLearningSpec?.partId, currentLearningStep]);
  const currentDebugPartSignature = currentDebugPartNames.join("|");
  const desiredWorkspacePreviewSrc =
    getWorkspacePreviewImage(upcomingStepNumber);
  const [workspacePreviewSrc, setWorkspacePreviewSrc] = useState(
    desiredWorkspacePreviewSrc,
  );
  const sequenceProgressPercent =
    stepState.totalSteps <= 1
      ? 0
      : (Math.max(upcomingStepNumber - 1, 0) / (stepState.totalSteps - 1)) *
        100;
  const sequenceHandlePercent = Math.min(
    98,
    Math.max(2, sequenceProgressPercent),
  );
  const sequenceMarkers = RADAR_PART_PACKS.slice(0, -1).map(
    (pack) => (pack.endStep / stepState.totalSteps) * 100,
  );
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
    (stepNumber: number): CameraPreset => {
      const fallbackPreset = getRadarCameraPreset(stepNumber);
      const stepCameraOverride =
        RADAR_STEP_CAMERA_OVERRIDES.get(stepNumber) ?? null;
      const focusPoints =
        sceneRef.current && currentLearningStep
          ? RADAR_STEPS.slice(0, stepState.currentStepIndex + 1)
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

      const computedTarget =
        focusPoints.length > 0
          ? (() => {
              const target = focusPoints.reduce(
                (accumulator, point) => {
                  accumulator[0] += point[0];
                  accumulator[1] += point[1];
                  accumulator[2] += point[2];
                  return accumulator;
                },
                [0, 0, 0] as [number, number, number],
              );

              const count = focusPoints.length;
              target[0] /= count;
              target[1] /= count;
              target[2] /= count;

              return [
                roundDebugValue(target[0]),
                roundDebugValue(target[1] + 0.02),
                roundDebugValue(target[2]),
              ] as [number, number, number];
            })()
          : fallbackPreset.target;

      if (stepCameraOverride) {
        return {
          position: stepCameraOverride.position,
          target: stepCameraOverride.target ?? computedTarget,
          duration: 0.72,
        };
      }

      if (
        stepNumber < RADAR_AUTO_CAMERA_STEP_RANGE.start ||
        stepNumber > RADAR_AUTO_CAMERA_STEP_RANGE.end ||
        !sceneRef.current ||
        !currentLearningStep
      ) {
        return fallbackPreset;
      }

      if (!focusPoints.length) {
        return fallbackPreset;
      }

      if (currentLearningSpec?.partId === "fixed") {
        const fixedOccurrenceIndex =
          RADAR_LEARNING_STEP_SPECS.slice(0, stepState.currentStepIndex + 1).filter(
            (step) => step.partId === "fixed",
          ).length - 1;
        const fixedCameraPreset =
          RADAR_FIXED_CAMERA_POSITIONS[fixedOccurrenceIndex] ?? null;

        if (fixedCameraPreset) {
          return {
            position: fixedCameraPreset.position,
            target: fixedCameraPreset.target ?? computedTarget,
            duration: 0.72,
          };
        }
      }

      return {
        position: [
          roundDebugValue(computedTarget[0] + RADAR_AUTO_CAMERA_OFFSET[0]),
          roundDebugValue(computedTarget[1] + RADAR_AUTO_CAMERA_OFFSET[1]),
          roundDebugValue(computedTarget[2] + RADAR_AUTO_CAMERA_OFFSET[2]),
        ],
        target: computedTarget,
        duration: 0.72,
      };
    },
    [currentLearningSpec, currentLearningStep, stepState.currentStepIndex],
  );

  const prepareSceneBoot = () => {
    setLoadingScene(true);
    setSceneReady(false);
    setSceneError(null);
    setStepState(INITIAL_STEP_STATE);
  };

  const openIntroModal = () => {
    setCatalogPreviewSrc(RADAR_REFERENCE_PREVIEW_IMAGE);
    setIntroOpen(true);
  };

  const openWorkspace = () => {
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }

    setCatalogPreviewSrc(RADAR_REFERENCE_PREVIEW_IMAGE);
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

    const scene = new AssemblyScene({
      container: host,
      modelUrl,
      steps: RADAR_STEPS,
      offsetY: 5,
    });
    sceneRef.current = scene;

    scene
      .init()
      .then(() => {
        if (disposed) return;
        setSceneReady(true);
        setStepState(scene.getStepManager().getState());
        scene.setCameraPreset(getRadarCameraPreset(1), true);
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
  }, [mode, modelUrl, sceneConfigSignature, syncCameraDebugState]);

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
    if (upcomingStepNumber !== 27) return;

    const baseStandTransform = sceneRef.current?.getConfiguredPartTransform(
      stepState.currentStepIndex,
      RADAR_BASE_STAND_PART_NAME,
    );
    if (baseStandTransform) {
      sceneRef.current?.setPartVisible(RADAR_BASE_STAND_PART_NAME, true);
      sceneRef.current?.setPartTransform(RADAR_BASE_STAND_PART_NAME, {
        position: baseStandTransform.finalPosition,
        rotation: baseStandTransform.finalRotation,
      });
    }

    const headControlTransform = sceneRef.current?.getConfiguredPartTransform(
      stepState.currentStepIndex,
      RADAR_HEAD_CONTROL_PART_NAME,
    );
    if (headControlTransform) {
      sceneRef.current?.setPartVisible(RADAR_HEAD_CONTROL_PART_NAME, true);
      sceneRef.current?.setPartTransform(RADAR_HEAD_CONTROL_PART_NAME, {
        position: headControlTransform.startPosition,
        rotation: headControlTransform.startRotation,
      });
    }
  }, [mode, sceneReady, stepState.currentStepIndex, upcomingStepNumber]);

  useEffect(() => {
    if (mode !== "workspace" || !sceneReady) return;
    if (upcomingStepNumber !== 39) return;

    const beam9Transform = sceneRef.current?.getConfiguredPartTransform(
      stepState.currentStepIndex,
      RADAR_BEAM9_PART_NAME,
    );
    if (!beam9Transform) return;

    sceneRef.current?.setPartVisible(RADAR_BEAM9_PART_NAME, true);
    sceneRef.current?.setPartTransform(RADAR_BEAM9_PART_NAME, {
      position: beam9Transform.startPosition,
      rotation: beam9Transform.startRotation,
    });
  }, [mode, sceneReady, stepState.currentStepIndex, upcomingStepNumber]);

  useEffect(() => {
    if (mode !== "workspace" || !sceneReady) return;
    if (upcomingStepNumber !== 45) return;

    RADAR_HEAD_HIDE_PART_NAMES.forEach((partName) => {
      sceneRef.current?.setPartVisible(partName, false);
    });

    const radarbotTransform = sceneRef.current?.getConfiguredPartTransform(
      stepState.currentStepIndex,
      RADARBOT_1_PART_NAME,
    );
    if (radarbotTransform) {
      sceneRef.current?.setPartVisible(RADARBOT_1_PART_NAME, true);
      sceneRef.current?.setPartTransform(RADARBOT_1_PART_NAME, {
        position: radarbotTransform.finalPosition,
        rotation: radarbotTransform.finalRotation,
      });
    }

    const radarHeadTransform = sceneRef.current?.getConfiguredPartTransform(
      stepState.currentStepIndex,
      RADAR_HEAD_PART_NAME,
    );
    if (radarHeadTransform) {
      sceneRef.current?.setPartVisible(RADAR_HEAD_PART_NAME, true);
      sceneRef.current?.setPartTransform(RADAR_HEAD_PART_NAME, {
        position: radarHeadTransform.startPosition,
        rotation: radarHeadTransform.startRotation,
      });
    }
  }, [mode, sceneReady, stepState.currentStepIndex, upcomingStepNumber]);

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

    if (upcomingStepNumber === 37) {
      await manager.nextStep();
      if (manager.canGoNext()) {
        await manager.nextStep();
      }
      syncStateFromManager();
      return;
    }

    if (upcomingStepNumber === 29) {
      sceneRef.current?.setCameraPreset(getResolvedCameraPreset(30), false);
    }

    if (upcomingStepNumber === 45) {
      RADAR_HEAD_HIDE_PART_NAMES.forEach((partName) => {
        sceneRef.current?.setPartVisible(partName, false);
      });
      sceneRef.current?.setPartVisible(RADARBOT_1_PART_NAME, false);
      sceneRef.current?.setPartVisible(RADAR_HEAD_PART_NAME, false);
    }

    await manager.nextStep();
    syncStateFromManager();
  };

  const handlePrev = async () => {
    const manager = sceneRef.current?.getStepManager();
    if (!manager || !manager.canGoPrev()) return;

    if (upcomingStepNumber === 39) {
      await manager.prevStep();
      if (manager.canGoPrev()) {
        await manager.prevStep();
      }
      syncStateFromManager();
      return;
    }

    await manager.prevStep();
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
    const targetIndex = Math.round(clampedRatio * (RADAR_STEPS.length - 1));
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
                  if (catalogPreviewSrc !== GUIDE_IMAGES.story) {
                    setCatalogPreviewSrc(GUIDE_IMAGES.story);
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
              <div className="flex flex-wrap gap-2 text-xs text-[#255d74]/70">
                <span className="rounded-full border border-[#255d74]/20 px-2 py-1">
                  {RADAR_TOTAL_STEPS} steps
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
                className="inline-flex items-center rounded-xl bg-[#255d74] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#1d4d61]"
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
                          if (catalogPreviewSrc !== GUIDE_IMAGES.story) {
                            setCatalogPreviewSrc(GUIDE_IMAGES.story);
                          }
                        }}
                      />
                    </div>
                  </div>
                </div>

                <div className="flex min-h-[360px] flex-col">
                  <div className="pr-8">
                    <h2 className="text-center text-[2.3rem] font-semibold tracking-tight text-[#1e2330] md:text-left">
                      {RADAR_INTRO.title}
                    </h2>
                  </div>

                  <div className="mt-4 flex-1 space-y-4 overflow-y-auto pr-1 text-[#1e2330] md:max-h-[320px]">
                    <p className="text-[1rem] leading-[1.65]">
                      {RADAR_INTRO.description}
                    </p>

                    <div className="space-y-2.5 text-[15px] leading-[1.65]">
                      {RADAR_INTRO.outcomes.map((item) => (
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
                    if (workspacePreviewSrc !== GUIDE_IMAGES.story) {
                      setWorkspacePreviewSrc(GUIDE_IMAGES.story);
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

        {RADAR_TRANSFORM_DEBUG_ENABLED ? (
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
                          {getDebugPartLabel(partName)}
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
                      {RADAR_PARTS.length} jenis /{" "}
                      {RADAR_PARTS.reduce((total, part) => total + part.qty, 0)}{" "}
                      total pieces
                    </p>
                  </div>

                  <div className="w-10" />
                </div>

                <div className="flex-1 overflow-y-auto px-5 py-5 md:px-7 md:py-6">
                  <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
                    {RADAR_PARTS.map((part) => (
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
