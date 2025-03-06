import { motion } from 'framer-motion';
import { IconType } from 'react-icons';
import { useRouter } from 'next/navigation';

interface QuickAction {
  id: string;
  title: string;
  icon: IconType;
  color: string;
  href: string;
  description: string;
}

interface QuickActionsProps {
  actions: QuickAction[];
}

export const QuickActions = ({ actions }: QuickActionsProps) => {
  const router = useRouter();

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="grid grid-cols-2 md:grid-cols-4 gap-4"
    >
      {actions.map((action) => (
        <motion.button
          key={action.id}
          variants={item}
          whileHover={{ 
            scale: 1.02,
            transition: { duration: 0.2 }
          }}
          whileTap={{ scale: 0.98 }}
          onClick={() => router.push(action.href)}
          className="relative group bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 overflow-hidden"
        >
          <div className="relative z-10">
            <div className={`${action.color} p-3 rounded-lg inline-block mb-3`}>
              <action.icon className="w-6 h-6" />
            </div>
            <h3 className="font-semibold mb-2">{action.title}</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {action.description}
            </p>
          </div>
          
          {/* Background Gradient Effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent dark:from-gray-800 to-white dark:to-gray-800 z-0 opacity-0 group-hover:opacity-100 transition-opacity" />
          
          {/* Large Icon Background */}
          <div className="absolute -right-4 -bottom-4 opacity-[0.02] group-hover:opacity-[0.05] transition-opacity">
            <action.icon className="w-24 h-24" />
          </div>
        </motion.button>
      ))}
    </motion.div>
  );
}; 