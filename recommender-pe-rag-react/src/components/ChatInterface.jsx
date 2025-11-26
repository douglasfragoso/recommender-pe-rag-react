import { useState, useRef, useEffect } from "react";
import { ChatMessage } from "./ChatMessage";
import { ModelSelector } from "./ModelSelector";
import { Send, Square, RefreshCw } from "lucide-react";
import { chatService } from "../services/api";

// Recebe conversationLoaded do App.jsx
export const ChatInterface = ({ conversationLoaded }) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [selectedModel, setSelectedModel] = useState("gemini");
  const [isStreaming, setIsStreaming] = useState(false);
  const [eventSource, setEventSource] = useState(null);
  const scrollAreaRef = useRef(null);

  // Efeito para carregar histórico quando o usuário clica na barra lateral
  useEffect(() => {
    if (conversationLoaded) {
      const formattedMessages = [];
      
      // O backend retorna arrays separados de mensagens e respostas
      // Vamos uni-los em ordem cronológica para o chat
      if (conversationLoaded.messages && conversationLoaded.responses) {
        conversationLoaded.messages.forEach((msg, index) => {
          // Adiciona pergunta do usuário
          formattedMessages.push({
            role: "user",
            content: msg,
            timestamp: new Date(conversationLoaded.localData)
          });

          // Adiciona resposta da IA (se existir para este índice)
          if (conversationLoaded.responses[index]) {
            formattedMessages.push({
              role: "assistant",
              content: conversationLoaded.responses[index],
              timestamp: new Date(conversationLoaded.localData)
            });
          }
        });
      }
      setMessages(formattedMessages);
      // Atualiza o modelo selecionado para o da conversa antiga
      if (conversationLoaded.modelName) {
        // Tenta mapear o nome do modelo (ex: deepseek-r1 -> deepseek)
        const simpleModelName = conversationLoaded.modelName.toLowerCase().includes('deepseek') ? 'deepseek' 
          : conversationLoaded.modelName.toLowerCase().includes('gemini') ? 'gemini' 
          : 'ollama';
        setSelectedModel(simpleModelName);
      }
    }
  }, [conversationLoaded]);

  const scrollToBottom = () => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const stopStreaming = () => {
    if (eventSource) {
      eventSource.close();
      setEventSource(null);
    }
    setIsStreaming(false);
  };

  const handleClearChat = () => {
    setMessages([]);
    setInput("");
    stopStreaming();
  };

  const sendMessage = async () => {
    if (!input.trim() || isStreaming) return;

    const userMessage = {
      role: "user",
      content: input.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsStreaming(true);

    const assistantMessage = {
      role: "assistant",
      content: "",
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, assistantMessage]);

    try {
      const es = chatService.createEventSource(selectedModel, userMessage.content);
      setEventSource(es);

      es.onmessage = (event) => {
        const token = event.data;
        
        if (token === "[DONE]" || token.includes("❌ Erro")) {
          es.close();
          setIsStreaming(false);
          setEventSource(null);
          
          if (token.includes("❌ Erro")) {
            // Remove as aspas extras se vierem do backend
            const errorMsg = token.replace(/"/g, '');
            setMessages(prev => {
                const newArr = [...prev];
                newArr[newArr.length - 1].content = errorMsg;
                return newArr;
            });
          }
          return;
        }

        // LÓGICA DE ATUALIZAÇÃO SEGURA
        setMessages((prev) => {
          const newMessages = [...prev];
          const lastIndex = newMessages.length - 1;
          
          // Garante que estamos editando a última mensagem e que ela é do assistente
          if (lastIndex >= 0 && newMessages[lastIndex].role === "assistant") {
            // Decodifica quebras de linha se necessário (depende do backend)
            const cleanToken = token.replaceAll("\\n", "\n");
            newMessages[lastIndex] = {
                ...newMessages[lastIndex],
                content: newMessages[lastIndex].content + cleanToken
            };
          }
          return newMessages;
        });
      };

      es.onerror = (error) => {
        console.error("EventSource error:", error);
        es.close();
        setIsStreaming(false);
        setEventSource(null);
      };
    } catch (error) {
      console.error("Error sending message:", error);
      setIsStreaming(false);
      alert("Erro ao enviar mensagem.");
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="card shadow-sm h-100 d-flex flex-column border-0">
      <div className="border-bottom bg-light">
          <ModelSelector selectedModel={selectedModel} onModelChange={setSelectedModel} />
      </div>
      
      <div 
        ref={scrollAreaRef} 
        className="card-body overflow-auto flex-grow-1 bg-white" 
        style={{ scrollBehavior: 'smooth' }}
      >
        {messages.length === 0 ? (
          <div className="h-100 d-flex flex-column align-items-center justify-center text-center p-5">
            <h2 className="fw-bold text-vamu-blue mb-3">Como posso ajudar?</h2>
            <p className="text-muted w-75">
              Escolha um modelo acima e planeje sua próxima rota turística em Recife.
            </p>
          </div>
        ) : (
          <div className="d-flex flex-column gap-3">
            {messages.map((message, index) => (
              <ChatMessage
                key={index}
                role={message.role}
                content={message.content}
                isStreaming={isStreaming && index === messages.length - 1}
              />
            ))}
          </div>
        )}
      </div>

      <div className="card-footer bg-light p-3 border-top">
        <div className="input-group shadow-sm">
          {/* Botão limpar chat */}
          <button 
             className="btn btn-outline-secondary"
             onClick={handleClearChat}
             title="Nova Conversa"
             disabled={isStreaming}
          >
            <RefreshCw size={18} />
          </button>

          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Digite sua mensagem... (Enter para enviar)"
            className="form-control border-0"
            style={{ resize: 'none', height: '60px' }}
            disabled={isStreaming}
          />
          {isStreaming ? (
            <button 
              onClick={stopStreaming} 
              className="btn btn-danger d-flex align-items-center justify-content-center"
              style={{ width: '60px' }}
              title="Parar geração"
            >
              <Square size={20} />
            </button>
          ) : (
            <button 
              onClick={sendMessage} 
              disabled={!input.trim()}
              className="btn btn-vamu d-flex align-items-center justify-content-center"
              style={{ width: '60px' }}
              title="Enviar mensagem"
            >
              <Send size={20} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};