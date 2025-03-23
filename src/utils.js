export function parsePathData(d) {
    const commands = d.match(/([ML]\s*[\d.]+\s*[\d.]+)/g);
    if (!commands) return [];

    return commands.map((cmd) => {
        const [_, x, y] = cmd.match(/[ML]\s*([\d.]+)\s*([\d.]+)/).map(Number);
        return [x, y];
    });
}

export function distancePointToSegment(px, py, x1, y1, x2, y2) {
    const A = px - x1,
        B = py - y1;
    const C = x2 - x1,
        D = y2 - y1;

    const dot = A * C + B * D;
    const lenSq = C * C + D * D;
    const param = lenSq !== 0 ? dot / lenSq : -1;

    let xx, yy;
    if (param < 0) {
        xx = x1;
        yy = y1;
    } else if (param > 1) {
        xx = x2;
        yy = y2;
    } else {
        xx = x1 + param * C;
        yy = y1 + param * D;
    }

    return Math.sqrt((px - xx) ** 2 + (py - yy) ** 2);
}

export function isPointOnPath(x, y, pathData, threshold = 1) {
    const points = parsePathData(pathData);
    if (points.length < 2) return false;

    for (let i = 0; i < points.length - 1; i++) {
        const [x1, y1] = points[i];
        const [x2, y2] = points[i + 1];

        if (distancePointToSegment(x, y, x1, y1, x2, y2) < threshold) {
            return true;
        }
    }
    return false;
}

export function getEdgeCorner(path) {
    const commands = path.match(/L (-?\d+\.?\d*) (-?\d+\.?\d*)/g);
    if (!commands) return [];

    return commands.map((cmd) => {
        const [, x, y] = cmd.split(' ');
        return { x: parseFloat(x), y: parseFloat(y) };
    });
}
