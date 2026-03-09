"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { STLLoader } from "three/examples/jsm/loaders/STLLoader.js";
import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader.js";

type PartPreview3DProps = {
    file: string;
    color: string;
    rotation?: [number, number, number];
    className?: string;
};

let sharedPreviewRenderer: THREE.WebGLRenderer | null = null;
let sharedPreviewScene: THREE.Scene | null = null;
let sharedPreviewCamera: THREE.PerspectiveCamera | null = null;
let sharedPreviewLightsReady = false;

function getSharedPreviewContext(): {
    renderer: THREE.WebGLRenderer;
    scene: THREE.Scene;
    camera: THREE.PerspectiveCamera;
} {
    if (!sharedPreviewRenderer) {
        sharedPreviewRenderer = new THREE.WebGLRenderer({
            antialias: true,
            alpha: true,
            powerPreference: "high-performance",
        });
        sharedPreviewRenderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        sharedPreviewRenderer.setClearColor(0x000000, 0);
        sharedPreviewRenderer.outputColorSpace = THREE.SRGBColorSpace;
        sharedPreviewRenderer.toneMapping = THREE.ACESFilmicToneMapping;
        sharedPreviewRenderer.toneMappingExposure = 1.04;
    }

    if (!sharedPreviewScene) {
        sharedPreviewScene = new THREE.Scene();
    }

    if (!sharedPreviewCamera) {
        sharedPreviewCamera = new THREE.PerspectiveCamera(28, 1, 0.1, 100);
        sharedPreviewCamera.position.set(0, 0, 4);
    }

    if (!sharedPreviewLightsReady) {
        sharedPreviewScene.add(new THREE.AmbientLight("#ffffff", 1.05));

        const keyLight = new THREE.DirectionalLight("#ffffff", 1.2);
        keyLight.position.set(3, 4, 5);
        sharedPreviewScene.add(keyLight);

        const rimLight = new THREE.DirectionalLight("#c7d9e8", 0.7);
        rimLight.position.set(-4, -2, 3);
        sharedPreviewScene.add(rimLight);
        sharedPreviewLightsReady = true;
    }

    return {
        renderer: sharedPreviewRenderer,
        scene: sharedPreviewScene,
        camera: sharedPreviewCamera,
    };
}

const stlLoader = new STLLoader();
const objLoader = new OBJLoader();
const geometryCache = new Map<string, THREE.BufferGeometry>();
const objectCache = new Map<string, THREE.Group>();

function isObjFile(file: string): boolean {
    return file.toLowerCase().endsWith(".obj");
}

async function loadGeometry(file: string): Promise<THREE.BufferGeometry> {
    const cached = geometryCache.get(file);
    if (cached) return cached.clone();

    const geometry = await new Promise<THREE.BufferGeometry>((resolve, reject) => {
        stlLoader.load(
            `/learning/radar/stl/${file}`,
            (loaded) => resolve(loaded),
            undefined,
            (error) => reject(error)
        );
    });

    geometry.computeVertexNormals();
    geometry.center();
    geometryCache.set(file, geometry.clone());
    return geometry;
}

async function loadObject(file: string): Promise<THREE.Group> {
    const cached = objectCache.get(file);
    if (cached) return cached;

    const object = await new Promise<THREE.Group>((resolve, reject) => {
        objLoader.load(
            `/learning/radar/obj/${file}`,
            (loaded) => resolve(loaded),
            undefined,
            (error) => reject(error)
        );
    });

    objectCache.set(file, object);
    return object;
}

function createPreviewMaterial(color: string): THREE.MeshStandardMaterial {
    const resolvedColor = new THREE.Color(color);

    return new THREE.MeshStandardMaterial({
        color: resolvedColor,
        roughness: 0.36,
        metalness: 0.08,
        emissive: resolvedColor.clone().multiplyScalar(0.07),
    });
}

function getPreviewObjColor(file: string, partName: string | undefined, fallbackColor: string): string {
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

function cloneRenderableObject(
    source: THREE.Object3D,
    color: string,
    file: string,
    inheritedPartName?: string
): THREE.Object3D {
    const partName = source.name || inheritedPartName;

    if (source instanceof THREE.Mesh) {
        const mesh = new THREE.Mesh(
            source.geometry.clone(),
            createPreviewMaterial(getPreviewObjColor(file, partName, color))
        );
        mesh.name = source.name;
        mesh.position.copy(source.position);
        mesh.rotation.copy(source.rotation);
        mesh.scale.copy(source.scale);
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        return mesh;
    }

    const clone = new THREE.Group();
    clone.name = source.name;
    clone.position.copy(source.position);
    clone.rotation.copy(source.rotation);
    clone.scale.copy(source.scale);

    source.children.forEach((child) => {
        clone.add(cloneRenderableObject(child, color, file, partName));
    });

    return clone;
}

function centerAndScaleObject(object: THREE.Object3D): void {
    const box = new THREE.Box3().setFromObject(object);
    const center = box.getCenter(new THREE.Vector3());
    const size = box.getSize(new THREE.Vector3());
    const maxDim = Math.max(size.x, size.y, size.z, 1e-6);
    const scale = 1.7 / maxDim;

    object.position.sub(center);
    object.scale.setScalar(scale);
}

function disposeRenderableObject(object: THREE.Object3D): void {
    object.traverse((child) => {
        if (!(child instanceof THREE.Mesh)) return;
        child.geometry.dispose();

        if (Array.isArray(child.material)) {
            child.material.forEach((material) => material.dispose());
        } else {
            child.material.dispose();
        }
    });
}

export function PartPreview3D({ file, color, rotation = [-0.5, 0.7, 0], className = "" }: PartPreview3DProps) {
    const hostRef = useRef<HTMLDivElement | null>(null);
    const rotationX = rotation[0];
    const rotationY = rotation[1];
    const rotationZ = rotation[2];

    useEffect(() => {
        const host = hostRef.current;
        if (!host) return;

        let disposed = false;
        const { scene, camera, renderer } = getSharedPreviewContext();

        renderer.setSize(host.clientWidth || 96, host.clientHeight || 96);
        host.innerHTML = "";
        host.appendChild(renderer.domElement);

        let renderObject: THREE.Object3D | null = null;

        const loadRenderable = async (): Promise<THREE.Object3D> => {
            if (isObjFile(file)) {
                const object = await loadObject(file);
                const renderable = cloneRenderableObject(object, color, file);
                centerAndScaleObject(renderable);
                return renderable;
            }

            const geometry = await loadGeometry(file);
            geometry.computeBoundingBox();
            const size = new THREE.Vector3();
            geometry.boundingBox?.getSize(size);

            const maxDim = Math.max(size.x, size.y, size.z, 1e-6);
            const scale = 1.7 / maxDim;

            const mesh = new THREE.Mesh(geometry, createPreviewMaterial(color));
            mesh.scale.setScalar(scale);
            mesh.castShadow = true;
            mesh.receiveShadow = true;
            return mesh;
        };

        loadRenderable()
            .then((object) => {
                if (disposed) return;

                renderObject = object;
                renderObject.rotation.set(rotationX, rotationY, rotationZ);
                scene.add(renderObject);

                const cameraDistance = 3.3;
                camera.position.set(0, 0, cameraDistance);
                camera.lookAt(0, 0, 0);
                renderer.render(scene, camera);
            })
            .catch(() => {
                if (disposed) return;

                const fallback = new THREE.Mesh(
                    new THREE.BoxGeometry(1.2, 1.2, 1.2),
                    createPreviewMaterial(color)
                );
                fallback.rotation.set(rotationX, rotationY, rotationZ);
                scene.add(fallback);
                renderObject = fallback;
                renderer.render(scene, camera);
            });

        return () => {
            disposed = true;

            if (renderObject) {
                scene.remove(renderObject);
                disposeRenderableObject(renderObject);
            }
            if (renderer.domElement.parentElement === host) {
                host.removeChild(renderer.domElement);
            }
        };
    }, [color, file, rotationX, rotationY, rotationZ]);

    return <div ref={hostRef} className={className} />;
}
