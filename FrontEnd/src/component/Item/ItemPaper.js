import Paper from '@mui/material/Paper';
import { styled } from '@mui/material/styles';

const StyledPaper = styled(Paper)(({ theme }) => ({
    ...theme.typography.body2,
    textAlign: 'center',
    color: theme.palette.text.secondary,
    height: 'auto',
    lineHeight: '60px',
    padding: "20px",
}));

function ItemPaper({ children }) {
    return (
        <StyledPaper>
            {children}
        </StyledPaper>
    );
}

export default ItemPaper;
