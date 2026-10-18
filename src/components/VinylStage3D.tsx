/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { Disc, Play, Pause, RotateCw, Layers, Eye, Maximize2, Minimize2, ChevronDown, ChevronUp, Sparkles } from 'lucide-react';

// Scratch module-scope helpers to prevent Garbage Collection during 60fps render loop
const _vec3 = new THREE.Vector3();
const _targetLook = new THREE.Vector3(0, 0.6, 0);

type FinishOption = 'rosegold' | 'royalgold' | 'onyx' | 'emerald';

interface FinishConfig {
  name: string;
  badge: string;
  chassisColor: number;
  chassisMetalness: number;
  chassisRoughness: number;
  platterColor: number;
  accentColor: number;
  vinylTrimColor: number;
}

const FINISHES: Record<FinishOption, FinishConfig> = {
  rosegold: {
    name: 'Obsidian & Rose Gold',
    badge: '#FF3B9D',
    chassisColor: 0x140713,
    chassisMetalness: 0.85,
    chassisRoughness: 0.22,
    platterColor: 0xE8A598,
    accentColor: 0xFF4FA3,
    vinylTrimColor: 0xFF2A93,
  },
  royalgold: {
    name: '24K Royal Gold',
    badge: '#FFD700',
    chassisColor: 0x0C0C0E,
    chassisMetalness: 0.95,
    chassisRoughness: 0.15,
    platterColor: 0xF5C542,
    accentColor: 0xFFD700,
    vinylTrimColor: 0xF5A623,
  },
  onyx: {
    name: 'Deep Cyber Onyx',
    badge: '#A855F7',
    chassisColor: 0x08080C,
    chassisMetalness: 0.9,
    chassisRoughness: 0.1,
    platterColor: 0x2A2A38,
    accentColor: 0xC084FC,
    vinylTrimColor: 0x8B5CF6,
  },
  emerald: {
    name: 'Midnight Emerald',
    badge: '#10B981',
    chassisColor: 0x05120D,
    chassisMetalness: 0.88,
    chassisRoughness: 0.18,
    platterColor: 0x10B981,
    accentColor: 0x34D399,
    vinylTrimColor: 0x059669,
  },
};

// Procedural texture generators (zero external 404 dependencies)
function createVinylGrooveTexture(maxAnisotropy: number): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 1024;
  const ctx = canvas.getContext('2d')!;

  // Dark vinyl resin base
  ctx.fillStyle = '#111113';
  ctx.fillRect(0, 0, 1024, 1024);

  const cx = 512;
  const cy = 512;

  // Concentric micro-grooves
  for (let r = 160; r < 500; r += 1.8) {
    const intensity = Math.sin(r * 0.7) * 0.5 + 0.5;
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.strokeStyle = `rgba(${Math.floor(40 + intensity * 60)}, ${Math.floor(40 + intensity * 60)}, ${Math.floor(45 + intensity * 60)}, 0.45)`;
    ctx.lineWidth = 0.9;
    ctx.stroke();
  }

  // Lead-out runout grooves near center label
  for (let r = 145; r <= 160; r += 4) {
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(70, 70, 75, 0.6)';
    ctx.lineWidth = 1.2;
    ctx.stroke();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.anisotropy = maxAnisotropy;
  return texture;
}

function createCenterLabelTexture(maxAnisotropy: number): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  // Outer gold rim
  const grad = ctx.createRadialGradient(256, 256, 20, 256, 256, 256);
  grad.addColorStop(0, '#FF4FA3');
  grad.addColorStop(0.35, '#851352');
  grad.addColorStop(0.7, '#2D0A22');
  grad.addColorStop(1, '#1A0413');

  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.arc(256, 256, 256, 0, Math.PI * 2);
  ctx.fill();

  // Decorative concentric rings
  ctx.strokeStyle = 'rgba(255, 215, 0, 0.7)';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.arc(256, 256, 240, 0, Math.PI * 2);
  ctx.stroke();

  ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.arc(256, 256, 180, 0, Math.PI * 2);
  ctx.stroke();

  // Typography
  ctx.fillStyle = '#FFFFFF';
  ctx.font = 'bold 36px sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('VAW LYNE', 256, 120);

  ctx.fillStyle = '#FFD700';
  ctx.font = 'bold 22px monospace';
  ctx.fillText('LOVE & LIES', 256, 160);

  ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
  ctx.font = '16px monospace';
  ctx.fillText('BILION VIBEZ INT.', 256, 340);
  ctx.fillText('33 ⅓ RPM • STEREO', 256, 370);
  ctx.fillText('SIDE A • AFRO HOUSE', 256, 400);

  // Spindle hole center black circle
  ctx.fillStyle = '#08080A';
  ctx.beginPath();
  ctx.arc(256, 256, 28, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = '#FFD700';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(256, 256, 30, 0, Math.PI * 2);
  ctx.stroke();

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = maxAnisotropy;
  return texture;
}

function createContactShadowTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  const radGrad = ctx.createRadialGradient(256, 256, 60, 256, 256, 256);
  radGrad.addColorStop(0, 'rgba(0, 0, 0, 0.85)');
  radGrad.addColorStop(0.4, 'rgba(10, 2, 8, 0.5)');
  radGrad.addColorStop(0.7, 'rgba(0, 0, 0, 0.2)');
  radGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');

  ctx.fillStyle = radGrad;
  ctx.fillRect(0, 0, 512, 512);

  const texture = new THREE.CanvasTexture(canvas);
  return texture;
}

export default function VinylStage3D() {
  const mountRef = useRef<HTMLDivElement>(null);

  // UI state
  const [isPlaying, setIsPlaying] = useState(true);
  const [rpm, setRpm] = useState<'33' | '45'>('33');
  const [finish, setFinish] = useState<FinishOption>('rosegold');
  const [explodedRatio, setExplodedRatio] = useState(0);
  const [isDockCollapsed, setIsDockCollapsed] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Animation mutable refs to avoid recreating the Three.js loop
  const stateRef = useRef({
    isPlaying: true,
    rpmSpeed: 0.035,
    explodedRatio: 0,
    currentExploded: 0,
    targetCamPos: new THREE.Vector3(0, 3.8, 5.2),
  });

  // Keep stateRef in sync with React state
  useEffect(() => {
    stateRef.current.isPlaying = isPlaying;
  }, [isPlaying]);

  useEffect(() => {
    stateRef.current.rpmSpeed = rpm === '33' ? 0.035 : 0.048;
  }, [rpm]);

  useEffect(() => {
    stateRef.current.explodedRatio = explodedRatio;
  }, [explodedRatio]);

  // Dynamic finish material update ref
  const materialRefs = useRef<{
    chassisMat?: THREE.MeshPhysicalMaterial;
    platterMat?: THREE.MeshStandardMaterial;
    accentMat?: THREE.MeshStandardMaterial;
    hologramMat?: THREE.MeshBasicMaterial;
  }>({});

  useEffect(() => {
    const cfg = FINISHES[finish];
    if (materialRefs.current.chassisMat) {
      materialRefs.current.chassisMat.color.setHex(cfg.chassisColor);
      materialRefs.current.chassisMat.metalness = cfg.chassisMetalness;
      materialRefs.current.chassisMat.roughness = cfg.chassisRoughness;
    }
    if (materialRefs.current.platterMat) {
      materialRefs.current.platterMat.color.setHex(cfg.platterColor);
    }
    if (materialRefs.current.accentMat) {
      materialRefs.current.accentMat.color.setHex(cfg.accentColor);
    }
    if (materialRefs.current.hologramMat) {
      materialRefs.current.hologramMat.color.setHex(cfg.vinylTrimColor);
    }
  }, [finish]);

  // Camera preset handler
  const setCameraView = useCallback((preset: 'hero' | 'top' | 'stylus') => {
    if (preset === 'hero') {
      stateRef.current.targetCamPos.set(0, 3.8, 5.2);
    } else if (preset === 'top') {
      stateRef.current.targetCamPos.set(0, 6.5, 0.4);
    } else if (preset === 'stylus') {
      stateRef.current.targetCamPos.set(1.4, 2.2, 1.8);
    }
  }, []);

  // Keyboard shortcut 'H' to toggle dock
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'h' || e.key === 'H') {
        setIsDockCollapsed((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // 1. Scene setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0A030D);
    scene.fog = new THREE.FogExp2(0x0A030D, 0.055);

    // 2. Camera setup
    const camera = new THREE.PerspectiveCamera(
      42,
      container.clientWidth / container.clientHeight,
      0.1,
      50
    );
    camera.position.set(0, 3.8, 5.2);

    // 3. Renderer setup
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      powerPreference: 'high-performance',
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    container.appendChild(renderer.domElement);

    // 4. Studio Environment Reflections via RoomEnvironment & PMREMGenerator
    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    scene.environment = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;
    pmremGenerator.dispose();

    // 5. OrbitControls with smooth exponential damping
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.minDistance = 2.2;
    controls.maxDistance = 10;
    controls.maxPolarAngle = Math.PI / 2 - 0.02; // prevent camera going below floor
    controls.target.copy(_targetLook);

    // 6. Lighting Rig: Warm Key Light + Cool Sky Fill + Neon Accent Rim
    const keyLight = new THREE.DirectionalLight(0xFFE4C7, 2.4);
    keyLight.position.set(3.5, 6, 4);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.width = 2048;
    keyLight.shadow.mapSize.height = 2048;
    keyLight.shadow.camera.near = 0.5;
    keyLight.shadow.camera.far = 15;
    keyLight.shadow.camera.left = -3;
    keyLight.shadow.camera.right = 3;
    keyLight.shadow.camera.top = 3;
    keyLight.shadow.camera.bottom = -3;
    keyLight.shadow.bias = -0.0005;
    keyLight.shadow.normalBias = 0.02;
    scene.add(keyLight);

    const hemiLight = new THREE.HemisphereLight(0x7B2CBF, 0x14051E, 1.4);
    scene.add(hemiLight);

    const rimLight = new THREE.DirectionalLight(0xFF2A93, 2.0);
    rimLight.position.set(-4, 3, -3);
    scene.add(rimLight);

    const maxAnisotropy = renderer.capabilities.getMaxAnisotropy();
    const vinylGrooveTex = createVinylGrooveTexture(maxAnisotropy);
    const centerLabelTex = createCenterLabelTexture(maxAnisotropy);
    const shadowTex = createContactShadowTexture();

    // ========================================================
    // COMPOSITE 3-12 PART PROCEDURAL HERO MODEL (TURNTABLE)
    // ========================================================
    const turntableRoot = new THREE.Group();
    turntableRoot.position.set(0, 0, 0); // Grounded at bottom-center
    scene.add(turntableRoot);

    // Part 1: Soft Contact Shadow Plane (at Y = 0.01)
    const shadowGeo = new THREE.PlaneGeometry(5.2, 4.4);
    const shadowMat = new THREE.MeshBasicMaterial({
      map: shadowTex,
      transparent: true,
      depthWrite: false,
      opacity: 0.7,
    });
    const shadowMesh = new THREE.Mesh(shadowGeo, shadowMat);
    shadowMesh.rotation.x = -Math.PI / 2;
    shadowMesh.position.y = 0.01;
    turntableRoot.add(shadowMesh);

    // Part 2: Base Plinth (Chassis) with Beveled Rounded Corners
    const chassisShape = new THREE.Shape();
    const w = 3.6;
    const l = 2.8;
    const r = 0.25;
    chassisShape.moveTo(-w / 2 + r, -l / 2);
    chassisShape.lineTo(w / 2 - r, -l / 2);
    chassisShape.quadraticCurveTo(w / 2, -l / 2, w / 2, -l / 2 + r);
    chassisShape.lineTo(w / 2, l / 2 - r);
    chassisShape.quadraticCurveTo(w / 2, l / 2, w / 2 - r, l / 2);
    chassisShape.lineTo(-w / 2 + r, l / 2);
    chassisShape.quadraticCurveTo(-w / 2, l / 2, -w / 2, l / 2 - r);
    chassisShape.lineTo(-w / 2, -l / 2 + r);
    chassisShape.quadraticCurveTo(-w / 2, -l / 2, -w / 2 + r, -l / 2);

    const extrudeSettings = {
      depth: 0.35,
      bevelEnabled: true,
      bevelSegments: 5,
      steps: 1,
      bevelSize: 0.05,
      bevelThickness: 0.05,
    };
    const chassisGeo = new THREE.ExtrudeGeometry(chassisShape, extrudeSettings);
    chassisGeo.center();

    const initialFinish = FINISHES[finish];
    const chassisMat = new THREE.MeshPhysicalMaterial({
      color: initialFinish.chassisColor,
      metalness: initialFinish.chassisMetalness,
      roughness: initialFinish.chassisRoughness,
      clearcoat: 0.8,
      clearcoatRoughness: 0.15,
    });
    materialRefs.current.chassisMat = chassisMat;

    const chassisMesh = new THREE.Mesh(chassisGeo, chassisMat);
    chassisMesh.rotation.x = -Math.PI / 2;
    chassisMesh.position.set(0, 0.3, 0);
    chassisMesh.castShadow = true;
    chassisMesh.receiveShadow = true;
    turntableRoot.add(chassisMesh);

    // Part 3: Plinth Feet (4 Dampener Pods)
    const footGeo = new THREE.CylinderGeometry(0.18, 0.14, 0.15, 32);
    const footMat = new THREE.MeshStandardMaterial({
      color: 0xE8A598,
      metalness: 0.9,
      roughness: 0.2,
    });
    const footPositions = [
      [-1.5, 0.08, -1.1],
      [1.5, 0.08, -1.1],
      [-1.5, 0.08, 1.1],
      [1.5, 0.08, 1.1],
    ];
    footPositions.forEach(([fx, fy, fz]) => {
      const foot = new THREE.Mesh(footGeo, footMat);
      foot.position.set(fx, fy, fz);
      foot.castShadow = true;
      turntableRoot.add(foot);
    });

    // Part 4: Machined Platter (Sub-assembly)
    const platterGroup = new THREE.Group();
    platterGroup.position.set(-0.45, 0.52, 0);
    turntableRoot.add(platterGroup);

    const platterBaseGeo = new THREE.CylinderGeometry(1.22, 1.25, 0.12, 64);
    const platterMat = new THREE.MeshStandardMaterial({
      color: initialFinish.platterColor,
      metalness: 0.92,
      roughness: 0.22,
    });
    materialRefs.current.platterMat = platterMat;

    const platterMesh = new THREE.Mesh(platterBaseGeo, platterMat);
    platterMesh.castShadow = true;
    platterMesh.receiveShadow = true;
    platterGroup.add(platterMesh);

    // Part 5: Rubber Mat on Platter
    const matGeo = new THREE.CylinderGeometry(1.18, 1.18, 0.02, 64);
    const rubberMat = new THREE.MeshStandardMaterial({
      color: 0x1A1A1E,
      roughness: 0.85,
      metalness: 0.05,
    });
    const matMesh = new THREE.Mesh(matGeo, rubberMat);
    matMesh.position.y = 0.065;
    matMesh.receiveShadow = true;
    platterGroup.add(matMesh);

    // Part 6: Vinyl Record Assembly
    const vinylGroup = new THREE.Group();
    vinylGroup.position.set(-0.45, 0.62, 0);
    turntableRoot.add(vinylGroup);

    const vinylGeo = new THREE.CylinderGeometry(1.15, 1.15, 0.018, 64);
    const vinylMat = new THREE.MeshStandardMaterial({
      color: 0x0D0D10,
      metalness: 0.35,
      roughness: 0.18,
      bumpMap: vinylGrooveTex,
      bumpScale: 0.008,
    });
    const vinylMesh = new THREE.Mesh(vinylGeo, vinylMat);
    vinylMesh.castShadow = true;
    vinylMesh.receiveShadow = true;
    vinylGroup.add(vinylMesh);

    // Part 7: Center Vinyl Label (Top face)
    const labelGeo = new THREE.CircleGeometry(0.38, 48);
    const labelMat = new THREE.MeshBasicMaterial({
      map: centerLabelTex,
      polygonOffset: true,
      polygonOffsetFactor: -1,
      polygonOffsetUnits: -1,
    });
    const labelMesh = new THREE.Mesh(labelGeo, labelMat);
    labelMesh.rotation.x = -Math.PI / 2;
    labelMesh.position.y = 0.01;
    vinylGroup.add(labelMesh);

    // Part 8: Gold Center Spindle & Record Weight Stabilizer
    const clampGroup = new THREE.Group();
    clampGroup.position.set(-0.45, 0.64, 0);
    turntableRoot.add(clampGroup);

    const spindleGeo = new THREE.CylinderGeometry(0.025, 0.025, 0.16, 32);
    const spindleMat = new THREE.MeshStandardMaterial({
      color: 0xFFD700,
      metalness: 0.95,
      roughness: 0.1,
    });
    const spindleMesh = new THREE.Mesh(spindleGeo, spindleMat);
    spindleMesh.position.y = 0.04;
    spindleMesh.castShadow = true;
    clampGroup.add(spindleMesh);

    // Ergonomic heavy record stabilizer weight clamp
    const clampGeo = new THREE.CylinderGeometry(0.14, 0.16, 0.08, 32);
    const clampMesh = new THREE.Mesh(clampGeo, spindleMat);
    clampMesh.position.y = 0.04;
    clampMesh.castShadow = true;
    clampGroup.add(clampMesh);

    // Part 9: Tone Arm Assembly (Gimbal Base, Arm Wand, Cartridge, Stylus)
    const tonearmGroup = new THREE.Group();
    tonearmGroup.position.set(1.15, 0.54, -0.65);
    turntableRoot.add(tonearmGroup);

    // Gimbal Bearing Tower
    const towerGeo = new THREE.CylinderGeometry(0.12, 0.15, 0.28, 32);
    const accentMat = new THREE.MeshStandardMaterial({
      color: initialFinish.accentColor,
      metalness: 0.95,
      roughness: 0.15,
    });
    materialRefs.current.accentMat = accentMat;

    const towerMesh = new THREE.Mesh(towerGeo, accentMat);
    towerMesh.position.y = 0.14;
    towerMesh.castShadow = true;
    tonearmGroup.add(towerMesh);

    // Counterweight Ring
    const counterGeo = new THREE.CylinderGeometry(0.09, 0.09, 0.1, 32);
    const counterMat = new THREE.MeshStandardMaterial({
      color: 0x33333E,
      metalness: 0.85,
      roughness: 0.25,
    });
    const counterMesh = new THREE.Mesh(counterGeo, counterMat);
    counterMesh.rotation.z = Math.PI / 2;
    counterMesh.position.set(0, 0.26, -0.22);
    counterMesh.castShadow = true;
    tonearmGroup.add(counterMesh);

    // Pivoting Tone Arm Wand & Headshell
    const wandPivot = new THREE.Group();
    wandPivot.position.set(0, 0.26, 0);
    tonearmGroup.add(wandPivot);

    // S-curve wand modeled with curve and TubeGeometry
    const curve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, 0, -0.15),
      new THREE.Vector3(0, 0, 0.2),
      new THREE.Vector3(-0.08, 0.02, 0.8),
      new THREE.Vector3(-0.25, -0.02, 1.4),
      new THREE.Vector3(-0.35, -0.06, 1.7),
    ]);
    const wandGeo = new THREE.TubeGeometry(curve, 32, 0.022, 16, false);
    const wandMesh = new THREE.Mesh(wandGeo, accentMat);
    wandMesh.castShadow = true;
    wandPivot.add(wandMesh);

    // Headshell Cartridge
    const headshellGeo = new THREE.BoxGeometry(0.08, 0.04, 0.16);
    const headshellMat = new THREE.MeshStandardMaterial({
      color: 0x111115,
      metalness: 0.7,
      roughness: 0.3,
    });
    const headshellMesh = new THREE.Mesh(headshellGeo, headshellMat);
    headshellMesh.position.set(-0.38, -0.08, 1.82);
    headshellMesh.rotation.y = 0.25;
    headshellMesh.castShadow = true;
    wandPivot.add(headshellMesh);

    // Stylus needle tip (Neon Pink / Gold indicator)
    const stylusGeo = new THREE.ConeGeometry(0.012, 0.04, 16);
    const stylusMat = new THREE.MeshBasicMaterial({ color: 0xFF4FA3 });
    const stylusMesh = new THREE.Mesh(stylusGeo, stylusMat);
    stylusMesh.rotation.x = Math.PI;
    stylusMesh.position.set(-0.39, -0.11, 1.86);
    wandPivot.add(stylusMesh);

    // Part 10: Deck Controls (Speed Switch, Pitch Slider, Power Dial)
    const knobGeo = new THREE.CylinderGeometry(0.08, 0.08, 0.06, 32);
    const knobMesh = new THREE.Mesh(knobGeo, accentMat);
    knobMesh.position.set(-1.45, 0.52, 1.05);
    knobMesh.castShadow = true;
    turntableRoot.add(knobMesh);

    const pitchPlateGeo = new THREE.BoxGeometry(0.12, 0.01, 0.7);
    const pitchPlateMat = new THREE.MeshStandardMaterial({ color: 0x222228, metalness: 0.7, roughness: 0.3 });
    const pitchPlate = new THREE.Mesh(pitchPlateGeo, pitchPlateMat);
    pitchPlate.position.set(1.45, 0.51, 0.6);
    turntableRoot.add(pitchPlate);

    // Part 11: Holographic Equalizer Rings
    const ringGeo = new THREE.RingGeometry(1.3, 1.42, 64);
    const hologramMat = new THREE.MeshBasicMaterial({
      color: initialFinish.vinylTrimColor,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.35,
    });
    materialRefs.current.hologramMat = hologramMat;

    const hologramRing = new THREE.Mesh(ringGeo, hologramMat);
    hologramRing.rotation.x = -Math.PI / 2;
    hologramRing.position.set(-0.45, 0.54, 0);
    turntableRoot.add(hologramRing);

    // Outer subtle orbit ring
    const outerRingGeo = new THREE.RingGeometry(1.5, 1.54, 64);
    const outerRing = new THREE.Mesh(outerRingGeo, hologramMat);
    outerRing.rotation.x = -Math.PI / 2;
    outerRing.position.set(-0.45, 0.56, 0);
    turntableRoot.add(outerRing);

    // 7. Animation Loop with Silky-Smooth Exponential Damping
    let animId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const delta = Math.min(clock.getDelta(), 0.1);
      const time = clock.getElapsedTime();

      // Camera preset smooth glide using exponential damping
      camera.position.x = THREE.MathUtils.damp(camera.position.x, stateRef.current.targetCamPos.x, 3.5, delta);
      camera.position.y = THREE.MathUtils.damp(camera.position.y, stateRef.current.targetCamPos.y, 3.5, delta);
      camera.position.z = THREE.MathUtils.damp(camera.position.z, stateRef.current.targetCamPos.z, 3.5, delta);

      // Record spinning animation
      if (stateRef.current.isPlaying) {
        const spin = stateRef.current.rpmSpeed;
        vinylGroup.rotation.y += spin;
        platterGroup.rotation.y += spin;
        clampGroup.rotation.y += spin;

        // Smoothly guide tone arm over the record groove
        wandPivot.rotation.y = THREE.MathUtils.damp(wandPivot.rotation.y, 0.22, 4.0, delta);
        wandPivot.rotation.x = THREE.MathUtils.damp(wandPivot.rotation.x, 0.02, 4.0, delta);

        // Holographic soundwave pulse
        const pulse = Math.sin(time * 6) * 0.08 + 1.0;
        hologramRing.scale.set(pulse, pulse, pulse);
        hologramMat.opacity = 0.3 + Math.sin(time * 4) * 0.15;
      } else {
        // Stop spinning & rest the tone arm
        wandPivot.rotation.y = THREE.MathUtils.damp(wandPivot.rotation.y, -0.25, 3.0, delta);
        wandPivot.rotation.x = THREE.MathUtils.damp(wandPivot.rotation.x, -0.06, 3.0, delta);
        hologramMat.opacity = THREE.MathUtils.damp(hologramMat.opacity, 0.08, 3.0, delta);
      }

      // Smooth Exploded View Layer Separation
      stateRef.current.currentExploded = THREE.MathUtils.damp(
        stateRef.current.currentExploded,
        stateRef.current.explodedRatio,
        7.0,
        delta
      );
      const exp = stateRef.current.currentExploded;

      // Explode Y positions smoothly
      clampGroup.position.y = 0.64 + exp * 1.5;
      vinylGroup.position.y = 0.62 + exp * 1.05;
      platterGroup.position.y = 0.52 + exp * 0.6;
      tonearmGroup.position.y = 0.54 + exp * 0.45;
      chassisMesh.position.y = 0.3 - exp * 0.15;

      controls.update();
      renderer.render(scene, camera);
    };

    animate();

    // 8. Responsive resize handling
    const handleResize = () => {
      if (!container) return;
      camera.aspect = container.clientWidth / container.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
      chassisGeo.dispose();
      chassisMat.dispose();
      vinylGeo.dispose();
      vinylMat.dispose();
      platterBaseGeo.dispose();
      platterMat.dispose();
      shadowGeo.dispose();
      shadowMat.dispose();
      wandGeo.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <section className="relative w-full rounded-3xl overflow-hidden border border-white/10 bg-midnight-black shadow-2xl">
      {/* Viewport Top Header Spec Bar */}
      <div className="absolute top-4 left-4 sm:left-6 z-20 flex flex-wrap items-center gap-2 pointer-events-auto">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-zinc-950/90 border border-white/10 text-white text-xs font-mono">
          <Disc className="w-3.5 h-3.5 text-vaw-pink" />
          <span className="font-bold">STUDIO VINYL 3D</span>
          <span className="text-zinc-500">|</span>
          <span className="text-rose-mist">LOVE &amp; LIES ERA</span>
        </div>
        <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-zinc-950/80 border border-white/5 text-[11px] font-mono text-zinc-400">
          <span>Drag to orbit • Scroll to zoom</span>
        </div>
      </div>

      <div className="absolute top-4 right-4 sm:right-6 z-20 flex items-center gap-2 pointer-events-auto">
        <button
          onClick={() => setIsFullscreen((prev) => !prev)}
          className="p-2 rounded-xl bg-zinc-950/90 hover:bg-zinc-800 border border-white/10 text-zinc-300 hover:text-white transition-all cursor-pointer shadow-md"
          title={isFullscreen ? 'Exit Fullscreen' : 'Cinema Mode'}
        >
          {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
        </button>
      </div>

      {/* 3D WebGL Canvas Stable Mount Container */}
      <div
        ref={mountRef}
        className={`w-full transition-all duration-300 ${
          isFullscreen ? 'fixed inset-0 z-50 rounded-none h-screen' : 'h-[520px] sm:h-[620px]'
        }`}
        style={{ touchAction: 'none' }}
      />

      {/* Unified Ergonomic Bottom Control Dock (<= 15% Viewport Footprint, Pinned Bottom Center) */}
      <div
        className={`absolute z-30 transition-transform duration-300 left-1/2 -translate-x-1/2 w-full max-w-[920px] px-3 sm:px-4 pointer-events-none ${
          isFullscreen ? 'bottom-6' : 'bottom-4'
        } ${isDockCollapsed ? 'translate-y-[calc(100%-36px)]' : 'translate-y-0'}`}
      >
        <div className="relative mx-auto flex flex-col items-center">
          {/* Collapse / Expand Toggle Button */}
          <button
            onClick={() => setIsDockCollapsed((prev) => !prev)}
            className="pointer-events-auto flex items-center gap-1.5 px-3 py-1 rounded-t-xl bg-[#130717] border-t border-x border-white/15 text-[11px] font-mono text-zinc-300 hover:text-white shadow-lg cursor-pointer transition-colors"
          >
            {isDockCollapsed ? (
              <>
                <ChevronUp className="w-3.5 h-3.5 text-vaw-pink" />
                <span>Show Controls (Press H)</span>
              </>
            ) : (
              <>
                <ChevronDown className="w-3.5 h-3.5 text-zinc-400" />
                <span>Hide Dock</span>
              </>
            )}
          </button>

          {/* Solid RGBA Glass-free Dock Surface (Prevents GPU WebGL Stall) */}
          <div
            className="pointer-events-auto w-full p-3 sm:p-4 rounded-2xl border border-white/15 shadow-2xl space-y-3.5"
            style={{ backgroundColor: 'rgba(18, 9, 22, 0.95)' }}
          >
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/5 pb-2.5">
              {/* Play / Pause & RPM Selector */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsPlaying((prev) => !prev)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-mono text-xs font-bold uppercase tracking-wider transition-all cursor-pointer shadow-md ${
                    isPlaying
                      ? 'bg-vaw-pink text-white shadow-vaw-pink/30 hover:opacity-90'
                      : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
                  }`}
                >
                  {isPlaying ? (
                    <>
                      <Pause className="w-3.5 h-3.5" />
                      <span>Motor: Active</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-3.5 h-3.5 fill-current" />
                      <span>Motor: Stopped</span>
                    </>
                  )}
                </button>

                <div className="flex items-center bg-black/60 rounded-xl p-0.5 border border-white/10">
                  <button
                    onClick={() => setRpm('33')}
                    className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
                      rpm === '33' ? 'bg-vaw-pink text-white' : 'text-zinc-400 hover:text-white'
                    }`}
                  >
                    33 RPM
                  </button>
                  <button
                    onClick={() => setRpm('45')}
                    className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
                      rpm === '45' ? 'bg-vaw-pink text-white' : 'text-zinc-400 hover:text-white'
                    }`}
                  >
                    45 RPM
                  </button>
                </div>
              </div>

              {/* Exploded View Slider */}
              <div className="flex items-center gap-2.5 min-w-[200px] flex-1 sm:flex-initial justify-end">
                <Layers className="w-3.5 h-3.5 text-vaw-pink shrink-0" />
                <span className="text-[11px] font-mono text-zinc-400 whitespace-nowrap">
                  Exploded Deck: {Math.round(explodedRatio * 100)}%
                </span>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={explodedRatio}
                  onChange={(e) => setExplodedRatio(parseFloat(e.target.value))}
                  className="w-24 sm:w-32 accent-[#FF4FA3] cursor-pointer"
                />
              </div>
            </div>

            {/* Bottom Row: Finishes & Camera View Presets */}
            <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
              {/* Material Finish Swatches */}
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono uppercase text-zinc-400 hidden sm:inline">Finish:</span>
                {(Object.keys(FINISHES) as FinishOption[]).map((key) => {
                  const cfg = FINISHES[key];
                  const active = finish === key;
                  return (
                    <button
                      key={key}
                      onClick={() => setFinish(key)}
                      className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg font-mono text-[11px] transition-all cursor-pointer border ${
                        active
                          ? 'bg-zinc-800 border-vaw-pink text-white shadow-sm'
                          : 'bg-black/50 border-white/5 text-zinc-400 hover:text-white hover:border-white/20'
                      }`}
                    >
                      <span className="w-2 h-2 rounded-full" style={{ backgroundColor: cfg.badge }} />
                      <span className="hidden md:inline">{cfg.name}</span>
                    </button>
                  );
                })}
              </div>

              {/* Camera Angle Presets */}
              <div className="flex items-center gap-1 bg-black/60 p-1 rounded-xl border border-white/10">
                <span className="text-[10px] font-mono uppercase text-zinc-500 px-1 hidden sm:inline">Angle:</span>
                <button
                  onClick={() => setCameraView('hero')}
                  className="px-2 py-0.5 rounded-lg text-[11px] font-mono text-zinc-300 hover:text-white hover:bg-zinc-800 transition-colors cursor-pointer"
                >
                  Hero 45°
                </button>
                <button
                  onClick={() => setCameraView('top')}
                  className="px-2 py-0.5 rounded-lg text-[11px] font-mono text-zinc-300 hover:text-white hover:bg-zinc-800 transition-colors cursor-pointer"
                >
                  Top Deck
                </button>
                <button
                  onClick={() => setCameraView('stylus')}
                  className="px-2 py-0.5 rounded-lg text-[11px] font-mono text-zinc-300 hover:text-white hover:bg-zinc-800 transition-colors cursor-pointer"
                >
                  Stylus Zoom
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
