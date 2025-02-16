"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { HiOutlineExternalLink } from "react-icons/hi";

export default function AgentHelp() {
  const helpTopics = [
    {
      title: "Getting Started with AI Agent",
      content: `The AI Agent is your personal assistant that helps you manage tasks, monitor information, and stay organized. Here's how to get started:
      
      1. Use the Chat tab to communicate directly with the AI
      2. Set up Instructions to automate repetitive tasks
      3. Configure your preferences in Settings
      4. Check notifications for important updates`,
    },
    {
      title: "Setting Up Instructions",
      content: `Instructions tell the AI Agent what to monitor and how to respond. To create an instruction:
      
      1. Go to the Instructions tab
      2. Click "New Instruction"
      3. Choose the type of instruction
      4. Describe what you want the agent to do
      5. Set the priority level
      
      The agent will then follow these instructions and notify you of any important findings.`,
    },
    {
      title: "Chat Features",
      content: `The Chat interface allows you to:
      
      • Ask questions about your cases and tasks
      • Request analysis of documents
      • Get recommendations for actions
      • Receive real-time updates
      • Access historical chat logs
      
      Use natural language to communicate - the AI understands context and can handle complex requests.`,
    },
    {
      title: "Notification System",
      content: `The Agent will notify you about:
      
      • Important updates from your instructions
      • Urgent tasks that need attention
      • Changes in monitored content
      • Completed analyses
      
      You can customize notification settings in the Settings tab.`,
    },
    {
      title: "Best Practices",
      content: `To get the most out of your AI Agent:
      
      1. Be specific in your instructions
      2. Use appropriate priority levels
      3. Regular check notifications
      4. Keep your settings updated
      5. Use the chat for complex queries
      
      The more you interact with the agent, the better it understands your needs.`,
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
          Help & Documentation
        </h2>
        <p className="text-gray-500 dark:text-gray-400">
          Learn how to use the AI Agent effectively
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Quick Actions</h3>
          <div className="grid gap-2">
            <Button variant="outline" className="justify-start">
              <span className="flex items-center gap-2">
                Watch Tutorial
                <HiOutlineExternalLink className="h-4 w-4" />
              </span>
            </Button>
            <Button variant="outline" className="justify-start">
              <span className="flex items-center gap-2">
                View API Documentation
                <HiOutlineExternalLink className="h-4 w-4" />
              </span>
            </Button>
            <Button variant="outline" className="justify-start">
              <span className="flex items-center gap-2">
                Report an Issue
                <HiOutlineExternalLink className="h-4 w-4" />
              </span>
            </Button>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-medium">Contact Support</h3>
          <p className="text-gray-600 dark:text-gray-300">
            Need help? Our support team is available 24/7.
          </p>
          <Button className="w-full">Contact Support</Button>
        </div>
      </div>

      <div className="mt-8">
        <h3 className="text-lg font-medium mb-4">Frequently Asked Questions</h3>
        <Accordion type="single" collapsible className="w-full">
          {helpTopics.map((topic, index) => (
            <AccordionItem key={index} value={`item-${index}`}>
              <AccordionTrigger>{topic.title}</AccordionTrigger>
              <AccordionContent>
                <div className="prose dark:prose-invert max-w-none">
                  <p className="whitespace-pre-line">{topic.content}</p>
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>

      <div className="mt-8 p-4 bg-primary-50 dark:bg-primary-900/20 rounded-lg">
        <h3 className="text-lg font-medium mb-2">Need More Help?</h3>
        <p className="text-gray-600 dark:text-gray-300">
          Check out our comprehensive documentation or reach out to our support team
          for assistance.
        </p>
        <div className="mt-4 flex gap-4">
          <Button variant="outline">View Documentation</Button>
          <Button>Contact Support</Button>
        </div>
      </div>
    </div>
  );
}
