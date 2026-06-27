import * as LottieModule from "lottie-react";
import robotAnimation from "../../assets/robot/robot.json";

const Lottie = LottieModule.default.default;

export default function RobotLogo() {
  return (
    <div className="flex items-center gap-3">
      <div className="w-12 h-12">
        <Lottie
          animationData={robotAnimation}
          loop={true}
        />
      </div>

      <h1
        className="
          text-xl
          bg-gradient-to-r
          from-indigo-400
          via-purple-400
          to-pink-400
          bg-clip-text
          text-transparent
        "
        style={{
          fontFamily: "Audiowide",
        }}
      >
        EduPredict AI
      </h1>
    </div>
  );
}