import React, { useRef, useState, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float, OrbitControls, Sparkles } from "@react-three/drei";
import * as THREE from "three";
import { 
  Zap, 
  FlaskConical, 
  Box, 
  Dna, 
  Bot, 
  Rotate3d, 
  Play, 
  Pause, 
  Sparkles as SparklesIcon,
  Maximize2,
  Atom,
  ChevronRight,
  Calculator,
  Compass
} from "lucide-react";

export type STEMModelMode = "physics" | "chemistry" | "math" | "biology" | "mentor";

// ==========================================
// 1. PHYSICS 3D: BOHR ATOM & QUANTUM ORBITS
// ==========================================
function BohrAtom({ quantumLevel }: { quantumLevel: number }) {
  const groupRef = useRef<THREE.Group>(null);
  const orbit1Ref = useRef<THREE.Group>(null);
  const orbit2Ref = useRef<THREE.Group>(null);
  const orbit3Ref = useRef<THREE.Group>(null);
  const electron1Ref = useRef<THREE.Mesh>(null);
  const electron2Ref = useRef<THREE.Mesh>(null);
  const electron3Ref = useRef<THREE.Mesh>(null);
  const photonRef = useRef<THREE.Mesh>(null);

  // Cluster of Protons (Red) and Neutrons (Blue) in Nucleus
  const nucleusParticles = useMemo(() => {
    const list: { pos: [number, number, number]; color: string }[] = [];
    const count = 12;
    for (let i = 0; i < count; i++) {
      const phi = Math.acos(-1 + (2 * i) / count);
      const theta = Math.sqrt(count * Math.PI) * phi;
      const r = 0.35 + (i % 3) * 0.05;
      list.push({
        pos: [
          r * Math.cos(theta) * Math.sin(phi),
          r * Math.sin(theta) * Math.sin(phi),
          r * Math.cos(phi)
        ],
        color: i % 2 === 0 ? "#EF4444" : "#3B82F6" // Red proton, Blue neutron
      });
    }
    return list;
  }, []);

  useFrame((state, delta) => {
    const t = state.clock.elapsedTime;
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.25;
    }

    // Orbit 1: Fast inner electron (n=1)
    if (orbit1Ref.current) {
      orbit1Ref.current.rotation.z += delta * 2.8;
    }
    if (electron1Ref.current) {
      const r1 = 1.35;
      electron1Ref.current.position.set(
        Math.cos(t * 3.2) * r1,
        Math.sin(t * 3.2) * r1,
        0
      );
    }

    // Orbit 2: Intermediate electron (n=2)
    if (orbit2Ref.current) {
      orbit2Ref.current.rotation.y += delta * 2.1;
    }
    if (electron2Ref.current) {
      const r2 = 1.95;
      electron2Ref.current.position.set(
        Math.cos(t * 2.2 + 1.2) * r2,
        Math.sin(t * 2.2 + 1.2) * r2,
        0
      );
    }

    // Orbit 3: Outer valence electron (n=3)
    if (orbit3Ref.current) {
      orbit3Ref.current.rotation.x += delta * 1.6;
    }
    if (electron3Ref.current) {
      const r3 = 2.55;
      electron3Ref.current.position.set(
        Math.cos(t * 1.5 + 2.5) * r3,
        Math.sin(t * 1.5 + 2.5) * r3,
        0
      );
    }

    // Emitted photon packet oscillation
    if (photonRef.current) {
      const wave = Math.sin(t * 4);
      photonRef.current.position.set(wave * 2.2, Math.cos(t * 4) * 0.6, Math.sin(t * 4) * 0.8);
    }
  });

  return (
    <group ref={groupRef}>
      {/* Dense Nucleus */}
      <group>
        {nucleusParticles.map((n, idx) => (
          <mesh key={idx} position={n.pos}>
            <sphereGeometry args={[0.13, 16, 16]} />
            <meshStandardMaterial 
              color={n.color} 
              roughness={0.2} 
              metalness={0.4} 
              emissive={n.color} 
              emissiveIntensity={0.3} 
            />
          </mesh>
        ))}
      </group>

      {/* Orbit 1: Tilted 60 deg */}
      <group rotation={[Math.PI / 3, 0, 0]}>
        <mesh>
          <torusGeometry args={[1.35, 0.015, 16, 80]} />
          <meshStandardMaterial color="#60A5FA" opacity={0.65} transparent />
        </mesh>
        <mesh ref={electron1Ref} position={[1.35, 0, 0]}>
          <sphereGeometry args={[0.1, 16, 16]} />
          <meshStandardMaterial color="#38BDF8" emissive="#38BDF8" emissiveIntensity={0.8} />
        </mesh>
      </group>

      {/* Orbit 2: Tilted -45 deg */}
      <group rotation={[-Math.PI / 4, Math.PI / 4, 0]}>
        <mesh>
          <torusGeometry args={[1.95, 0.015, 16, 90]} />
          <meshStandardMaterial color="#F59E0B" opacity={0.65} transparent />
        </mesh>
        <mesh ref={electron2Ref} position={[1.95, 0, 0]}>
          <sphereGeometry args={[0.11, 16, 16]} />
          <meshStandardMaterial color="#FBBF24" emissive="#F59E0B" emissiveIntensity={0.9} />
        </mesh>
      </group>

      {/* Orbit 3: Tilted 75 deg */}
      <group rotation={[Math.PI / 2.4, -Math.PI / 3, Math.PI / 6]}>
        <mesh>
          <torusGeometry args={[2.55, 0.015, 16, 100]} />
          <meshStandardMaterial color="#10B981" opacity={0.65} transparent />
        </mesh>
        <mesh ref={electron3Ref} position={[2.55, 0, 0]}>
          <sphereGeometry args={[0.12, 16, 16]} />
          <meshStandardMaterial color="#34D399" emissive="#10B981" emissiveIntensity={0.9} />
        </mesh>
      </group>

      {/* Emitted Photon Packet */}
      <mesh ref={photonRef}>
        <sphereGeometry args={[0.07, 12, 12]} />
        <meshStandardMaterial color="#F43F5E" emissive="#FB7185" emissiveIntensity={1.2} />
      </mesh>
    </group>
  );
}

// ===============================================
// 2. CHEMISTRY 3D: BENZENE MOLECULE & PI-ORBITALS
// ===============================================
function BenzeneMolecule() {
  const groupRef = useRef<THREE.Group>(null);
  const piCloudTopRef = useRef<THREE.Mesh>(null);
  const piCloudBottomRef = useRef<THREE.Mesh>(null);

  const ringRadius = 1.55;
  const hDist = 2.45;

  // 6 Carbons in hexagon & 6 Hydrogens
  const { carbons, hydrogens, bonds, hBonds } = useMemo(() => {
    const cList: [number, number, number][] = [];
    const hList: [number, number, number][] = [];
    const bList: { start: [number, number, number]; end: [number, number, number]; isDouble: boolean }[] = [];
    const hbList: { start: [number, number, number]; end: [number, number, number] }[] = [];

    for (let i = 0; i < 6; i++) {
      const angle = (i * Math.PI) / 3;
      const nextAngle = ((i + 1) * Math.PI) / 3;

      const cx = Math.cos(angle) * ringRadius;
      const cy = Math.sin(angle) * ringRadius;
      const ncx = Math.cos(nextAngle) * ringRadius;
      const ncy = Math.sin(nextAngle) * ringRadius;

      cList.push([cx, cy, 0]);

      // Hydrogen extending outwards
      const hx = Math.cos(angle) * hDist;
      const hy = Math.sin(angle) * hDist;
      hList.push([hx, hy, 0]);

      // C-C bond (alternating double / resonance)
      bList.push({
        start: [cx, cy, 0],
        end: [ncx, ncy, 0],
        isDouble: i % 2 === 0
      });

      // C-H bond
      hbList.push({
        start: [cx, cy, 0],
        end: [hx, hy, 0]
      });
    }

    return { carbons: cList, hydrogens: hList, bonds: bList, hBonds: hbList };
  }, [ringRadius, hDist]);

  useFrame((state, delta) => {
    const t = state.clock.elapsedTime;
    if (groupRef.current) {
      groupRef.current.rotation.x = Math.sin(t * 0.6) * 0.25 + 0.6;
      groupRef.current.rotation.y += delta * 0.55;
    }
    if (piCloudTopRef.current) {
      piCloudTopRef.current.rotation.z += delta * 0.8;
      piCloudTopRef.current.position.z = 0.45 + Math.sin(t * 2.5) * 0.05;
      const mat = piCloudTopRef.current.material as THREE.MeshStandardMaterial;
      if (mat) mat.emissiveIntensity = 0.4 + Math.sin(t * 3.5) * 0.15;
    }
    if (piCloudBottomRef.current) {
      piCloudBottomRef.current.rotation.z -= delta * 0.8;
      piCloudBottomRef.current.position.z = -0.45 - Math.sin(t * 2.5) * 0.05;
      const mat = piCloudBottomRef.current.material as THREE.MeshStandardMaterial;
      if (mat) mat.emissiveIntensity = 0.4 + Math.sin(t * 3.5) * 0.15;
    }
  });

  return (
    <group ref={groupRef}>
      {/* 1. Delocalized Pi-Electron Cloud Above Ring */}
      <mesh ref={piCloudTopRef} position={[0, 0, 0.45]}>
        <torusGeometry args={[ringRadius * 0.9, 0.22, 16, 50]} />
        <meshStandardMaterial 
          color="#F59E0B" 
          emissive="#F59E0B" 
          emissiveIntensity={0.4} 
          transparent 
          opacity={0.38} 
          roughness={0.2} 
        />
      </mesh>

      {/* 2. Delocalized Pi-Electron Cloud Below Ring */}
      <mesh ref={piCloudBottomRef} position={[0, 0, -0.45]}>
        <torusGeometry args={[ringRadius * 0.9, 0.22, 16, 50]} />
        <meshStandardMaterial 
          color="#38BDF8" 
          emissive="#38BDF8" 
          emissiveIntensity={0.4} 
          transparent 
          opacity={0.38} 
          roughness={0.2} 
        />
      </mesh>

      {/* 3. Carbon Atoms (Charcoal / Dark Slate) */}
      {carbons.map((pos, idx) => (
        <mesh key={`c-${idx}`} position={pos}>
          <sphereGeometry args={[0.22, 24, 24]} />
          <meshStandardMaterial color="#1E293B" metalness={0.6} roughness={0.3} />
        </mesh>
      ))}

      {/* 4. Hydrogen Atoms (Light Cyan / White) */}
      {hydrogens.map((pos, idx) => (
        <mesh key={`h-${idx}`} position={pos}>
          <sphereGeometry args={[0.13, 20, 20]} />
          <meshStandardMaterial color="#F1F5F9" emissive="#94A3B8" emissiveIntensity={0.2} />
        </mesh>
      ))}

      {/* 5. C-C Chemical Bonds */}
      {bonds.map((b, idx) => {
        const midX = (b.start[0] + b.end[0]) / 2;
        const midY = (b.start[1] + b.end[1]) / 2;
        const angle = Math.atan2(b.end[1] - b.start[1], b.end[0] - b.start[0]);
        return (
          <group key={`b-${idx}`} position={[midX, midY, 0]} rotation={[0, 0, angle + Math.PI / 2]}>
            <mesh>
              <cylinderGeometry args={[0.05, 0.05, ringRadius * 1.02, 12]} />
              <meshStandardMaterial color="#94A3B8" roughness={0.4} />
            </mesh>
          </group>
        );
      })}

      {/* 6. C-H Chemical Bonds */}
      {hBonds.map((hb, idx) => {
        const midX = (hb.start[0] + hb.end[0]) / 2;
        const midY = (hb.start[1] + hb.end[1]) / 2;
        const angle = Math.atan2(hb.end[1] - hb.start[1], hb.end[0] - hb.start[0]);
        return (
          <group key={`hb-${idx}`} position={[midX, midY, 0]} rotation={[0, 0, angle + Math.PI / 2]}>
            <mesh>
              <cylinderGeometry args={[0.035, 0.035, hDist - ringRadius, 10]} />
              <meshStandardMaterial color="#CBD5E1" roughness={0.5} />
            </mesh>
          </group>
        );
      })}
    </group>
  );
}

// ========================================================
// 3. MATH 3D: VECTOR COORDINATE FRAME & CALCULUS SURFACE
// ========================================================
function MathVectorFrame() {
  const groupRef = useRef<THREE.Group>(null);
  const vectorARef = useRef<THREE.Group>(null);
  const vectorBRef = useRef<THREE.Group>(null);
  const crossProductRef = useRef<THREE.Group>(null);
  const surfaceRef = useRef<THREE.Mesh>(null);

  useFrame((state, delta) => {
    const t = state.clock.elapsedTime;
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.45;
      groupRef.current.rotation.x = Math.sin(t * 0.5) * 0.2 + 0.35;
    }
    if (surfaceRef.current) {
      surfaceRef.current.rotation.z += delta * 0.3;
    }
  });

  return (
    <group ref={groupRef}>
      {/* 3D Coordinate Grid Axes (X=Red, Y=Green, Z=Blue) */}
      {/* X Axis */}
      <group>
        <mesh position={[1.4, 0, 0]} rotation={[0, 0, -Math.PI / 2]}>
          <cylinderGeometry args={[0.025, 0.025, 2.8, 8]} />
          <meshStandardMaterial color="#EF4444" />
        </mesh>
        <mesh position={[2.85, 0, 0]} rotation={[0, 0, -Math.PI / 2]}>
          <coneGeometry args={[0.08, 0.22, 12]} />
          <meshStandardMaterial color="#EF4444" />
        </mesh>
      </group>

      {/* Y Axis */}
      <group>
        <mesh position={[0, 1.4, 0]}>
          <cylinderGeometry args={[0.025, 0.025, 2.8, 8]} />
          <meshStandardMaterial color="#10B981" />
        </mesh>
        <mesh position={[0, 2.85, 0]}>
          <coneGeometry args={[0.08, 0.22, 12]} />
          <meshStandardMaterial color="#10B981" />
        </mesh>
      </group>

      {/* Z Axis */}
      <group>
        <mesh position={[0, 0, 1.4]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.025, 0.025, 2.8, 8]} />
          <meshStandardMaterial color="#3B82F6" />
        </mesh>
        <mesh position={[0, 0, 2.85]} rotation={[Math.PI / 2, 0, 0]}>
          <coneGeometry args={[0.08, 0.22, 12]} />
          <meshStandardMaterial color="#3B82F6" />
        </mesh>
      </group>

      {/* Vector A (Orange) */}
      <group ref={vectorARef} rotation={[0.4, 0.8, 0]}>
        <mesh position={[0, 1.1, 0]}>
          <cylinderGeometry args={[0.045, 0.045, 2.2, 10]} />
          <meshStandardMaterial color="#FF7A30" emissive="#FF7A30" emissiveIntensity={0.5} />
        </mesh>
        <mesh position={[0, 2.25, 0]}>
          <coneGeometry args={[0.11, 0.28, 14]} />
          <meshStandardMaterial color="#FF7A30" emissive="#FF7A30" emissiveIntensity={0.6} />
        </mesh>
      </group>

      {/* Vector B (Cyan) */}
      <group ref={vectorBRef} rotation={[-0.3, -0.6, 0.5]}>
        <mesh position={[0, 1, 0]}>
          <cylinderGeometry args={[0.045, 0.045, 2.0, 10]} />
          <meshStandardMaterial color="#06B6D4" emissive="#06B6D4" emissiveIntensity={0.5} />
        </mesh>
        <mesh position={[0, 2.05, 0]}>
          <coneGeometry args={[0.11, 0.28, 14]} />
          <meshStandardMaterial color="#06B6D4" emissive="#06B6D4" emissiveIntensity={0.6} />
        </mesh>
      </group>

      {/* Translucent 3D Calculus Parabolic Surface (Volume of Revolution) */}
      <mesh ref={surfaceRef} position={[0, 0, 0]}>
        <torusKnotGeometry args={[1.1, 0.28, 64, 16, 2, 3]} />
        <meshStandardMaterial 
          color="#8B5CF6" 
          emissive="#6D28D9" 
          emissiveIntensity={0.3} 
          wireframe 
          transparent 
          opacity={0.45} 
        />
      </mesh>
    </group>
  );
}

// ===============================================
// 4. BIOLOGY 3D: DNA DOUBLE HELIX & BASE PAIRS
// ===============================================
function DnaHelix() {
  const groupRef = useRef<THREE.Group>(null);
  const baseCount = 22;
  const radius = 1.25;
  const height = 4.4;

  const { spheres, rungs } = useMemo(() => {
    const s: { posA: [number, number, number]; posB: [number, number, number]; colorA: string; colorB: string }[] = [];
    const r: { center: [number, number, number]; rotZ: number; length: number; color: string }[] = [];

    // Nitrogenous Bases: Adenine (Orange), Thymine (Blue), Guanine (Green), Cytosine (Pink)
    const colors = ["#FF7A30", "#38BDF8", "#10B981", "#F43F5E"];

    for (let i = 0; i < baseCount; i++) {
      const t = (i / baseCount) * Math.PI * 3.2;
      const y = (i / baseCount) * height - height / 2;
      const xA = Math.sin(t) * radius;
      const zA = Math.cos(t) * radius;
      const xB = Math.sin(t + Math.PI) * radius;
      const zB = Math.cos(t + Math.PI) * radius;

      s.push({
        posA: [xA, y, zA],
        posB: [xB, y, zB],
        colorA: colors[i % colors.length],
        colorB: colors[(i + 2) % colors.length]
      });

      r.push({
        center: [(xA + xB) / 2, y, (zA + zB) / 2],
        rotZ: t,
        length: radius * 2,
        color: "#CBD5E1"
      });
    }
    return { spheres: s, rungs: r };
  }, [baseCount, height, radius]);

  useFrame((state, delta) => {
    const t = state.clock.elapsedTime;
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.7;
      groupRef.current.position.y = Math.sin(t * 1.5) * 0.15;
    }
  });

  return (
    <group ref={groupRef}>
      {spheres.map((node, i) => (
        <group key={i}>
          {/* Strand 1 Node */}
          <mesh position={node.posA}>
            <sphereGeometry args={[0.16, 16, 16]} />
            <meshStandardMaterial 
              color={node.colorA} 
              roughness={0.3} 
              metalness={0.2} 
              emissive={node.colorA} 
              emissiveIntensity={0.35} 
            />
          </mesh>
          {/* Strand 2 Node */}
          <mesh position={node.posB}>
            <sphereGeometry args={[0.16, 16, 16]} />
            <meshStandardMaterial 
              color={node.colorB} 
              roughness={0.3} 
              metalness={0.2} 
              emissive={node.colorB} 
              emissiveIntensity={0.35} 
            />
          </mesh>
          {/* Connector Base Pair Rung */}
          <mesh position={[(node.posA[0] + node.posB[0]) / 2, node.posA[1], (node.posA[2] + node.posB[2]) / 2]} rotation={[0, -node.posA[0], 0]}>
            <cylinderGeometry args={[0.04, 0.04, radius * 2, 8]} />
            <meshStandardMaterial color="#94A3B8" roughness={0.5} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

// ===============================================
// 5. AI MENTOR 3D: HOLOGRAPHIC GYRO CORE
// ===============================================
function MentorCore() {
  const groupRef = useRef<THREE.Group>(null);
  const ring1Ref = useRef<THREE.Mesh>(null);
  const ring2Ref = useRef<THREE.Mesh>(null);
  const ring3Ref = useRef<THREE.Mesh>(null);
  const coreRef = useRef<THREE.Mesh>(null);
  const satellitesRef = useRef<THREE.Group>(null);

  useFrame((state, delta) => {
    const t = state.clock.elapsedTime;
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.35;
    }
    if (ring1Ref.current) {
      ring1Ref.current.rotation.x += delta * 0.8;
      ring1Ref.current.rotation.y += delta * 0.5;
    }
    if (ring2Ref.current) {
      ring2Ref.current.rotation.y += delta * 0.9;
      ring2Ref.current.rotation.z += delta * 0.6;
    }
    if (ring3Ref.current) {
      ring3Ref.current.rotation.z += delta * 0.7;
      ring3Ref.current.rotation.x += delta * 0.4;
    }
    if (coreRef.current) {
      const scale = 1 + Math.sin(t * 3) * 0.08;
      coreRef.current.scale.set(scale, scale, scale);
    }
    if (satellitesRef.current) {
      satellitesRef.current.rotation.y -= delta * 0.6;
      satellitesRef.current.rotation.x = Math.sin(t * 0.5) * 0.2;
    }
  });

  const satInfo = useMemo(() => {
    return [
      { pos: [1.8, 0, 0] as [number, number, number], color: "#38BDF8" },
      { pos: [-1.8, 0, 0] as [number, number, number], color: "#10B981" },
      { pos: [0, 0, 1.8] as [number, number, number], color: "#F59E0B" },
      { pos: [0, 0, -1.8] as [number, number, number], color: "#E63946" },
    ];
  }, []);

  return (
    <group ref={groupRef}>
      {/* Central Pulsating Core */}
      <mesh ref={coreRef}>
        <sphereGeometry args={[0.85, 32, 32]} />
        <meshStandardMaterial
          color="#FF7A30"
          emissive="#FF5722"
          emissiveIntensity={0.65}
          roughness={0.2}
          metalness={0.4}
        />
      </mesh>

      {/* Orbiting Satellites / Data Nodes */}
      <group ref={satellitesRef}>
        {satInfo.map((sat, idx) => (
          <group key={idx}>
            {/* Satellite Core Node */}
            <mesh position={sat.pos}>
              <sphereGeometry args={[0.15, 16, 16]} />
              <meshStandardMaterial 
                color={sat.color} 
                emissive={sat.color} 
                emissiveIntensity={0.8} 
                roughness={0.1}
              />
            </mesh>
            {/* Laser Link to center */}
            <mesh position={[sat.pos[0] / 2, sat.pos[1] / 2, sat.pos[2] / 2]} rotation={
              sat.pos[0] !== 0 ? [0, 0, Math.PI / 2] : [Math.PI / 2, 0, 0]
            }>
              <cylinderGeometry args={[0.015, 0.015, 1.8, 8]} />
              <meshStandardMaterial 
                color={sat.color} 
                emissive={sat.color} 
                emissiveIntensity={0.5} 
                transparent 
                opacity={0.6}
              />
            </mesh>
          </group>
        ))}
      </group>

      {/* Gyroscopic Ring 1 */}
      <mesh ref={ring1Ref}>
        <torusGeometry args={[1.4, 0.04, 16, 64]} />
        <meshStandardMaterial color="#38BDF8" roughness={0.3} metalness={0.8} />
      </mesh>

      {/* Gyroscopic Ring 2 */}
      <mesh ref={ring2Ref}>
        <torusGeometry args={[1.75, 0.04, 16, 64]} />
        <meshStandardMaterial color="#F59E0B" roughness={0.3} metalness={0.8} />
      </mesh>

      {/* Gyroscopic Ring 3 */}
      <mesh ref={ring3Ref}>
        <torusGeometry args={[2.1, 0.03, 16, 64]} />
        <meshStandardMaterial color="#10B981" roughness={0.3} metalness={0.8} />
      </mesh>
    </group>
  );
}

// ===============================================
// MAIN COMPONENT: 3D STEM LAB & MODEL VIEWER
// ===============================================
interface Hero3DCanvasProps {
  initialMode?: STEMModelMode;
  onExploreTopic?: (topic: string) => void;
}

export const Hero3DCanvas: React.FC<Hero3DCanvasProps> = ({ 
  initialMode = "physics",
  onExploreTopic 
}) => {
  const [modelMode, setModelMode] = useState<STEMModelMode>(initialMode);
  const [isAutoRotate, setIsAutoRotate] = useState(true);
  const [quantumN, setQuantumN] = useState(1);

  // Model details & WBCHSE Syllabus Metadata
  const metadataMap: Record<STEMModelMode, {
    title: string;
    sub: string;
    formula: string;
    desc: string;
    points: string[];
    tag: string;
    badgeColor: string;
  }> = {
    physics: {
      title: "Physics: Bohr Atom & Quantum Orbits",
      sub: "WBCHSE Class 12 • Modern Physics & Electrostatics",
      formula: "E_n = -13.6 / n² eV  |  F = (1/4πε₀) · (q₁q₂/r²)",
      desc: "Interactive 3D Rutherford-Bohr atomic structure. Observe discrete quantized electron energy orbits and photon emission packets (ΔE = hν).",
      points: [
        "Coulomb attractive force balances centripetal acceleration",
        "Quantized angular momentum L = n·(h / 2π)",
        "Balmer & Lyman series photon emission transitions"
      ],
      tag: "PHYSICS 3D LAB",
      badgeColor: "bg-blue-100 text-blue-700 border-blue-200"
    },
    chemistry: {
      title: "Chemistry: Benzene Ring & Delocalized π-Electrons",
      sub: "WBCHSE Class 12 • Organic Chemistry & Aromaticity",
      formula: "C₆H₆  |  sp² Hybridization  |  120° Bond Angles",
      desc: "Real-time 3D hexagonal planar aromatic ring with rotating delocalized π-electron toroidal clouds floating directly above and below the carbon skeleton.",
      points: [
        "6 delocalized π-electrons obeying Hückel's Rule (4n + 2)",
        "Resonance stabilization energy = 150.6 kJ/mol",
        "Equal C-C bond lengths (1.39 Å), between single & double bonds"
      ],
      tag: "CHEMISTRY 3D LAB",
      badgeColor: "bg-amber-100 text-amber-700 border-amber-200"
    },
    math: {
      title: "Math: 3D Vector Geometry & Calculus Volumes",
      sub: "WBCHSE Class 12 • 3D Vectors, Matrices & Integration",
      formula: "|A × B| = AB sinθ · n̂  |  V = ∫ π y² dx",
      desc: "Interactive 3D Cartesian coordinates (X, Y, Z), vector cross products with perpendicular normal vectors, and calculus surfaces of revolution.",
      points: [
        "Vector Cross Product A × B produces orthogonal vector",
        "Direction cosines relation: l² + m² + n² = 1",
        "3D line equation: (x - x₁)/a = (y - y₁)/b = (z - z₁)/c"
      ],
      tag: "MATH 3D LAB",
      badgeColor: "bg-purple-100 text-purple-700 border-purple-200"
    },
    biology: {
      title: "Biology: DNA Double Helix & ZP3 Genetics",
      sub: "WBCHSE Class 12 • Genetics, Evolution & Reproduction",
      formula: "A = T (2 H-Bonds)  |  G ≡ C (3 H-Bonds)  |  SSB Protein",
      desc: "Double helical antiparallel polynucleotide strands with complementary base pairing, replication forks, and ZP3 receptor fertilization mechanisms.",
      points: [
        "Human sperm acrosome binds ZP3 glycoprotein on zona pellucida",
        "SSB proteins prevent single-strand DNA re-annealing",
        "Mendelian inheritance & crossing over during pachytene"
      ],
      tag: "BIOLOGY 3D LAB",
      badgeColor: "bg-emerald-100 text-emerald-700 border-emerald-200"
    },
    mentor: {
      title: "Study Stranger: AI Neural Study Core",
      sub: "24/7 WBCHSE Voice Mentorship & Instant Doubts",
      formula: "Astra Core v3.8  |  Zero Latency  |  Bangla + English",
      desc: "Multi-axis gyroscopic AI reasoning core powering real-time voice mentorship, instant question explanations, and active recall flashcards.",
      points: [
        "Context-grounded in WBCHSE Semester 3 official syllabus",
        "Automatic mistake detection & exam autopsy engine",
        "Encouraging, conversational Bengali and English tutor"
      ],
      tag: "AI MENTOR CORE",
      badgeColor: "bg-orange-100 text-orange-700 border-orange-200"
    }
  };

  const currentMeta = metadataMap[modelMode];

  return (
    <div className="w-full bg-white rounded-3xl border border-slate-200/90 shadow-xl shadow-slate-200/50 p-4 sm:p-6 space-y-4">
      {/* 1. Header with Subject Switcher Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <span className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full border ${currentMeta.badgeColor}`}>
            {currentMeta.tag}
          </span>
          <span className="text-xs text-slate-500 font-semibold hidden md:inline">
            Interactive 3D Science & Math Lab
          </span>
        </div>

        {/* 5-Subject Selector */}
        <div className="flex flex-wrap items-center gap-1 p-1 bg-slate-100/90 rounded-2xl border border-slate-200/80">
          <button
            type="button"
            onClick={() => setModelMode("physics")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
              modelMode === "physics"
                ? "bg-white text-blue-600 shadow-sm border border-slate-200/80"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Zap size={14} className="text-blue-500" />
            <span>Physics</span>
          </button>

          <button
            type="button"
            onClick={() => setModelMode("chemistry")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
              modelMode === "chemistry"
                ? "bg-white text-amber-600 shadow-sm border border-slate-200/80"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <FlaskConical size={14} className="text-amber-500" />
            <span>Chemistry</span>
          </button>

          <button
            type="button"
            onClick={() => setModelMode("math")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
              modelMode === "math"
                ? "bg-white text-purple-600 shadow-sm border border-slate-200/80"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Box size={14} className="text-purple-500" />
            <span>Math</span>
          </button>

          <button
            type="button"
            onClick={() => setModelMode("biology")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
              modelMode === "biology"
                ? "bg-white text-emerald-600 shadow-sm border border-slate-200/80"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Dna size={14} className="text-emerald-500" />
            <span>Biology</span>
          </button>

          <button
            type="button"
            onClick={() => setModelMode("mentor")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
              modelMode === "mentor"
                ? "bg-white text-orange-600 shadow-sm border border-slate-200/80"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Bot size={14} className="text-orange-500" />
            <span>AI Core</span>
          </button>
        </div>
      </div>

      {/* 2. Main 3D Canvas Showcase & Info Split View */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-center">
        {/* 3D Canvas Viewport (7 Cols on Desktop) */}
        <div className="lg:col-span-7 relative h-[360px] sm:h-[420px] w-full rounded-2xl bg-gradient-to-b from-slate-900 via-slate-950 to-slate-900 overflow-hidden border border-slate-800 shadow-inner group">
          {/* Subtle cosmic background glow */}
          <div className="absolute -top-10 -left-10 w-48 h-48 bg-orange-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-10 -right-10 w-48 h-48 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

          {/* Top Canvas Controls Overlay */}
          <div className="absolute top-3 left-3 right-3 z-20 flex items-center justify-between pointer-events-none">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 rounded-lg bg-black/60 backdrop-blur-md border border-white/10 text-[10px] font-mono text-white/90 font-bold flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                3D WebGL Engine
              </span>
            </div>

            <div className="flex items-center gap-1.5 pointer-events-auto">
              <button
                type="button"
                onClick={() => setIsAutoRotate(!isAutoRotate)}
                className={`p-2 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                  isAutoRotate 
                    ? "bg-white/20 border-white/30 text-white" 
                    : "bg-black/40 border-white/10 text-white/60 hover:text-white"
                }`}
                title={isAutoRotate ? "Pause Auto-Rotation" : "Enable Auto-Rotation"}
              >
                {isAutoRotate ? <Pause size={13} /> : <Play size={13} />}
              </button>
            </div>
          </div>

          {/* Interactive 3D Canvas */}
          <div className="w-full h-full cursor-grab active:cursor-grabbing">
            <Canvas
              camera={{ position: [0, 0, 5], fov: 46 }}
              gl={{ antialias: true, alpha: true }}
              dpr={[1, 2]}
            >
              <ambientLight intensity={1.1} />
              <directionalLight position={[6, 8, 6]} intensity={1.4} />
              <pointLight position={[-5, -4, -3]} color="#38BDF8" intensity={0.9} />
              <pointLight position={[4, 4, 3]} color="#FF7A30" intensity={1.1} />

              <Float speed={isAutoRotate ? 2 : 0} rotationIntensity={0.5} floatIntensity={0.6}>
                {modelMode === "physics" && <BohrAtom quantumLevel={quantumN} />}
                {modelMode === "chemistry" && <BenzeneMolecule />}
                {modelMode === "math" && <MathVectorFrame />}
                {modelMode === "biology" && <DnaHelix />}
                {modelMode === "mentor" && <MentorCore />}
              </Float>

              <Sparkles count={40} scale={5} size={2.2} speed={0.4} color="#FF7A30" />
              <OrbitControls 
                enableZoom={false} 
                enablePan={false} 
                autoRotate={isAutoRotate} 
                autoRotateSpeed={1.0} 
              />
            </Canvas>
          </div>

          {/* Bottom Interactive Hint */}
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2 px-3 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/10 text-[10px] font-medium text-white/80 pointer-events-none">
            <Rotate3d size={13} className="text-orange-400" />
            <span>Click & Drag to rotate 360° in 3D</span>
          </div>
        </div>

        {/* Info & Formula Breakdown Panel (5 Cols on Desktop) */}
        <div className="lg:col-span-5 space-y-3.5 text-left">
          <div>
            <span className="text-[10px] font-black uppercase tracking-widest text-orange-600 block">
              {currentMeta.sub}
            </span>
            <h3 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight mt-0.5">
              {currentMeta.title}
            </h3>
            <p className="text-xs text-slate-600 mt-1 leading-relaxed">
              {currentMeta.desc}
            </p>
          </div>

          {/* Formula Card */}
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1.5 shadow-xs">
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-wider block">
              Key Formula & Constant
            </span>
            <code className="text-xs font-mono font-bold text-orange-700 bg-orange-50/80 px-2 py-1 rounded-lg border border-orange-200/60 block">
              {currentMeta.formula}
            </code>
          </div>

          {/* High-Yield Data Points */}
          <div className="space-y-1.5">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">
              WBCHSE Semester 3 Exam Insights:
            </span>
            <ul className="space-y-1 text-xs text-slate-700 font-medium">
              {currentMeta.points.map((pt, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="text-orange-500 font-bold shrink-0 mt-0.5">•</span>
                  <span>{pt}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Interactive Trigger Buttons */}
          <div className="pt-1 flex items-center gap-2">
            {modelMode === "physics" && (
              <button
                type="button"
                onClick={() => setQuantumN(prev => (prev % 3) + 1)}
                className="px-3.5 py-2 rounded-xl bg-blue-50 border border-blue-200 text-blue-700 font-bold text-xs hover:bg-blue-100 transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <Zap size={14} />
                <span>Quantum Jump (n = {quantumN})</span>
              </button>
            )}

            {modelMode === "chemistry" && (
              <div className="px-3 py-1.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 font-bold text-xs flex items-center gap-1.5">
                <FlaskConical size={14} />
                <span>Aromatic Resonance (6π Cloud)</span>
              </div>
            )}

            {modelMode === "math" && (
              <div className="px-3 py-1.5 rounded-xl bg-purple-50 border border-purple-200 text-purple-800 font-bold text-xs flex items-center gap-1.5">
                <Box size={14} />
                <span>Orthogonal Axes (î × ĵ = k̂)</span>
              </div>
            )}

            {modelMode === "biology" && (
              <div className="px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 font-bold text-xs flex items-center gap-1.5">
                <Dna size={14} />
                <span>A=T (2 Bonds), G≡C (3 Bonds)</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
