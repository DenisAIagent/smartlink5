import React, { useEffect, useRef, memo } from 'react';
import * as d3 from 'd3';
import { useTheme } from '@mui/material/styles';
import { Box, Paper, Typography } from '@mui/material';
import { useInView } from 'react-intersection-observer';

const InteractiveCharts = memo(({ data, type = 'line', title, height = 300 }) => {
  const svgRef = useRef(null);
  const theme = useTheme();
  const { ref, inView } = useInView({
    threshold: 0.1,
    triggerOnce: true
  });

  useEffect(() => {
    if (!inView || !data || !svgRef.current) return;

    const margin = { top: 20, right: 30, bottom: 30, left: 40 };
    const width = svgRef.current.clientWidth - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    // Nettoyage du SVG
    d3.select(svgRef.current).selectAll('*').remove();

    const svg = d3.select(svgRef.current)
      .attr('width', width + margin.left + margin.right)
      .attr('height', height)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Échelles
    const x = d3.scaleTime()
      .domain(d3.extent(data, d => new Date(d.timestamp)))
      .range([0, width]);

    const y = d3.scaleLinear()
      .domain([0, d3.max(data, d => d.value) * 1.1])
      .range([innerHeight, 0]);

    // Axes
    svg.append('g')
      .attr('transform', `translate(0,${innerHeight})`)
      .call(d3.axisBottom(x))
      .selectAll('text')
      .style('fill', theme.palette.text.secondary);

    svg.append('g')
      .call(d3.axisLeft(y))
      .selectAll('text')
      .style('fill', theme.palette.text.secondary);

    // Grille
    svg.append('g')
      .attr('class', 'grid')
      .call(d3.axisLeft(y)
        .tickSize(-width)
        .tickFormat('')
      )
      .style('stroke', theme.palette.divider)
      .style('stroke-opacity', 0.3);

    // Ligne ou zone
    if (type === 'line') {
      const line = d3.line()
        .x(d => x(new Date(d.timestamp)))
        .y(d => y(d.value))
        .curve(d3.curveMonotoneX);

      svg.append('path')
        .datum(data)
        .attr('fill', 'none')
        .attr('stroke', theme.palette.primary.main)
        .attr('stroke-width', 2)
        .attr('d', line);

      // Points interactifs
      svg.selectAll('circle')
        .data(data)
        .enter()
        .append('circle')
        .attr('cx', d => x(new Date(d.timestamp)))
        .attr('cy', d => y(d.value))
        .attr('r', 4)
        .attr('fill', theme.palette.primary.main)
        .on('mouseover', function(event, d) {
          d3.select(this)
            .attr('r', 6)
            .attr('fill', theme.palette.primary.dark);
          
          svg.append('text')
            .attr('class', 'tooltip')
            .attr('x', x(new Date(d.timestamp)))
            .attr('y', y(d.value) - 10)
            .attr('text-anchor', 'middle')
            .attr('fill', theme.palette.text.primary)
            .text(d.value.toFixed(2));
        })
        .on('mouseout', function() {
          d3.select(this)
            .attr('r', 4)
            .attr('fill', theme.palette.primary.main);
          
          svg.selectAll('.tooltip').remove();
        });
    } else if (type === 'area') {
      const area = d3.area()
        .x(d => x(new Date(d.timestamp)))
        .y0(innerHeight)
        .y1(d => y(d.value))
        .curve(d3.curveMonotoneX);

      svg.append('path')
        .datum(data)
        .attr('fill', theme.palette.primary.main)
        .attr('fill-opacity', 0.2)
        .attr('d', area);

      svg.append('path')
        .datum(data)
        .attr('fill', 'none')
        .attr('stroke', theme.palette.primary.main)
        .attr('stroke-width', 2)
        .attr('d', d3.line()
          .x(d => x(new Date(d.timestamp)))
          .y(d => y(d.value))
          .curve(d3.curveMonotoneX)
        );
    }

    // Animation d'entrée
    svg.selectAll('path, circle')
      .attr('opacity', 0)
      .transition()
      .duration(1000)
      .attr('opacity', 1);

  }, [data, type, height, theme, inView]);

  return (
    <Paper
      ref={ref}
      elevation={2}
      sx={{
        p: 2,
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        bgcolor: theme.palette.background.paper,
        transition: 'all 0.3s ease-in-out',
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: theme.shadows[4]
        }
      }}
    >
      <Typography variant="h6" gutterBottom>
        {title}
      </Typography>
      <Box
        ref={svgRef}
        sx={{
          flex: 1,
          minHeight: height,
          '& svg': {
            width: '100%',
            height: '100%'
          }
        }}
      />
    </Paper>
  );
});

InteractiveCharts.displayName = 'InteractiveCharts';

export default InteractiveCharts; 