import { Box } from "@mui/material";
import { styled } from "@mui/material/styles";
import { Outlet } from "react-router-dom";
import Header from "../components/generic/header";

const Root = styled("div", {
  label: "app-layout--root"
})(() => ({
  width: "100vw",
  height: "100vh",
  overflow: "hidden",
  display: "grid",
  gridTemplateRows: "auto 1fr",
  backgroundColor: "whitesmoke"
}));

const ViewContainer = styled(Box, {
  label: "app-layout--view-container"
})(() => ({
  display: "flex",
  flexDirection: "column",
  flex: 1,
  width: "100%",
  overflow: "auto"
}));

const AppLayout = () => (
  <Root>
    <Header />
    <ViewContainer>
      <Outlet />
    </ViewContainer>
  </Root>
);

export default AppLayout;