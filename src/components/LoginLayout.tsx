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
                backgroundColor: "#f5f5f5",
            }}
        >
            {/* Center the login card */}
            <Grid
                container
                sx={{
                    flexGrow: 1,
                    display: "flex",
                    justifyContent: "center", // centers horizontally
                    alignItems: "center",     // centers vertically
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

            {/* Footer pinned at bottom */}
            <Box width="100%" py={2} mt="auto">
                {footer}
            </Box>
        </Box>
    );
};

export default LoginLayout;
