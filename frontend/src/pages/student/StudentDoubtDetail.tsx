import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../../lib/api';
import { Doubt } from '../../types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { formatDate } from '../../lib/utils';
import { ArrowLeft, CheckCircle, XCircle, RotateCcw } from 'lucide-react';

export const StudentDoubtDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isActionLoading, setIsActionLoading] = useState(false);

  const { data: doubts, isLoading } = useQuery({
    queryKey: ['studentDoubts'],
    queryFn: async () => {
      const response: any = await api.get('/doubts/student');
      return response.data as Doubt[];
    },
  });

  const doubt = doubts?.find(d => d.id === id);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!doubt) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-bold text-slate-900 mb-2">Doubt not found</h2>
        <Button variant="outline" onClick={() => navigate('/student/dashboard')}>Back to Dashboard</Button>
      </div>
    );
  }

  const handleAction = async (action: 'resolve' | 'reopen' | 'close') => {
    setIsActionLoading(true);
    try {
      await api.post(`/doubts/${id}/${action}`);
      await queryClient.invalidateQueries({ queryKey: ['studentDoubts'] });
    } catch (err) {
      console.error('Failed to perform action:', err);
    } finally {
      setIsActionLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Button variant="ghost" onClick={() => navigate('/student/dashboard')} className="mb-4">
        <ArrowLeft className="h-4 w-4 mr-2" /> Back to Dashboard
      </Button>

      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">{doubt.title}</h1>
          <div className="flex space-x-2 mt-2 text-sm text-slate-500">
            <span>{doubt.department?.name}</span>
            <span>•</span>
            <span>{doubt.subject?.name}</span>
            {doubt.topic && (
              <>
                <span>•</span>
                <span>{doubt.topic.name}</span>
              </>
            )}
          </div>
        </div>
        <Badge variant="status" status={doubt.status} className="px-3 py-1 text-sm" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Description</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-700 whitespace-pre-wrap">{doubt.description}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Faculty Response</CardTitle>
              <CardDescription>Answers from the faculty assigned to your doubt</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {!doubt.responses?.length ? (
                <p className="text-sm text-slate-500">No response has been added yet.</p>
              ) : (
                doubt.responses.map((response) => (
                  <div key={response.id} className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                    <div className="mb-2 flex items-center justify-between gap-4">
                      <span className="text-sm font-medium text-slate-900">
                        {response.user?.name || 'Faculty'}
                      </span>
                      <span className="text-xs text-slate-500">{formatDate(response.createdAt)}</span>
                    </div>
                    <p className="whitespace-pre-wrap text-slate-700">{response.content}</p>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Timeline</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col space-y-1">
                <span className="text-sm font-medium text-slate-900">Submitted</span>
                <span className="text-xs text-slate-500">{formatDate(doubt.createdAt)}</span>
              </div>
              <div className="flex flex-col space-y-1">
                <span className="text-sm font-medium text-slate-900">Last Updated</span>
                <span className="text-xs text-slate-500">{formatDate(doubt.updatedAt)}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Actions</CardTitle>
              <CardDescription>Available actions for your doubt</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col space-y-3">
              {doubt.status === 'ANSWERED' && (
                <Button 
                  variant="primary" 
                  className="w-full bg-green-600 hover:bg-green-700"
                  onClick={() => handleAction('resolve')}
                  isLoading={isActionLoading}
                >
                  <CheckCircle className="h-4 w-4 mr-2" /> Mark as Resolved
                </Button>
              )}
              {doubt.status === 'RESOLVED' && (
                <>
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => handleAction('reopen')}
                    isLoading={isActionLoading}
                  >
                    <RotateCcw className="h-4 w-4 mr-2" /> Reopen Doubt
                  </Button>
                  <Button 
                    variant="danger" 
                    className="w-full"
                    onClick={() => handleAction('close')}
                    isLoading={isActionLoading}
                  >
                    <XCircle className="h-4 w-4 mr-2" /> Close Permanently
                  </Button>
                </>
              )}
              {['SUBMITTED', 'QUEUED', 'ASSIGNED', 'ACCEPTED', 'IN_PROGRESS', 'DRAFT', 'CLOSED'].includes(doubt.status) && (
                <p className="text-sm text-slate-500 text-center italic">
                  No actions available at this stage.
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
