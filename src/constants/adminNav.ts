import {
  HiOutlineChartPie,
  HiOutlineUserGroup,
  HiOutlineScale,
  HiOutlineOfficeBuilding,
  HiOutlineCash,
  HiOutlineDocumentReport,
  HiOutlineUsers,
} from 'react-icons/hi';

export const adminNavItems = [
  {
    title: 'Dashboard',
    icon: HiOutlineChartPie,
    path: '/admin/dashboard'
  },
  {
    title: 'Lawyer Management',
    icon: HiOutlineUserGroup,
    submenu: [
      { title: 'All Lawyers', path: '/admin/lawyers' },
      { title: 'Assignments', path: '/admin/lawyers/assignments' },
      { title: 'Performance', path: '/admin/lawyers/performance' },
      { title: 'Specializations', path: '/admin/lawyers/specializations' }
    ]
  },
  {
    title: 'Case Management',
    icon: HiOutlineScale,
    submenu: [
      { title: 'Active Cases', path: '/admin/cases/active' },
      { title: 'Case Assignment', path: '/admin/cases/assign' },
      { title: 'Priority Cases', path: '/admin/cases/priority' },
      { title: 'Appeals', path: '/admin/cases/appeals' }
    ]
  },
  {
    title: 'Office Management',
    icon: HiOutlineOfficeBuilding,
    submenu: [
      { title: 'Resources', path: '/admin/office/resources' },
      { title: 'Performance', path: '/admin/office/performance' },
      { title: 'Planning', path: '/admin/office/planning' }
    ]
  },
  {
    title: 'Client Services',
    icon: HiOutlineCash,
    submenu: [
      { title: 'Service Requests', path: '/admin/services/requests' },
      { title: 'Packages', path: '/admin/services/packages' },
      { title: 'Fee Structure', path: '/admin/services/fees' }
    ]
  },
  {
    title: 'Coordinator Management',
    icon: HiOutlineUsers,
    submenu: [
      { title: 'Project Based', path: '/admin/coordinators/project' },
      { title: 'Permanent', path: '/admin/coordinators/permanent' },
      { title: 'Assignments', path: '/admin/coordinators/assignments' }
    ]
  },
  {
    title: 'Reports',
    icon: HiOutlineDocumentReport,
    submenu: [
      { title: 'Statistics', path: '/admin/reports/statistics' },
      { title: 'Performance', path: '/admin/reports/performance' },
      { title: 'Financial', path: '/admin/reports/financial' }
    ]
  }
]; 