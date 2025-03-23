import { BaseEdge, useReactFlow } from '@xyflow/react';
import { useEffect, useState } from 'react';
import { isPointOnPath, getEdgeCorner } from './utils.js';

export default function StepEdge({ id, source, sourceX, sourceY, targetX, targetY }) {
    const { getEdges, setEdges } = useReactFlow();
    const [edgePath, setEdgePath] = useState('');

    const centerY = (targetY - sourceY) / 2 + sourceY;

    // Thêm edge vào data của edge để get ra tính toán
    useEffect(() => {
        // Có thể điều chỉnh cho flexible hơn
        const newEdgePath = `M ${sourceX} ${sourceY} L ${sourceX} ${centerY} L ${targetX} ${centerY} L ${targetX} ${targetY}`;
        setEdgePath(newEdgePath);
        setEdges((prevEdges) =>
            prevEdges.map((edge) =>
                edge.id === id
                    ? {
                          ...edge,
                          data: { ...edge.data, edgePath: newEdgePath },
                      }
                    : edge,
            ),
        );
    }, [id, sourceX, sourceY, targetX, targetY, setEdges]);

    useEffect(() => {
        const edges = getEdges();
        if (edges.length === 0) return;

        // Tính toán lại vị trí của tất cả các corner của các path liên quan
        if (edges[0].data?.edgePath) {
            const sameSourceEdges = edges.filter((edge) => edge.source === source); // Chỉ tìm những path same source, có thể lọc thêm theo điều kiện nào đó

            const updatedEdges = sameSourceEdges.map((edge) => {
                // Lọc chính edge này ra
                const relatedEdges = sameSourceEdges.filter((otherEdge) => otherEdge.id !== edge.id);

                // Tìm các corner của edge này nhưng nằm trên edge khác
                const newCornerNodes = getEdgeCorner(edge.data.edgePath).filter((corner) =>
                    relatedEdges.some(
                        (relatedEdge) =>
                            relatedEdge?.data?.edgePath && isPointOnPath(corner.x, corner.y, relatedEdge.data.edgePath),
                    ),
                );

                return {
                    ...edge,
                    data: {
                        ...edge.data,
                        edgeCorner: newCornerNodes,
                    },
                };
            });

            // Set lại edge có corner nằm trên edge khác thay đổi
            setEdges((prevEdges) =>
                prevEdges.map((edge) => {
                    const updatedEdge = updatedEdges.find((e) => e.id === edge.id);
                    return updatedEdge ? updatedEdge : edge;
                }),
            );
        }
    }, [id, source, edgePath, setEdges]);

    const currentEdge = getEdges().find((edge) => edge.id === id);
    const cornerNodes = currentEdge?.data?.edgeCorner || [];

    return (
        <g>
            <BaseEdge id={id} path={edgePath} />
            <g>
                {cornerNodes?.map((node, index) => (
                    <circle key={index} cx={node.x} cy={node.y} r={5} fill="blue" strokeWidth={1} />
                ))}
            </g>
        </g>
    );
}
