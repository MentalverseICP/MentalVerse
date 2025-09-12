import { useState } from 'react';
import { useSidebar } from "@/components/ui/Sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { FileText, Plus, Edit, Trash2, Calendar, Target, CheckCircle } from "lucide-react";
import { useTheme } from "@/components/shared/theme-provider";

interface TreatmentPlan {
  id: string;
  patientName: string;
  patientId: string;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  status: 'active' | 'completed' | 'paused' | 'draft';
  progress: number;
  goals: string[];
  interventions: string[];
  nextReview: string;
}

const mockTreatmentPlans: TreatmentPlan[] = [
  {
    id: '1',
    patientName: 'Sarah Johnson',
    patientId: 'P001',
    title: 'Anxiety Management Program',
    description: 'Comprehensive treatment plan for generalized anxiety disorder with focus on CBT techniques.',
    startDate: '2024-01-01',
    endDate: '2024-04-01',
    status: 'active',
    progress: 65,
    goals: [
      'Reduce anxiety symptoms by 50%',
      'Improve sleep quality',
      'Develop coping strategies for work stress'
    ],
    interventions: [
      'Weekly CBT sessions',
      'Mindfulness meditation practice',
      'Progressive muscle relaxation',
      'Cognitive restructuring exercises'
    ],
    nextReview: '2024-01-22'
  },
  {
    id: '2',
    patientName: 'Michael Chen',
    patientId: 'P002',
    title: 'Depression Recovery Plan',
    description: 'Evidence-based treatment for major depressive disorder using combination therapy.',
    startDate: '2023-11-15',
    endDate: '2024-02-15',
    status: 'active',
    progress: 80,
    goals: [
      'Improve mood and energy levels',
      'Restore social functioning',
      'Address negative thought patterns'
    ],
    interventions: [
      'Bi-weekly therapy sessions',
      'Behavioral activation',
      'Social skills training',
      'Medication management'
    ],
    nextReview: '2024-01-20'
  },
  {
    id: '3',
    patientName: 'Emily Rodriguez',
    patientId: 'P003',
    title: 'PTSD Treatment Protocol',
    description: 'Trauma-focused therapy for post-traumatic stress disorder.',
    startDate: '2023-10-01',
    endDate: '2024-01-01',
    status: 'completed',
    progress: 100,
    goals: [
      'Reduce PTSD symptoms',
      'Improve daily functioning',
      'Process traumatic memories'
    ],
    interventions: [
      'EMDR therapy',
      'Exposure therapy',
      'Grounding techniques',
      'Support group participation'
    ],
    nextReview: '2024-01-15'
  }
];

export default function TreatmentPlans() {
  const { state } = useSidebar();
  const { theme } = useTheme();
  const isCollapsed = state === "collapsed";
  const [treatmentPlans] = useState<TreatmentPlan[]>(mockTreatmentPlans);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-white dark:text-white' + (theme === 'dark' ? ' bg-[#0DB16A]' : ' bg-[#18E614]');
      case 'completed': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case 'paused': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      case 'draft': return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className={`grid grid-cols-12 justify-evenly max-sm:ml-[4.5rem] max-lg:ml-20 mt-4 mb-4 pr-4 w-full ${
      isCollapsed
        ? "gap-2 lg:gap-3 xl:gap-4 w-full max-md:w-fit md:pr-4 md:pl-2"
        : "gap-2 lg:gap-3 xl:gap-4 px-2  w-full max-md:w-fit"
    }`}>
      <div className="col-span-12 w-full">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-red-500">Treatment Plans</h1>
            <p className="text-muted-foreground mt-1">Create and manage personalized treatment plans for your patients</p>
          </div>
          <Button className="bg-[#18E614] hover:bg-[#18E614]/90 text-white">
            <Plus className="w-4 h-4 mr-2" />
            <span className='max-md:hidden'>Create Plant</span>
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6 w-full">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Active Plans</p>
                  <p className="text-2xl font-bold">12</p>
                </div>
                <Target className="w-8 h-8 text-[#18E614]" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Completed</p>
                  <p className="text-2xl font-bold">8</p>
                </div>
                <CheckCircle className="w-8 h-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Draft Plans</p>
                  <p className="text-2xl font-bold">3</p>
                </div>
                <FileText className="w-8 h-8 text-yellow-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Due for Review</p>
                  <p className="text-2xl font-bold">5</p>
                </div>
                <Calendar className="w-8 h-8 text-red-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Treatment Plans List */}
        <div className="grid gap-6 w-full">
          {treatmentPlans.map((plan) => (
            <Card key={plan.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-xl">{plan.title}</CardTitle>
                    <p className="text-muted-foreground mt-1">
                      {plan.patientName} (ID: {plan.patientId})
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge className={getStatusColor(plan.status)}>
                      {plan.status}
                    </Badge>
                    <div className="flex space-x-1">
                      <Button variant="outline" size="sm">
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button variant="outline" size="sm">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent>
                <p className="text-muted-foreground mb-4">{plan.description}</p>
                
                {/* Progress */}
                <div className="mb-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium">Progress</span>
                    <span className="text-sm text-muted-foreground">{plan.progress}%</span>
                  </div>
                  <Progress value={plan.progress} className="h-2" />
                </div>
                
                {/* Timeline */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Start Date</p>
                    <p className="text-sm">{formatDate(plan.startDate)}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">End Date</p>
                    <p className="text-sm">{formatDate(plan.endDate)}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Next Review</p>
                    <p className="text-sm">{formatDate(plan.nextReview)}</p>
                  </div>
                </div>
                
                {/* Goals */}
                <div className="mb-4">
                  <p className="text-sm font-medium text-muted-foreground mb-2">Treatment Goals:</p>
                  <div className="flex flex-wrap gap-2">
                    {plan.goals.map((goal, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {goal}
                      </Badge>
                    ))}
                  </div>
                </div>
                
                {/* Interventions */}
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-2">Interventions:</p>
                  <ul className="text-sm space-y-1">
                    {plan.interventions.map((intervention, index) => (
                      <li key={index} className="flex items-center">
                        <CheckCircle className="w-3 h-3 text-green-500 mr-2 flex-shrink-0" />
                        {intervention}
                      </li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}


