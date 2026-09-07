import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../lib/api';
import { Department } from '../../types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';

export const AdminFacultyCreator = () => {
  const navigate = useNavigate();
  const [departments, setDepartments] = useState<Department[]>([]);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [departmentId, setDepartmentId] = useState('');
  const [maxWorkload, setMaxWorkload] = useState(5);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const fetchDepts = async () => {
      const res: any = await api.get('/api/departments');
      if (res.success) setDepartments(res.data);
    };
    fetchDepts();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      const res: any = await api.post('/admin/faculty', {
        email,
        password,
        name,
        departmentId,
        maxWorkload: Number(maxWorkload),
      });

      if (res.success) {
        setSuccess('Faculty member created successfully!');
        // Reset form
        setEmail('');
        setPassword('');
        setName('');
        setDepartmentId('');
        setMaxWorkload(5);
      }
    } catch (err: any) {
      if (err.errors && err.errors.length > 0) {
        setError(err.errors[0].message);
      } else {
        setError(err.message || 'Failed to create faculty');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">Add Faculty Member</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Faculty Details</CardTitle>
          <CardDescription>Create a new account for a faculty member. They will need these credentials to log in.</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {error && (
              <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm">
                {error}
              </div>
            )}
            {success && (
              <div className="bg-green-50 text-green-600 p-3 rounded-md text-sm">
                {success}
              </div>
            )}
            
            <Input
              label="Full Name"
              type="text"
              placeholder="Dr. Jane Smith"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
            
            <Input
              label="Email"
              type="email"
              placeholder="faculty@university.edu"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            
            <Input
              label="Initial Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

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

            <Input
              label="Max Workload (Concurrent Doubts)"
              type="number"
              min="1"
              max="20"
              value={maxWorkload}
              onChange={(e) => setMaxWorkload(Number(e.target.value))}
              required
            />
            
          </CardContent>
          <CardFooter className="flex justify-end space-x-2">
            <Button type="button" variant="ghost" onClick={() => navigate('/admin/dashboard')}>
              Cancel
            </Button>
            <Button type="submit" isLoading={isLoading}>
              Create Faculty Account
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};
