import { useEffect, useState } from "react";
import { chatService } from "../services/api";
import { ChevronLeft, ChevronRight, History, MessageSquare } from "lucide-react";

// Recebe a prop onSelectConversation
export const ChatHistory = ({ onSelectConversation }) => {
  const [conversations, setConversations] = useState([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(false);

  const loadHistory = async (currentPage) => {
    setLoading(true);
    try {
      // MUDANÇA AQUI: Alterado de 5 para 10
      const data = await chatService.getHistory(currentPage, 10);
      setConversations(data.content);
      setTotalPages(data.totalPages);
    } catch (error) {
      console.error("Erro ao carregar histórico", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHistory(page);
  }, [page]);

  const formatDate = (dateString) => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleString('pt-BR', {
      day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit',
    });
  };

  return (
    <div className="card h-100 shadow-sm border-0 d-flex flex-column">
      <div className="card-header bg-white d-flex align-items-center gap-2 py-3">
        <History className="text-vamu-orange" size={20} />
        <div>
          <h6 className="mb-0 text-vamu-blue fw-bold">Histórico de Conversas</h6>
          <small className="text-muted">Clique para carregar</small>
        </div>
      </div>
      
      <div className="card-body p-0 flex-grow-1 overflow-auto bg-light">
        {loading ? (
          <div className="d-flex justify-content-center align-items-center h-100 p-4">
            <div className="spinner-border text-vamu-orange" role="status"></div>
          </div>
        ) : conversations.length === 0 ? (
          <div className="text-center text-muted p-5">
            <MessageSquare size={48} className="mb-2 opacity-25" />
            <p>Nenhuma conversa encontrada</p>
          </div>
        ) : (
          <div className="list-group list-group-flush">
            {conversations.map((conv) => (
              <button 
                key={conv.id} 
                className="list-group-item list-group-item-action p-3 border-bottom text-start"
                onClick={() => onSelectConversation(conv)} // Ao clicar, envia para o App
                style={{ cursor: 'pointer' }}
              >
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <span className="badge bg-vamu-blue text-white" style={{ fontSize: '0.7rem'}}>
                    {conv.modelName || conv.model}
                  </span>
                  <small className="text-muted" style={{ fontSize: '0.7rem'}}>
                    {formatDate(conv.localData)} 
                  </small>
                </div>
                
                <div className="mb-2">
                  <span className="fw-bold text-vamu-blue small d-block">Pergunta:</span>
                  <span className="small text-dark text-break line-clamp-2">
                    {conv.messages && conv.messages.length > 0 ? conv.messages[0] : "Sem mensagem"}
                  </span>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {totalPages > 1 && (
        <div className="card-footer bg-white d-flex justify-content-between align-items-center">
          <button 
            className="btn btn-outline-secondary btn-sm"
            onClick={() => setPage(p => Math.max(0, p - 1))}
            disabled={page === 0 || loading}
          >
            <ChevronLeft size={16} />
          </button>
          <span className="small text-muted">{page + 1} / {totalPages}</span>
          <button 
            className="btn btn-outline-secondary btn-sm"
            onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
            disabled={page >= totalPages - 1 || loading}
          >
            <ChevronRight size={16} />
          </button>
        </div>
      )}
    </div>
  );
};