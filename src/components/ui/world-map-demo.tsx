
import { WorldMap } from "@/components/ui/world-map";
import { motion } from "framer-motion";

export function WorldMapDemo() {
  return (
    <div className="w-full">
      <div className="max-w-7xl mx-auto text-center mb-10">
        <p className="font-bold text-4xl md:text-6xl text-black">
          Global{" "}
          <span className="text-gray-700">
            {"Legacy".split("").map((word, idx) => (
              <motion.span
                key={idx}
                className="inline-block"
                initial={{ x: -10, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.5, delay: idx * 0.04 }}
              >
                {word}
              </motion.span>
            ))}
          </span>{" "}
          Protection
        </p>
        <p className="text-xl text-gray-700 max-w-3xl mx-auto py-4">
          WillTank offers secure estate planning services worldwide, connecting your legacy across continents with enterprise-grade protection.
        </p>
      </div>
      <WorldMap
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
    </div>
  );
}
