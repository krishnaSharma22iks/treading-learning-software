import Navbar from "./components/Navbar";
import Dashboard from "./pages/Dashboard";

function App() {
  return (
    <div className="bg-gray-950 min-h-screen">
      <Navbar />
      
      <div className="text-white">
        <Dashboard />
      </div>
    </div>
  );
}

export default App;