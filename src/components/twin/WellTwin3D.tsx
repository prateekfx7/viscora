"use client";

import { useMemo } from "react";
import { useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Text, Environment } from "@react-three/drei";
import * as THREE from "three";

// ─── Steam Zone (animated glowing cylinder) ─────────────────────────────────

function SteamZone({ temperature }: { temperature: number }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const heatIntensity = Math.max(0, Math.min(1, (temperature - 47) / (180 - 47)));

  useFrame(({ clock }) => {
    if (meshRef.current) {
      const scale = 1 + Math.sin(clock.getElapsedTime() * 2) * 0.03;
      meshRef.current.scale.set(scale, 1, scale);
    }
  });

  const color = new THREE.Color().setHSL(
    0.08 - heatIntensity * 0.06, // orange → red
    0.9,
    0.4 + heatIntensity * 0.2
  );

  return (
    <mesh ref={meshRef} position={[0, -3, 0]}>
      <cylinderGeometry args={[1.2 + heatIntensity * 0.8, 1.5 + heatIntensity, 2, 32]} />
      <meshStandardMaterial
        color={color}
        transparent
        opacity={0.15 + heatIntensity * 0.25}
        emissive={color}
        emissiveIntensity={heatIntensity * 0.8}
      />
    </mesh>
  );
}

// ─── Casing ──────────────────────────────────────────────────────────────────

function Casing() {
  return (
    <group>
      {/* Surface casing */}
      <mesh position={[0, 1, 0]}>
        <cylinderGeometry args={[0.35, 0.35, 3, 16, 1, true]} />
        <meshStandardMaterial color="#4a4a4a" metalness={0.8} roughness={0.3} side={THREE.DoubleSide} />
      </mesh>
      {/* Production casing */}
      <mesh position={[0, -2.5, 0]}>
        <cylinderGeometry args={[0.25, 0.25, 8, 16, 1, true]} />
        <meshStandardMaterial color="#3a3a3a" metalness={0.7} roughness={0.4} side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
}

// ─── Tubing ──────────────────────────────────────────────────────────────────

function Tubing() {
  return (
    <mesh position={[0, -1.5, 0]}>
      <cylinderGeometry args={[0.08, 0.08, 10, 8, 1, true]} />
      <meshStandardMaterial color="#666" metalness={0.9} roughness={0.2} side={THREE.DoubleSide} />
    </mesh>
  );
}

// ─── Sucker Rod (animated) ───────────────────────────────────────────────────

function SuckerRod({ spm }: { spm: number }) {
  const rodRef = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    if (rodRef.current) {
      const speed = spm / 6; // normalize to ~1
      const stroke = Math.sin(clock.getElapsedTime() * speed * Math.PI) * 0.3;
      rodRef.current.position.y = stroke;
    }
  });

  return (
    <group ref={rodRef}>
      {/* Rod */}
      <mesh position={[0, -1, 0]}>
        <cylinderGeometry args={[0.02, 0.02, 9, 6]} />
        <meshStandardMaterial color="#888" metalness={0.95} roughness={0.1} />
      </mesh>
      {/* Polish rod (thicker at top) */}
      <mesh position={[0, 3.5, 0]}>
        <cylinderGeometry args={[0.04, 0.04, 1, 8]} />
        <meshStandardMaterial color="#aaa" metalness={0.95} roughness={0.1} />
      </mesh>
      {/* Pump plunger */}
      <mesh position={[0, -5.2, 0]}>
        <cylinderGeometry args={[0.12, 0.12, 0.5, 12]} />
        <meshStandardMaterial color="#c9870b" metalness={0.8} roughness={0.2} />
      </mesh>
    </group>
  );
}

// ─── Pumping Unit (surface, simplified beam pump) ────────────────────────────

function PumpingUnit({ spm }: { spm: number }) {
  const beamRef = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    if (beamRef.current) {
      const speed = spm / 6;
      beamRef.current.rotation.z =
        Math.sin(clock.getElapsedTime() * speed * Math.PI) * 0.15;
    }
  });

  return (
    <group position={[0, 4.5, 0]}>
      {/* Samson post */}
      <mesh position={[0.6, 0.5, 0]}>
        <boxGeometry args={[0.15, 2, 0.15]} />
        <meshStandardMaterial color="#555" metalness={0.7} roughness={0.3} />
      </mesh>
      {/* Walking beam */}
      <group ref={beamRef} position={[0.6, 1.5, 0]}>
        <mesh>
          <boxGeometry args={[2.5, 0.1, 0.12]} />
          <meshStandardMaterial color="#666" metalness={0.8} roughness={0.2} />
        </mesh>
        {/* Horse head */}
        <mesh position={[-1.2, -0.1, 0]}>
          <boxGeometry args={[0.3, 0.25, 0.12]} />
          <meshStandardMaterial color="#777" metalness={0.8} roughness={0.2} />
        </mesh>
      </group>
      {/* Base */}
      <mesh position={[0.6, -0.5, 0]}>
        <boxGeometry args={[1.5, 0.15, 0.8]} />
        <meshStandardMaterial color="#444" metalness={0.6} roughness={0.4} />
      </mesh>
    </group>
  );
}

// ─── Fluid Level Indicator ───────────────────────────────────────────────────

function FluidLevel({ level }: { level: number }) {
  // level: 0 to 1 (0 = empty, 1 = full)
  const height = level * 4;
  const yPos = -6.5 + height / 2;

  return (
    <mesh position={[0, yPos, 0]}>
      <cylinderGeometry args={[0.22, 0.22, height, 16]} />
      <meshStandardMaterial
        color="#1a0e00"
        transparent
        opacity={0.6}
      />
    </mesh>
  );
}

// ─── Labels ──────────────────────────────────────────────────────────────────

function Labels({ temperature, viscosity }: { temperature: number; viscosity: number }) {
  return (
    <group>
      <Text
        position={[2.5, 4.5, 0]}
        fontSize={0.2}
        color="#f59e0b"
        anchorX="left"
      >
        {`Pumping Unit`}
      </Text>
      <Text
        position={[2.5, -3, 0]}
        fontSize={0.18}
        color="#f97316"
        anchorX="left"
      >
        {`Steam Zone: ${Math.round(temperature)}°C`}
      </Text>
      <Text
        position={[2.5, -4, 0]}
        fontSize={0.16}
        color="#06b6d4"
        anchorX="left"
      >
        {`Viscosity: ${Math.round(viscosity)} cP`}
      </Text>
      <Text
        position={[-2.5, 2, 0]}
        fontSize={0.15}
        color="#888"
        anchorX="right"
      >
        Surface
      </Text>
      <Text
        position={[-2.5, -5, 0]}
        fontSize={0.15}
        color="#888"
        anchorX="right"
      >
        Reservoir
      </Text>
    </group>
  );
}

// ─── Ground Plane ────────────────────────────────────────────────────────────

function Ground() {
  return (
    <mesh position={[0, 3, 0]} rotation={[-Math.PI / 2, 0, 0]}>
      <planeGeometry args={[12, 12]} />
      <meshStandardMaterial color="#1a1a1f" transparent opacity={0.5} />
    </mesh>
  );
}

// ─── Main Scene ──────────────────────────────────────────────────────────────

interface WellTwin3DProps {
  temperature: number;
  viscosity: number;
  spm: number;
  fluidLevel: number;
}

export default function WellTwin3D({
  temperature = 120,
  viscosity = 200,
  spm = 5,
  fluidLevel = 0.6,
}: WellTwin3DProps) {
  const cameraPosition = useMemo<[number, number, number]>(() => [5, 2, 8], []);

  return (
    <div className="w-full h-full rounded-xl overflow-hidden bg-gradient-to-b from-[#0a0a12] to-[#111118]">
      <Canvas
        camera={{ position: cameraPosition, fov: 45 }}
        gl={{ antialias: true }}
      >
        <ambientLight intensity={0.3} />
        <directionalLight position={[5, 10, 5]} intensity={0.8} color="#fff5e0" />
        <pointLight position={[0, -3, 2]} intensity={0.5} color="#f59e0b" distance={8} />

        <Ground />
        <Casing />
        <Tubing />
        <SuckerRod spm={spm} />
        <PumpingUnit spm={spm} />
        <SteamZone temperature={temperature} />
        <FluidLevel level={fluidLevel} />
        <Labels temperature={temperature} viscosity={viscosity} />

        <OrbitControls
          enablePan={false}
          minDistance={5}
          maxDistance={15}
          minPolarAngle={Math.PI / 6}
          maxPolarAngle={Math.PI / 2}
        />
        <Environment preset="night" />
      </Canvas>
    </div>
  );
}
