'use client';

import { useState, useEffect } from 'react';
import {
  BarChart3,
  Users,
  Settings,
  Database,
  Activity,
  Globe,
  TrendingUp,
  Shield,
  UserCheck,
  AlertTriangle,
  CheckCircle,
  Edit,
  Eye,
  Trash2,
  Plus,
  Menu,
  X,
  ChevronDown,
  FileText,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { ChaptersSection } from '@/components/dashboard/admin/ChaptersSection';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { DashboardStats } from './admin/DashboardStats';
import { UsersSection } from './admin/UsersSection';
import { SuperAdminHeader } from './layout/SuperAdminHeader';

interface SuperAdminDashboardProps {
  user: {
    name: string;
    email: string;
    role: string;
    chapter?: string;
  };
}

interface Chapter {
  name: string;
  users: number;
  moderators: number;
  status: 'active' | 'pending';
}

export function SuperAdminDashboard({ user }: SuperAdminDashboardProps) {
  const [activeTab, setActiveTab] = useState('overview');
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [currentLang, setCurrentLang] = useState('en')

  const recentActivities = [
    {
      action: 'New chapter registered',
      project: 'Wikimedia Colombia',
      time: '2 min',
      type: 'success',
    },
    {
      action: 'System maintenance completed',
      project: 'Global Infrastructure',
      time: '15 min',
      type: 'info',
    },
    {
      action: 'Security alert resolved',
      project: 'Authentication System',
      time: '1h',
      type: 'warning',
    },
    {
      action: 'Database backup completed',
      project: 'Data Management',
      time: '2h',
      type: 'success',
    },
    {
      action: 'API rate limit adjusted',
      project: 'Global API',
      time: '3h',
      type: 'info',
    },
  ];

  const systemAlerts = [
    {
      type: 'warning',
      message: 'High API usage detected in ES chapter',
      time: '5 min ago',
    },
    {
      type: 'info',
      message: 'Scheduled maintenance in 2 hours',
      time: '1 hour ago',
    },
    {
      type: 'success',
      message: 'All systems operational',
      time: '2 hours ago',
    },
  ];

  const tabs = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'chapters', label: 'Chapters', icon: Globe },
    { id: 'users', label: 'Users', icon: Users },
    { id: 'system', label: 'System', icon: Settings },
    { id: 'security', label: 'Security', icon: Shield },
  ];

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'view':
        return <Eye className="h-4 w-4 text-blue-500" />
      case 'download':
        return <FileText className="h-4 w-4 text-green-500" />
      case 'access':
        return <Activity className="h-4 w-4 text-purple-500" />
      default:
        return <Activity className="h-4 w-4 text-gray-500" />
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
       <SuperAdminHeader user={user} currentLang={currentLang} />

      {/* Tabs Wrapper */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2">
          {/* Mobile dropdown */}
          <div className="lg:hidden">
            <select
              value={activeTab}
              onChange={(e) => setActiveTab(e.target.value)}
              className="w-full border border-gray-300 dark:border-gray-700 rounded-md p-2 bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200"
            >
              {tabs.map((tab) => (
                <option key={tab.id} value={tab.id}>
                  {tab.label}
                </option>
              ))}
            </select>
          </div>

          {/* Desktop tabs */}
          <div className="hidden lg:flex space-x-8 mt-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 py-3 px-2 border-b-2 font-medium text-sm whitespace-nowrap transition-colors ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-200'
                }`}
              >
                <tab.icon className="h-4 w-4" />
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <DashboardStats />

            <Card>
              <CardHeader>
                <CardTitle>System Alerts</CardTitle>
                <CardDescription>
                  Recent system notifications and alerts
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {systemAlerts.map((alert, index) => (
                    <div
                      key={index}
                      className="flex items-center space-x-4 p-3 rounded-lg border"
                    >
                      {getActivityIcon(alert.type)}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                          {alert.message}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {alert.time}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === 'chapters' && <ChaptersTab />}

        {activeTab === 'users' && <UsersSection />}

      </div>
    </div>
  );
}

function ChaptersTab() {
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchChapters = async () => {
      try {
        const res = await fetch('/api/admin/chapters', {
          credentials: 'include',
        });
        const data = await res.json();
        setChapters(data);
      } catch (error) {
        console.error('Error loading chapters:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchChapters();
  }, []);

  if (loading) {
    return (
      <div className="text-center py-12 text-gray-500 dark:text-gray-400">
        Cargando capítulos...
      </div>
    );
  }

  return <ChaptersSection chapters={chapters} />;
}
