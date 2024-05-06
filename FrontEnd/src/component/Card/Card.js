import React from 'react';
import { Box } from '@mui/material';

function Card(props) {
  const { children, ...rest } = props;

  return (
    <Box  {...rest}>
      {children}
    </Box>
  );
}

export default Card;
