import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../../lib/api';
import { Doubt, DoubtResponse } from '../../types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { formatDate } from '../../lib/utils';
import { ArrowLeft, Check, Play, MessageSquare, ArrowRightLeft } from 'lucide-react';

export const FacultyDoubtDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [responseText, setResponseText] = useState('');

  const { data: doubts, isLoading } = useQuery({
    queryKey: ['facultyDoubts'],
    queryFn: async () => {
      const response: any = await api.get('/faculty/doubts');
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
        <Button variant="outline" onClick={() => navigate('/faculty/dashboard')}>Back to Dashboard</Button>
      </div>
    );
  }

  const handleAction = async (action: 'accept' | 'start' | 'transfer') => {
    setIsActionLoading(true);
    try {
      await api.post(`/faculty/doubts/${id}/${action}`);
      await queryClient.invalidateQueries({ queryKey: ['facultyDoubts'] });
      if (action === 'transfer') {
        navigate('/faculty/dashboard');
      }
    } catch (err) {
      console.error('Failed to perform action:', err);
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleRespond = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!responseText.trim()) return;
    
    setIsActionLoading(true);
    try {
      await api.post(`/faculty/doubts/${id}/respond`, { content: responseText });
      setResponseText('');
      await queryClient.invalidateQueries({ queryKey: ['facultyDoubts'] });
    } catch (err) {
      console.error('Failed to submit response:', err);
    } finally {
      setIsActionLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Button variant="ghost" onClick={() => navigate('/faculty/dashboard')} className="mb-4">
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

          {/* Response Form (if in progress) */}
          {(doubt.status === 'IN_PROGRESS' || doubt.status === 'ANSWERED') && (
            <Card>
              <CardHeader>
                <CardTitle>Your Response</CardTitle>
                <CardDescription>Provide a detailed answer to the student's doubt.</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleRespond} className="space-y-4">
                  <textarea
                    className="flex min-h-[150px] w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-transparent"
                    placeholder="Type your response here..."
                    value={responseText}
                    onChange={(e) => setResponseText(e.target.value)}
                    required
                  />
                  <div className="flex justify-end">
                    <Button type="submit" isLoading={isActionLoading}>
                      <MessageSquare className="h-4 w-4 mr-2" /> Send Response
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}
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
              <CardDescription>Available actions for this doubt</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col space-y-3">
              {doubt.status === 'ASSIGNED' && (
                <>
                  <Button 
                    variant="primary" 
                    className="w-full"
                    onClick={() => handleAction('accept')}
                    isLoading={isActionLoading}
                  >
                    <Check className="h-4 w-4 mr-2" /> Accept Doubt
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => handleAction('transfer')}
                    isLoading={isActionLoading}
                  >
                    <ArrowRightLeft className="h-4 w-4 mr-2" /> Transfer / Reject
                  </Button>
                </>
              )}
              {doubt.status === 'ACCEPTED' && (
                <Button 
                  variant="primary" 
                  className="w-full"
                  onClick={() => handleAction('start')}
                  isLoading={isActionLoading}
                >
                  <Play className="h-4 w-4 mr-2" /> Start Working
                </Button>
              )}
              {doubt.status === 'IN_PROGRESS' && (
                <p className="text-sm text-slate-500 text-center italic">
                  Use the response form to submit your answer.
                </p>
              )}
              {doubt.status === 'ANSWERED' && (
                <p className="text-sm text-slate-500 text-center italic">
                  Waiting for student to mark as resolved. You can still add more responses if needed.
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
