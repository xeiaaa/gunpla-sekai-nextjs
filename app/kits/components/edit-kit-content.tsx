"use client";

import KitFormBase, { KitFormData } from "./kit-form-base";

export function EditKitContent({ kit }: { kit: KitFormData }) {
  const handleEdit = (data) => {
    console.log("Editing", data);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="mb-4 text-3xl font-bold">Edit Kit</h1>
        <KitFormBase initialData={kit} mode="edit" onSubmit={handleEdit} />;
      </div>
    </div>
  );
}
