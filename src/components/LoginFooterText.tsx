import { Typography } from "@mui/material";
import type { FC } from "react";

interface LoginFooterTextProps {
  text: string;
}

const LoginFooterText: FC<LoginFooterTextProps> = ({ text }) => {
  return (
    <Typography
      sx={{
        fontSize: "12px",
        opacity: 0.4,
      }}
    >
      {text}
    </Typography>
  );
};

export default LoginFooterText;