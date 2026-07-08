import { useEffect, useState } from "react";
import { Hero } from "./Components/Hero";
import { SVGElementsChess } from "./utils/svg_icons.tsx";
import { motion } from "framer-motion";
// Application logic
function App() {
  return (
    <>
      <BackGroundAnimation />
      <Hero />
    </>
  );
}

const BackGroundAnimation = () => {
  const [size, setSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  useEffect(() => {
    const handleResize = () => {
      setSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    window.addEventListener("resize", handleResize);

    handleResize();

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none bg-[#0A0F24] -z-10">
      {SVGElementsChess.map((SVG, i) => (
        <motion.div
          key={i}
          initial={{
            y: -150,
            x: Math.random() * (size.width - 100),
            rotate: Math.random() * 100 - 60,
          }}
          animate={{
            y: size.height + 150,
          }}
          transition={{
            duration: 20 + Math.random() * 3,
            ease: "linear",
            repeat: Infinity,
            repeatType: "loop",
            delay: i * 3 + Math.random() * 0.5,
          }}
          style={{
            position: "fixed",
            pointerEvents: "none",
            top: 0,
            left: 0,
          }}
        >
          <SVG className="fill-white/20 opacity-20 size-20 md:size-28" />
        </motion.div>
      ))}
    </div>
  );
};

export default App;
