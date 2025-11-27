import { useState, useRef, useEffect } from "react";
import { ChatMessage } from "./ChatMessage";
import { ModelSelector } from "./ModelSelector";
import { Send, Square, RefreshCw } from "lucide-react";
// Importamos apenas a URL base, pois faremos o fetch manual aqui
import { api } from "../services/api"; 

// Recebe conversationLoaded do App.jsx
export const ChatInterface = ({ conversationLoaded }) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [selectedModel, setSelectedModel] = useState("gemini");
  const [isStreaming, setIsStreaming] = useState(false);
  const abortControllerRef = useRef(null); // Controle para cancelar a requisição
  const scrollAreaRef = useRef(null);

  // Carrega histórico quando selecionado
  useEffect(() => {
    if (conversationLoaded) {
      const formattedMessages = [];
      if (conversationLoaded.messages && conversationLoaded.responses) {
        conversationLoaded.messages.forEach((msg, index) => {
          formattedMessages.push({
            role: "user",
            content: msg,
            timestamp: new Date(conversationLoaded.localData)
          });
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
      if (conversationLoaded.modelName) {
        const name = conversationLoaded.modelName.toLowerCase();
        const simpleModelName = name.includes('deepseek') ? 'deepseek' 
          : name.includes('gemini') ? 'gemini' 
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
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setIsStreaming(false);
  };

  const handleClearChat = () => {
    stopStreaming();
    setMessages([]);
    setInput("");
  };

  const sendMessage = async () => {
    if (!input.trim() || isStreaming) return;

    const userMessage = {
      role: "user",
      content: input.trim(),
      timestamp: new Date(),
    };

    // Atualiza UI com mensagem do usuário
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsStreaming(true);

    // Cria placeholder para resposta da IA
    setMessages((prev) => [...prev, {
      role: "assistant",
      content: "",
      timestamp: new Date(),
    }]);

    // Prepara o AbortController para poder cancelar
    abortControllerRef.current = new AbortController();

    try {
      const encodedMessage = encodeURIComponent(userMessage.content);
      // Usamos a URL base do axios (api.defaults.baseURL)
      const baseUrl = api.defaults.baseURL || 'http://localhost:8080';
      const url = `${baseUrl}/ai/chat/${selectedModel}?message=${encodedMessage}`;

      // FETCH MANUAL (Substituindo EventSource)
      const response = await fetch(url, {
        method: 'GET',
        signal: abortControllerRef.current.signal,
        headers: {
          'Accept': 'text/event-stream',
        },
      });

      if (!response.ok) throw new Error(response.statusText);

      // Leitor de Stream
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        // Decodifica o chunk recebido
        const chunk = decoder.decode(value, { stream: true });
        buffer += chunk;

        // Processa linhas completas
        const lines = buffer.split('\n');
        // Mantém o último pedaço no buffer se não terminar com \n
        buffer = lines.pop() || ""; 

        for (const line of lines) {
          if (line.trim() === '') continue;

          // Procura pelo prefixo "data:"
          if (line.startsWith('data:')) {
            // O segredo está aqui: pegamos tudo após "data:"
            // Se o backend mandou "data: Palavra", pegamos " Palavra" (com espaço)
            let token = line.substring(5); 
            
            // Tratamento especial para [DONE]
            if (token.trim() === '[DONE]') {
              stopStreaming();
              return;
            }

            // Se o token for exatamente um espaço que foi trimado na rede (raro, mas possível)
            if (token === '') token = '\n'; 

            // Atualiza o estado
            setMessages((prev) => {
              const newMessages = [...prev];
              const lastIndex = newMessages.length - 1;
              if (lastIndex >= 0) {
                // Substitui quebras de linha literais se houver
                const cleanToken = token.replaceAll("\\n", "\n");
                newMessages[lastIndex] = {
                    ...newMessages[lastIndex],
                    content: newMessages[lastIndex].content + cleanToken
                };
              }
              return newMessages;
            });
          }
        }
      }
    } catch (error) {
      if (error.name !== 'AbortError') {
        console.error("Erro no stream:", error);
        setMessages(prev => {
           const newArr = [...prev];
           newArr[newArr.length - 1].content += "\n[Erro na conexão]";
           return newArr;
        });
      }
    } finally {
      setIsStreaming(false);
      abortControllerRef.current = null;
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