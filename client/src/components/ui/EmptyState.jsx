import React from "react";

const EmptyState = ({ title, message, icon, action }) => {
  const IconComponent = icon;

  return (
    <div className="empty-state">
      {icon && (
        <div className="empty-state-icon">
          {typeof IconComponent === "function" ? (
            <IconComponent size={64} />
          ) : (
            icon
          )}
        </div>
      )}
      <h3 className="empty-state-title">{title}</h3>
      <p className="empty-state-message">{message}</p>
      {action && <div className="empty-state-action">{action}</div>}
    </div>
  );
};

export default EmptyState;
