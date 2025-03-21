import React from 'react';
import { ReactFlow, ReactFlowProvider, Background, Panel } from '@xyflow/react';
import { shallow } from 'zustand/shallow';
import { tw } from 'twind';

import { useStore } from './store';
import Osc from './nodes/Osc';
import Amp from './nodes/Amp';
import Out from './nodes/Out';

import '@xyflow/react/dist/style.css';

const nodeTypes = {
    osc: Osc,
    amp: Amp,
    out: Out,
};

const selector = (store) => ({
    nodes: store.nodes,
    edges: store.edges,
    onNodesChange: store.onNodesChange,
    onNodesDelete: store.onNodesDelete,
    onEdgesChange: store.onEdgesChange,
    onEdgesDelete: store.onEdgesDelete,
    addEdge: store.addEdge,
    createNode: store.createNode,
});

export default function App() {
    const store = useStore(selector, shallow);

    return (
        <ReactFlowProvider>
            <div style={{ width: '100vw', height: '100vh' }}>
                <ReactFlow
                    nodeTypes={nodeTypes}
                    nodes={store.nodes}
                    edges={store.edges}
                    onNodesChange={store.onNodesChange}
                    onNodesDelete={store.onNodesDelete}
                    onEdgesChange={store.onEdgesChange}
                    onEdgesDelete={store.onEdgesDelete}
                    onConnect={store.addEdge}
                    fitView
                >
                    <Panel className={tw('space-x-4')} position="top-right">
                        <button
                            className={tw('px-2 py-1 rounded bg-white shadow')}
                            onClick={() => store.createNode('osc')}
                        >
                            Add Osc
                        </button>
                        <button
                            className={tw('px-2 py-1 rounded bg-white shadow')}
                            onClick={() => store.createNode('amp')}
                        >
                            Add Amp
                        </button>
                    </Panel>
                    <Background />
                </ReactFlow>
            </div>
        </ReactFlowProvider>
    );
}
