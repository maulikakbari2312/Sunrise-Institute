import React from 'react';
import { Box } from '@mui/material';

function CardBody(props) {
  const { children, ...rest } = props;

  return (
    <Box sx={{ /* Add your styling here */ }} {...rest} className={props.className}>
      {children}
    </Box>
  );
}

export default CardBody;

