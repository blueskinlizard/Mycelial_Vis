import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { motion, AnimatePresence } from 'framer-motion';
import { useVisualizationStore } from '@store/visualizationStore';
import { getNodeColor, getConnectionColor, colorSchemes } from '@lib/colorSchemes';

// Main network vis component where we handle connections, anims, etc. 
export function NetworkGraph({ width = 1200, height = 800, data }) {
  const svgRef = useRef(null);
  const simulationRef = useRef(null);
  const [tooltip, setTooltip] = useState(null);
  
  const {
    settings,
    selectedNodes,
    hoveredNode,
    selectNode,
    setHoveredNode,
  } = useVisualizationStore();
  
  const colorScheme = colorSchemes[settings.colorScheme] || colorSchemes.neural;
  
  useEffect(() => {
    if (!data || !data.nodes || !data.connections) return;
    
    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const container = svg.append('g').attr('class', 'zoom-container');
    const connectionGroup = container.append('g').attr('class', 'connections');
    const nodeGroup = container.append('g').attr('class', 'nodes');
    const labelGroup = container.append('g').attr('class', 'labels');
    
    const zoom = d3.zoom()
      .scaleExtent([0.1, 10])
      .on('zoom', (event) => {
        container.attr('transform', event.transform);
      });
    
    svg.call(zoom);
    
    const filteredConnections = data.connections.filter(
      c => c.strength >= settings.minConnectionStrength
    );
    
    const simulation = d3.forceSimulation(data.nodes) // Use d3 force sim 
      .force('link', d3.forceLink(filteredConnections)
        .id(d => d.id)
        .distance(settings.physics.linkDistance)
        .strength(c => c.strength * 0.5))
      .force('charge', d3.forceManyBody()
        .strength(-settings.physics.nodeRepulsion))
      .force('center', d3.forceCenter(width / 2, height / 2)
        .strength(settings.physics.centerForce))
      .force('collision', d3.forceCollide()
        .radius(settings.physics.collisionRadius));
    
    simulationRef.current = simulation;
    
    if (settings.layoutType === 'spatial' && data.nodes[0].position) {
      data.nodes.forEach(node => {
        node.x = node.position[0] * width;
        node.y = node.position[1] * height;
        node.fx = node.x; 
        node.fy = node.y;
      });
      simulation.alpha(0); // Stop simulation
    }
    
    const connections = connectionGroup
      .selectAll('line')
      .data(filteredConnections)
      .join('line')
      .attr('class', 'connection')
      .attr('stroke', d => getConnectionColor(d, settings.colorScheme))
      .attr('stroke-width', d => {
        if (settings.connectionWidth === 'strength') {
          return Math.max(0.5, d.strength * 4);
        }
        return 2;
      })
      .attr('stroke-opacity', settings.connectionOpacity)
      .attr('stroke-linecap', 'round');
    
    const getNodeSize = (node) => {
      const baseSize = 8;
      switch (settings.nodeSize) {
        case 'activation':
          return baseSize * (0.5 + (node.activation || 0) * 1.5);
        case 'resource_level':
          return baseSize * (0.5 + (node.resource_level || 0) * 1.0);
        case 'energy':
          return baseSize * (0.5 + (node.energy || 0) * 1.5);
        case 'age':
          return baseSize * (0.5 + Math.min(1, (node.age || 0) / 100) * 1.5);
        default:
          return baseSize;
      }
    };
    
    const nodes = nodeGroup
      .selectAll('circle')
      .data(data.nodes)
      .join('circle')
      .attr('class', 'node')
      .attr('r', getNodeSize)
      .attr('fill', d => getNodeColor(d, settings.nodeColor, settings.colorScheme))
      .attr('fill-opacity', settings.nodeOpacity)
      .attr('stroke', d => {
        if (selectedNodes.includes(d.id)) return colorScheme.connections.active;
        if (hoveredNode === d.id) return '#ffffff';
        return 'none';
      })
      .attr('stroke-width', d => {
        if (selectedNodes.includes(d.id)) return 3;
        if (hoveredNode === d.id) return 2;
        return 0;
      })
      .style('cursor', 'pointer')
      .call(d3.drag()
        .on('start', dragstarted)
        .on('drag', dragged)
        .on('end', dragended))
      .on('click', (event, d) => {
        event.stopPropagation();
        selectNode(d.id);
      })
      .on('mouseenter', (event, d) => {
        setHoveredNode(d.id);
        setTooltip({
          x: event.pageX,
          y: event.pageY,
          node: d,
        });
      })
      .on('mouseleave', () => {
        setHoveredNode(null);
        setTooltip(null);
      });
    
    if (settings.showNodeLabels) {
      labelGroup
        .selectAll('text')
        .data(data.nodes)
        .join('text')
        .attr('class', 'node-label')
        .attr('text-anchor', 'middle')
        .attr('dy', d => getNodeSize(d) + 12)
        .attr('fill', colorScheme.text)
        .attr('font-size', '10px')
        .attr('font-family', 'monospace')
        .attr('pointer-events', 'none')
        .text(d => `#${d.id}`);
    }
    
    simulation.on('tick', () => {
      connections
        .attr('x1', d => d.source.x)
        .attr('y1', d => d.source.y)
        .attr('x2', d => d.target.x)
        .attr('y2', d => d.target.y);
      
      nodes
        .attr('cx', d => d.x)
        .attr('cy', d => d.y);
      
      if (settings.showNodeLabels) {
        labelGroup.selectAll('text')
          .attr('x', d => d.x)
          .attr('y', d => d.y);
      }
    });
    
    function dragstarted(event, d) {
      if (!event.active) simulation.alphaTarget(0.3).restart();
      d.fx = d.x;
      d.fy = d.y;
    }
    
    function dragged(event, d) {
      d.fx = event.x;
      d.fy = event.y;
    }
    
    function dragended(event, d) {
      if (!event.active) simulation.alphaTarget(0);
      if (settings.layoutType !== 'spatial') {
        d.fx = null;
        d.fy = null;
      }
    }
    
    return () => {
      if (simulationRef.current) {
        simulationRef.current.stop();
      }
    };
  }, [data, settings, selectedNodes, hoveredNode]);
  
  return (
    <div className="relative" style={{ width, height }}>
      <svg
        ref={svgRef}
        width={width}
        height={height}
        style={{ background: colorScheme.background }}
      />
      
      <AnimatePresence>
        {tooltip && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="absolute pointer-events-none"
            style={{
              left: tooltip.x + 10,
              top: tooltip.y + 10,
              background: 'rgba(0, 0, 0, 0.9)',
              border: `1px solid ${colorScheme.gridColor}`,
              borderRadius: '8px',
              padding: '12px',
              color: colorScheme.text,
              fontFamily: 'monospace',
              fontSize: '12px',
              maxWidth: '250px',
              zIndex: 1000,
            }}
          >
            <div style={{ marginBottom: '6px', fontWeight: 'bold' }}>
              Node #{tooltip.node.id}
            </div>
            <div style={{ color: colorScheme.textSecondary }}>
              Type: {tooltip.node.type}
            </div>
            <div style={{ color: colorScheme.textSecondary }}>
              Activation: {(tooltip.node.activation || 0).toFixed(3)}
            </div>
            <div style={{ color: colorScheme.textSecondary }}>
              Energy: {(tooltip.node.energy || 0).toFixed(3)}
            </div>
            <div style={{ color: colorScheme.textSecondary }}>
              Resources: {(tooltip.node.resource_level || 0).toFixed(3)}
            </div>
            {tooltip.node.age !== undefined && (
              <div style={{ color: colorScheme.textSecondary }}>
                Age: {tooltip.node.age}
              </div>
            )}
            {tooltip.node.category && tooltip.node.category !== tooltip.node.type && (
              <div style={{ color: colorScheme.textSecondary }}>
                Category: {tooltip.node.category}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default NetworkGraph;
