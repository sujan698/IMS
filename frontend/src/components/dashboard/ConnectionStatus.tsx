import { Badge, Tooltip } from "antd"
import { useSelector } from "react-redux"
import type { RootState } from "../../app/store"
import type { WebSocketStatus } from "../../features/dashboard/dashboardSlice"

const ConnectionStatus = () => {
  const { webSocketStatus } = useSelector((state: RootState) => state.dashboard as { webSocketStatus: WebSocketStatus })

  const getStatusText = (status: WebSocketStatus): string => {
    switch (status) {
      case "connected":
        return "Live: Connected"
      case "connecting":
        return "Connecting..."
      case "reconnecting":
        return "Reconnecting..."
      case "disconnected":
        return "Disconnected"
      case "error":
        return "Connection Error"
      case "failed":
        return "Connection Failed"
      default:
        return "Unknown Status"
    }
  }

  const getStatusColor = (status: WebSocketStatus): "success" | "warning" | "error" | "default" => {
    switch (status) {
      case "connected":
        return "success"
      case "connecting":
      case "reconnecting":
        return "warning"
      case "disconnected":
      case "error":
      case "failed":
        return "error"
      default:
        return "default"
    }
  }

  const getTooltipText = (status: WebSocketStatus): string => {
    switch (status) {
      case "connected":
        return "Real-time updates are active"
      case "connecting":
        return "Establishing connection to server"
      case "reconnecting":
        return "Attempting to reconnect to server"
      case "disconnected":
        return "Not connected to real-time updates"
      case "error":
        return "Error connecting to server"
      case "failed":
        return "Failed to connect after multiple attempts"
      default:
        return "Unknown connection status"
    }
  }

  return (
    <Tooltip title={getTooltipText(webSocketStatus)}>
      <div className="dashboard-connection-status">
        <Badge status={getStatusColor(webSocketStatus)} />
        <span>{getStatusText(webSocketStatus)}</span>
      </div>
    </Tooltip>
  )
}

export default ConnectionStatus
