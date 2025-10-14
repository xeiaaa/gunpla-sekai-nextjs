"use client";

import KitFormBase from "./kit-form-base";

export function CreateNewKitContent() {
  const handleCreate = (data) => {
    console.log("Creating:", data);
  };
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="mb-4 text-3xl font-bold">Add a New Kit</h1>
        <KitFormBase mode="create" onSubmit={handleCreate} />;
      </div>
    </div>
  );
}
