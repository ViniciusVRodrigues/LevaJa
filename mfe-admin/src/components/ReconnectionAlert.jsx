import { useState, useEffect } from 'react';
import './ReconnectionAlert.css';

/**
 * Component to display Azure SQL reconnection alert with countdown
 * 
 * @param {Object} props
 * @param {boolean} props.show - Whether to show the alert
 * @param {number} props.retryIn - Seconds until retry is suggested
 * @param {string} props.message - Custom message to display
 * @param {Function} props.onRetry - Callback when user clicks retry button
 */
function ReconnectionAlert({ show, retryIn = 15, message, onRetry }) {
  const [countdown, setCountdown] = useState(retryIn);

  useEffect(() => {
    if (show) {
      setCountdown(retryIn);
      
      const interval = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [show, retryIn]);

  if (!show) return null;

  const defaultMessage = `O banco de dados está reconectando. Por favor, aguarde ou tente novamente em alguns instantes.`;

  return (
    <div className="reconnection-alert">
      <div className="reconnection-alert-content">
        <div className="reconnection-alert-icon">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10"/>
            <path d="M12 6v6l4 2"/>
          </svg>
        </div>
        <div className="reconnection-alert-text">
          <h3>Reconectando ao Banco de Dados</h3>
          <p>{message || defaultMessage}</p>
          {countdown > 0 && (
            <p className="reconnection-alert-countdown">
              Tentativa automática em <strong>{countdown}</strong> segundo{countdown !== 1 ? 's' : ''}
            </p>
          )}
        </div>
        <div className="reconnection-alert-actions">
          <button 
            onClick={onRetry} 
            className="btn btn-primary"
            disabled={countdown > 5}
          >
            {countdown > 5 ? `Aguarde ${countdown}s` : 'Tentar Agora'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ReconnectionAlert;
