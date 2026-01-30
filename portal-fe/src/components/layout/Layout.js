import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';

export default function Layout() {
  return (
    <>
      <Sidebar />
      <Header />
      <main className="main-content">
        <Outlet />
      </main>
    </>
  );
}
