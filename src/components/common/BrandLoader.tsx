import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import "../../styles/loader.css";

export interface BrandLoaderProps {
  message?: string;
  size?: "small" | "medium" | "large";
  fullScreen?: boolean;
}

export function BrandLoader({
  message = "Loading...",
  size = "medium",
  fullScreen = false,
}: BrandLoaderProps) {
  const containerClass =
    size === "small"
      ? "logo-loader-sm"
      : size === "large"
      ? "logo-loader-lg"
      : "logo-loader";

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        p: size === "small" ? 1 : 3,
        minHeight: fullScreen ? "75vh" : size === "small" ? "auto" : 200,
        width: "100%",
      }}
    >
      <div className={containerClass}>
        <img src="/icon.svg" alt="Webliix" />
      </div>

      {message && (
        <Typography
          variant="body2"
          sx={{
            color: "text.secondary",
            fontWeight: 500,
            mt: 1.5,
            letterSpacing: "0.02em",
          }}
        >
          {message}
        </Typography>
      )}
    </Box>
  );
}

export default BrandLoader;
