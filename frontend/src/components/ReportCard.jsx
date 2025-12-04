import React from 'react';

const ReportCard = ({ student, exams, onClose, hidePrintButton = false, classFilter = '', yearFilter = '' }) => {
  const handlePrint = () => {
    window.print();
  };

  // Calculate overall results from all exams
  const calculateOverallResults = () => {
    if (!exams || exams.length === 0) return { totalObtained: 0, totalMarks: 0, percentage: 0, status: 'N/A' };
    
    let totalObtained = 0;
    let totalMarks = 0;
    
    exams.forEach(exam => {
      exam.subjects?.forEach(subject => {
        totalObtained += subject.obtainedMarks || 0;
        totalMarks += subject.totalMarks || 0;
      });
    });
    
    const percentage = totalMarks > 0 ? ((totalObtained / totalMarks) * 100).toFixed(2) : 0;
    const status = percentage >= 33 ? 'PASS' : 'FAIL';
    
    return { totalObtained, totalMarks, percentage, status };
  };

  const overallResults = calculateOverallResults();

  return (
    <div className="report-card-container">
      {/* Print Styles */}
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .report-card-container, .report-card-container * {
            visibility: visible;
          }
          .report-card-container {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
          .no-print {
            display: none !important;
          }
          .page-break {
            page-break-after: always;
          }
          @page {
            size: A4;
            margin: 0;
          }
          body {
            margin: 0;
            padding: 0;
          }
        }
        
        .report-card {
          max-width: 210mm;
          margin: 0 auto;
          padding: 20mm;
          background: white;
          font-family: 'Times New Roman', serif;
        }
        
        .report-header {
          text-align: center;
          border-bottom: 3px double #000;
          padding-bottom: 15px;
          margin-bottom: 20px;
        }
        
        .ngo-name {
          font-size: 28px;
          font-weight: bold;
          color: #1a365d;
          margin-bottom: 5px;
        }
        
        .report-title {
          font-size: 22px;
          font-weight: bold;
          margin: 10px 0;
          text-decoration: underline;
        }
        
        .student-info {
          margin: 20px 0;
          line-height: 1.8;
        }
        
        .info-row {
          display: flex;
          margin-bottom: 8px;
        }
        
        .info-label {
          font-weight: bold;
          min-width: 150px;
        }
        
        .marks-table {
          width: 100%;
          border-collapse: collapse;
          margin: 20px 0;
        }
        
        .marks-table th,
        .marks-table td {
          border: 1px solid #000;
          padding: 10px;
          text-align: center;
        }
        
        .marks-table th {
          background-color: #f0f0f0;
          font-weight: bold;
        }
        
        .result-section {
          margin: 20px 0;
          padding: 15px;
          border: 2px solid #000;
          text-align: center;
        }
        
        .result-pass {
          color: #22c55e;
          font-weight: bold;
          font-size: 24px;
        }
        
        .result-fail {
          color: #ef4444;
          font-weight: bold;
          font-size: 24px;
        }
        
        .signature-section {
          margin-top: 40px;
          display: flex;
          justify-content: space-between;
        }
        
        .signature-box {
          width: 30%;
          text-align: center;
        }
        
        .signature-line {
          border-top: 1px solid #000;
          margin-top: 60px;
          padding-top: 5px;
        }
      `}</style>

      {/* Action Buttons - Hidden during print and in bulk mode */}
      {!hidePrintButton && (
        <>
          <div className="no-print mb-4 flex justify-center gap-3">
            <button
              onClick={handlePrint}
              className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium shadow-md flex items-center gap-2"
            >
              🖨️ Print / Save as PDF
            </button>
            <button
              onClick={onClose}
              className="px-6 py-3 bg-gray-600 text-white rounded-md hover:bg-gray-700 font-medium shadow-md flex items-center gap-2"
            >
              ✖ Close
            </button>
          </div>

          {/* Instructions - Hidden during print */}
          <div className="no-print mb-4 p-4 bg-blue-50 border border-blue-200 rounded-md">
            <p className="text-sm text-blue-800">
              <strong>📄 To save as PDF:</strong> Click "Print / Save as PDF" button above, then select "Save as PDF" as the printer destination in the print dialog.
            </p>
          </div>
        </>
      )}

      {/* Report Card */}
      <div className="report-card">
        {/* Header */}
        <div className="report-header">
          <div className="ngo-name">SPEAKINGHAND</div>
          <div style={{ fontSize: '14px', color: '#666' }}>
            An Initiative for Education and Empowerment
          </div>
          <div className="report-title">STUDENT REPORT CARD</div>
          <div style={{ fontSize: '14px', marginTop: '5px' }}>
            Academic Session: {yearFilter || new Date().getFullYear()}
          </div>
        </div>

        {/* Student Information */}
        <div className="student-info">
          <div className="info-row">
            <div className="info-label">Student Name:</div>
            <div>{student.fullName}</div>
          </div>
          <div className="info-row">
            <div className="info-label">Roll Number:</div>
            <div>{student.rollNo || 'N/A'}</div>
          </div>
          <div className="info-row">
            <div className="info-label">Class:</div>
            <div>{classFilter || student.className || 'N/A'}</div>
          </div>
          <div className="info-row">
            <div className="info-label">Phone Number:</div>
            <div>{student.phone || 'N/A'}</div>
          </div>
          <div className="info-row">
            <div className="info-label">Email:</div>
            <div>{student.email || 'N/A'}</div>
          </div>
          <div className="info-row">
            <div className="info-label">Father's Name:</div>
            <div>{student.fatherName || 'N/A'}</div>
          </div>
          <div className="info-row">
            <div className="info-label">Mother's Name:</div>
            <div>{student.motherName || 'N/A'}</div>
          </div>
          <div className="info-row">
            <div className="info-label">Address:</div>
            <div>{student.address || 'N/A'}</div>
          </div>
        </div>

        {/* Marks Table */}
        {(() => {
          // Group exams by type
          const mst1 = exams.find(e => e.examType === 'MST-1');
          const mst2 = exams.find(e => e.examType === 'MST-2');
          const mst3 = exams.find(e => e.examType === 'MST-3');
          const final = exams.find(e => e.examType === 'Final');
          
          // Get all unique subjects from all exams
          const allSubjects = [...new Set(
            exams.flatMap(e => e.subjects?.map(s => s.subjectName) || [])
          )];

          return (
            <table className="marks-table">
              <thead>
                <tr>
                  <th rowSpan="2" style={{ verticalAlign: 'middle' }}>S.No.</th>
                  <th rowSpan="2" style={{ verticalAlign: 'middle' }}>Subject</th>
                  <th colSpan="2">MST-1</th>
                  <th colSpan="2">MST-2</th>
                  <th colSpan="2">MST-3</th>
                  <th colSpan="2">Final</th>
                  <th rowSpan="2" style={{ verticalAlign: 'middle' }}>Total</th>
                  <th rowSpan="2" style={{ verticalAlign: 'middle' }}>%</th>
                </tr>
                <tr>
                  <th>Total</th>
                  <th>Obtained</th>
                  <th>Total</th>
                  <th>Obtained</th>
                  <th>Total</th>
                  <th>Obtained</th>
                  <th>Total</th>
                  <th>Obtained</th>
                </tr>
              </thead>
              <tbody>
                {allSubjects.length > 0 ? (
                  allSubjects.map((subject, idx) => {
                    const mst1Sub = mst1?.subjects?.find(s => s.subjectName === subject);
                    const mst2Sub = mst2?.subjects?.find(s => s.subjectName === subject);
                    const mst3Sub = mst3?.subjects?.find(s => s.subjectName === subject);
                    const finalSub = final?.subjects?.find(s => s.subjectName === subject);
                    
                    const totalMarks = (mst1Sub?.totalMarks || 0) + (mst2Sub?.totalMarks || 0) + 
                                      (mst3Sub?.totalMarks || 0) + (finalSub?.totalMarks || 0);
                    const obtainedMarks = (mst1Sub?.obtainedMarks || 0) + (mst2Sub?.obtainedMarks || 0) + 
                                         (mst3Sub?.obtainedMarks || 0) + (finalSub?.obtainedMarks || 0);
                    const percentage = totalMarks > 0 ? ((obtainedMarks / totalMarks) * 100).toFixed(1) : 0;
                    
                    return (
                      <tr key={idx}>
                        <td>{idx + 1}</td>
                        <td style={{ textAlign: 'left', fontWeight: '500' }}>{subject}</td>
                        <td>{mst1Sub?.totalMarks || '-'}</td>
                        <td>{mst1Sub?.obtainedMarks || '-'}</td>
                        <td>{mst2Sub?.totalMarks || '-'}</td>
                        <td>{mst2Sub?.obtainedMarks || '-'}</td>
                        <td>{mst3Sub?.totalMarks || '-'}</td>
                        <td>{mst3Sub?.obtainedMarks || '-'}</td>
                        <td>{finalSub?.totalMarks || '-'}</td>
                        <td>{finalSub?.obtainedMarks || '-'}</td>
                        <td style={{ fontWeight: 'bold' }}>{obtainedMarks}/{totalMarks}</td>
                        <td style={{ fontWeight: 'bold' }}>{percentage}%</td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="12" style={{ textAlign: 'center', padding: '20px' }}>
                      No examination records found
                    </td>
                  </tr>
                )}
                {allSubjects.length > 0 && (
                  <tr style={{ fontWeight: 'bold', backgroundColor: '#f0f0f0' }}>
                    <td colSpan="2">GRAND TOTAL</td>
                    <td colSpan="2">{mst1?.subjects?.reduce((sum, s) => sum + s.obtainedMarks, 0) || '-'}/{mst1?.subjects?.reduce((sum, s) => sum + s.totalMarks, 0) || '-'}</td>
                    <td colSpan="2">{mst2?.subjects?.reduce((sum, s) => sum + s.obtainedMarks, 0) || '-'}/{mst2?.subjects?.reduce((sum, s) => sum + s.totalMarks, 0) || '-'}</td>
                    <td colSpan="2">{mst3?.subjects?.reduce((sum, s) => sum + s.obtainedMarks, 0) || '-'}/{mst3?.subjects?.reduce((sum, s) => sum + s.totalMarks, 0) || '-'}</td>
                    <td colSpan="2">{final?.subjects?.reduce((sum, s) => sum + s.obtainedMarks, 0) || '-'}/{final?.subjects?.reduce((sum, s) => sum + s.totalMarks, 0) || '-'}</td>
                    <td>{overallResults.totalObtained}/{overallResults.totalMarks}</td>
                    <td>{overallResults.percentage}%</td>
                  </tr>
                )}
              </tbody>
            </table>
          );
        })()}

        {/* Result */}
        <div className="result-section">
          <div>Overall Percentage: <strong>{overallResults.percentage}%</strong></div>
          <div className={overallResults.status === 'PASS' ? 'result-pass' : 'result-fail'}>
            {overallResults.status}
          </div>
          <div style={{ fontSize: '12px', marginTop: '10px', color: '#666' }}>
            {overallResults.status === 'PASS' 
              ? 'Congratulations! The student has successfully passed.' 
              : overallResults.status === 'FAIL'
              ? 'The student needs improvement. Please work harder.'
              : 'No exam records available.'}
          </div>
        </div>

        {/* Signature Section */}
        <div className="signature-section">
          <div className="signature-box">
            <div className="signature-line">Parent's Signature</div>
            <div style={{ fontSize: '12px', marginTop: '5px', color: '#666' }}>Date: _________</div>
          </div>
          <div className="signature-box">
            <div className="signature-line">Class Teacher's Signature</div>
            <div style={{ fontSize: '12px', marginTop: '5px', color: '#666' }}>Date: _________</div>
          </div>
          <div className="signature-box">
            <div className="signature-line">Principal's Signature</div>
            <div style={{ fontSize: '12px', marginTop: '5px', color: '#666' }}>Date: _________</div>
          </div>
        </div>

        {/* Footer */}
        <div style={{ marginTop: '30px', textAlign: 'center', fontSize: '12px', color: '#666', borderTop: '1px solid #ccc', paddingTop: '10px' }}>
          <p>This is a computer generated report card. For any queries, please contact the school office.</p>
          <p>© {new Date().getFullYear()} SpeakingHand - Empowering Education for All</p>
        </div>
      </div>
    </div>
  );
};

export default ReportCard;
