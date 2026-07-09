import { Outlet } from "react-router-dom";


import Footer from "../../components/layout/Footer";

function PublicLayout() {
  return (
    <>
    

      <main>
        <Outlet />
      </main>

      <Footer />
    </>
  );
}

export default PublicLayout;