import { motion } from 'framer-motion'

export default function AnimatedBox() {
  return (
    <motion.div
      className="w-full h-full flex items-center justify-center overflow-hidden py-6"
    >
      {/* Animated box at the exact center */}
      <motion.div
        animate={{
          rotate: [0, 90, 180, 270, 360],
          borderRadius: [
            '20%',
            '50%',
            '20%',
            '50%',
            '20%',
          ],
          backgroundColor: [
            '#6750A4',
            '#4285F4',
            '#00BFA5',
            '#FF8A65',
            '#6750A4',
          ],
          scale: [1, 1.2, 0.85, 1.15, 1],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        className="relative w-10 h-10 sm:w-16 sm:h-16"
        style={{
          boxShadow: '0 0 35px rgba(103, 80, 164, 0.45)',
        }}
      >
        {/* Inner rotating square */}
        <motion.div
          animate={{
            rotate: [0, -180, -360],
            scale: [0.65, 0.9, 0.65],
            borderRadius: ['20%', '50%', '20%'],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          className="absolute inset-3 border-2 border-white/70"
        />
      </motion.div>
    </motion.div>
  )
}

