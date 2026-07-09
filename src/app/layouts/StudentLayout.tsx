import { Outlet } from "react-router-dom";

import Header from "../../components/layout/Header";

function StudentLayout() {
  return (
    <>
      <Header />

      <main>
        <Outlet />
      </main>
    </>
  );
}

export default StudentLayout;