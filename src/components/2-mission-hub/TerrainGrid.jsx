import React, { useState, useEffect, useCallback } from 'react';
import './TerrainGrid.css';

const GRID_SIZE = 10;

export default function TerrainGrid() {
  const [roverPos] = useState({ r: 0, c: 0 });
  const [goalPos] = useState({ r: 9, c: 9 });
  const [obstacles, setObstacles] = useState([
    { r: 2, c: 3 }, { r: 4, c: 5 }, { r: 5, c: 5 }, { r: 7, c: 2 },
    { r: 3, c: 3 }, { r: 5, c: 4 }
  ]);
  const [path, setPath] = useState([]);

  // A* Pathfinding Logic
  const calculatePath = useCallback(() => {
    const isObstacle = (r, c) => obstacles.some(o => o.r === r && o.c === c);
    const heuristic = (a, b) => Math.abs(a.r - b.r) + Math.abs(a.c - b.c);

    let openSet = [{ ...roverPos, g: 0, h: heuristic(roverPos, goalPos), parent: null }];
    let closedSet = new Set();

    while (openSet.length > 0) {
      openSet.sort((a, b) => (a.g + a.h) - (b.g + b.h));
      let current = openSet.shift();
      let key = `${current.r},${current.c}`;

      if (current.r === goalPos.r && current.c === goalPos.c) {
        let tempPath = [];
        let curr = current;
        while (curr) {
          tempPath.push({ r: curr.r, c: curr.c });
          curr = curr.parent;
        }
        setPath(tempPath.reverse());
        return;
      }

      closedSet.add(key);

      const neighbors = [
        { r: current.r - 1, c: current.c },
        { r: current.r + 1, c: current.c },
        { r: current.r, c: current.c - 1 },
        { r: current.r, c: current.c + 1 }
      ];

      for (let n of neighbors) {
        if (n.r < 0 || n.r >= GRID_SIZE || n.c < 0 || n.c >= GRID_SIZE) continue;
        if (isObstacle(n.r, n.c) || closedSet.has(`${n.r},${n.c}`)) continue;

        let gScore = current.g + 1;
        let existing = openSet.find(o => o.r === n.r && o.c === n.c);

        if (!existing) {
          openSet.push({ ...n, g: gScore, h: heuristic(n, goalPos), parent: current });
        } else if (gScore < existing.g) {
          existing.g = gScore;
          existing.parent = current;
        }
      }
    }
    setPath([]); // No path found
  }, [obstacles, roverPos, goalPos]);

  useEffect(() => {
    calculatePath();
  }, [calculatePath]);

  const toggleObstacle = (r, c) => {
    if ((r === roverPos.r && c === roverPos.c) || (r === goalPos.r && c === goalPos.c)) return;
    const exists = obstacles.some((o) => o.r === r && o.c === c);
    if (exists) {
      setObstacles(obstacles.filter((o) => !(o.r === r && o.c === c)));
    } else {
      setObstacles([...obstacles, { r, c }]);
    }
  };

  return (
    <div className="terrain-container">
      <div className="terrain-header">
        <h2>A* AUTONOMOUS PATH PLANNER</h2>
        <p>{path.length > 0 ? `Path Found: ${path.length - 1} steps` : 'No valid path (Blocked!)'}</p>
      </div>

      <div className="grid-board">
        {Array.from({ length: GRID_SIZE }).map((_, r) => (
          <div key={r} className="grid-row">
            {Array.from({ length: GRID_SIZE }).map((_, c) => {
              const isRover = r === roverPos.r && c === roverPos.c;
              const isGoal = r === goalPos.r && c === goalPos.c;
              const isObstacle = obstacles.some((o) => o.r === r && o.c === c);
              const isPath = path.some((p) => p.r === r && p.c === c) && !isRover && !isGoal;

              let cellClass = 'grid-cell';
              if (isRover) cellClass += ' rover-cell';
              else if (isGoal) cellClass += ' goal-cell';
              else if (isObstacle) cellClass += ' obstacle-cell';
              else if (isPath) cellClass += ' path-cell';

              return (
                <div key={c} className={cellClass} onClick={() => toggleObstacle(r, c)}>
                  {isRover ? '🤖' : isGoal ? '🎯' : isObstacle ? '🪨' : isPath ? '🔹' : ''}
                </div>
              );
            })}
          </div>
        ))}
      </div>

      <div className="terrain-legend">
        <span> Rover</span>
        <span> Target</span>
        <span> Rock</span>
        <span> Planned Path</span>
      </div>
    </div>
  );
}