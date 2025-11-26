import { Bot, Sparkles, Cpu } from "lucide-react";

const models = [
  { id: 'deepseek', name: 'DeepSeek', icon: Bot, description: 'Poderoso e preciso' },
  { id: 'gemini', name: 'Gemini', icon: Sparkles, description: 'Versátil e rápido' },
  { id: 'ollama', name: 'Ollama', icon: Cpu, description: 'Local e privado' },
];

export const ModelSelector = ({ selectedModel, onModelChange }) => {
  return (
    <div className="d-flex gap-2 p-3 border-bottom bg-light">
      <span className="align-self-center text-muted fw-medium me-2">Modelo:</span>
      {models.map((model) => {
        const Icon = model.icon;
        const isActive = selectedModel === model.id;
        
        return (
          <button
            key={model.id}
            onClick={() => onModelChange(model.id)}
            className={`btn btn-sm d-flex align-items-center gap-2 shadow-sm`}
            style={{
              // Se estiver ATIVO: Fundo Laranja e Texto Branco
              // Se estiver INATIVO: Fundo Branco e Texto Azul (Marca)
              backgroundColor: isActive ? 'var(--vamu-orange)' : 'white',
              color: isActive ? 'white' : 'var(--vamu-blue)',
              borderColor: isActive ? 'var(--vamu-orange)' : '#dee2e6',
              transition: 'all 0.2s ease-in-out'
            }}
          >
            <Icon size={16} />
            <span className="d-none d-sm-inline fw-medium">{model.name}</span>
          </button>
        );
      })}
    </div>
  );
};