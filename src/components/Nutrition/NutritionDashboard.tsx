import React from 'react';
import MacroOverview from '../Dashboard/MacroOverview';
import WaterTracker from '../Tracker/WaterTracker';
import SupplementTracker from '../Supplements/SupplementTracker';
import MealPlanner from '../Meals/MealPlanner';
const NutritionDashboard: React.FC = () => {
  return (
    <div className="page-transition">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Izquierda: 4 macros apilados */}
        <div className="lg:col-span-3 flex flex-col gap-4">
          <MacroOverview />
        </div>

        {/* Centro: Comidas */}
        <div className="lg:col-span-6 flex flex-col gap-6">
          <MealPlanner />
        </div>

        {/* Derecha: Agua + Suplementos */}
        <div className="lg:col-span-3 flex flex-col gap-6">
          <WaterTracker />
          <SupplementTracker />
        </div>
      </div>
    </div>
  );
};

export default NutritionDashboard;
