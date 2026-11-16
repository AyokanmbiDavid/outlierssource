
import { LazyMotion, domAnimation, m } from "framer-motion";

export default function AnimatedBox() {
  return (
    <LazyMotion features={domAnimation}>
      <div className="
        fixed inset-0 z-50
        w-full h-full min-h-screen
        flex items-center justify-center
        bg-[#f4f7fb]
        overflow-hidden
      ">

        {/* Main loading container */}
        <div className="
          flex flex-col
          items-center justify-center
          gap-5
        ">

          {/* Animated logo */}
          <div className="relative w-16 h-16 flex items-center justify-center">

            {/* Outer shape */}
            <m.div
              animate={{
                rotate: [0, 180, 360],
                borderRadius: ["22%", "50%", "22%"],
                scale: [1, 0.85, 1],
              }}
              transition={{
                duration: 2.4,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="
                absolute inset-1
                bg-[#315f89]
                shadow-lg shadow-blue-900/15
              "
            />

            {/* Inner shape */}
            <m.div
              animate={{
                rotate: [0, -180, -360],
                scale: [0.65, 1, 0.65],
                borderRadius: ["20%", "50%", "20%"],
              }}
              transition={{
                duration: 2.4,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="
                absolute inset-4
                border-2 border-white
              "
            />

            {/* Center dot */}
            <m.div
              animate={{
                scale: [0.8, 1.2, 0.8],
                opacity: [0.6, 1, 0.6],
              }}
              transition={{
                duration: 1.2,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="
                w-2 h-2 rounded-full
                bg-white z-10
              "
            />

          </div>

          {/* Loading text */}
          <div className="flex flex-col items-center gap-2">

            <m.p
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="
                text-sm font-semibold
                tracking-wide
                text-[#315f89]
              "
            >
              OutliersSource
            </m.p>

            <p className="
              text-[11px]
              tracking-widest
              uppercase
              text-slate-400
            ">
              Preparing your experience
            </p>

          </div>

          {/* Loading indicator */}
          <div className="
            w-24 h-1
            rounded-full
            bg-[#dce6f0]
            overflow-hidden
          ">
            <m.div
              animate={{ x: ["-100%", "200%"] }}
              transition={{
                duration: 1.2,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="
                w-1/2 h-full
                rounded-full
                bg-[#315f89]
              "
            />
          </div>

        </div>

      </div>
    </LazyMotion>
  );
}
