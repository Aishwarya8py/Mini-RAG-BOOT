import { useState } from "react";

function App() {
  const [file, setFile] = useState(null);
  const [textInput, setTextInput] = useState(""); // NEW
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [sources, setSources] = useState([]);
  const [status, setStatus] = useState("");

  // -------- Upload Document or Text --------
  const handleUpload = async () => {
    let textToSend = "";

    if (textInput.trim()) {
      // Use pasted text
      textToSend = textInput;
    } else if (file) {
      // Use uploaded file
      textToSend = await file.text();
    } else {
      alert("Please upload a file or paste text");
      return;
    }

    setStatus("Uploading document...");

    await fetch("http://127.0.0.1:8000/upload", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ text: textToSend })
    });

    setStatus("Document uploaded successfully");
  };

  // -------- Ask Question --------
  const handleQuery = async () => {
    if (!question.trim()) {
      alert("Please enter a question");
      return;
    }

    setStatus("Fetching answer...");

    const response = await fetch("http://127.0.0.1:8000/query", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ query: question })
    });

    const data = await response.json();

    setAnswer(data.answer);
    setSources(data.sources);
    setStatus("");
  };

  return (
    <div style={{ padding: "30px", maxWidth: "900px", margin: "auto" }}>
      <h2>Mini RAG App</h2>

      {/* File Upload */}
      <div style={{ marginBottom: "10px" }}>
        <input
          type="file"
          accept=".txt"
          onChange={(e) => setFile(e.target.files[0])}
        />
      </div>

      {/* OR Text Input */}
      <div style={{ marginBottom: "10px" }}>
        <textarea
          rows="6"
          style={{ width: "100%", padding: "8px" }}
          placeholder="Or paste / type your text here..."
          value={textInput}
          onChange={(e) => setTextInput(e.target.value)}
        />
      </div>

      <button onClick={handleUpload}>Upload</button>

      <hr style={{ margin: "30px 0" }} />

      {/* Question Input */}
      <div style={{ marginBottom: "10px" }}>
        <input
          type="text"
          placeholder="Ask a question..."
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          style={{ width: "70%", padding: "6px" }}
        />
        <button onClick={handleQuery} style={{ marginLeft: "10px" }}>
          Ask
        </button>
      </div>

      {status && <p><i>{status}</i></p>}

      {/* Answer */}
      {answer && (
        <div>
          <h3>Answer Based on the Document</h3>
          <p>{answer}</p>

          <h4>Supporting Document Chunks</h4>
          <ul>
            {sources.map((src, index) => (
              <li key={index}>{src}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default App;
