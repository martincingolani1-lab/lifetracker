import React from "react";
export const SkeletonCard: React.FC = () => (
  <div className="bg-card rounded-2xl p-6 animate-pulse">
    {" "}
    <div className="flex items-center gap-4 mb-4">
      {" "}
      <div className="w-12 h-12 bg-white/10 rounded-xl"></div>{" "}
      <div className="flex-1">
        {" "}
        <div className="h-4 bg-white/10 rounded w-1/3 mb-2"></div>{" "}
        <div className="h-3 bg-white/10 rounded w-1/2"></div>{" "}
      </div>{" "}
    </div>{" "}
    <div className="h-2 bg-white/10 rounded w-full"></div>{" "}
  </div>
);
export const SkeletonMetric: React.FC = () => (
  <div className="bg-card rounded-2xl p-6 animate-pulse">
    {" "}
    <div className="flex items-center gap-4">
      {" "}
      <div className="w-10 h-10 bg-white/10 rounded-xl"></div>{" "}
      <div className="flex-1">
        {" "}
        <div className="h-3 bg-white/10 rounded w-1/4 mb-2"></div>{" "}
        <div className="h-6 bg-white/10 rounded w-1/2"></div>{" "}
      </div>{" "}
    </div>{" "}
  </div>
);
export const SkeletonHabitRow: React.FC = () => (
  <div className="bg-card rounded-2xl p-4 animate-pulse flex items-center justify-between">
    {" "}
    <div className="flex items-center gap-4 flex-1">
      {" "}
      <div className="w-12 h-12 bg-white/10 rounded-xl"></div>{" "}
      <div>
        {" "}
        <div className="h-4 bg-white/10 rounded w-32 mb-2"></div>{" "}
        <div className="h-3 bg-white/10 rounded w-20"></div>{" "}
      </div>{" "}
    </div>{" "}
    <div className="w-6 h-6 bg-white/10 rounded-full"></div>{" "}
  </div>
);
export const SkeletonHabitsView: React.FC = () => (
  <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 animate-in fade-in duration-500">
    {" "}
    {/* Left Column Skeleton */}{" "}
    <div className="lg:col-span-5 flex flex-col gap-8">
      {" "}
      <div className="h-14 w-14 rounded-full bg-white/10 animate-pulse mb-6"></div>{" "}
      <div className="h-16 bg-white/10 rounded-2xl w-3/4 animate-pulse mb-8"></div>{" "}
      <div className="h-48 bg-card rounded-3xl animate-pulse"></div>{" "}
    </div>{" "}
    {/* Right Column Skeleton */}{" "}
    <div className="lg:col-span-7 flex flex-col gap-4">
      {" "}
      <SkeletonHabitRow /> <SkeletonHabitRow /> <SkeletonHabitRow />{" "}
      <SkeletonHabitRow /> <SkeletonHabitRow />{" "}
    </div>{" "}
  </div>
);
export const SkeletonDashboard: React.FC = () => (
  <div className="space-y-6 animate-in fade-in duration-500">
    {" "}
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {" "}
      <SkeletonMetric /> <SkeletonMetric /> <SkeletonMetric />{" "}
    </div>{" "}
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {" "}
      <SkeletonCard /> <SkeletonCard />{" "}
    </div>{" "}
  </div>
);
export default SkeletonCard;
