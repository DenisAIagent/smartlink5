import React, { memo, useCallback, useRef, useEffect } from 'react';
import { FixedSizeList as List } from 'react-window';
import { Box, Paper, Typography, useTheme } from '@mui/material';
import AutoSizer from 'react-virtualized-auto-sizer';

const VirtualizedList = memo(({
  items,
  height = 400,
  itemHeight = 50,
  renderItem,
  emptyMessage = 'Aucun élément à afficher',
  onScroll,
  className
}) => {
  const theme = useTheme();
  const listRef = useRef(null);

  const handleScroll = useCallback(({ scrollOffset, scrollUpdateWasRequested }) => {
    if (!scrollUpdateWasRequested && onScroll) {
      onScroll(scrollOffset);
    }
  }, [onScroll]);

  const Item = useCallback(({ index, style }) => {
    const item = items[index];
    return (
      <Box
        style={{
          ...style,
          padding: theme.spacing(1),
          borderBottom: `1px solid ${theme.palette.divider}`,
          transition: 'background-color 0.2s ease-in-out',
          '&:hover': {
            backgroundColor: theme.palette.action.hover
          }
        }}
      >
        {renderItem(item, index)}
      </Box>
    );
  }, [items, renderItem, theme]);

  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollToItem(0);
    }
  }, [items]);

  if (!items.length) {
    return (
      <Paper
        elevation={2}
        sx={{
          p: 2,
          height,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: theme.palette.background.paper
        }}
      >
        <Typography color="textSecondary">
          {emptyMessage}
        </Typography>
      </Paper>
    );
  }

  return (
    <Paper
      elevation={2}
      className={className}
      sx={{
        height,
        bgcolor: theme.palette.background.paper,
        overflow: 'hidden'
      }}
    >
      <AutoSizer>
        {({ width, height: autoHeight }) => (
          <List
            ref={listRef}
            height={autoHeight}
            itemCount={items.length}
            itemSize={itemHeight}
            width={width}
            onScroll={handleScroll}
            overscanCount={5}
          >
            {Item}
          </List>
        )}
      </AutoSizer>
    </Paper>
  );
});

VirtualizedList.displayName = 'VirtualizedList';

export default VirtualizedList; 