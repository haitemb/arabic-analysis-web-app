import React from 'react';
import { Card, CardContent } from '../ui/card';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface ScoreCardProps {
  title: string;
  score: number;
  description: string;
  status: 'good' | 'average' | 'poor';
}

export function ScoreCard({ title, score, description, status }: ScoreCardProps) {
  const getStatusConfig = () => {
    switch (status) {
      case 'good':
        return {
          bgColor: 'bg-emerald-50',
          textColor: 'text-emerald-600',
          borderColor: 'border-emerald-200',
          icon: TrendingUp,
        };
      case 'average':
        return {
          bgColor: 'bg-amber-50',
          textColor: 'text-amber-600',
          borderColor: 'border-amber-200',
          icon: Minus,
        };
      case 'poor':
        return {
          bgColor: 'bg-red-50',
          textColor: 'text-red-600',
          borderColor: 'border-red-200',
          icon: TrendingDown,
        };
    }
  };

  const config = getStatusConfig();
  const Icon = config.icon;

  return (
    <Card className={`${config.bgColor} ${config.borderColor} border-2`}>
      <CardContent className="pt-6">
        <div className="flex items-start justify-between mb-3">
          <h3 className="text-sm text-gray-700">{title}</h3>
          <Icon className={`size-5 ${config.textColor}`} />
        </div>
        <div className={`text-3xl mb-1 ${config.textColor}`}>
          {score}
        </div>
        <p className="text-xs text-gray-600">{description}</p>
      </CardContent>
    </Card>
  );
}
