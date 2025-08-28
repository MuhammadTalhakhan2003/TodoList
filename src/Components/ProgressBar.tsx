import React from "react";
import { LinearProgress, Box, Typography } from "@mui/material";

interface Props {
  completed: number;
  total: number;
}

const ProgressBar: React.FC<Props> = ({ completed, total }) => {
  const progress = total > 0 ? Math.round((completed / total) * 100) : 0;

  return (
    <Box sx={{ my: 3 }}>
      <Typography variant="body2" sx={{ mb: 1 }}>
        Progress: {completed}/{total} tasks ({progress}%)
      </Typography>
      <LinearProgress
        variant="determinate"
        value={progress}
        sx={{ height: 10, borderRadius: 5 }}
      />
    </Box>
  );
};

export default ProgressBar;
