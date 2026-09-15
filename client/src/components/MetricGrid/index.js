import React from 'react';
import { Workflow, Play, CheckCircle2, AlertTriangle, TrendingUp, Clock } from 'lucide-react';
import styles from './MetricGrid.module.css';

export default function MetricGrid({ metrics = {} }) {
  const {
    totalWorkflows = 0,
    activeWorkflows = 0,
    totalExecutions = 0,
    successfulExecutions = 0,
    failedExecutions = 0,
    avgExecutionTime = '0s',
    successRate = '100%',
  } = metrics;

  const cards = [
    {
      title: 'Total Workflows',
      value: totalWorkflows,
      subtitle: `${activeWorkflows} Active`,
      icon: Workflow,
      color: 'var(--accent-primary)',
      trend: '+12% this week',
    },
    {
      title: 'Total Executions',
      value: totalExecutions,
      subtitle: 'All time runs',
      icon: Play,
      color: 'var(--info)',
      trend: 'Real-time',
    },
    {
      title: 'Success Rate',
      value: successRate,
      subtitle: `${successfulExecutions} Passed / ${failedExecutions} Failed`,
      icon: CheckCircle2,
      color: 'var(--success)',
      trend: 'Operational',
    },
    {
      title: 'Avg Duration',
      value: avgExecutionTime,
      subtitle: 'End-to-end flow',
      icon: Clock,
      color: 'var(--warning)',
      trend: 'Optimal',
    },
  ];

  return (
    <div className={styles.grid}>
      {cards.map((card, index) => {
        const Icon = card.icon;
        return (
          <div key={index} className={styles.card}>
            <div className={styles.cardHeader}>
              <span className={styles.title}>{card.title}</span>
              <div className={styles.iconWrapper} style={{ color: card.color, backgroundColor: `rgba(99, 102, 241, 0.08)` }}>
                <Icon size={20} />
              </div>
            </div>
            <div className={styles.value}>{card.value}</div>
            <div className={styles.footer}>
              <span className={styles.subtitle}>{card.subtitle}</span>
              <span className={styles.trend}>{card.trend}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
