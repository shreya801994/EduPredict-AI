import * as LottieModule from "lottie-react";
import { motion } from "framer-motion";
import robotAnimation from "../../assets/robot/robot.json";

const Lottie = LottieModule.default.default;

export default function AnimatedRobot() {
return (
<motion.div
initial={{ opacity: 0, y: 25 }}
animate={{ opacity: 1, y: 0 }}
transition={{ duration: 0.8 }}
className="flex items-center justify-center w-full"
>
<motion.div
animate={{
y: [0, -10, 0],
}}
transition={{
duration: 3,
repeat: Infinity,
ease: "easeInOut",
}}
className="
w-[180px]
sm:w-[220px]
md:w-[320px]
lg:w-[420px]
"
> <Lottie
       animationData={robotAnimation}
       loop={true}
     />
</motion.div>
</motion.div>
);
}
