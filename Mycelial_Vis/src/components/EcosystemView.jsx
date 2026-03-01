import React from 'react';
import { motion } from 'framer-motion';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import { Leaf, Users, Zap, TrendingUp } from 'lucide-react';
import { useEcosystemStore } from '@store/visualizationStore';
import { colorSchemes } from '@lib/colorSchemes';
// Ecosystem vis showing organisms and flows 
export function EcosystemView({ colorSchemeName = 'organic' }) {
  const { organisms, populationHistory, energyFlow } = useEcosystemStore();
  const colorScheme = colorSchemes[colorSchemeName] || colorSchemes.organic;
  
  const organismCounts = organisms.reduce((acc, org) => {
    const type = org.type || 'unknown';
    acc[type] = (acc[type] || 0) + 1;
    return acc;
  }, {});
  
  const populationChartData = Object.entries(organismCounts).map(([type, count]) => ({
    type: type.charAt(0).toUpperCase() + type.slice(1),
    count,
  }));
  
  const organismColors = {
    plant: colorScheme.nodes.storage,
    herbivore: colorScheme.nodes.processing,
    carnivore: colorScheme.nodes.sensor,
    decomposer: colorScheme.nodes.input,
  };
  
  const energyFlowData = [
    { name: 'Photosynthesis', value: energyFlow.photosynthesis, color: colorScheme.energy.high },
    { name: 'Consumption', value: energyFlow.consumption, color: colorScheme.energy.medium },
    { name: 'Decomposition', value: energyFlow.decomposition, color: colorScheme.energy.low },
  ];
  
  const totalPopulation = organisms.length;
  const totalBiomass = organisms.reduce((sum, org) => sum + (org.size || 0), 0);
  const avgEnergy = organisms.length > 0
    ? organisms.reduce((sum, org) => sum + (org.energy || 0), 0) / organisms.length
    : 0;
  
  return (
    <div style={{
      background: colorScheme.background,
      color: colorScheme.text,
      padding: '20px',
      fontFamily: "'JetBrains Mono', monospace",
    }}>
      <h2 style={{
        fontSize: '24px',
        fontWeight: 'bold',
        marginBottom: '20px',
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
      }}>
        <Leaf size={28} />
        Ecosystem Dynamics
      </h2>
      
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '16px',
        marginBottom: '30px',
      }}>
        <StatCard
          icon={<Users size={20} />}
          label="Total Population"
          value={totalPopulation}
          colorScheme={colorScheme}
          color={colorScheme.nodes.regular}
        />
        
        <StatCard
          icon={<TrendingUp size={20} />}
          label="Total Biomass"
          value={totalBiomass.toFixed(2)}
          colorScheme={colorScheme}
          color={colorScheme.nodes.storage}
        />
        
        <StatCard
          icon={<Zap size={20} />}
          label="Average Energy"
          value={avgEnergy.toFixed(3)}
          colorScheme={colorScheme}
          color={colorScheme.energy.medium}
        />
        
        <StatCard
          icon={<Leaf size={20} />}
          label="Species Diversity"
          value={Object.keys(organismCounts).length}
          colorScheme={colorScheme}
          color={colorScheme.nodes.processing}
        />
      </div>
      
      <ChartSection title="Population by Type" colorScheme={colorScheme}>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={populationChartData}>
            <CartesianGrid strokeDasharray="3 3" stroke={colorScheme.gridColor} />
            <XAxis
              dataKey="type"
              stroke={colorScheme.textSecondary}
              style={{ fontSize: '12px' }}
            />
            <YAxis
              stroke={colorScheme.textSecondary}
              style={{ fontSize: '12px' }}
            />
            <Tooltip
              contentStyle={{
                background: 'rgba(0, 0, 0, 0.9)',
                border: `1px solid ${colorScheme.gridColor}`,
                borderRadius: '4px',
                color: colorScheme.text,
              }}
            />
            <Bar dataKey="count" radius={[8, 8, 0, 0]}>
              {populationChartData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={organismColors[entry.type.toLowerCase()] || colorScheme.nodes.regular}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </ChartSection>
      
      <ChartSection title="Energy Flow" colorScheme={colorScheme}>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={energyFlowData} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" stroke={colorScheme.gridColor} />
            <XAxis
              type="number"
              stroke={colorScheme.textSecondary}
              style={{ fontSize: '12px' }}
            />
            <YAxis
              type="category"
              dataKey="name"
              stroke={colorScheme.textSecondary}
              style={{ fontSize: '12px' }}
            />
            <Tooltip
              contentStyle={{
                background: 'rgba(0, 0, 0, 0.9)',
                border: `1px solid ${colorScheme.gridColor}`,
                borderRadius: '4px',
                color: colorScheme.text,
              }}
            />
            <Bar dataKey="value" radius={[0, 8, 8, 0]}>
              {energyFlowData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </ChartSection>
      
      {populationHistory.length > 0 && (
        <ChartSection title="Population Over Time" colorScheme={colorScheme}>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={populationHistory}>
              <CartesianGrid strokeDasharray="3 3" stroke={colorScheme.gridColor} />
              <XAxis
                dataKey="time"
                stroke={colorScheme.textSecondary}
                style={{ fontSize: '12px' }}
              />
              <YAxis
                stroke={colorScheme.textSecondary}
                style={{ fontSize: '12px' }}
              />
              <Tooltip
                contentStyle={{
                  background: 'rgba(0, 0, 0, 0.9)',
                  border: `1px solid ${colorScheme.gridColor}`,
                  borderRadius: '4px',
                  color: colorScheme.text,
                }}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="by_type.plant"
                stroke={organismColors.plant}
                strokeWidth={2}
                dot={false}
                name="Plants"
              />
              <Line
                type="monotone"
                dataKey="by_type.herbivore"
                stroke={organismColors.herbivore}
                strokeWidth={2}
                dot={false}
                name="Herbivores"
              />
              <Line
                type="monotone"
                dataKey="by_type.decomposer"
                stroke={organismColors.decomposer}
                strokeWidth={2}
                dot={false}
                name="Decomposers"
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartSection>
      )}
      
      <div style={{ marginTop: '30px' }}>
        <h3 style={{
          fontSize: '16px',
          fontWeight: 'bold',
          marginBottom: '12px',
        }}>
          Current Organisms
        </h3>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
          gap: '12px',
        }}>
          {organisms.slice(0, 20).map((org, idx) => (
            <OrganismCard key={org.id || idx} organism={org} colorScheme={colorScheme} />
          ))}
        </div>
        {organisms.length > 20 && (
          <div style={{
            marginTop: '12px',
            fontSize: '12px',
            color: colorScheme.textSecondary,
            textAlign: 'center',
          }}>
            ... and {organisms.length - 20} more organisms
          </div>
        )}
      </div>
    </div>
  );
}

function OrganismCard({ organism, colorScheme }) {
  const typeColor = {
    plant: colorScheme.nodes.storage,
    herbivore: colorScheme.nodes.processing,
    carnivore: colorScheme.nodes.sensor,
    decomposer: colorScheme.nodes.input,
  }[organism.type] || colorScheme.nodes.regular;
  
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      style={{
        padding: '12px',
        background: `linear-gradient(135deg, ${colorScheme.gridColor} 0%, transparent 100%)`,
        borderRadius: '6px',
        border: `1px solid ${colorScheme.gridColor}`,
        borderLeft: `3px solid ${typeColor}`,
      }}
    >
      <div style={{
        fontSize: '11px',
        color: typeColor,
        textTransform: 'uppercase',
        fontWeight: 'bold',
        marginBottom: '4px',
      }}>
        {organism.type}
      </div>
      <div style={{
        fontSize: '10px',
        color: colorScheme.textSecondary,
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '4px',
      }}>
        <div>Energy: {(organism.energy || 0).toFixed(2)}</div>
        <div>Size: {(organism.size || 0).toFixed(2)}</div>
        {organism.age !== undefined && <div>Age: {organism.age.toFixed(0)}</div>}
      </div>
    </motion.div>
  );
}

function StatCard({ icon, label, value, colorScheme, color }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      style={{
        padding: '16px',
        background: `linear-gradient(135deg, ${colorScheme.gridColor} 0%, transparent 100%)`,
        borderRadius: '8px',
        border: `1px solid ${colorScheme.gridColor}`,
      }}
    >
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        marginBottom: '8px',
        color: colorScheme.textSecondary,
        fontSize: '12px',
      }}>
        {icon}
        {label}
      </div>
      <div style={{
        fontSize: '28px',
        fontWeight: 'bold',
        color: color,
      }}>
        {value}
      </div>
    </motion.div>
  );
}

function ChartSection({ title, children, colorScheme }) {
  return (
    <div style={{ marginBottom: '30px' }}>
      <h3 style={{
        fontSize: '16px',
        fontWeight: 'bold',
        marginBottom: '12px',
        color: colorScheme.text,
      }}>
        {title}
      </h3>
      <div style={{
        background: `linear-gradient(135deg, ${colorScheme.gridColor} 0%, transparent 100%)`,
        padding: '20px',
        borderRadius: '8px',
        border: `1px solid ${colorScheme.gridColor}`,
      }}>
        {children}
      </div>
    </div>
  );
}

export default EcosystemView;
