import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";

const titles = ["Developer", "AI Engineer", "Analyst", "Software Engineer", "Designer", "Tech Enthusiast", "ML Researcher", "Prompt Engineer", "Advisor"];

export default function AnimatedTitle() {
    const [index, setIndex] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setIndex((prev: number) => (prev + 1) % titles.length); // Loop back to 0 after last item
        }, 4000); // Change text every 2 seconds

        return () => clearInterval(interval);
    }, []);

    return (
        <div className="h-12 overflow-hidden">
            <AnimatePresence mode="wait">
                <motion.p
                    key={titles[index]}
                    className="text-3xl md:text-3xl font-bold mb-1"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.7, ease: "easeInOut" }}
                >
                    {titles[index]}
                </motion.p>
            </AnimatePresence>
        </div>
    );
}
