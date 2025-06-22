import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Home,
  BarChart3,
  Target,
  MessageSquare,
  Settings,
  Users,
  TrendingUp,
  FileText,
  Shield,
  Bell,
  Search,
  Calendar,
  Globe,
  Zap,
  Brain,
  Sparkles,
  ChevronRight,
  ChevronDown,
  Plus,
  Star,
  Activity,
  Clock,
  Filter,
  Bookmark,
  Heart,
  Share2,
  Download,
  Upload,
  RefreshCw,
  Eye,
  EyeOff,
  Lock,
  Unlock,
  Edit,
  Trash2,
  Copy,
  ExternalLink,
  Maximize2,
  Minimize2,
  MoreHorizontal,
  HelpCircle,
  User,
  LogOut,
  Moon,
  Sun,
  Monitor,
  Wifi,
  WifiOff,
  Database,
  Server,
  Code,
  Terminal,
  Layers,
  Grid,
  Layout,
  Palette,
  Image,
  Video,
  Music,
  Headphones,
  Camera,
  Mic,
  MicOff
} from 'lucide-react';

const PremiumNavigationSidebar = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [activeSection, setActiveSection] = useState('dashboard');
  const [expandedGroups, setExpandedGroups] = useState(['analytics']);
  const [notifications, setNotifications] = useState(12);
  const [isOnline, setIsOnline] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [theme, setTheme] = useState('dark');
  const canvasRef = useRef(null);

  // Animation de particules pour la sidebar
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;

    const particles = [];
    const particleCount = 15;

    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: Math.random() * 2 + 0.5,
        speedX: (Math.random() - 0.5) * 1,
        speedY: (Math.random() - 0.5) * 1,
        opacity: Math.random() * 0.3 + 0.1,
        color: `hsl(${Math.random() * 60 + 300}, 70%, 60%)`
      });
    }

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      particles.forEach(particle => {
        particle.x += particle.speedX;
        particle.y += particle.speedY;

        if (particle.x < 0 || particle.x > canvas.width) particle.speedX *= -1;
        if (particle.y < 0 || particle.y > canvas.height) particle.speedY *= -1;

        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fillStyle = particle.color.replace(')', `, ${particle.opacity})`).replace('hsl', 'hsla');
        ctx.fill();
      });

      requestAnimationFrame(animate);
    };

    animate();

    return () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    };
  }, []);

  // Mise à jour de l'heure
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const navigationGroups = [
    {
      id: 'main',
      title: 'Principal',
      items: [
        {
          id: 'dashboard',
          label: 'Dashboard',
          icon: Home,
          badge: null,
          gradient: 'from-blue-500 to-indigo-600',
          shortcut: '⌘D'
        },
        {
          id: 'ai-assistant',
          label: 'Assistant IA',
          icon: Brain,
          badge: 'NEW',
          badgeColor: 'bg-gradient-to-r from-purple-500 to-pink-600',
          gradient: 'from-purple-500 to-pink-600',
          shortcut: '⌘A'
        },
        {
          id: 'chat',
          label: 'Chat Intelligent',
          icon: MessageSquare,
          badge: '3',
          badgeColor: 'bg-gradient-to-r from-emerald-500 to-teal-600',
          gradient: 'from-emerald-500 to-teal-600',
          shortcut: '⌘C'
        }
      ]
    },
    {
      id: 'analytics',
      title: 'Analytics & Données',
      expandable: true,
      items: [
        {
          id: 'campaigns',
          label: 'Campagnes',
          icon: Target,
          badge: '24',
          badgeColor: 'bg-gradient-to-r from-orange-500 to-red-500',
          gradient: 'from-orange-500 to-red-500',
          shortcut: '⌘1'
        },
        {
          id: 'performance',
          label: 'Performance',
          icon: TrendingUp,
          badge: null,
          gradient: 'from-green-500 to-emerald-600',
          shortcut: '⌘2'
        },
        {
          id: 'reports',
          label: 'Rapports',
          icon: FileText,
          badge: null,
          gradient: 'from-blue-500 to-cyan-600',
          shortcut: '⌘3'
        },
        {
          id: 'analytics',
          label: 'Analytics Avancées',
          icon: BarChart3,
          badge: 'PRO',
          badgeColor: 'bg-gradient-to-r from-yellow-500 to-orange-500',
          gradient: 'from-yellow-500 to-orange-500',
          shortcut: '⌘4'
        }
      ]
    },
    {
      id: 'automation',
      title: 'Automatisation IA',
      expandable: true,
      items: [
        {
          id: 'smart-bidding',
          label: 'Enchères Intelligentes',
          icon: Zap,
          badge: 'AUTO',
          badgeColor: 'bg-gradient-to-r from-purple-500 to-indigo-600',
          gradient: 'from-purple-500 to-indigo-600'
        },
        {
          id: 'optimization',
          label: 'Optimisation Auto',
          icon: Sparkles,
          badge: null,
          gradient: 'from-pink-500 to-purple-600'
        },
        {
          id: 'predictions',
          label: 'Prédictions IA',
          icon: Activity,
          badge: 'BETA',
          badgeColor: 'bg-gradient-to-r from-cyan-500 to-blue-600',
          gradient: 'from-cyan-500 to-blue-600'
        }
      ]
    },
    {
      id: 'management',
      title: 'Gestion',
      items: [
        {
          id: 'users',
          label: 'Utilisateurs',
          icon: Users,
          badge: null,
          gradient: 'from-gray-500 to-gray-600',
          admin: true
        },
        {
          id: 'settings',
          label: 'Paramètres',
          icon: Settings,
          badge: null,
          gradient: 'from-slate-500 to-slate-600'
        }
      ]
    }
  ];

  const quickActions = [
    {
      id: 'new-campaign',
      label: 'Nouvelle Campagne',
      icon: Plus,
      gradient: 'from-emerald-500 to-teal-600'
    },
    {
      id: 'export-data',
      label: 'Exporter Données',
      icon: Download,
      gradient: 'from-blue-500 to-indigo-600'
    },
    {
      id: 'ai-insights',
      label: 'Insights IA',
      icon: Brain,
      gradient: 'from-purple-500 to-pink-600'
    }
  ];

  const recentActivity = [
    {
      id: '1',
      action: 'Campagne optimisée',
      target: 'Black Friday Sale',
      time: '2 min',
      type: 'optimization',
      color: 'text-emerald-400'
    },
    {
      id: '2',
      action: 'Rapport généré',
      target: 'Performance Q4',
      time: '15 min',
      type: 'report',
      color: 'text-blue-400'
    },
    {
      id: '3',
      action: 'Alerte déclenclée',
      target: 'Budget épuisé',
      time: '1h',
      type: 'alert',
      color: 'text-orange-400'
    },
    {
      id: '4',
      action: 'IA a suggéré',
      target: 'Optimisation enchères',
      time: '2h',
      type: 'ai',
      color: 'text-purple-400'
    }
  ];

  const toggleGroup = (groupId) => {
    setExpandedGroups(prev => 
      prev.includes(groupId) 
        ? prev.filter(id => id !== groupId)
        : [...prev, groupId]
    );
  };

  const getActivityIcon = (type) => {
    switch (type) {
      case 'optimization': return TrendingUp;
      case 'report': return FileText;
      case 'alert': return Bell;
      case 'ai': return Brain;
      default: return Activity;
    }
  };

  const MenuItem = ({ item, isSubItem = false }) => {
    const Icon = item.icon;
    const isActive = activeSection === item.id;
    
    return (
      <div
        className={`group relative cursor-pointer transition-all duration-300 ${
          isSubItem ? 'ml-6' : ''
        }`}
        onClick={() => setActiveSection(item.id)}
      >
        {/* Hover effect background */}
        <div className={`absolute -inset-1 bg-gradient-to-r ${item.gradient} rounded-xl blur opacity-0 group-hover:opacity-20 transition duration-300`} />
        
        <div className={`relative flex items-center gap-3 p-3 rounded-xl transition-all duration-300 ${
          isActive 
            ? `bg-gradient-to-r ${item.gradient} shadow-lg shadow-${item.gradient.split('-')[1]}-500/30` 
            : 'hover:bg-white/10'
        }`}>
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-300 ${
            isActive 
              ? 'bg-white/20 shadow-lg' 
              : 'bg-white/5 group-hover:bg-white/10'
          }`}>
            <Icon className={`w-4 h-4 transition-colors duration-300 ${
              isActive ? 'text-white' : 'text-gray-300 group-hover:text-white'
            }`} />
          </div>
          
          {!isCollapsed && (
            <>
              <div className="flex-1 min-w-0">
                <p className={`font-medium transition-colors duration-300 ${
                  isActive ? 'text-white' : 'text-gray-300 group-hover:text-white'
                }`}>
                  {item.label}
                </p>
                {item.shortcut && (
                  <p className={`text-xs transition-colors duration-300 ${
                    isActive ? 'text-white/70' : 'text-gray-500 group-hover:text-gray-400'
                  }`}>
                    {item.shortcut}
                  </p>
                )}
              </div>
              
              {item.badge && (
                <Badge className={`text-xs text-white border-0 ${
                  item.badgeColor || 'bg-white/20'
                }`}>
                  {item.badge}
                </Badge>
              )}
            </>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className={`${isCollapsed ? 'w-20' : 'w-80'} h-screen bg-gradient-to-b from-slate-900 via-purple-900/20 to-slate-900 relative transition-all duration-500 ease-in-out overflow-hidden border-r border-white/10`}>
      {/* Background Effects */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 pointer-events-none opacity-40"
        style={{ width: '100%', height: '100%' }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-white/5 via-transparent to-black/20 backdrop-blur-3xl" />

      {/* Header */}
      <div className="relative z-10 p-6 border-b border-white/10">
        <div className="flex items-center justify-between">
          {!isCollapsed && (
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-red-500 to-pink-600 flex items-center justify-center shadow-2xl">
                  <div className="w-0 h-0 border-l-[8px] border-l-white border-t-[6px] border-t-transparent border-b-[6px] border-b-transparent ml-1" />
                </div>
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-gradient-to-r from-emerald-400 to-emerald-600 rounded-full flex items-center justify-center">
                  <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                </div>
              </div>
              <div>
                <h1 className="text-lg font-bold text-white">MDMC</h1>
                <p className="text-xs text-gray-400">Reporting IA</p>
              </div>
            </div>
          )}
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 border border-white/20"
          >
            {isCollapsed ? (
              <ChevronRight className="w-4 h-4 text-gray-300" />
            ) : (
              <ChevronDown className="w-4 h-4 text-gray-300 rotate-90" />
            )}
          </Button>
        </div>

        {/* Status Bar */}
        {!isCollapsed && (
          <div className="mt-4 p-3 rounded-xl bg-white/5 border border-white/10">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${isOnline ? 'bg-emerald-400 animate-pulse' : 'bg-red-400'}`} />
                <span className="text-xs text-gray-300">
                  {isOnline ? 'Connecté' : 'Hors ligne'}
                </span>
              </div>
              <div className="text-xs text-gray-400">
                {currentTime.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="relative z-10 flex-1 overflow-y-auto scrollbar-thin scrollbar-track-transparent scrollbar-thumb-white/20">
        <div className="p-4 space-y-6">
          {navigationGroups.map((group) => (
            <div key={group.id} className="space-y-2">
              {!isCollapsed && (
                <div className="flex items-center justify-between px-3">
                  <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    {group.title}
                  </h3>
                  {group.expandable && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleGroup(group.id)}
                      className="w-5 h-5 p-0 hover:bg-white/20"
                    >
                      <ChevronDown className={`w-3 h-3 text-gray-400 transition-transform duration-300 ${
                        expandedGroups.includes(group.id) ? 'rotate-0' : '-rotate-90'
                      }`} />
                    </Button>
                  )}
                </div>
              )}
              
              <div className={`space-y-1 transition-all duration-300 ${
                !isCollapsed && group.expandable && !expandedGroups.includes(group.id) 
                  ? 'max-h-0 overflow-hidden opacity-0' 
                  : 'max-h-none opacity-100'
              }`}>
                {group.items.map((item) => (
                  <MenuItem key={item.id} item={item} />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      {!isCollapsed && (
        <div className="relative z-10 p-4 border-t border-white/10">
          <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
            Actions Rapides
          </h3>
          <div className="grid grid-cols-3 gap-2">
            {quickActions.map((action) => {
              const Icon = action.icon;
              return (
                <button
                  key={action.id}
                  className="group relative p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 transition-all duration-300"
                >
                  <div className={`absolute -inset-0.5 bg-gradient-to-r ${action.gradient} rounded-xl blur opacity-0 group-hover:opacity-20 transition duration-300`} />
                  <div className="relative flex flex-col items-center gap-2">
                    <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${action.gradient} flex items-center justify-center shadow-lg`}>
                      <Icon className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-xs text-gray-300 text-center leading-tight">
                      {action.label}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Recent Activity */}
      {!isCollapsed && (
        <div className="relative z-10 p-4 border-t border-white/10">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
              Activité Récente
            </h3>
            <Button variant="ghost" size="sm" className="w-5 h-5 p-0 hover:bg-white/20">
              <RefreshCw className="w-3 h-3 text-gray-400" />
            </Button>
          </div>
          
          <div className="space-y-2 max-h-48 overflow-y-auto scrollbar-thin scrollbar-track-transparent scrollbar-thumb-white/20">
            {recentActivity.map((activity) => {
              const Icon = getActivityIcon(activity.type);
              return (
                <div
                  key={activity.id}
                  className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 transition-colors group cursor-pointer"
                >
                  <div className="w-6 h-6 rounded-lg bg-white/10 flex items-center justify-center">
                    <Icon className={`w-3 h-3 ${activity.color}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-white group-hover:text-purple-300 transition-colors">
                      {activity.action}
                    </p>
                    <p className="text-xs text-gray-400 truncate">
                      {activity.target}
                    </p>
                  </div>
                  <span className="text-xs text-gray-500">
                    {activity.time}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Footer - User Profile */}
      <div className="relative z-10 p-4 border-t border-white/10">
        {isCollapsed ? (
          <div className="flex justify-center">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
              <User className="w-5 h-5 text-white" />
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 transition-all duration-300 cursor-pointer group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg">
              <User className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white group-hover:text-blue-300 transition-colors">
                Admin MDMC
              </p>
              <p className="text-xs text-gray-400">
                admin@mdmc.com
              </p>
            </div>
            <Button variant="ghost" size="sm" className="w-6 h-6 p-0 hover:bg-white/20">
              <MoreHorizontal className="w-4 h-4 text-gray-400" />
            </Button>
          </div>
        )}
      </div>

      {/* Notification Dot */}
      {notifications > 0 && (
        <div className="absolute top-4 right-4 w-6 h-6 bg-gradient-to-r from-red-500 to-pink-600 rounded-full flex items-center justify-center shadow-lg animate-pulse">
          <span className="text-xs font-bold text-white">
            {notifications > 99 ? '99+' : notifications}
          </span>
        </div>
      )}
    </div>
  );
};

export default PremiumNavigationSidebar; 