import React, { useEffect, useState } from "react";
import { getAllDocumentsAPI, uploadDocumentAPI, deleteDocumentAPI } from "../services/apiDoc.services.js";
import { Download, Trash2 } from "lucide-react";

export default function DocumentTab() {
  const [documents, setDocuments] = useState<any[]>([]);
  const [docForm, setDocForm] = useState({ title: "", filter: "Safety", file: null });

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    try {
      const res = await getAllDocumentsAPI();
      if (res.data.success) setDocuments(res.data.documents);
    } catch (err) {
      console.error(err);
      alert("Failed to fetch documents");
    }
  };

  const handleDocUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!docForm.title || !docForm.file) return alert("Please provide title and file");

    const formData = new FormData();
    formData.append("title", docForm.title);
    formData.append("filter", docForm.filter);
    formData.append("file", docForm.file);

    try {
      const res = await uploadDocumentAPI(formData);
      if (res.data.success) {
        setDocuments(prev => [res.data.document, ...prev]);
        setDocForm({ title: "", filter: "Safety", file: null });
      }
    } catch (err) {
      console.error(err);
      alert("Upload failed");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this document?")) return;
    try {
      const res = await deleteDocumentAPI(id);
      if (res.data.success) {
        setDocuments(prev => prev.filter(d => d._id !== id));
      } else {
        alert("Failed to delete document");
      }
    } catch (err) {
      console.error(err);
      alert("Failed to delete document");
    }
  };

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-semibold text-blue-700">Document Repository</h2>
        <p className="text-sm text-gray-500">Upload, download, and manage documents</p>
      </div>

      {/* Upload Form */}
      <form onSubmit={handleDocUpload} className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6 items-end">
        <div>
          <label className="block text-sm font-medium mb-1">Title</label>
          <input
            className="border rounded px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Document title"
            value={docForm.title}
            onChange={(e) => setDocForm({ ...docForm, title: e.target.value })}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Filter / Category</label>
          <select
            className="border rounded px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={docForm.filter}
            onChange={(e) => setDocForm({ ...docForm, filter: e.target.value })}
          >
            <option>Safety</option>
            <option>Maintenance</option>
            <option>Training</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Select File</label>
          <input
            type="file"
            className="border rounded px-3 py-2 w-full"
            onChange={(e) => setDocForm({ ...docForm, file: e.target.files[0] })}
          />
        </div>
        <div className="flex justify-start md:justify-end">
          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition flex items-center gap-2"
          >
            Upload
          </button>
        </div>
      </form>

      {/* Documents Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full border border-gray-200 divide-y divide-gray-200 rounded">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">Sr.</th>
              <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">Title</th>
              <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">Filter</th>
              <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">File</th>
              <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">Uploaded At</th>
              <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {documents.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-6 text-center text-red-500">
                  No documents uploaded yet.
                </td>
              </tr>
            )}
            {documents.map((doc, index) => (
              <tr key={doc._id} className="hover:bg-gray-50">
                <td className="px-4 py-2">{index + 1}</td>
                <td className="px-4 py-2">{doc.title}</td>
                <td className="px-4 py-2">{doc.filter}</td>
                <td className="px-4 py-2">{doc.originalName}</td>
                <td className="px-4 py-2">{new Date(doc.uploadedAt).toLocaleString()}</td>
                <td className="px-4 py-2 flex gap-2">
                  <a
                    href={`/uploads/${doc.fileName}`}
                    download={doc.originalName}
                    className="px-3 py-1 border rounded text-blue-600 hover:bg-blue-50 flex items-center gap-1"
                  >
                    <Download size={16}/> Download
                  </a>
                  <button
                    onClick={() => handleDelete(doc._id)}
                    className="px-3 py-1 border rounded text-red-600 hover:bg-red-50 flex items-center gap-1"
                  >
                    <Trash2 size={16}/> Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
