import { NavLink, Outlet } from 'react-router-dom';

export function Layout() {
  return (
    <div className="app">
      <header className="app-header">
        <NavLink to="/" className="brand">
          SPILAB
        </NavLink>
        <nav className="nav">
          <NavLink to="/" end>
            ホーム
          </NavLink>
          <NavLink to="/history">履歴</NavLink>
          <NavLink to="/generate">AI作成</NavLink>
          <NavLink to="/settings">設定</NavLink>
        </nav>
      </header>
      <main className="app-main">
        <Outlet />
      </main>
      <footer className="app-footer">学習履歴はこのブラウザに保存されます。サーバーには送信されません。</footer>
    </div>
  );
}
