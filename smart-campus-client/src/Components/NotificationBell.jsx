import { useState, useEffect } from "react";

export default function NotificationBell({ userId }) {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [open, setOpen] = useState(false);

  const fetchNotifications = async () => {
    try {
      const res = await fetch(`http://localhost:8080/api/notifications/user/${userId}`);
      const data = await res.json();
      setNotifications(data);
      setUnreadCount(data.filter(n => !n.read).length);
    } catch (error) {
      console.error("Error fetching notifications:", error);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, [userId]);

  const markAsRead = async (id) => {
    await fetch(`http://localhost:8080/api/notifications/${id}/read`, { method: "PUT" });
    fetchNotifications();
  };

  const markAllAsRead = async () => {
    await fetch(`http://localhost:8080/api/notifications/user/${userId}/read-all`, { method: "PUT" });
    fetchNotifications();
  };

  const deleteNotification = async (id) => {
    await fetch(`http://localhost:8080/api/notifications/${id}`, { method: "DELETE" });
    fetchNotifications();
  };

  return (
    <div style={{ position: "relative", display: "inline-block" }}>
      {/* Bell Icon */}
      <button onClick={() => setOpen(!open)} style={styles.bell}>
        🔔
        {unreadCount > 0 && (
          <span style={styles.badge}>{unreadCount}</span>
        )}
      </button>

      {/* Notification Panel */}
      {open && (
        <div style={styles.panel}>
          <div style={styles.panelHeader}>
            <strong>Notifications</strong>
            <button onClick={markAllAsRead} style={styles.markAll}>
              Mark all read
            </button>
          </div>

          {notifications.length === 0 ? (
            <p style={{ padding: "10px" }}>No notifications</p>
          ) : (
            notifications.map(n => (
              <div key={n.id} style={{
                ...styles.item,
                background: n.read ? "#fff" : "#eef4ff"
              }}>
                <p style={{ margin: 0 }}>{n.message}</p>
                <small style={{ color: "#888" }}>{n.type}</small>
                <div style={styles.actions}>
                  {!n.read && (
                    <button onClick={() => markAsRead(n.id)} style={styles.btn}>
                      Mark read
                    </button>
                  )}
                  <button onClick={() => deleteNotification(n.id)} style={styles.btnRed}>
                    Delete
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

const styles = {
  bell: {
    fontSize: "24px", background: "none",
    border: "none", cursor: "pointer", position: "relative"
  },
  badge: {
    position: "absolute", top: "-5px", right: "-5px",
    background: "red", color: "white", borderRadius: "50%",
    padding: "2px 6px", fontSize: "11px"
  },
  panel: {
    position: "absolute", right: 0, top: "40px",
    width: "320px", background: "white",
    border: "1px solid #ddd", borderRadius: "8px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.15)", zIndex: 1000,
    maxHeight: "400px", overflowY: "auto"
  },
  panelHeader: {
    display: "flex", justifyContent: "space-between",
    alignItems: "center", padding: "10px 15px",
    borderBottom: "1px solid #eee"
  },
  markAll: {
    fontSize: "12px", color: "#007bff",
    background: "none", border: "none", cursor: "pointer"
  },
  item: {
    padding: "10px 15px", borderBottom: "1px solid #f0f0f0"
  },
  actions: { display: "flex", gap: "8px", marginTop: "5px" },
  btn: {
    fontSize: "11px", padding: "2px 8px",
    background: "#007bff", color: "white",
    border: "none", borderRadius: "4px", cursor: "pointer"
  },
  btnRed: {
    fontSize: "11px", padding: "2px 8px",
    background: "#dc3545", color: "white",
    border: "none", borderRadius: "4px", cursor: "pointer"
  }
};