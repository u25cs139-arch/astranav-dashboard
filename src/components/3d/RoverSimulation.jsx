import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import './RoverSimulation.css';

const OBSTACLES = [
  { x: 0, z: 0, radius: 9, type: 'CRATER', name: 'CRATER_ALPHA' },
  { x: -18, z: -12, radius: 6, type: 'CRATER', name: 'CRATER_BETA' },
  { x: 15, z: 12, radius: 5, type: 'CRATER', name: 'CRATER_GAMMA' },
  { x: 0, z: 12, radius: 2.5, type: 'ROCK', name: 'BOULDER_CLUSTER' },
  { x: -10, z: -2, radius: 2.0, type: 'ROCK', name: 'BASALT_ESCARP' }
];

// --- A* SHORTEST PATH FINDER ALGORITHM ---
function findAStarPath(startWorld, targetWorld, obstacles) {
  const GRID_SIZE = 80; 
  const MAP_MIN = -60;
  const MAP_MAX = 60;
  const CELL_SIZE = (MAP_MAX - MAP_MIN) / GRID_SIZE;

  const toGrid = (val) => Math.floor((val - MAP_MIN) / CELL_SIZE);
  const toWorld = (idx) => MAP_MIN + (idx + 0.5) * CELL_SIZE;

  const startG = { 
    x: Math.max(0, Math.min(GRID_SIZE - 1, toGrid(startWorld.x))), 
    z: Math.max(0, Math.min(GRID_SIZE - 1, toGrid(startWorld.z))) 
  };
  const targetG = { 
    x: Math.max(0, Math.min(GRID_SIZE - 1, toGrid(targetWorld.x))), 
    z: Math.max(0, Math.min(GRID_SIZE - 1, toGrid(targetWorld.z))) 
  };

  const grid = Array.from({ length: GRID_SIZE }, () => new Array(GRID_SIZE).fill(false));
  for (let r = 0; r < GRID_SIZE; r++) {
    for (let c = 0; c < GRID_SIZE; c++) {
      const wx = toWorld(c);
      const wz = toWorld(r);
      for (let obs of obstacles) {
        const dist = Math.hypot(wx - obs.x, wz - obs.z);
        if (dist < obs.radius + 2.8) {
          grid[r][c] = true;
          break;
        }
      }
    }
  }

  grid[startG.z][startG.x] = false;
  grid[targetG.z][targetG.x] = false;

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

  while (openSet.length > 0) {
    openSet.sort((a, b) => a.f - b.f);
    const current = openSet.shift();

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

  const path = [];
  let curr = foundNode;
  while (curr) {
    path.push(new THREE.Vector3(toWorld(curr.x), 0.8, toWorld(curr.z)));
    curr = curr.parent;
  }
  path.reverse();

  if (path.length > 0) {
    path[path.length - 1] = targetWorld.clone();
  } else {
    path.push(targetWorld.clone());
  }

  return path;
}

export default function RoverSimulation() {
  const mountRef = useRef(null);
  const targetPosRef = useRef(new THREE.Vector3(-24, 0.8, -26));
  const roverPosRef = useRef(new THREE.Vector3(0, 0.8, 28));
  const pathWaypointsRef = useRef([]);

  const [inputX, setInputX] = useState('-24.0');
  const [inputZ, setInputZ] = useState('-26.0');
  const [isMapOpen, setIsMapOpen] = useState(false);

  const [telemetry, setTelemetry] = useState({
    status: 'ASTAR_OPTIMAL',
    decision: 'A* ALGORITHM // SHORTEST_PATH_ACTIVE',
    coords: 'X: 0.0 | Y: 0.8 | Z: 28.0',
    targetCoords: 'X: -24.0 | Z: -26.0',
    hazardDetected: 'NONE',
    speed: '1.2 m/s',
    distToTarget: '63.0m'
  });

  const updateTarget = (xVal, zVal) => {
    const x = parseFloat(xVal);
    const z = parseFloat(zVal);

    if (!isNaN(x) && !isNaN(z)) {
      const clampedX = Math.max(-50, Math.min(50, x));
      const clampedZ = Math.max(-50, Math.min(50, z));

      targetPosRef.current.set(clampedX, 0.8, clampedZ);
      setInputX(clampedX.toFixed(1));
      setInputZ(clampedZ.toFixed(1));

      // Recalculate A* Shortest Path immediately
      pathWaypointsRef.current = findAStarPath(roverPosRef.current, targetPosRef.current, OBSTACLES);
    }
  };

  const handleSetTarget = (e) => {
    e.preventDefault();
    updateTarget(inputX, inputZ);
  };

  useEffect(() => {
    const currentRef = mountRef.current;
    const width = currentRef.clientWidth;
    const height = currentRef.clientHeight;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x010302);

    const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;
    currentRef.appendChild(renderer.domElement);

    // Stars
    const starsGeo = new THREE.BufferGeometry();
    const starCount = 1200;
    const starPositions = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount * 3; i++) {
      starPositions[i] = (Math.random() - 0.5) * 400;
    }
    starsGeo.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
    scene.add(new THREE.Points(starsGeo, new THREE.PointsMaterial({ color: 0x00ff66, size: 0.6, transparent: true, opacity: 0.6 })));

    // Lights
    scene.add(new THREE.AmbientLight(0x0a1a0f, 0.7));
    const sunLight = new THREE.DirectionalLight(0xe6fffa, 3.2);
    sunLight.position.set(50, 70, -30);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 2048;
    sunLight.shadow.mapSize.height = 2048;
    scene.add(sunLight);

    // Terrain
    const terrainGeo = new THREE.PlaneGeometry(120, 120, 128, 128);
    terrainGeo.rotateX(-Math.PI / 2);
    const pos = terrainGeo.attributes.position;
    const craters = OBSTACLES.filter(o => o.type === 'CRATER');

    for (let i = 0; i < pos.count; i++) {
      let x = pos.getX(i);
      let z = pos.getZ(i);
      let heightVal = Math.sin(x * 0.12) * Math.cos(z * 0.12) * 0.7 + (Math.random() * 0.08);

      craters.forEach(c => {
        let dist = Math.hypot(x - c.x, z - c.z);
        if (dist < c.radius) {
          heightVal -= Math.cos((dist / c.radius) * Math.PI * 0.5) * 3.5;
        } else if (dist < c.radius * 1.35) {
          heightVal += Math.sin(((dist - c.radius) / (c.radius * 0.35)) * Math.PI) * 0.7;
        }
      });
      pos.setY(i, heightVal);
    }
    terrainGeo.computeVertexNormals();
    const terrain = new THREE.Mesh(terrainGeo, new THREE.MeshStandardMaterial({ color: 0x334139, roughness: 0.9, metalness: 0.1 }));
    terrain.receiveShadow = true;
    scene.add(terrain);

    // Rocks
    const rockMat = new THREE.MeshStandardMaterial({ color: 0x1f2923, roughness: 0.95 });
    OBSTACLES.filter(o => o.type === 'ROCK').forEach(r => {
      const rock = new THREE.Mesh(new THREE.DodecahedronGeometry(r.radius, 1), rockMat);
      rock.position.set(r.x, r.radius * 0.5, r.z);
      rock.castShadow = true;
      rock.receiveShadow = true;
      scene.add(rock);
    });

    // Beacon Pin
    const targetMarker = new THREE.Mesh(
      new THREE.CylinderGeometry(0.12, 0.12, 7, 8),
      new THREE.MeshStandardMaterial({ color: 0x00ff66, emissive: 0x00ff66, emissiveIntensity: 0.8 })
    );
    scene.add(targetMarker);

    // Dynamic A* Path Line
    const pathLineMat = new THREE.LineBasicMaterial({ color: 0x00ff66, linewidth: 3 });
    const pathLineGeo = new THREE.BufferGeometry();
    const pathLine = new THREE.Line(pathLineGeo, pathLineMat);
    scene.add(pathLine);

    // Raycaster for 3D Click
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();
    const handlePointerDown = (event) => {
      if (isMapOpen) return;
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObject(terrain);
      if (intersects.length > 0) {
        updateTarget(intersects[0].point.x, intersects[0].point.z);
      }
    };
    renderer.domElement.addEventListener('pointerdown', handlePointerDown);

    // Rover Setup
    const roverGroup = new THREE.Group();
    const chassis = new THREE.Mesh(
      new THREE.BoxGeometry(2.4, 0.9, 3.2),
      new THREE.MeshStandardMaterial({ color: 0x0d2818, metalness: 0.8, roughness: 0.3 })
    );
    chassis.position.y = 1.1;
    chassis.castShadow = true;
    roverGroup.add(chassis);

    const solarPanel = new THREE.Mesh(
      new THREE.BoxGeometry(2.8, 0.05, 3.4),
      new THREE.MeshStandardMaterial({ color: 0x00ff66, metalness: 0.9, roughness: 0.1, emissive: 0x00ff66, emissiveIntensity: 0.2 })
    );
    solarPanel.position.set(0, 1.58, 0);
    solarPanel.castShadow = true;
    roverGroup.add(solarPanel);

    const mast = new THREE.Mesh(
      new THREE.CylinderGeometry(0.08, 0.08, 1.6, 12),
      new THREE.MeshStandardMaterial({ color: 0x224433, metalness: 0.8, roughness: 0.3 })
    );
    mast.position.set(0.7, 2.3, -1.0);
    roverGroup.add(mast);

    const wheelGeo = new THREE.CylinderGeometry(0.45, 0.45, 0.35, 18);
    wheelGeo.rotateZ(Math.PI / 2);
    const wheelMat = new THREE.MeshStandardMaterial({ color: 0x08140c, roughness: 0.8 });
    const wheelMeshes = [];
    [
      { x: -1.5, y: 0.45, z: 1.2 }, { x: 1.5, y: 0.45, z: 1.2 },
      { x: -1.5, y: 0.45, z: 0 },   { x: 1.5, y: 0.45, z: 0 },
      { x: -1.5, y: 0.45, z: -1.2 },{ x: 1.5, y: 0.45, z: -1.2 }
    ].forEach(offset => {
      const wheel = new THREE.Mesh(wheelGeo, wheelMat);
      wheel.position.set(offset.x, offset.y, offset.z);
      wheel.castShadow = true;
      roverGroup.add(wheel);
      wheelMeshes.push(wheel);
    });

    roverGroup.position.copy(roverPosRef.current);
    scene.add(roverGroup);

    // Initial Path Calculation
    pathWaypointsRef.current = findAStarPath(roverPosRef.current, targetPosRef.current, OBSTACLES);

    let currentHeading = new THREE.Vector3(0, 0, -1).normalize();
    const moveSpeed = 0.1;

    const animate = () => {
      requestAnimationFrame(animate);

      targetMarker.position.copy(targetPosRef.current);
      const currentRoverPos = roverGroup.position;
      const waypoints = pathWaypointsRef.current;

      if (waypoints && waypoints.length > 0) {
        let nextPoint = waypoints[0];
        let distToNext = currentRoverPos.distanceTo(nextPoint);

        if (distToNext < 1.2 && waypoints.length > 1) {
          waypoints.shift();
          nextPoint = waypoints[0];
        }

        let desiredDir = new THREE.Vector3().subVectors(nextPoint, currentRoverPos).normalize();
        currentHeading.lerp(desiredDir, 0.12).normalize();
        currentRoverPos.addScaledVector(currentHeading, moveSpeed);

        wheelMeshes.forEach(w => { w.rotation.x += moveSpeed * 1.5; });

        roverGroup.lookAt(currentRoverPos.clone().add(currentHeading));
        roverPosRef.current.copy(currentRoverPos);

        // Render A* Trajectory Line
        const linePoints = [currentRoverPos.clone(), ...waypoints];
        pathLine.geometry.setFromPoints(linePoints);

        // Camera Follow
        camera.position.set(currentRoverPos.x + 7, currentRoverPos.y + 6, currentRoverPos.z + 11);
        camera.lookAt(currentRoverPos);

        const totalDistToGoal = currentRoverPos.distanceTo(targetPosRef.current);

        setTelemetry({
          status: 'ASTAR_NAV',
          decision: 'A* ALGORITHM // OPTIMAL_SHORTEST_PATH',
          coords: `X:${currentRoverPos.x.toFixed(1)} Y:${currentRoverPos.y.toFixed(1)} Z:${currentRoverPos.z.toFixed(1)}`,
          targetCoords: `X:${targetPosRef.current.x.toFixed(1)} Z:${targetPosRef.current.z.toFixed(1)}`,
          hazardDetected: 'NONE',
          speed: `${(moveSpeed * 15).toFixed(1)}m/s`,
          distToTarget: `${totalDistToGoal.toFixed(1)}m`
        });
      } else {
        setTelemetry(prev => ({
          ...prev,
          status: 'TARGET_ARRIVED',
          decision: 'WAYPOINT_REACHED // STANDBY',
          speed: '0.0m/s',
          distToTarget: '0.0m'
        }));
      }

      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      camera.aspect = currentRef.clientWidth / currentRef.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(currentRef.clientWidth, currentRef.clientHeight);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      renderer.domElement.removeEventListener('pointerdown', handlePointerDown);
      if (currentRef.contains(renderer.domElement)) {
        currentRef.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div className="simulation-wrapper">
      <div className="canvas-container" ref={mountRef} />

      <div className="cyber-sidebar">
        <div className="cyber-box">
          <div className="box-title">
            <span className="blink-tag">&gt;_</span> WAYPOINT_SET
          </div>
          <form onSubmit={handleSetTarget} className="cyber-form">
            <div className="cyber-input-row">
              <label>X:</label>
              <input type="number" step="0.5" value={inputX} onChange={(e) => setInputX(e.target.value)} />
              <label>Z:</label>
              <input type="number" step="0.5" value={inputZ} onChange={(e) => setInputZ(e.target.value)} />
              <button type="submit" className="cyber-btn">EXEC</button>
            </div>
          </form>

          <button type="button" className="tacmap-trigger-btn" onClick={() => setIsMapOpen(true)}>
            [ 🛰️ OPEN 2D TACMAP ]
          </button>
        </div>

        <div className="cyber-box">
          <div className="box-title">
            <span className="live-dot"></span> NAV_TELEMETRY
          </div>
          
          <div className="cyber-stat-list">
            <div className="stat-row">
              <span className="stat-label">STATE:</span>
              <span className={`status-badge ${telemetry.status}`}>{telemetry.status}</span>
            </div>
            <div className="stat-row">
              <span className="stat-label">ROVER_POS:</span>
              <span className="stat-val highlight">{telemetry.coords}</span>
            </div>
            <div className="stat-row">
              <span className="stat-label">TARGET_POS:</span>
              <span className="stat-val target">{telemetry.targetCoords}</span>
            </div>
            <div className="stat-row">
              <span className="stat-label">HAZARD:</span>
              <span className="stat-val alert">{telemetry.hazardDetected}</span>
            </div>
            <div className="stat-row">
              <span className="stat-label">VEL/DIST:</span>
              <span className="stat-val">{telemetry.speed} | {telemetry.distToTarget}</span>
            </div>
            <div className="stat-block">
              <span className="stat-label">DECISION_LOG:</span>
              <div className="decision-box">{telemetry.decision}</div>
            </div>
          </div>
        </div>
      </div>

      {isMapOpen && (
        <TacticalMapModal 
          onClose={() => setIsMapOpen(false)}
          roverPos={roverPosRef.current}
          targetPos={targetPosRef.current}
          pathWaypoints={pathWaypointsRef.current}
          onSelectWaypoint={(x, z) => updateTarget(x, z)}
        />
      )}
    </div>
  );
}

function TacticalMapModal({ onClose, roverPos, targetPos, pathWaypoints, onSelectWaypoint }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animId;

    const MAP_SIZE = 450;
    const WORLD_BOUNDS = 120;

    const worldToCanvas = (wx, wz) => ({
      cx: ((wx + WORLD_BOUNDS / 2) / WORLD_BOUNDS) * MAP_SIZE,
      cy: ((wz + WORLD_BOUNDS / 2) / WORLD_BOUNDS) * MAP_SIZE
    });

    const renderMap = () => {
      ctx.fillStyle = '#020d05';
      ctx.fillRect(0, 0, MAP_SIZE, MAP_SIZE);

      ctx.strokeStyle = 'rgba(0, 255, 102, 0.12)';
      ctx.lineWidth = 1;
      const gridSize = MAP_SIZE / 12;
      for (let i = 0; i <= MAP_SIZE; i += gridSize) {
        ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, MAP_SIZE); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(0, i); ctx.lineTo(MAP_SIZE, i); ctx.stroke();
      }

      OBSTACLES.forEach(obs => {
        const { cx, cy } = worldToCanvas(obs.x, obs.z);
        const radiusCanvas = (obs.radius / WORLD_BOUNDS) * MAP_SIZE;

        if (obs.type === 'CRATER') {
          ctx.beginPath();
          ctx.arc(cx, cy, radiusCanvas, 0, Math.PI * 2);
          ctx.fillStyle = 'rgba(255, 0, 85, 0.15)';
          ctx.fill();
          ctx.strokeStyle = '#ff0055';
          ctx.setLineDash([4, 4]);
          ctx.stroke();
          ctx.setLineDash([]);
        } else {
          ctx.fillStyle = '#ffcc00';
          ctx.fillRect(cx - radiusCanvas, cy - radiusCanvas, radiusCanvas * 2, radiusCanvas * 2);
        }
      });

      // Draw A* Path Line on 2D TacMap
      if (pathWaypoints && pathWaypoints.length > 0) {
        ctx.strokeStyle = '#00ff66';
        ctx.lineWidth = 2;
        ctx.beginPath();
        const startC = worldToCanvas(roverPos.x, roverPos.z);
        ctx.moveTo(startC.cx, startC.cy);
        pathWaypoints.forEach(wp => {
          const c = worldToCanvas(wp.x, wp.z);
          ctx.lineTo(c.cx, c.cy);
        });
        ctx.stroke();
      }

      const targetCanvas = worldToCanvas(targetPos.x, targetPos.z);
      ctx.strokeStyle = '#00e5ff';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(targetCanvas.cx, targetCanvas.cy, 8, 0, Math.PI * 2);
      ctx.stroke();

      const roverCanvas = worldToCanvas(roverPos.x, roverPos.z);
      ctx.fillStyle = '#00ff66';
      ctx.shadowColor = '#00ff66';
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.arc(roverCanvas.cx, roverCanvas.cy, 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;

      animId = requestAnimationFrame(renderMap);
    };

    renderMap();
    return () => cancelAnimationFrame(animId);
  }, [roverPos, targetPos, pathWaypoints]);

  const handleCanvasClick = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const worldX = ((e.clientX - rect.left) / 450) * 120 - 60;
    const worldZ = ((e.clientY - rect.top) / 450) * 120 - 60;
    onSelectWaypoint(worldX.toFixed(1), worldZ.toFixed(1));
  };

  return (
    <div className="tacmap-overlay">
      <div className="tacmap-modal">
        <div className="tacmap-header">
          <span>🛰️ TACTICAL_2D_RADAR_MAP // A* PATHFINDER VISUALIZER</span>
          <button className="tacmap-close-btn" onClick={onClose}>[ X ]</button>
        </div>
        <div className="tacmap-body">
          <canvas ref={canvasRef} width={450} height={450} onClick={handleCanvasClick} className="tacmap-canvas" />
          <div className="tacmap-legend">
            <div><span className="leg-box green"></span> ROVER_LOCATION</div>
            <div><span className="leg-box cyan"></span> TARGET_WAYPOINT</div>
            <div><span className="leg-box red"></span> CRATER_HAZARD</div>
            <div><span className="leg-box yellow"></span> ROCK_OBSTACLE</div>
            <div className="legend-hint">// A* algorithm draws mathematically shortest green line around all hazards</div>
          </div>
        </div>
      </div>
    </div>
  );
}