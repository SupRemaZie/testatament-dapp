"use client";

import { useState } from "react";
import { Button} from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function UploadFile() {
  const [file, setFile] = useState<File>();
  const [url, setUrl] = useState("");
  const [uploading, setUploading] = useState(false);

  const uploadFile = async () => {
    try {
      if (!file) {
        alert("No file selected");
        return;
      }

      setUploading(true);
      const data = new FormData();
      data.set("file", file);
      const uploadRequest = await fetch("/api/upload", {
        method: "POST",
        body: data,
      });
      const ipfsUrl = await uploadRequest.json();
      setUrl(ipfsUrl);
      setUploading(false);
    } catch (e) {
      console.log(e);
      setUploading(false);
      alert("Trouble uploading file");
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFile(e.target?.files?.[0]);
  };

  return (
      <main className="w-full min-h-screen m-auto flex flex-col justify-center items-center space-y-6 p-4">
        <h1 className="text-xl font-semibold text-center">Upload a file to IPFS</h1>

        {/* Input field */}
        <Input
            type="file"
            onChange={handleChange}
            className="w-full max-w-xs mb-4"
        />

        {/* Upload button */}
        <Button
            variant="default"
            disabled={uploading}
            onClick={uploadFile}
            className="w-full max-w-xs"
        >
          {uploading ? (
              <>

                Uploading...
              </>
          ) : (
              "Upload"
          )}
        </Button>

        {/* Display the uploaded file URL */}
        {url && (
            <div className="w-full max-w-xs text-center">
              <h2 className="text-lg font-semibold mb-2">Uploaded File</h2>
              <img src={url} alt="Uploaded content from IPFS" className="max-w-full rounded-lg" />
              <p className="mt-2 text-sm text-gray-500">View the file on IPFS</p>
              <a
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 underline"
              >
                Open in Pinata Gateway
              </a>
            </div>
        )}
      </main>
  );
}