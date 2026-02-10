import { Box } from '@mui/material';

const Logo = ({ size = 40, color = "#2D334A" }) => (
  <Box component="svg" 
    viewBox="0 0 24 24" 
    sx={{ width: size, height: size, fill: 'none', stroke: color, strokeWidth: 1.5 }}
  >
    {/* Outer Circles */}
    <circle cx="12" cy="12" r="10" opacity="0.2" />
    <circle cx="12" cy="12" r="7" strokeDasharray="4 2" />
    {/* Inner Person Icon */}
    <path fill={color} d="M12 11a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5ZM12 12a4 4 0 0 0-4 4v.5c0 .28.22.5.5.5h7c.28 0 .5-.22.5-.5V16a4 4 0 0 0-4-4Z" />
    {/* Target Dots */}
    <circle cx="12" cy="2" r="1" fill={color} />
    <circle cx="12" cy="22" r="1" fill={color} />
    <circle cx="2" cy="12" r="1" fill={color} />
    <circle cx="22" cy="12" r="1" fill={color} />
  </Box>
);

export default Logo;