import * as THREE from "three";
import { STLLoader } from "three/examples/jsm/loaders/STLLoader.js";
import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader.js";
import { AssemblyStep } from "@/lib/assembly/types";

type StepBlueprint = {
  file: string;
  position: [number, number, number];
  rotation?: [number, number, number];
  scaleMul?: number;
};

type LoadedAsset = {
  geometry: THREE.BufferGeometry;
  normalizedScale: number;
};

const SCALE_2780_TINY = 0.25;
const SCALE_C4 = 0.38;
const SCALE_C6_TOP = 0.34;
const SCALE_C11_BASE = 0.42;
const SCALE_C11_TOP = 0.34;
const SCALE_SERVO_COMBINED = 0.62;
const SCALE_S01 = 0.62;
const SCALE_S03 = 0.58;
const SCALE_S05 = 0.48;
const SCALE_S06 = 0.82;
const SCALE_P34 = 0.52;
const SCALE_P35 = 0.44;
const SCALE_P36 = 0.34;
const SCALE_BASE_STAND_GROUP = 0.88;
const SCALE_HEAD_CONTROL_GROUP = 0.94;
const SCALE_RADAR_HEAD_GROUP = 0.75;
const RADAR_MC_PART_NAME = "radar_step_mc";
export const RADAR_BASE_STAND_PART_NAME = "radar_step_base_stand";
export const RADAR_HEAD_CONTROL_PART_NAME = "radar_step_head_control";
export const RADARBOT_1_PART_NAME = "radarbot_1";
export const RADAR_HEAD_PART_NAME = "radar_head";
const HEAD_CONTROL_SYNTHETIC_OVERRIDES: Partial<
  Record<
    string,
    {
      position?: [number, number, number];
      rotation?: [number, number, number];
    }
  >
> = {
  [RADAR_MC_PART_NAME]: {
    rotation: [Math.PI, Math.PI, 0],
  },
};
const RADARBOT_SYNTHETIC_OVERRIDES: Partial<
  Record<
    string,
    {
      position?: [number, number, number];
      rotation?: [number, number, number];
    }
  >
> = {
  [RADAR_HEAD_CONTROL_PART_NAME]: {
    position: [-2.44, 1.594, 0.55],
    rotation: [0, 0, 3.142],
  },
};
const RADAR_MC_BLUEPRINT = {
  file: "MC.obj",
  position: [0, 1.1, 0.48] as [number, number, number],
  rotation: [0, 0, 0] as [number, number, number],
  scaleMul: 1.38,
};

function formatRadarPhysicalPartName(index: number): string {
  return `radar_step_${String(index).padStart(2, "0")}`;
}

function isObjFile(file: string): boolean {
  return file.toLowerCase().endsWith(".obj");
}

function createRadarMaterial(
  colorValue: THREE.ColorRepresentation,
): THREE.MeshStandardMaterial {
  const color = new THREE.Color(colorValue);

  return new THREE.MeshStandardMaterial({
    color,
    roughness: 0.36,
    metalness: 0.08,
    emissive: color.clone().multiplyScalar(0.07),
  });
}

function isSyntheticRadarPartName(partName: string): boolean {
  return (
    partName === RADAR_MC_PART_NAME ||
    partName === RADAR_BASE_STAND_PART_NAME ||
    partName === RADAR_HEAD_CONTROL_PART_NAME ||
    partName === RADARBOT_1_PART_NAME ||
    partName === RADAR_HEAD_PART_NAME
  );
}

// Radar-only fallback blueprint (39 physical parts).
const BLUEPRINTS: StepBlueprint[] = [
  {
    file: "P70_version-1.STL",
    position: [0.0, 0.58, 0.08],
    rotation: [-Math.PI / 2, 0, 0],
    scaleMul: 1.08,
  },
  // Total 7x 2780: 2 kiri + 2 kanan + 3 pada sisi panjang bawah, semua step terpisah.
  {
    file: "2780_fixed.stl",
    position: [-0.52, 0.58, 0.23],
    rotation: [0, 0, 0],
    scaleMul: SCALE_2780_TINY,
  },
  {
    file: "2780_fixed.stl",
    position: [-0.52, 0.58, 0.08],
    rotation: [0, 0, 0],
    scaleMul: SCALE_2780_TINY,
  },
  {
    file: "2780_fixed.stl",
    position: [0.52, 0.58, 0.23],
    rotation: [0, 0, 0],
    scaleMul: SCALE_2780_TINY,
  },
  {
    file: "2780_fixed.stl",
    position: [0.52, 0.58, 0.08],
    rotation: [0, 0, 0],
    scaleMul: SCALE_2780_TINY,
  },
  {
    file: "2780_fixed.stl",
    position: [-0.29, 0.58, -0.28],
    rotation: [0, -Math.PI / 2, 0],
    scaleMul: SCALE_2780_TINY,
  },
  {
    file: "2780_fixed.stl",
    position: [0.0, 0.58, -0.28],
    rotation: [0, -Math.PI / 2, 0],
    scaleMul: SCALE_2780_TINY,
  },
  {
    file: "2780_fixed.stl",
    position: [0.29, 0.58, -0.28],
    rotation: [0, -Math.PI / 2, 0],
    scaleMul: SCALE_2780_TINY,
  },
  {
    file: "P70_version-1.STL",
    position: [0.0, 0.58, 0.89],
    rotation: [-Math.PI / 2, 0, 0],
    scaleMul: 1.06,
  },
  {
    file: "2780_fixed.stl",
    position: [-0.52, 0.58, 0.9],
    rotation: [0, 0, 0],
    scaleMul: SCALE_2780_TINY,
  },
  {
    file: "2780_fixed.stl",
    position: [-0.52, 0.58, 0.76],
    rotation: [0, 0, 0],
    scaleMul: SCALE_2780_TINY,
  },
  {
    file: "2780_fixed.stl",
    position: [0.52, 0.58, 0.9],
    rotation: [0, 0, 0],
    scaleMul: SCALE_2780_TINY,
  },
  {
    file: "2780_fixed.stl",
    position: [0.52, 0.58, 0.76],
    rotation: [0, 0, 0],
    scaleMul: SCALE_2780_TINY,
  },
  {
    file: "2780_fixed.stl",
    position: [-0.29, 0.58, 1.25],
    rotation: [0, -Math.PI / 2, 0],
    scaleMul: SCALE_2780_TINY,
  },
  {
    file: "2780_fixed.stl",
    position: [0.0, 0.58, 1.25],
    rotation: [0, -Math.PI / 2, 0],
    scaleMul: SCALE_2780_TINY,
  },
  {
    file: "2780_fixed.stl",
    position: [0.29, 0.58, 1.25],
    rotation: [0, -Math.PI / 2, 0],
    scaleMul: SCALE_2780_TINY,
  },
  {
    file: "2780_fixed.stl",
    position: [-0.14, 0.66, 0.36],
    rotation: [0, 0, -Math.PI / 2],
    scaleMul: SCALE_2780_TINY,
  },
  {
    file: "2780_fixed.stl",
    position: [0.14, 0.66, 0.36],
    rotation: [0, 0, -Math.PI / 2],
    scaleMul: SCALE_2780_TINY,
  },
  {
    file: "2780_fixed.stl",
    position: [-0.14, 0.66, 0.61],
    rotation: [0, 0, -Math.PI / 2],
    scaleMul: SCALE_2780_TINY,
  },
  {
    file: "2780_fixed.stl",
    position: [0.14, 0.66, 0.61],
    rotation: [0, 0, -Math.PI / 2],
    scaleMul: SCALE_2780_TINY,
  },
  {
    file: "C11.STL",
    position: [0.0, 0.84, 0.49],
    rotation: [0, Math.PI / 2, 0],
    scaleMul: SCALE_C11_BASE,
  },
  {
    file: "P72_version-2.STL",
    position: [0.0, 0.58, -0.62],
    rotation: [Math.PI, Math.PI / 2, 0],
    scaleMul: 1.7,
  },
  {
    file: "P72_version-2.STL",
    position: [-0.84, 0.58, 0.48],
    rotation: [Math.PI, 0, 0],
    scaleMul: 1.7,
  },
  {
    file: "P72_version-2.STL",
    position: [0.84, 0.58, 0.48],
    rotation: [Math.PI, 0, 0],
    scaleMul: 1.7,
  },
  {
    file: "P72_version-2.STL",
    position: [0.0, 0.58, 1.59],
    rotation: [Math.PI, Math.PI / 2, 0],
    scaleMul: 1.7,
  },
  {
    file: "S03.obj",
    position: [-2.11, 2, 0.72],
    rotation: [-1.571, 0, 1.57],
    scaleMul: SCALE_S03,
  },
  {
    file: "P34.STL",
    position: [0.72, 0.35, -0.24],
    rotation: [-Math.PI / 2, 0, 0],
    scaleMul: SCALE_P34,
  },
  {
    file: "2780_fixed.stl",
    position: [-2.004, 2.1, 0.543],
    rotation: [0, 0, 0],
    scaleMul: SCALE_2780_TINY,
  },
  {
    file: "P34.STL",
    position: [-0.5, 1.58, -0.1],
    rotation: [0, 3.131, 0],
    scaleMul: SCALE_P34,
  },
  {
    file: "S01.obj",
    position: [0, 1.62, -0.21],
    rotation: [0, 0, 0],
    scaleMul: SCALE_S01,
  },
  {
    file: "2780_fixed.stl",
    position: [0.675, 1.58, -0.15],
    rotation: [3.14, 1.55, 3.142],
    scaleMul: SCALE_2780_TINY,
  },
  {
    file: "2780_fixed.stl",
    position: [0.555, 1.58, -0.15],
    rotation: [3.14, 1.55, 3.142],
    scaleMul: SCALE_2780_TINY,
  },
  {
    file: "C4.STL",
    position: [-0.38, 1.52, 0.88],
    rotation: [Math.PI, Math.PI, 0],
    scaleMul: SCALE_C4,
  },
  {
    file: "C4.STL",
    position: [0.38, 1.52, 0.88],
    rotation: [Math.PI, Math.PI, 0],
    scaleMul: SCALE_C4,
  },
  {
    file: "2780_fixed.stl",
    position: [-0.555, 1.58, -0.15],
    rotation: [3.14, 1.55, 3.142],
    scaleMul: SCALE_2780_TINY,
  },
  {
    file: "2780_fixed.stl",
    position: [-0.675, 1.58, -0.15],
    rotation: [3.14, 1.55, 3.142],
    scaleMul: SCALE_2780_TINY,
  },
  {
    file: "9holes_Straight_Beam_LEGO_Technic.stl",
    position: [0.0, 1.46, -0.1],
    rotation: [1.57, 0, 0],
    scaleMul: 1.1,
  },
  {
    file: "2780_fixed.stl",
    position: [-2.014, 2.1, 0.923],
    rotation: [0, 0, 0],
    scaleMul: SCALE_2780_TINY,
  },
  {
    file: "P34.STL",
    position: [0.5, 1.58, -0.1],
    rotation: [0, -0.011, 0],
    scaleMul: SCALE_P34,
  },
  {
    file: "C6.STL",
    position: [-0.38, 1.52, 0.67],
    rotation: [Math.PI / 2, Math.PI / 2, 0],
    scaleMul: SCALE_C6_TOP,
  },
  {
    file: "C6.STL",
    position: [0.38, 1.52, 0.67],
    rotation: [Math.PI / 2, -Math.PI / 2, 0],
    scaleMul: SCALE_C6_TOP,
  },
  {
    file: "C4.STL",
    position: [-0.38, 1.55, 0.49],
    rotation: [4.712, 3.142, 3.15],
    scaleMul: SCALE_C4,
  },
  {
    file: "C4.STL",
    position: [0.38, 1.55, 0.49],
    rotation: [4.712, 3.142, 3.142],
    scaleMul: SCALE_C4,
  },
  {
    file: "C4.STL",
    position: [-0.35, 1.79, 0.49],
    rotation: [6.272, 4.712, 3.15],
    scaleMul: SCALE_C4,
  },
  {
    file: "C4.STL",
    position: [0.35, 1.79, 0.49],
    rotation: [6.268, 1.562, 3.142],
    scaleMul: SCALE_C4,
  },
  {
    file: "SERVO_combined.obj",
    position: [0.0, 1.82, 0.64],
    rotation: [0, 0, 0],
    scaleMul: SCALE_SERVO_COMBINED,
  },
  {
    file: "C11.STL",
    position: [-2.82, 1.99, 1.23],
    rotation: [-1.57, 3.141, 0],
    scaleMul: SCALE_C11_TOP,
  },
  {
    file: "C11.STL",
    position: [-2.05, 1.99, 1.23],
    rotation: [-1.57, 3.141, 0],
    scaleMul: SCALE_C11_TOP,
  },
  {
    file: "2780_fixed.stl",
    position: [-2.717, 2.09, 1.39],
    rotation: [0, 1.55, 0],
    scaleMul: SCALE_2780_TINY,
  },
  {
    file: "2780_fixed.stl",
    position: [-2.717, 1.89, 1.39],
    rotation: [0, 1.55, 0],
    scaleMul: SCALE_2780_TINY,
  },
  {
    file: "2780_fixed.stl",
    position: [-2.147, 2.09, 1.39],
    rotation: [0, 1.55, 0],
    scaleMul: SCALE_2780_TINY,
  },
  {
    file: "2780_fixed.stl",
    position: [-2.147, 1.89, 1.39],
    rotation: [0, 1.55, 0],
    scaleMul: SCALE_2780_TINY,
  },
  {
    file: "S06.obj",
    position: [-2.43, 1.98, 1.7],
    rotation: [-1.55, 0, 0],
    scaleMul: SCALE_S06,
  },
  {
    file: "2780_fixed.stl",
    position: [-2.97, 2.16, 0.07],
    rotation: [-1.55, 0, 0],
    scaleMul: SCALE_2780_TINY,
  },
  {
    file: "2780_fixed.stl",
    position: [-2.97, 2.16, 0.17],
    rotation: [-1.55, 0, 0],
    scaleMul: SCALE_2780_TINY,
  },
  {
    file: "2780_fixed.stl",
    position: [-1.91, 2.16, 0.17],
    rotation: [-1.55, 0, 0],
    scaleMul: SCALE_2780_TINY,
  },
  {
    file: "2780_fixed.stl",
    position: [-1.91, 2.16, 0.07],
    rotation: [-1.55, 0, 0],
    scaleMul: SCALE_2780_TINY,
  },
  {
    file: "P35.STL",
    position: [-2.01, 2.16, 0.07],
    rotation: [0, 0, 0],
    scaleMul: SCALE_P35,
  },
  {
    file: "P35.STL",
    position: [-2.87, 2.16, 0.07],
    rotation: [0, 0, 3.142],
    scaleMul: SCALE_P35,
  },
  {
    file: "2780_fixed.stl",
    position: [-1.96, 2.16, -0.08],
    rotation: [0, 1.55, 3.142],
    scaleMul: SCALE_2780_TINY,
  },
  {
    file: "2780_fixed.stl",
    position: [-2.15, 2.16, -0.08],
    rotation: [0, 1.55, 3.142],
    scaleMul: SCALE_2780_TINY,
  },
  {
    file: "2780_fixed.stl",
    position: [-2.73, 2.16, -0.08],
    rotation: [0, 1.55, 3.142],
    scaleMul: SCALE_2780_TINY,
  },
  {
    file: "2780_fixed.stl",
    position: [-2.92, 2.16, -0.08],
    rotation: [0, 1.55, 3.142],
    scaleMul: SCALE_2780_TINY,
  },
  {
    file: "S05.obj",
    position: [-2.83, 2.25, -0.21],
    rotation: [-1.57, 0, 0],
    scaleMul: SCALE_S05,
  },
  {
    file: "S05.obj",
    position: [-2.05, 2.25, -0.21],
    rotation: [-1.57, 0, 0],
    scaleMul: SCALE_S05,
  },
  {
    file: "2780_fixed.stl",
    position: [-0.44, 1.52, -0.1],
    rotation: [1.57, 1.55, 3.142],
    scaleMul: SCALE_2780_TINY,
  },
  {
    file: "2780_fixed.stl",
    position: [-0.33, 1.52, -0.1],
    rotation: [1.57, 1.55, 3.142],
    scaleMul: SCALE_2780_TINY,
  },
  {
    file: "2780_fixed.stl",
    position: [-0.22, 1.52, -0.1],
    rotation: [1.57, 1.55, 3.142],
    scaleMul: SCALE_2780_TINY,
  },
  {
    file: "2780_fixed.stl",
    position: [0.22, 1.52, -0.1],
    rotation: [1.57, 1.55, 3.142],
    scaleMul: SCALE_2780_TINY,
  },
  {
    file: "2780_fixed.stl",
    position: [0.33, 1.52, -0.1],
    rotation: [1.57, 1.55, 3.142],
    scaleMul: SCALE_2780_TINY,
  },
  {
    file: "2780_fixed.stl",
    position: [0.44, 1.52, -0.1],
    rotation: [1.57, 1.55, 3.142],
    scaleMul: SCALE_2780_TINY,
  },
  {
    file: "2780_fixed.stl",
    position: [-0.95, 2.2, 0.92],
    rotation: [-1.571, 0, 3.15],
    scaleMul: SCALE_2780_TINY,
  },
  {
    file: "2780_fixed.stl",
    position: [-0.95, 2.1, 0.92],
    rotation: [-1.571, 0, 3.15],
    scaleMul: SCALE_2780_TINY,
  },
  {
    file: "P36.STL",
    position: [-0.9, 2.1, 0.97],
    rotation: [-1.571, -1.55, 3.15],
    scaleMul: SCALE_P36,
  },
];

export const RADAR_PHYSICAL_PART_COUNT = BLUEPRINTS.length;
const RADAR_EXPECTED_PART_NAMES = new Set(
  Array.from({ length: RADAR_PHYSICAL_PART_COUNT }, (_, index) =>
    formatRadarPhysicalPartName(index + 1),
  ),
);

export const RADAR_FALLBACK_SIGNATURE = BLUEPRINTS.map((blueprint) =>
  [
    blueprint.file,
    blueprint.position.join(","),
    blueprint.rotation?.join(",") ?? "",
    blueprint.scaleMul ?? 1,
  ].join("|"),
)
  .concat(
    [
      RADAR_MC_BLUEPRINT.file,
      RADAR_MC_BLUEPRINT.position.join(","),
      RADAR_MC_BLUEPRINT.rotation.join(","),
      RADAR_MC_BLUEPRINT.scaleMul,
    ].join("|"),
  )
  .join("::");

function isRadarStepSet(steps: AssemblyStep[]): boolean {
  const partNames = steps.flatMap((step) =>
    step.parts.map((part) => part.name),
  );
  const uniquePartNames = new Set(partNames);
  const syntheticPartCount = [...uniquePartNames].filter((partName) =>
    isSyntheticRadarPartName(partName),
  ).length;
  const expectedCount = RADAR_PHYSICAL_PART_COUNT + syntheticPartCount;

  if (uniquePartNames.size !== expectedCount) return false;

  return [...RADAR_EXPECTED_PART_NAMES].every((partName) =>
    uniquePartNames.has(partName),
  );
}

function loadStl(
  loader: STLLoader,
  url: string,
): Promise<THREE.BufferGeometry> {
  return new Promise((resolve, reject) => {
    loader.load(
      url,
      (geometry) => resolve(geometry),
      undefined,
      (error) => reject(error),
    );
  });
}

function loadObj(loader: OBJLoader, url: string): Promise<THREE.Group> {
  return new Promise((resolve, reject) => {
    loader.load(
      url,
      (object) => resolve(object),
      undefined,
      (error) => reject(error),
    );
  });
}

function normalizeGeometry(raw: THREE.BufferGeometry): LoadedAsset {
  const geometry = raw.clone();
  geometry.computeVertexNormals();
  geometry.center();
  geometry.computeBoundingBox();

  const size = new THREE.Vector3();
  geometry.boundingBox?.getSize(size);
  const maxDim = Math.max(size.x, size.y, size.z, 1e-6);

  return {
    geometry,
    normalizedScale: 0.9 / maxDim,
  };
}

function getFallbackColor(
  file: string,
  index: number,
  total: number,
): THREE.Color {
  switch (file) {
    case "MC.obj":
      return new THREE.Color("#a4adb7");
    case "SERVO_combined.obj":
      return new THREE.Color("#3b4048");
    case "S05.obj":
      return new THREE.Color("#35b7d6");
    case "S01.obj":
      return new THREE.Color("#4fb8d3");
    case "P70_version-1.STL":
      return new THREE.Color("#facc15");
    case "2780_fixed.stl":
      return new THREE.Color("#ef4444");
    case "9holes_Straight_Beam_LEGO_Technic.stl":
      return new THREE.Color("#2563eb");
    case "P34.STL":
      return new THREE.Color("#94a3b8");
    case "P35.STL":
      return new THREE.Color("#ef4444");
    case "P36.STL":
      return new THREE.Color("#2563eb");
    case "C11.STL":
      return new THREE.Color("#facc15");
    case "P72_version-2.STL":
      return new THREE.Color("#cbd5e1");
    case "C4.STL":
      return new THREE.Color("#facc15");
    case "C6.STL":
      return new THREE.Color("#facc15");
    default:
      return new THREE.Color().setHSL((index / total) * 0.32 + 0.5, 0.65, 0.64);
  }
}

function getObjPartColor(
  file: string,
  partName: string | undefined,
  fallbackColor: THREE.ColorRepresentation,
): THREE.ColorRepresentation {
  if (file === "MC.obj") {
    switch (partName) {
      case "MC_1":
        return "#ffffff";
      case "MC_2":
        return "#ffffff";
      default:
        return "#a4adb7";
    }
  }

  if (file === "S05.obj") {
    switch (partName) {
      case "S05_1":
        return "#111111";
      case "S05_2":
        return "#ffffff";
      default:
        return "#35b7d6";
    }
  }

  if (file === "S06.obj") {
    switch (partName) {
      case "S06_0":
        return "#ffffff";
      case "S06_1":
        return "#35b7d6";
      case "S06_2":
        return "#111111";
      default:
        return "#ffffff";
    }
  }

  if (file === "S03.obj") {
    switch (partName) {
      case "S03_1":
        return "#facc15";
      default:
        return "#ffffff";
    }
  }

  if (file === "S01.obj") {
    switch (partName) {
      case "S01_1":
        return "#111111";
      case "S01_2":
        return "#ffffff";
      default:
        return "#ffffff";
    }
  }

  return fallbackColor;
}

function cloneObjNode(
  source: THREE.Object3D,
  color: THREE.ColorRepresentation,
  file: string,
  inheritedPartName?: string,
): THREE.Object3D {
  const partName = source.name || inheritedPartName;

  if (source instanceof THREE.Mesh) {
    const resolvedColor = getObjPartColor(file, partName, color);
    const mesh = new THREE.Mesh(
      source.geometry.clone(),
      createRadarMaterial(resolvedColor),
    );
    mesh.name = source.name;
    mesh.position.copy(source.position);
    mesh.rotation.copy(source.rotation);
    mesh.scale.copy(source.scale);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    return mesh;
  }

  const group = new THREE.Group();
  group.name = source.name;
  group.position.copy(source.position);
  group.rotation.copy(source.rotation);
  group.scale.copy(source.scale);
  source.children.forEach((child) =>
    group.add(cloneObjNode(child, color, file, partName)),
  );
  return group;
}

function buildBaseStandGroup(sourceParts: THREE.Object3D[]): THREE.Group {
  const wrapper = new THREE.Group();
  wrapper.name = RADAR_BASE_STAND_PART_NAME;

  const assemblyGroup = new THREE.Group();
  wrapper.add(assemblyGroup);

  sourceParts.forEach((sourcePart, index) => {
    const clone = sourcePart.clone(true);
    clone.name = `${RADAR_BASE_STAND_PART_NAME}_child_${index + 1}`;
    assemblyGroup.add(clone);
  });

  const bounds = new THREE.Box3().setFromObject(assemblyGroup);
  const center = bounds.getCenter(new THREE.Vector3());

  assemblyGroup.children.forEach((child) => {
    child.position.sub(center);
    child.updateMatrix();
    child.updateMatrixWorld(true);
  });

  wrapper.position.set(center.x - 2.45, center.y + 0.05, center.z + 0.08);
  wrapper.scale.setScalar(SCALE_BASE_STAND_GROUP);
  return wrapper;
}

function buildHeadControlGroup(sourceParts: THREE.Object3D[]): THREE.Group {
  const wrapper = new THREE.Group();
  wrapper.name = RADAR_HEAD_CONTROL_PART_NAME;

  const assemblyGroup = new THREE.Group();
  wrapper.add(assemblyGroup);

  sourceParts.forEach((sourcePart, index) => {
    const clone = sourcePart.clone(true);
    clone.name = `${RADAR_HEAD_CONTROL_PART_NAME}_child_${index + 1}`;
    const override = HEAD_CONTROL_SYNTHETIC_OVERRIDES[sourcePart.name];

    if (override?.position) {
      clone.position.set(...override.position);
    }

    if (override?.rotation) {
      clone.rotation.set(...override.rotation);
    }

    clone.updateMatrix();
    clone.updateMatrixWorld(true);
    assemblyGroup.add(clone);
  });

  const bounds = new THREE.Box3().setFromObject(assemblyGroup);
  const center = bounds.getCenter(new THREE.Vector3());

  assemblyGroup.children.forEach((child) => {
    child.position.sub(center);
    child.updateMatrix();
    child.updateMatrixWorld(true);
  });

  wrapper.position.copy(center);
  wrapper.scale.setScalar(SCALE_HEAD_CONTROL_GROUP);
  return wrapper;
}

function buildRadarbotGroup(sourceParts: THREE.Object3D[]): THREE.Group {
  const wrapper = new THREE.Group();
  wrapper.name = RADARBOT_1_PART_NAME;

  const assemblyGroup = new THREE.Group();
  wrapper.add(assemblyGroup);

  sourceParts.forEach((sourcePart, index) => {
    const clone = sourcePart.clone(true);
    clone.name = `${RADARBOT_1_PART_NAME}_child_${index + 1}`;
    const override = RADARBOT_SYNTHETIC_OVERRIDES[sourcePart.name];

    if (override?.position) {
      clone.position.set(...override.position);
    }

    if (override?.rotation) {
      clone.rotation.set(...override.rotation);
    }

    clone.updateMatrix();
    clone.updateMatrixWorld(true);
    assemblyGroup.add(clone);
  });

  const bounds = new THREE.Box3().setFromObject(assemblyGroup);
  const center = bounds.getCenter(new THREE.Vector3());

  assemblyGroup.children.forEach((child) => {
    child.position.sub(center);
    child.updateMatrix();
    child.updateMatrixWorld(true);
  });

  wrapper.position.copy(center);
  return wrapper;
}

function buildRadarHeadGroup(sourceParts: THREE.Object3D[]): THREE.Group {
  const wrapper = new THREE.Group();
  wrapper.name = RADAR_HEAD_PART_NAME;

  const assemblyGroup = new THREE.Group();
  wrapper.add(assemblyGroup);

  sourceParts.forEach((sourcePart, index) => {
    const clone = sourcePart.clone(true);
    clone.name = `${RADAR_HEAD_PART_NAME}_child_${index + 1}`;
    clone.updateMatrix();
    clone.updateMatrixWorld(true);
    assemblyGroup.add(clone);
  });

  const bounds = new THREE.Box3().setFromObject(assemblyGroup);
  const center = bounds.getCenter(new THREE.Vector3());

  assemblyGroup.children.forEach((child) => {
    child.position.sub(center);
    child.updateMatrix();
    child.updateMatrixWorld(true);
  });

  wrapper.position.copy(center);
  wrapper.scale.setScalar(SCALE_RADAR_HEAD_GROUP);
  return wrapper;
}

export async function buildRadarStlFallback(
  steps: AssemblyStep[],
): Promise<THREE.Group | null> {
  if (!isRadarStepSet(steps)) return null;

  const loader = new STLLoader();
  const objLoader = new OBJLoader();
  const uniqueFiles = [...new Set(BLUEPRINTS.map((part) => part.file))];
  const stlFiles = uniqueFiles.filter((file) => !isObjFile(file));
  const objFiles = uniqueFiles.filter((file) => isObjFile(file));

  const loadedStlEntries = await Promise.all(
    stlFiles.map(async (file) => {
      const raw = await loadStl(loader, `/learning/radar/stl/${file}`);
      return [file, normalizeGeometry(raw)] as const;
    }),
  );

  const loadedObjEntries = await Promise.all(
    objFiles.map(async (file) => {
      const raw = await loadObj(objLoader, `/learning/radar/obj/${file}`);
      return [file, raw] as const;
    }),
  );

  const loadedMap = new Map<string, LoadedAsset>(loadedStlEntries);
  const loadedObjMap = new Map<string, THREE.Group>(loadedObjEntries);
  const group = new THREE.Group();
  const physicalPartObjects = new Map<string, THREE.Object3D>();
  const partNames = new Set(
    steps.flatMap((step) => step.parts.map((part) => part.name)),
  );

  BLUEPRINTS.forEach((blueprint, index) => {
    const color = getFallbackColor(blueprint.file, index, BLUEPRINTS.length);
    const partName = formatRadarPhysicalPartName(index + 1);

    if (isObjFile(blueprint.file)) {
      const rawObject = loadedObjMap.get(blueprint.file);
      if (!rawObject) return;

      const object = cloneObjNode(rawObject, color, blueprint.file);
      const bounds = new THREE.Box3().setFromObject(object);
      const center = bounds.getCenter(new THREE.Vector3());
      const size = bounds.getSize(new THREE.Vector3());
      const maxDim = Math.max(size.x, size.y, size.z, 1e-6);
      const scale = (0.9 / maxDim) * (blueprint.scaleMul ?? 1);

      object.position.sub(center);
      object.scale.setScalar(scale);

      const wrapper = new THREE.Group();
      wrapper.name = partName;
      wrapper.position.set(...blueprint.position);

      if (blueprint.rotation) {
        wrapper.rotation.set(...blueprint.rotation);
      }

      wrapper.add(object);
      group.add(wrapper);
      physicalPartObjects.set(partName, wrapper);
      return;
    }

    const asset = loadedMap.get(blueprint.file);
    if (!asset) return;

    const material = createRadarMaterial(color);
    const mesh = new THREE.Mesh(asset.geometry, material);
    mesh.name = partName;
    mesh.castShadow = true;
    mesh.receiveShadow = true;

    const scale = asset.normalizedScale * (blueprint.scaleMul ?? 1);
    mesh.scale.set(scale, scale, scale);
    mesh.position.set(...blueprint.position);

    if (blueprint.rotation) {
      mesh.rotation.set(...blueprint.rotation);
    }

    group.add(mesh);
    physicalPartObjects.set(partName, mesh);
  });

  if (partNames.has(RADAR_MC_PART_NAME)) {
    const rawMcObject = await loadObj(
      objLoader,
      `/learning/radar/obj/${RADAR_MC_BLUEPRINT.file}`,
    );
    const mcObject = cloneObjNode(
      rawMcObject,
      getFallbackColor(RADAR_MC_BLUEPRINT.file, 0, 1),
      RADAR_MC_BLUEPRINT.file,
    );
    const bounds = new THREE.Box3().setFromObject(mcObject);
    const center = bounds.getCenter(new THREE.Vector3());
    const size = bounds.getSize(new THREE.Vector3());
    const maxDim = Math.max(size.x, size.y, size.z, 1e-6);
    const scale = (0.9 / maxDim) * RADAR_MC_BLUEPRINT.scaleMul;

    mcObject.position.sub(center);
    mcObject.scale.setScalar(scale);

    const mcWrapper = new THREE.Group();
    mcWrapper.name = RADAR_MC_PART_NAME;
    mcWrapper.position.set(...RADAR_MC_BLUEPRINT.position);
    mcWrapper.rotation.set(...RADAR_MC_BLUEPRINT.rotation);
    mcWrapper.add(mcObject);
    group.add(mcWrapper);
    physicalPartObjects.set(RADAR_MC_PART_NAME, mcWrapper);
  }

  if (partNames.has(RADAR_BASE_STAND_PART_NAME)) {
    const baseStandSourceParts = Array.from({ length: 25 }, (_, index) =>
      physicalPartObjects.get(formatRadarPhysicalPartName(index + 1)),
    ).filter((part): part is THREE.Object3D => Boolean(part));

    if (baseStandSourceParts.length === 25) {
      const baseStandGroup = buildBaseStandGroup(baseStandSourceParts);
      group.add(baseStandGroup);
      physicalPartObjects.set(RADAR_BASE_STAND_PART_NAME, baseStandGroup);
    }
  }

  if (partNames.has(RADAR_HEAD_CONTROL_PART_NAME)) {
    const headControlSourceParts = [
      physicalPartObjects.get(RADAR_MC_PART_NAME),
      physicalPartObjects.get(formatRadarPhysicalPartName(33)),
      physicalPartObjects.get(formatRadarPhysicalPartName(34)),
      physicalPartObjects.get(formatRadarPhysicalPartName(40)),
      physicalPartObjects.get(formatRadarPhysicalPartName(41)),
      physicalPartObjects.get(formatRadarPhysicalPartName(42)),
      physicalPartObjects.get(formatRadarPhysicalPartName(43)),
      physicalPartObjects.get(formatRadarPhysicalPartName(44)),
      physicalPartObjects.get(formatRadarPhysicalPartName(45)),
      physicalPartObjects.get(formatRadarPhysicalPartName(46)),
    ].filter((part): part is THREE.Object3D => Boolean(part));

    if (headControlSourceParts.length === 10) {
      const headControlGroup = buildHeadControlGroup(headControlSourceParts);
      group.add(headControlGroup);
      physicalPartObjects.set(RADAR_HEAD_CONTROL_PART_NAME, headControlGroup);
    }
  }

  if (partNames.has(RADARBOT_1_PART_NAME)) {
    const radarbotSourceParts = [
      physicalPartObjects.get(RADAR_BASE_STAND_PART_NAME),
      physicalPartObjects.get(RADAR_HEAD_CONTROL_PART_NAME),
      ...Array.from({ length: 19 }, (_, index) =>
        physicalPartObjects.get(formatRadarPhysicalPartName(index + 47)),
      ),
    ].filter((part): part is THREE.Object3D => Boolean(part));

    if (radarbotSourceParts.length === 21) {
      const radarbotGroup = buildRadarbotGroup(radarbotSourceParts);
      group.add(radarbotGroup);
      physicalPartObjects.set(RADARBOT_1_PART_NAME, radarbotGroup);
    }
  }

  if (partNames.has(RADAR_HEAD_PART_NAME)) {
    const radarHeadSourceIndexes = [
      29,
      30,
      31,
      32,
      35,
      36,
      37,
      39,
      66,
      67,
      68,
      69,
      70,
      71,
    ];
    const radarHeadSourceParts = radarHeadSourceIndexes
      .map((index) => physicalPartObjects.get(formatRadarPhysicalPartName(index)))
      .filter((part): part is THREE.Object3D => Boolean(part));

    if (radarHeadSourceParts.length === radarHeadSourceIndexes.length) {
      const radarHeadGroup = buildRadarHeadGroup(radarHeadSourceParts);
      group.add(radarHeadGroup);
      physicalPartObjects.set(RADAR_HEAD_PART_NAME, radarHeadGroup);
    }
  }

  return group;
}
