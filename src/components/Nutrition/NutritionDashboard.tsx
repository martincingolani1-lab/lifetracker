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

        {/* Derecha: Comidas arriba, Agua + Suplementos abajo */}
        <div className="lg:col-span-9 flex flex-col gap-4">
          <MealPlanner />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <WaterTracker />
            <SupplementTracker />
          </div>
        </div>
      </div>
    </div>
  );
};

export default NutritionDashboard;
