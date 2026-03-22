import React from 'react';
import { motion } from 'framer-motion';
import * as Slider from '@radix-ui/react-slider';
import * as Switch from '@radix-ui/react-switch';
import * as Select from '@radix-ui/react-select';
import * as Tabs from '@radix-ui/react-tabs';
import { Settings, Palette, Layout, Activity, Zap } from 'lucide-react';
import { useVisualizationStore } from '@store/visualizationStore';
import { colorSchemes } from '@lib/colorSchemes';

export function ControlPanel() {
  const { settings, updateSettings, updatePhysics } = useVisualizationStore();
  
  const colorScheme = colorSchemes[settings.colorScheme] || colorSchemes.neural;
  
  return (
    <motion.div
      initial={{ x: -300 }}
      animate={{ x: 0 }}
      className="control-panel"
      style={{
        position: 'fixed',
        left: 0,
        top: 0,
        bottom: 0,
        width: '320px',
        background: 'rgba(0, 0, 0, 0.95)',
        borderRight: `1px solid ${colorScheme.gridColor}`,
        color: colorScheme.text,
        overflow: 'auto',
        zIndex: 100,
        fontFamily: "'JetBrains Mono', 'Courier New', monospace",
        fontSize: '13px',
      }}
    >
      <div style={{ padding: '20px' }}>
        <h2 style={{
          fontSize: '18px',
          fontWeight: 'bold',
          marginBottom: '20px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
        }}>
          <Settings size={20} />
          Visualization Controls
        </h2>
        
        <Tabs.Root defaultValue="appearance">
          <Tabs.List style={{
            display: 'flex',
            gap: '4px',
            marginBottom: '20px',
            borderBottom: `1px solid ${colorScheme.gridColor}`,
          }}>
            {['appearance', 'layout', 'physics', 'data'].map(tab => (
              <Tabs.Trigger
                key={tab}
                value={tab}
                style={{
                  padding: '8px 12px',
                  background: 'none',
                  border: 'none',
                  color: colorScheme.textSecondary,
                  cursor: 'pointer',
                  textTransform: 'capitalize',
                  borderBottom: '2px solid transparent',
                }}
                className="tab-trigger"
              >
                {tab}
              </Tabs.Trigger>
            ))}
          </Tabs.List>
          
          <Tabs.Content value="appearance">
            <Section title="Color Scheme" icon={<Palette size={16} />}>
              <SelectInput
                value={settings.colorScheme}
                onChange={(val) => updateSettings({ colorScheme: val })}
                options={Object.keys(colorSchemes).map(key => ({
                  value: key,
                  label: colorSchemes[key].name
                }))}
              />
            </Section>
            
            <Section title="Node Appearance">
              <Label>Color By</Label>
              <SelectInput
                value={settings.nodeColor}
                onChange={(val) => updateSettings({ nodeColor: val })}
                options={[
                  { value: 'type', label: 'Node Type' },
                  { value: 'activation', label: 'Activation Level' },
                  { value: 'energy', label: 'Energy Level' },
                  { value: 'specialization', label: 'Specialization' },
                ]}
              />
              
              <Label>Size By</Label>
              <SelectInput
                value={settings.nodeSize}
                onChange={(val) => updateSettings({ nodeSize: val })}
                options={[
                  { value: 'fixed', label: 'Fixed Size' },
                  { value: 'activation', label: 'Activation' },
                  { value: 'resource_level', label: 'Resource Level' },
                  { value: 'energy', label: 'Energy' },
                  { value: 'age', label: 'Age' },
                ]}
              />
              
              <Label>Opacity: {settings.nodeOpacity.toFixed(2)}</Label>
              <SliderInput
                value={[settings.nodeOpacity]}
                onChange={([val]) => updateSettings({ nodeOpacity: val })}
                min={0.1}
                max={1}
                step={0.1}
              />
              
              <SwitchInput
                label="Show Labels"
                checked={settings.showNodeLabels}
                onChange={(val) => updateSettings({ showNodeLabels: val })}
              />
            </Section>
            
            <Section title="Connection Appearance">
              <Label>Width By</Label>
              <SelectInput
                value={settings.connectionWidth}
                onChange={(val) => updateSettings({ connectionWidth: val })}
                options={[
                  { value: 'fixed', label: 'Fixed Width' },
                  { value: 'strength', label: 'Connection Strength' },
                ]}
              />
              
              <Label>Opacity: {settings.connectionOpacity.toFixed(2)}</Label>
              <SliderInput
                value={[settings.connectionOpacity]}
                onChange={([val]) => updateSettings({ connectionOpacity: val })}
                min={0.1}
                max={1}
                step={0.1}
              />
              
              <Label>Min Strength: {settings.minConnectionStrength.toFixed(2)}</Label>
              <SliderInput
                value={[settings.minConnectionStrength]}
                onChange={([val]) => updateSettings({ minConnectionStrength: val })}
                min={0}
                max={0.5}
                step={0.05}
              />
            </Section>
            
            <Section title="Effects">
              <SwitchInput
                label="Show Signals"
                checked={settings.showSignals}
                onChange={(val) => updateSettings({ showSignals: val })}
              />
              
              <SwitchInput
                label="Show Grid"
                checked={settings.showGrid}
                onChange={(val) => updateSettings({ showGrid: val })}
              />
              
              <SwitchInput
                label="Show Environment"
                checked={settings.showEnvironment}
                onChange={(val) => updateSettings({ showEnvironment: val })}
              />
            </Section>
          </Tabs.Content>
          
          <Tabs.Content value="layout">
            <Section title="Layout Type" icon={<Layout size={16} />}>
              <SelectInput
                value={settings.layoutType}
                onChange={(val) => updateSettings({ layoutType: val })}
                options={[
                  { value: 'force', label: 'Force-Directed' },
                  { value: 'spatial', label: 'Spatial (Use Coordinates)' },
                  { value: 'hierarchical', label: 'Hierarchical' },
                  { value: 'circular', label: 'Circular' },
                ]}
              />
            </Section>
            
            <Section title="Animation">
              <Label>Speed: {settings.animationSpeed.toFixed(1)}x</Label>
              <SliderInput
                value={[settings.animationSpeed]}
                onChange={([val]) => updateSettings({ animationSpeed: val })}
                min={0.1}
                max={3}
                step={0.1}
              />
              
              <SwitchInput
                label="Auto Rotate (3D)"
                checked={settings.autoRotate}
                onChange={(val) => updateSettings({ autoRotate: val })}
              />
            </Section>
          </Tabs.Content>
          
          <Tabs.Content value="physics">
            <Section title="Force Simulation" icon={<Activity size={16} />}>
              <SwitchInput
                label="Enable Physics"
                checked={settings.physics.enabled}
                onChange={(val) => updatePhysics({ enabled: val })}
              />
              
              <Label>Node Repulsion: {settings.physics.nodeRepulsion}</Label>
              <SliderInput
                value={[settings.physics.nodeRepulsion]}
                onChange={([val]) => updatePhysics({ nodeRepulsion: val })}
                min={50}
                max={1000}
                step={50}
              />
              
              <Label>Link Distance: {settings.physics.linkDistance}</Label>
              <SliderInput
                value={[settings.physics.linkDistance]}
                onChange={([val]) => updatePhysics({ linkDistance: val })}
                min={10}
                max={200}
                step={10}
              />
              
              <Label>Center Force: {settings.physics.centerForce.toFixed(2)}</Label>
              <SliderInput
                value={[settings.physics.centerForce]}
                onChange={([val]) => updatePhysics({ centerForce: val })}
                min={0}
                max={1}
                step={0.05}
              />
              
              <Label>Collision Radius: {settings.physics.collisionRadius}</Label>
              <SliderInput
                value={[settings.physics.collisionRadius]}
                onChange={([val]) => updatePhysics({ collisionRadius: val })}
                min={5}
                max={50}
                step={5}
              />
            </Section>
          </Tabs.Content>
          
          <Tabs.Content value="data">
            <Section title="Signal Visualization" icon={<Zap size={16} />}>
              <SwitchInput
                label="Show Signals"
                checked={settings.showSignals}
                onChange={(val) => updateSettings({ showSignals: val })}
              />
              
              <Label>Signal Speed: {settings.signalSpeed.toFixed(1)}x</Label>
              <SliderInput
                value={[settings.signalSpeed]}
                onChange={([val]) => updateSettings({ signalSpeed: val })}
                min={0.1}
                max={5}
                step={0.1}
              />
              
              <SwitchInput
                label="Signal Trails"
                checked={settings.signalTrails}
                onChange={(val) => updateSettings({ signalTrails: val })}
              />
            </Section>
          </Tabs.Content>
        </Tabs.Root>
      </div>
    </motion.div>
  );
}

function Section({ title, icon, children }) {
  const colorScheme = colorSchemes[useVisualizationStore(s => s.settings.colorScheme)];
  
  return (
    <div style={{
      marginBottom: '24px',
      paddingBottom: '16px',
      borderBottom: `1px solid ${colorScheme.gridColor}`,
    }}>
      <h3 style={{
        fontSize: '14px',
        fontWeight: 'bold',
        marginBottom: '12px',
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
      }}>
        {icon}
        {title}
      </h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {children}
      </div>
    </div>
  );
}

function Label({ children }) {
  const colorScheme = colorSchemes[useVisualizationStore(s => s.settings.colorScheme)];
  
  return (
    <div style={{
      fontSize: '12px',
      color: colorScheme.textSecondary,
      marginBottom: '4px',
    }}>
      {children}
    </div>
  );
}

function SliderInput({ value, onChange, min, max, step }) {
  const colorScheme = colorSchemes[useVisualizationStore(s => s.settings.colorScheme)];
  
  return (
    <Slider.Root
      value={value}
      onValueChange={onChange}
      min={min}
      max={max}
      step={step}
      style={{
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        userSelect: 'none',
        touchAction: 'none',
        width: '100%',
        height: '20px',
        cursor: 'pointer',
      }}
    >
      <Slider.Track style={{
        background: colorScheme.gridColor,
        position: 'relative',
        flexGrow: 1,
        borderRadius: '9999px',
        height: '4px',
        width: '100%',
      }}>
        <Slider.Range style={{
          position: 'absolute',
          background: colorScheme.connections.active,
          borderRadius: '9999px',
          height: '100%',
          left: 0,
        }} />
      </Slider.Track>
      <Slider.Thumb 
        style={{
          display: 'block',
          width: '16px',
          height: '16px',
          background: colorScheme.text,
          borderRadius: '50%',
          cursor: 'grab',
          boxShadow: '0 2px 4px rgba(0,0,0,0.3)',
          transition: 'box-shadow 0.15s ease',
        }}
        onMouseDown={(e) => e.currentTarget.style.cursor = 'grabbing'}
        onMouseUp={(e) => e.currentTarget.style.cursor = 'grab'}
      />
    </Slider.Root>
  );
}

function SwitchInput({ label, checked, onChange }) {
  const colorScheme = colorSchemes[useVisualizationStore(s => s.settings.colorScheme)];
  
  return (
    <div style={{ 
      display: 'flex', 
      alignItems: 'center', 
      gap: '10px',
      height: '28px',
    }}>
      <Switch.Root
        checked={checked}
        onCheckedChange={onChange}
        style={{
          all: 'unset',
          width: '42px',
          height: '24px',
          backgroundColor: checked ? colorScheme.connections.active : colorScheme.gridColor,
          borderRadius: '9999px',
          position: 'relative',
          cursor: 'pointer',
          WebkitTapHighlightColor: 'rgba(0, 0, 0, 0)',
          border: 'none',
          outline: 'none',
          flexShrink: 0,
        }}
      >
        <Switch.Thumb style={{
          display: 'block',
          width: '18px',
          height: '18px',
          backgroundColor: colorScheme.text,
          borderRadius: '50%',
          transition: 'transform 100ms ease',
          transform: checked ? 'translateX(21px)' : 'translateX(3px)',
          position: 'absolute',
          top: '3px',
          left: '0',
          willChange: 'transform',
        }} />
      </Switch.Root>
      <label 
        style={{ 
          fontSize: '13px', 
          cursor: 'pointer',
          userSelect: 'none',
          lineHeight: '1',
        }}
        onClick={() => onChange(!checked)}
      >
        {label}
      </label>
    </div>
  );
}

function SelectInput({ value, onChange, options }) {
  const colorScheme = colorSchemes[useVisualizationStore(s => s.settings.colorScheme)];
  
  return (
    <Select.Root value={value} onValueChange={onChange}>
      <Select.Trigger style={{
        width: '100%',
        padding: '8px 12px',
        background: colorScheme.gridColor,
        color: colorScheme.text,
        border: 'none',
        borderRadius: '4px',
        fontSize: '13px',
        cursor: 'pointer',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}>
        <Select.Value />
        <Select.Icon>▼</Select.Icon>
      </Select.Trigger>
      
      <Select.Portal>
        <Select.Content style={{
          background: 'rgba(0, 0, 0, 0.95)',
          border: `1px solid ${colorScheme.gridColor}`,
          borderRadius: '4px',
          padding: '4px',
          zIndex: 1000,
        }}>
          <Select.Viewport>
            {options.map(opt => (
              <Select.Item
                key={opt.value}
                value={opt.value}
                style={{
                  padding: '8px 12px',
                  color: colorScheme.text,
                  cursor: 'pointer',
                  borderRadius: '2px',
                  fontSize: '13px',
                }}
                className="select-item"
              >
                <Select.ItemText>{opt.label}</Select.ItemText>
              </Select.Item>
            ))}
          </Select.Viewport>
        </Select.Content>
      </Select.Portal>
    </Select.Root>
  );
}

export default ControlPanel;
