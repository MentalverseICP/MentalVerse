import { useEffect, useRef } from 'react';
import * as THREE from 'three';


export const Interactive3DBrain: React.FC = () => {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mountRef.current) return;

    // Create Three.js scene
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x000000, 0);
    mountRef.current.appendChild(renderer.domElement);

    // Create brain-like geometry
    const brainGeometry = new THREE.SphereGeometry(2, 32, 32);
    const brainMaterial = new THREE.MeshPhongMaterial({
      color: 0x10b981,
      transparent: true,
      opacity: 0.8,
      wireframe: true
    });
    const brain = new THREE.Mesh(brainGeometry, brainMaterial);
    scene.add(brain);

    // Add neural network connections
    const connectionGeometry = new THREE.BufferGeometry();
    const positions = [];
    const colors = [];

    for (let i = 0; i < 100; i++) {
      const x = (Math.random() - 0.5) * 10;
      const y = (Math.random() - 0.5) * 10;
      const z = (Math.random() - 0.5) * 10;
      
      positions.push(x, y, z);
      colors.push(0.1, 0.7, 0.5);
    }

    connectionGeometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    connectionGeometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));

    const connectionMaterial = new THREE.PointsMaterial({
      size: 0.1,
      vertexColors: true,
      transparent: true,
      opacity: 0.6
    });

    const connections = new THREE.Points(connectionGeometry, connectionMaterial);
    scene.add(connections);

    // Add blockchain cubes
    const cubeGeometry = new THREE.BoxGeometry(0.2, 0.2, 0.2);
    const cubeMaterial = new THREE.MeshPhongMaterial({ color: 0x059669 });
    const cubes: THREE.Mesh[] = [];

    for (let i = 0; i < 20; i++) {
      const cube = new THREE.Mesh(cubeGeometry, cubeMaterial);
      cube.position.set(
        (Math.random() - 0.5) * 15,
        (Math.random() - 0.5) * 15,
        (Math.random() - 0.5) * 15
      );
      cubes.push(cube);
      scene.add(cube);
    }

    // Lighting
    const ambientLight = new THREE.AmbientLight(0x404040, 0.4);
    scene.add(ambientLight);
    
    const directionalLight = new THREE.DirectionalLight(0x10b981, 0.8);
    directionalLight.position.set(5, 5, 5);
    scene.add(directionalLight);

    camera.position.z = 8;

    // Animation
    const animate = () => {
      requestAnimationFrame(animate);
      
      brain.rotation.x += 0.005;
      brain.rotation.y += 0.01;
      
      connections.rotation.x += 0.002;
      connections.rotation.y += 0.003;
      
      cubes.forEach((cube, index) => {
        cube.rotation.x += 0.01;
        cube.rotation.y += 0.01;
        cube.position.y += Math.sin(Date.now() * 0.001 + index) * 0.01;
      });
      
      renderer.render(scene, camera);
    };

    animate();

    // Cleanup
    return () => {
      if (mountRef.current) {
        mountRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-0">
      <div ref={mountRef} className="absolute inset-0 opacity-30" />
    </div>
  );
};
