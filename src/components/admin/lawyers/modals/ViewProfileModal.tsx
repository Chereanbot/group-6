'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { 
  Mail, 
  Phone, 
  MapPin, 
  Briefcase, 
  GraduationCap,
  Award,
  Clock
} from 'lucide-react';

interface ViewProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  lawyer: any; // Replace with proper type
}

export default function ViewProfileModal({ isOpen, onClose, lawyer }: ViewProfileModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Lawyer Profile</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Basic Info */}
          <div className="flex items-start gap-6">
            <Avatar className="h-24 w-24">
              <AvatarImage src={lawyer.avatar} />
              <AvatarFallback>{lawyer.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
            </Avatar>
            <div>
              <h2 className="text-2xl font-bold">{lawyer.name}</h2>
              <p className="text-muted-foreground">{lawyer.title}</p>
              <div className="flex items-center gap-4 mt-4">
                <Badge>{lawyer.status}</Badge>
                <Badge variant="outline">{lawyer.specialization}</Badge>
              </div>
            </div>
          </div>

          {/* Contact Info */}
          <Card className="p-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-muted-foreground" />
                <span>{lawyer.email}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-muted-foreground" />
                <span>{lawyer.phone}</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-muted-foreground" />
                <span>{lawyer.office}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-muted-foreground" />
                <span>{lawyer.experience} Experience</span>
              </div>
            </div>
          </Card>

          {/* Education */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Education</h3>
            <div className="space-y-4">
              {lawyer.education.map((edu: any, index: number) => (
                <Card key={index} className="p-4">
                  <div className="flex items-start gap-3">
                    <GraduationCap className="w-5 h-5 text-primary-500 mt-1" />
                    <div>
                      <h4 className="font-medium">{edu.degree}</h4>
                      <p className="text-sm text-muted-foreground">
                        {edu.institution}, {edu.year}
                      </p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>

          {/* Expertise */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Areas of Expertise</h3>
            <div className="flex flex-wrap gap-2">
              {lawyer.expertise.map((area: string, index: number) => (
                <Badge key={index} variant="secondary">
                  {area}
                </Badge>
              ))}
            </div>
          </div>

          {/* Performance Summary */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Performance Summary</h3>
            <Card className="p-4">
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Success Rate</p>
                  <p className="text-2xl font-bold">{lawyer.cases.success_rate}%</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Cases Handled</p>
                  <p className="text-2xl font-bold">{lawyer.cases.completed}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Active Cases</p>
                  <p className="text-2xl font-bold">{lawyer.cases.active}</p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
} 