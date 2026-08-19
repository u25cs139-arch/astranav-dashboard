import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass.js';
import './MoonStimulation.css';

const OBSTACLES = [
  { x: 0, z: 0, radius: 8, type: 'CRATER', name: 'CRATER_ALPHA' },
  { x: -18, z: -12, radius: 6, type: 'CRATER', name: 'CRATER_BETA' },
  { x: 25, z: -22, radius: 7.5, type: 'CRATER', name: 'CRATER_EPSILON' },
  { x: -32, z: -28, radius: 6.5, type: 'CRATER', name: 'CRATER_ZETA' },
  { x: 12, z: -35, radius: 6.0, type: 'CRATER', name: 'CRATER_THETA' },
  { x: 18, z: 15, radius: 12, height: 4.5, type: 'HILL', name: 'MOUNT_PROSPECT' },
  { x: -25, z: 20, radius: 10, height: 4.0, type: 'HILL', name: 'WEST_RIDGE_DOME' },
  { x: 35, z: -5, radius: 9, height: 3.5, type: 'HILL', name: 'EAST_HILL' },
  { x: -12, z: 30, radius: 11, height: 4.2, type: 'HILL', name: 'NORTH_PEAK' },
  { x: -10, z: -2, radius: 2.0, type: 'ROCK', name: 'BASALT_ESCARP' },
  { x: 20, z: -5, radius: 2.2, type: 'ROCK', name: 'RIDGE_ROCK' }
];

function getTerrainHeight(x, z) {
  let heightVal =
    Math.sin(x * 0.06) * Math.cos(z * 0.06) * 1.8 +
    Math.sin(x * 0.2) * Math.sin(z * 0.18) * 0.5;

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

function createHighResLunarMaps() {
  const canvas = document.createElement('canvas');
  canvas.width = 2048;
  canvas.height = 2048;
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = '#666666';
  ctx.fillRect(0, 0, 2048, 2048);

  const imgData = ctx.getImageData(0, 0, 2048, 2048);
  const data = imgData.data;
  for (let i = 0; i < data.length; i += 4) {
    const val = 100 + Math.floor(Math.random() * 90);
    data[i] = val;
    data[i + 1] = val;
    data[i + 2] = val;
  }
  ctx.putImageData(imgData, 0, 0);

  for (let i = 0; i < 40000; i++) {
    const x = Math.random() * 2048;
    const y = Math.random() * 2048;
    const r = Math.random() * 2.5;
    ctx.fillStyle = Math.random() > 0.5 ? '#111111' : '#ffffff';
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(24, 24);
  return texture;
}

// 🌍 Procedural Earth Texture Creator
function createEarthTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');

  // Deep Blue Oceans
  ctx.fillStyle = '#0a2342';
  ctx.fillRect(0, 0, 1024, 512);

  // Continents (Green/Brown Shapes)
  ctx.fillStyle = '#2d5a27';
  
  const drawContinent = (cx, cy, r) => {
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fill();
  };

  // North/South America
  drawContinent(250, 180, 90);
  drawContinent(320, 320, 80);
  // Europe & Africa
  drawContinent(520, 160, 70);
  drawContinent(540, 280, 100);
  // Asia & Australia
  drawContinent(720, 160, 130);
  drawContinent(820, 340, 60);

  // Clouds Layer
  ctx.fillStyle = 'rgba(255, 255, 255, 0.55)';
  for (let i = 0; i < 40; i++) {
    const x = Math.random() * 1024;
    const y = Math.random() * 512;
    const rx = 40 + Math.random() * 80;
    const ry = 15 + Math.random() * 30;
    ctx.beginPath();
    ctx.ellipse(x, y, rx, ry, Math.random() * Math.PI, 0, Math.PI * 2);
    ctx.fill();
  }

  return new THREE.CanvasTexture(canvas);
}

function findAStarPath(startWorld, targetWorld, obstacles) {
  const GRID_SIZE = 120;
  const MAP_MIN = -60;
  const MAP_MAX = 60;
  const CELL_SIZE = (MAP_MAX - MAP_MIN) / GRID_SIZE;

  const toGrid = (val) => Math.max(0, Math.min(GRID_SIZE - 1, Math.floor((val - MAP_MIN) / CELL_SIZE)));
  const toWorld = (idx) => MAP_MIN + (idx + 0.5) * CELL_SIZE;

  const startG = { x: toGrid(startWorld.x), z: toGrid(startWorld.z) };
  const targetG = { x: toGrid(targetWorld.x), z: toGrid(targetWorld.z) };

  const grid = Array.from({ length: GRID_SIZE }, () => new Array(GRID_SIZE).fill(false));
  for (let r = 0; r < GRID_SIZE; r++) {
    for (let c = 0; c < GRID_SIZE; c++) {
      const wx = toWorld(c);
      const wz = toWorld(r);
      for (let obs of obstacles) {
        if (Math.hypot(wx - obs.x, wz - obs.z) < obs.radius + 2.2) {
          grid[r][c] = true;
          break;
        }
      }
    }
  }

  const openSet = [];
  const closedSet = new Set();
  const nodeMap = new Map();

  const key = (x, z) => `${x},${z}`;
  const heuristic = (x1, z1, x2, z2) => Math.hypot(x1 - x2, z1 - z2);

  const startNode = {
    x: startG.x, z: startG.z,
    g: 0,
    h: heuristic(startG.x, startG.z, targetG.x, targetG.z),
    parent: null
  };
  startNode.f = startNode.g + startNode.h;

  openSet.push(startNode);
  nodeMap.set(key(startG.x, startG.z), startNode);

  let foundNode = null;
  let closestNode = startNode;

  while (openSet.length > 0) {
    openSet.sort((a, b) => a.f - b.f);
    const current = openSet.shift();

    if (current.h < closestNode.h) closestNode = current;

    if (current.x === targetG.x && current.z === targetG.z) {
      foundNode = current;
      break;
    }

    closedSet.add(key(current.x, current.z));

    const neighbors = [
      { x: 0, z: -1, cost: 1 }, { x: 0, z: 1, cost: 1 },
      { x: -1, z: 0, cost: 1 }, { x: 1, z: 0, cost: 1 },
      { x: -1, z: -1, cost: 1.414 }, { x: 1, z: -1, cost: 1.414 },
      { x: -1, z: 1, cost: 1.414 }, { x: 1, z: 1, cost: 1.414 }
    ];

    for (let n of neighbors) {
      const nx = current.x + n.x;
      const nz = current.z + n.z;

      if (nx < 0 || nx >= GRID_SIZE || nz < 0 || nz >= GRID_SIZE) continue;
      if (grid[nz][nx] || closedSet.has(key(nx, nz))) continue;

      const gScore = current.g + n.cost;
      const neighborKey = key(nx, nz);
      let neighborNode = nodeMap.get(neighborKey);

      if (!neighborNode) {
        neighborNode = {
          x: nx, z: nz,
          g: gScore,
          h: heuristic(nx, nz, targetG.x, targetG.z),
          parent: current
        };
        neighborNode.f = neighborNode.g + neighborNode.h;
        nodeMap.set(neighborKey, neighborNode);
        openSet.push(neighborNode);
      } else if (gScore < neighborNode.g) {
        neighborNode.g = gScore;
        neighborNode.f = neighborNode.g + neighborNode.h;
        neighborNode.parent = current;
      }
    }
  }

  const finalTarget = foundNode || closestNode;
  const path = [];
  let curr = finalTarget;
  while (curr) {
    const wx = toWorld(curr.x);
    const wz = toWorld(curr.z);
    path.push(new THREE.Vector3(wx, getTerrainHeight(wx, wz) + 0.4, wz));
    curr = curr.parent;
  }
  path.reverse();

  if (path.length > 1) path.shift();
  path.push(new THREE.Vector3(targetWorld.x, getTerrainHeight(targetWorld.x, targetWorld.z) + 0.4, targetWorld.z));

  return path;
}

export default function RoverSimulation() {
  const mountRef = useRef(null);
  const targetPosRef = useRef(new THREE.Vector3(-24, getTerrainHeight(-24, -26) + 0.4, -26));
  const roverPosRef = useRef(new THREE.Vector3(0, getTerrainHeight(0, 28) + 0.4, 28));
  const pathWaypointsRef = useRef([]);

  const targetZoomRef = useRef(1.0);
  const currentZoomRef = useRef(1.0);
  const cameraAnglesRef = useRef({ azimuth: 0.5, polar: 1.1 });
  const panOffsetRef = useRef(new THREE.Vector3(0, 0, 0));

  const isDraggingRef = useRef(false);
  const dragButtonRef = useRef(0);
  const previousMousePosRef = useRef({ x: 0, y: 0 });

  const [inputX, setInputX] = useState('-24.0');
  const [inputZ, setInputZ] = useState('-26.0');

  const [telemetry, setTelemetry] = useState({
    status: 'ASTAR_NAV',
    coords: 'X: 0.0 | Y: 0.4 | Z: 28.0',
    targetCoords: 'X: -24.0 | Z: -26.0',
    speed: '1.2 m/s',
    distToTarget: '63.0m'
  });

  const updateTarget = (xVal, zVal) => {
    const x = parseFloat(xVal);
    const z = parseFloat(zVal);

    if (!isNaN(x) && !isNaN(z)) {
      const clampedX = Math.max(-50, Math.min(50, x));
      const clampedZ = Math.max(-50, Math.min(50, z));

      targetPosRef.current.set(clampedX, getTerrainHeight(clampedX, clampedZ) + 0.4, clampedZ);
      setInputX(clampedX.toFixed(1));
      setInputZ(clampedZ.toFixed(1));

      pathWaypointsRef.current = findAStarPath(roverPosRef.current, targetPosRef.current, OBSTACLES);
    }
  };

  useEffect(() => {
    const currentRef = mountRef.current;
    const width = currentRef.clientWidth;
    const height = currentRef.clientHeight;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000000); // Deep Pitch Black Space
    scene.fog = new THREE.FogExp2(0x000000, 0.003);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1200);
    const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.3;
    currentRef.appendChild(renderer.domElement);

    const composer = new EffectComposer(renderer);
    composer.addPass(new RenderPass(scene, camera));
    composer.addPass(new UnrealBloomPass(new THREE.Vector2(width, height), 0.7, 0.3, 0.8));
    composer.addPass(new OutputPass());

    // --- 🌌 1. STARFIELD SYSTEM (Taare) ---
    const starCount = 4500;
    const starGeo = new THREE.BufferGeometry();
    const starPos = new Float32Array(starCount * 3);

    for (let i = 0; i < starCount * 3; i += 3) {
      const radius = 600 + Math.random() * 200;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos((Math.random() * 2) - 1);

      starPos[i] = radius * Math.sin(phi) * Math.cos(theta);
      starPos[i + 1] = Math.abs(radius * Math.cos(phi)) + 10; // Keep above horizon
      starPos[i + 2] = radius * Math.sin(phi) * Math.sin(theta);
    }

    starGeo.setAttribute('position', new THREE.BufferAttribute(starPos, 3));
    const starMat = new THREE.PointsMaterial({
      color: 0xffffff,
      size: 1.3,
      transparent: true,
      opacity: 0.85
    });
    const starField = new THREE.Points(starGeo, starMat);
    scene.add(starField);

    // --- 🌍 2. PLANET EARTH IN SKY ---
    const earthGeo = new THREE.SphereGeometry(18, 64, 64);
    const earthMat = new THREE.MeshStandardMaterial({
      map: createEarthTexture(),
      roughness: 0.7,
      metalness: 0.1
    });
    const earthMesh = new THREE.Mesh(earthGeo, earthMat);
    earthMesh.position.set(-220, 110, -280);
    earthMesh.rotation.z = 0.4;
    scene.add(earthMesh);

    // --- ☀️ 3. SUN SPHERE ---
    const sunLight = new THREE.DirectionalLight(0xfff8ee, 5.5);
    sunLight.position.set(120, 70, -150);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 2048;
    sunLight.shadow.mapSize.height = 2048;
    sunLight.shadow.bias = -0.0002;
    scene.add(sunLight);

    const sunGeo = new THREE.SphereGeometry(12, 32, 32);
    const sunMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const sunMesh = new THREE.Mesh(sunGeo, sunMat);
    sunMesh.position.copy(sunLight.position).multiplyScalar(2.5);
    scene.add(sunMesh);

    scene.add(new THREE.AmbientLight(0x1a2235, 0.45)); // Soft blue space ambient reflect

    const domElement = renderer.domElement;
    const handleWheel = (event) => {
      event.preventDefault();
      targetZoomRef.current = Math.min(Math.max(targetZoomRef.current + event.deltaY * 0.0015, 0.2), 3.0);
    };
    domElement.addEventListener('wheel', handleWheel, { passive: false });

    const handleContextMenu = (e) => e.preventDefault();
    domElement.addEventListener('contextmenu', handleContextMenu);

    const handlePointerDown = (event) => {
      isDraggingRef.current = false;
      dragButtonRef.current = event.button;
      previousMousePosRef.current = { x: event.clientX, y: event.clientY };

      const onPointerMove = (moveEvent) => {
        const deltaX = moveEvent.clientX - previousMousePosRef.current.x;
        const deltaY = moveEvent.clientY - previousMousePosRef.current.y;

        if (Math.abs(deltaX) > 2 || Math.abs(deltaY) > 2) isDraggingRef.current = true;

        if (dragButtonRef.current === 2 || moveEvent.shiftKey) {
          const panSpeed = 0.05 * currentZoomRef.current;
          const { azimuth } = cameraAnglesRef.current;
          const sideVector = new THREE.Vector3(Math.cos(azimuth), 0, -Math.sin(azimuth));
          const forwardVector = new THREE.Vector3(Math.sin(azimuth), 0, Math.cos(azimuth));

          panOffsetRef.current.addScaledVector(sideVector, -deltaX * panSpeed);
          panOffsetRef.current.addScaledVector(forwardVector, deltaY * panSpeed);
        } else {
          cameraAnglesRef.current.azimuth -= deltaX * 0.006;
          cameraAnglesRef.current.polar = Math.max(0.05, Math.min(Math.PI / 2 - 0.01, cameraAnglesRef.current.polar - deltaY * 0.006));
        }

        previousMousePosRef.current = { x: moveEvent.clientX, y: moveEvent.clientY };
      };

      const onPointerUp = (upEvent) => {
        domElement.removeEventListener('pointermove', onPointerMove);
        domElement.removeEventListener('pointerup', onPointerUp);

        if (!isDraggingRef.current && upEvent.button === 0) {
          const rect = domElement.getBoundingClientRect();
          const mouse = new THREE.Vector2(
            ((upEvent.clientX - rect.left) / rect.width) * 2 - 1,
            -((upEvent.clientY - rect.top) / rect.height) * 2 + 1
          );
          const raycaster = new THREE.Raycaster();
          raycaster.setFromCamera(mouse, camera);
          const intersects = raycaster.intersectObject(terrain);
          if (intersects.length > 0) {
            updateTarget(intersects[0].point.x, intersects[0].point.z);
          }
        }
      };

      domElement.addEventListener('pointermove', onPointerMove);
      domElement.addEventListener('pointerup', onPointerUp);
    };
    domElement.addEventListener('pointerdown', handlePointerDown);

    // Terrain
    const regolithTexture = createHighResLunarMaps();
    const terrainGeo = new THREE.PlaneGeometry(130, 130, 250, 250);
    terrainGeo.rotateX(-Math.PI / 2);
    const pos = terrainGeo.attributes.position;

    for (let i = 0; i < pos.count; i++) {
      let x = pos.getX(i);
      let z = pos.getZ(i);
      pos.setY(i, getTerrainHeight(x, z));
    }
    terrainGeo.computeVertexNormals();

    const terrainMat = new THREE.MeshStandardMaterial({
      map: regolithTexture,
      bumpMap: regolithTexture,
      bumpScale: 0.35,
      roughness: 0.85,
      metalness: 0.15,
      color: 0x777777
    });
    const terrain = new THREE.Mesh(terrainGeo, terrainMat);
    terrain.receiveShadow = true;
    terrain.castShadow = true;
    scene.add(terrain);

    // Rocks Scatter
    const boulderMat = new THREE.MeshStandardMaterial({
      color: 0x555555,
      bumpMap: regolithTexture,
      bumpScale: 0.4,
      roughness: 0.9,
      metalness: 0.1
    });

    const rockScatterGeo = new THREE.DodecahedronGeometry(1, 2);
    const instancedRocks = new THREE.InstancedMesh(rockScatterGeo, boulderMat, 350);
    const dummy = new THREE.Object3D();

    for (let i = 0; i < 350; i++) {
      let rx = (Math.random() - 0.5) * 115;
      let rz = (Math.random() - 0.5) * 115;
      let scale = 0.25 + Math.random() * 0.85;
      let ry = getTerrainHeight(rx, rz);

      dummy.position.set(rx, ry + scale * 0.1, rz);
      dummy.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);
      dummy.scale.set(scale, scale * (0.6 + Math.random() * 0.4), scale);
      dummy.updateMatrix();

      instancedRocks.setMatrixAt(i, dummy.matrix);
    }
    instancedRocks.castShadow = true;
    instancedRocks.receiveShadow = true;
    scene.add(instancedRocks);

    // Target Beam
    const targetGroup = new THREE.Group();
    const beamGeo = new THREE.CylinderGeometry(0.1, 2.2, 22, 16, 1, true);
    const beamMat = new THREE.MeshBasicMaterial({ color: 0x00ff88, transparent: true, opacity: 0.5, side: THREE.DoubleSide });
    const beamMesh = new THREE.Mesh(beamGeo, beamMat);
    beamMesh.position.y = 11;
    targetGroup.add(beamMesh);

    const ringGeo = new THREE.RingGeometry(0.5, 2.5, 32);
    ringGeo.rotateX(-Math.PI / 2);
    const ringMat = new THREE.MeshBasicMaterial({ color: 0x00ff88, side: THREE.DoubleSide, transparent: true, opacity: 0.9 });
    const ringMesh = new THREE.Mesh(ringGeo, ringMat);
    ringMesh.position.y = 0.05;
    targetGroup.add(ringMesh);
    scene.add(targetGroup);

    // Path Line
    const pathLineMat = new THREE.LineBasicMaterial({ color: 0x00ffaa, linewidth: 3 });
    const pathLine = new THREE.Line(new THREE.BufferGeometry(), pathLineMat);
    scene.add(pathLine);

    // Rover Vehicle Model
    const roverGroup = new THREE.Group();
    const roverBody = new THREE.Group();
    roverGroup.add(roverBody);

    const darkMetalMat = new THREE.MeshStandardMaterial({ color: 0x111111, metalness: 0.95, roughness: 0.2 });
    const goldFoilMat = new THREE.MeshStandardMaterial({ color: 0xe5ba33, metalness: 0.9, roughness: 0.25 });
    const emissiveMat = new THREE.MeshBasicMaterial({ color: 0x00ff88 });

    const chassisMesh = new THREE.Mesh(new THREE.BoxGeometry(2.0, 0.7, 3.2), goldFoilMat);
    chassisMesh.position.y = 0.5;
    chassisMesh.castShadow = true;
    roverBody.add(chassisMesh);

    const solarMesh = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.04, 3.4), darkMetalMat);
    solarMesh.position.set(0, 0.88, 0);
    solarMesh.castShadow = true;
    roverBody.add(solarMesh);

    const frontHeadlight = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.2, 0.3), emissiveMat);
    frontHeadlight.position.set(0, 0.7, 1.6);
    roverBody.add(frontHeadlight);

    const wheelGeo = new THREE.CylinderGeometry(0.42, 0.42, 0.35, 24);
    wheelGeo.rotateZ(Math.PI / 2);
    const wheelMat = new THREE.MeshStandardMaterial({ color: 0x222222, roughness: 0.5, metalness: 0.8 });

    const wheelPivots = [];
    const wheelMeshes = [];

    const wheelPositions = [
      { x: -1.3, y: 0.42, z: 1.2, isSteering: true },
      { x: 1.3, y: 0.42, z: 1.2, isSteering: true },
      { x: -1.3, y: 0.42, z: 0.0, isSteering: false },
      { x: 1.3, y: 0.42, z: 0.0, isSteering: false },
      { x: -1.3, y: 0.42, z: -1.2, isSteering: true },
      { x: 1.3, y: 0.42, z: -1.2, isSteering: true }
    ];

    wheelPositions.forEach(pos => {
      const pivot = new THREE.Group();
      pivot.position.set(pos.x, pos.y, pos.z);

      const w = new THREE.Mesh(wheelGeo, wheelMat);
      w.castShadow = true;
      pivot.add(w);

      roverBody.add(pivot);
      wheelPivots.push({ pivot, isSteering: pos.isSteering });
      wheelMeshes.push(w);
    });

    roverGroup.position.copy(roverPosRef.current);
    scene.add(roverGroup);

    pathWaypointsRef.current = findAStarPath(roverPosRef.current, targetPosRef.current, OBSTACLES);

    let currentHeading = new THREE.Vector3(0, 0, -1);
    const moveSpeed = 0.11;

    const animate = () => {
      requestAnimationFrame(animate);

      // Earth rotation animation in space
      earthMesh.rotation.y += 0.0005;

      targetPosRef.current.y = getTerrainHeight(targetPosRef.current.x, targetPosRef.current.z);
      targetGroup.position.copy(targetPosRef.current);
      beamMesh.rotation.y += 0.015;

      const currentRoverPos = roverGroup.position;
      const waypoints = pathWaypointsRef.current;

      if (waypoints && waypoints.length > 0) {
        let nextPoint = waypoints[0];
        let distToNext = currentRoverPos.distanceTo(nextPoint);

        if (distToNext < 1.1 && waypoints.length > 1) {
          waypoints.shift();
          nextPoint = waypoints[0];
        }

        let desiredDir = new THREE.Vector3().subVectors(nextPoint, currentRoverPos);
        desiredDir.y = 0;
        if (desiredDir.lengthSq() > 0.0001) {
          desiredDir.normalize();
        } else {
          desiredDir.copy(currentHeading);
        }

        currentHeading.lerp(desiredDir, 0.1).normalize();

        currentRoverPos.x += currentHeading.x * moveSpeed;
        currentRoverPos.z += currentHeading.z * moveSpeed;

        const groundY = getTerrainHeight(currentRoverPos.x, currentRoverPos.z);
        currentRoverPos.y = groundY;

        const groundNormal = getTerrainNormal(currentRoverPos.x, currentRoverPos.z);

        const forward = currentHeading.clone();
        const up = groundNormal.clone();
        const right = new THREE.Vector3().crossVectors(up, forward).normalize();
        const correctedForward = new THREE.Vector3().crossVectors(right, up).normalize();

        const rotationMatrix = new THREE.Matrix4().makeBasis(right, up, correctedForward);
        const targetQuaternion = new THREE.Quaternion().setFromRotationMatrix(rotationMatrix);

        roverGroup.quaternion.slerp(targetQuaternion, 0.12);

        const angleDiff = THREE.MathUtils.clamp(
          new THREE.Vector3().crossVectors(currentHeading, desiredDir).y * 3.0,
          -0.5,
          0.5
        );

        wheelPivots.forEach(item => {
          if (item.isSteering) {
            item.pivot.rotation.y = THREE.MathUtils.lerp(item.pivot.rotation.y, angleDiff, 0.15);
          }
        });

        wheelMeshes.forEach(w => {
          w.rotation.x += moveSpeed * 1.8;
        });

        roverPosRef.current.copy(currentRoverPos);

        const linePoints = [currentRoverPos.clone(), ...waypoints];
        pathLine.geometry.dispose();
        pathLine.geometry = new THREE.BufferGeometry().setFromPoints(linePoints);

        const totalDistToGoal = currentRoverPos.distanceTo(targetPosRef.current);

        setTelemetry({
          status: 'ASTAR_NAV',
          coords: `X:${currentRoverPos.x.toFixed(1)} Y:${currentRoverPos.y.toFixed(1)} Z:${currentRoverPos.z.toFixed(1)}`,
          targetCoords: `X:${targetPosRef.current.x.toFixed(1)} Z:${targetPosRef.current.z.toFixed(1)}`,
          speed: `${(moveSpeed * 15).toFixed(1)}m/s`,
          distToTarget: `${totalDistToGoal.toFixed(1)}m`
        });
      }

      currentZoomRef.current += (targetZoomRef.current - currentZoomRef.current) * 0.18;
      const distance = 16 * currentZoomRef.current;
      const { azimuth, polar } = cameraAnglesRef.current;
      const focusPoint = currentRoverPos.clone().add(panOffsetRef.current);

      camera.position.set(
        focusPoint.x + distance * Math.sin(polar) * Math.sin(azimuth),
        focusPoint.y + distance * Math.cos(polar),
        focusPoint.z + distance * Math.sin(polar) * Math.cos(azimuth)
      );
      camera.lookAt(focusPoint);

      composer.render();
    };

    animate();

    const handleResize = () => {
      camera.aspect = currentRef.clientWidth / currentRef.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(currentRef.clientWidth, currentRef.clientHeight);
      composer.setSize(currentRef.clientWidth, currentRef.clientHeight);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      domElement.removeEventListener('contextmenu', handleContextMenu);
      domElement.removeEventListener('pointerdown', handlePointerDown);
      domElement.removeEventListener('wheel', handleWheel);
      if (currentRef.contains(renderer.domElement)) currentRef.removeChild(renderer.domElement);
    };
  }, []);

  return (
    <div className="simulation-wrapper">
      <div className="canvas-container" ref={mountRef} />

      <div className="hasselblad-overlay">
        <div className="cross cross-center">+</div>
        <div className="cross cross-tl">+</div>
        <div className="cross cross-tr">+</div>
        <div className="cross cross-bl">+</div>
        <div className="cross cross-br">+</div>
      </div>

      <div className="cyber-sidebar">
        <div className="cyber-box">
          <div className="box-title"><span className="blink-tag">&gt;_</span> WAYPOINT_SET</div>
          <form onSubmit={(e) => { e.preventDefault(); updateTarget(inputX, inputZ); }} className="cyber-form">
            <div className="cyber-input-row">
              <label>X:</label>
              <input type="number" step="0.5" value={inputX} onChange={(e) => setInputX(e.target.value)} />
              <label>Z:</label>
              <input type="number" step="0.5" value={inputZ} onChange={(e) => setInputZ(e.target.value)} />
              <button type="submit" className="cyber-btn">EXEC</button>
            </div>
          </form>
        </div>

        <div className="cyber-box">
          <div className="box-title"><span className="live-dot"></span> NAV_TELEMETRY</div>
          <div className="cyber-stat-list">
            <div className="stat-row"><span className="stat-label">STATE:</span><span className="status-badge ASTAR_NAV">{telemetry.status}</span></div>
            <div className="stat-row"><span className="stat-label">ROVER_POS:</span><span className="stat-val highlight">{telemetry.coords}</span></div>
            <div className="stat-row"><span className="stat-label">TARGET_POS:</span><span className="stat-val target">{telemetry.targetCoords}</span></div>
            <div className="stat-row"><span className="stat-label">VEL/DIST:</span><span className="stat-val">{telemetry.speed} | {telemetry.distToTarget}</span></div>
          </div>
        </div>
      </div>
    </div>
  );
}