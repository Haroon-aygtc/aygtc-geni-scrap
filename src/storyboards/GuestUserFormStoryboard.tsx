import React from "react";
import GuestUserForm from "@/components/chat/GuestUserForm";

export default function GuestUserFormStoryboard() {
  return (
    <div className="bg-white min-h-screen p-6 flex items-center justify-center">
      <div className="w-full max-w-md">
        <GuestUserForm
          onSubmit={(data) => console.log("Form submitted:", data)}
          isLoading={false}
        />
      </div>
    </div>
  );
}
