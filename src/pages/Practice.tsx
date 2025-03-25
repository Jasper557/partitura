import React, { useState, useRef, useEffect, useMemo } from 'react'
// Music notation libraries (@tonaljs/tonal, vexflow, react-music-notation) have been removed
// as they are not required for the core functionality of the sight reading world.
import { useTheme } from '../context/ThemeContext'
import useScrollReset from '../hooks/useScrollReset'
import { motion, AnimatePresence } from 'framer-motion'
import { Globe, Star, Music, Sparkles, Zap } from 'lucide-react'
import PageTransition from '../components/PageTransition'

// Define level data
const levels = [
  { id: 1, name: 'Note Basics', difficulty: 'Easy', x: 120, y: 400, completed: true, icon: <Music size={14} /> },
  { id: 2, name: 'Quarter Notes', difficulty: 'Easy', x: 280, y: 320, completed: true, icon: <Music size={14} /> },
  { id: 3, name: 'Half Notes', difficulty: 'Easy', x: 440, y: 360, completed: false, icon: <Music size={14} /> },
  { id: 4, name: 'Whole Notes', difficulty: 'Medium', x: 600, y: 280, completed: false, icon: <Music size={14} /> },
  { id: 5, name: 'Eighth Notes', difficulty: 'Medium', x: 760, y: 320, completed: false, icon: <Music size={14} /> },
  { id: 6, name: 'Dotted Notes', difficulty: 'Hard', x: 920, y: 400, completed: false, icon: <Music size={14} /> },
  { id: 7, name: 'Triplets', difficulty: 'Hard', x: 1080, y: 320, completed: false, icon: <Music size={14} /> },
  { id: 8, name: 'Sixteenth Notes', difficulty: 'Expert', x: 1240, y: 360, completed: false, icon: <Music size={14} /> },
  { id: 9, name: 'Complex Rhythms', difficulty: 'Expert', x: 1400, y: 280, completed: false, icon: <Music size={14} /> },
];

// Define paths between level nodes
const paths = [
  { from: 1, to: 2 },
  { from: 2, to: 3 },
  { from: 3, to: 4 },
  { from: 4, to: 5 },
  { from: 5, to: 6 },
  { from: 6, to: 7 },
  { from: 7, to: 8 },
  { from: 8, to: 9 },
];

// Optimized particle generation function - further simplified
const generateParticles = (count: number) => {
  return Array.from({ length: count }).map((_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 3 + 1, // Reduced size range
    color: Math.random() > 0.6 ? '#4f46e5' : (Math.random() > 0.5 ? '#06b6d4' : '#8b5cf6'),
    duration: Math.random() * 15 + 10, // Slightly reduced duration
    delay: Math.random() * 5,
    xPath: Math.random() * 100 - 50, // Simplified to single value
    yPath: Math.random() * 100 - 50 // Simplified to single value
  }));
};

// Generate cloud configuration - restored to original detailed version
const generateClouds = (count: number) => {
  return Array.from({ length: count }).map((_, i) => {
    const size = Math.random() * 180 + 120;
    const height = Math.random() * 80 + 60;
    const startX = i < 3 ? Math.random() * 300 : Math.random() * -800 - 400;
    const endX = 2000;
    const yMovement = Math.random() * 15 - 7.5;
    const duration = Math.random() * 35 + 45;
    const top = Math.random() * 60 + 5;
    const delay = i < 4 ? Math.random() * 0.5 : Math.random() * 3;
    
    return {
      id: i,
      size,
      height,
      startX,
      endX,
      yMovement,
      duration,
      top,
      delay,
      centerDuration: Math.random() * 8 + 12,
      leftDuration: Math.random() * 6 + 10,
      leftDelay: Math.random() * 0.5,
      rightDuration: Math.random() * 7 + 9,
      rightDelay: Math.random() * 0.5,
      topDuration: Math.random() * 6 + 8,
      topDelay: Math.random() * 0.3
    };
  });
};

// Generate stars configuration - simplified
const generateStars = (count: number) => {
  return Array.from({ length: count }).map((_, i) => {
    const isBlue = Math.random() > 0.5;
    return {
      id: i,
      color: isBlue ? 'bg-blue-300' : 'bg-purple-300',
      width: Math.random() * 3 + 1,
      height: Math.random() * 3 + 1,
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 100}%`,
      duration: Math.random() * 3 + 2,
      delay: Math.random() * 2
    };
  });
};

// Generate node particle configurations - simplified
const generateNodeParticles = (levelCount: number, particlesPerNode: number) => {
  const nodeParticles: Record<number, Array<{id: number, width: number, height: number, x: number, y: number, duration: number, delay: number}>> = {};
  
  for (let levelId = 1; levelId <= levelCount; levelId++) {
    nodeParticles[levelId] = Array.from({ length: particlesPerNode }).map((_, i) => ({
      id: i,
      width: Math.random() * 5 + 2,
      height: Math.random() * 5 + 2,
      x: Math.random() * 80 - 40,
      y: Math.random() * 80 - 40,
      duration: Math.random() * 1 + 0.5,
      delay: Math.random() * 0.5
    }));
  }
  
  return nodeParticles;
};

const SightReadingWorld: React.FC = () => {
  const { isDarkMode } = useTheme();
  const [selectedLevel, setSelectedLevel] = useState<number | null>(null);
  const [hoveredLevel, setHoveredLevel] = useState<number | null>(null);
  const [particles, setParticles] = useState(() => generateParticles(15)); // Further reduced particle count
  const containerRef = useRef<HTMLDivElement>(null);
  const [dragConstraints, setDragConstraints] = useState({ top: 0, left: 0, right: 0, bottom: 0 });
  
  // Pre-generate stable random values with reduced counts
  const clouds = useMemo(() => generateClouds(8), []); // Restored to 8 clouds for better visuals
  const stars = useMemo(() => generateStars(30), []); // Further reduced star count
  const nodeParticles = useMemo(() => generateNodeParticles(levels.length, 3), []); // Further reduced particle per node
  
  // Reset scroll position when component mounts
  useScrollReset();

  // Regenerate particles periodically with longer interval
  useEffect(() => {
    const interval = setInterval(() => {
      setParticles(generateParticles(15));
    }, 20000); // Increased interval
    
    return () => clearInterval(interval);
  }, []);

  // Calculate drag constraints when the component mounts
  useEffect(() => {
    if (containerRef.current) {
      // Get container dimensions
      const containerWidth = containerRef.current.clientWidth;
      const mapWidth = 1600; // Width of your map
      
      // Only allow horizontal dragging
      setDragConstraints({
        top: 0,
        bottom: 0, // Set to 0 to disable vertical dragging
        left: 0,
        right: Math.max(0, mapWidth - containerWidth) // Horizontal constraint based on map width
      });
    }
  }, []);

  const handleLevelClick = (levelId: number) => {
    setSelectedLevel(levelId);
  };

  const getDifficultyColor = (difficulty: string) => {
    switch(difficulty) {
      case 'Easy': return 'text-green-500';
      case 'Medium': return 'text-yellow-500';
      case 'Hard': return 'text-orange-500';
      case 'Expert': return 'text-red-500';
      default: return 'text-blue-500';
    }
  };

  const getDifficultyGradient = (difficulty: string, isDark: boolean) => {
    switch(difficulty) {
      case 'Easy':
        return isDark ? 'from-green-500 to-green-700' : 'from-green-400 to-green-600';
      case 'Medium':
        return isDark ? 'from-yellow-500 to-amber-700' : 'from-yellow-400 to-amber-600';
      case 'Hard':
        return isDark ? 'from-orange-500 to-red-700' : 'from-orange-400 to-red-600';
      case 'Expert':
        return isDark ? 'from-purple-500 to-purple-700' : 'from-purple-400 to-purple-600';
      default:
        return isDark ? 'from-blue-500 to-indigo-700' : 'from-blue-400 to-indigo-600';
    }
  };

  return (
    <PageTransition>
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <motion.div
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ 
              scale: {
                duration: 3,
                repeat: Infinity,
                repeatType: "reverse",
                ease: "easeInOut"
              }
            }}
            className={`p-2 rounded-full relative ${isDarkMode ? 'bg-indigo-900/30 text-blue-300' : 'bg-indigo-100 text-blue-600'}`}
          >
            <Globe size={28} />
            <motion.div
              className="absolute inset-0 rounded-full"
              animate={{
                boxShadow: [
                  '0 0 0 0px rgba(99, 102, 241, 0.3)',
                  '0 0 0 4px rgba(99, 102, 241, 0.2)',
                  '0 0 0 8px rgba(99, 102, 241, 0.1)',
                  '0 0 0 12px rgba(99, 102, 241, 0.05)',
                  '0 0 0 16px rgba(99, 102, 241, 0)'
                ]
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "linear"
              }}
            />
          </motion.div>
          <h1 className={`text-3xl font-bold ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>
            Sight Reading World
          </h1>
        </div>
        
        {/* Level Detail Modal */}
        <AnimatePresence>
          {selectedLevel && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className={`fixed top-1/4 left-1/2 transform -translate-x-1/2 z-50 rounded-xl shadow-lg p-6 w-96 backdrop-blur-sm
                ${isDarkMode ? 'bg-gray-800 text-gray-300' : 'bg-white text-gray-600'}`}
            >
              <div className="relative">
                <div className="flex items-center mb-3">
                  <Globe size={20} className="mr-2 text-blue-500" />
                  <h2 className="text-2xl font-bold">
                    Level {selectedLevel}: {levels.find(l => l.id === selectedLevel)?.name}
                  </h2>
                </div>
                
                <div className={`p-4 mb-4 rounded-lg bg-opacity-20 ${isDarkMode ? 'bg-gray-700' : 'bg-blue-50'}`}>
                  <div className="flex justify-between items-center mb-3">
                    <div className="flex items-center">
                      <Star className="text-yellow-400 mr-1" size={16} />
                      <span className="font-semibold">Difficulty:</span>
                    </div>
                    <span className={`font-bold ${getDifficultyColor(levels.find(l => l.id === selectedLevel)?.difficulty || '')}`}>
                      {levels.find(l => l.id === selectedLevel)?.difficulty}
                    </span>
                  </div>
                  
                  <div className="h-2 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-600">
                    <motion.div 
                      className={`h-full rounded-full bg-gradient-to-r ${
                        getDifficultyGradient(levels.find(l => l.id === selectedLevel)?.difficulty || '', isDarkMode)
                      }`}
                      initial={{ width: 0 }}
                      animate={{ width: '100%' }}
                      transition={{ duration: 1 }}
                    />
                  </div>
                </div>
                
                <p className={`mb-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  Master {levels.find(l => l.id === selectedLevel)?.name.toLowerCase()} to unlock the next level!
                </p>
                
                <div className="flex justify-between mt-6">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className={`px-4 py-2 rounded-md flex items-center 
                      ${isDarkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'}
                      text-gray-800 dark:text-gray-200`}
                    onClick={() => setSelectedLevel(null)}
                  >
                    <span>Close</span>
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-4 py-2 rounded-md flex items-center gap-2 bg-gradient-to-r from-blue-500 to-indigo-600 
                      text-white font-medium shadow-lg shadow-blue-500/20"
                  >
                    <Zap size={16} />
                    <span>Start</span>
                  </motion.button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* Main World Container */}
        <div 
          ref={containerRef}
          className={`relative rounded-xl shadow-lg overflow-hidden h-[600px]
            ${isDarkMode ? 'bg-gray-800 text-gray-300' : 'bg-white text-gray-600'}`}
        >
          {/* Background Effects */}
          <div className="absolute inset-0 overflow-hidden">
            {particles.map(particle => (
              <motion.div
                key={`particle-${particle.id}`}
                className="absolute rounded-full"
                style={{
                  backgroundColor: particle.color,
                  width: particle.size,
                  height: particle.size,
                  left: `${particle.x}%`,
                  top: `${particle.y}%`,
                }}
                animate={{
                  x: particle.xPath, // Simplified animation
                  y: particle.yPath, // Simplified animation
                  opacity: [0, 0.7, 0] // Slightly reduced peak opacity
                }}
                transition={{
                  duration: particle.duration,
                  times: [0, 0.5, 1],
                  repeat: Infinity,
                  delay: particle.delay,
                  ease: "easeInOut"
                }}
              />
            ))}
          </div>
          
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 background-animate" />
          
          {/* Twinkling stars */}
          <div className="absolute inset-0 grid grid-cols-12 grid-rows-6 gap-4 opacity-20">
            {stars.map((star) => (
              <motion.div
                key={`star-${star.id}`}
                className={`rounded-full ${star.color}`}
                style={{
                  width: star.width,
                  height: star.height,
                  left: star.left,
                  top: star.top,
                  position: 'absolute'
                }}
                animate={{
                  scale: [1, 1.5, 1],
                  opacity: [0.2, 0.7, 0.2],
                }}
                transition={{
                  duration: star.duration,
                  repeat: Infinity,
                  delay: star.delay,
                }}
              />
            ))}
          </div>
          
          {/* Clouds */}
          {clouds.map((cloud) => (
            <div key={`cloud-${cloud.id}`} className="absolute" style={{ top: cloud.top, left: cloud.startX }}>
              <motion.div
                className="relative"
                animate={{
                  x: [0, cloud.endX],
                  y: [0, cloud.yMovement, -cloud.yMovement, 0],
                  opacity: [0, 1, 1, 0.8, 0],
                }}
                transition={{
                  x: {
                    duration: cloud.duration,
                    repeat: Infinity,
                    ease: "linear",
                    delay: cloud.delay,
                    repeatDelay: 0
                  },
                  y: {
                    duration: cloud.duration / 2,
                    repeat: Infinity,
                    repeatType: "reverse",
                    ease: "easeInOut",
                    delay: cloud.delay
                  },
                  opacity: {
                    duration: cloud.duration,
                    times: [0, 0.05, 0.75, 0.9, 1],
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: cloud.delay,
                    repeatDelay: 0
                  }
                }}
              >
                {/* Main cloud body */}
                <div className="relative">
                  {/* Center blob */}
                  <motion.div 
                    className="absolute rounded-full opacity-40 bg-white"
                    style={{
                      width: cloud.size,
                      height: cloud.height,
                      filter: 'blur(8px)',
                      background: 'radial-gradient(circle at center, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.5) 50%, rgba(255,255,255,0) 100%)'
                    }}
                    animate={{ scale: [1, 1.03, 0.97, 1] }}
                    transition={{
                      duration: cloud.centerDuration,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  />
                  {/* Left blob */}
                  <motion.div 
                    className="absolute rounded-full opacity-40 bg-white"
                    style={{
                      width: cloud.size * 0.8,
                      height: cloud.height * 0.8,
                      left: -cloud.size * 0.3,
                      top: cloud.height * 0.1,
                      filter: 'blur(8px)',
                      background: 'radial-gradient(circle at center, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.5) 50%, rgba(255,255,255,0) 100%)'
                    }}
                    animate={{ scale: [1, 0.96, 1.04, 1] }}
                    transition={{
                      duration: cloud.leftDuration,
                      repeat: Infinity,
                      ease: "easeInOut",
                      delay: cloud.leftDelay
                    }}
                  />
                  {/* Right blob */}
                  <motion.div 
                    className="absolute rounded-full opacity-40 bg-white"
                    style={{
                      width: cloud.size * 0.8,
                      height: cloud.height * 0.8,
                      left: cloud.size * 0.3,
                      top: cloud.height * 0.1,
                      filter: 'blur(8px)',
                      background: 'radial-gradient(circle at center, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.5) 50%, rgba(255,255,255,0) 100%)'
                    }}
                    animate={{ scale: [1, 1.05, 0.95, 1] }}
                    transition={{
                      duration: cloud.rightDuration,
                      repeat: Infinity,
                      ease: "easeInOut",
                      delay: cloud.rightDelay
                    }}
                  />
                  {/* Top blob */}
                  <motion.div 
                    className="absolute rounded-full opacity-40 bg-white"
                    style={{
                      width: cloud.size * 0.7,
                      height: cloud.height * 0.7,
                      left: cloud.size * 0.15,
                      top: -cloud.height * 0.2,
                      filter: 'blur(8px)',
                      background: 'radial-gradient(circle at center, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.5) 50%, rgba(255,255,255,0) 100%)'
                    }}
                    animate={{ scale: [1, 0.94, 1.06, 1] }}
                    transition={{
                      duration: cloud.topDuration,
                      repeat: Infinity,
                      ease: "easeInOut",
                      delay: cloud.topDelay
                    }}
                  />
                </div>
              </motion.div>
            </div>
          ))}
          
          {/* World map */}
          <motion.div 
            className="relative w-[1600px] h-[800px] mx-auto"
            drag="x"
            dragConstraints={dragConstraints}
            dragElastic={0.1}
            dragTransition={{ bounceStiffness: 600, bounceDamping: 20 }}
          >
            {/* Level connection paths */}
            <svg className="absolute inset-0 z-10 pointer-events-none">
              {paths.map((path) => {
                const fromLevel = levels.find(l => l.id === path.from);
                const toLevel = levels.find(l => l.id === path.to);
                
                if (!fromLevel || !toLevel) return null;
                
                const isHovered = hoveredLevel === fromLevel.id || hoveredLevel === toLevel.id;
                const isCompleted = fromLevel.completed;
                const isAvailable = fromLevel.completed && !toLevel.completed;
                
                return (
                  <g key={`${path.from}-${path.to}`}>
                    <motion.path
                      d={`M ${fromLevel.x} ${fromLevel.y} Q ${(fromLevel.x + toLevel.x)/2} ${Math.min(fromLevel.y, toLevel.y) - 40} ${toLevel.x} ${toLevel.y}`}
                      stroke={isDarkMode ? "#6366f1" : "#4f46e5"}
                      strokeWidth={isHovered ? 12 : 10}
                      fill="transparent"
                      strokeLinecap="round"
                      initial={{ pathLength: 0 }}
                      animate={{ pathLength: 1 }}
                      transition={{
                        pathLength: {
                          duration: 1.5,
                          ease: "easeInOut",
                          delay: 0.1 + (path.from * 0.05)
                        }
                      }}
                    />
                    
                    {isAvailable && (
                      <motion.circle
                        cx={(fromLevel.x + toLevel.x) / 2}
                        cy={(fromLevel.y + toLevel.y) / 2 - 20}
                        r={6}
                        fill="#6366f1"
                        animate={{
                          y: [0, -5, 0],
                          opacity: [0.8, 1, 0.8]
                        }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          repeatType: "reverse"
                        }}
                      />
                    )}
                    
                    {isCompleted && (
                      <motion.path
                        d={`M ${fromLevel.x} ${fromLevel.y} Q ${(fromLevel.x + toLevel.x)/2} ${Math.min(fromLevel.y, toLevel.y) - 40} ${toLevel.x} ${toLevel.y}`}
                        stroke="#10b981"
                        strokeWidth={3}
                        strokeDasharray="8,8"
                        fill="transparent"
                        strokeLinecap="round"
                        animate={{ strokeDashoffset: [0, -50] }}
                        transition={{
                          duration: 10,
                          repeat: Infinity,
                          ease: "linear"
                        }}
                      />
                    )}
                  </g>
                );
              })}
            </svg>
            
            {/* Level nodes */}
            {levels.map((level) => {
              const isAvailable = level.completed || levels.find(l => l.id === level.id - 1)?.completed;
              const isActive = selectedLevel === level.id;
              const difficulty = getDifficultyGradient(level.difficulty, isDarkMode);
              
              return (
                <motion.div
                  key={level.id}
                  className={`absolute z-20 flex flex-col items-center ${!isAvailable ? 'grayscale opacity-60' : ''}`}
                  style={{ left: level.x, top: level.y }}
                  initial={{ scale: 0 }}
                  animate={{ 
                    scale: 1,
                    y: isAvailable ? [0, -5, 0] : 0,
                  }}
                  transition={{
                    scale: { duration: 0.3, delay: 0.05 * level.id },
                    y: {
                      duration: 3,
                      repeat: Infinity,
                      repeatType: "reverse",
                      delay: 0.2 * level.id
                    }
                  }}
                  whileHover={{ scale: 1.05 }}
                  onClick={() => isAvailable && handleLevelClick(level.id)}
                  onMouseEnter={() => setHoveredLevel(level.id)}
                  onMouseLeave={() => setHoveredLevel(null)}
                >
                  <motion.div 
                    className={`w-16 h-16 rounded-full flex items-center justify-center
                      shadow-lg shadow-purple-500/20 cursor-pointer relative
                      bg-gradient-to-br ${difficulty}
                      ${isActive ? 'ring-4 ring-yellow-400 ring-opacity-80' : ''}`}
                    whileTap={{ scale: 0.95 }}
                  >
                    {level.completed && (
                      <div className="absolute -top-1 -right-1 bg-green-500 text-white w-6 h-6 rounded-full flex items-center justify-center">
                        ✓
                      </div>
                    )}
                    <span className="text-white text-xl font-bold">{level.id}</span>
                    
                    {/* Glowing effect */}
                    <motion.div 
                      className="absolute inset-0 rounded-full"
                      animate={{
                        boxShadow: isActive || hoveredLevel === level.id
                          ? [
                              '0 0 0 0px rgba(147, 51, 234, 0.3)',
                              '0 0 0 5px rgba(147, 51, 234, 0.2)',
                              '0 0 0 10px rgba(147, 51, 234, 0.1)',
                              '0 0 0 15px rgba(147, 51, 234, 0.05)',
                              '0 0 0 20px rgba(147, 51, 234, 0)'
                            ]
                          : ['none']
                      }}
                      transition={{
                        duration: 1.5,
                        repeat: Infinity,
                        ease: "linear"
                      }}
                    />
                    
                    {/* Flying particles effect for active/hovered nodes */}
                    {(isActive || hoveredLevel === level.id) && isAvailable && (
                      <>
                        {nodeParticles[level.id].map((particle) => (
                          <motion.div
                            key={`node-particle-${level.id}-${particle.id}`}
                            className="absolute rounded-full bg-white"
                            style={{
                              width: particle.width,
                              height: particle.height,
                            }}
                            animate={{
                              x: [0, particle.x],
                              y: [0, particle.y],
                              opacity: [1, 0],
                              scale: [0, 1]
                            }}
                            transition={{
                              duration: particle.duration,
                              repeat: Infinity,
                              delay: particle.delay
                            }}
                          />
                        ))}
                      </>
                    )}
                  </motion.div>
                  
                  <motion.div 
                    className={`mt-2 px-3 py-1 rounded-md text-sm font-medium
                      ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'}
                      ${getDifficultyColor(level.difficulty)}
                      ${isActive ? 'ring-2 ring-yellow-400 ring-opacity-50' : ''}
                      flex items-center gap-1`}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 * level.id }}
                  >
                    {level.icon}
                    <span>{level.name}</span>
                  </motion.div>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
        
        {/* Footer */}
        <div className="mt-6 text-center flex flex-col items-center">
          <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'} mb-2`}>
            Click on a level to start a sight reading exercise.
          </p>
          <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full
            ${isDarkMode ? 'bg-gray-700 text-gray-200' : 'bg-gray-100 text-gray-700'}`}
          >
            <Sparkles size={14} className="text-yellow-400" />
            <span className="text-sm font-medium">Complete levels to unlock new challenges!</span>
          </div>
        </div>
      </div>
    </PageTransition>
  );
};

export default SightReadingWorld; 