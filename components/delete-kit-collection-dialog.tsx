"use client";

import { useState } from "react";
import { Trash2 } from "lucide-react";
import { useAuth } from "@clerk/nextjs";
import { DialogDescription } from "@radix-ui/react-dialog";
import { useQueryClient } from "@tanstack/react-query";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useToast } from "./ui/toast";

interface DeleteKitCollectionDialogProps {
  collectionId: string;
  kitId: string;
  onSuccess?: () => void; // optional callback after delete
}

export function DeleteKitCollectionDialog({
  collectionId,
  kitId,
  onSuccess,
}: DeleteKitCollectionDialogProps) {
  const [loading, setLoading] = useState(false);
  const { getToken } = useAuth();
  const [openDialog, setOpenDialog] = useState<boolean>(false);
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  const handleDelete = async () => {
    try {
      setLoading(true);
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "/api/v1";
      const token = await getToken();
      const endpoint = `${apiUrl}/user-collections/${collectionId}`;

      const response = await fetch(endpoint, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        console.error("❌ Failed to delete kit");
        return;
      }

      if (onSuccess) onSuccess(); // refresh UI
    } catch (error) {
      console.error("❌ Delete error:", error);
    } finally {
      setLoading(false);
      setOpenDialog(false);
      queryClient.invalidateQueries({
        queryKey: ["kit-collections", kitId],
      });
      showToast("Collection deleted successfully!", "success");
    }
  };

  return (
    <Dialog
      open={openDialog}
      onOpenChange={(open) => {
        setOpenDialog(open);
      }}
    >
      <DialogTrigger asChild>
        <button
          className="w-9 h-9 rounded-lg bg-gray-100 hover:bg-red-100 text-gray-600 hover:text-red-600 transition-colors flex items-center justify-center"
          onClick={() => setOpenDialog(true)}
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete Kit from Collection?</DialogTitle>
          <DialogDescription>
            This action cannot be undone. This will permanently remove this kit
            from your collection history.
          </DialogDescription>
        </DialogHeader>

        <DialogFooter>
          <Button onClick={handleDelete} disabled={loading}>
            {loading ? "Deleting..." : "Delete"}
          </Button>
          <Button variant="outline" onClick={() => setOpenDialog(false)}>
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
