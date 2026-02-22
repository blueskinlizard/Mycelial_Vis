import React from 'react';
import { motion } from 'framer-motion';
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingUp, Zap, Target, Activity } from 'lucide-react';
import { useLearningStore } from '@store/visualizationStore';
import { colorSchemes } from '@lib/colorSchemes';

export function LearningMetrics({ colorSchemeName = 'neural' }) {
  const { trainingData, currentEpisode, qTable } = useLearningStore();
  const colorScheme = colorSchemes[colorSchemeName] || colorSchemes.neural;
  
  const chartData = trainingData.epochs.map((epoch, i) => ({
    epoch,
    reward: trainingData.rewards[i] || 0,
    loss: trainingData.losses[i] || 0,
    exploration: trainingData.explorationRate[i] || 0,
  }));
  
  const stats = {
    avgReward: trainingData.rewards.length > 0
      ? trainingData.rewards.reduce((a, b) => a + b, 0) / trainingData.rewards.length
      : 0,
    maxReward: Math.max(...trainingData.rewards, 0),
    minReward: Math.min(...trainingData.rewards, 0),
    currentExploration: trainingData.explorationRate[trainingData.explorationRate.length - 1] || 0,
    qTableSize: Object.keys(qTable).length,
  };
  
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
        <TrendingUp size={28} />
        Learning Metrics
      </h2>
      
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '16px',
        marginBottom: '30px',
      }}>
        <StatCard
          icon={<Target size={20} />}
          label="Average Reward"
          value={stats.avgReward.toFixed(2)}
          colorScheme={colorScheme}
          color={colorScheme.signals.reinforcement}
        />
        
        <StatCard
          icon={<Zap size={20} />}
          label="Max Reward"
          value={stats.maxReward.toFixed(2)}
          colorScheme={colorScheme}
          color={colorScheme.energy.high}
        />
        
        <StatCard
          icon={<Activity size={20} />}
          label="Exploration Rate"
          value={`${(stats.currentExploration * 100).toFixed(1)}%`}
          colorScheme={colorScheme}
          color={colorScheme.signals.activation}
        />
        
        <StatCard
          icon={<Activity size={20} />}
          label="Q-Table Size"
          value={stats.qTableSize}
          colorScheme={colorScheme}
          color={colorScheme.nodes.processing}
        />
      </div>
      
      <ChartSection title="Training Rewards" colorScheme={colorScheme}>
        <ResponsiveContainer width="100%" height={250}>
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="rewardGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={colorScheme.signals.reinforcement} stopOpacity={0.8}/>
                <stop offset="95%" stopColor={colorScheme.signals.reinforcement} stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke={colorScheme.gridColor} />
            <XAxis
              dataKey="epoch"
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
            <Area
              type="monotone"
              dataKey="reward"
              stroke={colorScheme.signals.reinforcement}
              fillOpacity={1}
              fill="url(#rewardGradient)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </ChartSection>
      
      <ChartSection title="Training Metrics" colorScheme={colorScheme}>
        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke={colorScheme.gridColor} />
            <XAxis
              dataKey="epoch"
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
              dataKey="loss"
              stroke={colorScheme.signals.error}
              strokeWidth={2}
              dot={false}
              name="Loss"
            />
            <Line
              type="monotone"
              dataKey="exploration"
              stroke={colorScheme.signals.activation}
              strokeWidth={2}
              dot={false}
              name="Exploration Rate"
            />
          </LineChart>
        </ResponsiveContainer>
      </ChartSection>
      
      <div style={{
        marginTop: '30px',
        padding: '16px',
        background: `linear-gradient(135deg, ${colorScheme.gridColor} 0%, transparent 100%)`,
        borderRadius: '8px',
        border: `1px solid ${colorScheme.gridColor}`,
      }}>
        <div style={{
          fontSize: '14px',
          color: colorScheme.textSecondary,
          marginBottom: '8px',
        }}>
          Current Episode
        </div>
        <div style={{
          fontSize: '32px',
          fontWeight: 'bold',
          color: colorScheme.signals.reinforcement,
        }}>
          {currentEpisode}
        </div>
      </div>
    </div>
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

export default LearningMetrics;
