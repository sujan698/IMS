import { io, type Socket } from "socket.io-client";
import { store } from "../app/store";
import {
  updateDashboardStats,
  setWebSocketStatus,
} from "../features/dashboard/dashboardSlice";

class WebSocketService {
  private socket: Socket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 3000; // 3 seconds
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;

  connect() {
    try {
      const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:3000";

      // Disconnect any existing connection
      this.disconnect();

      // Update connection status to connecting
      store.dispatch(setWebSocketStatus("connecting"));

      // Create new socket connection
      this.socket = io(apiUrl, {
        transports: ["websocket"],
        reconnection: false, // We'll handle reconnection manually
        auth: {
          token: (store.getState() as { auth: { token: string } }).auth.token,
        },
      });

      // Set up event listeners
      this.setupEventListeners();
    } catch (error) {
      console.error("WebSocket connection error:", error);
      this.handleConnectionError();
    }
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }

    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
  }

  private setupEventListeners() {
    if (!this.socket) return;

    // Connection established
    this.socket.on("connect", () => {
      console.log("WebSocket connected");
      store.dispatch(setWebSocketStatus("connected"));
      this.reconnectAttempts = 0;
    });

    // Connection error
    this.socket.on("connect_error", (error) => {
      console.error("WebSocket connection error:", error);
      this.handleConnectionError();
    });

    // Disconnected
    this.socket.on("disconnect", (reason) => {
      console.log("WebSocket disconnected:", reason);
      store.dispatch(setWebSocketStatus("disconnected"));

      // If the server closed the connection, try to reconnect
      if (reason === "io server disconnect" || reason === "transport close") {
        this.attemptReconnect();
      }
    });

    // Dashboard updates
    this.socket.on("dashboard:update", (data) => {
      console.log("Received dashboard update:", data);
      store.dispatch(updateDashboardStats(data));
    });

    // Sales updates
    this.socket.on("sales:new", (data) => {
      console.log("New sale recorded:", data);
      // We'll update the dashboard with the latest sales data
      this.socket?.emit("dashboard:request");
    });

    // Purchase updates
    this.socket.on("purchases:new", (data) => {
      console.log("New purchase recorded:", data);
      // We'll update the dashboard with the latest purchase data
      this.socket?.emit("dashboard:request");
    });

    // Inventory updates
    this.socket.on("inventory:update", (data) => {
      console.log("Inventory updated:", data);
      // We'll update the dashboard with the latest inventory data
      this.socket?.emit("dashboard:request");
    });
  }

  private handleConnectionError() {
    store.dispatch(setWebSocketStatus("error"));
    this.attemptReconnect();
  }

  private attemptReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      store.dispatch(setWebSocketStatus("reconnecting"));

      console.log(
        `Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`
      );

      this.reconnectTimer = setTimeout(() => {
        this.connect();
      }, this.reconnectDelay * this.reconnectAttempts);
    } else {
      console.error("Max reconnection attempts reached");
      store.dispatch(setWebSocketStatus("failed"));
    }
  }

  // Request dashboard data update
  requestDashboardUpdate() {
    if (this.socket && this.socket.connected) {
      this.socket.emit("dashboard:request");
    }
  }

  // Check if socket is connected
  isConnected(): boolean {
    return !!this.socket?.connected;
  }
}

// Create singleton instance
const websocketService = new WebSocketService();
export default websocketService;
