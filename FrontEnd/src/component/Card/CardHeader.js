import React from 'react';
import { Box } from '@mui/material';

function CardHeader(props) {
  const { children, ...rest } = props;

  return (
    <Box sx={{ /* Add your styling here */ }} {...rest}>
      {children}
    </Box>
  );
}

export default CardHeader;
