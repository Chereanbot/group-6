"use client";

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { 
  BookOpen, 
  CheckCircle, 
  FileText, 
  AlertTriangle,
  Clock,
  Download,
  ExternalLink,
  PlayCircle
} from 'lucide-react';
import { Training, Certification } from '@/types/ethics';

// Add mock data for demonstration
const mockTrainings: Training[] = [
  {
    id: "1",
    title: "Professional Ethics 2024",
    description: "Annual ethics training covering core principles and updates",
    duration: "2 hours",
    status: "in-progress",
    completionDate: undefined,
    expiryDate: new Date("2024-12-31")
  },
  {
    id: "2",
    title: "Client Confidentiality",
    description: "Best practices for maintaining client privacy",
    duration: "1 hour",
    status: "completed",
    completionDate: new Date("2024-02-15"),
    expiryDate: new Date("2024-12-31")
  }
];

const mockCertifications: Certification[] = [
  {
    id: "1",
    name: "Legal Ethics Certification",
    issueDate: new Date("2024-01-01"),
    expiryDate: new Date("2024-12-31"),
    status: "active",
    issuingAuthority: "State Bar Association",
    documentUrl: "/certifications/ethics-2024.pdf"
  }
];

export default function EthicsCompliancePage() {
  const [activeTab, setActiveTab] = useState('overview');

  // Add training card component
  const TrainingCard = ({ training }: { training: Training }) => (
    <Card>
      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="font-semibold">{training.title}</h3>
            <p className="text-sm text-gray-500">{training.description}</p>
          </div>
          <Button variant="outline" size="sm">
            {training.status === 'completed' ? (
              <FileText className="h-4 w-4 mr-2" />
            ) : (
              <PlayCircle className="h-4 w-4 mr-2" />
            )}
            {training.status === 'completed' ? 'Review' : 'Continue'}
          </Button>
        </div>
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Progress</span>
            <span>{training.status === 'completed' ? '100%' : '60%'}</span>
          </div>
          <Progress value={training.status === 'completed' ? 100 : 60} />
          <div className="flex justify-between text-sm text-gray-500">
            <span>Duration: {training.duration}</span>
            <span>Expires: {training.expiryDate?.toLocaleDateString()}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  // Add certification card component
  const CertificationCard = ({ certification }: { certification: Certification }) => (
    <Card>
      <CardContent className="p-4">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="font-semibold">{certification.name}</h3>
            <p className="text-sm text-gray-500">{certification.issuingAuthority}</p>
          </div>
          <div className={`px-2 py-1 rounded-full text-sm ${
            certification.status === 'active' 
              ? 'bg-green-100 text-green-800' 
              : 'bg-yellow-100 text-yellow-800'
          }`}>
            {certification.status.charAt(0).toUpperCase() + certification.status.slice(1)}
          </div>
        </div>
        <div className="mt-4 space-y-2">
          <div className="flex justify-between text-sm text-gray-500">
            <span>Issued: {certification.issueDate.toLocaleDateString()}</span>
            <span>Expires: {certification.expiryDate.toLocaleDateString()}</span>
          </div>
          <div className="flex space-x-2">
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Download
            </Button>
            <Button variant="outline" size="sm">
              <ExternalLink className="h-4 w-4 mr-2" />
              Verify
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Ethics & Compliance</h1>
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-500">Last Updated:</span>
          <span className="text-sm font-medium">March 15, 2024</span>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center space-x-4">
            <div className="p-2 bg-green-100 rounded-full">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Compliance Status</p>
              <p className="text-xl font-bold">Compliant</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 flex items-center space-x-4">
            <div className="p-2 bg-blue-100 rounded-full">
              <Clock className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Next Review Due</p>
              <p className="text-xl font-bold">30 Days</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 flex items-center space-x-4">
            <div className="p-2 bg-yellow-100 rounded-full">
              <AlertTriangle className="h-6 w-6 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Pending Actions</p>
              <p className="text-xl font-bold">2 Items</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 flex items-center space-x-4">
            <div className="p-2 bg-purple-100 rounded-full">
              <FileText className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Certifications</p>
              <p className="text-xl font-bold">12</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="requirements">Requirements</TabsTrigger>
          <TabsTrigger value="training">Training</TabsTrigger>
          <TabsTrigger value="certifications">Certifications</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <Card>
            <CardHeader>
              <CardTitle>Ethics Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <h3 className="font-semibold">Recent Updates</h3>
                    <ul className="list-disc list-inside space-y-1 text-sm">
                      <li>Updated conflict of interest guidelines</li>
                      <li>New client confidentiality procedures</li>
                      <li>Revised fee structure policies</li>
                    </ul>
                  </div>
                  <div className="space-y-2">
                    <h3 className="font-semibold">Upcoming Deadlines</h3>
                    <ul className="list-disc list-inside space-y-1 text-sm">
                      <li>Annual ethics certification (Due: April 1)</li>
                      <li>Compliance training renewal (Due: May 15)</li>
                    </ul>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="requirements">
          <Card>
            <CardHeader>
              <CardTitle>Compliance Requirements</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Add requirements content */}
                <div className="border rounded-lg p-4">
                  <h3 className="font-semibold mb-2">Professional Conduct</h3>
                  <ul className="list-disc list-inside space-y-2 text-sm">
                    <li>Client confidentiality maintenance</li>
                    <li>Conflict of interest disclosure</li>
                    <li>Professional liability insurance</li>
                    <li>Record keeping requirements</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="training">
          <Card>
            <CardHeader>
              <CardTitle>Required Training</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {mockTrainings.map(training => (
                    <TrainingCard key={training.id} training={training} />
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="certifications">
          <Card>
            <CardHeader>
              <CardTitle>Your Certifications</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 gap-4">
                  {mockCertifications.map(certification => (
                    <CertificationCard key={certification.id} certification={certification} />
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
} 