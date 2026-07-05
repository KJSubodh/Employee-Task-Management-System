import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import api from '../../services/api';
import { toast } from 'react-toastify';
import { 
  FaFileExcel, 
  FaFileCsv, 
  FaFilePdf,
  FaDownload, 
  FaChartBar,
  FaUsers,
  FaCheckCircle,
  FaClock,
  FaExclamationTriangle,
  FaFileAlt,
  FaEye,
  FaExternalLinkAlt
} from 'react-icons/fa';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';

const ReportGenerator = () => {
  const { user } = useSelector((state) => state.auth);
  const [reportType, setReportType] = useState('completed');
  const [format, setFormat] = useState('json');
  const [isLoading, setIsLoading] = useState(false);
  const [reportData, setReportData] = useState(null);
  const [generatedFileUrl, setGeneratedFileUrl] = useState(null);
  const [generatedFileType, setGeneratedFileType] = useState(null);
  const [fileBlob, setFileBlob] = useState(null);

  const reportTypes = [
    { 
      value: 'completed', 
      label: 'Completed Tasks', 
      icon: FaCheckCircle, 
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
      description: 'View all completed tasks'
    },
    { 
      value: 'pending', 
      label: 'Pending Tasks', 
      icon: FaClock, 
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50',
      borderColor: 'border-yellow-200',
      description: 'View all pending and in-progress tasks'
    },
    ...(user?.role === 'admin' ? [{ 
      value: 'employee-wise', 
      label: 'Employee-wise', 
      icon: FaUsers, 
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      borderColor: 'border-purple-200',
      description: 'View task distribution by employee'
    }] : [])
  ];

  const formatOptions = [
    { value: 'json', label: 'JSON', icon: FaFileAlt, color: 'text-blue-600' },
    { value: 'excel', label: 'Excel', icon: FaFileExcel, color: 'text-green-600' },
    { value: 'csv', label: 'CSV', icon: FaFileCsv, color: 'text-cyan-600' },
    { value: 'pdf', label: 'PDF', icon: FaFilePdf, color: 'text-red-600' }
  ];

  const generateReport = async () => {
    setIsLoading(true);
    setGeneratedFileUrl(null);
    setGeneratedFileType(null);
    setFileBlob(null);
    
    try {
      if (format === 'pdf') {
        const response = await api.get(`/reports?type=${reportType}&format=json`);
        const data = response.data;
        
        if (!data.data || data.data.length === 0) {
          toast.warning('No data available for this report');
          setIsLoading(false);
          return;
        }
        
        const pdfBlob = await generatePDFBlob(data.data, reportType);
        const url = URL.createObjectURL(pdfBlob);
        setGeneratedFileUrl(url);
        setGeneratedFileType('pdf');
        setFileBlob(pdfBlob);
        toast.success('PDF report generated successfully!');
      } else if (format === 'excel' || format === 'csv') {
        const response = await api.get(`/reports?type=${reportType}&format=${format}`, {
          responseType: 'blob'
        });
        
        const blob = new Blob([response.data]);
        const url = URL.createObjectURL(blob);
        setGeneratedFileUrl(url);
        setGeneratedFileType(format);
        setFileBlob(blob);
        toast.success(`${format.toUpperCase()} report generated successfully!`);
      } else {
        // JSON
        const response = await api.get(`/reports?type=${reportType}&format=${format}`);
        setReportData(response.data);
        toast.success('Report generated successfully!');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to generate report');
    } finally {
      setIsLoading(false);
    }
  };

  const generatePDFBlob = (data, type) => {
    return new Promise((resolve) => {
      const doc = new jsPDF('landscape', 'mm', 'a4');
      const pageWidth = doc.internal.pageSize.getWidth();
      
      doc.setFillColor(10, 10, 10);
      doc.rect(0, 0, pageWidth, 25, 'F');
      
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(18);
      doc.setFont('helvetica', 'bold');
      doc.text('TaskFlow Report', 14, 16);
      
      doc.setTextColor(200, 200, 200);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text(`Report Type: ${type.replace('-', ' ').toUpperCase()}`, 14, 22);
      doc.text(`Generated: ${new Date().toLocaleString()}`, pageWidth - 60, 16);
      
      doc.setDrawColor(200, 200, 200);
      doc.line(14, 28, pageWidth - 14, 28);
      
      const headers = Object.keys(data[0]);
      const rows = data.map(item => headers.map(key => item[key] || 'N/A'));
      
      autoTable(doc, {
        head: [headers],
        body: rows,
        startY: 32,
        theme: 'striped',
        headStyles: {
          fillColor: [40, 40, 40],
          textColor: [255, 255, 255],
          fontStyle: 'bold',
          halign: 'center'
        },
        bodyStyles: {
          fontSize: 8,
          cellPadding: 3
        },
        alternateRowStyles: {
          fillColor: [245, 245, 245]
        },
        styles: {
          overflow: 'linebreak',
          cellWidth: 'wrap'
        },
        columnStyles: {
          0: { cellWidth: 'auto' },
          1: { cellWidth: 'auto' }
        },
        didDrawPage: function(data) {
          const pageHeight = doc.internal.pageSize.getHeight();
          doc.setFontSize(8);
          doc.setTextColor(150, 150, 150);
          doc.text(
            `Page ${data.pageNumber} - TaskFlow Report`,
            pageWidth / 2,
            pageHeight - 10,
            { align: 'center' }
          );
        }
      });
      
      const finalY = doc.lastAutoTable.finalY + 10;
      if (finalY < doc.internal.pageSize.getHeight() - 20) {
        doc.setFontSize(10);
        doc.setTextColor(50, 50, 50);
        doc.setFont('helvetica', 'bold');
        doc.text(`Total Records: ${data.length}`, 14, finalY);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8);
        doc.setTextColor(150, 150, 150);
        doc.text('Generated by TaskFlow', 14, finalY + 6);
      }
      
      const pdfBlob = doc.output('blob');
      resolve(pdfBlob);
    });
  };

  const downloadFile = () => {
    if (!generatedFileUrl) return;
    
    const link = document.createElement('a');
    link.href = generatedFileUrl;
    const ext = format === 'excel' ? 'xlsx' : format;
    link.setAttribute('download', `${reportType}_tasks_${new Date().toISOString().split('T')[0]}.${ext}`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    toast.success('File downloaded successfully!');
  };

  const viewInNewTab = () => {
    if (!generatedFileUrl) return;
    
    // For PDF - open directly
    if (format === 'pdf') {
      window.open(generatedFileUrl, '_blank');
      return;
    }
    
    // For Excel and CSV - create a data URI and use Google Docs Viewer
    if (format === 'excel' || format === 'csv') {
      // Option 1: Use Google Docs Viewer with proper encoding
      // You need to host the file somewhere or use a data URI
      // Since we can't host it, we'll use an alternative approach
      
      // Option 2: For Excel files, use Microsoft Office Online Viewer
      const ext = format === 'excel' ? 'xlsx' : 'csv';
      const fileName = `${reportType}_tasks_${new Date().toISOString().split('T')[0]}.${ext}`;
      
      // Convert blob to base64 data URI
      const reader = new FileReader();
      reader.onload = function(e) {
        const base64 = e.target.result;
        // For Excel, we can use the Microsoft Office Online viewer
        // This works for .xlsx and .xls files
        if (format === 'excel') {
          // FIXED: this used to just write a static placeholder card
          // ("Click download to view the file on your device") regardless
          // of what was in the file - it never actually read the
          // spreadsheet. A blob: URL only exists in this tab's memory, so
          // external viewers (Google Docs Viewer, Office Online) can't
          // fetch it - there's no public URL to hand them. Instead, parse
          // the xlsx binary client-side with SheetJS and render it as a
          // real HTML table, the same way the CSV branch below already
          // does with parsed text.
          const base64Data = base64.split(',')[1];
          const workbook = XLSX.read(base64Data, { type: 'base64' });
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          const tableHtml = XLSX.utils.sheet_to_html(worksheet, { editable: false });

          const newWindow = window.open();
          if (newWindow) {
            newWindow.document.write(`
              <html>
                <head>
                  <title>Excel Preview</title>
                  <style>
                    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; margin: 20px; background: #f5f5f5; }
                    .container { max-width: 1200px; margin: 0 auto; background: white; border-radius: 8px; padding: 20px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); overflow-x: auto; }
                    table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                    th, td { padding: 8px 10px; border: 1px solid #eee; text-align: left; white-space: nowrap; }
                    tr:first-child td { background: #333; color: white; font-weight: 600; }
                    tr:hover { background: #f9f9f9; }
                    .header { display: flex; justify-content: space-between; align-items: center; }
                    .download-btn { padding: 8px 20px; background: #333; color: white; border: none; border-radius: 4px; cursor: pointer; }
                  </style>
                </head>
                <body>
                  <div class="container">
                    <div class="header">
                      <h2>📊 ${reportType.replace('-', ' ').toUpperCase()} Report</h2>
                      <button class="download-btn" onclick="window.close()">Close</button>
                    </div>
                    <p style="color:#666;font-size:14px;">File: ${fileName}</p>
                    ${tableHtml}
                    <p style="margin-top:20px;font-size:12px;color:#999;">Generated: ${new Date().toLocaleString()}</p>
                  </div>
                </body>
              </html>
            `);
          }
        } else {
          // For CSV, show a preview with table
          const newWindow = window.open();
          if (newWindow) {
            // Parse CSV data
            const text = atob(base64.split(',')[1]);
            const lines = text.split('\n');
            const headers = lines[0]?.split(',') || [];
            const rows = lines.slice(1).filter(line => line.trim()).map(line => line.split(','));
            
            newWindow.document.write(`
              <html>
                <head>
                  <title>CSV Preview</title>
                  <style>
                    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; margin: 20px; background: #f5f5f5; }
                    .container { max-width: 1200px; margin: 0 auto; background: white; border-radius: 8px; padding: 20px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
                    table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                    th { background: #333; color: white; padding: 10px; text-align: left; }
                    td { padding: 8px 10px; border-bottom: 1px solid #eee; }
                    tr:hover { background: #f9f9f9; }
                    .header { display: flex; justify-content: space-between; align-items: center; }
                    .download-btn { padding: 8px 20px; background: #333; color: white; border: none; border-radius: 4px; cursor: pointer; }
                  </style>
                </head>
                <body>
                  <div class="container">
                    <div class="header">
                      <h2>📊 ${reportType.replace('-', ' ').toUpperCase()} Report</h2>
                      <button class="download-btn" onclick="window.close()">Close</button>
                    </div>
                    <p style="color:#666;font-size:14px;">Total Records: ${rows.length}</p>
                    <table>
                      <thead>
                        <tr>${headers.map(h => `<th>${h.trim()}</th>`).join('')}</tr>
                      </thead>
                      <tbody>
                        ${rows.map(row => `<tr>${row.map(cell => `<td>${cell.trim()}</td>`).join('')}</tr>`).join('')}
                      </tbody>
                    </table>
                    <p style="margin-top:20px;font-size:12px;color:#999;">Generated: ${new Date().toLocaleString()}</p>
                  </div>
                </body>
              </html>
            `);
          }
        }
      };
      
      // Read the blob as data URL
      reader.readAsDataURL(fileBlob);
      return;
    }
  };

  const renderReportData = () => {
    if (!reportData || !reportData.data) return null;
    
    const data = reportData.data;
    if (data.length === 0) {
      return (
        <div className="text-center py-16">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FaChartBar className="text-3xl text-gray-400" />
          </div>
          <p className="text-gray-500 font-medium">No data available</p>
          <p className="text-gray-400 text-sm mt-1">Try generating a different report</p>
        </div>
      );
    }

    const headers = Object.keys(data[0]);

    return (
      <div className="overflow-x-auto mt-4">
        <div className="inline-block min-w-full align-middle">
          <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 rounded-lg">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  {headers.map((header) => (
                    <th
                      key={header}
                      className="px-4 py-3.5 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider whitespace-nowrap"
                    >
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {data.slice(0, 20).map((row, index) => (
                  <tr key={index} className="hover:bg-gray-50 transition-colors">
                    {headers.map((header) => (
                      <td key={header} className="px-4 py-3 text-sm text-gray-900 whitespace-nowrap">
                        {row[header] || '—'}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        {data.length > 20 && (
          <p className="text-sm text-gray-400 mt-3 text-center">
            Showing first 20 of {data.length} records
          </p>
        )}
      </div>
    );
  };

  const getSelectedReport = () => {
    return reportTypes.find(r => r.value === reportType) || reportTypes[0];
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-3">
          <div className="p-2.5 bg-black rounded-xl">
            <FaChartBar className="w-5 h-5 text-white" />
          </div>
          Reports
        </h1>
        <p className="text-gray-500 text-sm mt-1.5 ml-1">
          Generate and export detailed task reports in multiple formats
        </p>
      </div>

      {/* Report Type Selection Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {reportTypes.map((type) => {
          const Icon = type.icon;
          const isSelected = reportType === type.value;
          return (
            <button
              key={type.value}
              onClick={() => {
                setReportType(type.value);
                setReportData(null);
                setGeneratedFileUrl(null);
                setGeneratedFileType(null);
                setFileBlob(null);
              }}
              className={`p-5 rounded-xl border-2 transition-all duration-200 text-left ${
                isSelected
                  ? `${type.bgColor} ${type.borderColor} shadow-sm ring-2 ring-black/5`
                  : 'bg-white border-gray-200 hover:border-gray-300 hover:shadow-sm'
              }`}
            >
              <div className="flex items-start gap-3">
                <div className={`p-2.5 rounded-lg ${isSelected ? type.bgColor : 'bg-gray-50'}`}>
                  <Icon className={`w-5 h-5 ${isSelected ? type.color : 'text-gray-500'}`} />
                </div>
                <div>
                  <h3 className={`font-semibold ${isSelected ? 'text-gray-900' : 'text-gray-700'}`}>
                    {type.label}
                  </h3>
                  <p className="text-sm text-gray-500 mt-0.5">{type.description}</p>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Report Generator Controls */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Export Format
            </label>
            <div className="flex flex-wrap gap-2">
              {formatOptions.map((opt) => {
                const Icon = opt.icon;
                const isSelected = format === opt.value;
                return (
                  <button
                    key={opt.value}
                    onClick={() => {
                      setFormat(opt.value);
                      setGeneratedFileUrl(null);
                      setGeneratedFileType(null);
                      setFileBlob(null);
                    }}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-lg border-2 transition-all duration-200 text-sm font-medium ${
                      isSelected
                        ? `${opt.color} border-current bg-opacity-10 bg-gray-50`
                        : 'text-gray-600 border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {opt.label}
                  </button>
                );
              })}
            </div>
          </div>
          <div className="flex items-end gap-2">
            <button
              onClick={generateReport}
              disabled={isLoading}
              className="btn-primary flex items-center justify-center gap-2 px-6 py-2.5 min-w-[140px]"
            >
              {isLoading ? (
                <>
                  <span className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></span>
                  Generating...
                </>
              ) : (
                <>
                  <FaDownload className="w-4 h-4" />
                  <span>Generate</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* File Actions - Show when file is generated */}
        {generatedFileUrl && (
          <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg bg-white shadow-sm ${
                format === 'excel' ? 'text-green-600' :
                format === 'pdf' ? 'text-red-600' :
                format === 'csv' ? 'text-cyan-600' : 'text-blue-600'
              }`}>
                {format === 'excel' && <FaFileExcel className="w-5 h-5" />}
                {format === 'pdf' && <FaFilePdf className="w-5 h-5" />}
                {format === 'csv' && <FaFileCsv className="w-5 h-5" />}
                {format === 'json' && <FaFileAlt className="w-5 h-5" />}
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">
                  {reportType.replace('-', ' ').toUpperCase()} Report
                </p>
                <p className="text-xs text-gray-500">
                  {format.toUpperCase()} • {new Date().toLocaleTimeString()}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={viewInNewTab}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-gray-300 transition-colors"
              >
                <FaEye className="w-4 h-4" />
                View
                <FaExternalLinkAlt className="w-3 h-3 ml-0.5" />
              </button>
              <button
                onClick={downloadFile}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-black hover:bg-gray-800 rounded-lg transition-colors"
              >
                <FaDownload className="w-4 h-4" />
                Download
              </button>
            </div>
          </div>
        )}

        {/* Quick Export Buttons */}
        <div className="mt-6 pt-4 border-t border-gray-100">
          <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-3">
            Quick Export
          </p>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => {
                setReportType('completed');
                setFormat('excel');
                setTimeout(() => generateReport(), 150);
              }}
              className="flex items-center gap-2 px-4 py-2 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors text-sm font-medium border border-green-200"
            >
              <FaFileExcel className="w-4 h-4" />
              Completed → Excel
            </button>
            <button
              onClick={() => {
                setReportType('pending');
                setFormat('pdf');
                setTimeout(() => generateReport(), 150);
              }}
              className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition-colors text-sm font-medium border border-red-200"
            >
              <FaFilePdf className="w-4 h-4" />
              Pending → PDF
            </button>
            <button
              onClick={() => {
                setReportType('employee-wise');
                setFormat('excel');
                setTimeout(() => generateReport(), 150);
              }}
              className="flex items-center gap-2 px-4 py-2 bg-purple-50 text-purple-700 rounded-lg hover:bg-purple-100 transition-colors text-sm font-medium border border-purple-200"
            >
              <FaFileExcel className="w-4 h-4" />
              Employee-wise → Excel
            </button>
            <button
              onClick={() => {
                setReportType('completed');
                setFormat('csv');
                setTimeout(() => generateReport(), 150);
              }}
              className="flex items-center gap-2 px-4 py-2 bg-cyan-50 text-cyan-700 rounded-lg hover:bg-cyan-100 transition-colors text-sm font-medium border border-cyan-200"
            >
              <FaFileCsv className="w-4 h-4" />
              Completed → CSV
            </button>
          </div>
        </div>
      </div>

      {/* Report Preview */}
      {reportData && format === 'json' && (
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm animate-fadeIn">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                {(() => {
                  const selected = getSelectedReport();
                  const Icon = selected.icon;
                  return <Icon className={`w-5 h-5 ${selected.color}`} />;
                })()}
                Report Preview
              </h2>
              <p className="text-xs text-gray-400">
                Generated on: {new Date(reportData.generatedAt).toLocaleString()}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => {
                  setFormat('excel');
                  setTimeout(() => generateReport(), 150);
                }}
                className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-lg transition-colors"
              >
                <FaFileExcel className="w-4 h-4" />
                Excel
              </button>
              <button
                onClick={() => {
                  setFormat('pdf');
                  setTimeout(() => generateReport(), 150);
                }}
                className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
              >
                <FaFilePdf className="w-4 h-4" />
                PDF
              </button>
              <button
                onClick={() => {
                  setFormat('csv');
                  setTimeout(() => generateReport(), 150);
                }}
                className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-white bg-gray-700 hover:bg-gray-800 rounded-lg transition-colors"
              >
                <FaFileCsv className="w-4 h-4" />
                CSV
              </button>
            </div>
          </div>
          {renderReportData()}
        </div>
      )}
    </div>
  );
};

export default ReportGenerator;