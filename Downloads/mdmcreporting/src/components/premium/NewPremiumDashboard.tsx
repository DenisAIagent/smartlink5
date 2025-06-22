import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  TrendingUp, 
  TrendingDown, 
  MousePointer, 
  Eye, 
  Target,
  Zap,
  Users,
  Calendar,
  ArrowUpRight,
  Sparkles,
  BarChart3,
  MessageSquare,
  Settings,
  Bell,
  Search,
  Plus,
  ChevronRight,
  Activity,
  DollarSign,
  Globe,
  Smartphone,
  Monitor,
  Clock,
  Filter,
  Download,
  RefreshCw
} from 'lucide-react';

interface PremiumDashboardProps {
  data?: any;
  isRealData?: boolean;
}

const PremiumMDMCDashboard: React.FC<PremiumDashboardProps> = ({ data, isRealData = false }) => {
  const [activeMetric, setActiveMetric] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const canvasRef = useRef(null);

  // Animation des particules en arrière-plan
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const particles = [];
    const particleCount = 50;

    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: Math.random() * 2 + 1,
        speedX: (Math.random() - 0.5) * 0.5,
        speedY: (Math.random() - 0.5) * 0.5,
        opacity: Math.random() * 0.3 + 0.1
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
        ctx.fillStyle = `rgba(255, 68, 68, ${particle.opacity})`;
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

  const mockMetrics = [
    {
      title: "Revenue",
      value: "€247,850",
      change: "+18.2%",
      trend: "up",
      icon: DollarSign,
      color: "from-emerald-400 to-teal-600",
      chart: [45, 52, 38, 65, 73, 82, 90, 75, 88]
    },
    {
      title: "ROAS",
      value: "4.8x",
      change: "+12.5%",
      trend: "up", 
      icon: TrendingUp,
      color: "from-blue-400 to-indigo-600",
      chart: [30, 45, 60, 55, 70, 65, 80, 85, 78]
    },
    {
      title: "Conversions",
      value: "2,847",
      change: "+24.1%",
      trend: "up",
      icon: Target,
      color: "from-purple-400 to-pink-600", 
      chart: [25, 35, 48, 52, 45, 58, 72, 68, 75]
    },
    {
      title: "CTR",
      value: "3.84%",
      change: "-2.1%", 
      trend: "down",
      icon: MousePointer,
      color: "from-orange-400 to-red-500",
      chart: [80, 78, 75, 72, 70, 68, 65, 62, 58]
    }
  ];

  const metrics = isRealData && data?.metrics ? [
    {
      title: "Revenue",
      value: data.metrics.revenue.value,
      change: `${data.metrics.revenue.change}%`,
      trend: data.metrics.revenue.trend,
      icon: DollarSign,
      color: "from-emerald-400 to-teal-600",
      chart: [45, 52, 38, 65, 73, 82, 90, 75, 88] // Keep mock chart for now
    },
    {
      title: "ROAS",
      value: data.metrics.roas.value,
      change: `${data.metrics.roas.change}%`,
      trend: data.metrics.roas.trend,
      icon: TrendingUp,
      color: "from-blue-400 to-indigo-600",
      chart: [30, 45, 60, 55, 70, 65, 80, 85, 78]
    },
    {
      title: "Conversions",
      value: data.metrics.conversions.value,
      change: `${data.metrics.conversions.change}%`,
      trend: data.metrics.conversions.trend,
      icon: Target,
      color: "from-purple-400 to-pink-600",
      chart: [25, 35, 48, 52, 45, 58, 72, 68, 75]
    },
    {
      title: "CTR",
      value: data.metrics.ctr.value,
      change: `${data.metrics.ctr.change}%`,
      trend: data.metrics.ctr.trend,
      icon: MousePointer,
      color: "from-orange-400 to-red-500",
      chart: [80, 78, 75, 72, 70, 68, 65, 62, 58]
    }
  ] : mockMetrics;

  const mockCampaigns = [
    {
      name: "Black Friday Premium",
      status: "active",
      spend: "€18,240",
      conversions: 284,
      roas: 5.2,
      change: 15.8,
      impression: 145000,
      device: "desktop"
    },
    {
      name: "Retargeting Elite", 
      status: "active",
      spend: "€12,890",
      conversions: 198,
      roas: 4.6,
      change: 8.3,
      impression: 98000,
      device: "mobile"
    },
    {
      name: "Search Brand",
      status: "paused",
      spend: "€8,450",
      conversions: 156,
      roas: 3.9,
      change: -4.2,
      impression: 67000,
      device: "tablet"
    },
    {
      name: "Display Network Pro",
      status: "active", 
      spend: "€15,670",
      conversions: 203,
      roas: 4.1,
      change: 11.4,
      impression: 187000,
      device: "desktop"
    }
  ];
  
  const campaigns = isRealData && data?.campaigns ? data.campaigns.map((c: any) => ({
    name: c.name,
    status: c.status === 'enabled' ? 'active' : c.status,
    spend: c.spend,
    conversions: c.conversions,
    roas: c.roas,
    change: parseFloat(c.change),
    impression: c.impression,
    device: c.device
  })) : mockCampaigns;

  const insights = [
    {
      type: "opportunity",
      title: "Optimisation Budget Detectée",
      description: "Réallouez +€2,400 vers 'Black Friday Premium' pour +18% de conversions",
      impact: "High",
      action: "Appliquer"
    },
    {
      type: "alert",
      title: "Anomalie de Performance",
      description: "CTR en baisse de 12% sur mobile depuis 48h",
      impact: "Medium", 
      action: "Analyser"
    },
    {
      type: "success",
      title: "Objectif Atteint",
      description: "ROAS target de 4.5x dépassé sur toutes les campagnes actives",
      impact: "Positive",
      action: "Maintenir"
    }
  ];

  const recentActivities = [
    { action: "Campagne optimisée", campaign: "Black Friday Premium", time: "Il y a 12 min", type: "optimization" },
    { action: "Alerte budgétaire", campaign: "Search Brand", time: "Il y a 1h", type: "alert" },
    { action: "Rapport généré", campaign: "Retargeting Elite", time: "Il y a 2h", type: "report" },
    { action: "Enchères ajustées", campaign: "Display Network Pro", time: "Il y a 3h", type: "bid" }
  ];

  const MiniChart = ({ data, color }) => (
    <div className="flex items-end h-8 gap-0.5">
      {data.map((value, i) => (
        <div
          key={i}
          className={`w-1 bg-gradient-to-t ${color} opacity-60 rounded-full transition-all duration-300 hover:opacity-100`}
          style={{ height: `${(value / Math.max(...data)) * 100}%` }}
        />
      ))}
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
      {/* Canvas pour les particules */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 pointer-events-none opacity-30"
      />
      
      {/* Arrière-plan glassmorphism */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-black/20 backdrop-blur-3xl" />
      
      {!isRealData && (
        <header className="relative z-10 border-b border-white/10 backdrop-blur-xl">
          <div className="px-8 py-6">
            <div className="flex items-center justify-between">
              {/* Logo & Brand */}
              <div className="flex items-center gap-6">
                <div className="relative group">
                  <div className="absolute -inset-1 bg-gradient-to-r from-red-500 to-pink-600 rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-300" />
                  <div className="relative w-14 h-14 bg-gradient-to-br from-red-500 to-red-600 rounded-2xl flex items-center justify-center shadow-2xl">
                    <div className="w-0 h-0 border-l-[8px] border-l-white border-t-[6px] border-t-transparent border-b-[6px] border-b-transparent ml-1" />
                  </div>
                </div>
                <div>
                  <h1 className="text-2xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                    MDMC Reporting
                  </h1>
                  <p className="text-sm text-gray-400 font-medium">Intelligence Artificielle • Google Ads</p>
                </div>
              </div>

              {/* User & Actions */}
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-4 text-gray-400">
                  <button className="hover:text-white transition-colors"><Search className="w-5 h-5" /></button>
                  <button className="hover:text-white transition-colors"><Bell className="w-5 h-5" /></button>
                  <button className="hover:text-white transition-colors"><Settings className="w-5 h-5" /></button>
                </div>
                <div className="w-px h-8 bg-white/10" />
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="font-semibold text-white">Denis Adam</p>
                    <p className="text-xs text-gray-400">MDMC</p>
                  </div>
                  <img src="https://github.com/shadcn.png" alt="User" className="w-10 h-10 rounded-full border-2 border-white/20" />
                </div>
                <Button className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-bold rounded-lg shadow-lg hover:shadow-xl transition-shadow">
                  <Plus className="w-4 h-4 mr-2" />
                  Nouveau Rapport
                </Button>
              </div>
            </div>
          </div>
        </header>
      )}
      
      <main className="relative z-10 p-8">
        <div className="grid grid-cols-12 gap-8">
          
          {/* Colonne Principale (Gauche) */}
          <div className="col-span-8 space-y-8">
            {/* Métriques */}
            <div className="grid grid-cols-4 gap-6">
              {metrics.map((metric, index) => (
                <Card 
                  key={index}
                  className={`bg-white/5 border border-white/10 backdrop-blur-2xl overflow-hidden transition-all duration-500 cursor-pointer ${activeMetric === index ? 'shadow-2xl shadow-purple-500/20' : 'hover:bg-white/10'}`}
                  onClick={() => setActiveMetric(index)}
                >
                  <CardContent className="p-5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${metric.color} flex items-center justify-center`}>
                          <metric.icon className="w-5 h-5 text-white" />
                        </div>
                        <p className="text-gray-300 font-medium">{metric.title}</p>
                      </div>
                      <div className={`flex items-center gap-1 text-sm ${metric.trend === 'up' ? 'text-emerald-400' : 'text-red-400'}`}>
                        {metric.trend === 'up' ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                        <span>{metric.change}</span>
                      </div>
                    </div>
                    <h2 className="text-4xl font-bold text-white mt-4">{metric.value}</h2>
                  </CardContent>
                  <div className="opacity-50">
                    <MiniChart data={metric.chart} color={metric.color} />
                  </div>
                </Card>
              ))}
            </div>

            {/* Tableau des Campagnes */}
            <Card className="bg-white/5 border border-white/10 backdrop-blur-2xl">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold text-white">Performances des Campagnes</h3>
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
                      <Filter className="w-4 h-4 mr-2" />
                      Filtrer
                    </Button>
                    <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
                      <Download className="w-4 h-4 mr-2" />
                      Exporter
                    </Button>
                  </div>
                </div>
                <div className="space-y-2">
                  {campaigns.map((campaign, index) => (
                    <Card key={index} className="bg-white/5 border border-white/10 hover:bg-white/10 transition-colors duration-300">
                      <CardContent className="p-4 grid grid-cols-12 items-center gap-4">
                        <div className="col-span-3 flex items-center gap-3">
                          <div className={`w-2 h-2 rounded-full ${campaign.status === 'active' ? 'bg-green-400' : 'bg-gray-500'}`} />
                          <span className="font-semibold text-white truncate">{campaign.name}</span>
                        </div>
                        <div className="col-span-2 text-gray-300">{campaign.spend}</div>
                        <div className="col-span-1 text-gray-300">{campaign.conversions}</div>
                        <div className="col-span-1 text-gray-300">{campaign.roas}x</div>
                        <div className="col-span-2 text-gray-300">{campaign.impression.toLocaleString()}</div>
                        <div className="col-span-1 flex items-center gap-2">
                          {campaign.device === 'desktop' && <Monitor className="w-4 h-4 text-blue-400" />}
                          {campaign.device === 'mobile' && <Smartphone className="w-4 h-4 text-green-400" />}
                          {campaign.device === 'tablet' && <Smartphone className="w-4 h-4 text-purple-400" />}
                          <span className="capitalize">{campaign.device}</span>
                        </div>
                        <div className="col-span-2 flex items-center gap-2 text-sm">
                          <span className={`${campaign.change >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                            {campaign.change >= 0 ? '▲' : '▼'} {Math.abs(campaign.change)}%
                          </span>
                          <div className="w-full h-1 bg-white/10 rounded-full">
                            <div className={`h-1 rounded-full ${campaign.change >= 0 ? 'bg-emerald-500' : 'bg-red-500'}`} style={{ width: `${Math.min(Math.abs(campaign.change) * 5, 100)}%`}}></div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Colonne de Droite */}
          <div className="col-span-4 space-y-8">
            <Card className="bg-white/5 border border-white/10 backdrop-blur-2xl">
              <CardContent className="p-6">
                <h3 className="text-xl font-bold text-white mb-4">Performance par Appareil</h3>
                <div className="space-y-4">
                  {(isRealData && data?.deviceComparison ? data.deviceComparison : [
                    { device: 'desktop', cost: 45000, roas: 5.1 },
                    { device: 'mobile', cost: 28000, roas: 4.2 },
                    { device: 'tablet', cost: 9000, roas: 3.8 },
                  ]).map((item, index) => (
                    <div key={index}>
                      <div className="flex justify-between items-center mb-1 text-sm">
                        <div className="flex items-center gap-2 font-medium text-white">
                          {item.device === 'desktop' && <Monitor className="w-4 h-4 text-blue-400" />}
                          {item.device === 'mobile' && <Smartphone className="w-4 h-4 text-green-400" />}
                          {item.device === 'tablet' && <Smartphone className="w-4 h-4 text-purple-400" />}
                          <span className="capitalize">{item.device}</span>
                        </div>
                        <span className="text-gray-300">ROAS: {typeof item.roas === 'number' ? item.roas.toFixed(1) : item.roas}x</span>
                      </div>
                      <div className="w-full bg-white/10 rounded-full h-2">
                        <div 
                          className="h-2 rounded-full bg-gradient-to-r from-blue-500 to-purple-600"
                          style={{ width: `${(item.cost / (isRealData && data?.deviceComparison ? data.deviceComparison.reduce((acc, d) => acc + d.cost, 0) : 82000)) * 100}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Insights IA */}
            <Card className="col-span-4 bg-white/5 border border-white/10 backdrop-blur-2xl">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold text-white">Insights IA</h3>
                  <Sparkles className="w-5 h-5 text-purple-400" />
                </div>
                <div className="space-y-4">
                  {insights.map((insight, index) => (
                    <div key={index} className="flex items-start gap-4 p-3 bg-white/5 rounded-lg">
                      <div className="mt-1">
                        {insight.type === 'opportunity' && <Zap className="w-5 h-5 text-yellow-400" />}
                        {insight.type === 'alert' && <Bell className="w-5 h-5 text-red-400" />}
                        {insight.type === 'success' && <Sparkles className="w-5 h-5 text-emerald-400" />}
                      </div>
                      <div>
                        <h4 className="font-semibold text-white">{insight.title}</h4>
                        <p className="text-sm text-gray-400">{insight.description}</p>
                        <Button variant="link" className="p-0 h-auto text-blue-400 hover:text-blue-300 mt-1 text-sm">
                          {insight.action} <ArrowUpRight className="w-3 h-3 ml-1" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Activités Récentes */}
            <Card className="col-span-4 bg-white/5 border border-white/10 backdrop-blur-2xl">
              <CardContent className="p-6">
                <h3 className="text-xl font-bold text-white mb-4">Activités Récentes</h3>
                <div className="space-y-3">
                  {recentActivities.map((activity, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
                          {activity.type === 'optimization' && <Zap className="w-4 h-4 text-yellow-400" />}
                          {activity.type === 'alert' && <Bell className="w-4 h-4 text-red-400" />}
                          {activity.type === 'report' && <BarChart3 className="w-4 h-4 text-blue-400" />}
                          {activity.type === 'bid' && <TrendingUp className="w-4 h-4 text-emerald-400" />}
                        </div>
                        <div>
                          <p className="font-medium text-white">{activity.action}</p>
                          <p className="text-sm text-gray-400">{activity.campaign}</p>
                        </div>
                      </div>
                      <span className="text-xs text-gray-500">{activity.time}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

          </div>
        </div>
      </main>
    </div>
  );
};

export default PremiumMDMCDashboard; 