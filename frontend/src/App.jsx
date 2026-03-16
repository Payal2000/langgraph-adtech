import React, { useState } from "react";
import AuctionAssistant from "./modules/AuctionAssistant";
import BudgetOptimizer from "./modules/BudgetOptimizer";
import StrategyDashboard from "./modules/StrategyDashboard";
import MarketplaceSim from "./modules/MarketplaceSim";

const TABS = ["Auction Assistant", "Budget Optimizer", "Strategy Dashboard", "Marketplace Sim"];

export default function App() {
  const [activeTab, setActiveTab] = useState(0);

  return (
    <div style={{ fontFamily: "sans-serif", padding: "24px" }}>
      <h1>Ad Bidding Agent</h1>
      <nav style={{ display: "flex", gap: "12px", marginBottom: "24px" }}>
        {TABS.map((tab, i) => (
          <button
            key={tab}
            onClick={() => setActiveTab(i)}
            style={{
              padding: "8px 16px",
              background: activeTab === i ? "#0066cc" : "#eee",
              color: activeTab === i ? "#fff" : "#333",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
            }}
          >
            {tab}
          </button>
        ))}
      </nav>
      {activeTab === 0 && <AuctionAssistant />}
      {activeTab === 1 && <BudgetOptimizer />}
      {activeTab === 2 && <StrategyDashboard />}
      {activeTab === 3 && <MarketplaceSim />}
    </div>
  );
}
