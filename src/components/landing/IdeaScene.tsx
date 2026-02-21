import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float } from '@react-three/drei';
import * as THREE from 'three';

/** A single floating "idea" shape that slowly rotates */
function IdeaShape({
  position,
  geometry,
  color,
  speed = 1,
  scale = 1,
}: {
  position: [number, number, number];
  geometry: 'box' | 'octahedron' | 'torus' | 'icosahedron' | 'cone' | 'dodecahedron';
  color: string;
  speed?: number;
  scale?: number;
}) {
  const ref = useRef<THREE.Mesh>(null!);
  const rotationOffset = useMemo(
    () => ({
      x: Math.random() * Math.PI,
      y: Math.random() * Math.PI,
      z: Math.random() * Math.PI,
    }),
    []
  );

  useFrame((state) => {
    const t = state.clock.elapsedTime * speed * 0.15;
    ref.current.rotation.x = rotationOffset.x + t * 0.7;
    ref.current.rotation.y = rotationOffset.y + t * 0.5;
    ref.current.rotation.z = rotationOffset.z + t * 0.3;
  });

  const geo = useMemo(() => {
    switch (geometry) {
      case 'box': return <boxGeometry args={[1, 1, 1]} />;
      case 'octahedron': return <octahedronGeometry args={[0.8]} />;
      case 'torus': return <torusGeometry args={[0.6, 0.25, 16, 32]} />;
      case 'icosahedron': return <icosahedronGeometry args={[0.7, 0]} />;
      case 'cone': return <coneGeometry args={[0.6, 1.2, 6]} />;
      case 'dodecahedron': return <dodecahedronGeometry args={[0.7]} />;
    }
  }, [geometry]);

  return (
    <Float speed={1.5} rotationIntensity={0} floatIntensity={2} floatingRange={[-0.3, 0.3]}>
      <mesh ref={ref} position={position} scale={scale}>
        {geo}
        <meshPhysicalMaterial
          color={color}
          transparent
          opacity={0.15}
          roughness={0.1}
          metalness={0.1}
          clearcoat={1}
          clearcoatRoughness={0.1}
          side={THREE.DoubleSide}
        />
        {/* Wireframe overlay for that "blueprint" feel */}
        <mesh scale={1.001}>
          {geo}
          <meshBasicMaterial color={color} wireframe transparent opacity={0.35} />
        </mesh>
      </mesh>
    </Float>
  );
}

/** Slow-drifting particle field */
function Particles({ count = 200 }: { count?: number }) {
  const ref = useRef<THREE.Points>(null!);
  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      arr[i * 3] = (Math.random() - 0.5) * 25;
      arr[i * 3 + 1] = (Math.random() - 0.5) * 25;
      arr[i * 3 + 2] = (Math.random() - 0.5) * 25;
    }
    return arr;
  }, [count]);

  useFrame((state) => {
    ref.current.rotation.y = state.clock.elapsedTime * 0.012;
    ref.current.rotation.x = state.clock.elapsedTime * 0.006;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial size={0.035} color="#666666" sizeAttenuation transparent opacity={0.5} />
    </points>
  );
}

/** The complete 3D scene */
export default function IdeaScene() {
  return (
    <Canvas
      camera={{ position: [0, 0, 8], fov: 45 }}
      style={{ position: 'absolute', inset: 0 }}
      gl={{ antialias: true, alpha: true }}
      dpr={[1, 1.5]}
    >
      <color attach="background" args={['#0a0a0b']} />

      {/* Lighting */}
      <ambientLight intensity={0.3} />
      <directionalLight position={[5, 5, 5]} intensity={0.6} />
      <directionalLight position={[-5, -3, 4]} intensity={0.2} color="#4ecdc4" />
      <pointLight position={[0, 0, 3]} intensity={0.4} color="#ff6b35" />

      {/* Floating idea shapes — asymmetric scatter */}
      <IdeaShape position={[-3.5, 2, -1]} geometry="octahedron" color="#ff6b35" speed={0.8} scale={1.2} />
      <IdeaShape position={[3, -1.5, 0.5]} geometry="box" color="#4ecdc4" speed={1.2} scale={1} />
      <IdeaShape position={[-1.8, -2.2, 1]} geometry="torus" color="#ffe66d" speed={0.6} scale={0.9} />
      <IdeaShape position={[3.8, 2.5, -2]} geometry="icosahedron" color="#a8e6cf" speed={1} scale={0.8} />
      <IdeaShape position={[-0.5, 3, -1.5]} geometry="cone" color="#ff8b94" speed={0.9} scale={0.75} />
      <IdeaShape position={[1.2, 0.5, -3]} geometry="dodecahedron" color="#c3b1e1" speed={0.7} scale={1.4} />
      <IdeaShape position={[-4, -0.5, -2.5]} geometry="box" color="#4ecdc4" speed={0.5} scale={0.6} />
      <IdeaShape position={[2, 3.5, -1]} geometry="torus" color="#ff6b35" speed={1.1} scale={0.5} />

      <Particles count={200} />
    </Canvas>
  );
}
