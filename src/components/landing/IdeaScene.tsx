import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, MeshTransmissionMaterial } from '@react-three/drei';
import * as THREE from 'three';

/** A single floating "idea" shape that slowly rotates */
function IdeaShape({ 
  position, 
  geometry, 
  color, 
  speed = 1,
  scale = 1 
}: { 
  position: [number, number, number]; 
  geometry: 'box' | 'octahedron' | 'torus' | 'icosahedron' | 'cone';
  color: string;
  speed?: number;
  scale?: number;
}) {
  const ref = useRef<THREE.Mesh>(null!);
  const rotationOffset = useMemo(() => ({
    x: Math.random() * Math.PI,
    y: Math.random() * Math.PI,
    z: Math.random() * Math.PI,
  }), []);

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
    }
  }, [geometry]);

  return (
    <Float speed={1.5} rotationIntensity={0} floatIntensity={2} floatingRange={[-0.3, 0.3]}>
      <mesh ref={ref} position={position} scale={scale}>
        {geo}
        <MeshTransmissionMaterial
          backside
          thickness={0.3}
          chromaticAberration={0.15}
          anisotropy={0.2}
          roughness={0.1}
          distortion={0.5}
          distortionScale={0.5}
          temporalDistortion={0.1}
          color={color}
          transmission={0.95}
          ior={1.5}
        />
      </mesh>
    </Float>
  );
}

/** Slow-drifting particle field */
function Particles({ count = 120 }: { count?: number }) {
  const ref = useRef<THREE.Points>(null!);
  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      arr[i * 3] = (Math.random() - 0.5) * 20;
      arr[i * 3 + 1] = (Math.random() - 0.5) * 20;
      arr[i * 3 + 2] = (Math.random() - 0.5) * 20;
    }
    return arr;
  }, [count]);

  useFrame((state) => {
    ref.current.rotation.y = state.clock.elapsedTime * 0.015;
    ref.current.rotation.x = state.clock.elapsedTime * 0.008;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
        />
      </bufferGeometry>
      <pointsMaterial size={0.03} color="#888888" sizeAttenuation transparent opacity={0.6} />
    </points>
  );
}

/** The complete 3D scene */
export default function IdeaScene() {
  return (
    <Canvas
      camera={{ position: [0, 0, 7], fov: 50 }}
      style={{ position: 'absolute', inset: 0 }}
      gl={{ antialias: true, alpha: true }}
      dpr={[1, 1.5]}
    >
      <color attach="background" args={['#0a0a0b']} />
      
      {/* Soft ambient + directional for glass refraction */}
      <ambientLight intensity={0.4} />
      <directionalLight position={[5, 5, 5]} intensity={0.8} />
      <directionalLight position={[-3, -2, 4]} intensity={0.3} color="#4488ff" />

      {/* Floating idea shapes — scattered asymmetrically */}
      <IdeaShape position={[-3.2, 1.8, -1]} geometry="octahedron" color="#ff6b35" speed={0.8} scale={1.1} />
      <IdeaShape position={[2.8, -1.2, 0.5]} geometry="box" color="#4ecdc4" speed={1.2} scale={0.9} />
      <IdeaShape position={[-1.5, -2, 1]} geometry="torus" color="#ffe66d" speed={0.6} scale={0.85} />
      <IdeaShape position={[3.5, 2.2, -2]} geometry="icosahedron" color="#a8e6cf" speed={1} scale={0.75} />
      <IdeaShape position={[-0.5, 2.8, -1.5]} geometry="cone" color="#ff8b94" speed={0.9} scale={0.7} />
      <IdeaShape position={[1, 0.3, -3]} geometry="octahedron" color="#c3b1e1" speed={0.7} scale={1.3} />
      
      <Particles count={150} />
    </Canvas>
  );
}
