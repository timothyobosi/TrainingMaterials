import { Box, Grid } from "@mui/material";
import type { FC, ReactElement } from "react";

interface LoginLayoutProps {
  component: ReactElement;
  footer: ReactElement;
}

const LoginLayout: FC<LoginLayoutProps> = ({ component, footer }) => {
  return (
    <Box
      sx={{
        width: "100%",
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        alignItems: "center",
        backgroundColor: "#f5f5f5", // light grey behind the white card
      }}
    >
      <Grid
        container
        sx={{
          flexGrow: 1,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Grid
          item
          xs={12}
          md={6}
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          {component}
        </Grid>
      </Grid>
      <Box width="100%" py={2}>
        {footer}
      </Box>
    </Box>
  );
};


export default LoginLayout;