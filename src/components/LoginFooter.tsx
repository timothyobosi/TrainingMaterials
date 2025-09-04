import { Box, Divider } from "@mui/material";
import type { FC } from "react";
import LoginFooterText from "./LoginFooterText";


const LoginFooter: FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <Box marginLeft={-18} marginTop={8} className="flex flex-col gap-2">
      <Divider />
      <Box marginLeft={18} className="flex justify-around">
        <Box className="flex gap-4 -ml-20">
          <LoginFooterText text="Terms of use" />
          <LoginFooterText text="|" />
          <LoginFooterText text="Privacy Policy" />
        </Box>
        <LoginFooterText text={`© ${currentYear} Britam Holdings PLC`} />
      </Box>
    </Box>
  );
};

export default LoginFooter;