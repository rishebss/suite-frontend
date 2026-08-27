import React from "react";
import InventorySidebar from "./InventorySidebar";

const InventoryLayout = ({ children }) => {
  return (
    <div className="flex h-full">
      <InventorySidebar />
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        {children}
      </div>
    </div>
  );
};

export default InventoryLayout;
