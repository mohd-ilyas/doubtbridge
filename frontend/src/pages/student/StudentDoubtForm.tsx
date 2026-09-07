import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../lib/api';
import { Department, Subject, Topic } from '../../types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';

export const StudentDoubtForm = () => {
  const navigate = useNavigate();
  const [departments, setDepartments] = useState<Department[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [topics, setTopics] = useState<Topic[]>([]);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [departmentId, setDepartmentId] = useState('');
  const [subjectId, setSubjectId] = useState('');
  const [topicId, setTopicId] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchDepts = async () => {
      const res: any = await api.get('/api/departments');
      if (res.success) setDepartments(res.data);
    };
    fetchDepts();
  }, []);

  useEffect(() => {
    if (departmentId) {
      const fetchSubjects = async () => {
        const res: any = await api.get(`/api/subjects?departmentId=${departmentId}`);
        if (res.success) setSubjects(res.data);
      };
      fetchSubjects();
    } else {
      setSubjects([]);
      setSubjectId('');
    }
  }, [departmentId]);

  useEffect(() => {
    if (subjectId) {
      const fetchTopics = async () => {
        const res: any = await api.get(`/api/topics?subjectId=${subjectId}`);
        if (res.success) setTopics(res.data);
      };
      fetchTopics();
    } else {
      setTopics([]);
      setTopicId('');
    }
  }, [subjectId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const res: any = await api.post('/doubts', {
        title,
        description,
        departmentId,
        subjectId,
        topicId: topicId || undefined,
      });

      if (res.success) {
        navigate('/student/dashboard');
      }
    } catch (err: any) {
      if (err.errors && err.errors.length > 0) {
        setError(err.errors[0].message);
      } else {
        setError(err.message || 'Failed to submit doubt');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">Ask a Doubt</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Doubt Details</CardTitle>
          <CardDescription>Provide a clear title and description to help faculty members understand your query.</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {error && (
              <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm">
                {error}
              </div>
            )}
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-sm font-medium text-slate-700">Department</label>
                <select
                  className="flex h-10 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-transparent"
                  value={departmentId}
                  onChange={(e) => setDepartmentId(e.target.value)}
                  required
                >
                  <option value="">Select a department...</option>
                  {departments.map(d => (
                    <option key={d.id} value={d.id}>{d.name}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium text-slate-700">Subject</label>
                <select
                  className="flex h-10 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-transparent disabled:opacity-50"
                  value={subjectId}
                  onChange={(e) => setSubjectId(e.target.value)}
                  required
                  disabled={!departmentId || subjects.length === 0}
                >
                  <option value="">Select a subject...</option>
                  {subjects.map(s => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1 md:col-span-2">
                <label className="text-sm font-medium text-slate-700">Topic (Optional)</label>
                <select
                  className="flex h-10 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-transparent disabled:opacity-50"
                  value={topicId}
                  onChange={(e) => setTopicId(e.target.value)}
                  disabled={!subjectId || topics.length === 0}
                >
                  <option value="">Select a specific topic if known...</option>
                  {topics.map(t => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                  ))}
                </select>
                <p className="text-xs text-slate-500">Choosing a topic helps route your doubt to the most relevant faculty member.</p>
              </div>
            </div>

            <Input
              label="Title"
              type="text"
              placeholder="E.g., How does the event loop work in Node.js?"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
            
            <div className="space-y-1">
              <label className="text-sm font-medium text-slate-700">Description</label>
              <textarea
                className="flex min-h-[150px] w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-transparent"
                placeholder="Provide more context, code snippets, or what you've already tried..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
              />
            </div>
          </CardContent>
          <CardFooter className="flex justify-end space-x-2">
            <Button type="button" variant="ghost" onClick={() => navigate('/student/dashboard')}>
              Cancel
            </Button>
            <Button type="submit" isLoading={isLoading}>
              Submit Doubt
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};
