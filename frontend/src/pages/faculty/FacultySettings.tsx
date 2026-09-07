import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../lib/api';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';

export const FacultySettings = () => {
  const [isAvailable, setIsAvailable] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  // Note: Backend doesn't easily expose current availability in auth/me for faculty directly,
  // but let's assume we can fetch it or just allow them to toggle it.
  
  const handleSave = async () => {
    setIsLoading(true);
    try {
      await api.patch('/faculty/availability', {
        availableFrom: isAvailable ? new Date().toISOString() : null,
        availableUntil: isAvailable ? new Date(Date.now() + 1000 * 60 * 60 * 24 * 365).toISOString() : null // 1 year from now if available
      });
      // In a real app we'd show a success toast here
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-slate-900">Settings</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>Availability</CardTitle>
          <CardDescription>Manage your current availability status for receiving new doubts.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-3">
            <input 
              type="checkbox" 
              id="availability"
              className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-600"
              checked={isAvailable}
              onChange={(e) => setIsAvailable(e.target.checked)}
            />
            <label htmlFor="availability" className="text-sm font-medium text-slate-700">
              I am currently available to take new doubts
            </label>
          </div>
        </CardContent>
        <CardFooter className="flex justify-end">
          <Button onClick={handleSave} isLoading={isLoading}>Save Changes</Button>
        </CardFooter>
      </Card>
    </div>
  );
};
