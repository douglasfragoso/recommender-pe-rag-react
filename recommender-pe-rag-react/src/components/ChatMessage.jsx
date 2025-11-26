import { Bot, User } from "lucide-react";

export const ChatMessage = ({ role, content, isStreaming }) => {
  const isUser = role === 'user';

  return (
    <div className={`d-flex gap-3 p-3 ${isUser ? "flex-row-reverse" : "flex-row"}`}>
      {/* Avatar */}
      <div 
           className={`d-flex align-items-center justify-content-center rounded flex-shrink-0 shadow-sm`} 
           style={{ 
             width: '32px', 
             height: '32px', 
             // Se for usuário, usa o Azul da Logo (var(--vamu-blue)), senão usa cinza
             backgroundColor: isUser ? 'var(--vamu-blue)' : '#e9ecef', 
             color: isUser ? 'white' : '#495057' 
           }}>
        {isUser ? <User size={16} /> : <Bot size={16} />}
      </div>

      {/* Balão de Mensagem */}
      <div 
           className={`p-3 rounded-3 shadow-sm`} 
           style={{ 
             maxWidth: '80%',
             // AQUI ESTÁ A MUDANÇA:
             // Se for usuário: Fundo Azul Vamu + Texto Branco
             // Se for IA: Fundo Branco/Cinza Claro + Texto Escuro
             backgroundColor: isUser ? 'var(--vamu-blue)' : '#ffffff', 
             color: isUser ? 'white' : '#212529',
             border: isUser ? 'none' : '1px solid #dee2e6'
           }}>
        <div className="text-break" style={{ whiteSpace: 'pre-wrap' }}>
          {content}
          {/* Cursor piscando durante o streaming */}
          {isStreaming && (
            <span className="d-inline-block ms-1 bg-current rounded-circle animate-pulse" 
                  style={{ width: '8px', height: '16px', backgroundColor: 'currentColor' }}></span>
          )}
        </div>
      </div>
    </div>
  );
};