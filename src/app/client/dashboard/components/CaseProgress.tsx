import { motion } from 'framer-motion';
import { HiOutlineScale, HiOutlineCheck, HiOutlineClock } from 'react-icons/hi';

interface CaseStage {
  id: string;
  title: string;
  description: string;
  status: 'COMPLETED' | 'IN_PROGRESS' | 'PENDING';
  completedAt?: string;
  estimatedCompletion?: string;
  requirements?: string[];
}

interface CaseProgressProps {
  caseId: string;
  stages: CaseStage[];
  currentStage: number;
  progress: number;
}

export const CaseProgress = ({ caseId, stages, currentStage, progress }: CaseProgressProps) => {
  const getStageIcon = (status: CaseStage['status'], index: number) => {
    if (status === 'COMPLETED') {
      return <HiOutlineCheck className="w-5 h-5 text-white" />;
    }
    if (status === 'IN_PROGRESS') {
      return <HiOutlineClock className="w-5 h-5 text-white animate-pulse" />;
    }
    return <span className="text-sm font-medium text-white">{index + 1}</span>;
  };

  const getStageColor = (status: CaseStage['status']) => {
    switch (status) {
      case 'COMPLETED':
        return 'bg-green-500';
      case 'IN_PROGRESS':
        return 'bg-blue-500';
      default:
        return 'bg-gray-300 dark:bg-gray-600';
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2">
          <HiOutlineScale className="w-6 h-6 text-primary-500" />
          <h2 className="text-xl font-semibold">Case Progress</h2>
        </div>
        <div className="text-sm text-gray-500 dark:text-gray-400">
          Case #{caseId.slice(-6).toUpperCase()}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="relative h-2 bg-gray-100 dark:bg-gray-700 rounded-full mb-8">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 1, ease: 'easeOut' }}
          className="absolute h-full bg-primary-500 rounded-full"
        />
      </div>

      {/* Stages */}
      <div className="space-y-6">
        {stages.map((stage, index) => (
          <div key={stage.id} className="relative">
            {/* Connector Line */}
            {index < stages.length - 1 && (
              <div
                className={`absolute left-[1.1rem] top-10 bottom-0 w-0.5 ${
                  index < currentStage ? 'bg-primary-500' : 'bg-gray-200 dark:bg-gray-700'
                }`}
              />
            )}

            <div className="flex items-start space-x-4">
              {/* Stage Icon */}
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: index * 0.2 }}
                className={`relative z-10 flex-shrink-0 w-9 h-9 rounded-full ${getStageColor(stage.status)} 
                  flex items-center justify-center shadow-lg`}
              >
                {getStageIcon(stage.status, index)}
              </motion.div>

              {/* Stage Content */}
              <div className="flex-grow">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium text-lg">{stage.title}</h3>
                  {stage.status === 'COMPLETED' && stage.completedAt && (
                    <span className="text-sm text-green-500">
                      Completed {new Date(stage.completedAt).toLocaleDateString()}
                    </span>
                  )}
                </div>
                <p className="text-gray-600 dark:text-gray-400 mt-1">
                  {stage.description}
                </p>

                {/* Requirements */}
                {stage.requirements && stage.requirements.length > 0 && (
                  <div className="mt-3">
                    <h4 className="text-sm font-medium mb-2">Requirements:</h4>
                    <ul className="space-y-1">
                      {stage.requirements.map((req, i) => (
                        <li key={i} className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                          <span className="w-1.5 h-1.5 rounded-full bg-primary-500 mr-2" />
                          {req}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Estimated Completion */}
                {stage.status === 'IN_PROGRESS' && stage.estimatedCompletion && (
                  <div className="mt-3 text-sm text-blue-500">
                    Estimated completion: {new Date(stage.estimatedCompletion).toLocaleDateString()}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}; 