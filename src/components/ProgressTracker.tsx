import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { CheckCircle2, Clock, AlertTriangle, Pause } from 'lucide-react';
import type { Project } from '@/hooks/useProjects';

interface ProgressTrackerProps {
  project: Project;
}

export function ProgressTracker({ project }: ProgressTrackerProps) {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="w-4 h-4 text-progress-complete" />;
      case 'in_progress':
        return <Clock className="w-4 h-4 text-progress-in-progress" />;
      case 'blocked':
        return <AlertTriangle className="w-4 h-4 text-progress-blocked" />;
      case 'not_started':
        return <Pause className="w-4 h-4 text-progress-pending" />;
      default:
        return <Clock className="w-4 h-4 text-progress-pending" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-progress-complete text-white';
      case 'in_progress':
        return 'bg-progress-in-progress text-white';
      case 'blocked':
        return 'bg-progress-blocked text-white';
      case 'not_started':
        return 'bg-progress-pending text-white';
      default:
        return 'bg-progress-pending text-white';
    }
  };

  const getProgressColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-progress-complete';
      case 'in_progress':
        return 'bg-progress-in-progress';
      case 'blocked':
        return 'bg-progress-blocked';
      default:
        return 'bg-progress-pending';
    }
  };

  return (
    <Card className="border-0 shadow-card">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">{project.name}</CardTitle>
          <Badge className={getStatusColor(project.status)}>
            {getStatusIcon(project.status)}
            <span className="ml-2 capitalize">{project.status.replace('_', ' ')}</span>
          </Badge>
        </div>
        
        {/* Overall Progress */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Overall Progress</span>
            <span className="text-sm font-semibold">{project.progress_percentage}%</span>
          </div>
          <div className="relative">
            <Progress 
              value={project.progress_percentage} 
              className="h-3"
            />
            <div 
              className="absolute top-0 left-0 h-3 rounded-full bg-gradient-primary transition-all duration-300"
              style={{ width: `${project.progress_percentage}%` }}
            />
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <h4 className="font-semibold text-sm text-muted-foreground">Project Phases</h4>
        
        {/* Phases List */}
        <div className="space-y-3">
          {project.phases && project.phases.length > 0 ? (
            project.phases.map((phase, index) => (
              <div key={phase.id} className="relative">
                {/* Connector Line */}
                {index < project.phases!.length - 1 && (
                  <div className="absolute left-4 top-8 w-0.5 h-6 bg-border z-0" />
                )}
                
                <div className="flex items-start gap-3 relative z-10">
                  {/* Status Icon */}
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${getStatusColor(phase.status)} shadow-sm`}>
                    {getStatusIcon(phase.status)}
                  </div>
                  
                  {/* Phase Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-2">
                      <h5 className="font-medium text-sm truncate">{phase.name}</h5>
                      <span className="text-xs text-muted-foreground ml-2">{phase.progress_percentage}%</span>
                    </div>
                    
                    {/* Progress Bar */}
                    <div className="relative mb-2">
                      <Progress 
                        value={phase.progress_percentage} 
                        className="h-2"
                      />
                      <div 
                        className={`absolute top-0 left-0 h-2 rounded-full transition-all duration-300 ${getProgressColor(phase.status)}`}
                        style={{ width: `${phase.progress_percentage}%` }}
                      />
                    </div>
                    
                    {/* Dates */}
                    {(phase.start_date || phase.end_date) && (
                      <div className="flex gap-4 text-xs text-muted-foreground">
                        {phase.start_date && (
                          <span>Started: {new Date(phase.start_date).toLocaleDateString()}</span>
                        )}
                        {phase.end_date && (
                          <span>Due: {new Date(phase.end_date).toLocaleDateString()}</span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8">
              <Clock className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No phases configured yet</p>
            </div>
          )}
        </div>
        
        {/* Summary Stats */}
        {project.phases && project.phases.length > 0 && (
          <div className="grid grid-cols-2 gap-4 pt-4 border-t">
            <div className="text-center">
              <p className="text-lg font-bold text-progress-complete">
                {project.phases.filter(p => p.status === 'completed').length}
              </p>
              <p className="text-xs text-muted-foreground">Completed</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-bold text-progress-in-progress">
                {project.phases.filter(p => p.status === 'in_progress').length}
              </p>
              <p className="text-xs text-muted-foreground">In Progress</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}