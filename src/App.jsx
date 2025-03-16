import {
    ReactFlow,
    Background,
    addEdge,
    MiniMap,
    Controls,
    applyEdgeChanges,
    applyNodeChanges,
    useNodesState,
    useEdgesState,
} from '@xyflow/react';
import { Button } from './components/ui/button';
import React, { useState, useCallback, useEffect } from 'react';
import AppNode from './nodes/AppNode';
import { useDispatch, useSelector } from 'react-redux';
import { setSelectedHandle } from './store/handleSlice';
import { Slider } from './components/ui/slider';
import { Label } from './components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './components/ui/select';
import { Switch } from './components/ui/switch';
import { Separator } from './components/ui/separator';
import '@xyflow/react/dist/style.css';

const nodeTypes = { appNode: AppNode };

const initialEdges = [
    {
        id: 1,
        source: '1',
        sourceHandle: '1-2',
        target: '2',
        targetHandle: '2-1',
        animated: false,
        label: 'to the',
        type: 'default',
        style: { stroke: 'gray', strokeWidth: 1 },
    },
];
export default function FlowChart() {
    // const [nodes, setNodes] = useState([]);
    // const [edges, setEdges] = useState(initialEdges);
    const [nodes, setNodes, onNodesChange] = useNodesState([]);
    const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

    const [isDevMode, setIsDevMode] = useState(false);
    const [selectedNode, setSelectedNode] = useState(null);
    const [selectedEdge, setSelectedEdge] = useState(null);
    const dispatch = useDispatch();
    const selectedHandle = useSelector((state) => state.handle.selectedHandle);

    const convertPercentageToNumber = (value) => {
        return parseFloat(value.replace('%', ''));
    };

    const getHandlePointOffsetValue = () => {
        if (selectedHandle) {
            const { position, style } = selectedHandle;
            if (['left', 'right'].includes(position)) {
                if ('top' in style) {
                    return convertPercentageToNumber(style.top);
                }
            } else {
                if ('left' in style) {
                    return convertPercentageToNumber(style.left);
                }
            }
        }

        return null;
    };

    const [offsetValue, setOffsetValue] = useState(getHandlePointOffsetValue() || null);

    const handleDeleteNode = () => {
        setNodes((nds) => nds.filter((node) => node.id !== selectedNode.id));
        setEdges((eds) => eds.filter((edge) => edge.source !== selectedNode.id && edge.target !== selectedNode.id));
    };

    const handleDeleteHandlePoint = () => {
        const parentNodeId = selectedHandle.id.split('-')[0];
        setNodes((nds) =>
            nds.map((node) =>
                node.id === parentNodeId
                    ? {
                          ...node,
                          data: {
                              ...node.data,
                              handles: node.data.handles.filter((handle) => handle.id !== selectedHandle.id),
                          },
                      }
                    : node,
            ),
        );
        dispatch(setSelectedHandle(null));
        setEdges((eds) =>
            eds.filter((edge) => edge.sourceHandle !== selectedHandle.id && edge.targetHandle !== selectedHandle.id),
        );
    };

    const handleAddHandlePoint = () => {
        setNodes((prevNodes) =>
            prevNodes.map((node) => {
                if (node.id === selectedNode.id) {
                    const handleNumbers = node.data.handles
                        .map((handle) => handle.id.match(/-(\d+)$/))
                        .filter((match) => match)
                        .map((match) => Number(match[1]));
                    handleNumbers.sort((a, b) => a - b);
                    let newNumber = 1;
                    while (handleNumbers.includes(newNumber)) {
                        newNumber++;
                    }
                    const newHandle = {
                        id: `${node.id}-${newNumber}`,
                        type: 'source',
                        position: 'bottom',
                        style: { left: '0%' },
                        isConnectable: true,
                    };
                    dispatch(setSelectedHandle(newHandle));
                    return {
                        ...node,
                        data: {
                            ...node.data,
                            handles: [...node.data.handles, newHandle],
                        },
                    };
                }
                return node;
            }),
        );
    };
    console.log('nodes:', nodes);
    const handleChangeHandlePointPosition = (newPosition) => {
        const parentNodeId = selectedHandle.id.split('-')[0];
        setNodes((nds) =>
            nds.map((node) =>
                node.id === parentNodeId
                    ? {
                          ...node,
                          data: {
                              ...node.data,
                              handles: node.data.handles.map((handle) =>
                                  handle.id === selectedHandle.id
                                      ? {
                                            ...handle,
                                            position: newPosition,
                                            style:
                                                newPosition === 'left' || newPosition === 'right'
                                                    ? { top: '0%' }
                                                    : { left: '0%' },
                                        }
                                      : handle,
                              ),
                          },
                      }
                    : node,
            ),
        );

        dispatch(
            setSelectedHandle({
                ...selectedHandle,
                position: newPosition,
                style: {},
            }),
        );
    };

    const handleChangeHandlePointType = (value) => {
        const parentNodeId = selectedHandle.id.split('-')[0];
        setNodes((nds) =>
            nds.map((node) =>
                node.id === parentNodeId
                    ? {
                          ...node,
                          data: {
                              ...node.data,
                              handles: node.data.handles.map((handle) =>
                                  handle.id === selectedHandle.id
                                      ? {
                                            ...handle,
                                            type: value,
                                        }
                                      : handle,
                              ),
                          },
                      }
                    : node,
            ),
        );
        setEdges((eds) =>
            eds.filter((edge) => edge.sourceHandle !== selectedHandle.id && edge.targetHandle !== selectedHandle.id),
        );
        dispatch(setSelectedHandle(null));
    };

    const handleOffsetHandlePointValue = (value) => {
        let styleValue = {};
        const parentNodeId = selectedHandle.id.split('-')[0];
        switch (selectedHandle.position) {
            case 'top':
            case 'bottom':
                if (value === 50) {
                    styleValue = {};
                } else {
                    styleValue = { left: `${value}%` };
                    console.log('styleValue:', styleValue);
                }

                break;
            case 'left':
            case 'right':
                if (value === 50) {
                    styleValue = {};
                } else {
                    styleValue = { top: `${value}%` };
                    console.log('styleValue:', styleValue);
                }
                break;
            default:
                console.warn('Invalid position:', selectedHandle.position);
                return;
        }

        setNodes((nds) =>
            nds.map((node) =>
                node.id === parentNodeId
                    ? {
                          ...node,
                          data: {
                              ...node.data,
                              handles: node.data.handles.map((handle) =>
                                  handle.id === selectedHandle.id
                                      ? {
                                            ...handle,
                                            style: styleValue,
                                        }
                                      : handle,
                              ),
                          },
                      }
                    : node,
            ),
        );

        dispatch(
            setSelectedHandle({
                ...selectedHandle,
                style: styleValue,
            }),
        );
        setOffsetValue(getHandlePointOffsetValue());
    };

    const initialNodes = [
        {
            id: '1',
            type: 'appNode',
            position: { x: 0, y: 0 },
            data: {
                value: 123,
                label: 'Home',
                handles: [
                    {
                        id: '1-1',
                        type: 'target',
                        position: 'bottom',
                        style: { left: '100%' },
                        isConnectable: true,
                    },
                    {
                        id: '1-2',
                        type: 'source',
                        position: 'right',
                        style: { top: '10%' },
                        isConnectable: true,
                    },
                ],
            },
        },
        {
            id: '2',
            type: 'appNode',
            position: { x: 0, y: 100 },
            data: {
                value: 123,
                label: 'Menu',
                handles: [
                    {
                        id: '2-1',
                        type: 'target',
                        position: 'left',
                        style: {},
                        isConnectable: true,
                    },
                    {
                        id: '2-2',
                        type: 'source',
                        position: 'right',
                        style: {},
                        isConnectable: true,
                    },
                ],
            },
        },
    ];

    // Add new node
    const addNode = useCallback((type) => {
        const listIds = nodes.map((node) => Number(node.id));
        listIds.sort((a, b) => a - b);

        let newId = 1;
        while (listIds.includes(newId)) {
            newId++;
        }
        const newNode = {
            id: `${newId}`,
            type,
            position: { x: Math.random() * 200, y: Math.random() * 200 },
            data: {
                value: 123,
                label: `Node ${newId}`,
                handles: [],
            },
        };
        setNodes((nds) => [...nds, newNode]);
    });

    useEffect(() => {
        setNodes(initialNodes);
    }, []);

    const onEdgeClick = useCallback((event, edge) => {
        setSelectedEdge(edge);
        setEdges((prevEdges) =>
            prevEdges.map((e) =>
                e.id === edge.id
                    ? { ...e, style: { stroke: 'red', strokeWidth: 1 } }
                    : { ...e, style: { stroke: 'gray', strokeWidth: 1 } },
            ),
        );
    }, []);

    const handleChangeEdgeType = (value) => {
        setEdges((eds) =>
            eds.map((ed) =>
                ed.id === selectedEdge.id
                    ? {
                          ...ed,
                          type: value,
                      }
                    : ed,
            ),
        );
    };

    const handleChangeEdgeAnimatedType = (value) => {
        setEdges((eds) =>
            eds.map((ed) =>
                ed.id === selectedEdge.id
                    ? {
                          ...ed,
                          animated: value,
                      }
                    : ed,
            ),
        );
    };

    const handleDeleteEdge = useCallback(() => {
        if (selectedEdge === null) return;
        setEdges((prevEdges) => prevEdges.filter((e) => e.id !== selectedEdge.id));
        setSelectedEdge(null);
    }, [selectedEdge]);

    useEffect(() => {
        setOffsetValue(getHandlePointOffsetValue() || null);
    }, [selectedHandle]);

    // const onNodesChange = useCallback((changes) => setNodes((nds) => applyNodeChanges(changes, nds)), [setNodes]);
    // const onEdgesChange = useCallback((changes) => setEdges((eds) => applyEdgeChanges(changes, eds)), [setEdges]);
    const onConnect = useCallback((connection) => setEdges((eds) => addEdge(connection, eds)), [setEdges]);

    return (
        <div className="w-full h-screen flex ">
            <div className={`flex flex-col ${isDevMode ? 'w-[80%]' : 'w-full'}`}>
                <div className="flex items-center space-x-2">
                    <Switch
                        className="!p-0"
                        id="devmode"
                        checked={isDevMode}
                        onCheckedChange={(value) => setIsDevMode(value)}
                    />
                    <Label htmlFor="devmode">Dev Mode</Label>
                </div>

                <div className="flex-1">
                    <ReactFlow
                        nodes={nodes}
                        edges={edges}
                        onNodesChange={onNodesChange}
                        onEdgesChange={onEdgesChange}
                        onEdgeClick={onEdgeClick}
                        onConnect={onConnect}
                        nodeTypes={nodeTypes}
                        fitView
                        onSelectionChange={(params) => {
                            if (params.nodes.length > 0) {
                                setSelectedNode(params.nodes[0]);
                            } else {
                                setSelectedNode(null);
                            }
                        }}
                    >
                        <MiniMap />
                        <Controls />
                        <Background />
                    </ReactFlow>
                </div>
            </div>
            {isDevMode && (
                <div className="border-l border-l-gray-300 flex-1 p-2 flex flex-col gap-6">
                    <div className="flex flex-col gap-4 ">
                        <div className="font-bold text-left">Node Control</div>
                        <div className="flex gap-2 justify-between">
                            <div className="flex flex-col gap-2 justify-between">
                                <Button onClick={() => addNode('appNode')}>Add app node</Button>
                                <Button
                                    onClick={() => handleDeleteNode()}
                                    disabled={selectedNode ? false : true}
                                    variant="destructive"
                                    className="border bg-white hover:bg-red-500 hover:text-white text-red-500 border-red-500 active:bg-red-700 active:text-white"
                                >
                                    Delete
                                </Button>
                            </div>
                            <div className="flex flex-col gap-2 justify-between">
                                <Button
                                    onClick={() => setNodes([])}
                                    variant="destructive"
                                    className="border bg-white hover:bg-red-500 hover:text-white text-red-500 border-red-500 active:bg-red-700 active:text-white"
                                >
                                    Clear all node
                                </Button>
                            </div>
                        </div>
                    </div>
                    <Separator />
                    <div className="flex flex-col gap-4 ">
                        <div className="font-bold text-left"> Handle Control</div>
                        <div className=" flex gap-2">
                            <div className="flex flex-col gap-4">
                                <Button disabled={selectedNode ? false : true} onClick={() => handleAddHandlePoint()}>
                                    Add handle
                                </Button>
                                <div className="flex gap-4 flex-col">
                                    <Label>Position</Label>
                                    <Select
                                        disabled={selectedHandle ? false : true}
                                        value={selectedHandle?.position}
                                        onValueChange={(value) => handleChangeHandlePointPosition(value)}
                                    >
                                        <SelectTrigger className="w-[180px]">
                                            <SelectValue placeholder="Change position" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="top">Top</SelectItem>
                                            <SelectItem value="bottom">Bottom</SelectItem>
                                            <SelectItem value="left">Left</SelectItem>
                                            <SelectItem value="right">Right</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <div className="w-[100%] min-w-[200px] flex flex-col gap-2">
                                        <Label>offset</Label>
                                        <Slider
                                            // orientation="vertical"
                                            disabled={selectedHandle ? false : true}
                                            value={[offsetValue]}
                                            onValueChange={(val) => handleOffsetHandlePointValue(val[0])}
                                            max={100}
                                            step={1}
                                            className={'w-[60%]'}
                                        />
                                    </div>
                                </div>
                            </div>
                            <div className="flex flex-col gap-4">
                                <Button
                                    onClick={() => handleDeleteHandlePoint()}
                                    disabled={selectedHandle ? false : true}
                                    variant="destructive"
                                    className="border bg-white hover:text-white text-red-500 border-red-500"
                                >
                                    Delete
                                </Button>
                                <div className="flex flex-col gap-4">
                                    <Label htmlFor="r1">Type</Label>
                                    <Select
                                        value={selectedHandle?.type}
                                        disabled={selectedHandle ? false : true}
                                        onValueChange={(value) => handleChangeHandlePointType(value)}
                                    >
                                        <SelectTrigger className="w-[180px]">
                                            <SelectValue placeholder="Select type" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="source">Source</SelectItem>
                                            <SelectItem value="target">Target</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </div>
                    </div>
                    <Separator />
                    <div className=" flex flex-col gap-4">
                        <div className="font-bold text-left"> Edge Control</div>

                        <div className="flex gap-4 justify-between">
                            <div className="flex flex-col gap-2">
                                <Button
                                    onClick={() => handleDeleteEdge()}
                                    disabled={selectedEdge ? false : true}
                                    variant="destructive"
                                    className="border bg-white hover:text-white text-red-500 border-red-500"
                                >
                                    Delete
                                </Button>
                                <div className="flex items-center space-x-2">
                                    <Switch
                                        className="!p-0"
                                        id="animated"
                                        disabled={selectedEdge ? false : true}
                                        checked={selectedEdge?.animated || false}
                                        onCheckedChange={(value) => handleChangeEdgeAnimatedType(value)}
                                    />
                                    <Label htmlFor="animated">Animated</Label>
                                </div>
                            </div>

                            <div className="flex flex-col gap-4">
                                <Label htmlFor="r1">Type</Label>
                                <Select
                                    disabled={selectedEdge ? false : true}
                                    value={selectedEdge?.type}
                                    onValueChange={(value) => handleChangeEdgeType(value)}
                                >
                                    <SelectTrigger className="w-[180px]">
                                        <SelectValue placeholder="Change Type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="straight">Straight</SelectItem>
                                        <SelectItem value="step">Step</SelectItem>
                                        <SelectItem value="smoothstep">Smoothstep</SelectItem>
                                        <SelectItem value="bezier">Bezier</SelectItem>
                                        <SelectItem value="default">Default</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
