import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import NetworkGraph from '@components/NetworkGraph';
import ControlPanel from '@components/ControlPanel';
import LearningMetrics from '@components/LearningMetrics';
import EcosystemView from '@components/EcosystemView';
import { useVisualizationStore, useLearningStore, useEcosystemStore } from '@store/visualizationStore';
import { Network, TrendingUp, Leaf, Menu, X } from 'lucide-react';
import { colorSchemes } from '@lib/colorSchemes';
import './App.css';

function App() {
  const [activeView, setActiveView] = useState('network');
  const [showControls, setShowControls] = useState(true);
  const { settings, setNetworkData } = useVisualizationStore();
  const { setTrainingData, setCurrentEpisode, setQTable } = useLearningStore();
  const { setOrganisms, setPopulationHistory, setEnergyFlow } = useEcosystemStore();
  const colorScheme = colorSchemes[settings.colorScheme] || colorSchemes.neural;
  
  useEffect(() => {
    loadNetworkData();
    loadLearningData();
    loadEcosystemData();
  }, []);
  
  const loadNetworkData = async () => {
    try {
      const response = await fetch('/network_data.json');
      if (response.ok) {
        const data = await response.json();
        setNetworkData(data);
        console.log('Loaded network from network_data.json');
        return;
      }
    } catch (error) {
      console.log('No network_data.json found, trying trained_network.json...');
    }
    
    try {
      const response = await fetch('/trained_network.json');
      if (response.ok) {
        const data = await response.json();
        setNetworkData(data);
        console.log('Loaded network from trained_network.json');
        return;
      }
    } catch (error) {
      console.log('No trained_network.json found, trying adaptive_network.json...');
    }
    
    try {
      const response = await fetch('/adaptive_network.json');
      if (response.ok) {
        const data = await response.json();
        setNetworkData(data);
        console.log('Loaded network from adaptive_network.json');
        return;
      }
    } catch (error) {
      console.log('No network data found. Run a demo script to generate data:');
      console.log('  python generate_network_demo.py');
      console.log('  python train_network_demo.py');
      console.log('  python adaptive_network_demo.py');
    }
  };
  
  const loadLearningData = async () => {
    try {
      const response = await fetch('/learning_data.json');
      if (response.ok) {
        const data = await response.json();
        if (data.trainingData) {
          setTrainingData(data.trainingData);
        }
        if (data.currentEpisode) {
          setCurrentEpisode(data.currentEpisode);
        }
        if (data.qTable) {
          setQTable(data.qTable);
        }
        console.log('Loaded learning data');
      }
    } catch (error) {
      console.log('No learning data found');
    }
  };
  
  const loadEcosystemData = async () => {
    try {
      const response = await fetch('/ecosystem_data.json');
      if (response.ok) {
        const data = await response.json();
        if (data.organisms) {
          setOrganisms(data.organisms);
        }
        if (data.populationHistory) {
          setPopulationHistory(data.populationHistory);
        }
        if (data.energyFlow) {
          setEnergyFlow(data.energyFlow);
        }
        console.log('Loaded ecosystem data');
      }
    } catch (error) {
      console.log('No ecosystem data found');
    }
  };
  
  return (
    <div style={{
      width: '100vw',
      height: '100vh',
      background: colorScheme.background,
      color: colorScheme.text,
      fontFamily: "'JetBrains Mono', 'Courier New', monospace",
      overflow: 'hidden',
    }}>
      {/* Top Navigation */}
      <motion.div
        initial={{ y: -60 }}
        animate={{ y: 0 }}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          height: '60px',
          background: 'rgba(0, 0, 0, 0.95)',
          borderBottom: `1px solid ${colorScheme.gridColor}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 20px',
          zIndex: 200,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <h1 style={{
            fontSize: '20px',
            fontWeight: 'bold',
            background: `linear-gradient(135deg, ${colorScheme.connections.active} 0%, ${colorScheme.nodes.processing} 100%)`,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}>
            Mycelium Network Visualizer
          </h1>
          
          <div style={{ display: 'flex', gap: '8px' }}>
            <TabButton
              icon={<Network size={18} />}
              label="Network"
              active={activeView === 'network'}
              onClick={() => setActiveView('network')}
              colorScheme={colorScheme}
            />
            <TabButton
              icon={<TrendingUp size={18} />}
              label="Learning"
              active={activeView === 'learning'}
              onClick={() => setActiveView('learning')}
              colorScheme={colorScheme}
            />
            <TabButton
              icon={<Leaf size={18} />}
              label="Ecosystem"
              active={activeView === 'ecosystem'}
              onClick={() => setActiveView('ecosystem')}
              colorScheme={colorScheme}
            />
          </div>
        </div>
        
        <button
          onClick={() => setShowControls(!showControls)}
          style={{
            background: 'none',
            border: `1px solid ${colorScheme.gridColor}`,
            borderRadius: '4px',
            padding: '8px 12px',
            color: colorScheme.text,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '13px',
          }}
        >
          {showControls ? <X size={18} /> : <Menu size={18} />}
          {showControls ? 'Hide' : 'Show'} Controls
        </button>
      </motion.div>
      
      {/* Main Content Area */}
      <div style={{
        marginTop: '60px',
        height: 'calc(100vh - 60px)',
        display: 'flex',
      }}>
        {/* Control Panel */}
        <AnimatePresence>
          {showControls && activeView === 'network' && <ControlPanel />}
        </AnimatePresence>
        
        {/* View Container */}
        <div style={{
          flex: 1,
          marginLeft: showControls && activeView === 'network' ? '320px' : '0',
          transition: 'margin-left 0.3s ease',
          overflow: 'auto',
        }}>
          <AnimatePresence mode="wait">
            {activeView === 'network' && (
              <motion.div
                key="network"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                style={{
                  width: '100%',
                  height: '100%',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
              >
                <NetworkGraph
                  width={window.innerWidth - (showControls ? 320 : 0)}
                  height={window.innerHeight - 60}
                  data={useVisualizationStore.getState().networkData}
                />
              </motion.div>
            )}
            
            {activeView === 'learning' && (
              <motion.div
                key="learning"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <LearningMetrics colorSchemeName={settings.colorScheme} />
              </motion.div>
            )}
            
            {activeView === 'ecosystem' && (
              <motion.div
                key="ecosystem"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <EcosystemView colorSchemeName={settings.colorScheme} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

function TabButton({ icon, label, active, onClick, colorScheme }) {
  return (
    <button
      onClick={onClick}
      style={{
        background: active ? colorScheme.gridColor : 'none',
        border: `1px solid ${active ? colorScheme.connections.active : colorScheme.gridColor}`,
        borderRadius: '4px',
        padding: '8px 16px',
        color: active ? colorScheme.connections.active : colorScheme.textSecondary,
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        fontSize: '13px',
        transition: 'all 0.2s ease',
      }}
      onMouseEnter={(e) => {
        if (!active) {
          e.target.style.borderColor = colorScheme.text;
          e.target.style.color = colorScheme.text;
        }
      }}
      onMouseLeave={(e) => {
        if (!active) {
          e.target.style.borderColor = colorScheme.gridColor;
          e.target.style.color = colorScheme.textSecondary;
        }
      }}
    >
      {icon}
      {label}
    </button>
  );
}

export default App;
