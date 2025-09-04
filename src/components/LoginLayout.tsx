import { Box, Grid } from "@mui/material";
import type { FC, ReactElement } from "react";

interface LoginLayoutProps {
  component: ReactElement;
  footer: ReactElement;
}

const LoginLayout: FC<LoginLayoutProps> = ({ component, footer }) => {
  return (
    <Box sx={{ width: "100%", minHeight: "100vh", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
      <Grid container spacing={2} sx={{ flexGrow: 1 }}>
        <Grid item xs={12} md={6} sx={{ display: "flex", justifyContent: "center", alignItems: "center", mx: "auto" }}>
          {component}
        </Grid>
      </Grid>
      <Box>{footer}</Box>
    </Box>
  );
};

export default LoginLayout;