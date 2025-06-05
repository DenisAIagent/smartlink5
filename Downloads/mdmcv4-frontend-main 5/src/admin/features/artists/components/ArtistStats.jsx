import React from 'react';
import { motion } from 'framer-motion';
import Card from '../../../components/Card';
import { LineChart, BarChart, PieChart } from '../../analytics/Charts';

const ArtistStats = ({ analytics, period, onPeriodChange }) => {
  const periods = [
    { value: '24h', label: '24 heures' },
    { value: '7d', label: '7 jours' },
    { value: '30d', label: '30 jours' },
    { value: '90d', label: '90 jours' },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
    },
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* KPIs */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card
          title="Clics totaux"
          subtitle={period}
          icon={
            <svg className="w-6 h-6 text-[#E74C3C]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
          }
        >
          <div className="text-3xl font-bold text-white">
            {analytics?.totalClicks.toLocaleString()}
          </div>
          <div className="text-sm text-gray-400 mt-2">
            {analytics?.clicksChange > 0 ? '+' : ''}{analytics?.clicksChange}% vs période précédente
          </div>
        </Card>

        <Card
          title="Visiteurs uniques"
          subtitle={period}
          icon={
            <svg className="w-6 h-6 text-[#E74C3C]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          }
        >
          <div className="text-3xl font-bold text-white">
            {analytics?.uniqueVisitors.toLocaleString()}
          </div>
          <div className="text-sm text-gray-400 mt-2">
            {analytics?.visitorsChange > 0 ? '+' : ''}{analytics?.visitorsChange}% vs période précédente
          </div>
        </Card>

        <Card
          title="Taux de conversion"
          subtitle={period}
          icon={
            <svg className="w-6 h-6 text-[#E74C3C]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          }
        >
          <div className="text-3xl font-bold text-white">
            {analytics?.conversionRate}%
          </div>
          <div className="text-sm text-gray-400 mt-2">
            {analytics?.conversionChange > 0 ? '+' : ''}{analytics?.conversionChange}% vs période précédente
          </div>
        </Card>
      </motion.div>

      {/* Graphiques */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="Évolution des clics" className="h-96">
          <LineChart data={analytics?.dailyClicks} />
        </Card>

        <Card title="Distribution par plateforme" className="h-96">
          <PieChart data={analytics?.platformDistribution} />
        </Card>
      </motion.div>

      {/* Statistiques détaillées */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="Top SmartLinks">
          <div className="space-y-4">
            {analytics?.topSmartlinks.map((smartlink, index) => (
              <div
                key={smartlink.id}
                className="flex items-center justify-between p-4 bg-[#2A2A2E] rounded-lg"
              >
                <div className="flex items-center space-x-4">
                  <div className="w-8 h-8 flex items-center justify-center bg-[#323236] rounded-full text-white font-bold">
                    {index + 1}
                  </div>
                  <div>
                    <h4 className="font-medium text-white">{smartlink.title}</h4>
                    <p className="text-sm text-gray-400">{smartlink.clicks} clics</p>
                  </div>
                </div>
                <div className="text-sm text-gray-400">
                  {smartlink.conversionRate}% de conversion
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card title="Répartition géographique">
          <div className="h-80">
            <BarChart data={analytics?.geographicDistribution} />
          </div>
        </Card>
      </motion.div>

      {/* Métriques supplémentaires */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card title="Temps moyen de session">
          <div className="text-2xl font-bold text-white">
            {analytics?.avgSessionTime} min
          </div>
        </Card>

        <Card title="Taux de rebond">
          <div className="text-2xl font-bold text-white">
            {analytics?.bounceRate}%
          </div>
        </Card>

        <Card title="Pages vues">
          <div className="text-2xl font-bold text-white">
            {analytics?.pageViews.toLocaleString()}
          </div>
        </Card>

        <Card title="Nouveaux visiteurs">
          <div className="text-2xl font-bold text-white">
            {analytics?.newVisitors}%
          </div>
        </Card>
      </motion.div>
    </motion.div>
  );
};

export default ArtistStats; 