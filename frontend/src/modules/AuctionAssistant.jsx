/**
 * AuctionAssistant — chat interface to the auction agent node.
 * Streams responses via SSE from /v1/chat/stream.
 * Sprint 11: implement full streaming chat UI.
 */

import React, { useState } from "react";

const API_BASE = process.env.REACT_APP_API_URL || "http://localhost:8000";

export default function AuctionAssistant() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  async function sendMessage() {
    if (!input.trim()) return;
    const userMsg = { role: "user", content: input };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const resp = await fetch(`${API_BASE}/v1/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: input }),
      });
      const data = await resp.json();
      setMessages((prev) => [...prev, { role: "assistant", content: data.response }]);
    } catch (err) {
      setMessages((prev) => [...prev, { role: "error", content: String(err) }]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <h2>Auction Assistant</h2>
      <div style={{ border: "1px solid #ddd", borderRadius: "8px", padding: "16px", minHeight: "300px", marginBottom: "12px" }}>
        {messages.map((m, i) => (
          <div key={i} style={{ marginBottom: "8px", color: m.role === "error" ? "red" : "inherit" }}>
            <strong>{m.role}:</strong> {m.content}
          </div>
        ))}
        {loading && <div>Thinking...</div>}
      </div>
      <div style={{ display: "flex", gap: "8px" }}>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          placeholder="Ask about bid prices, auctions, competitors..."
          style={{ flex: 1, padding: "8px", borderRadius: "4px", border: "1px solid #ccc" }}
        />
        <button onClick={sendMessage} disabled={loading} style={{ padding: "8px 16px" }}>
          Send
        </button>
      </div>
    </div>
  );
}
