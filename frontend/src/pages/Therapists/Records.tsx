import React, { useState } from 'react';
import { useSidebar } from "@/components/ui/Sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useTheme } from "@/components/shared/theme-provider";
import { 
  FileText, 
  Search, 
  Filter, 
  Download, 
  Eye, 
  Edit, 
  Plus,
  Calendar,
  User,
  Shield,
  Lock
} from "lucide-react";

interface MentalHealthRecord {
  id: string;
  patientName: string;
  patientId: string;
  recordType: 'session' | 'assessment' | 'diagnosis' | 'treatment' | 'progress';
  title: string;
  date: string;
  therapist: string;
  status: 'draft' | 'finalized' | 'archived';
  confidentiality: 'standard' | 'high' | 'restricted';
  tags: string[];
  summary: string;
}

const mockRecords: MentalHealthRecord[] = [
  {
    id: '1',
    patientName: 'Sarah Johnson',
    patientId: 'P001',
    recordType: 'session',
    title: 'Initial Assessment - Anxiety Evaluation',
    date: '2024-01-10',
    therapist: 'Dr. Smith',
    status: 'finalized',
    confidentiality: 'standard',
    tags: ['anxiety', 'assessment', 'initial'],
    summary: 'Comprehensive initial assessment revealing moderate generalized anxiety disorder with specific triggers related to work performance.'
  },
  {
    id: '2',
    patientName: 'Michael Chen',
    patientId: 'P002',
    recordType: 'diagnosis',
    title: 'Diagnostic Evaluation - Depression',
    date: '2024-01-08',
    therapist: 'Dr. Smith',
    status: 'finalized',
    confidentiality: 'high',
    tags: ['depression', 'diagnosis', 'evaluation'],
    summary: 'Diagnostic assessment confirming major depressive episode with moderate severity. Patient shows good insight and motivation for treatment.'
  },
  {
    id: '3',
    patientName: 'Emily Rodriguez',
    patientId: 'P003',
    recordType: 'progress',
    title: 'Progress Note - PTSD Treatment',
    date: '2024-01-12',
    therapist: 'Dr. Smith',
    status: 'draft',
    confidentiality: 'restricted',
    tags: ['PTSD', 'progress', 'trauma'],
    summary: 'Significant progress noted in trauma processing. Patient reports reduced flashbacks and improved sleep patterns.'
  }
];

export default function MentalHealthRecords() {
  const { state } = useSidebar();
  const { theme } = useTheme();
  const isCollapsed = state === "collapsed";
  const [records] = useState<MentalHealthRecord[]>(mockRecords);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');

  const getRecordTypeColor = (type: string) => {
    switch (type) {
      case 'session': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case 'assessment': return 'text-white dark:text-white' + (theme === 'dark' ? ' bg-[#0DB16A]' : ' bg-[#18E614]');
      case 'diagnosis': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300';
      case 'treatment': return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300';
      case 'progress': return 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      case 'finalized': return 'text-white dark:text-white' + (theme === 'dark' ? ' bg-[#0DB16A]' : ' bg-[#18E614]');
      case 'archived': return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
    }
  };

  const getConfidentialityIcon = (level: string) => {
    switch (level) {
      case 'standard': return <FileText className="w-4 h-4" />;
      case 'high': return <Shield className="w-4 h-4" />;
      case 'restricted': return <Lock className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const filteredRecords = records.filter(record => {
    const matchesSearch = record.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         record.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         record.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesFilter = filterType === 'all' || record.recordType === filterType;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className={`grid grid-cols-12 justify-evenly max-sm:ml-[4.5rem] max-lg:ml-20 mt-4 mb-4 mr-2 w-fit max-sm:w-fit ${
      isCollapsed
        ? "gap-2 lg:gap-3 xl:gap-4 w-full max-md:w-fit md:pr-4 md:pl-2 max-md:px"
        : "gap-2 lg:gap-3 xl:gap-4 px-2"
    }`}>
      <div className="col-span-12 w-full">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-red-500">Mental Health Records</h1>
            <p className="text-muted-foreground mt-1">Secure management of patient mental health records and documentation</p>
          </div>
          <Button className="bg-[#18E614] hover:bg-[#18E614]/90 text-white">
            <Plus className="w-4 h-4 mr-2" />
            <span className='max-md:hidden'>New Record</span>
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6 w-full">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Records</p>
                  <p className="text-2xl font-bold">156</p>
                </div>
                <FileText className="w-8 h-8 text-[#18E614]" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">This Month</p>
                  <p className="text-2xl font-bold">23</p>
                </div>
                <Calendar className="w-8 h-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Draft Records</p>
                  <p className="text-2xl font-bold">8</p>
                </div>
                <Edit className="w-8 h-8 text-yellow-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">High Security</p>
                  <p className="text-2xl font-bold">12</p>
                </div>
                <Shield className="w-8 h-8 text-red-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filter */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6 w-full">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search records, patients, or tags..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex gap-2">
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-3 py-2 border border-input rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-[#18E614] focus:border-transparent"
            >
              <option value="all">All Types</option>
              <option value="session">Sessions</option>
              <option value="assessment">Assessments</option>
              <option value="diagnosis">Diagnoses</option>
              <option value="treatment">Treatments</option>
              <option value="progress">Progress</option>
            </select>
            <Button variant="outline">
              <Filter className="w-4 h-4 mr-2" />
              More Filters
            </Button>
          </div>
        </div>

        {/* Records List */}
        <div className="grid gap-4 w-full">
          {filteredRecords.map((record) => (
            <Card key={record.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between max-md:flex-col max-md:gap-10">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="font-semibold text-lg">{record.title}</h3>
                      <Badge className={getRecordTypeColor(record.recordType)}>
                        {record.recordType}
                      </Badge>
                      <Badge className={getStatusColor(record.status)}>
                        {record.status}
                      </Badge>
                    </div>
                    
                    <div className="flex flex-wrap items-center space-y-1 space-x-4 text-sm text-muted-foreground mb-3">
                      <div className="flex items-center space-x-1">
                        <User className="w-4 h-4" />
                        <span>{record.patientName} (ID: {record.patientId})</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Calendar className="w-4 h-4" />
                        <span>{formatDate(record.date)}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        {getConfidentialityIcon(record.confidentiality)}
                        <span className="capitalize">{record.confidentiality} confidentiality</span>
                      </div>
                    </div>
                    
                    <p className="text-muted-foreground mb-3">{record.summary}</p>
                    
                    <div className="flex flex-wrap gap-2">
                      {record.tags.map((tag, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  
                  <div className="flex space-x-2 ml-4">
                    <Button variant="outline" size="sm">
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button variant="outline" size="sm">
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button variant="outline" size="sm">
                      <Download className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}


