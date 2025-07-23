import React from 'react';
import Sidebar from './Sidebar/Sidebar';
import Header from './Header/Header';

const Layout = ({ children }) => {
  return (
    <div className="layout">
      <Header />
      <div className="layout-main">
        <Sidebar />
        <main className="layout-content">{children}</main>
      </div>
    </div>
  );
};

export default Layout;
