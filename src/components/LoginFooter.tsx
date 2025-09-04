import { Box, Divider } from "@mui/material";
import type { FC } from "react";
import LoginFooterText from "./LoginFooterText";


const LoginFooter: FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        px: 4,
        py: 1,
      }}
    >
      <Box className="flex gap-4">
        <LoginFooterText text="Terms of use" />
        <LoginFooterText text="|" />
        <LoginFooterText text="Privacy Policy" />
      </Box>
      <LoginFooterText text={`© ${currentYear} Britam Holdings PLC`} />
    </Box>
  );
};


export default LoginFooter;