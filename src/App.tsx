import { BrowserRouter } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import Router from "./app/router";


function App() {
  console.log("========== APP RENDER ==========");

  return (
    <BrowserRouter>
      <Toaster position="top-center" />
      <Router />
    </BrowserRouter>
  );
}

export default App;