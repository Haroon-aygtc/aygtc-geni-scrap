import React from "react";
import FollowUpQuestionsConfig from "@/components/admin/FollowUpQuestionsConfig";
import { useToast } from "@/components/ui/use-toast";
import { useAdmin } from "@/context/AdminContext";

const FollowUpQuestionsPage = () => {
  const { toast } = useToast();
  const { triggerRefresh } = useAdmin();

  const handleSaveConfig = async (config: any) => {
    try {
      // Call your API endpoint to save the configuration
      const response = await fetch("/api/admin/follow-up-questions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(config),
      });

      if (!response.ok) {
        throw new Error("Failed to save follow-up questions configuration");
      }

      toast({
        title: "Success",
        description: "Follow-up questions configuration saved successfully.",
      });
      triggerRefresh();
      return true;
    } catch (error) {
      console.error("Error saving follow-up questions configuration:", error);
      toast({
        title: "Error",
        description: "Failed to save follow-up questions configuration.",
        variant: "destructive",
      });
      throw error;
    }
  };

  return (
    <div className="container mx-auto py-6">
      <FollowUpQuestionsConfig onSave={handleSaveConfig} />
    </div>
  );
};

export default FollowUpQuestionsPage;
