import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass.js';
import './MarsStimulation.css';

const OBSTACLES = [
  { x: 0, z: 0, radius: 8, type: 'CRATER', name: 'CRATER_ALPHA' },
  { x: -15, z: -10, radius: 5, type: 'CRATER', name: 'SMALL_IMPACT' },
  { x: 20, z: -20, radius: 6, type: 'CRATER', name: 'DEEP_CRATER' },
  { x: -28, z: -25, radius: 5.5, type: 'CRATER', name: 'CRATER_BETA' },
  { x: 10, z: -30, radius: 5.0, type: 'CRATER', name: 'NORTH_BASIN' },
  { x: 15, z: 12, radius: 10, height: 3.5, type: 'HILL', name: 'MARTIAN_RIDGE_A' },
  { x: -20, z: 18, radius: 8, height: 3.0, type: 'HILL', name: 'WEST_HILL' },
  { x: 30, z: -2, radius: 7, height: 2.5, type: 'HILL', name: 'EAST_RIDGE' },
  { x: -8, z: 25, radius: 9, height: 3.2, type: 'HILL', name: 'SOUTH_PLATEAU' },
  { x: -8, z: -2, radius: 1.5, type: 'ROCK', name: 'BOULDER_A' },
  { x: 16, z: -4, radius: 1.8, type: 'ROCK', name: 'BOULDER_B' }
];

const PLANET_CONFIGS = {
  MARS: {
    GROUND: 0xb84318,
    ROCKS: 0x6e240a,
    ATMOSPHERE: 0xc45e38,
    AMBIENT: 0x2b0d05,
    TARGET: 0x00ffcc,
    SUN: 0xfff0dd,
    FOG_DENSITY: 0.009,
    BUMP_SCALE: 0.4
  },
  MOON: {
    GROUND: 0x777777,
    ROCKS: 0x333333,
    ATMOSPHERE: 0x050508,
    AMBIENT: 0x111116,
    TARGET: 0x00ff88,
    SUN: 0xffffff,
    FOG_DENSITY: 0.002,
    BUMP_SCALE: 0.6
  }
};

function getTerrainHeight(x, z) {
  let heightVal =
    Math.sin(x * 0.08) * Math.cos(z * 0.08) * 1.5 +
    Math.sin(x * 0.15) * Math.sin(z * 0.14) * 0.4 +
    Math.sin(x * 0.3) * Math.cos(z * 0.3) * 0.15;

  const craters = OBSTACLES.filter(o => o.type === 'CRATER');
  const hills = OBSTACLES.filter(o => o.type === 'HILL');

  craters.forEach(c => {
    let dist = Math.hypot(x - c.x, z - c.z);
    if (dist < c.radius) {
      heightVal -= Math.cos((dist / c.radius) * Math.PI * 0.5) * 3.6;
    } else if (dist < c.radius * 1.35) {
      heightVal += Math.sin(((dist - c.radius) / (c.radius * 0.35)) * Math.PI) * 0.75;
    }
  });

  hills.forEach(h => {
    let dist = Math.hypot(x - h.x, z - h.z);
    if (dist < h.radius) {
      heightVal += Math.cos((dist / h.radius) * Math.PI * 0.5) * (h.height || 4.0);
    }
  });

  return heightVal;
}

function getTerrainNormal(x, z) {
  const eps = 0.25;
  const hL = getTerrainHeight(x - eps, z);
  const hR = getTerrainHeight(x + eps, z);
  const hD = getTerrainHeight(x, z - eps);
  const hU = getTerrainHeight(x, z + eps);
  return new THREE.Vector3(hL - hR, 2 * eps, hD - hU).normalize();
}

// Procedural Mars Surface Texture (Iron Oxide Dust + Fine Regolith)
function createMarsTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 2048; canvas.height = 2048;
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = '#b84318';
  ctx.fillRect(0, 0, 2048, 2048);

  const imgData = ctx.getImageData(0, 0, 2048, 2048);
  const data = imgData.data;
  for (let i = 0; i < data.length; i += 4) {
    const noise = 80 + Math.floor(Math.random() * 85);
    data[i] = Math.min(255, data[i] * (noise / 210));
    data[i + 1] = Math.min(255, data[i + 1] * (noise / 255));
    data[i + 2] = Math.min(255, data[i + 2] * (noise / 300));
  }
  ctx.putImageData(imgData, 0, 0);

  // Darker mineral patches
  for (let i = 0; i < 70; i++) {
    const x = Math.random() * 2048;
    const y = Math.random() * 2048;
    const r = 15 + Math.random() * 45;
    ctx.fillStyle = 'rgba(110, 36, 10, 0.25)';
    ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping; texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(16, 16);
  return texture;
}

// Procedural Moon Surface Texture (Basaltic Maria + Bright Regolith Ejecta)
function createMoonTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 2048; canvas.height = 2048;
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = '#888888';
  ctx.fillRect(0, 0, 2048, 2048);

  const imgData = ctx.getImageData(0, 0, 2048, 2048);
  const data = imgData.data;
  for (let i = 0; i < data.length; i += 4) {
    const noise = 60 + Math.floor(Math.random() * 110);
    data[i] = Math.min(255, data[i] * (noise / 200));
    data[i + 1] = Math.min(255, data[i + 1] * (noise / 200));
    data[i + 2] = Math.min(255, data[i + 2] * (noise / 200));
  }
  ctx.putImageData(imgData, 0, 0);

  // Dark Lunar Maria Patches
  for (let i = 0; i < 40; i++) {
    const x = Math.random() * 2048;
    const y = Math.random() * 2048;
    const r = 25 + Math.random() * 80;
    ctx.fillStyle = 'rgba(35, 35, 40, 0.35)';
    ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
  }

  // Bright Impact Ejecta Rays
  for (let i = 0; i < 60; i++) {
    const x = Math.random() * 2048;
    const y = Math.random() * 2048;
    const r = 5 + Math.random() * 20;
    ctx.fillStyle = 'rgba(230, 230, 230, 0.4)';
    ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping; texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(16, 16);
  return texture;
}

function findAStarPath(startWorld, targetWorld, obstacles) {
  const GRID_SIZE = 120; const MAP_MIN = -60; const MAP_MAX = 60; const CELL_SIZE = (MAP_MAX - MAP_MIN) / GRID_SIZE;
  const toGrid = (val) => Math.max(0, Math.min(GRID_SIZE - 1, Math.floor((val - MAP_MIN) / CELL_SIZE)));
  const toWorld = (idx) => MAP_MIN + (idx + 0.5) * CELL_SIZE;

  const startG = { x: toGrid(startWorld.x), z: toGrid(startWorld.z) };
  const targetG = { x: toGrid(targetWorld.x), z: toGrid(targetWorld.z) };
  const grid = Array.from({ length: GRID_SIZE }, () => new Array(GRID_SIZE).fill(false));

  for (let r = 0; r < GRID_SIZE; r++) {
    for (let c = 0; c < GRID_SIZE; c++) {
      const wx = toWorld(c); const wz = toWorld(r);
      for (let obs of obstacles) {
        if (Math.hypot(wx - obs.x, wz - obs.z) < obs.radius + 2.2) {
          grid[r][c] = true; break;
        }
      }
    }
  }

  const openSet = []; const closedSet = new Set(); const nodeMap = new Map();
  const key = (x, z) => `${x},${z}`; const heuristic = (x1, z1, x2, z2) => Math.hypot(x1 - x2, z1 - z2);
  const startNode = { x: startG.x, z: startG.z, g: 0, h: heuristic(startG.x, startG.z, targetG.x, targetG.z), parent: null }; startNode.f = startNode.g + startNode.h;
  openSet.push(startNode); nodeMap.set(key(startG.x, startG.z), startNode);

  let foundNode = null; let closestNode = startNode;
  while (openSet.length > 0) {
    openSet.sort((a, b) => a.f - b.f); const current = openSet.shift();
    if (current.h < closestNode.h) closestNode = current;
    if (current.x === targetG.x && current.z === targetG.z) { foundNode = current; break; }
    closedSet.add(key(current.x, current.z));
    const neighbors = [{ x: 0, z: -1, cost: 1 }, { x: 0, z: 1, cost: 1 }, { x: -1, z: 0, cost: 1 }, { x: 1, z: 0, cost: 1 }, { x: -1, z: -1, cost: 1.414 }, { x: 1, z: -1, cost: 1.414 }, { x: -1, z: 1, cost: 1.414 }, { x: 1, z: 1, cost: 1.414 }];
    for (let n of neighbors) {
      const nx = current.x + n.x; const nz = current.z + n.z; if (nx < 0 || nx >= GRID_SIZE || nz < 0 || nz >= GRID_SIZE) continue; if (grid[nz][nx] || closedSet.has(key(nx, nz))) continue;
      const gScore = current.g + n.cost; const neighborKey = key(nx, nz); let neighborNode = nodeMap.get(neighborKey);
      if (!neighborNode) { neighborNode = { x: nx, z: nz, g: gScore, h: heuristic(nx, nz, targetG.x, targetG.z), parent: current }; neighborNode.f = neighborNode.g + neighborNode.h; nodeMap.set(neighborKey, neighborNode); openSet.push(neighborNode); }
      else if (gScore < neighborNode.g) { neighborNode.g = gScore; neighborNode.f = neighborNode.g + neighborNode.h; neighborNode.parent = current; }
    }
  }
  const finalTarget = foundNode || closestNode; const path = []; let curr = finalTarget; while (curr) { const wx = toWorld(curr.x); const wz = toWorld(curr.z); path.push(new THREE.Vector3(wx, getTerrainHeight(wx, wz) + 0.4, wz)); curr = curr.parent; } path.reverse();
  if (path.length > 1) path.shift(); path.push(new THREE.Vector3(targetWorld.x, getTerrainHeight(targetWorld.x, targetWorld.z) + 0.4, targetWorld.z));
  return path;
}

export default function MarsSimulation() {
  const mountRef = useRef(null);
  const [activePlanet, setActivePlanet] = useState('MARS');
  const targetPosRef = useRef(new THREE.Vector3(-20, getTerrainHeight(-20, -20) + 0.4, -20));
  const roverPosRef = useRef(new THREE.Vector3(0, getTerrainHeight(0, 25) + 0.4, 25));
  const pathWaypointsRef = useRef([]);

  const targetZoomRef = useRef(1.0); const currentZoomRef = useRef(1.0);
  const cameraAnglesRef = useRef({ azimuth: 0.5, polar: 1.1 });
  const panOffsetRef = useRef(new THREE.Vector3(0, 0, 0));
  const isDraggingRef = useRef(false); const dragButtonRef = useRef(0); const previousMousePosRef = useRef({ x: event?.clientX || 0, y: event?.clientY || 0 });

  const [inputX, setInputX] = useState('-20.0'); const [inputZ, setInputZ] = useState('-20.0');
  const [telemetry, setTelemetry] = useState({ status: 'ASTAR_NAV', coords: 'X: 0.0 | Y: 0.4 | Z: 25.0', targetCoords: 'X: -20.0 | Z: -20.0', speed: '1.2 m/s', distToTarget: '55.0m' });

  const updateTarget = (xVal, zVal) => {
    const x = parseFloat(xVal); const z = parseFloat(zVal);
    if (!isNaN(x) && !isNaN(z)) {
      const clampedX = Math.max(-50, Math.min(50, x)); const clampedZ = Math.max(-50, Math.min(50, z));
      targetPosRef.current.set(clampedX, getTerrainHeight(clampedX, clampedZ) + 0.4, clampedZ);
      setInputX(clampedX.toFixed(1)); setInputZ(clampedZ.toFixed(1));
      pathWaypointsRef.current = findAStarPath(roverPosRef.current, targetPosRef.current, OBSTACLES);
    }
  };

  useEffect(() => {
    const currentRef = mountRef.current; const width = currentRef.clientWidth; const height = currentRef.clientHeight;
    const config = PLANET_CONFIGS[activePlanet];

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(config.ATMOSPHERE);
    scene.fog = new THREE.FogExp2(config.ATMOSPHERE, config.FOG_DENSITY);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1200);
    const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
    renderer.setSize(width, height); renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.1;
    currentRef.appendChild(renderer.domElement);

    const composer = new EffectComposer(renderer);
    composer.addPass(new RenderPass(scene, camera));
    composer.addPass(new UnrealBloomPass(new THREE.Vector2(width, height), 0.7, 0.3, 0.85));
    composer.addPass(new OutputPass());

    const sunLight = new THREE.DirectionalLight(config.SUN, 4.2);
    sunLight.position.set(120, 70, -110);
    sunLight.castShadow = true; sunLight.shadow.mapSize.width = 2048; sunLight.shadow.mapSize.height = 2048; sunLight.shadow.bias = -0.0002;
    scene.add(sunLight);
    scene.add(new THREE.AmbientLight(config.AMBIENT, 0.5));

    const domElement = renderer.domElement;
    const handleWheel = (event) => { event.preventDefault(); targetZoomRef.current = Math.min(Math.max(targetZoomRef.current + event.deltaY * 0.0015, 0.2), 3.0); };
    domElement.addEventListener('wheel', handleWheel, { passive: false });
    const handleContextMenu = (e) => e.preventDefault(); domElement.addEventListener('contextmenu', handleContextMenu);

    const handlePointerDown = (event) => {
      isDraggingRef.current = false; dragButtonRef.current = event.button; previousMousePosRef.current = { x: event.clientX, y: event.clientY };
      const onPointerMove = (moveEvent) => {
        const deltaX = moveEvent.clientX - previousMousePosRef.current.x; const deltaY = moveEvent.clientY - previousMousePosRef.current.y;
        if (Math.abs(deltaX) > 2 || Math.abs(deltaY) > 2) isDraggingRef.current = true;
        if (dragButtonRef.current === 2 || moveEvent.shiftKey) {
          const panSpeed = 0.05 * currentZoomRef.current; const { azimuth } = cameraAnglesRef.current;
          const sideVector = new THREE.Vector3(Math.cos(azimuth), 0, -Math.sin(azimuth)); const forwardVector = new THREE.Vector3(Math.sin(azimuth), 0, Math.cos(azimuth));
          panOffsetRef.current.addScaledVector(sideVector, -deltaX * panSpeed); panOffsetRef.current.addScaledVector(forwardVector, deltaY * panSpeed);
        } else {
          cameraAnglesRef.current.azimuth -= deltaX * 0.006; cameraAnglesRef.current.polar = Math.max(0.05, Math.min(Math.PI / 2 - 0.01, cameraAnglesRef.current.polar - deltaY * 0.006));
        }
        previousMousePosRef.current = { x: moveEvent.clientX, y: moveEvent.clientY };
      };
      const onPointerUp = (upEvent) => {
        domElement.removeEventListener('pointermove', onPointerMove); domElement.removeEventListener('pointerup', onPointerUp);
        if (!isDraggingRef.current && upEvent.button === 0) { const rect = domElement.getBoundingClientRect(); const mouse = new THREE.Vector2(((upEvent.clientX - rect.left) / rect.width) * 2 - 1, -((upEvent.clientY - rect.top) / rect.height) * 2 + 1); const raycaster = new THREE.Raycaster(); raycaster.setFromCamera(mouse, camera); const intersects = raycaster.intersectObject(terrain); if (intersects.length > 0) updateTarget(intersects[0].point.x, intersects[0].point.z); }
      };
      domElement.addEventListener('pointermove', onPointerMove); domElement.addEventListener('pointerup', onPointerUp);
    }; domElement.addEventListener('pointerdown', handlePointerDown);

    // Dynamic Texture Selection
    const surfaceTexture = activePlanet === 'MARS' ? createMarsTexture() : createMoonTexture();
    const terrainGeo = new THREE.PlaneGeometry(130, 130, 240, 240); terrainGeo.rotateX(-Math.PI / 2);
    const pos = terrainGeo.attributes.position; for (let i = 0; i < pos.count; i++) { let x = pos.getX(i); let z = pos.getZ(i); pos.setY(i, getTerrainHeight(x, z)); } terrainGeo.computeVertexNormals();
    
    const terrainMat = new THREE.MeshStandardMaterial({
      map: surfaceTexture,
      bumpMap: surfaceTexture,
      bumpScale: config.BUMP_SCALE,
      color: config.GROUND,
      roughness: 0.9,
      metalness: 0.05
    });
    const terrain = new THREE.Mesh(terrainGeo, terrainMat); terrain.receiveShadow = true; terrain.castShadow = true; scene.add(terrain);

    const rockMat = new THREE.MeshStandardMaterial({ color: config.ROCKS, roughness: 0.9, metalness: 0.1 });
    const rockScatterGeo = new THREE.DodecahedronGeometry(1, 1); const instancedRocks = new THREE.InstancedMesh(rockScatterGeo, rockMat, 300);
    const dummy = new THREE.Object3D();
    for (let i = 0; i < 300; i++) { let rx = (Math.random() - 0.5) * 110; let rz = (Math.random() - 0.5) * 110; let scale = 0.3 + Math.random() * 0.8; let ry = getTerrainHeight(rx, rz); dummy.position.set(rx, ry + scale * 0.1, rz); dummy.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI); dummy.scale.set(scale, scale * (0.6 + Math.random() * 0.4), scale); dummy.updateMatrix(); instancedRocks.setMatrixAt(i, dummy.matrix); } instancedRocks.castShadow = true; instancedRocks.receiveShadow = true; scene.add(instancedRocks);

    const targetGroup = new THREE.Group();
    const beamGeo = new THREE.CylinderGeometry(0.1, 2.0, 20, 16, 1, true);
    const beamMat = new THREE.MeshBasicMaterial({ color: config.TARGET, transparent: true, opacity: 0.65, side: THREE.DoubleSide });
    const beamMesh = new THREE.Mesh(beamGeo, beamMat); beamMesh.position.y = 10; targetGroup.add(beamMesh);
    const ringGeo = new THREE.RingGeometry(0.6, 2.2, 32); ringGeo.rotateX(-Math.PI / 2);
    const ringMat = new THREE.MeshBasicMaterial({ color: config.TARGET, side: THREE.DoubleSide, transparent: true, opacity: 0.95 });
    const ringMesh = new THREE.Mesh(ringGeo, ringMat); ringMesh.position.y = 0.05; targetGroup.add(ringMesh);
    scene.add(targetGroup);

    // Rover Model
    const roverGroup = new THREE.Group(); const roverBody = new THREE.Group(); roverGroup.add(roverBody);
    const darkMetalMat = new THREE.MeshStandardMaterial({ color: 0x1a1a1a, metalness: 0.9, roughness: 0.2 });
    const goldFoilMat = new THREE.MeshStandardMaterial({ color: 0xdfa010, metalness: 0.85, roughness: 0.25 });
    const chassisMesh = new THREE.Mesh(new THREE.BoxGeometry(2.0, 0.7, 3.2), goldFoilMat); chassisMesh.position.y = 0.5; chassisMesh.castShadow = true; roverBody.add(chassisMesh);
    const solarMesh = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.04, 3.4), darkMetalMat); solarMesh.position.set(0, 0.88, 0); solarMesh.castShadow = true; roverBody.add(solarMesh);
    const mastMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 1.2), darkMetalMat); mastMesh.position.set(0.6, 1.4, 0.8); roverBody.add(mastMesh);
    const headMesh = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.3, 0.3), darkMetalMat); headMesh.position.set(0.6, 2.0, 0.8); roverBody.add(headMesh);

    const wheelGeo = new THREE.CylinderGeometry(0.42, 0.42, 0.35, 24); wheelGeo.rotateZ(Math.PI / 2); const wheelMat = new THREE.MeshStandardMaterial({ color: 0x222222, roughness: 0.6, metalness: 0.7 });
    const wheelPivots = []; const wheelMeshes = [];
    const wheelPositions = [{ x: -1.3, y: 0.42, z: 1.2, isSteering: true }, { x: 1.3, y: 0.42, z: 1.2, isSteering: true }, { x: -1.3, y: 0.42, z: 0.0, isSteering: false }, { x: 1.3, y: 0.42, z: 0.0, isSteering: false }, { x: -1.3, y: 0.42, z: -1.2, isSteering: true }, { x: 1.3, y: 0.42, z: -1.2, isSteering: true }];
    wheelPositions.forEach(pos => { const pivot = new THREE.Group(); pivot.position.set(pos.x, pos.y, pos.z); const w = new THREE.Mesh(wheelGeo, wheelMat); w.castShadow = true; pivot.add(w); roverBody.add(pivot); wheelPivots.push({ pivot, isSteering: pos.isSteering }); wheelMeshes.push(w); });
    roverGroup.position.copy(roverPosRef.current); scene.add(roverGroup);

    pathWaypointsRef.current = findAStarPath(roverPosRef.current, targetPosRef.current, OBSTACLES);
    let currentHeading = new THREE.Vector3(0, 0, -1); const moveSpeed = 0.11;

    const animate = () => {
      requestAnimationFrame(animate);
      targetPosRef.current.y = getTerrainHeight(targetPosRef.current.x, targetPosRef.current.z);
      targetGroup.position.copy(targetPosRef.current); beamMesh.rotation.y += 0.015;

      const currentRoverPos = roverGroup.position;
      const waypoints = pathWaypointsRef.current;

      if (waypoints && waypoints.length > 0) {
        let nextPoint = waypoints[0];
        let distToNext = currentRoverPos.distanceTo(nextPoint);
        if (distToNext < 1.3) waypoints.shift();
        if (waypoints.length > 0) {
          nextPoint = waypoints[0];
          let desiredDir = new THREE.Vector3().subVectors(nextPoint, currentRoverPos); desiredDir.y = 0;
          if (desiredDir.lengthSq() > 0.0001) {
            desiredDir.normalize();
            currentHeading.lerp(desiredDir, 0.08).normalize();
            currentRoverPos.x += currentHeading.x * moveSpeed; currentRoverPos.z += currentHeading.z * moveSpeed;
          }
          currentRoverPos.y = getTerrainHeight(currentRoverPos.x, currentRoverPos.z);
          const groundNormal = getTerrainNormal(currentRoverPos.x, currentRoverPos.z); const forward = currentHeading.clone(); const right = new THREE.Vector3().crossVectors(groundNormal, forward).normalize(); const correctedForward = new THREE.Vector3().crossVectors(right, groundNormal).normalize();
          roverGroup.quaternion.slerp(new THREE.Quaternion().setFromRotationMatrix(new THREE.Matrix4().makeBasis(right, groundNormal, correctedForward)), 0.12);
          const angleDiff = THREE.MathUtils.clamp(new THREE.Vector3().crossVectors(currentHeading, desiredDir).y * 3.0, -0.5, 0.5); wheelPivots.forEach(item => { if (item.isSteering) item.pivot.rotation.y = THREE.MathUtils.lerp(item.pivot.rotation.y, angleDiff, 0.15); });
          wheelMeshes.forEach(w => { w.rotation.x += moveSpeed * 1.8; });
          roverPosRef.current.copy(currentRoverPos);

          setTelemetry({
            status: 'ASTAR_NAV',
            coords: `X:${currentRoverPos.x.toFixed(1)} Y:${currentRoverPos.y.toFixed(1)} Z:${currentRoverPos.z.toFixed(1)}`,
            targetCoords: `X:${targetPosRef.current.x.toFixed(1)} Z:${targetPosRef.current.z.toFixed(1)}`,
            speed: `${(moveSpeed * 15).toFixed(1)}m/s`,
            distToTarget: `${currentRoverPos.distanceTo(targetPosRef.current).toFixed(1)}m`
          });
        }
      }

      currentZoomRef.current += (targetZoomRef.current - currentZoomRef.current) * 0.18;
      const distance = 16 * currentZoomRef.current; const { azimuth, polar } = cameraAnglesRef.current;
      const focusPoint = currentRoverPos.clone().add(panOffsetRef.current);
      camera.position.set(focusPoint.x + distance * Math.sin(polar) * Math.sin(azimuth), focusPoint.y + distance * Math.cos(polar), focusPoint.z + distance * Math.sin(polar) * Math.cos(azimuth));
      camera.lookAt(focusPoint);
      composer.render();
    }; animate();

    const handleResize = () => { camera.aspect = currentRef.clientWidth / currentRef.clientHeight; camera.updateProjectionMatrix(); renderer.setSize(currentRef.clientWidth, currentRef.clientHeight); composer.setSize(currentRef.clientWidth, currentRef.clientHeight); }; window.addEventListener('resize', handleResize);
    return () => { window.removeEventListener('resize', handleResize); domElement.removeEventListener('contextmenu', handleContextMenu); domElement.removeEventListener('pointerdown', handlePointerDown); domElement.removeEventListener('wheel', handleWheel); if (currentRef.contains(renderer.domElement)) currentRef.removeChild(renderer.domElement); };
  }, [activePlanet]);

  return (
    <div className="simulation-wrapper">
      <div className="canvas-container" ref={mountRef} />
      <div className="cyber-sidebar">
        <div className="cyber-box">
          <div className="planet-selector" style={{ display: 'flex', gap: '8px', marginBottom: '10px' }}>
            <button className={`cyber-btn ${activePlanet === 'MARS' ? 'active' : ''}`} onClick={() => setActivePlanet('MARS')} style={{ flex: 1 }}>MARS</button>
            <button className={`cyber-btn ${activePlanet === 'MOON' ? 'active' : ''}`} onClick={() => setActivePlanet('MOON')} style={{ flex: 1 }}>MOON</button>
          </div>
          <div className="box-title"><span className="blink-tag">&gt;_</span> WAYPOINT_SET</div>
          <form onSubmit={(e) => { e.preventDefault(); updateTarget(inputX, inputZ); }} className="cyber-form">
            <div className="cyber-input-row">
              <label>X:</label><input type="number" step="0.5" value={inputX} onChange={(e) => setInputX(e.target.value)} />
              <label>Z:</label><input type="number" step="0.5" value={inputZ} onChange={(e) => setInputZ(e.target.value)} />
              <button type="submit" className="cyber-btn">EXEC</button>
            </div>
          </form>
        </div>
        <div className="cyber-box">
          <div className="box-title"><span className="live-dot"></span> TELEMETRY</div>
          <div className="cyber-stat-list">
            <div className="stat-row"><span className="stat-label">STATUS:</span><span className={`status-badge ${telemetry.status}`}>{telemetry.status}</span></div>
            <div className="stat-row"><span className="stat-label">POS:</span><span className="stat-val highlight">{telemetry.coords}</span></div>
            <div className="stat-row"><span className="stat-label">GOAL:</span><span className="stat-val target">{telemetry.targetCoords}</span></div>
            <div className="stat-row"><span className="stat-label">VEL/DIST:</span><span className="stat-val">{telemetry.speed} | {telemetry.distToTarget}</span></div>
          </div>
        </div>
      </div>
    </div>
  );
}