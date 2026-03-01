export const colorSchemes = {
  // Blues and purples 
  neural: {
    name: 'Neural',
    background: '#0a0e1a',
    gridColor: '#1a1f35',
    
    nodes: {
      input: '#00f5ff',
      output: '#ff006e',
      regular: '#8338ec',
      storage: '#ffbe0b',
      processing: '#06ffa5',
      sensor: '#fb5607',
    },
    
    connections: {
      default: '#3a86ff',
      active: '#00f5ff',
      weak: '#1a1f35',
    },
    
    signals: {
      nutrient: '#06ffa5',
      danger: '#ff006e',
      reinforcement: '#ffbe0b',
      activation: '#00f5ff',
      error: '#ff006e',
    },
    
    activation: {
      low: '#1a1f35',
      medium: '#3a86ff',
      high: '#00f5ff',
    },
    
    energy: {
      low: '#ff006e',
      medium: '#ffbe0b',
      high: '#06ffa5',
    },
    
    text: '#e0e0e0',
    textSecondary: '#888888',
  },
  
  // Browns and greens
  organic: {
    name: 'Organic',
    background: '#0d0f0a',
    gridColor: '#1a1f15',
    
    nodes: {
      input: '#a4ac86',
      output: '#d4a574',
      regular: '#656d4a',
      storage: '#936639',
      processing: '#7f9172',
      sensor: '#b7b7a4',
    },
    
    connections: {
      default: '#414833',
      active: '#a4ac86',
      weak: '#1a1f15',
    },
    
    signals: {
      nutrient: '#a4ac86',
      danger: '#c1666b',
      reinforcement: '#d4a574',
      activation: '#7f9172',
      error: '#c1666b',
    },
    
    activation: {
      low: '#1a1f15',
      medium: '#414833',
      high: '#a4ac86',
    },
    
    energy: {
      low: '#c1666b',
      medium: '#d4a574',
      high: '#a4ac86',
    },
    
    text: '#dbd8b3',
    textSecondary: '#656d4a',
  },
  
  // Clean vis 
  scientific: {
    name: 'Scientific',
    background: '#ffffff',
    gridColor: '#e0e0e0',
    
    nodes: {
      input: '#0077b6',
      output: '#d62828',
      regular: '#495057',
      storage: '#f77f00',
      processing: '#06a77d',
      sensor: '#7209b7',
    },
    
    connections: {
      default: '#adb5bd',
      active: '#0077b6',
      weak: '#e9ecef',
    },
    
    signals: {
      nutrient: '#06a77d',
      danger: '#d62828',
      reinforcement: '#f77f00',
      activation: '#0077b6',
      error: '#d62828',
    },
    
    activation: {
      low: '#e9ecef',
      medium: '#adb5bd',
      high: '#0077b6',
    },
    
    energy: {
      low: '#d62828',
      medium: '#f77f00',
      high: '#06a77d',
    },
    
    text: '#212529',
    textSecondary: '#6c757d',
  },
  
  // Cyberpunk - neon on dark
  cyberpunk: {
    name: 'Cyberpunk',
    background: '#0f0f23',
    gridColor: '#1a1a3e',
    
    nodes: {
      input: '#ff00ff',
      output: '#00ffff',
      regular: '#7700ff',
      storage: '#ffff00',
      processing: '#00ff00',
      sensor: '#ff0080',
    },
    
    connections: {
      default: '#5500ff',
      active: '#ff00ff',
      weak: '#1a1a3e',
    },
    
    signals: {
      nutrient: '#00ff00',
      danger: '#ff0000',
      reinforcement: '#ffff00',
      activation: '#00ffff',
      error: '#ff0000',
    },
    
    activation: {
      low: '#1a1a3e',
      medium: '#5500ff',
      high: '#ff00ff',
    },
    
    energy: {
      low: '#ff0000',
      medium: '#ffff00',
      high: '#00ff00',
    },
    
    text: '#ffffff',
    textSecondary: '#9d9dff',
  },
  
  // Monochrome
  monochrome: {
    name: 'Monochrome',
    background: '#111111',
    gridColor: '#222222',
    
    nodes: {
      input: '#ffffff',
      output: '#cccccc',
      regular: '#888888',
      storage: '#aaaaaa',
      processing: '#999999',
      sensor: '#bbbbbb',
    },
    
    connections: {
      default: '#444444',
      active: '#ffffff',
      weak: '#222222',
    },
    
    signals: {
      nutrient: '#cccccc',
      danger: '#ffffff',
      reinforcement: '#aaaaaa',
      activation: '#999999',
      error: '#ffffff',
    },
    
    activation: {
      low: '#222222',
      medium: '#666666',
      high: '#ffffff',
    },
    
    energy: {
      low: '#444444',
      medium: '#888888',
      high: '#cccccc',
    },
    
    text: '#ffffff',
    textSecondary: '#888888',
  },
};

export function getNodeColor(node, colorMode, colorScheme) {
  const scheme = colorSchemes[colorScheme] || colorSchemes.neural;
  
  switch (colorMode) {
    case 'type':
      return scheme.nodes[node.type] || scheme.nodes.regular;
      
    case 'activation': {
      const activation = node.activation || 0;
      if (activation < 0.3) return scheme.activation.low;
      if (activation < 0.7) return scheme.activation.medium;
      return scheme.activation.high;
    }
    
    case 'energy': {
      const energy = node.energy || 0;
      if (energy < 0.3) return scheme.energy.low;
      if (energy < 0.7) return scheme.energy.medium;
      return scheme.energy.high;
    }
    
    case 'specialization':
      if (node.category && scheme.nodes[node.category]) {
        return scheme.nodes[node.category];
      }
      return scheme.nodes[node.type] || scheme.nodes.regular;
      
    default:
      return scheme.nodes[node.type] || scheme.nodes.regular;
  }
}

export function getConnectionColor(connection, colorScheme) {
  const scheme = colorSchemes[colorScheme] || colorSchemes.neural;
  const strength = connection.strength || 0;
  
  if (strength < 0.1) return scheme.connections.weak;
  if (strength > 0.7) return scheme.connections.active;
  return scheme.connections.default;
}

export function getSignalColor(signal, colorScheme) {
  const scheme = colorSchemes[colorScheme] || colorSchemes.neural;
  return scheme.signals[signal.type] || scheme.signals.activation;
}

export function interpolateColor(color1, color2, factor) {
  const c1 = hexToRgb(color1);
  const c2 = hexToRgb(color2);
  
  const r = Math.round(c1.r + (c2.r - c1.r) * factor);
  const g = Math.round(c1.g + (c2.g - c1.g) * factor);
  const b = Math.round(c1.b + (c2.b - c1.b) * factor);
  
  return rgbToHex(r, g, b);
}

function hexToRgb(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : { r: 0, g: 0, b: 0 };
}

function rgbToHex(r, g, b) {
  return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
}
