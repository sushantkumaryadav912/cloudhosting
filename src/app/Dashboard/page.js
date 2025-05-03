'use client';

import { useState, useEffect } from 'react';
import {
  ArrowUp,
  Server,
  Cloud,
  Database,
  Settings,
  Cpu,
  AlertTriangle,
  BarChart2,
  Clock,
  Globe,
  Zap,
  ChevronDown,
  RefreshCw,
  Home,
  LogOut,
  User,
  Bell,
  HelpCircle,
  Menu,
  X,
  Layers,
  Box,
  Monitor,
  Shield
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

// Mock data - in a real app this would come from an API
const mockDeployments = [
  { id: 1, name: 'Web App', status: 'running', type: 'VPS', Cpu: 35, memory: 42, deployedAt: '2025-03-28T14:30:00' },
  { id: 2, name: 'API Server', status: 'running', type: 'Shared', Cpu: 12, memory: 28, deployedAt: '2025-03-30T09:15:00' },
  { id: 3, name: 'Database', status: 'warning', type: 'VPS', Cpu: 78, memory: 85, deployedAt: '2025-03-15T11:45:00' },
  { id: 4, name: 'Static Site', status: 'stopped', type: 'Shared', Cpu: 0, memory: 5, deployedAt: '2025-02-20T16:20:00' }
];

const resources = {
  CpuTotal: 8,
  CpuUsed: 3.2,
  memoryTotal: 16,
  memoryUsed: 9.4,
  storageTotal: 500,
  storageUsed: 215,
  bandwidthTotal: 1000,
  bandwidthUsed: 347
};

// Mock user data instead of using AuthContext
const mockUser = {
  username: 'DemoUser',
  email: 'demo@example.com',
  avatar: '/api/placeholder/32/32'
};

export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState(mockUser);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [activeService, setActiveService] = useState(null);
  const [deployments, setDeployments] = useState(mockDeployments);
  const [isDeploying, setIsDeploying] = useState(false);
  const [showVPSForm, setShowVPSForm] = useState(false);
  const [showAutoDeployForm, setShowAutoDeployForm] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [servicesExpanded, setServicesExpanded] = useState(false);

  // Form states
  const [newDeployment, setNewDeployment] = useState({
    name: '',
    type: 'VPS',
    Cpu: 2,
    memory: 4,
    storage: 50
  });

  // Simulate authentication loading
  useEffect(() => {
    // Simulate API call to check authentication
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);

  const handleRefresh = () => {
    setIsRefreshing(true);
    // Simulate API call
    setTimeout(() => {
      setIsRefreshing(false);
    }, 1000);
  };

  const handleDeploy = (e) => {
    e.preventDefault();
    setIsDeploying(true);

    // Simulate deployment
    setTimeout(() => {
      const newItem = {
        id: deployments.length + 1,
        name: newDeployment.name,
        status: 'running',
        type: newDeployment.type,
        Cpu: Math.floor(Math.random() * 30) + 10,
        memory: Math.floor(Math.random() * 40) + 20,
        deployedAt: new Date().toISOString()
      };

      setDeployments([...deployments, newItem]);
      setIsDeploying(false);
      setShowVPSForm(false);
      setShowAutoDeployForm(false);
      setNewDeployment({
        name: '',
        type: 'VPS',
        Cpu: 2,
        memory: 4,
        storage: 50
      });
    }, 2000);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'running': return 'bg-green-500';
      case 'warning': return 'bg-yellow-500';
      case 'stopped': return 'bg-gray-500';
      default: return 'bg-blue-500';
    }
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const toggleServices = () => {
    setServicesExpanded(!servicesExpanded);
  };

  // Navigation handlers for VPS and Auto Deploy
  const handleVPSClick = () => {
    router.push('/VPS');
  };

  const handleAutoDeployClick = () => {
    router.push('/AutoDeploy');
  };

  // Replace logout function from AuthContext
  const handleLogout = () => {
    // In a real app, you would clear tokens, cookies, etc.
    router.push('/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="h-10 w-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user) {
    router.push('/login');
    return null;
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Left Sidebar Navigation - Desktop */}
      <div className={`bg-gray-900 text-white ${sidebarOpen ? 'w-64' : 'w-20'} transition-all duration-300 ease-in-out hidden md:block`}>
        <div className="flex items-center justify-between h-16 px-4 border-b border-gray-800">
          <div className={`flex items-center ${sidebarOpen ? '' : 'justify-center w-full'}`}>
            {sidebarOpen ? (
              <h1 className="text-xl font-bold">CloudDash</h1>
            ) : (
              <Cloud className="h-8 w-8" />
            )}
          </div>
          <button onClick={toggleSidebar} className="text-gray-400 hover:text-white">
            {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        <div className="py-4">
          <ul>
            <li className={`mb-1 ${activeTab === 'overview' ? 'bg-blue-700' : 'hover:bg-gray-800'} rounded-md`}>
              <button
                onClick={() => setActiveTab('overview')}
                className={`flex items-center w-full px-4 py-3 text-sm font-medium ${sidebarOpen ? '' : 'justify-center'}`}
              >
                <Home className="h-5 w-5 mr-3" />
                {sidebarOpen && <span>Overview</span>}
              </button>
            </li>
            
            {/* Services dropdown */}
            <li className="mb-1">
              <button
                onClick={toggleServices}
                className={`flex items-center justify-between w-full px-4 py-3 text-sm font-medium hover:bg-gray-800 rounded-md ${servicesExpanded ? 'bg-gray-800' : ''}`}
              >
                <div className="flex items-center">
                  <Layers className="h-5 w-5 mr-3" />
                  {sidebarOpen && <span>Services</span>}
                </div>
                {sidebarOpen && <ChevronDown className={`h-4 w-4 transition-transform ${servicesExpanded ? 'rotate-180' : ''}`} />}
              </button>
              
              {/* Services submenu */}
              {servicesExpanded && sidebarOpen && (
                <ul className="ml-6 mt-1 space-y-1">
                  <li className={`rounded-md ${activeService === 'vps' ? 'bg-blue-700' : 'hover:bg-gray-700'}`}>
                    <button
                      onClick={handleVPSClick}
                      className="flex items-center w-full px-3 py-2 text-sm"
                    >
                      <Server className="h-4 w-4 mr-2" />
                      <span>VPS</span>
                    </button>
                  </li>
                  <li className={`rounded-md ${activeService === 'auto' ? 'bg-blue-700' : 'hover:bg-gray-700'}`}>
                    <button
                      onClick={handleAutoDeployClick}
                      className="flex items-center w-full px-3 py-2 text-sm"
                    >
                      <Box className="h-4 w-4 mr-2" />
                      <span>Auto Deployment</span>
                    </button>
                  </li>
                </ul>
              )}
            </li>
            
            <li className={`mb-1 ${activeTab === 'deployments' ? 'bg-blue-700' : 'hover:bg-gray-800'} rounded-md`}>
              <button
                onClick={() => setActiveTab('deployments')}
                className={`flex items-center w-full px-4 py-3 text-sm font-medium ${sidebarOpen ? '' : 'justify-center'}`}
              >
                <Monitor className="h-5 w-5 mr-3" />
                {sidebarOpen && <span>Deployments</span>}
              </button>
            </li>
            
            <li className={`mb-1 ${activeTab === 'resources' ? 'bg-blue-700' : 'hover:bg-gray-800'} rounded-md`}>
              <button
                onClick={() => setActiveTab('resources')}
                className={`flex items-center w-full px-4 py-3 text-sm font-medium ${sidebarOpen ? '' : 'justify-center'}`}
              >
                <BarChart2 className="h-5 w-5 mr-3" />
                {sidebarOpen && <span>Resources</span>}
              </button>
            </li>
            
            <li className={`mb-1 ${activeTab === 'profile' ? 'bg-blue-700' : 'hover:bg-gray-800'} rounded-md`}>
              <button
                onClick={() => setActiveTab('profile')}
                className={`flex items-center w-full px-4 py-3 text-sm font-medium ${sidebarOpen ? '' : 'justify-center'}`}
              >
                <User className="h-5 w-5 mr-3" />
                {sidebarOpen && <span>Profile</span>}
              </button>
            </li>
            
            <li className={`mb-1 ${activeTab === 'notifications' ? 'bg-blue-700' : 'hover:bg-gray-800'} rounded-md`}>
              <button
                onClick={() => setActiveTab('notifications')}
                className={`flex items-center w-full px-4 py-3 text-sm font-medium ${sidebarOpen ? '' : 'justify-center'}`}
              >
                <Bell className="h-5 w-5 mr-3" />
                {sidebarOpen && <span>Notifications</span>}
              </button>
            </li>
            
            <li className={`mb-1 ${activeTab === 'settings' ? 'bg-blue-700' : 'hover:bg-gray-800'} rounded-md`}>
              <button
                onClick={() => setActiveTab('settings')}
                className={`flex items-center w-full px-4 py-3 text-sm font-medium ${sidebarOpen ? '' : 'justify-center'}`}
              >
                <Settings className="h-5 w-5 mr-3" />
                {sidebarOpen && <span>Settings</span>}
              </button>
            </li>
          </ul>

          <div className="mt-8 px-4">
            <div className={`border-t border-gray-800 pt-4 ${sidebarOpen ? '' : 'text-center'}`}>
              <div className="mb-4">
                {sidebarOpen && (
                  <div className="flex items-center mb-3">
                    <Image
                      src={user.avatar}
                      alt="User"
                      width={32}
                      height={32}
                      className="h-8 w-8 rounded-full"
                    />
                    <div className="ml-3">
                      <p className="text-sm font-medium">{user.username}</p>
                      <p className="text-xs text-gray-500">{user.email}</p>
                    </div>
                  </div>
                )}
              </div>
              <button
                onClick={handleLogout}
                className={`flex items-center w-full px-4 py-3 text-sm font-medium bg-red-700 hover:bg-red-800 rounded-md ${sidebarOpen ? '' : 'justify-center'}`}
              >
                <LogOut className="h-5 w-5 mr-3" />
                {sidebarOpen && <span>Logout</span>}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Menu Button */}
      <div className="md:hidden fixed top-0 left-0 z-40 p-4">
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 rounded-md bg-gray-900 text-white"
        >
          {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile Sidebar */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-30 bg-gray-900 bg-opacity-90 md:hidden">
          <div className="flex flex-col h-full p-5 pt-16">
            <ul className="space-y-2">
              <li className={`${activeTab === 'overview' ? 'bg-blue-700' : ''} rounded-md`}>
                <button
                  onClick={() => {
                    setActiveTab('overview');
                    setMobileMenuOpen(false);
                  }}
                  className="flex items-center w-full px-4 py-3 text-white"
                >
                  <Home className="h-5 w-5 mr-3" />
                  <span>Overview</span>
                </button>
              </li>
              
              {/* Services dropdown for mobile */}
              <li>
                <button
                  onClick={toggleServices}
                  className="flex items-center justify-between w-full px-4 py-3 text-white"
                >
                  <div className="flex items-center">
                    <Layers className="h-5 w-5 mr-3" />
                    <span>Services</span>
                  </div>
                  <ChevronDown className={`h-4 w-4 transition-transform ${servicesExpanded ? 'rotate-180' : ''}`} />
                </button>
                
                {servicesExpanded && (
                  <ul className="ml-6 mt-1 space-y-1">
                    <li className={`rounded-md ${activeService === 'vps' ? 'bg-blue-700' : ''}`}>
                      <button
                        onClick={() => {
                          handleVPSClick();
                          setMobileMenuOpen(false);
                        }}
                        className="flex items-center w-full px-3 py-2 text-white"
                      >
                        <Server className="h-4 w-4 mr-2" />
                        <span>VPS</span>
                      </button>
                    </li>
                    <li className={`rounded-md ${activeService === 'auto' ? 'bg-blue-700' : ''}`}>
                      <button
                        onClick={() => {
                          handleAutoDeployClick();
                          setMobileMenuOpen(false);
                        }}
                        className="flex items-center w-full px-3 py-2 text-white"
                      >
                        <Box className="h-4 w-4 mr-2" />
                        <span>Auto Deployment</span>
                      </button>
                    </li>
                  </ul>
                )}
              </li>
              
              <li className={`${activeTab === 'deployments' ? 'bg-blue-700' : ''} rounded-md`}>
                <button
                  onClick={() => {
                    setActiveTab('deployments');
                    setMobileMenuOpen(false);
                  }}
                  className="flex items-center w-full px-4 py-3 text-white"
                >
                  <Monitor className="h-5 w-5 mr-3" />
                  <span>Deployments</span>
                </button>
              </li>
              
              <li className={`${activeTab === 'resources' ? 'bg-blue-700' : ''} rounded-md`}>
                <button
                  onClick={() => {
                    setActiveTab('resources');
                    setMobileMenuOpen(false);
                  }}
                  className="flex items-center w-full px-4 py-3 text-white"
                >
                  <BarChart2 className="h-5 w-5 mr-3" />
                  <span>Resources</span>
                </button>
              </li>
              
              <li className={`${activeTab === 'profile' ? 'bg-blue-700' : ''} rounded-md`}>
                <button
                  onClick={() => {
                    setActiveTab('profile');
                    setMobileMenuOpen(false);
                  }}
                  className="flex items-center w-full px-4 py-3 text-white"
                >
                  <User className="h-5 w-5 mr-3" />
                  <span>Profile</span>
                </button>
              </li>
              
              <li className={`${activeTab === 'notifications' ? 'bg-blue-700' : ''} rounded-md`}>
                <button
                  onClick={() => {
                    setActiveTab('notifications');
                    setMobileMenuOpen(false);
                  }}
                  className="flex items-center w-full px-4 py-3 text-white"
                >
                  <Bell className="h-5 w-5 mr-3" />
                  <span>Notifications</span>
                </button>
              </li>
              
              <li className={`${activeTab === 'settings' ? 'bg-blue-700' : ''} rounded-md`}>
                <button
                  onClick={() => {
                    setActiveTab('settings');
                    setMobileMenuOpen(false);
                  }}
                  className="flex items-center w-full px-4 py-3 text-white"
                >
                  <Settings className="h-5 w-5 mr-3" />
                  <span>Settings</span>
                </button>
              </li>
              
              <li className="border-t border-gray-800 mt-4 pt-4"></li>
              <li className="bg-red-700 hover:bg-red-800 rounded-md">
                <button
                  onClick={() => {
                    handleLogout();
                    setMobileMenuOpen(false);
                  }}
                  className="flex items-center w-full px-4 py-3 text-white"
                >
                  <LogOut className="h-5 w-5 mr-3" />
                  <span>Logout</span>
                </button>
              </li>
            </ul>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white shadow z-10">
          <div className="px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex justify-between items-center">
              <h1 className="text-xl font-bold text-gray-900">
                {activeTab === 'services' 
                  ? `Services - ${activeService === 'vps' ? 'VPS' : 'Auto Deployment'}`
                  : activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}
              </h1>
              <div className="flex items-center gap-4">
                <button
                  onClick={handleRefresh}
                  className="p-2 rounded-full hover:bg-gray-100"
                >
                  <RefreshCw className={`h-5 w-5 ${isRefreshing ? 'animate-spin' : ''}`} />
                </button>
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm font-medium">All Systems Operational</span>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 overflow-auto bg-gray-50 p-4 sm:p-6 lg:p-8">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div>
              {/* Stats */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="bg-white shadow rounded-lg p-6 hover:shadow-md transition-shadow">
                  <div className="flex items-center">
                    <div className="bg-blue-100 p-3 rounded-full">
                      <Server className="h-6 w-6 text-blue-600" />
                    </div>
                    <div className="ml-4">
                      <h3 className="text-sm font-medium text-gray-500">Total Deployments</h3>
                      <span className="text-lg font-semibold">{deployments.length}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-white shadow rounded-lg p-6 hover:shadow-md transition-shadow">
                  <div className="flex items-center">
                    <div className="bg-green-100 p-3 rounded-full">
                      <Zap className="h-6 w-6 text-green-600" />
                    </div>
                    <div className="ml-4">
                      <h3 className="text-sm font-medium text-gray-500">Active Services</h3>
                      <span className="text-lg font-semibold">
                        {deployments.filter(d => d.status === 'running').length}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="bg-white shadow rounded-lg p-6 hover:shadow-md transition-shadow">
                  <div className="flex items-center">
                    <div className="bg-yellow-100 p-3 rounded-full">
                      <Cpu className="h-6 w-6 text-yellow-600" />
                    </div>
                    <div className="ml-4">
                      <h3 className="text-sm font-medium text-gray-500">CPU Usage</h3>
                      <span className="text-lg font-semibold">{Math.round((resources.CpuUsed / resources.CpuTotal) * 100)}%</span>
                    </div>
                  </div>
                </div>

                <div className="bg-white shadow rounded-lg p-6 hover:shadow-md transition-shadow">
                  <div className="flex items-center">
                    <div className="bg-purple-100 p-3 rounded-full">
                      <Database className="h-6 w-6 text-purple-600" />
                    </div>
                    <div className="ml-4">
                      <h3 className="text-sm font-medium text-gray-500">Storage Usage</h3>
                      <span className="text-lg font-semibold">{Math.round((resources.storageUsed / resources.storageTotal) * 100)}%</span>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Recent Deployments */}
              <div className="bg-white shadow rounded-lg mb-8">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h2 className="text-lg font-medium">Recent Deployments</h2>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">CPU</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Memory</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Deployed</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {deployments.slice(0, 3).map((deployment) => (
                        <tr key={deployment.id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{deployment.name}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(deployment.status)} text-white`}>
                              {deployment.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{deployment.type}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{deployment.Cpu}%</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{deployment.memory}%</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDate(deployment.deployedAt)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
              
              {/* Resource Usage */}
              <div className="bg-white shadow rounded-lg">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h2 className="text-lg font-medium">Resource Usage</h2>
                </div>
                <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-2">CPU Usage</h3>
                    <div className="h-4 bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-blue-600 rounded-full" 
                        style={{ width: `${(resources.CpuUsed / resources.CpuTotal) * 100}%` }}
                      ></div>
                    </div>
                    <div className="mt-1 flex justify-between text-xs text-gray-500">
                      <span>{resources.CpuUsed} cores used</span>
                      <span>{resources.CpuTotal} cores total</span>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-2">Memory Usage</h3>
                    <div className="h-4 bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-green-600 rounded-full" 
                        style={{ width: `${(resources.memoryUsed / resources.memoryTotal) * 100}%` }}
                      ></div>
                    </div>
                    <div className="mt-1 flex justify-between text-xs text-gray-500">
                      <span>{resources.memoryUsed} GB used</span>
                      <span>{resources.memoryTotal} GB total</span>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-2">Storage Usage</h3>
                    <div className="h-4 bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-purple-600 rounded-full" 
                        style={{ width: `${(resources.storageUsed / resources.storageTotal) * 100}%` }}
                      ></div>
                    </div>
                    <div className="mt-1 flex justify-between text-xs text-gray-500">
                      <span>{resources.storageUsed} GB used</span>
                      <span>{resources.storageTotal} GB total</span>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-2">Bandwidth Usage</h3>
                    <div className="h-4 bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-yellow-600 rounded-full" 
                        style={{ width: `${(resources.bandwidthUsed / resources.bandwidthTotal) * 100}%` }}
                      ></div>
                    </div>
                    <div className="mt-1 flex justify-between text-xs text-gray-500">
                      <span>{resources.bandwidthUsed} GB used</span>
                      <span>{resources.bandwidthTotal} GB total</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* Deployments Tab */}
          {activeTab === 'deployments' && (
            <div className="bg-white shadow rounded-lg">
              <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                <h2 className="text-lg font-medium">All Deployments</h2>
                <div className="flex space-x-2">
                  <button 
                    onClick={handleVPSClick}
                    className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded text-white bg-blue-600 hover:bg-blue-700"
                  >
                    <Server className="h-3.5 w-3.5 mr-1" />
                    New VPS
                  </button>
                  <button 
                    onClick={handleAutoDeployClick}
                    className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded text-white bg-green-600 hover:bg-green-700"
                  >
                    <Box className="h-3.5 w-3.5 mr-1" />
                    Auto Deploy
                  </button>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">CPU</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Memory</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Deployed</th>
                      <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {deployments.map((deployment) => (
                      <tr key={deployment.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{deployment.name}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(deployment.status)} text-white`}>
                            {deployment.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{deployment.type}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{deployment.Cpu}%</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{deployment.memory}%</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDate(deployment.deployedAt)}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button className="text-blue-600 hover:text-blue-900 mr-3">Manage</button>
                          <button className="text-red-600 hover:text-red-900">Stop</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
          
          {/* Profile Tab */}
          {activeTab === 'profile' && (
            <div className="bg-white shadow rounded-lg">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-medium">Profile Settings</h2>
              </div>
              <div className="p-6">
                <div className="flex items-center mb-6">
                  <div className="mr-4">
                    <Image
                      src={user.avatar}
                      alt="User"
                      width={80}
                      height={80}
                      className="h-20 w-20 rounded-full"
                    />
                  </div>
                  <div>
                    <h3 className="text-xl font-medium">{user.username}</h3>
                    <p className="text-gray-500">{user.email}</p>
                    <button className="mt-2 px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700">
                      Change Avatar
                    </button>
                  </div>
                </div>
                
                <form className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">Username</label>
                      <input
                        type="text"
                        id="username"
                        defaultValue={user.username}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                      <input
                        type="email"
                        id="email"
                        defaultValue={user.email}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                      <input
                        type="password"
                        id="password"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Leave blank to keep current password"
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="confirm-password" className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
                      <input
                        type="password"
                        id="confirm-password"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Leave blank to keep current password"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <button
                      type="submit"
                      className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      Save Changes
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
          
          {/* Notifications Tab */}
          {activeTab === 'notifications' && (
            <div className="bg-white shadow rounded-lg">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-medium">Notifications</h2>
              </div>
              <div className="p-6">
                <div className="space-y-6">
                  <div className="flex items-center justify-between pb-4 border-b border-gray-200">
                    <div>
                      <h3 className="text-sm font-medium">Email Notifications</h3>
                      <p className="text-xs text-gray-500 mt-1">Receive email alerts for important events</p>
                    </div>
                    <div className="relative inline-block w-10 mr-2 align-middle select-none">
                      <input type="checkbox" id="email-toggle" defaultChecked className="sr-only" />
                      <label htmlFor="email-toggle" className="block h-6 w-12 rounded-full bg-gray-300 cursor-pointer"></label>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between pb-4 border-b border-gray-200">
                    <div>
                      <h3 className="text-sm font-medium">System Alerts</h3>
                      <p className="text-xs text-gray-500 mt-1">Get notified about system performance issues</p>
                    </div>
                    <div className="relative inline-block w-10 mr-2 align-middle select-none">
                      <input type="checkbox" id="system-toggle" defaultChecked className="sr-only" />
                      <label htmlFor="system-toggle" className="block h-6 w-12 rounded-full bg-gray-300 cursor-pointer"></label>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between pb-4 border-b border-gray-200">
                    <div>
                      <h3 className="text-sm font-medium">Deployment Notifications</h3>
                      <p className="text-xs text-gray-500 mt-1">Receive alerts when deployments succeed or fail</p>
                    </div>
                    <div className="relative inline-block w-10 mr-2 align-middle select-none">
                      <input type="checkbox" id="deployment-toggle" defaultChecked className="sr-only" />
                      <label htmlFor="deployment-toggle" className="block h-6 w-12 rounded-full bg-gray-300 cursor-pointer"></label>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-medium">Marketing Updates</h3>
                      <p className="text-xs text-gray-500 mt-1">Receive news about new features and offers</p>
                    </div>
                    <div className="relative inline-block w-10 mr-2 align-middle select-none">
                      <input type="checkbox" id="marketing-toggle" className="sr-only" />
                      <label htmlFor="marketing-toggle" className="block h-6 w-12 rounded-full bg-gray-300 cursor-pointer"></label>
                    </div>
                  </div>
                </div>
                
                <div className="mt-6">
                  <button
                    type="button"
                    className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Save Preferences
                  </button>
                </div>
              </div>
            </div>
          )}
          
          {/* Settings Tab */}
          {activeTab === 'settings' && (
            <div className="bg-white shadow rounded-lg">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-medium">Account Settings</h2>
              </div>
              <div className="p-6">
                <div className="space-y-6">
                  <div>
                    <h3 className="text-sm font-medium mb-3">Time Zone</h3>
                    <select className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500">
                      <option value="UTC">UTC (Coordinated Universal Time)</option>
                      <option value="EST">EST (Eastern Standard Time)</option>
                      <option value="CST">CST (Central Standard Time)</option>
                      <option value="PST">PST (Pacific Standard Time)</option>
                      <option value="IST" selected>IST (Indian Standard Time)</option>
                    </select>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium mb-3">Two-Factor Authentication</h3>
                    <button className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700">
                      Enable 2FA
                    </button>
                    <p className="text-xs text-gray-500 mt-2">Secure your account with two-factor authentication</p>
                  </div>
                  
                  <div className="border-t border-gray-200 pt-6">
                    <h3 className="text-sm font-medium text-red-600 mb-3">Danger Zone</h3>
                    <div className="space-y-4">
                      <button className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300">
                        Export All Data
                      </button>
                      <button className="px-4 py-2 bg-red-100 text-red-600 rounded hover:bg-red-200">
                        Delete Account
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
