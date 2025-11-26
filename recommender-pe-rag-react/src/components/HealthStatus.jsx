import { useEffect, useState } from "react";
import { Activity, CheckCircle2, XCircle } from "lucide-react";
import { chatService } from "../services/api";

export const HealthStatus = () => {
  const [health, setHealth] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkHealth = async () => {
      try {
        const data = await chatService.getHealth();
        setHealth(data);
      } catch (error) {
        console.error("Error checking health:", error);
      } finally {
        setLoading(false);
      }
    };

    checkHealth();
    const interval = setInterval(checkHealth, 30000); // Check every 30s
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="card mb-3">
        <div className="card-body d-flex justify-content-center py-4">
          <div className="spinner-border text-primary" role="status"></div>
        </div>
      </div>
    );
  }

  const isHealthy = health?.status === "UP";

  return (
    <div className="card mb-3 shadow-sm">
      <div className="card-header bg-white d-flex align-items-center gap-2">
        <Activity size={16} />
        <h6 className="mb-0">Status do Sistema</h6>
      </div>
      <div className="card-body">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <span className="text-muted small">Serviço Principal</span>
          {isHealthy ? (
            <span className="badge bg-success d-flex align-items-center gap-1">
              <CheckCircle2 size={12} /> Online
            </span>
          ) : (
            <span className="badge bg-danger d-flex align-items-center gap-1">
              <XCircle size={12} /> Offline
            </span>
          )}
        </div>

        {health?.models && (
          <div>
            <span className="d-block small fw-bold mb-2">Modelos Disponíveis:</span>
            <ul className="list-group list-group-flush small">
              {Object.entries(health.models).map(([model, status]) => (
                <li key={model} className="list-group-item d-flex justify-content-between px-0 py-1 border-0">
                  <span className="text-capitalize">{model}</span>
                  <span className={status.includes("✅") ? "text-success" : "text-danger"}>
                    {status}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};