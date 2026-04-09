import React from 'react';
import MacroOverview from '../Dashboard/MacroOverview';
import WaterTracker from '../Tracker/WaterTracker';
import SupplementTracker from '../Supplements/SupplementTracker';
import MealPlanner from '../Meals/MealPlanner';
import CheatMealTracker from '../Tracker/CheatMealTracker';


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

      {/* Bottom Row: Bento Grid with mobile order control */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

        {/* Center Column: Meal List (Span 6) - Order 1 on mobile */}
        <div className="order-1 lg:order-2 lg:col-span-6 flex flex-col gap-6">
          <MealPlanner />
        </div>

        {/* Left Column: Supplements (Span 3) - Order 2 on mobile */}
        <div className="order-2 lg:order-1 lg:col-span-3 flex flex-col gap-6">
          <SupplementTracker />
        </div>

        {/* CheatMealTracker visible on mobile - Order 3 on mobile, hidden on desktop */}
        <div className="order-3 lg:hidden">
          <CheatMealTracker />
        </div>

        {/* Right Column: AI Assistant (Span 3) - Hidden on mobile */}
        <div className="hidden lg:flex lg:order-3 lg:col-span-3 flex-col gap-6">
          <CheatMealTracker />
        </div>

      </section>


    </div>
  );
};

export default NutritionDashboard;
