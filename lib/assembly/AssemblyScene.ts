import * as THREE from "three";
import { gsap } from "gsap";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { AssemblyStep } from "@/lib/assembly/types";
import { PartHighlighter } from "@/lib/assembly/PartHighlighter";
import { StepManager } from "@/lib/assembly/StepManager";
import { buildRadarStlFallback, RADAR_FALLBACK_SIGNATURE, RADAR_PHYSICAL_PART_COUNT } from "@/lib/assembly/radarStlFallback";

type AssemblySceneOptions = {
    container: HTMLElement;
    modelUrl: string;
    steps: AssemblyStep[];
    offsetY?: number;
};

type LivePartTransform = {
    position: [number, number, number];
    rotation: [number, number, number];
};

type ConfiguredPartTransform = {
    startPosition: [number, number, number];
    startRotation: [number, number, number];
    finalPosition: [number, number, number];
    finalRotation: [number, number, number];
};

export type LiveCameraState = {
    position: [number, number, number];
    target: [number, number, number];
};

export type CameraPreset = {
    position: [number, number, number];
    target: [number, number, number];
    duration?: number;
};

export const ASSEMBLY_SCENE_SIGNATURE = RADAR_FALLBACK_SIGNATURE;
const RADAR_MC_PART_NAME = "radar_step_mc";

function formatRadarPhysicalPartName(index: number): string {
    return `radar_step_${String(index).padStart(2, "0")}`;
}

export class AssemblyScene {
    private readonly container: HTMLElement;
    private readonly modelUrl: string;
    private readonly steps: AssemblyStep[];
    private readonly offsetY: number;
    private readonly scene = new THREE.Scene();
    private readonly camera = new THREE.PerspectiveCamera(45, 1, 0.1, 200);
    private readonly renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    private controls!: OrbitControls;
    private frameId: number | null = null;
    private resizeObserver: ResizeObserver | null = null;
    private stepManager: StepManager | null = null;
    private rootGroup: THREE.Group | null = null;
    private debugFocusHelper: THREE.AxesHelper | null = null;
    private cameraTween: gsap.core.Tween | null = null;
    private targetTween: gsap.core.Tween | null = null;

    constructor(options: AssemblySceneOptions) {
        this.container = options.container;
        this.modelUrl = options.modelUrl;
        this.steps = options.steps;
        this.offsetY = options.offsetY ?? 5;
    }

    async init(): Promise<void> {
        this.setupRenderer();
        this.setupScene();
        this.setupControls();

        const modelRoot = await this.loadModelWithFallback();
        this.rootGroup = modelRoot;
        this.scene.add(modelRoot);

        const highlighter = new PartHighlighter();
        this.stepManager = new StepManager({
            steps: this.steps,
            highlighter,
            offsetY: this.offsetY,
        });
        this.stepManager.registerParts(modelRoot);

        this.handleResize();
        this.startRenderLoop();
        this.observeResize();
    }

    getStepManager(): StepManager {
        if (!this.stepManager) throw new Error("StepManager is not initialized.");
        return this.stepManager;
    }

    getPartTransform(partName: string): LivePartTransform | null {
        const part = this.rootGroup?.getObjectByName(partName);
        if (!part) return null;

        return {
            position: [part.position.x, part.position.y, part.position.z],
            rotation: [part.rotation.x, part.rotation.y, part.rotation.z],
        };
    }

    getConfiguredPartTransform(
        stepIndex: number,
        partName: string
    ): ConfiguredPartTransform | null {
        return this.stepManager?.getStepPartTransform(stepIndex, partName) ?? null;
    }

    getCameraState(): LiveCameraState {
        return {
            position: [this.camera.position.x, this.camera.position.y, this.camera.position.z],
            target: [this.controls.target.x, this.controls.target.y, this.controls.target.z],
        };
    }

    setPartTransform(
        partName: string,
        transform: Partial<LivePartTransform>
    ): void {
        const part = this.rootGroup?.getObjectByName(partName);
        if (!part) return;

        if (transform.position) {
            part.position.set(...transform.position);
        }

        if (transform.rotation) {
            part.rotation.set(...transform.rotation);
        }

        part.updateMatrix();
        part.updateMatrixWorld(true);
    }

    setPartVisible(partName: string, visible: boolean): void {
        const part = this.rootGroup?.getObjectByName(partName);
        if (!part) return;

        part.visible = visible;
        part.updateMatrixWorld(true);
    }

    focusPart(partName: string | null): void {
        if (this.debugFocusHelper?.parent) {
            this.debugFocusHelper.parent.remove(this.debugFocusHelper);
        }

        this.debugFocusHelper = null;

        if (!partName) return;

        const part = this.rootGroup?.getObjectByName(partName);
        if (!part) return;

        const helper = new THREE.AxesHelper(0.45);
        const helperMaterials = Array.isArray(helper.material) ? helper.material : [helper.material];
        helperMaterials.forEach((material) => {
            material.depthTest = false;
            material.transparent = true;
            material.opacity = 0.98;
        });
        helper.renderOrder = 14;
        part.add(helper);
        this.debugFocusHelper = helper;
    }

    setCameraPreset(preset: CameraPreset, immediate = false): void {
        const [px, py, pz] = preset.position;
        const [tx, ty, tz] = preset.target;

        this.cameraTween?.kill();
        this.targetTween?.kill();

        if (immediate) {
            this.camera.position.set(px, py, pz);
            this.controls.target.set(tx, ty, tz);
            this.controls.update();
            return;
        }

        const duration = preset.duration ?? 0.7;
        this.cameraTween = gsap.to(this.camera.position, {
            x: px,
            y: py,
            z: pz,
            duration,
            ease: "power2.inOut",
            onUpdate: () => {
                this.camera.updateProjectionMatrix();
            },
        });
        this.targetTween = gsap.to(this.controls.target, {
            x: tx,
            y: ty,
            z: tz,
            duration,
            ease: "power2.inOut",
            onUpdate: () => {
                this.controls.update();
            },
        });
    }

    dispose(): void {
        if (this.frameId !== null) {
            cancelAnimationFrame(this.frameId);
            this.frameId = null;
        }

        if (this.resizeObserver) {
            this.resizeObserver.disconnect();
            this.resizeObserver = null;
        }

        this.controls?.dispose();
        this.cameraTween?.kill();
        this.targetTween?.kill();
        this.disposeSceneGraph(this.scene);
        this.renderer.forceContextLoss();
        this.renderer.dispose();

        if (this.renderer.domElement.parentElement === this.container) {
            this.container.removeChild(this.renderer.domElement);
        }
    }

    private setupRenderer(): void {
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.renderer.setClearColor("#c2d3dc");
        this.renderer.outputColorSpace = THREE.SRGBColorSpace;
        this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
        this.renderer.toneMappingExposure = 1.06;
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        this.container.appendChild(this.renderer.domElement);
    }

    private setupScene(): void {
        this.camera.position.set(5, 4, 7.5);

        this.scene.add(new THREE.AmbientLight("#dbeafe", 0.56));

        const keyLight = new THREE.DirectionalLight("#ffffff", 1.28);
        keyLight.position.set(6, 10, 4);
        keyLight.castShadow = true;
        keyLight.shadow.mapSize.set(1024, 1024);
        this.scene.add(keyLight);

        const fillLight = new THREE.HemisphereLight("#93c5fd", "#0f172a", 0.24);
        this.scene.add(fillLight);

        this.scene.add(this.createAxesIndicator());
    }

    private setupControls(): void {
        this.controls = new OrbitControls(this.camera, this.renderer.domElement);
        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.08;
        this.controls.enablePan = true;
        this.controls.screenSpacePanning = true;
        this.controls.minDistance = 1.4;
        this.controls.maxDistance = 28;
        this.controls.minPolarAngle = 0.01;
        this.controls.maxPolarAngle = Math.PI - 0.01;
        this.controls.target.set(0, 0.4, 0.25);
        this.controls.update();
    }

    private async loadModelWithFallback(): Promise<THREE.Group> {
        try {
            const gltf = await new Promise<THREE.Group>((resolve, reject) => {
                new GLTFLoader().load(
                    this.modelUrl,
                    (loaded) => resolve(loaded.scene),
                    undefined,
                    (error) => reject(error)
                );
            });

            gltf.traverse((child) => {
                if (!(child instanceof THREE.Mesh)) return;
                child.castShadow = true;
                child.receiveShadow = true;
            });

            return gltf;
        } catch {
            try {
                const stlFallback = await buildRadarStlFallback(this.steps);
                if (stlFallback) return stlFallback;
            } catch {
                // ignore and continue to primitive fallback
            }

            return this.createFallbackAssembly();
        }
    }

    private createFallbackAssembly(): THREE.Group {
        const group = new THREE.Group();
        const requestedPartNames = new Set(this.steps.flatMap((step) => step.parts.map((part) => part.name)));

        Array.from({ length: RADAR_PHYSICAL_PART_COUNT }, (_, index) => index).forEach((index) => {
            const geometry = new THREE.BoxGeometry(0.7, 0.22, 0.7);
            const hue = (index / Math.max(RADAR_PHYSICAL_PART_COUNT, 1)) * 0.6;
            const material = new THREE.MeshStandardMaterial({
                color: new THREE.Color().setHSL(hue + 0.1, 0.72, 0.6),
                roughness: 0.36,
                metalness: 0.08,
                emissive: new THREE.Color().setHSL(hue + 0.1, 0.72, 0.6).multiplyScalar(0.07),
            });
            const mesh = new THREE.Mesh(geometry, material);
            mesh.name = formatRadarPhysicalPartName(index + 1);
            mesh.castShadow = true;
            mesh.receiveShadow = true;

            const col = index % 6;
            const row = Math.floor(index / 6);
            mesh.position.set((col - 2.5) * 0.85, row * 0.25, (row % 2) * 0.55);
            group.add(mesh);
        });

        if (requestedPartNames.has(RADAR_MC_PART_NAME)) {
            const mcMesh = new THREE.Mesh(
                new THREE.BoxGeometry(1.3, 0.75, 1.05),
                new THREE.MeshStandardMaterial({
                    color: "#d9e6f2",
                    roughness: 0.34,
                    metalness: 0.08,
                    emissive: new THREE.Color("#d9e6f2").multiplyScalar(0.06),
                })
            );
            mcMesh.name = RADAR_MC_PART_NAME;
            mcMesh.castShadow = true;
            mcMesh.receiveShadow = true;
            mcMesh.position.set(0, 1.10, 0.48);
            group.add(mcMesh);
        }

        return group;
    }

    private observeResize(): void {
        this.resizeObserver = new ResizeObserver(() => this.handleResize());
        this.resizeObserver.observe(this.container);
    }

    private handleResize(): void {
        const width = Math.max(this.container.clientWidth, 1);
        const height = Math.max(this.container.clientHeight, 1);

        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(width, height);
    }

    private startRenderLoop(): void {
        const render = () => {
            this.controls.update();
            this.renderer.render(this.scene, this.camera);
            this.frameId = requestAnimationFrame(render);
        };
        render();
    }

    private createAxesIndicator(): THREE.Group {
        const group = new THREE.Group();
        const axisLength = 1.6;
        const axes = new THREE.AxesHelper(axisLength);
        const axisMaterials = Array.isArray(axes.material) ? axes.material : [axes.material];

        axisMaterials.forEach((material) => {
            material.depthTest = false;
            material.transparent = true;
            material.opacity = 0.95;
        });
        axes.renderOrder = 10;
        group.add(axes);

        const origin = new THREE.Mesh(
            new THREE.SphereGeometry(0.05, 16, 16),
            new THREE.MeshBasicMaterial({ color: "#e2e8f0", depthTest: false })
        );
        origin.renderOrder = 11;
        group.add(origin);

        const xLabel = this.createAxisLabel("X", "#ef4444");
        xLabel.position.set(axisLength + 0.2, 0, 0);
        group.add(xLabel);

        const yLabel = this.createAxisLabel("Y", "#22c55e");
        yLabel.position.set(0, axisLength + 0.2, 0);
        group.add(yLabel);

        const zLabel = this.createAxisLabel("Z", "#3b82f6");
        zLabel.position.set(0, 0, axisLength + 0.2);
        group.add(zLabel);

        return group;
    }

    private createAxisLabel(text: string, color: string): THREE.Sprite {
        return this.createBadgeSprite(text, color, 58);
    }

    private createBadgeSprite(text: string, accentColor: string, fontSize: number): THREE.Sprite {
        const canvas = document.createElement("canvas");
        canvas.width = 128;
        canvas.height = 128;

        const context = canvas.getContext("2d");
        if (!context) {
            const fallbackMaterial = new THREE.SpriteMaterial({ color: accentColor, depthTest: false });
            const fallbackSprite = new THREE.Sprite(fallbackMaterial);
            fallbackSprite.scale.set(0.32, 0.32, 0.32);
            fallbackSprite.renderOrder = 11;
            return fallbackSprite;
        }

        context.clearRect(0, 0, canvas.width, canvas.height);
        context.fillStyle = "rgba(15, 23, 42, 0.9)";
        context.beginPath();
        context.arc(64, 64, 42, 0, Math.PI * 2);
        context.fill();

        context.strokeStyle = accentColor;
        context.lineWidth = 6;
        context.stroke();

        context.fillStyle = accentColor;
        context.font = `bold ${fontSize}px sans-serif`;
        context.textAlign = "center";
        context.textBaseline = "middle";
        context.fillText(text, 64, 70);

        const texture = new THREE.CanvasTexture(canvas);
        texture.colorSpace = THREE.SRGBColorSpace;

        const material = new THREE.SpriteMaterial({
            map: texture,
            transparent: true,
            depthTest: false,
        });
        const sprite = new THREE.Sprite(material);
        sprite.scale.set(0.32, 0.32, 0.32);
        sprite.renderOrder = 11;
        return sprite;
    }

    private disposeSceneGraph(root: THREE.Object3D): void {
        root.traverse((child) => {
            if (child instanceof THREE.Mesh || child instanceof THREE.LineSegments) {
                child.geometry.dispose();
                this.disposeMaterial(child.material);
            }

            if (child instanceof THREE.Sprite) {
                this.disposeMaterial(child.material);
            }
        });
    }

    private disposeMaterial(material: THREE.Material | THREE.Material[]): void {
        const materials = Array.isArray(material) ? material : [material];

        materials.forEach((entry) => {
            Object.values(entry).forEach((value) => {
                if (value instanceof THREE.Texture) {
                    value.dispose();
                }
            });
            entry.dispose();
        });
    }
}
