import "./styles/main.scss";
import { router } from "./router.js";

window.addEventListener("popstate", () => {
  router(window.location.pathname);
});

router(window.location.pathname || "/");
