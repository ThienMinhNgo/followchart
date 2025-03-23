import { ReactFlow } from '@xyflow/react';
import StepEdge from './StepEdge';

import '@xyflow/react/dist/style.css';

const initialNodes = [
    { id: 'a', position: { x: 0, y: 0 }, data: { label: 'Node A' } },
    { id: 'b', position: { x: 200, y: 100 }, data: { label: 'Node B' } },
    { id: 'c', position: { x: 50, y: 200 }, data: { label: 'Node C' } },
    { id: 'd', position: { x: -150, y: 300 }, data: { label: 'Node D' } },
];

const initialEdges = [
    { id: 'a->b', type: 'step', source: 'a', target: 'b' },
    { id: 'a->c', type: 'step', source: 'a', target: 'c' },
    { id: 'a->d', type: 'step', source: 'a', target: 'd' },
];

const edgeTypes = {
    step: StepEdge,
};

function Flow() {
    return <ReactFlow defaultNodes={initialNodes} defaultEdges={initialEdges} edgeTypes={edgeTypes} fitView />;
}

export default Flow;
