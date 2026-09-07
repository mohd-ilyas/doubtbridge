import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { api } from '../../lib/api';
import type { Doubt } from '../../types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { formatDate } from '../../lib/utils';
import { Plus, MessageSquare } from 'lucide-react';

export const StudentDashboard = () => {
  const { data, isLoading, error } = useQuery({
    queryKey: ['studentDoubts'],
    queryFn: async () => {
      const response: any = await api.get('/doubts/student');
      return response.data as Doubt[];
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-bold text-slate-900 mb-2">Error loading dashboard</h2>
        <p className="text-slate-500">Please try refreshing the page.</p>
      </div>
    );
  }

  const doubts = data || [];
  const activeDoubts = doubts.filter(d => !['RESOLVED', 'CLOSED'].includes(d.status));
  const closedDoubts = doubts.filter(d => ['RESOLVED', 'CLOSED'].includes(d.status));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Student Dashboard</h1>
          <p className="text-slate-500 text-sm mt-1">Manage your academic queries and doubt resolutions.</p>
        </div>
        <Link to="/student/doubts/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Submit New Doubt
          </Button>
        </Link>
      </div>

      {doubts.length === 0 ? (
        <Card className="flex flex-col items-center justify-center py-16 text-center border-dashed">
          <MessageSquare className="h-12 w-12 text-slate-300 mb-4" />
          <CardTitle className="mb-2">No doubts submitted yet</CardTitle>
          <CardDescription className="max-w-sm mb-6">
            Whenever you face an academic blocker, submit a doubt and we'll route it to an available faculty member.
          </CardDescription>
          <Link to="/student/doubts/new">
            <Button variant="outline">Create your first doubt</Button>
          </Link>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {/* Active Doubts Section */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-slate-900 border-b pb-2">Active Doubts</h2>
            {activeDoubts.length === 0 ? (
              <p className="text-slate-500 text-sm py-4">No active doubts currently.</p>
            ) : (
              activeDoubts.map(doubt => (
                <Link key={doubt.id} to={`/student/doubts/${doubt.id}`} className="block">
                  <Card className="hover:border-indigo-300 transition-colors cursor-pointer">
                    <CardHeader className="p-4 pb-2">
                      <div className="flex justify-between items-start">
                        <CardTitle className="text-base line-clamp-1">{doubt.title}</CardTitle>
                        <Badge variant="status" status={doubt.status} />
                      </div>
                      <CardDescription className="text-xs">{doubt.department?.name} • {doubt.subject?.name}</CardDescription>
                    </CardHeader>
                    <CardContent className="p-4 pt-2">
                      <p className="text-sm text-slate-600 line-clamp-2">{doubt.description}</p>
                      <div className="mt-3 text-xs text-slate-400">
                        Submitted: {formatDate(doubt.createdAt)}
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))
            )}
          </div>

          {/* Past Doubts Section */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-slate-900 border-b pb-2">Past Doubts</h2>
            {closedDoubts.length === 0 ? (
              <p className="text-slate-500 text-sm py-4">No past doubts.</p>
            ) : (
              closedDoubts.map(doubt => (
                <Link key={doubt.id} to={`/student/doubts/${doubt.id}`} className="block opacity-80 hover:opacity-100 transition-opacity">
                  <Card className="hover:border-slate-300 transition-colors cursor-pointer bg-slate-50">
                    <CardHeader className="p-4 pb-2">
                      <div className="flex justify-between items-start">
                        <CardTitle className="text-base line-clamp-1">{doubt.title}</CardTitle>
                        <Badge variant="status" status={doubt.status} />
                      </div>
                      <CardDescription className="text-xs">{doubt.department?.name} • {doubt.subject?.name}</CardDescription>
                    </CardHeader>
                  </Card>
                </Link>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};
