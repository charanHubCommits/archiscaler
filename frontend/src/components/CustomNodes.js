import { Handle, Position } from "@xyflow/react";
import { Server, Database, User, Shuffle, Cpu, AlertTriangle } from "lucide-react";

// Node Container wrapper for consistent styling
function NodeContainer({ title, icon: Icon, children, selected, utilization }) {
  const getBorderColor = () => {
    if (selected) return "border-biscuit shadow-[0_0_12px_rgba(212,185,150,0.4)]";
    if (utilization >= 100) return "border-rose-500/80 shadow-[0_0_10px_rgba(244,63,94,0.2)]";
    if (utilization >= 80) return "border-amber-500/60";
    return "border-border-dark hover:border-biscuit/50";
  };

  return (
    <div
      className={`bg-panel-dark/95 border text-gray-200 rounded-lg p-4 w-60 backdrop-blur-sm transition-all duration-200 ${getBorderColor()}`}
    >
      <div className="flex items-center justify-between mb-3 pb-2 border-b border-border-dark/60">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded bg-biscuit/10 text-biscuit">
            <Icon className="w-4 h-4" />
          </div>
          <span className="font-bold text-sm tracking-wide text-white">{title}</span>
        </div>
        {utilization >= 100 && (
          <div className="text-rose-400 flex items-center gap-0.5" title="Overloaded!">
            <AlertTriangle className="w-4 h-4 animate-bounce" />
          </div>
        )}
      </div>
      <div className="space-y-2">{children}</div>
    </div>
  );
}

// 1. Client Node
export function ClientNode({ data, selected }) {
  const traffic = data.traffic || 0;
  return (
    <NodeContainer title={data.name || "Client"} icon={User} selected={selected} utilization={0}>
      <div className="text-xs space-y-1">
        <div className="flex justify-between">
          <span className="text-gray-400">Outgoing Traffic:</span>
          <span className="font-semibold text-biscuit">{traffic} RPS</span>
        </div>
      </div>
      <Handle type="source" position={Position.Right} id="out" />
    </NodeContainer>
  );
}

// 2. Server Node
export function ServerNode({ data, selected }) {
  const traffic = data.traffic || 0;
  const capacity = data.capacity || 500;
  const utilization = capacity > 0 ? (traffic / capacity) * 100 : 0;

  const getProgressColor = () => {
    if (utilization >= 100) return "bg-rose-500";
    if (utilization >= 80) return "bg-amber-500";
    return "bg-emerald-500";
  };

  return (
    <NodeContainer title={data.name || "Server"} icon={Server} selected={selected} utilization={utilization}>
      <Handle type="target" position={Position.Left} id="in" />
      <div className="text-xs space-y-2">
        <div className="flex justify-between">
          <span className="text-gray-400">Traffic:</span>
          <span className="font-semibold">{traffic.toFixed(1)} / {capacity} RPS</span>
        </div>
        <div>
          <div className="flex justify-between text-[10px] text-gray-500 mb-1">
            <span>Utilization</span>
            <span className={utilization >= 100 ? "text-rose-400 font-bold" : ""}>
              {utilization.toFixed(1)}%
            </span>
          </div>
          <div className="w-full bg-canvas-dark rounded-full h-1.5 overflow-hidden border border-border-dark/40">
            <div
              className={`h-full transition-all duration-500 ${getProgressColor()}`}
              style={{ width: `${Math.min(utilization, 100)}%` }}
            />
          </div>
        </div>
      </div>
      <Handle type="source" position={Position.Right} id="out" />
    </NodeContainer>
  );
}

// 3. Database Node
export function DatabaseNode({ data, selected }) {
  const traffic = data.traffic || 0;
  const capacity = data.capacity || 200;
  const utilization = capacity > 0 ? (traffic / capacity) * 100 : 0;

  const getProgressColor = () => {
    if (utilization >= 100) return "bg-rose-500";
    if (utilization >= 80) return "bg-amber-500";
    return "bg-emerald-500";
  };

  return (
    <NodeContainer title={data.name || "Database"} icon={Database} selected={selected} utilization={utilization}>
      <Handle type="target" position={Position.Left} id="in" />
      <div className="text-xs space-y-2">
        <div className="flex justify-between">
          <span className="text-gray-400">Queries:</span>
          <span className="font-semibold">{traffic.toFixed(1)} / {capacity} RPS</span>
        </div>
        <div>
          <div className="flex justify-between text-[10px] text-gray-500 mb-1">
            <span>Utilization</span>
            <span className={utilization >= 100 ? "text-rose-400 font-bold" : ""}>
              {utilization.toFixed(1)}%
            </span>
          </div>
          <div className="w-full bg-canvas-dark rounded-full h-1.5 overflow-hidden border border-border-dark/40">
            <div
              className={`h-full transition-all duration-500 ${getProgressColor()}`}
              style={{ width: `${Math.min(utilization, 100)}%` }}
            />
          </div>
        </div>
      </div>
      <Handle type="source" position={Position.Right} id="out" />
    </NodeContainer>
  );
}

// 4. Load Balancer Node
export function LoadBalancerNode({ data, selected }) {
  const traffic = data.traffic || 0;
  return (
    <NodeContainer title={data.name || "Load Balancer"} icon={Shuffle} selected={selected} utilization={0}>
      <Handle type="target" position={Position.Left} id="in" />
      <div className="text-xs space-y-1">
        <div className="flex justify-between">
          <span className="text-gray-400">Total Inflow:</span>
          <span className="font-semibold text-biscuit">{traffic.toFixed(1)} RPS</span>
        </div>
        <div className="text-[10px] text-gray-500 leading-normal">
          Splits traffic equally among connected output nodes.
        </div>
      </div>
      <Handle type="source" position={Position.Right} id="out" />
    </NodeContainer>
  );
}

// 5. Cache Node
export function CacheNode({ data, selected }) {
  const traffic = data.traffic || 0;
  const capacity = data.capacity || 1000;
  const utilization = capacity > 0 ? (traffic / capacity) * 100 : 0;

  const getProgressColor = () => {
    if (utilization >= 100) return "bg-rose-500";
    if (utilization >= 80) return "bg-amber-500";
    return "bg-emerald-500";
  };

  return (
    <NodeContainer title={data.name || "Cache Store"} icon={Cpu} selected={selected} utilization={utilization}>
      <Handle type="target" position={Position.Left} id="in" />
      <div className="text-xs space-y-2">
        <div className="flex justify-between">
          <span className="text-gray-400">Hits/Sec:</span>
          <span className="font-semibold">{traffic.toFixed(1)} / {capacity} RPS</span>
        </div>
        <div>
          <div className="flex justify-between text-[10px] text-gray-500 mb-1">
            <span>Utilization</span>
            <span className={utilization >= 100 ? "text-rose-400 font-bold" : ""}>
              {utilization.toFixed(1)}%
            </span>
          </div>
          <div className="w-full bg-canvas-dark rounded-full h-1.5 overflow-hidden border border-border-dark/40">
            <div
              className={`h-full transition-all duration-500 ${getProgressColor()}`}
              style={{ width: `${Math.min(utilization, 100)}%` }}
            />
          </div>
        </div>
      </div>
      <Handle type="source" position={Position.Right} id="out" />
    </NodeContainer>
  );
}
