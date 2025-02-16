import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ChartOptions
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

// Add default chart options
export const defaultChartOptions: ChartOptions<'line'> = {
  responsive: true,
  maintainAspectRatio: false,
  scales: {
    x: {
      grid: {
        display: false
      }
    },
    y: {
      beginAtZero: true,
      grid: {
        color: 'rgba(0,0,0,0.1)'
      }
    }
  },
  plugins: {
    legend: {
      position: 'top' as const
    }
  }
};

// Add chart theme colors
export const chartColors = {
  primary: 'rgb(59, 130, 246)',
  success: 'rgb(34, 197, 94)',
  warning: 'rgb(234, 179, 8)',
  danger: 'rgb(239, 68, 68)',
  info: 'rgb(6, 182, 212)'
}; 