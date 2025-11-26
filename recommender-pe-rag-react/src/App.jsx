import { useState } from "react";
import { ChatInterface } from "./components/ChatInterface";
import { ChatHistory } from "./components/ChatHistory";
import { HealthStatus } from "./components/HealthStatus";
import logoVamu from "./assets/logo.png"; 

function App() {
  // Estado para armazenar a conversa clicada no histórico
  const [selectedConversation, setSelectedConversation] = useState(null);

  return (
    <div className="d-flex flex-column vh-100 bg-light">
      <header className="bg-white shadow-sm sticky-top border-bottom border-warning border-3">
        <div className="container py-2">
          <div className="d-flex align-items-center gap-3">
            <div style={{ width: '120px' }}>
                <img 
                  src={logoVamu} 
                  alt="Vamu! Rec" 
                  className="img-fluid"
                  onError={(e) => {e.target.style.display='none'}}
                />
            </div>
            <div className="border-start ps-3 border-secondary">
              <h1 className="h6 fw-bold mb-0 text-vamu-blue">Assistente Turístico</h1>
              <p className="small text-muted mb-0">DeepSeek • Gemini • Ollama</p>
            </div>
          </div>
        </div>
      </header>

      <main className="container py-4 flex-grow-1 overflow-hidden">
        <div className="row h-100 g-4">
          
          <div className="col-lg-8 h-100 d-flex flex-column">
            {/* Passamos a conversa selecionada para o ChatInterface */}
            <ChatInterface conversationLoaded={selectedConversation} />
          </div>

          <div className="col-lg-4 h-100 d-flex flex-column gap-3">
            <HealthStatus />
            <div className="flex-grow-1 overflow-hidden" style={{ minHeight: '300px' }}>
              {/* Passamos a função de seleção para o ChatHistory */}
              <ChatHistory onSelectConversation={setSelectedConversation} />
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}

export default App;