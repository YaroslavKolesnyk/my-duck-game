import { maxSpeed, maxForce, clusterRadius } from '../constants/physics';

export interface Duck {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  radius: number;
}

export function updatePhysics(
  ducks: Duck[],
  mousePos: { x: number; y: number },
  canvas: HTMLCanvasElement
) {
  // Apply mouse repulsion
  if (mousePos.x >= 0 && mousePos.y >= 0) {
    ducks.forEach(duck => {
      const dx = duck.x - mousePos.x;
      const dy = duck.y - mousePos.y;
      const distance = Math.hypot(dx, dy);
      if (distance < 100) {
        const force = (100 - distance) / 100 * 2;
        duck.vx += (dx / distance) * force;
        duck.vy += (dy / distance) * force;
      }
    });
  }

  // Apply duck repulsion
  ducks.forEach((duck, i) => {
    ducks.forEach((other, j) => {
      if (i !== j) {
        const dx = duck.x - other.x;
        const dy = duck.y - other.y;
        const distance = Math.hypot(dx, dy);
        if (distance < 40 && distance > 0) {
          const force = Math.min(maxForce, (40 - distance) / 40 * 1.5);
          duck.vx += (dx / distance) * force;
          duck.vy += (dy / distance) * force;
        }
      }
    });
  });

  // Update positions and handle boundaries
  ducks.forEach(duck => {
    duck.x += duck.vx;
    duck.y += duck.vy;
    duck.vx *= 0.99;
    duck.vy *= 0.99;

    const speed = Math.hypot(duck.vx, duck.vy);
    if (speed > maxSpeed) {
      duck.vx = (duck.vx / speed) * maxSpeed;
      duck.vy = (duck.vy / speed) * maxSpeed;
    }

    if (duck.x - duck.radius < 0) {
      duck.x = duck.radius;
      duck.vx = -duck.vx * 0.3;
    }
    if (duck.x + duck.radius > canvas.width) {
      duck.x = canvas.width - duck.radius;
      duck.vx = -duck.vx * 0.3;
    }
    if (duck.y - duck.radius < 0) {
      duck.y = duck.radius;
      duck.vy = -duck.vy * 0.3;
    }
    if (duck.y + duck.radius > canvas.height) {
      duck.y = canvas.height - duck.radius;
      duck.vy = -duck.vy * 0.3;
    }
  });

  // Handle collisions
  for (let i = 0; i < ducks.length; i++) {
    for (let j = i + 1; j < ducks.length; j++) {
      const d1 = ducks[i];
      const d2 = ducks[j];
      const dx = d1.x - d2.x;
      const dy = d1.y - d2.y;
      const dist = Math.hypot(dx, dy);

      if (dist < 40 && dist > 0) {
        const angle = Math.atan2(dy, dx);
        const overlap = 40 - dist;
        d1.x += Math.cos(angle) * overlap / 2;
        d1.y += Math.sin(angle) * overlap / 2;
        d2.x -= Math.cos(angle) * overlap / 2;
        d2.y -= Math.sin(angle) * overlap / 2;

        const v1 = d1.vx * Math.cos(angle) + d1.vy * Math.sin(angle);
        const v2 = d2.vx * Math.cos(angle) + d2.vy * Math.sin(angle);
        const anglePerp = angle + Math.PI / 2;
        const v1perp = d1.vx * Math.cos(anglePerp) + d1.vy * Math.sin(anglePerp);
        const v2perp = d2.vx * Math.cos(anglePerp) + d2.vy * Math.sin(anglePerp);
        const newV1 = v2;
        const newV2 = v1;

        d1.vx = newV1 * Math.cos(angle) + v1perp * Math.cos(anglePerp);
        d1.vy = newV1 * Math.sin(angle) + v1perp * Math.sin(anglePerp);
        d2.vx = newV2 * Math.cos(angle) + v2perp * Math.cos(anglePerp);
        d2.vy = newV2 * Math.sin(angle) + v2perp * Math.sin(anglePerp);
      }
    }
  }
}

export function checkClusters(ducks: Duck[]): boolean {
  const colorGroups: Record<string, Duck[]> = {};
  ducks.forEach(duck => {
    if (!colorGroups[duck.color]) colorGroups[duck.color] = [];
    colorGroups[duck.color].push(duck);
  });

  let allGroupsValid = true;

  for (const color in colorGroups) {
    const group = colorGroups[color];
    if (group.length >= 2) {
      for (const duck of group) {
        let hasNeighbor = false;
        for (const other of group) {
          if (duck !== other) {
            const distance = Math.hypot(duck.x - other.x, duck.y - other.y);
            if (distance < clusterRadius) {
              hasNeighbor = true;
              break;
            }
          }
        }
        if (!hasNeighbor) {
          allGroupsValid = false;
          break;
        }
      }
    }
  }

  return allGroupsValid;
}