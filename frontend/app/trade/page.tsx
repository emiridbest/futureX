"use client";

import Chat from "@/components/Chat";
import { Toaster } from 'sonner';

export default function ChatPage() {
  return (
    <main className="container mx-auto py-6">
      <Chat />
      <Toaster />
    </main>
  );
}