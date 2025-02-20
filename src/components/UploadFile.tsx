import { useState } from 'react';

export default function UploadFile() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [ipfsHash, setIpfsHash] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      setFile(event.target.files[0]);
      setErrorMessage(null); // Reset error message when a new file is selected
    }
  };

  const handleUpload = async () => {
    if (!file) return alert('Please select a file to upload.');

    setLoading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();

      if (res.ok) {
        setIpfsHash(data.ipfsHash);
        setErrorMessage(null); // Reset any error message if upload is successful
      } else {
        setErrorMessage(data.message || 'Error uploading to Pinata.');
      }
    } catch (error) {
      setErrorMessage('Error uploading the file.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto p-6 bg-white shadow-lg rounded-lg">
      <h1 className="text-2xl font-bold text-center mb-4">Upload File to IPFS</h1>

      <div className="mb-4">
        <input
          type="file"
          onChange={handleFileChange}
          className="w-full p-2 border rounded-lg"
        />
      </div>

      <button
        onClick={handleUpload}
        disabled={loading || !file}
        className="w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
      >
        {loading ? 'Uploading...' : 'Upload'}
      </button>

      {errorMessage && (
        <div className="mt-4 text-red-600">
          <p>{errorMessage}</p>
        </div>
      )}

      {ipfsHash && (
        <div className="mt-6 text-center">
          <h3 className="text-lg font-semibold">File Uploaded to IPFS</h3>
          <p className="mt-2">IPFS Hash: {ipfsHash}</p>
          <a
            href={`https://gateway.pinata.cloud/ipfs/${ipfsHash}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-500 hover:text-blue-700 mt-2 block"
          >
            View Document
          </a>
        </div>
      )}
    </div>
  );
}
