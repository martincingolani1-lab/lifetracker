import React from 'react';
import MacroOverview from '../Dashboard/MacroOverview';
import WaterTracker from '../Tracker/WaterTracker';
import SupplementTracker from '../Supplements/SupplementTracker';
import MealPlanner from '../Meals/MealPlanner';
import FoodAssistant from '../AI/FoodAssistant';

const NutritionDashboard: React.FC = () => {
  return (
    <div className="space-y-6 page-transition">
      {/* Top Row: Dashboard & Hydration */}
      <section className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        <div className="xl:col-span-9">
          <MacroOverview />
        </div>
        <div className="xl:col-span-3">
          <WaterTracker />
        </div>
      </section>

      {/* Bottom Row */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Center: Meal List */}
        <div className="order-1 lg:order-2 lg:col-span-6 flex flex-col gap-6">
          <MealPlanner />
        </div>

        {/* Left: Supplements */}
        <div className="order-2 lg:order-1 lg:col-span-3 flex flex-col gap-6">
          <SupplementTracker />
        </div>

        {/* Right: AI Assistant */}
        <div className="order-3 lg:col-span-3 flex flex-col gap-6">
          <FoodAssistant />
        </div>
      </section>
    </div>
  );
};

export default NutritionDashboard;
