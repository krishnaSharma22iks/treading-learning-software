import { useState } from "react";
import Navbar from "./components/Navbar";
import Dashboard from "./pages/Dashboard";

function App() {
  const [isChartExpanded, setIsChartExpanded] = useState(false);

  return (
    <div className="bg-gray-950 min-h-screen">
      {!isChartExpanded && <Navbar />}
      
      <div className="text-white">
        <Dashboard isChartExpanded={isChartExpanded} setIsChartExpanded={setIsChartExpanded} />
      </div>
    </div>
  );
}

export default App;