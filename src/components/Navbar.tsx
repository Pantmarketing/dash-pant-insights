import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";

const NavLink = ({ to, label }: { to: string; label: string }) => {
  const location = useLocation();
  const isActive = location.pathname === to;
  return (
    <Link to={to} className={`px-3 py-2 rounded-md text-sm font-medium ${isActive ? "text-primary" : "text-muted-foreground"}`}>
      {label}
    </Link>
  );
};

const Navbar = () => {
  return (
    <header className="border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <nav className="container mx-auto flex items-center justify-between h-14">
        <Link to="/" className="font-bold">Dash Pant Marketing</Link>
        <div className="flex items-center gap-2">
          <NavLink to="/dashboard" label="Dashboard" />
          <NavLink to="/admin/clients" label="Clientes" />
          <Button asChild size="sm">
            <Link to="/dashboard">Entrar</Link>
          </Button>
        </div>
      </nav>
    </header>
  );
};

export default Navbar;
