"use client";

import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import {
  HiOutlineChat,
  HiOutlineCog,
  HiOutlineQuestionMarkCircle,
  HiOutlineClipboardList,
} from 'react-icons/hi';
import { AIChatInterface } from './AIChatInterface';
import AgentInstructions from './AgentInstructions';
import AgentSettings from './AgentSettings';
import AgentHelp from './AgentHelp';

export default function AgentInterface() {
  const [activeTab, setActiveTab] = useState('chat');

  return (
    <Card className="w-full max-w-4xl mx-auto bg-white dark:bg-gray-800 shadow-xl rounded-xl overflow-hidden">
      <Tabs defaultValue="chat" className="w-full" onValueChange={setActiveTab}>
        <TabsList className="h-16 w-full justify-start gap-4 bg-transparent pl-4">
          <TabsTrigger
            value="chat"
            className="flex items-center gap-2 data-[state=active]:bg-primary-500/10"
          >
            <HiOutlineChat className="h-5 w-5" />
            <span>Chat</span>
          </TabsTrigger>
          
          <TabsTrigger
            value="instructions"
            className="flex items-center gap-2 data-[state=active]:bg-primary-500/10"
          >
            <HiOutlineClipboardList className="h-5 w-5" />
            <span>Instructions</span>
          </TabsTrigger>
          
          <TabsTrigger
            value="settings"
            className="flex items-center gap-2 data-[state=active]:bg-primary-500/10"
          >
            <HiOutlineCog className="h-5 w-5" />
            <span>Settings</span>
          </TabsTrigger>
          
          <TabsTrigger
            value="help"
            className="flex items-center gap-2 data-[state=active]:bg-primary-500/10"
          >
            <HiOutlineQuestionMarkCircle className="h-5 w-5" />
            <span>Help</span>
          </TabsTrigger>
        </TabsList>

        <div className="p-4">
          <TabsContent value="chat" className="mt-0">
            <div className="h-[600px]">
              <AIChatInterface onClose={() => {}} />
            </div>
          </TabsContent>

          <TabsContent value="instructions" className="mt-0">
            <AgentInstructions />
          </TabsContent>

          <TabsContent value="settings" className="mt-0">
            <AgentSettings />
          </TabsContent>

          <TabsContent value="help" className="mt-0">
            <AgentHelp />
          </TabsContent>
        </div>
      </Tabs>
    </Card>
  );
}
