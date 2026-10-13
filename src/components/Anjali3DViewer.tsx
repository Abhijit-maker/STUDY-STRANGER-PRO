import React, { useRef, useState, useEffect, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Float, ContactShadows, Sparkles } from "@react-three/drei";
import * as THREE from "three";
import { Sparkles as SparklesIcon, RotateCcw, Palette, Sliders, Check, Eye } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

export type AnjaliAnimationState = "idle" | "talking" | "dancing" | "thinking" | "wave" | "clap" | "shy" | "laugh" | "cry" | "run" | "walk";

interface Anjali3DViewerProps {
  state?: "idle" | "listening" | "thinking" | "speaking" | "error" | "processing";
  animationState?: AnjaliAnimationState;
  onAnimationChange?: (anim: AnjaliAnimationState) => void;
  characterName?: string;
  isAudioPlaying?: boolean;
}

// Procedurally Generated 3D Anime School Girl with Custom Accessories & Colors
function AnjaliRiggedCharacter({
  state,
  animState,
  isAudioPlaying,
  glasses = false,
  headphones = false,
  catEars = false,
  hairColor = "navy",
  skirtColor = "navy",
  eyeColor = "blue"
}: {
  state: string;
  animState: AnjaliAnimationState;
  isAudioPlaying: boolean;
  glasses?: boolean;
  headphones?: boolean;
  catEars?: boolean;
  hairColor?: string;
  skirtColor?: string;
  eyeColor?: string;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const headRef = useRef<THREE.Group>(null);
  const leftArmRef = useRef<THREE.Group>(null);
  const rightArmRef = useRef<THREE.Group>(null);
  const leftForearmRef = useRef<THREE.Group>(null);
  const rightForearmRef = useRef<THREE.Group>(null);
  const torsoRef = useRef<THREE.Group>(null);
  const hipsRef = useRef<THREE.Group>(null);
  const leftLegRef = useRef<THREE.Group>(null);
  const rightLegRef = useRef<THREE.Group>(null);
  const mouthRef = useRef<THREE.Mesh>(null);
  const leftEyeRef = useRef<THREE.Group>(null);
  const rightEyeRef = useRef<THREE.Group>(null);
  const leftBlushRef = useRef<THREE.Mesh>(null);
  const rightBlushRef = useRef<THREE.Mesh>(null);

  // Convert color keys to hex colors
  const hairColorHex = useMemo(() => {
    switch (hairColor) {
      case "golden": return "#F4C430";
      case "pink": return "#FF85A1";
      case "blue": return "#4EA8DE";
      case "auburn": return "#8B4513";
      case "navy":
      default: return "#2B2D42";
    }
  }, [hairColor]);

  const skirtColorHex = useMemo(() => {
    switch (skirtColor) {
      case "crimson": return "#9B2226";
      case "emerald": return "#155F3E";
      case "purple": return "#5A189A";
      case "amber": return "#D97706";
      case "navy":
      default: return "#1D3557";
    }
  }, [skirtColor]);

  const eyeColorHex = useMemo(() => {
    switch (eyeColor) {
      case "brown": return "#6F4E37";
      case "green": return "#2A9D8F";
      case "purple": return "#8338EC";
      case "red": return "#E63946";
      case "blue":
      default: return "#457B9D";
    }
  }, [eyeColor]);

  // Materials for Anime School Uniform & Accessories
  const materials = useMemo(() => {
    return {
      skin: new THREE.MeshStandardMaterial({ color: "#FFE4D6", roughness: 0.5 }), // Fair anime skin
      hair: new THREE.MeshStandardMaterial({ color: hairColorHex, roughness: 0.7 }), // Stylized hair color
      shirt: new THREE.MeshStandardMaterial({ color: "#FFFFFF", roughness: 0.9 }), // White shirt
      skirt: new THREE.MeshStandardMaterial({ color: skirtColorHex, roughness: 0.8 }), // Skirt & sailor collar
      ribbon: new THREE.MeshStandardMaterial({ color: "#E63946", roughness: 0.4 }), // Red ribbon
      socks: new THREE.MeshStandardMaterial({ color: "#111111", roughness: 0.9 }), // Black knee-high socks
      shoes: new THREE.MeshStandardMaterial({ color: "#5C4033", roughness: 0.5 }), // Brown shoes
      eyesWhite: new THREE.MeshStandardMaterial({ color: "#FFFFFF", roughness: 0.1 }),
      iris: new THREE.MeshStandardMaterial({ color: eyeColorHex, roughness: 0.1 }), // Custom eyes
      pupil: new THREE.MeshBasicMaterial({ color: "#000000" }),
      mouth: new THREE.MeshStandardMaterial({ color: "#D90429", roughness: 0.3 }),
      blush: new THREE.MeshStandardMaterial({ color: "#FF85A1", roughness: 0.9, transparent: true, opacity: 0.5 }),
      blackPlastic: new THREE.MeshStandardMaterial({ color: "#111111", roughness: 0.3, metalness: 0.5 }),
      goldMetal: new THREE.MeshStandardMaterial({ color: "#FFD700", roughness: 0.2, metalness: 0.9, emissive: "#FFB700", emissiveIntensity: 0.2 }),
      pinkEarInner: new THREE.MeshStandardMaterial({ color: "#FFB3C1", roughness: 0.6 }),
      orangeGlow: new THREE.MeshStandardMaterial({ color: "#FF7A30", roughness: 0.2, metalness: 0.4, emissive: "#FF5722", emissiveIntensity: 0.6 })
    };
  }, [hairColorHex, skirtColorHex, eyeColorHex]);

  useFrame((stateContext) => {
    const t = stateContext.clock.getElapsedTime();
    const isSpeaking = state === "speaking" || isAudioPlaying || animState === "talking";
    const isDancing = animState === "dancing";
    const isThinking = animState === "thinking";
    const isWaving = animState === "wave";
    const isClapping = animState === "clap";
    const isLaughing = animState === "laugh";
    const isCrying = animState === "cry";
    const isRunning = animState === "run";
    const isWalking = animState === "walk";

    // 1. Core breathing & blinking
    const isBlinking = Math.sin(t * 1.5) > 0.97;
    if (leftEyeRef.current && rightEyeRef.current) {
      const eyeScaleY = isBlinking ? 0.05 : 1;
      leftEyeRef.current.scale.y = THREE.MathUtils.lerp(leftEyeRef.current.scale.y, eyeScaleY, 0.4);
      rightEyeRef.current.scale.y = THREE.MathUtils.lerp(rightEyeRef.current.scale.y, eyeScaleY, 0.4);
    }

    if (torsoRef.current && !isRunning && !isWalking && !isDancing) {
      torsoRef.current.position.y = 0.9 + Math.sin(t * 2.5) * 0.01;
    }

    // Dynamic Blush Cheek animation (pulses or lights up when happy/laughing)
    if (leftBlushRef.current && rightBlushRef.current) {
      const blushIntensity = isLaughing || isDancing || isSpeaking ? 1.0 : 0.6 + Math.sin(t * 3) * 0.25;
      leftBlushRef.current.scale.set(1, 0.4, 0.1);
      rightBlushRef.current.scale.set(1, 0.4, 0.1);
      (leftBlushRef.current.material as THREE.MeshStandardMaterial).opacity = 0.2 + blushIntensity * 0.35;
      (rightBlushRef.current.material as THREE.MeshStandardMaterial).opacity = 0.2 + blushIntensity * 0.35;
    }

    // 2. Mouth Lip Sync
    if (mouthRef.current) {
      if (isSpeaking) {
        const talkWave = Math.abs(Math.sin(t * 15)) * 0.8 + Math.abs(Math.cos(t * 10)) * 0.2;
        mouthRef.current.scale.y = THREE.MathUtils.lerp(mouthRef.current.scale.y, 0.2 + talkWave * 1.5, 0.3);
        mouthRef.current.scale.x = THREE.MathUtils.lerp(mouthRef.current.scale.x, 0.8 + talkWave * 0.4, 0.3);
      } else if (isLaughing) {
        mouthRef.current.scale.set(1.4, 1.2 + Math.abs(Math.sin(t * 12)) * 0.3, 1);
      } else if (isCrying) {
        mouthRef.current.scale.set(0.6, 0.2, 1);
      } else {
        mouthRef.current.scale.set(0.8, 0.1, 1); // Cute small anime smile
      }
    }

    // 3. Complex Choreography based on AnimState
    if (isRunning) {
      const runSpeed = 16;
      if (groupRef.current) {
        groupRef.current.position.y = -0.8 + Math.abs(Math.sin(t * runSpeed)) * 0.12;
        groupRef.current.rotation.y = 0;
      }
      if (torsoRef.current) torsoRef.current.rotation.x = 0.25; // Lean forward
      if (headRef.current) headRef.current.rotation.x = -0.15;
      
      // Arm Swings
      if (leftArmRef.current && rightArmRef.current) {
        leftArmRef.current.rotation.set(Math.sin(t * runSpeed) * 1.4, 0, 0.2);
        rightArmRef.current.rotation.set(-Math.sin(t * runSpeed) * 1.4, 0, -0.2);
      }
      if (leftForearmRef.current && rightForearmRef.current) {
        leftForearmRef.current.rotation.x = -1.2;
        rightForearmRef.current.rotation.x = -1.2;
      }
      // Leg Swings
      if (leftLegRef.current && rightLegRef.current) {
        leftLegRef.current.rotation.x = -Math.sin(t * runSpeed) * 1.2;
        rightLegRef.current.rotation.x = Math.sin(t * runSpeed) * 1.2;
      }
    } 
    else if (isWalking) {
      const walkSpeed = 8;
      if (groupRef.current) {
        groupRef.current.position.y = -0.9 + Math.abs(Math.sin(t * walkSpeed)) * 0.05;
        groupRef.current.rotation.y = 0;
      }
      if (torsoRef.current) torsoRef.current.rotation.x = 0.05;
      if (headRef.current) headRef.current.rotation.x = 0;

      if (leftArmRef.current && rightArmRef.current) {
        leftArmRef.current.rotation.set(Math.sin(t * walkSpeed) * 0.6, 0, 0.1);
        rightArmRef.current.rotation.set(-Math.sin(t * walkSpeed) * 0.6, 0, -0.1);
      }
      if (leftForearmRef.current && rightForearmRef.current) {
        leftForearmRef.current.rotation.x = -0.1;
        rightForearmRef.current.rotation.x = -0.1;
      }
      if (leftLegRef.current && rightLegRef.current) {
        leftLegRef.current.rotation.x = -Math.sin(t * walkSpeed) * 0.7;
        rightLegRef.current.rotation.x = Math.sin(t * walkSpeed) * 0.7;
      }
    }
    else if (isDancing) {
      const danceSpeed = 8.5;
      if (groupRef.current) {
        groupRef.current.position.y = -0.9 + Math.abs(Math.sin(t * danceSpeed)) * 0.15;
        groupRef.current.rotation.y = Math.sin(t * 4) * 0.3;
      }
      if (torsoRef.current) torsoRef.current.rotation.x = 0;
      if (headRef.current) {
        headRef.current.rotation.set(Math.sin(t * 10) * 0.1, Math.cos(t * 6) * 0.2, Math.sin(t * 8) * 0.15);
      }
      if (hipsRef.current) {
        hipsRef.current.rotation.z = Math.sin(t * danceSpeed) * 0.2;
      }
      if (leftArmRef.current && rightArmRef.current) {
        leftArmRef.current.rotation.set(Math.cos(t * danceSpeed) * 0.6, 0, Math.sin(t * danceSpeed) * 0.8 + 1.2);
        rightArmRef.current.rotation.set(-Math.cos(t * danceSpeed) * 0.6, 0, -Math.sin(t * danceSpeed + Math.PI) * 0.8 - 1.2);
      }
      if (leftForearmRef.current && rightForearmRef.current) {
        leftForearmRef.current.rotation.x = Math.sin(t * (danceSpeed * 1.5)) * 0.7 - 0.8;
        rightForearmRef.current.rotation.x = Math.cos(t * (danceSpeed * 1.5)) * 0.7 - 0.8;
      }
      if (leftLegRef.current && rightLegRef.current) {
        leftLegRef.current.rotation.x = Math.sin(t * danceSpeed) * 0.4;
        rightLegRef.current.rotation.x = -Math.sin(t * danceSpeed) * 0.4;
      }
    }
    else if (isLaughing) {
      if (groupRef.current) {
        groupRef.current.position.y = -0.9 + Math.abs(Math.sin(t * 15)) * 0.05;
        groupRef.current.rotation.y = 0;
      }
      if (headRef.current) {
        headRef.current.rotation.set(-0.2 + Math.sin(t * 15) * 0.05, Math.sin(t * 5) * 0.1, 0);
      }
      if (torsoRef.current) torsoRef.current.rotation.x = -0.1;
      if (leftArmRef.current && rightArmRef.current) {
        leftArmRef.current.rotation.set(0.5, 0, 0.4);
        rightArmRef.current.rotation.set(0.5, 0, -0.4);
      }
      if (leftForearmRef.current && rightForearmRef.current) {
        leftForearmRef.current.rotation.x = -1.5;
        rightForearmRef.current.rotation.x = -1.5;
      }
      if (leftLegRef.current && rightLegRef.current) {
        leftLegRef.current.rotation.x = 0;
        rightLegRef.current.rotation.x = 0;
      }
    }
    else if (isCrying) {
      if (groupRef.current) {
        groupRef.current.position.y = -0.95 + Math.abs(Math.sin(t * 10)) * 0.015; // Shaking
        groupRef.current.rotation.y = 0;
      }
      if (headRef.current) {
        headRef.current.rotation.set(0.5, Math.sin(t * 2) * 0.05, 0); // Head heavily down
      }
      if (torsoRef.current) torsoRef.current.rotation.x = 0.2; // Slumped shoulders
      if (leftArmRef.current && rightArmRef.current) {
        leftArmRef.current.rotation.set(-1.6, 0, 0.15); // Arms tight to body / wiping tears
        rightArmRef.current.rotation.set(-1.6, 0, -0.15);
      }
      if (leftForearmRef.current && rightForearmRef.current) {
        leftForearmRef.current.rotation.x = -2.0; // Hands on face
        rightForearmRef.current.rotation.x = -2.0;
      }
      if (leftLegRef.current && rightLegRef.current) {
        leftLegRef.current.rotation.x = 0;
        rightLegRef.current.rotation.x = 0;
      }
    }
    else {
      // DEFAULT GESTURES (Idle, Talking, Thinking, Waving, Clapping)
      if (groupRef.current) {
        groupRef.current.position.y = THREE.MathUtils.lerp(groupRef.current.position.y, -0.9, 0.1);
        groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, 0, 0.1);
      }
      if (torsoRef.current) torsoRef.current.rotation.x = 0;
      if (leftLegRef.current && rightLegRef.current) {
        leftLegRef.current.rotation.x = 0;
        rightLegRef.current.rotation.x = 0;
      }
      if (hipsRef.current) hipsRef.current.rotation.z = 0;

      if (isWaving) {
        if (headRef.current) headRef.current.rotation.set(0, 0, 0);
        if (rightArmRef.current && rightForearmRef.current) {
          rightArmRef.current.rotation.set(0.2, 0, -1.8);
          rightForearmRef.current.rotation.x = -0.2;
          rightForearmRef.current.rotation.z = Math.sin(t * 12) * 0.4 - 0.5;
        }
        if (leftArmRef.current) {
          leftArmRef.current.rotation.set(0.1, 0, 0.2);
          if (leftForearmRef.current) leftForearmRef.current.rotation.x = -0.1;
        }
      } 
      else if (isClapping) {
        const clapSpeed = 15;
        if (headRef.current) headRef.current.rotation.set(0, 0, 0);
        if (leftArmRef.current && rightArmRef.current) {
          leftArmRef.current.rotation.set(-0.8, Math.sin(t * clapSpeed) * 0.2 + 0.5, 0.2);
          rightArmRef.current.rotation.set(-0.8, -Math.sin(t * clapSpeed) * 0.2 - 0.5, -0.2);
        }
        if (leftForearmRef.current && rightForearmRef.current) {
          leftForearmRef.current.rotation.x = -0.5;
          rightForearmRef.current.rotation.x = -0.5;
        }
      } 
      else if (isThinking) {
        if (headRef.current) headRef.current.rotation.set(-0.15, 0.25, 0.1);
        if (rightArmRef.current && rightForearmRef.current) {
          rightArmRef.current.rotation.set(-1.2, -0.4, -0.3);
          rightForearmRef.current.rotation.x = -1.5;
        }
        if (leftArmRef.current) {
          leftArmRef.current.rotation.set(0.1, 0, 0.2);
          if (leftForearmRef.current) leftForearmRef.current.rotation.x = -0.1;
        }
      }
      else if (isSpeaking) {
        if (headRef.current) headRef.current.rotation.set(Math.sin(t * 4) * 0.08, Math.sin(t * 3.5) * 0.12, Math.cos(t * 2.8) * 0.05);
        if (leftArmRef.current && rightArmRef.current) {
          leftArmRef.current.rotation.set(Math.sin(t * 3) * 0.3 - 0.2, 0, Math.cos(t * 2.5) * 0.1 + 0.3);
          rightArmRef.current.rotation.set(Math.cos(t * 3.5) * 0.3 - 0.2, 0, -Math.sin(t * 2.8) * 0.1 - 0.3);
        }
        if (leftForearmRef.current && rightForearmRef.current) {
          leftForearmRef.current.rotation.x = -0.8 + Math.sin(t * 4) * 0.2;
          rightForearmRef.current.rotation.x = -0.8 + Math.cos(t * 4.5) * 0.2;
        }
      }
      else {
        // Pure Idle
        if (headRef.current) headRef.current.rotation.set(Math.cos(t * 0.9) * 0.03, Math.sin(t * 1.1) * 0.06, Math.sin(t * 0.7) * 0.02);
        if (leftArmRef.current && rightArmRef.current) {
          leftArmRef.current.rotation.set(0.05, 0, 0.25 + Math.sin(t * 1.5) * 0.02);
          rightArmRef.current.rotation.set(0.05, 0, -0.25 - Math.sin(t * 1.5) * 0.02);
        }
        if (leftForearmRef.current && rightForearmRef.current) {
          leftForearmRef.current.rotation.x = -0.1;
          rightForearmRef.current.rotation.x = -0.1;
        }
      }
    }
  });

  return (
    <group ref={groupRef} position={[0, -0.9, 0]}>
      
      {/* Upper Body (Torso / Shirt) */}
      <group ref={torsoRef} position={[0, 0.9, 0]}>
        
        {/* White Uniform Shirt */}
        <mesh position={[0, 0.2, 0]} material={materials.shirt}>
          <cylinderGeometry args={[0.2, 0.24, 0.45, 24]} />
        </mesh>
        
        {/* Navy/Custom Sailor Collar */}
        <mesh position={[0, 0.42, 0]} rotation={[0.2, 0, 0]} material={materials.skirt}>
          <torusGeometry args={[0.15, 0.03, 16, 24]} />
        </mesh>
        {/* Red Ribbon / Tie */}
        <mesh position={[0, 0.32, 0.22]} material={materials.ribbon}>
          <boxGeometry args={[0.08, 0.08, 0.02]} />
        </mesh>
        <mesh position={[-0.04, 0.25, 0.22]} rotation={[0, 0, -0.3]} material={materials.ribbon}>
          <boxGeometry args={[0.03, 0.15, 0.01]} />
        </mesh>
        <mesh position={[0.04, 0.25, 0.22]} rotation={[0, 0, 0.3]} material={materials.ribbon}>
          <boxGeometry args={[0.03, 0.15, 0.01]} />
        </mesh>

        {/* Neck */}
        <mesh position={[0, 0.46, 0]} material={materials.skin}>
          <cylinderGeometry args={[0.06, 0.07, 0.15, 20]} />
        </mesh>

        {/* HEAD */}
        <group ref={headRef} position={[0, 0.65, 0]} scale={[1.1, 1.1, 1.1]}>
          {/* Head Base */}
          <mesh material={materials.skin}>
            <sphereGeometry args={[0.22, 32, 32]} />
          </mesh>

          {/* EYES (Anime Style - Large) */}
          <group position={[-0.085, 0.02, 0.17]} ref={leftEyeRef}>
            <mesh material={materials.eyesWhite} rotation={[0.2, -0.2, 0]}>
               <sphereGeometry args={[0.05, 16, 16]} />
            </mesh>
            <mesh position={[0, 0, 0.038]} material={materials.iris}>
              <sphereGeometry args={[0.03, 16, 16]} />
            </mesh>
            <mesh position={[0, 0, 0.055]} material={materials.pupil}>
              <sphereGeometry args={[0.015, 12, 12]} />
            </mesh>
          </group>
          <group position={[0.085, 0.02, 0.17]} ref={rightEyeRef}>
            <mesh material={materials.eyesWhite} rotation={[0.2, 0.2, 0]}>
               <sphereGeometry args={[0.05, 16, 16]} />
            </mesh>
            <mesh position={[0, 0, 0.038]} material={materials.iris}>
              <sphereGeometry args={[0.03, 16, 16]} />
            </mesh>
            <mesh position={[0, 0, 0.055]} material={materials.pupil}>
              <sphereGeometry args={[0.015, 12, 12]} />
            </mesh>
          </group>

          {/* Cute Anime Nose */}
          <mesh position={[0, -0.04, 0.215]} material={materials.skin}>
            <coneGeometry args={[0.01, 0.02, 16]} />
          </mesh>

          {/* Mouth */}
          <mesh ref={mouthRef} position={[0, -0.09, 0.205]} material={materials.mouth}>
            <capsuleGeometry args={[0.015, 0.02, 8, 16]} />
          </mesh>

          {/* Cute Pink Blush Cheeks (Dynamically Animated) */}
          <mesh ref={leftBlushRef} position={[-0.12, -0.06, 0.185]} material={materials.blush}>
            <sphereGeometry args={[0.03, 16, 16]} />
          </mesh>
          <mesh ref={rightBlushRef} position={[0.12, -0.06, 0.185]} material={materials.blush}>
            <sphereGeometry args={[0.03, 16, 16]} />
          </mesh>

          {/* HAIR (Anime Stylized with Customizable colors) */}
          <mesh position={[0, 0.08, -0.06]} material={materials.hair}>
            <sphereGeometry args={[0.24, 32, 32]} />
          </mesh>
          {/* Bangs */}
          <mesh position={[-0.1, 0.15, 0.18]} rotation={[0.4, -0.2, -0.2]} material={materials.hair}>
            <capsuleGeometry args={[0.05, 0.2, 8, 12]} />
          </mesh>
          <mesh position={[0.1, 0.15, 0.18]} rotation={[0.4, 0.2, 0.2]} material={materials.hair}>
            <capsuleGeometry args={[0.05, 0.2, 8, 12]} />
          </mesh>
          {/* Side Twintails / Long strands */}
          <mesh position={[-0.22, -0.1, 0]} rotation={[0, 0, 0.2]} material={materials.hair}>
            <capsuleGeometry args={[0.06, 0.4, 12, 16]} />
          </mesh>
          <mesh position={[0.22, -0.1, 0]} rotation={[0, 0, -0.2]} material={materials.hair}>
            <capsuleGeometry args={[0.06, 0.4, 12, 16]} />
          </mesh>

          {/* OPTIONAL ACCESSORIES */}
          {/* A. 3D GLASSES */}
          {glasses && (
            <group position={[0, 0.015, 0.215]}>
              {/* Bridge */}
              <mesh material={materials.blackPlastic} rotation={[0, 0, Math.PI / 2]}>
                <cylinderGeometry args={[0.007, 0.007, 0.17, 8]} />
              </mesh>
              {/* Left Rim */}
              <mesh position={[-0.085, 0, 0.005]} material={materials.blackPlastic}>
                <torusGeometry args={[0.045, 0.006, 8, 24]} />
              </mesh>
              {/* Right Rim */}
              <mesh position={[0.085, 0, 0.005]} material={materials.blackPlastic}>
                <torusGeometry args={[0.045, 0.006, 8, 24]} />
              </mesh>
              {/* Left Temple (arm) */}
              <mesh position={[-0.14, 0, -0.1]} rotation={[0, -0.05, 0]} material={materials.blackPlastic}>
                <boxGeometry args={[0.006, 0.006, 0.2]} />
              </mesh>
              {/* Right Temple (arm) */}
              <mesh position={[0.14, 0, -0.1]} rotation={[0, 0.05, 0]} material={materials.blackPlastic}>
                <boxGeometry args={[0.006, 0.006, 0.2]} />
              </mesh>
            </group>
          )}

          {/* B. 3D STUDY HEADSET */}
          {headphones && (
            <group position={[0, 0.02, -0.03]}>
              {/* Left Ear Pad */}
              <mesh position={[-0.245, 0.02, 0]} rotation={[0, 0, Math.PI / 2]} material={materials.orangeGlow}>
                <cylinderGeometry args={[0.07, 0.07, 0.045, 16]} />
              </mesh>
              {/* Right Ear Pad */}
              <mesh position={[0.245, 0.02, 0]} rotation={[0, 0, -Math.PI / 2]} material={materials.orangeGlow}>
                <cylinderGeometry args={[0.07, 0.07, 0.045, 16]} />
              </mesh>
              {/* Headband Arch */}
              <mesh position={[0, 0.17, 0]} rotation={[-Math.PI / 10, 0, 0]} material={materials.blackPlastic}>
                <torusGeometry args={[0.21, 0.015, 8, 32, Math.PI]} />
              </mesh>
            </group>
          )}

          {/* C. 3D NEKO CAT EARS */}
          {catEars && (
            <group position={[0, 0, 0]}>
              {/* Left Outer Ear */}
              <mesh position={[-0.13, 0.25, -0.05]} rotation={[0, 0, 0.35]} material={materials.hair}>
                <coneGeometry args={[0.065, 0.13, 4]} />
              </mesh>
              {/* Left Inner Ear (Pink) */}
              <mesh position={[-0.12, 0.245, -0.018]} rotation={[0, 0, 0.35]} material={materials.pinkEarInner}>
                <coneGeometry args={[0.04, 0.09, 4]} />
              </mesh>
              {/* Right Outer Ear */}
              <mesh position={[0.13, 0.25, -0.05]} rotation={[0, 0, -0.35]} material={materials.hair}>
                <coneGeometry args={[0.065, 0.13, 4]} />
              </mesh>
              {/* Right Inner Ear (Pink) */}
              <mesh position={[0.12, 0.245, -0.018]} rotation={[0, 0, -0.35]} material={materials.pinkEarInner}>
                <coneGeometry args={[0.04, 0.09, 4]} />
              </mesh>
            </group>
          )}
        </group>

        {/* LEFT ARM */}
        <group ref={leftArmRef} position={[-0.26, 0.35, 0]}>
          <mesh material={materials.shirt}>
            <cylinderGeometry args={[0.05, 0.045, 0.22, 16]} />
          </mesh>
          <group ref={leftForearmRef} position={[0, -0.2, 0]}>
            <mesh material={materials.skin}>
              <cylinderGeometry args={[0.04, 0.035, 0.2, 16]} />
            </mesh>
            <mesh position={[0, -0.12, 0]} material={materials.skin}>
              <boxGeometry args={[0.05, 0.07, 0.03]} />
            </mesh>
          </group>
        </group>

        {/* RIGHT ARM */}
        <group ref={rightArmRef} position={[0.26, 0.35, 0]}>
          <mesh material={materials.shirt}>
            <cylinderGeometry args={[0.05, 0.045, 0.22, 16]} />
          </mesh>
          <group ref={rightForearmRef} position={[0, -0.2, 0]}>
            <mesh material={materials.skin}>
              <cylinderGeometry args={[0.04, 0.035, 0.2, 16]} />
            </mesh>
            <mesh position={[0, -0.12, 0]} material={materials.skin}>
              <boxGeometry args={[0.05, 0.07, 0.03]} />
            </mesh>
          </group>
        </group>
      </group>

      {/* LOWER BODY */}
      <group ref={hipsRef} position={[0, 0.75, 0]}>
        
        {/* Navy/Custom Pleated Skirt */}
        <mesh position={[0, -0.05, 0]} material={materials.skirt}>
          <cylinderGeometry args={[0.23, 0.35, 0.35, 24]} />
        </mesh>
        
        {/* Left Leg */}
        <group ref={leftLegRef} position={[-0.12, -0.25, 0]}>
          {/* Upper Leg Skin */}
          <mesh position={[0, -0.05, 0]} material={materials.skin}>
            <cylinderGeometry args={[0.07, 0.065, 0.2, 16]} />
          </mesh>
          {/* Knee High Sock */}
          <mesh position={[0, -0.25, 0]} material={materials.socks}>
            <cylinderGeometry args={[0.066, 0.055, 0.25, 16]} />
          </mesh>
          {/* Shoe */}
          <mesh position={[0, -0.42, 0.03]} material={materials.shoes}>
            <boxGeometry args={[0.08, 0.06, 0.16]} />
          </mesh>
        </group>

        {/* Right Leg */}
        <group ref={rightLegRef} position={[0.12, -0.25, 0]}>
           {/* Upper Leg Skin */}
           <mesh position={[0, -0.05, 0]} material={materials.skin}>
            <cylinderGeometry args={[0.07, 0.065, 0.2, 16]} />
          </mesh>
          {/* Knee High Sock */}
          <mesh position={[0, -0.25, 0]} material={materials.socks}>
            <cylinderGeometry args={[0.066, 0.055, 0.25, 16]} />
          </mesh>
          {/* Shoe */}
          <mesh position={[0, -0.42, 0.03]} material={materials.shoes}>
            <boxGeometry args={[0.08, 0.06, 0.16]} />
          </mesh>
        </group>
      </group>

      <ContactShadows position={[0, -0.01, 0]} opacity={0.65} scale={2.4} blur={1.8} far={2} color="#1E1E24" />
    </group>
  );
}

// 3D Environment Stage & Dynamic Lighting
function Anjali3DStage({ animState }: { animState: AnjaliAnimationState }) {
  const isDancing = animState === "dancing";
  return (
    <>
      <ambientLight intensity={isDancing ? 0.4 : 0.6} color="#ffffff" />
      <directionalLight position={[3, 5, 4]} intensity={isDancing ? 2.5 : 1.8} color="#fff0e6" />
      <directionalLight position={[-4, 3, -2]} intensity={0.8} color="#aaccff" />
      <pointLight position={[0, 3, -3]} intensity={1.5} color="#ffffff" />
      
      {isDancing && (
        <>
          <pointLight position={[-2, 2, 1.5]} intensity={4.0} color="#FF007F" />
          <pointLight position={[2, 2, 1.5]} intensity={4.0} color="#00F0FF" />
          <pointLight position={[0, 4, 0]} intensity={3.5} color="#FFE600" />
          <Sparkles count={80} scale={[4, 4, 4]} size={5} speed={2.0} color="#FFD700" opacity={0.8} />
        </>
      )}
    </>
  );
}

export function Anjali3DViewer({
  state = "idle",
  animationState: externalAnimState,
  onAnimationChange,
  characterName = "Anjali",
  isAudioPlaying = false
}: Anjali3DViewerProps) {
  const [internalAnimState, setInternalAnimState] = useState<AnjaliAnimationState>("idle");
  const [isAutoCam, setIsAutoCam] = useState<boolean>(true);
  
  // Customization States for the 3D model
  const [glasses, setGlasses] = useState<boolean>(false);
  const [headphones, setHeadphones] = useState<boolean>(false);
  const [catEars, setCatEars] = useState<boolean>(false);
  const [hairColor, setHairColor] = useState<string>("navy");
  const [skirtColor, setSkirtColor] = useState<string>("navy");
  const [eyeColor, setEyeColor] = useState<string>("blue");
  
  const [showConfigPanel, setShowConfigPanel] = useState<boolean>(false);

  const activeAnimState = externalAnimState || internalAnimState;

  useEffect(() => {
    if (externalAnimState) return;
    if (state === "speaking") setInternalAnimState("talking");
    else if (state === "thinking") setInternalAnimState("thinking");
    else if (state === "idle" || state === "listening") setInternalAnimState("idle");
  }, [state, externalAnimState]);

  const handleAction = (anim: AnjaliAnimationState) => {
    if (onAnimationChange) onAnimationChange(anim);
    else setInternalAnimState(anim);
  };

  return (
    <div className="relative w-full h-full min-h-[440px] max-h-[620px] flex flex-col items-center justify-center rounded-3xl overflow-hidden bg-gradient-to-b from-stone-950 via-neutral-900 to-black border border-stone-800 shadow-[0_0_50px_rgba(0,0,0,0.5)] select-none">
      
      {/* 3D Canvas Viewport */}
      <div className="absolute inset-0 w-full h-full cursor-grab active:cursor-grabbing">
        <Canvas camera={{ position: [0, 0.4, 2.4], fov: 42 }} dpr={[1, 2]} gl={{ antialias: true, alpha: true, toneMapping: THREE.NoToneMapping }}>
          <Anjali3DStage animState={activeAnimState} />
          <Float speed={activeAnimState === "dancing" ? 0 : 1.5} rotationIntensity={0.15} floatIntensity={0.2}>
            <AnjaliRiggedCharacter 
              state={state} 
              animState={activeAnimState} 
              isAudioPlaying={isAudioPlaying}
              glasses={glasses}
              headphones={headphones}
              catEars={catEars}
              hairColor={hairColor}
              skirtColor={skirtColor}
              eyeColor={eyeColor}
            />
          </Float>
          <OrbitControls enablePan={false} enableZoom={true} minDistance={1.2} maxDistance={3.8} minPolarAngle={Math.PI / 3} maxPolarAngle={Math.PI / 1.8} autoRotate={isAutoCam && activeAnimState === "dancing"} autoRotateSpeed={2.5} />
        </Canvas>
      </div>

      {/* Top Controls Row */}
      <div className="absolute top-3 inset-x-3 flex items-center justify-between z-20 pointer-events-none">
        <div className="flex items-center gap-2 bg-black/60 backdrop-blur-xl border border-white/10 px-3.5 py-1.5 rounded-full shadow-lg pointer-events-auto">
          <div className={`w-2.5 h-2.5 rounded-full ${activeAnimState === "dancing" ? "bg-rose-500 animate-ping" : state === "speaking" ? "bg-emerald-400 animate-pulse" : "bg-amber-400"}`} />
          <span className="text-[11px] font-black tracking-wider text-white uppercase font-sans">ASTRA 3D {characterName}</span>
          <span className="text-[9px] bg-amber-500/20 text-amber-300 font-mono font-bold px-1.5 py-0.5 rounded-md uppercase">{activeAnimState}</span>
        </div>
        
        <div className="flex items-center gap-1.5 pointer-events-auto">
          {/* Customizer Panel toggle button */}
          <button 
            onClick={() => setShowConfigPanel(!showConfigPanel)} 
            className={`p-2 rounded-full border backdrop-blur-md transition-all ${showConfigPanel ? "bg-amber-500 border-amber-400 text-stone-950 shadow-md" : "bg-black/50 border-white/10 text-white/60 hover:text-white"}`}
            title="3D Customizer Panel"
          >
            <Sliders size={13} />
          </button>
          
          <button 
            onClick={() => setIsAutoCam(!isAutoCam)} 
            className={`p-2 rounded-full border backdrop-blur-md transition-all ${isAutoCam ? "bg-amber-500 border-amber-400 text-stone-950 shadow-md shadow-amber-500/30" : "bg-black/50 border-white/10 text-white/60 hover:text-white"}`} 
            title="Toggle 3D Camera Orbit"
          >
            <RotateCcw size={13} />
          </button>
        </div>
      </div>

      {/* Real-time Customize Panel Overlay */}
      <AnimatePresence>
        {showConfigPanel && (
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 40 }}
            className="absolute right-3 top-14 bottom-24 w-56 z-30 bg-black/85 backdrop-blur-2xl border border-white/15 rounded-2xl p-4 flex flex-col gap-4 overflow-y-auto pointer-events-auto shadow-2xl text-left"
          >
            <div>
              <h4 className="text-[11px] font-black uppercase tracking-widest text-amber-400 flex items-center gap-1.5 mb-2">
                <Palette size={12} />
                <span>3D Customizer</span>
              </h4>
              <p className="text-[9px] text-slate-400">Personalize your companion in real-time 3D space.</p>
            </div>

            {/* 3D Accessories */}
            <div className="space-y-2">
              <span className="text-[10px] font-bold text-white uppercase tracking-wider block">3D Accessories</span>
              <div className="grid grid-cols-1 gap-1.5">
                <button
                  onClick={() => setHeadphones(!headphones)}
                  className={`px-2.5 py-1.5 rounded-xl text-[10px] font-bold border transition-all flex items-center justify-between cursor-pointer ${
                    headphones ? "bg-orange-500/20 border-orange-400 text-orange-200" : "bg-white/5 border-white/10 text-slate-300 hover:bg-white/10"
                  }`}
                >
                  <span>🎧 Study Headset</span>
                  {headphones && <Check size={10} />}
                </button>
                <button
                  onClick={() => setGlasses(!glasses)}
                  className={`px-2.5 py-1.5 rounded-xl text-[10px] font-bold border transition-all flex items-center justify-between cursor-pointer ${
                    glasses ? "bg-orange-500/20 border-orange-400 text-orange-200" : "bg-white/5 border-white/10 text-slate-300 hover:bg-white/10"
                  }`}
                >
                  <span>👓 Cute Glasses</span>
                  {glasses && <Check size={10} />}
                </button>
                <button
                  onClick={() => setCatEars(!catEars)}
                  className={`px-2.5 py-1.5 rounded-xl text-[10px] font-bold border transition-all flex items-center justify-between cursor-pointer ${
                    catEars ? "bg-orange-500/20 border-orange-400 text-orange-200" : "bg-white/5 border-white/10 text-slate-300 hover:bg-white/10"
                  }`}
                >
                  <span>🐱 Neko Cat Ears</span>
                  {catEars && <Check size={10} />}
                </button>
              </div>
            </div>

            {/* Hair Color Customization */}
            <div className="space-y-1.5">
              <span className="text-[10px] font-bold text-white uppercase tracking-wider block">Hair Style</span>
              <div className="flex flex-wrap gap-1">
                {[
                  { id: "navy", label: "Navy", color: "bg-[#2B2D42]" },
                  { id: "golden", label: "Gold", color: "bg-[#F4C430]" },
                  { id: "pink", label: "Pink", color: "bg-[#FF85A1]" },
                  { id: "blue", label: "Blue", color: "bg-[#4EA8DE]" },
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setHairColor(item.id)}
                    className={`w-7 h-7 rounded-lg border transition-all flex items-center justify-center cursor-pointer ${
                      hairColor === item.id ? "ring-2 ring-amber-400 border-white scale-110" : "border-white/20"
                    }`}
                    title={item.label}
                  >
                    <div className={`w-4 h-4 rounded-md ${item.color}`} />
                  </button>
                ))}
              </div>
            </div>

            {/* Skirt/Uniform Customization */}
            <div className="space-y-1.5">
              <span className="text-[10px] font-bold text-white uppercase tracking-wider block">Uniform Color</span>
              <div className="flex flex-wrap gap-1">
                {[
                  { id: "navy", label: "Navy", color: "bg-[#1D3557]" },
                  { id: "crimson", label: "Crimson", color: "bg-[#9B2226]" },
                  { id: "emerald", label: "Emerald", color: "bg-[#155F3E]" },
                  { id: "purple", label: "Purple", color: "bg-[#5A189A]" },
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setSkirtColor(item.id)}
                    className={`w-7 h-7 rounded-lg border transition-all flex items-center justify-center cursor-pointer ${
                      skirtColor === item.id ? "ring-2 ring-amber-400 border-white scale-110" : "border-white/20"
                    }`}
                    title={item.label}
                  >
                    <div className={`w-4 h-4 rounded-md ${item.color}`} />
                  </button>
                ))}
              </div>
            </div>

            {/* Iris Eyes Customization */}
            <div className="space-y-1.5">
              <span className="text-[10px] font-bold text-white uppercase tracking-wider block">Iris Eyes</span>
              <div className="flex flex-wrap gap-1">
                {[
                  { id: "blue", label: "Blue", color: "bg-[#457B9D]" },
                  { id: "brown", label: "Brown", color: "bg-[#6F4E37]" },
                  { id: "green", label: "Green", color: "bg-[#2A9D8F]" },
                  { id: "purple", label: "Purple", color: "bg-[#8338EC]" },
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setEyeColor(item.id)}
                    className={`w-7 h-7 rounded-lg border transition-all flex items-center justify-center cursor-pointer ${
                      eyeColor === item.id ? "ring-2 ring-amber-400 border-white scale-110" : "border-white/20"
                    }`}
                    title={item.label}
                  >
                    <div className={`w-4 h-4 rounded-md ${item.color}`} />
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bottom controls & Choreography buttons shelf */}
      <div className="absolute bottom-3 inset-x-3 z-20 flex flex-col items-center gap-2 pointer-events-none">
        <div className="bg-black/75 backdrop-blur-xl border border-white/10 px-3 py-1 rounded-full text-[10px] text-slate-300 flex items-center gap-1.5 pointer-events-auto shadow-xl">
          <SparklesIcon size={12} className="text-amber-400 shrink-0" />
          <span>Say <strong className="text-amber-300 font-mono">"{characterName} dance koro"</strong> or choose an action:</span>
        </div>

        <div className="flex items-center gap-1.5 bg-slate-950/90 backdrop-blur-2xl border border-white/15 p-1.5 rounded-2xl shadow-2xl overflow-x-auto max-w-full scrollbar-hide pointer-events-auto mask-edges">
          {[
            { id: "idle", label: "🧘 Idle", color: "hover:bg-slate-800" },
            { id: "talking", label: "🗣️ Talk", color: "hover:bg-emerald-600/30" },
            { id: "dancing", label: "💃 Dance", color: "hover:bg-pink-600/40 text-pink-300 font-bold" },
            { id: "laugh", label: "😂 Laugh", color: "hover:bg-yellow-600/30" },
            { id: "cry", label: "😭 Cry", color: "hover:bg-blue-600/30" },
            { id: "run", label: "🏃‍♀️ Run", color: "hover:bg-red-600/30" },
            { id: "walk", label: "🚶‍♀️ Walk", color: "hover:bg-teal-600/30" },
            { id: "wave", label: "👋 Wave", color: "hover:bg-indigo-600/30" },
            { id: "thinking", label: "💡 Think", color: "hover:bg-amber-600/30" },
            { id: "clap", label: "👏 Clap", color: "hover:bg-purple-600/30" },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => handleAction(item.id as AnjaliAnimationState)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                activeAnimState === item.id 
                  ? "bg-gradient-to-r from-amber-500 to-orange-500 text-stone-950 shadow-md shadow-amber-500/25 scale-105" 
                  : `text-white/80 bg-white/5 ${item.color} active:scale-95`
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

