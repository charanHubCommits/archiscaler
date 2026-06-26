"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  MarkerType,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import {
  ClientNode,
  ServerNode,
  DatabaseNode,
  LoadBalancerNode,
  CacheNode,
} from "@/components/CustomNodes";
import {
  Plus,
  Save,
  Play,
  LogOut,
  User as UserIcon,
  Trash2,
  AlertTriangle,
  FolderOpen,
  Activity,
  ChevronDown,
  Server,
  Database,
  Shuffle
} from "lucide-react";
import Cookies from "js-cookie"

const nodeTypes = {
  client: ClientNode,
  server: ServerNode,
  database: DatabaseNode,
  load_balancer: LoadBalancerNode,
  cache: CacheNode,
};

// Cycle detection utility
const wouldHaveCycle = (source, target, edges) => {
  const adj = {};
  for (const edge of edges) {
    if (!adj[edge.source]) adj[edge.source] = [];
    adj[edge.source].push(edge.target);
  }
  if (!adj[source]) adj[source] = [];
  adj[source].push(target); // Add proposed edge

  const visited = new Set();
  const recStack = new Set();

  const dfs = (node) => {
    if (recStack.has(node)) return true;
    if (visited.has(node)) return false;

    visited.add(node);
    recStack.add(node);

    const neighbors = adj[node] || [];
    for (const neighbor of neighbors) {
      if (dfs(neighbor)) return true;
    }

    recStack.delete(node);
    return false;
  };

  for (const node in adj) {
    if (dfs(node)) return true;
  }
  return false;
};

// Initial design setup (starts with a client node)
const initialNodes = [
  {
    id: "client",
    type: "client",
    position: { x: 100, y: 200 },
    data: { name: "Client Traffic", traffic: 0 }
  }
];

export default function WorkspacePage() {
  const router = useRouter();
  
  // State management
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  
  const [projects, setProjects] = useState([]);
  const [selectedProjectId, setSelectedProjectId] = useState("");
  const [projectName, setProjectName] = useState("My System Architecture");
  const [activeUser, setActiveUser] = useState("");
  
  const [leftTab, setLeftTab] = useState("add"); // 'add' | 'properties'
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [rps, setRps] = useState(100);
  const [simulationRunning, setSimulationRunning] = useState(false);
  const [simulationResults, setSimulationResults] = useState([]);
  
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // Get active selected node
  const selectedNode = useMemo(() => nodes.find(n => n.selected), [nodes]);
  const selectedEdge = useMemo(() => edges.find(e => e.selected), [edges]);

  // If a node is selected, auto switch left tab to properties
  useEffect(() => {
    if (selectedNode || selectedEdge) {
      setLeftTab("properties");
    }
  }, [selectedNode, selectedEdge]);

  // Auth guard and initial data loading
  useEffect(() => {
    const token = Cookies.get("token");
    const user = localStorage.getItem("username");
    if (!token) {
      router.push("/auth?tab=login");
      return;
    }
    setActiveUser(user || "User");
    fetchProjects();
  }, [router]);

  const fetchProjects = async () => {
    const token = Cookies.get("token");
    try {
      const url = process.env.NEXT_PUBLIC_BACKEND_URL+"/projects";
      const response = await fetch(url, {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (response.ok && data.projects) {
        setProjects(data.projects);
      }
    } catch (err) {
      console.error("Failed to fetch projects:", err);
    }
  };

  const loadProject = async (id) => {
    if (!id) return;
    const token = Cookies.get("token");
    try {
      const url = process.env.NEXT_PUBLIC_BACKEND_URL+`/projects/${id}`;
      const response = await fetch(url, {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (response.ok) {
        setProjectName(data.name);
        setSelectedProjectId(id);
        const design = data.archi_json;
        if (design) {
          setNodes(design.nodes || []);
          setEdges(design.edges || []);
          setSimulationResults([]);
        }
        setSuccessMsg("Project loaded!");
        setTimeout(() => setSuccessMsg(""), 3000);
      }
    } catch (err) {
      setErrorMsg("Failed to load project: " + err.message);
    }
  };

  const saveProject = async () => {
    setErrorMsg("");
    setSuccessMsg("");
    if (!projectName.trim()) {
      setErrorMsg("Project name is required.");
      return;
    }

    const token = Cookies.get("token");
    const payload = {
      name: projectName,
      archiJson: { nodes, edges }
    };

    try {
      let response;
      if (selectedProjectId) {
        const url = process.env.NEXT_PUBLIC_BACKEND_URL+`/projects/${selectedProjectId}`;
        const response = await fetch(url, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          },
          body: JSON.stringify(payload)
        });
      } else {
        const url = process.env.NEXT_PUBLIC_BACKEND_URL+`/projects`
        response = await fetch(url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          },
          body: JSON.stringify(payload)
        });
      }

      const data = await response.json();
      if (!response.ok) throw new Error(data.msg || "Failed to save project.");

      setSuccessMsg(selectedProjectId ? "Project updated successfully!" : "Project created successfully!");
      if (!selectedProjectId && data.project) {
        setSelectedProjectId(data.project.project_id);
      }
      setTimeout(() => setSuccessMsg(""), 3000);
      fetchProjects();
    } catch (err) {
      setErrorMsg(err.message);
    }
  };

  // Create new project canvas
  const createNewProject = () => {
    setSelectedProjectId("");
    setProjectName("My System Architecture");
    setNodes(initialNodes);
    setEdges([]);
    setSimulationResults([]);
    setErrorMsg("");
    setSuccessMsg("");
  };

  // Spawn node
  const spawnNode = (type) => {
    const id = `${type}_${Date.now()}`;
    let name = type.charAt(0).toUpperCase() + type.slice(1);
    if (type === "load_balancer") name = "Load Balancer";
    let capacity = 500;
    if (type === "database") capacity = 200;
    if (type === "cache") capacity = 1000;

    const newNode = {
      id,
      type,
      position: {
        x: 200 + (nodes.length * 30) % 250,
        y: 150 + (nodes.length * 30) % 200,
      },
      data: { name, capacity, traffic: 0 }
    };

    setNodes((nds) => nds.concat(newNode));
    setLeftTab("properties");
  };

  // Modify node data values in state
  const updateNodeData = (field, value) => {
    if (!selectedNode) return;
    setNodes((nds) =>
      nds.map((node) => {
        if (node.id === selectedNode.id) {
          return {
            ...node,
            data: {
              ...node.data,
              [field]: field === "capacity" ? Number(value) : value
            }
          };
        }
        return node;
      })
    );
  };

  // Delete active element
  const deleteSelected = () => {
    if (selectedNode) {
      if (selectedNode.id === "client") {
        setErrorMsg("The client node is the traffic source and cannot be deleted.");
        return;
      }
      setNodes((nds) => nds.filter((n) => n.id !== selectedNode.id));
      setEdges((eds) => eds.filter((e) => e.source !== selectedNode.id && e.target !== selectedNode.id));
      setSimulationResults([]);
    } else if (selectedEdge) {
      setEdges((eds) => eds.filter((e) => e.id !== selectedEdge.id));
      setSimulationResults([]);
    }
  };

  // Handle new edge connection
  const onConnect = useCallback((params) => {
    setErrorMsg("");
    
    // Cycle check (DAG restriction)
    if (wouldHaveCycle(params.source, params.target, edges)) {
      setErrorMsg("Invalid connection: Cycles are not allowed in this simulator (DAG only).");
      return;
    }

    setEdges((eds) =>
      addEdge(
        {
          ...params,
          type: "smoothstep",
          animated: true,
          markerEnd: {
            type: MarkerType.ArrowClosed,
            color: "#d4b996",
          },
        },
        eds
      )
    );
  }, [edges, setEdges]);

  // Run Simulation API call
  const runSimulation = async () => {
    setSimulationRunning(true);
    setErrorMsg("");
    const token = Cookies.get("token");

    const hasClient = nodes.some(n => n.id === "client");
    if (!hasClient) {
      setErrorMsg("Simulation requires a root node with ID 'client' of type 'client'.");
      setSimulationRunning(false);
      return;
    }

    const formattedNodes = nodes.map(n => ({
      id: n.id,
      capacity: n.data.capacity || 0
    }));

    const formattedEdges = edges.map(e => ({
      source: e.source,
      target: e.target
    }));

    const payload = {
      archiJson: {
        nodes: formattedNodes,
        edges: formattedEdges
      },
      reqPerSec: Number(rps)
    };

    try {
      const url = process.env.NEXT_PUBLIC_BACKEND_URL+`/projects/simulate`
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.msg || data.error || "Simulation failure");

      const simResults = data.sim_json || [];
      setNodes((nds) =>
        nds.map((node) => {
          const result = simResults.find((r) => r.id === node.id);
          return {
            ...node,
            data: {
              ...node.data,
              traffic: result ? result.traffic : 0,
            },
          };
        })
      );
      setSimulationResults(simResults);
      setSuccessMsg("Simulation complete!");
      setTimeout(() => setSuccessMsg(""), 3000);
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setSimulationRunning(false);
    }
  };

  // Sign out
  const handleSignOut = () => {
    localStorage.clear();
    Cookies.remove("token")
    router.push("/");
  };

  return (
    <div className="flex flex-col h-screen w-screen bg-canvas-dark text-gray-200 overflow-hidden font-sans">
      
      {/* Top Navigation Panel */}
      <header className="h-16 border-b border-border-dark bg-panel-dark flex items-center justify-between px-6 shrink-0 z-10">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2" onClick={() => router.push("/")} className="cursor-pointer flex items-center gap-2">
            <div className="w-7 h-7 rounded bg-biscuit flex items-center justify-center text-canvas-dark font-black text-base">
              Λ
            </div>
            <span className="text-lg font-bold tracking-tight text-white">
              Archi<span className="text-biscuit">Scaler</span>
            </span>
          </div>

          <div className="h-6 w-px bg-border-dark" />

          {/* Project load selector */}
          <div className="flex items-center gap-2">
            <FolderOpen className="w-4 h-4 text-gray-400" />
            <select
              value={selectedProjectId}
              onChange={(e) => loadProject(e.target.value)}
              className="bg-canvas-dark border border-border-dark rounded px-3 py-1 text-sm text-gray-300 focus:outline-none focus:border-biscuit cursor-pointer"
            >
              <option value="">-- Load Existing Project --</option>
              {projects.map((proj) => (
                <option key={proj.project_id} value={proj.project_id}>
                  {proj.name}
                </option>
              ))}
            </select>
          </div>

          {/* Project name input */}
          <input
            type="text"
            value={projectName}
            onChange={(e) => setProjectName(e.target.value)}
            className="bg-transparent border-b border-transparent hover:border-border-dark focus:border-biscuit text-white font-bold text-sm px-2 py-1 focus:outline-none transition-colors w-64"
            placeholder="Untitled Architecture"
          />
        </div>

        {/* Action Controls & User menu */}
        <div className="flex items-center gap-4">
          {errorMsg && (
            <div className="text-xs text-rose-400 bg-rose-500/10 border border-rose-500/20 px-3 py-1.5 rounded flex items-center gap-1.5 animate-pulse">
              <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded flex items-center gap-1.5">
              <span>{successMsg}</span>
            </div>
          )}

          <button
            onClick={createNewProject}
            className="text-xs font-semibold text-gray-300 hover:text-white px-3 py-1.5 rounded border border-border-dark hover:border-gray-500 transition-all"
          >
            New Project
          </button>

          <button
            onClick={saveProject}
            className="px-4 py-1.5 rounded bg-biscuit text-canvas-dark font-bold text-xs hover:bg-biscuit-dark transition-all flex items-center gap-1 shadow-md shadow-biscuit/5"
          >
            <Save className="w-3.5 h-3.5" /> Save
          </button>

          <div className="h-6 w-px bg-border-dark" />

          {/* Profile Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowUserDropdown(!showUserDropdown)}
              className="flex items-center gap-2 hover:text-white text-gray-300 bg-canvas-dark border border-border-dark px-3 py-1.5 rounded text-xs font-semibold"
            >
              <UserIcon className="w-3.5 h-3.5 text-biscuit" />
              <span>{activeUser}</span>
              <ChevronDown className="w-3 h-3 text-gray-500" />
            </button>

            {showUserDropdown && (
              <div className="absolute right-0 mt-2 w-48 rounded-md bg-panel-dark border border-border-dark shadow-2xl py-1 z-50">
                <div className="px-4 py-2 border-b border-border-dark text-xs text-gray-400">
                  Logged in as <span className="font-bold text-white">{activeUser}</span>
                </div>
                <button
                  onClick={handleSignOut}
                  className="w-full flex items-center gap-2 text-left px-4 py-2 text-xs text-rose-400 hover:bg-rose-500/10 transition-colors"
                >
                  <LogOut className="w-3.5 h-3.5" /> Sign Out
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Workspace Panels */}
      <div className="flex flex-1 overflow-hidden relative">
        
        {/* Left Modular Sidebar */}
        <aside className="w-80 border-r border-border-dark bg-panel-dark flex flex-col shrink-0 z-10">
          
          {/* Tab switches */}
          <div className="flex border-b border-border-dark select-none">
            <button
              onClick={() => setLeftTab("add")}
              className={`flex-1 py-3 text-center text-xs font-bold transition-all ${
                leftTab === "add"
                  ? "text-biscuit border-b-2 border-biscuit"
                  : "text-gray-400 hover:text-gray-200"
              }`}
            >
              Add Components
            </button>
            <button
              onClick={() => setLeftTab("properties")}
              className={`flex-1 py-3 text-center text-xs font-bold transition-all ${
                leftTab === "properties"
                  ? "text-biscuit border-b-2 border-biscuit"
                  : "text-gray-400 hover:text-gray-200"
              }`}
            >
              Properties
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4">
            
            {/* TAB: Add Nodes */}
            {leftTab === "add" && (
              <div className="space-y-4">
                <div className="text-xs text-gray-400 mb-2">
                  Click on any component below to spawn it inside the system canvas. Connect output handles (right) to input handles (left).
                </div>
                
                {/* Node catalog item */}
                <button
                  onClick={() => spawnNode("server")}
                  className="w-full flex items-center justify-between p-3 rounded bg-canvas-dark border border-border-dark hover:border-biscuit/60 text-left transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded bg-biscuit/10 text-biscuit group-hover:scale-105 transition-transform">
                      <Server className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white leading-none mb-1">Web Server</h4>
                      <p className="text-[10px] text-gray-400">Processes traffic requests. (Default 500 RPS)</p>
                    </div>
                  </div>
                  <Plus className="w-4 h-4 text-gray-500 group-hover:text-biscuit" />
                </button>

                <button
                  onClick={() => spawnNode("database")}
                  className="w-full flex items-center justify-between p-3 rounded bg-canvas-dark border border-border-dark hover:border-biscuit/60 text-left transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded bg-biscuit/10 text-biscuit group-hover:scale-105 transition-transform">
                      <Database className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white leading-none mb-1">Database Instance</h4>
                      <p className="text-[10px] text-gray-400">Processes persistent storage queries. (Default 200 RPS)</p>
                    </div>
                  </div>
                  <Plus className="w-4 h-4 text-gray-500 group-hover:text-biscuit" />
                </button>

                <button
                  onClick={() => spawnNode("load_balancer")}
                  className="w-full flex items-center justify-between p-3 rounded bg-canvas-dark border border-border-dark hover:border-biscuit/60 text-left transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded bg-biscuit/10 text-biscuit group-hover:scale-105 transition-transform">
                      <Shuffle className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white leading-none mb-1">Load Balancer</h4>
                      <p className="text-[10px] text-gray-400">Distributes load evenly to multiple servers.</p>
                    </div>
                  </div>
                  <Plus className="w-4 h-4 text-gray-500 group-hover:text-biscuit" />
                </button>

                <button
                  onClick={() => spawnNode("cache")}
                  className="w-full flex items-center justify-between p-3 rounded bg-canvas-dark border border-border-dark hover:border-biscuit/60 text-left transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded bg-biscuit/10 text-biscuit group-hover:scale-105 transition-transform">
                      <Activity className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white leading-none mb-1">Cache Store</h4>
                      <p className="text-[10px] text-gray-400">Serves quick static memory data. (Default 1000 RPS)</p>
                    </div>
                  </div>
                  <Plus className="w-4 h-4 text-gray-500 group-hover:text-biscuit" />
                </button>
              </div>
            )}

            {/* TAB: Properties panel */}
            {leftTab === "properties" && (
              <div className="space-y-4">
                {selectedNode ? (
                  <div className="space-y-4">
                    <div className="text-xs font-bold text-biscuit uppercase tracking-wider">
                      Component Details ({selectedNode.type})
                    </div>

                    {/* Node ID (ReadOnly) */}
                    <div>
                      <label className="block text-[10px] uppercase text-gray-400 mb-1">Unique ID</label>
                      <input
                        type="text"
                        value={selectedNode.id}
                        disabled
                        className="w-full bg-canvas-dark border border-border-dark/60 rounded px-3 py-2 text-xs text-gray-400 cursor-not-allowed"
                      />
                    </div>

                    {/* Node Name */}
                    <div>
                      <label className="block text-[10px] uppercase text-gray-400 mb-1 font-semibold">Name</label>
                      <input
                        type="text"
                        value={selectedNode.data.name || ""}
                        onChange={(e) => updateNodeData("name", e.target.value)}
                        className="w-full bg-canvas-dark border border-border-dark rounded px-3 py-2 text-xs text-white focus:outline-none focus:border-biscuit"
                      />
                    </div>

                    {/* Node Capacity (if server, db, cache) */}
                    {selectedNode.id !== "client" && selectedNode.type !== "load_balancer" && (
                      <div>
                        <label className="block text-[10px] uppercase text-gray-400 mb-1 font-semibold">
                          Max Capacity (RPS)
                        </label>
                        <input
                          type="number"
                          value={selectedNode.data.capacity || ""}
                          onChange={(e) => updateNodeData("capacity", e.target.value)}
                          className="w-full bg-canvas-dark border border-border-dark rounded px-3 py-2 text-xs text-white focus:outline-none focus:border-biscuit"
                          min="10"
                          max="100000"
                        />
                      </div>
                    )}

                    <div className="h-px bg-border-dark my-4" />

                    <button
                      onClick={deleteSelected}
                      className="w-full py-2.5 rounded bg-rose-950/40 border border-rose-500/20 hover:bg-rose-500 hover:text-canvas-dark text-rose-300 font-bold text-xs transition-all flex items-center justify-center gap-1"
                    >
                      <Trash2 className="w-4 h-4" /> Delete Component
                    </button>
                  </div>
                ) : selectedEdge ? (
                  <div className="space-y-4">
                    <div className="text-xs font-bold text-biscuit uppercase tracking-wider">
                      Edge Connection Details
                    </div>
                    <div className="text-xs space-y-1 text-gray-300 p-3 rounded bg-canvas-dark border border-border-dark">
                      <div>
                        <span className="text-gray-500">Source Node:</span> {selectedEdge.source}
                      </div>
                      <div>
                        <span className="text-gray-500">Target Node:</span> {selectedEdge.target}
                      </div>
                    </div>
                    <button
                      onClick={deleteSelected}
                      className="w-full py-2.5 rounded bg-rose-950/40 border border-rose-500/20 hover:bg-rose-500 hover:text-canvas-dark text-rose-300 font-bold text-xs transition-all flex items-center justify-center gap-1"
                    >
                      <Trash2 className="w-4 h-4" /> Delete Edge
                    </button>
                  </div>
                ) : (
                  <div className="text-xs text-gray-400 text-center py-12">
                    Click on a component in the canvas to edit its properties or delete it.
                  </div>
                )}
              </div>
            )}
          </div>
        </aside>

        {/* Center Canvas Workspace */}
        <main className="flex-1 h-full bg-canvas-dark relative">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            nodeTypes={nodeTypes}
            fitView
            className="w-full h-full"
          >
            <Background color="#2e2e35" gap={20} size={1} />
            <Controls />
            <MiniMap
              nodeColor={(node) => {
                if (node.id === "client") return "#d4b996";
                if (node.type === "server") return "#3b82f6";
                if (node.type === "database") return "#10b981";
                if (node.type === "cache") return "#8b5cf6";
                return "#4b5563";
              }}
              maskColor="rgba(15, 15, 17, 0.6)"
              bgColor="#16161a"
              style={{ border: "1px solid #2e2e35", borderRadius: "4px" }}
            />
          </ReactFlow>

          {/* Floating Instructions/Help */}
          <div className="absolute top-4 right-4 bg-panel-dark/95 border border-border-dark/80 p-4 rounded-lg max-w-xs shadow-2xl backdrop-blur-sm pointer-events-none text-xs text-gray-300">
            <h4 className="font-bold text-white mb-2 flex items-center gap-1.5">
              <Activity className="w-4 h-4 text-biscuit" /> Simulator Quick Guide
            </h4>
            <ul className="list-disc pl-4 space-y-1 text-gray-400">
              <li>Spawn nodes from the left menu.</li>
              <li>Connect output handle to input handle.</li>
              <li>Set target RPS in the simulation panel.</li>
              <li>Click <strong>Simulate</strong> to see bottleneck stress analysis.</li>
            </ul>
          </div>
        </main>

        {/* Bottom Right Simulation Console Panel */}
        <section className="absolute bottom-6 right-6 w-96 rounded-lg border border-border-dark bg-panel-dark/95 backdrop-blur-md shadow-2xl p-4 flex flex-col z-20">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold text-sm text-white flex items-center gap-1.5">
              <Activity className="w-4 h-4 text-biscuit" /> Load Test Console
            </h3>
            <span className="text-[10px] text-gray-400">Directed Acyclic Mode</span>
          </div>

          <div className="space-y-4">
            {/* Target RPS input */}
            <div>
              <div className="flex justify-between text-xs mb-1.5">
                <span className="text-gray-400">Target Client Load:</span>
                <span className="font-bold text-biscuit">{rps} RPS</span>
              </div>
              <div className="flex gap-3 items-center">
                <input
                  type="range"
                  min="10"
                  max="5000"
                  step="10"
                  value={rps}
                  onChange={(e) => setRps(Number(e.target.value))}
                  className="flex-1 accent-biscuit bg-canvas-dark h-1.5 rounded-lg cursor-pointer"
                />
                <input
                  type="number"
                  min="10"
                  max="100000"
                  value={rps}
                  onChange={(e) => setRps(Number(e.target.value))}
                  className="w-16 bg-canvas-dark border border-border-dark rounded px-2 py-1 text-xs text-center text-white focus:outline-none"
                />
              </div>
            </div>

            {/* Simulation Run Button */}
            <button
              onClick={runSimulation}
              disabled={simulationRunning}
              className="w-full py-2.5 rounded bg-biscuit text-canvas-dark font-bold text-xs hover:bg-biscuit-dark disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-1.5 shadow-lg shadow-biscuit/10"
            >
              <Play className="w-3.5 h-3.5 fill-canvas-dark" />
              {simulationRunning ? "Simulating Traffic..." : "Execute Simulation"}
            </button>

            {/* Simulation Results Mini Panel */}
            {simulationResults.length > 0 && (
              <div className="mt-3 border-t border-border-dark/80 pt-3">
                <div className="text-[10px] uppercase font-bold tracking-wider text-gray-400 mb-2">
                  System Health Report
                </div>
                <div className="max-h-36 overflow-y-auto space-y-1.5 pr-1 text-xs">
                  {simulationResults.map((res) => {
                    const nodeDetail = nodes.find(n => n.id === res.id);
                    const isOverloaded = (res.utilization || 0) >= 100;
                    return (
                      <div
                        key={res.id}
                        className={`flex items-center justify-between p-1.5 rounded bg-canvas-dark/40 border border-border-dark/30 ${
                          isOverloaded ? "border-rose-500/20 bg-rose-500/5" : ""
                        }`}
                      >
                        <span className="font-medium text-gray-300 truncate max-w-[140px]">
                          {nodeDetail?.data?.name || res.id}
                        </span>
                        <div className="flex items-center gap-2 text-right">
                          <span className="text-[10px] text-gray-500">{(res.traffic || 0).toFixed(0)} RPS</span>
                          <span
                            className={`font-bold ${
                              isOverloaded
                                ? "text-rose-400"
                                : (res.utilization || 0) >= 80
                                ? "text-amber-400"
                                : "text-emerald-400"
                            }`}
                          >
                            {(res.utilization || 0).toFixed(0)}%
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </section>

      </div>
    </div>
  );
}
