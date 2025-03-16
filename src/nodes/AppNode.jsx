import React, { useCallback } from 'react';
import { Handle, NodeResizer } from '@xyflow/react';
import { useDispatch, useSelector } from 'react-redux';
import { setSelectedHandle } from '../store/handleSlice';

function AppNode({ id, data, isConnectable }) {
    const dispatch = useDispatch();
    const selectedHandle = useSelector((state) => state.handle.selectedHandle);

    const handleMouseDown = useCallback((handle, event) => {
        dispatch(setSelectedHandle(handle));
        event.stopPropagation();
    }, []);

    const getHandleColor = (handle) => {
        if (selectedHandle?.id === handle.id) {
            return 'red';
        } else {
            return handle.type === 'target' ? 'green' : 'blue';
        }
    };

    return (
        <div className="h-auto border bg-white rounded-sm">
            {/* <NodeResizer minWidth={100} minHeight={30} /> */}
            <div className="rounded-md flex flex-col bg-white/70 shadow-[0_7px_9px_0_rgba(0,0,0,0.02)]">
                <div className="text-sm rounded-t-sm p-1 font-mono border-b border-gray-300 bg-pink-500">
                    {data.label}
                </div>
                <div className="w-fit max-w-[100px] flex justify-center p-1">
                    <img
                        className="object-contain"
                        src="https://file.hstatic.net/200000574527/file/ck15878066-tivi-lg-43qned80tsa-7_0e8953ae66ea493a86dbbdc8d865c343_grande.jpg"
                        alt=""
                    />
                </div>
            </div>

            {data.handles?.map((handle, index) => (
                <Handle
                    key={handle.id}
                    type={handle.type}
                    position={handle.position}
                    id={handle.id}
                    style={{
                        ...handle.style,
                        backgroundColor: getHandleColor(handle),
                    }}
                    isConnectable={isConnectable}
                    onMouseDown={(event) => handleMouseDown(handle, event)}
                />
            ))}
        </div>
    );
}

export default AppNode;
