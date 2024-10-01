import { WbSunny } from "@mui/icons-material";
import { AppBar, styled, Tab, Tabs, Toolbar } from "@mui/material";
import { useMatch, useNavigate } from "react-router-dom";

export const TabItem = styled(Tab, {
  label: "header--tab-item"
})(() => ({
  zIndex: 1,
  color: "white",
  textTransform: "none"
}));

const Header = () => {
  const navigate = useNavigate();
  const match = useMatch("/:route/*");

  type Path = "weather";
  const route: Path = (match?.params.route as Path) || "weather";

  return (
    <AppBar position="static" sx={{ p: 0, backgroundColor: "lighblue" }}>
      <Toolbar>
        <Tabs
          value={route}
          onChange={(_, value) => navigate(`/${value}`)}
          TabIndicatorProps={{ sx: { height: "100%", background: "white" } }}
        >
          <TabItem value="weather" label="Weather" icon={ <WbSunny/> }/>
        </Tabs>
      </Toolbar>
    </AppBar>
  );
};

export default Header;