import React, { useState } from 'react';
import { useSidebar } from "@/components/ui/Sidebar";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, User, Video, Phone, MessageSquare, Plus } from "lucide-react";
import { useTheme } from "@/components/shared/theme-provider";

interface TherapySession {
  id: string;
  patientName: string;
  patientId: string;
  sessionType: 'video' | 'phone' | 'chat' | 'in-person';
  scheduledTime: string;
  duration: number;
  status: 'scheduled' | 'in-progress' | 'completed' | 'cancelled';
  notes?: string;
  goals?: string[];
}

const mockSessions: TherapySession[] = [
  {
    id: '1',
    patientName: 'Sarah Johnson',
    patientId: 'P001',
    sessionType: 'video',
    scheduledTime: '2024-01-15T10:00:00Z',
    duration: 60,
    status: 'scheduled',
    goals: ['Anxiety management', 'Stress reduction']
  },
  {
    id: '2',
    patientName: 'Michael Chen',
    patientId: 'P002',
    sessionType: 'phone',
    scheduledTime: '2024-01-15T14:30:00Z',
    duration: 45,
    status: 'in-progress',
    notes: 'Patient showing improvement in mood regulation'
  },
  {
    id: '3',
    patientName: 'Emily Rodriguez',
    patientId: 'P003',
    sessionType: 'chat',
    scheduledTime: '2024-01-15T16:00:00Z',
    duration: 30,
    status: 'completed',
    notes: 'Discussed coping strategies for work stress'
  }
];

export default function TherapySessions() {
  const { state } = useSidebar();
  const { theme } = useTheme();
  const isCollapsed = state === "collapsed";
  const [sessions] = useState<TherapySession[]>(mockSessions);

  const getSessionTypeIcon = (type: string) => {
    switch (type) {
      case 'video': return <Video className="w-4 h-4" />;
      case 'phone': return <Phone className="w-4 h-4" />;
      case 'chat': return <MessageSquare className="w-4 h-4" />;
      default: return <User className="w-4 h-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case 'in-progress': return 'text-white dark:text-white' + (theme === 'dark' ? ' bg-[#0DB16A]' : ' bg-[#18E614]');
      case 'completed': return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
      case 'cancelled': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className={`grid grid-cols-12 justify-evenly max-sm:ml-[4.5rem] max-lg:ml-20 mt-4 mb-4 pr-4  w-full ${
      isCollapsed
        ? "gap-2 lg:gap-3 xl:gap-4 md:pr-4 md:pl-2 max-md:mx-8 max-md:pr-4"
        : "gap-2 lg:gap-3 xl:gap-4 pr-2"
    }`}>
      <div className="col-span-12 w-full">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-red-500">Therapy Sessions</h1>
            <p className="text-muted-foreground mt-1 text-sm sm:text-base">Manage your therapy sessions and patient interactions</p>
          </div>
          <Button className="bg-[#18E614] hover:bg-[#18E614]/90 text-white w-full sm:w-auto">
            <Plus className="w-4 h-4 mr-2" />
            <span className='max-md:hidden'>Schedule Session</span>
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4 mb-6 w-full">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Sessions</p>
                  <p className="text-2xl font-bold">24</p>
                </div>
                <Calendar className="w-8 h-8 text-[#18E614]" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Active Sessions</p>
                  <p className="text-2xl font-bold">3</p>
                </div>
                <Clock className="w-8 h-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Completed Today</p>
                  <p className="text-2xl font-bold">8</p>
                </div>
                <User className="w-8 h-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Upcoming</p>
                  <p className="text-2xl font-bold">5</p>
                </div>
                <Video className="w-8 h-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sessions List */}
        <div className="grid gap-4 w-full">
          {sessions.map((session) => (
            <Card key={session.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between max-md:flex-col max-md:items-start">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      {getSessionTypeIcon(session.sessionType)}
                      <span className="text-sm text-muted-foreground capitalize">
                        {session.sessionType.replace('-', ' ')}
                      </span>
                    </div>
                    
                    <div className='max-md:flex max-md:items-center max-md:justify-items-center gap-5'>
                      <h3 className="font-semibold text-lg">{session.patientName}</h3>
                      <p className="text-sm text-muted-foreground">Patient ID: {session.patientId}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4 max-md:flex-col max-md:items-start gap-5">
                    <div className="text-right max-md:flex max-md:items-center max-md:justify-items-center gap-5">
                      <p className="font-medium">{formatTime(session.scheduledTime)}</p>
                      <p className="text-sm text-muted-foreground">{session.duration} minutes</p>
                    </div>
                    
                    <Badge className={getStatusColor(session.status)}>
                      {session.status.replace('-', ' ')}
                    </Badge>
                    
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm">
                        View Details
                      </Button>
                      {session.status === 'scheduled' && (
                        <Button size="sm" className="bg-[#18E614] hover:bg-[#18E614]/90">
                          Start Session
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
                
                {session.goals && session.goals.length > 0 && (
                  <div className="mt-4">
                    <p className="text-sm font-medium text-muted-foreground mb-2">Session Goals:</p>
                    <div className="flex flex-wrap gap-2">
                      {session.goals.map((goal, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {goal}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
                
                {session.notes && (
                  <div className="mt-4">
                    <p className="text-sm font-medium text-muted-foreground mb-1">Notes:</p>
                    <p className="text-sm">{session.notes}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}

