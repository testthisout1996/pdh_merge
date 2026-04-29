import * as React from "react";
import { Link } from "wouter";
import { ArrowLeft, Beaker } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ToolPlaceholder({ toolName }: { toolName: string }) {
  return (
    <div className="min-h-[100dvh] flex flex-col bg-background">
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
        <div className="w-20 h-20 bg-secondary text-secondary-foreground rounded-full flex items-center justify-center mb-8 shadow-sm">
          <Beaker className="w-10 h-10" />
        </div>
        <h1 className="text-3xl md:text-4xl font-bold mb-4 max-w-2xl">{toolName}</h1>
        <p className="text-xl text-muted-foreground mb-10 max-w-lg">
          Coming soon — this tool will be plugged in here.
        </p>
        <Link href="/" className="inline-flex">
          <Button size="lg" className="rounded-full shadow-md gap-2">
            <ArrowLeft className="w-4 h-4" />
            Back to Pharmacy Hub
          </Button>
        </Link>
      </div>
    </div>
  );
}
