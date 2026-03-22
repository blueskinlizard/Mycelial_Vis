import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { useVisualizationStore } from '@store/visualizationStore';
import { getNodeColor, getConnectionColor, colorSchemes } from '@lib/colorSchemes';

export function NetworkGraph({ width = 1200, height = 800, data }) {
  const svgRef = useRef(null);
  const simulationRef = useRef(null);
  const zoomRef = useRef(null);
  const [selectedNodeInfo, setSelectedNodeInfo] = useState(null);

  const {
    settings,
    selectedNodes,
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
      .filter((event) => {
        if (event.type === 'dblclick') return false;
        if (event.target.tagName === 'circle') return false;
        return !event.button;
      })
      .on('zoom', (event) => {
        container.attr('transform', event.transform);
      });

    zoomRef.current = zoom;
    svg.call(zoom).on('dblclick.zoom', null);

    const filteredConnections = data.connections.filter(
      c => c.strength >= settings.minConnectionStrength
    );

    const simulation = d3.forceSimulation(data.nodes)
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
      simulation.alpha(0);
    }

    const connections = connectionGroup
      .selectAll('line')
      .data(filteredConnections)
      .join('line')
      .attr('class', 'connection')
      .attr('stroke', d => getConnectionColor(d, settings.colorScheme))
      .attr('stroke-width', d =>
        settings.connectionWidth === 'strength' ? Math.max(0.5, d.strength * 4) : 2
      )
      .attr('stroke-opacity', settings.connectionOpacity)
      .attr('stroke-linecap', 'round');

    const getNodeSize = (node) => {
      const baseSize = 8;
      switch (settings.nodeSize) {
        case 'activation':     return baseSize * (0.5 + (node.activation || 0) * 1.5);
        case 'resource_level': return baseSize * (0.5 + (node.resource_level || 0) * 1.0);
        case 'energy':         return baseSize * (0.5 + (node.energy || 0) * 1.5);
        case 'age':            return baseSize * (0.5 + Math.min(1, (node.age || 0) / 100) * 1.5);
        default:               return baseSize;
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
      .attr('stroke', 'none')
      .attr('stroke-width', 0)
      .style('cursor', 'pointer')
      .call(d3.drag()
        .on('start', (event, d) => {
          event.sourceEvent.stopPropagation();
          if (!event.active) simulation.alphaTarget(0.3).restart();
          d.fx = d.x;
          d.fy = d.y;
        })
        .on('drag', (event, d) => {
          event.sourceEvent.stopPropagation();
          d.fx = event.x;
          d.fy = event.y;
        })
        .on('end', (event, d) => {
          event.sourceEvent.stopPropagation();
          if (!event.active) simulation.alphaTarget(0);
          if (settings.layoutType !== 'spatial') {
            d.fx = null;
            d.fy = null;
          }
        }))
      .on('click', (event, d) => {
        event.stopPropagation();
        selectNode(d.id);
        setSelectedNodeInfo(d);

        // Clear previous selection stroke
        nodeGroup.selectAll('circle')
          .attr('stroke', 'none')
          .attr('stroke-width', 0);

        // Highlight clicked node
        d3.select(event.currentTarget)
          .attr('stroke', colorScheme.connections.active)
          .attr('stroke-width', 3);

        // Zoom to the clicked node
        const scale = 3;
        const transform = d3.zoomIdentity
          .translate(width / 2, height / 2)
          .scale(scale)
          .translate(-d.x, -d.y);

        d3.select(svgRef.current)
          .transition()
          .duration(500)
          .call(zoom.transform, transform);
      })
      .on('mouseenter', (event, d) => {
        setHoveredNode(d.id);
        d3.select(event.currentTarget)
          .attr('stroke', '#ffffff')
          .attr('stroke-width', 2);
      })
      .on('mouseleave', (event, d) => {
        setHoveredNode(null);
        // Restore selection stroke if this node is selected, else remove
        const isSelected = selectedNodes.includes(d.id);
        d3.select(event.currentTarget)
          .attr('stroke', isSelected ? colorScheme.connections.active : 'none')
          .attr('stroke-width', isSelected ? 3 : 0);
      });

    nodes.on('wheel.zoom', (event) => {
      event.stopPropagation();
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

    return () => simulationRef.current?.stop();
  }, [data, settings]); // selectedNodes and hoveredNode both removed from deps

  return (
    <div className="relative" style={{ width, height }}>
      <svg
        ref={svgRef}
        width={width}
        height={height}
        style={{ background: colorScheme.background }}
      />

      {selectedNodeInfo && (
        <div
          className="absolute top-4 right-4"
          style={{
            background: 'rgba(0, 0, 0, 0.9)',
            border: `1px solid ${colorScheme.gridColor}`,
            borderRadius: '8px',
            padding: '12px',
            color: colorScheme.text,
            fontFamily: 'monospace',
            fontSize: '12px',
            minWidth: '200px',
            zIndex: 1000,
          }}
        >
          <div style={{ marginBottom: '8px', fontWeight: 'bold', fontSize: '14px' }}>
            Node #{selectedNodeInfo.id}
            <span
              onClick={() => setSelectedNodeInfo(null)}
              style={{ float: 'right', cursor: 'pointer', color: colorScheme.textSecondary }}
            >✕</span>
          </div>
          <div style={{ color: colorScheme.textSecondary }}>Type: {selectedNodeInfo.type}</div>
          <div style={{ color: colorScheme.textSecondary }}>Activation: {(selectedNodeInfo.activation || 0).toFixed(3)}</div>
          <div style={{ color: colorScheme.textSecondary }}>Energy: {(selectedNodeInfo.energy || 0).toFixed(3)}</div>
          <div style={{ color: colorScheme.textSecondary }}>Resources: {(selectedNodeInfo.resource_level || 0).toFixed(3)}</div>
          {selectedNodeInfo.age !== undefined && (
            <div style={{ color: colorScheme.textSecondary }}>Age: {selectedNodeInfo.age}</div>
          )}
          {selectedNodeInfo.category && selectedNodeInfo.category !== selectedNodeInfo.type && (
            <div style={{ color: colorScheme.textSecondary }}>Category: {selectedNodeInfo.category}</div>
          )}
        </div>
      )}
    </div>
  );
}

export default NetworkGraph;
