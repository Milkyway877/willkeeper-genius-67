
import { OptimizedWorldMap } from "@/components/ui/optimized-world-map";
import { motion } from "framer-motion";
import { Suspense } from "react";

export function WorldMapDemo() {
  return (
    <div className="w-full">
      <div className="max-w-7xl mx-auto text-center mb-10">
        <p className="font-bold text-4xl md:text-6xl text-black">
          Global{" "}
          <span className="text-gray-700">
            {"Legacy"}
          </span>{" "}
          Protection
        </p>
        <p className="text-xl text-gray-700 max-w-3xl mx-auto py-4">
          WillTank offers secure estate planning services worldwide, connecting your legacy across continents with enterprise-grade protection.
        </p>
      </div>
      <Suspense fallback={
        <div className="w-full aspect-[2/1] bg-gray-100 dark:bg-gray-800 rounded-lg animate-pulse"></div>
      }>
        <OptimizedWorldMap
          dots={[
            {
              start: { lat: 40.7128, lng: -74.006 }, // New York
              end: { lat: 51.5074, lng: -0.1278 }, // London
            },
            {
              start: { lat: 51.5074, lng: -0.1278 }, // London
              end: { lat: 35.6762, lng: 139.6503 }, // Tokyo
            },
            {
              start: { lat: 35.6762, lng: 139.6503 }, // Tokyo
              end: { lat: -33.8688, lng: 151.2093 }, // Sydney
            },
            {
              start: { lat: 40.7128, lng: -74.006 }, // New York
              end: { lat: 19.4326, lng: -99.1332 }, // Mexico City
            },
            {
              start: { lat: 51.5074, lng: -0.1278 }, // London
              end: { lat: 28.6139, lng: 77.209 }, // New Delhi
            },
            {
              start: { lat: 28.6139, lng: 77.209 }, // New Delhi
              end: { lat: -1.2921, lng: 36.8219 }, // Nairobi
            },
          ]}
          lineColor="#42A088" // Using willtank-500 color
        />
      </Suspense>
    </div>
  );
}
