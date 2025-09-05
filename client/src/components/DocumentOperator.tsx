import React, { useEffect, useState } from "react";
import { getAllDocumentsAPI } from "../services/apiDoc.services.js";
import { Download } from "lucide-react";

export default function OperatorDocumentTab() {
  const [documents, setDocuments] = useState<any[]>([]);

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

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-semibold text-blue-700">Document Repository</h2>
        <p className="text-sm text-gray-500">Download documents as needed</p>
      </div>

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
              <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">Download</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {documents.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-6 text-center text-red-500">
                  No documents available.
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
                <td className="px-4 py-2">
                  <a
                    href={`/uploads/${doc.fileName}`}
                    download={doc.originalName}
                    className="px-3 py-1 border rounded text-blue-600 hover:bg-blue-50 flex items-center gap-1"
                  >
                    <Download size={16} /> Download
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
