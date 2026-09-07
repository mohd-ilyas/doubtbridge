import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { api } from '../../lib/api';
import { Doubt } from '../../types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { formatDate } from '../../lib/utils';
import { Settings, ClipboardList } from 'lucide-react';

export const FacultyDashboard = () => {
  const { data: doubts, isLoading } = useQuery({
    queryKey: ['facultyDoubts'],
    queryFn: async () => {
      const response: any = await api.get('/faculty/doubts');
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

  const activeDoubts = (doubts || []).filter(d => ['ASSIGNED', 'ACCEPTED', 'IN_PROGRESS', 'ANSWERED'].includes(d.status));
  const completedDoubts = (doubts || []).filter(d => ['RESOLVED', 'CLOSED'].includes(d.status));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Faculty Dashboard</h1>
          <p className="text-slate-500 text-sm mt-1">Manage your active doubts and availability.</p>
        </div>
        <Link to="/faculty/settings" className="flex items-center text-sm font-medium text-indigo-600 hover:text-indigo-700 bg-indigo-50 px-3 py-2 rounded-md">
          <Settings className="h-4 w-4 mr-2" />
          Settings
        </Link>
      </div>

      <div className="grid gap-6">
        {/* Active Assignments */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-slate-900 border-b pb-2">Your Active Assignments</h2>
          {activeDoubts.length === 0 ? (
            <Card className="flex flex-col items-center justify-center py-12 text-center border-dashed">
              <ClipboardList className="h-10 w-10 text-slate-300 mb-4" />
              <CardTitle className="text-lg">No active assignments</CardTitle>
              <CardDescription>You are currently caught up. New doubts will appear here when assigned to you.</CardDescription>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {activeDoubts.map(doubt => (
                <Link key={doubt.id} to={`/faculty/doubts/${doubt.id}`} className="block h-full">
                  <Card className="h-full hover:border-indigo-300 transition-colors cursor-pointer flex flex-col">
                    <CardHeader className="p-4 pb-2">
                      <div className="flex justify-between items-start mb-2">
                        <Badge variant="status" status={doubt.status} />
                        <span className="text-xs text-slate-400">{formatDate(doubt.updatedAt)}</span>
                      </div>
                      <CardTitle className="text-base line-clamp-1">{doubt.title}</CardTitle>
                      <CardDescription className="text-xs">{doubt.department?.name} • {doubt.subject?.name}</CardDescription>
                    </CardHeader>
                    <CardContent className="p-4 pt-2 flex-grow">
                      <p className="text-sm text-slate-600 line-clamp-3">{doubt.description}</p>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-4">
          <div className="flex items-baseline justify-between border-b pb-2">
            <h2 className="text-lg font-semibold text-slate-900">Completed History</h2>
            <span className="text-sm text-slate-500">{completedDoubts.length} completed</span>
          </div>
          {completedDoubts.length === 0 ? (
            <p className="py-4 text-sm text-slate-500">Completed doubts will appear here.</p>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {completedDoubts.map(doubt => (
                <Link key={doubt.id} to={`/faculty/doubts/${doubt.id}`} className="block h-full">
                  <Card className="h-full bg-slate-50 transition-colors hover:border-slate-300">
                    <CardHeader className="p-4 pb-2">
                      <div className="mb-2 flex items-start justify-between gap-2">
                        <Badge variant="status" status={doubt.status} />
                        <span className="text-xs text-slate-400">{formatDate(doubt.updatedAt)}</span>
                      </div>
                      <CardTitle className="text-base line-clamp-1">{doubt.title}</CardTitle>
                      <CardDescription className="text-xs">{doubt.department?.name} â€¢ {doubt.subject?.name}</CardDescription>
                    </CardHeader>
                    <CardContent className="p-4 pt-2">
                      <p className="text-sm text-slate-600 line-clamp-2">{doubt.description}</p>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
