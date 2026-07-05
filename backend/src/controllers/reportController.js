const ReportService = require('../services/reportService');

const generateReport = async (req, res) => {
  try {
    const { type, format = 'json' } = req.query;
    
    if (!type) {
      return res.status(400).json({ message: 'Report type is required' });
    }

    const result = await ReportService.generateReport(type, format);

    // For Excel
    if (format === 'excel' && result.workbook) {
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', `attachment; filename=${type}_tasks_${Date.now()}.xlsx`);
      await result.workbook.xlsx.write(res);
      return res.end();
    }

    // For CSV
    if (format === 'csv' && result.pipe) {
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename=${type}_tasks_${Date.now()}.csv`);
      result.pipe(res);
      return;
    }

    // For JSON
    res.json({
      type,
      format,
      data: result,
      generatedAt: new Date().toISOString()
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

module.exports = { generateReport };