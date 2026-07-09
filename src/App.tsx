import { BrowserRouter } from "react-router-dom";
import Router from "./app/router";

function App() {
  console.log("========== APP RENDER ==========");

  return (
    <BrowserRouter>
      <Router />
    </BrowserRouter>
  );
}

export default App;