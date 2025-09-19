"use client";
import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Models } from "node-appwrite";
import Image from "next/image";
import { actionsDropdownItems } from "@/constants";
import Link from "next/link";
import { constructDownloadUrl } from "@/lib/utils";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { usePathname } from "next/navigation";
import {
  deleteFile,
  renameFile,
  updateFileUsers,
} from "@/lib/actions/files.action";
import { FileDetails, ShareInput } from "./ActionModalContent";
const ActionDropdown = ({ file }: { file: Models.Document }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [action, setAction] = useState<ActionType | null>(null);
  const [name, setName] = useState(file.name);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState<string[]>([]);
  const path = usePathname();
  const closeAllModal = () => {
    setIsModalOpen(false);
    setIsDropdownOpen(false);
    setAction(null);
    setName(file.name);
    setEmail([]);
  };

  const handleAction = async () => {
    if (!action) return;
    setLoading(true);
    let success = false;
    const actions = {
      rename: () =>
        renameFile({ fileId: file.$id, name, extension: file.extension, path }),

      share: () => {
        updateFileUsers({ fileId: file.$id, emails: email, path });
      },
      delete: () => {
        deleteFile({ fileId: file.$id, bucketFileId: file.bucketFileId, path });
      },
    };
    success = await actions[action.value as keyof typeof actions]();
    if (success) closeAllModal();
    setLoading(false);
  };

  const handleRemoverUser = async (email: string) => {
    const updatedUserEmail = file.users.filter((e: string) => e !== email);
    const success = await updateFileUsers({
      fileId: file.$id,
      emails: updatedUserEmail,
      path,
    });
    if (success) setEmail(updatedUserEmail);
    closeAllModal();
  };

  const renderDialogContent = () => {
    if (!action) return null;
    const { value, label } = action;
    return (
      <DialogContent className="shad-dialog button">
        <DialogHeader className="flex flex-col gap-4">
          <DialogTitle className="text-center text-light-100">
            {label}
          </DialogTitle>
          {value === "rename" && (
            <Input value={name} onChange={(e) => setName(e.target.value)} />
          )}
          {value === "details" && <FileDetails file={file} />}
          {value === "share" && (
            <ShareInput
              file={file}
              onInputChange={setEmail}
              onRemove={handleRemoverUser}
            />
          )}
          {value === "delete" && (
            <p className="delete-confirmation">
              Are you sure you want to delete{" "}
              <span className="delete-file-name">{file.name}</span>
            </p>
          )}
          {["rename", "share", "delete"].includes(value) && (
            <DialogFooter className="flex flex-col gap-3 md:flex-row">
              <Button
                onClick={() => {
                  closeAllModal();
                }}
                className="modal-cancel-button"
              >
                Cancel
              </Button>
              <Button onClick={handleAction} className="modal-submit-button">
                <p className="capitalize">{value}</p>
                {loading && (
                  <Image
                    src="/assets/icons/loader.svg"
                    alt="Spinner"
                    width={24}
                    height={24}
                    className="animate-spin"
                  />
                )}
              </Button>
            </DialogFooter>
          )}
        </DialogHeader>
      </DialogContent>
    );
  };

  return (
    <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
      <DropdownMenu open={isDropdownOpen} onOpenChange={setIsDropdownOpen}>
        <DropdownMenuTrigger className="shad-no-focus">
          <Image
            src="/assets/icons/dots.svg"
            alt="dots"
            width={34}
            height={34}
          />
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuLabel className="max-w-[200px] truncate">
            {file.name}
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          {actionsDropdownItems.map((item) => (
            <DropdownMenuItem
              key={item.value}
              className="shad-dropdown-item"
              onClick={() => {
                setAction(item);
                setIsDropdownOpen(false);
                if (
                  ["rename", "share", "delete", "details"].includes(item.value)
                ) {
                  setIsModalOpen(true);
                }
              }}
            >
              {item.value === "download" ? (
                <Link
                  href={constructDownloadUrl(file.bucketFileId)}
                  download={file.name}
                  className="flex items-center gap-2"
                >
                  <Image
                    src={item.icon}
                    alt={item.label}
                    width={30}
                    height={30}
                  />
                  {item.label}
                </Link>
              ) : (
                <div className="flex items-center gap-2">
                  <Image
                    src={item.icon}
                    alt={item.label}
                    width={30}
                    height={30}
                  />
                  {item.label}
                </div>
              )}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
      {renderDialogContent()}
    </Dialog>
  );
};

export default ActionDropdown;
