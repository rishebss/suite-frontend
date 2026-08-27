import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import InventoryLayout from "./components/InventoryLayout";
import ItemList from "./pages/ItemList";
import CategoryList from "./pages/CategoryList";
import UnitList from "./pages/UnitList";
import BrandList from "./pages/BrandList";
import LocationList from "./pages/LocationList";
import LocationTypeList from "./pages/LocationTypeList";
import StockAvailability from "./pages/StockAvailability";
import TransferList from "./pages/TransferList";

const InventoryRoutes = () => {
  return (
    <InventoryLayout>
      <Routes>
        <Route path="/" element={<Navigate to="/inventory/items" replace />} />
        <Route path="/items" element={<ItemList />} />
        <Route path="/categories" element={<CategoryList />} />
        <Route path="/units" element={<UnitList />} />
        <Route path="/brands" element={<BrandList />} />
        <Route path="/locations" element={<LocationList />} />
        <Route path="/location-types" element={<LocationTypeList />} />
        <Route path="/transfers" element={<TransferList />} />
        <Route path="/stock" element={<StockAvailability />} />
      </Routes>
    </InventoryLayout>
  );
};

export default InventoryRoutes;
