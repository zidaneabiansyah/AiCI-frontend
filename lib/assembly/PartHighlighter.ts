import { gsap } from "gsap";
import * as THREE from "three";

type HighlightMaterial = {
    material: THREE.MeshStandardMaterial;
    emissiveIntensity: number;
    emissiveColor: THREE.Color;
};

export class PartHighlighter {
    constructor(private readonly color = new THREE.Color("#facc15")) {}

    pulse(part: THREE.Object3D): Promise<void> {
        const meshMaterials: HighlightMaterial[] = [];
        const originalScale = part.scale.clone();

        part.traverse((child) => {
            if (!(child instanceof THREE.Mesh)) return;

            const materials = Array.isArray(child.material) ? child.material : [child.material];
            materials.forEach((material) => {
                if (!(material instanceof THREE.MeshStandardMaterial)) return;

                meshMaterials.push({
                    material,
                    emissiveIntensity: material.emissiveIntensity ?? 0,
                    emissiveColor: material.emissive.clone(),
                });
            });
        });

        if (!meshMaterials.length) {
            return Promise.resolve();
        }

        return new Promise((resolve) => {
            const timeline = gsap.timeline({
                onComplete: () => {
                    meshMaterials.forEach(({ material, emissiveColor, emissiveIntensity }) => {
                        material.emissive.copy(emissiveColor);
                        material.emissiveIntensity = emissiveIntensity;
                        material.needsUpdate = true;
                    });
                    part.scale.copy(originalScale);
                    resolve();
                },
            });

            meshMaterials.forEach(({ material }) => {
                material.emissive.copy(this.color);
                material.needsUpdate = true;
                timeline.to(
                    material,
                    {
                        emissiveIntensity: 0.65,
                        duration: 0.18,
                        yoyo: true,
                        repeat: 1,
                        ease: "sine.inOut",
                    },
                    0
                );
            });

            timeline.to(
                part.scale,
                {
                    x: originalScale.x * 1.04,
                    y: originalScale.y * 1.04,
                    z: originalScale.z * 1.04,
                    duration: 0.18,
                    yoyo: true,
                    repeat: 1,
                    ease: "sine.inOut",
                },
                0
            );
        });
    }
}
