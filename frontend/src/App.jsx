import { useState, useEffect } from "react";
import { ethers } from "ethers";
import LostFoundABI from "./LostFoundABI.json";

const CONTRACT_ADDRESS = "0xBAc142ba3da09BC01Fb26Df4FEd40367F177185d";

function App() {
  const [account, setAccount] = useState("");
  const [contract, setContract] = useState(null);
  const [itemTitle, setItemTitle] = useState("");
  const [itemDesc, setItemDesc] = useState("");
  const [items, setItems] = useState([]);

  // Connect to MetaMask
  const connectWallet = async () => {
    if (window.ethereum) {
      try {
        const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
        setAccount(accounts[0]);
        
        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        const lostFound = new ethers.Contract(CONTRACT_ADDRESS, LostFoundABI, signer);
        setContract(lostFound);
        
        // Fetch existing items
        const itemCount = await lostFound.getItemCount();
        const fetchedItems = [];
        for (let i = 1; i <= itemCount; i++) {
          const item = await lostFound.getItemById(i);
          fetchedItems.push({ id: i, title: item.title, description: item.description, owner: item.owner });
        }
        setItems(fetchedItems);
      } catch (err) {
        console.error("Connection error:", err);
      }
    } else {
      alert("Please install MetaMask!");
    }
  };

  // Report a lost item
  const reportLostItem = async () => {
    if (!contract || !itemTitle || !itemDesc) return;
    try {
      const tx = await contract.reportLostItem(itemTitle, itemDesc);
      await tx.wait();
      alert("Item reported successfully!");
      setItemTitle("");
      setItemDesc("");
      // Refresh items
      const itemCount = await contract.getItemCount();
      const fetchedItems = [];
      for (let i = 1; i <= itemCount; i++) {
        const item = await contract.getItemById(i);
        fetchedItems.push({ id: i, title: item.title, description: item.description, owner: item.owner });
      }
      setItems(fetchedItems);
    } catch (err) {
      console.error("Report error:", err);
      alert("Failed to report item");
    }
  };

  useEffect(() => {
    if (window.ethereum) {
      window.ethereum.on("accountsChanged", (accounts) => {
        setAccount(accounts[0] || "");
      });
    }
    return () => {
      if (window.ethereum) {
        window.ethereum.removeListener("accountsChanged", () => {});
      }
    };
  }, []);

  return (
    <div style={{ padding: "20px", fontFamily: "Arial" }}>
      <h1>🔍 Lost & Found DApp</h1>
      
      {!account ? (
        <button onClick={connectWallet} style={{ padding: "10px 20px", fontSize: "16px" }}>
          Connect MetaMask
        </button>
      ) : (
        <p>✅ Connected: {account.slice(0, 6)}...{account.slice(-4)}</p>
      )}

      {account && (
        <>
          <div style={{ margin: "20px 0", padding: "15px", border: "1px solid #ccc", borderRadius: "8px" }}>
            <h3>📝 Report a Lost Item</h3>
            <input
              type="text"
              placeholder="Item title"
              value={itemTitle}
              onChange={(e) => setItemTitle(e.target.value)}
              style={{ display: "block", width: "100%", padding: "8px", marginBottom: "10px" }}
            />
            <textarea
              placeholder="Description"
              value={itemDesc}
              onChange={(e) => setItemDesc(e.target.value)}
              style={{ display: "block", width: "100%", padding: "8px", marginBottom: "10px", minHeight: "60px" }}
            />
            <button onClick={reportLostItem} style={{ padding: "8px 16px", background: "#007bff", color: "white", border: "none", borderRadius: "4px" }}>
              Submit Report
            </button>
          </div>

          <div>
            <h3>📋 Reported Items</h3>
            {items.length === 0 ? (
              <p>No items reported yet.</p>
            ) : (
              items.map((item) => (
                <div key={item.id} style={{ padding: "10px", margin: "10px 0", border: "1px solid #eee", borderRadius: "4px" }}>
                  <strong>#{item.id}: {item.title}</strong>
                  <p>{item.description}</p>
                  <small>Owner: {item.owner.slice(0, 6)}...{item.owner.slice(-4)}</small>
                </div>
              ))
            )}
          </div>
        </>
      )}
    </div>
  );
}

export default App;