// src/App.jsx
import React, { useState, useRef, useEffect } from 'react';

function App() {
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'ai',
      content: "👋 Salut ! Je suis **Robert.ai**...",
      // ... resto du code de chat
    }
  ]);
  // ... tout le code de l'interface de chat
}

export default App;