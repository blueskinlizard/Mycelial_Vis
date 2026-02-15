import { create } from 'zustand';

export const useVisualizationStore = create((set, get) => ({
  nodes: [],
  connections: [],
  signals: [],
  
  settings: {
    nodeSize: 'resource_level', // options are 'fixed' | 'activation' | 'resource_level' | 'energy' | 'age'
    nodeColor: 'type', // options are 'type' | 'activation' | 'energy' | 'specialization'
    nodeOpacity: 0.9,
    showNodeLabels: false,
    
    connectionWidth: 'strength', // options are 'fixed' | 'strength'
    connectionOpacity: 0.6,
    showConnectionLabels: false,
    minConnectionStrength: 0.05, 
    
    showSignals: true,
    signalSpeed: 1.0,
    signalTrails: true,
    
    layoutType: 'force', // options are 'force' | 'spatial' | 'hierarchical' | 'circular'
    physics: {
      enabled: true,
      nodeRepulsion: 300,
      linkDistance: 50,
      centerForce: 0.1,
      collisionRadius: 20,
    },
    
    zoomLevel: 1,
    panX: 0,
    panY: 0,
    
    animationSpeed: 1.0,
    autoRotate: false,
    
    colorScheme: 'neural', // options are 'neural' | 'organic' | 'scientific' | 'custom'
    customColors: {},
    
    showGrid: false,
    showEnvironment: true,
    show3D: false,
  },
  
  metrics: {
    nodeCount: 0,
    connectionCount: 0,
    averageActivation: 0,
    averageEnergy: 0,
    iteration: 0,
  },
  
  selectedNodes: [],
  selectedConnections: [],
  hoveredNode: null,
  hoveredConnection: null,
  
  timeline: {
    isPlaying: false,
    currentFrame: 0,
    totalFrames: 0,
    history: [],
  },
  
  environment: null,
  
  setNetworkData: (data) => set({ 
    networkData: data,
    nodes: data.nodes || [],
    connections: data.connections || [],
    metrics: data.metrics || get().metrics,
  }),
  
  updateSettings: (newSettings) => set((state) => ({
    settings: { ...state.settings, ...newSettings }
  })),
  
  updatePhysics: (physicsSettings) => set((state) => ({
    settings: {
      ...state.settings,
      physics: { ...state.settings.physics, ...physicsSettings }
    }
  })),
  
  selectNode: (nodeId) => set((state) => {
    const isSelected = state.selectedNodes.includes(nodeId);
    return {
      selectedNodes: isSelected
        ? state.selectedNodes.filter(id => id !== nodeId)
        : [...state.selectedNodes, nodeId]
    };
  }),
  
  clearSelection: () => set({ selectedNodes: [], selectedConnections: [] }),
  
  setHoveredNode: (nodeId) => set({ hoveredNode: nodeId }),
  
  setHoveredConnection: (connId) => set({ hoveredConnection: connId }),
  
  play: () => set((state) => ({
    timeline: { ...state.timeline, isPlaying: true }
  })),
  
  pause: () => set((state) => ({
    timeline: { ...state.timeline, isPlaying: false }
  })),
  
  seekToFrame: (frame) => set((state) => ({
    timeline: { ...state.timeline, currentFrame: frame }
  })),
  
  addToHistory: (snapshot) => set((state) => ({
    timeline: {
      ...state.timeline,
      history: [...state.timeline.history, snapshot],
      totalFrames: state.timeline.history.length + 1,
    }
  })),
  
  setEnvironment: (envData) => set({ environment: envData }),
  
  exportState: () => {
    const state = get();
    return {
      networkData: state.networkData,
      settings: state.settings,
      timeline: state.timeline,
    };
  },
  
  importState: (stateData) => {
    set({
      networkData: stateData.networkData,
      settings: stateData.settings || get().settings,
      timeline: stateData.timeline || get().timeline,
    });
  },
}));

export const useLearningStore = create((set) => ({
  trainingData: {
    epochs: [],
    rewards: [],
    losses: [],
    explorationRate: [],
  },
  
  currentEpisode: 0,
  qTable: {},
  
  setTrainingData: (data) => set({ trainingData: data }),
  setCurrentEpisode: (episode) => set({ currentEpisode: episode }),
  setQTable: (qTable) => set({ qTable }),
  
  addEpochData: (epoch, reward, loss, explorationRate) => set((state) => ({
    trainingData: {
      epochs: [...state.trainingData.epochs, epoch],
      rewards: [...state.trainingData.rewards, reward],
      losses: [...state.trainingData.losses, loss],
      explorationRate: [...state.trainingData.explorationRate, explorationRate],
    }
  })),
}));

export const useEcosystemStore = create((set) => ({
  organisms: [],
  populationHistory: [],
  energyFlow: {
    photosynthesis: 0,
    consumption: 0,
    decomposition: 0,
  },
  
  setOrganisms: (organisms) => set({ organisms }),
  setPopulationHistory: (history) => set({ populationHistory: history }),
  setEnergyFlow: (flow) => set({ energyFlow: flow }),
  
  addPopulationSnapshot: (snapshot) => set((state) => ({
    populationHistory: [...state.populationHistory, snapshot]
  })),
}));
