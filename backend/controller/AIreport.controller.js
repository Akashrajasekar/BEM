import Expense from "../models/expense.model.js";
import User from "../models/user.model.js";
import Department from "../models/departments.model.js";
import Report from "../models/report.model.js";
import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";
import PDFDocument from "pdfkit";
import fs from "fs";
import path from "path";
import { v4 as uuidv4 } from "uuid";

dotenv.config();
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);

// Generate comprehensive AI report for all user expenses
export const generateUserExpenseReport = async (req, res) => {
  try {
    const userId = req.user.id;
    const { dateFrom, dateTo, categories, departments, title, reportPeriod } = req.query;
    
    // Generate a unique report ID
    const reportId = `REP-${uuidv4().substring(0, 8)}-${Date.now().toString().substring(9)}`;
    
    // Determine report period dates if not explicitly provided
    let periodFrom = dateFrom ? new Date(dateFrom) : null;
    let periodTo = dateTo ? new Date(dateTo) : null;
    let periodTitle = title;

    // Auto-generate date ranges based on reportPeriod if dates not provided
        if (reportPeriod && (!dateFrom || !dateTo)) {
          const currentDate = new Date();
          
          if (reportPeriod === 'weekly') {
            // Set to beginning of current week (Sunday)
            periodFrom = new Date(currentDate);
            periodFrom.setDate(currentDate.getDate() - currentDate.getDay());
            periodFrom.setHours(0, 0, 0, 0);
            
            // Set to end of week (Saturday)
            periodTo = new Date(periodFrom);
            periodTo.setDate(periodFrom.getDate() + 6);
            periodTo.setHours(23, 59, 59, 999);
            
            // Set default title if not provided
            if (!periodTitle) {
              const weekStart = periodFrom.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
              const weekEnd = periodTo.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
              periodTitle = `Weekly Expense Report (${weekStart} - ${weekEnd})`;
            }
          } 
          else if (reportPeriod === 'monthly') {
            // Set to first day of current month
            periodFrom = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
            periodFrom.setHours(0, 0, 0, 0);
            
            // Set to last day of current month
            periodTo = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
            periodTo.setHours(23, 59, 59, 999);
            
            // Set default title if not provided
            if (!periodTitle) {
              const monthYear = periodFrom.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
              periodTitle = `Monthly Expense Report (${monthYear})`;
            }
          } 
          else if (reportPeriod === 'yearly') {
            // Set to first day of current year
            periodFrom = new Date(currentDate.getFullYear(), 0, 1);
            periodFrom.setHours(0, 0, 0, 0);
            
            // Set to last day of current year
            periodTo = new Date(currentDate.getFullYear(), 11, 31);
            periodTo.setHours(23, 59, 59, 999);
            
            // Set default title if not provided
            if (!periodTitle) {
              const year = periodFrom.getFullYear();
              periodTitle = `Annual Expense Report (${year})`;
            }
          }
        }

    // Create initial report record
    const newReport = new Report({
      userId,
      reportId,
      title: title || `Expense Analysis Report - ${new Date().toLocaleDateString()}`,
      dateRange: {
        from: periodFrom,
        to: periodTo
      },
      reportPeriod: reportPeriod || 'custom', // Store the report period type
      filters: {
        categories: categories ? categories.split(',') : [],
        departments: departments ? departments.split(',').map(d => mongoose.Types.ObjectId(d)) : [],
      },
      status: "GENERATING"
    });
    
    await newReport.save();
    
    // Build filter conditions for expenses
    const filter = { userId,
      approvalStatus: 'Approved' // Only include approved expenses
     };
    
    // Apply date filter if provided
    if (periodFrom && periodTo) {
      filter.expenseDate = { 
        $gte: periodFrom, 
        $lte: periodTo 
      };
    }
    
    // Apply category filter if provided
    if (categories && categories.length > 0) {
      filter.category = { $in: categories.split(',') };
    }
    
    // Apply department filter if provided
    if (departments && departments.length > 0) {
      filter.department_id = { $in: departments.split(',') };
    }
    
    // Get user details
    const user = await User.findById(userId);
    if (!user) {
      await Report.findByIdAndUpdate(newReport._id, {
        status: "FAILED",
        errorMessage: "User not found"
      });
      
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }
    
    // Fetch all matching expenses
    const expenses = await Expense.find(filter).sort({ expenseDate: -1 });
    
    if (expenses.length === 0) {
      await Report.findByIdAndUpdate(newReport._id, {
        status: "FAILED",
        errorMessage: "No expenses found matching the criteria"
      });
      
      return res.status(404).json({
        success: false,
        message: "No expenses found matching the criteria",
        reportId
      });
    }
    
    // Store expense IDs in the report
    newReport.expensesIncluded = expenses.map(exp => exp._id);
    
    // Get department information
    const departmentIds = [...new Set(expenses.map(exp => exp.department_id).filter(id => id))];
    const departmentsData = await Department.find({ _id: { $in: departmentIds } });
    
    // Prepare data for analysis
    const expensesByCategory = {};
    const expensesByMonth = {};
    let totalAmount = 0;
    
    expenses.forEach(expense => {
      // Aggregate by category
      if (!expensesByCategory[expense.category]) {
        expensesByCategory[expense.category] = {
          count: 0,
          totalAmount: 0,
          expenses: []
        };
      }
      expensesByCategory[expense.category].count += 1;
      expensesByCategory[expense.category].totalAmount += expense.amount;
      expensesByCategory[expense.category].expenses.push(expense);
      
      // Aggregate by month
      const month = expense.expenseDate.toISOString().substring(0, 7); // YYYY-MM format
      if (!expensesByMonth[month]) {
        expensesByMonth[month] = {
          count: 0,
          totalAmount: 0
        };
      }
      expensesByMonth[month].count += 1;
      expensesByMonth[month].totalAmount += expense.amount;
      
      // Track total
      totalAmount += expense.amount;
    });
    
    // Update report with summary data
    newReport.summary = {
      totalExpenses: expenses.length,
      totalAmount,
      expensesByCategory: Object.keys(expensesByCategory).map(category => ({
        name: category,
        count: expensesByCategory[category].count,
        amount: expensesByCategory[category].totalAmount
      })),
      expensesByMonth: Object.keys(expensesByMonth).sort().map(month => ({
        month,
        count: expensesByMonth[month].count,
        amount: expensesByMonth[month].totalAmount
      })),
      topMerchants: getTopMerchants(expenses, 5)
    };
    
    await newReport.save();
    
    // Generate AI report
    const model = genAI.getGenerativeModel({ 
      model: "gemini-1.5-pro",
      generationConfig: {
        temperature: 0.3, // Lower temperature for more factual responses
        topP: 0.8,
        topK: 40
      }
    });

    
    const promptData = {
      user: {
        name: user.name,
        department: user.department
      },
      expenseSummary: {
        totalExpenses: expenses.length,
        totalAmount,
        dateRange: {
          from: dateFrom || expenses[expenses.length - 1].expenseDate.toISOString().split('T')[0],
          to: dateTo || expenses[0].expenseDate.toISOString().split('T')[0]
        },
        categories: Object.keys(expensesByCategory).map(category => ({
          name: category,
          count: expensesByCategory[category].count,
          totalAmount: expensesByCategory[category].totalAmount,
          percentageOfTotal: (expensesByCategory[category].totalAmount / totalAmount * 100).toFixed(2)
        })),
        monthlyTrends: Object.keys(expensesByMonth).sort().map(month => ({
          month,
          count: expensesByMonth[month].count,
          totalAmount: expensesByMonth[month].totalAmount
        })),
        topMerchants: newReport.summary.topMerchants,
        departmentPolicies: departmentsData.map(dept => ({
          name: dept.name,
          categories: dept.categories || [],
          spendingLimits: dept.spendingLimits || {}
        }))
      }
    };
    
    const aiPrompt = `
      As an AI expense analysis system, generate a comprehensive financial report for all expenses of this user.
      ${reportPeriod ? `This is a ${reportPeriod} report covering the period from ${periodFrom.toLocaleDateString()} to ${periodTo.toLocaleDateString()}.` : ''}
      Use JSON format for your response with the following structure:
      {
        "reportId": "${reportId}",
        "disclaimer": "This report has been generated by AI and may require human review. All insights and recommendations should be validated according to company policies.",
        "executiveSummary": {
          "title": "Financial Expense Analysis for ${user.name}${reportPeriod ? ` - ${reportPeriod.charAt(0).toUpperCase() + reportPeriod.slice(1)} Report` : ''}",
          "overview": "3-4 sentence overview of the expense patterns",
          "keyFindings": ["list of 3-5 key insights"]
        },
        "financialAnalysis": {
          "totalSpend": {
            "amount": number,
            "trend": "increasing/decreasing/stable",
            "anomalies": ["any unusual spending patterns"]
          },
          "categoryBreakdown": [
            {
              "category": "category name",
              "amount": number,
              "percentage": number,
              "trend": "increasing/decreasing/stable",
              "insights": "specific insights about this category"
            }
          ],
          "complianceAnalysis": {
            "overallCompliance": "percentage of compliant expenses",
            "riskAreas": ["list of potential policy violations"],
            "recommendations": ["list of compliance recommendations"]
          }
        },
        "spendingPatterns": {
          "seasonalTrends": "analysis of monthly/seasonal patterns",
          "merchantAnalysis": "analysis of top merchants and spending patterns",
          "unusualActivities": ["list of any unusual activities detected"]
        },
        "optimization": {
          "savingsOpportunities": ["list of potential savings areas"],
          "processImprovements": ["list of process improvement recommendations"],
          "forecastedSpend": "projection for next period based on current patterns"${reportPeriod ? `,
          "periodComparison": "comparison with previous ${reportPeriod} periods if data is available"` : ''}
        }
      }

      Expense data: ${JSON.stringify(promptData)}

      Make your analysis data-driven, objective, and provide genuine business insights.
      Focus on identifying patterns, anomalies, compliance issues, and opportunities for optimization.
      ${reportPeriod === 'weekly' ? 'For this weekly report, focus on immediate actionable insights and day-to-day spending patterns.' : ''}
      ${reportPeriod === 'monthly' ? 'For this monthly report, focus on month-over-month comparisons and mid-term spending trends.' : ''}
      ${reportPeriod === 'yearly' ? 'For this yearly report, focus on annual trends, seasonal patterns, and long-term strategic spending insights.' : ''}
      The report should help financial decision-makers understand spending patterns and find cost-saving opportunities.
      IMPORTANT: 
      1.Include the disclaimer at the top of the report and handle multiple currencies in your analysis.
      2. All monetary values in the report MUST be in AED (Arab Emirates Dirham).
      3. When mentioning currency amounts, always use AED as the currency indicator.
      4. Format all numerical values consistently with commas for thousands and decimals where appropriate.
      5. All spending trends, forecasts, and thresholds should be expressed in AED.
      6. Note that this report only includes approved expenses, not pending or rejected ones.
    `;
    
    const aiResponse = await model.generateContent(aiPrompt);
    const aiText = aiResponse.response.text();
    
    // Parse the AI response
    let aiReport;
    try {
      // Extract JSON from potential markdown formatting
      const jsonMatch = aiText.match(/```json\n([\s\S]*?)\n```/) || 
                   aiText.match(/```\n([\s\S]*?)\n```/) ||
                   [null, aiText];
      const jsonStr = jsonMatch[1].trim();
      aiReport = JSON.parse(jsonStr);
      
      // Update report with AI analysis
      newReport.aiReport = {
        disclaimer: aiReport.disclaimer,
        executiveSummary: aiReport.executiveSummary,
        financialAnalysis: aiReport.financialAnalysis,
        spendingPatterns: aiReport.spendingPatterns,
        optimization: aiReport.optimization
      };
      
      newReport.status = "COMPLETED";
      await newReport.save();
      
    } catch (parseError) {
      console.error("Error parsing AI response:", parseError);
      await Report.findByIdAndUpdate(newReport._id, {
        status: "FAILED",
        errorMessage: "Failed to parse AI response"
      });
      
      return res.status(500).json({
        success: false,
        message: "Error generating AI report",
        error: "Failed to parse AI response",
        reportId
      });
    }
    
    // Generate PDF in background
    generateReportPDF(newReport._id);
    
    res.status(200).json({
      success: true,
      reportId: newReport.reportId,
      report: newReport.aiReport,
      summary: newReport.summary,
      dateRange: newReport.dateRange,
      generatedAt: newReport.generatedAt
    });
    
  } catch (error) {
    console.error("Error generating user expense report:", error);
    res.status(500).json({
      success: false,
      message: "Error generating user expense report",
      error: error.message
    });
  }
};

// Helper function to get top merchants
function getTopMerchants(expenses, limit = 5) {
  const merchantCounts = {};
  const merchantAmounts = {};
  
  expenses.forEach(expense => {
    if (!merchantCounts[expense.merchant]) {
      merchantCounts[expense.merchant] = 0;
      merchantAmounts[expense.merchant] = 0;
    }
    merchantCounts[expense.merchant] += 1;
    merchantAmounts[expense.merchant] += expense.amount;
  });
  
  const merchants = Object.keys(merchantCounts).map(merchant => ({
    name: merchant,
    count: merchantCounts[merchant],
    totalAmount: merchantAmounts[merchant]
  }));
  
  return merchants
    .sort((a, b) => b.totalAmount - a.totalAmount)
    .slice(0, limit);
}

// Background PDF generation
async function generateReportPDF(reportId) {
  try {
    const report = await Report.findById(reportId).populate('userId');
    if (!report || report.status !== "COMPLETED") {
      console.error("Cannot generate PDF: Report not found or not completed");
      return;
    }
    
    // Create PDF document
    const doc = new PDFDocument({ margin: 50 });
    
    // Setup PDF file
    const fileName = `expense_report_${report.reportId}.pdf`;
    const filePath = path.join(process.cwd(), 'uploads', 'reports', fileName);
    
    // Ensure directory exists
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    
    // Pipe PDF to file
    const stream = fs.createWriteStream(filePath);
    doc.pipe(stream);
    
    // Get report period label
    const getReportPeriodLabel = (period) => {
      switch(period) {
        case 'weekly': return 'Weekly';
        case 'monthly': return 'Monthly';
        case 'yearly': return 'Yearly';
        default: return 'Custom';
      }
    };

    // Add company branding
    doc.fontSize(25).text('Expense Analytics Report', { align: 'center' });
    doc.moveDown();
    // Add report period badge if it's not custom
    if (report.reportPeriod && report.reportPeriod !== 'custom') {
      doc.fontSize(14).fillColor('#C05621').text(
        `${getReportPeriodLabel(report.reportPeriod)} Report`, 
        { align: 'center' }
      );
      doc.moveDown(0.5);
    }
    doc.fontSize(12).text(`Generated for: ${report.userId.name}`, { align: 'center' });
    doc.fontSize(10).text(`Report ID: ${report.reportId}`, { align: 'center' });
    doc.fontSize(10).text(`Generated on: ${report.generatedAt.toLocaleString()}`, { align: 'center' });
    // Add date range if available
    if (report.dateRange && report.dateRange.from && report.dateRange.to) {
      doc.fontSize(10).text(
        `Period: ${new Date(report.dateRange.from).toLocaleDateString()} - ${new Date(report.dateRange.to).toLocaleDateString()}`, 
        { align: 'center' }
      );
    }
    doc.fontSize(10).text(`Report type: Approved Expenses Only`, { align: 'center' });
    doc.moveDown();
    
    // Add disclaimer
    doc.fontSize(10).fillColor('#666666').text(report.aiReport.disclaimer || 
        "DISCLAIMER: This report has been generated by AI and may require human review. All insights and recommendations should be validated according to company policies.", 
        { align: 'center', italic: true });
    doc.fillColor('#000000').moveDown(2);

    // Executive Summary Section
    doc.fontSize(18).text('Executive Summary');
    doc.moveDown(0.5);
    doc.fontSize(12).text(report.aiReport.executiveSummary.overview);
    doc.moveDown();
    
    // Key Findings
    doc.fontSize(14).text('Key Findings:');
    report.aiReport.executiveSummary.keyFindings.forEach((finding, index) => {
      doc.fontSize(12).text(`${index + 1}. ${finding}`);
    });
    doc.moveDown();
    
    // Financial Analysis
    doc.fontSize(18).text('Financial Analysis');
    doc.moveDown(0.5);
    doc.fontSize(12).text(`Total Spend: ${formatCurrency(report.aiReport.financialAnalysis.totalSpend.amount)}`);
    doc.fontSize(12).text(`Trend: ${report.aiReport.financialAnalysis.totalSpend.trend}`);
    doc.moveDown();
    
    // Category Breakdown
    doc.fontSize(14).text('Expense Categories:');
    doc.moveDown(0.5);

    // Create a table-like structure for categories
    const categories = report.aiReport.financialAnalysis.categoryBreakdown;
    const categoryTableTop = doc.y;
    const initialX = doc.x; // Define the starting X position
    const categoryColWidths = [150, 100, 100, 150];

    // Table headers
    doc.fontSize(10);
    doc.text('Category', initialX, categoryTableTop);
    doc.text('Amount', initialX + categoryColWidths[0], categoryTableTop);
    doc.text('Percentage', initialX + categoryColWidths[0] + categoryColWidths[1], categoryTableTop);
    doc.text('Trend', initialX + categoryColWidths[0] + categoryColWidths[1] + categoryColWidths[2], categoryTableTop);

    let categoryY = categoryTableTop + 20;
    categories.forEach((category, i) => {
    // Check if we need a new page
    if (categoryY > doc.page.height - 100) {
        doc.addPage();
        categoryY = 50;
    }
  
    doc.fontSize(9);
    doc.text(category.category, initialX, categoryY);
    doc.text(formatCurrency(category.amount), initialX + categoryColWidths[0], categoryY);
    doc.text(`${parseFloat(category.percentage || 0).toFixed(2)}%`, initialX + categoryColWidths[0] + categoryColWidths[1], categoryY);
    doc.text(category.trend, initialX + categoryColWidths[0] + categoryColWidths[1] + categoryColWidths[2], categoryY);
    
    categoryY += 20;
    });

    // Update doc.y position after the table
    doc.y = categoryY + 20;
    doc.moveDown();
    
    // Compliance Analysis
    doc.x = initialX;  // Reset to the same X position used for other sections
    doc.fontSize(14).text('Compliance Analysis:', {
    align: 'left'
    });
    doc.moveDown(0.5);
    doc.x = initialX;  // Ensure consistent left margin
    doc.fontSize(12).text(`Overall Compliance: ${report.aiReport.financialAnalysis.complianceAnalysis.overallCompliance}`);
    doc.moveDown(0.5);

    // Risk Areas - Fixed Section
    if (report.aiReport.financialAnalysis.complianceAnalysis.riskAreas && 
        report.aiReport.financialAnalysis.complianceAnalysis.riskAreas.length > 0) {
      
      doc.x = initialX;
      doc.fontSize(12).text('Risk Areas:', { continued: false });
      doc.moveDown(0.25);
      
      report.aiReport.financialAnalysis.complianceAnalysis.riskAreas.forEach((risk, index) => {
        doc.x = initialX + 10; // Add indentation for bullet points
        doc.fontSize(10).text(`• ${risk}`, {
          continued: false,
          width: doc.page.width - 100 // Prevent text from running off the page
        });
        doc.moveDown(0.25);
      });
      
      doc.moveDown(0.5);
    }

    // Recommendations
    if (report.aiReport.financialAnalysis.complianceAnalysis.recommendations && 
        report.aiReport.financialAnalysis.complianceAnalysis.recommendations.length > 0) {
      
      doc.x = initialX;
      doc.fontSize(12).text('Recommendations:', { continued: false });
      doc.moveDown(0.25);
      
      report.aiReport.financialAnalysis.complianceAnalysis.recommendations.forEach((rec, index) => {
        doc.x = initialX + 10;
        doc.fontSize(10).text(`• ${rec}`, {
          continued: false,
          width: doc.page.width - 100
        });
        doc.moveDown(0.25);
      });
    }
    
    doc.moveDown();
    
    // Spending Patterns
    doc.addPage();
    doc.fontSize(18).text('Spending Patterns');
    doc.moveDown(0.5);
    doc.fontSize(12).text(report.aiReport.spendingPatterns.seasonalTrends);
    doc.moveDown();
    doc.fontSize(12).text(report.aiReport.spendingPatterns.merchantAnalysis);
    doc.moveDown();
    
    doc.fontSize(14).text('Unusual Activities:');
    report.aiReport.spendingPatterns.unusualActivities.forEach((activity, index) => {
      doc.fontSize(10).text(`• ${activity}`);
    });
    doc.moveDown();
    
    // Optimization Recommendations
    doc.fontSize(18).text('Optimization Recommendations');
    doc.moveDown(0.5);
    doc.fontSize(14).text('Savings Opportunities:');
    report.aiReport.optimization.savingsOpportunities.forEach((opportunity, index) => {
      doc.fontSize(10).text(`• ${opportunity}`);
    });
    doc.moveDown();
    
    doc.fontSize(14).text('Process Improvements:');
    report.aiReport.optimization.processImprovements.forEach((improvement, index) => {
      doc.fontSize(10).text(`• ${improvement}`);
    });
    doc.moveDown();
    
    doc.fontSize(12).text(`Forecasted Spend: ${report.aiReport.optimization.forecastedSpend}`);
    
    // Finalize the PDF
    doc.end();
    
    // Update report with PDF URL when stream is finished
    stream.on('finish', async () => {
      const pdfUrl = `/reports/download/${fileName}`;
      await Report.findByIdAndUpdate(reportId, { pdfUrl });
    });
    
  } catch (error) {
    console.error("Error generating PDF in background:", error);
    await Report.findByIdAndUpdate(reportId, {
      errorMessage: `PDF generation error: ${error.message}`
    });
  }
}

// Get report PDF
export const getReportPDF = async (req, res) => {
  try {
    const { reportId } = req.params;
    const userId = req.user.id;
    
    const report = await Report.findOne({ reportId, userId });
    
    if (!report) {
      return res.status(404).json({
        success: false,
        message: "Report not found"
      });
    }
    
    if (!report.pdfUrl) {
      return res.status(202).json({
        success: false,
        message: "PDF is still being generated. Please try again shortly.",
        reportId: report.reportId,
        status: report.status
      });
    }
    
    res.status(200).json({
      success: true,
      downloadUrl: report.pdfUrl,
      reportDetails: {
        reportId: report.reportId,
        title: report.title,
        generatedAt: report.generatedAt,
        totalExpenses: report.summary.totalExpenses,
        totalAmount: report.summary.totalAmount
      }
    });
    
  } catch (error) {
    console.error("Error getting report PDF:", error);
    res.status(500).json({
      success: false,
      message: "Error getting report PDF",
      error: error.message
    });
  }
};

// Get reports list
export const getUserReports = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      dateFrom, 
      dateTo,
      status
    } = req.query;
    
    const userId = req.user.id;
    const skip = (page - 1) * limit;
    
    // Build filter
    const filter = { userId };
    
    // Apply date filter if provided
    if (dateFrom && dateTo) {
      filter.generatedAt = { 
        $gte: new Date(dateFrom), 
        $lte: new Date(dateTo) 
      };
    }
    
    // Apply status filter
    if (status) {
      filter.status = status;
    }
    
    // Get reports
    const reports = await Report.find(filter)
      .sort({ generatedAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));
    
    // Get total count for pagination
    const totalReports = await Report.countDocuments(filter);
    
    // Format response
    const formattedReports = reports.map(report => ({
      id: report.reportId,
      title: report.title,
      generatedAt: report.generatedAt,
      status: report.status,
      totalExpenses: report.summary?.totalExpenses || 0,
      totalAmount: report.summary?.totalAmount || 0,
      hasError: !!report.errorMessage,
      hasPDF: !!report.pdfUrl,
      dateRange: report.dateRange,
      reportPeriod: report.reportPeriod
    }));
    
    res.status(200).json({
      success: true,
      data: formattedReports,
      pagination: {
        total: totalReports,
        pages: Math.ceil(totalReports / limit),
        currentPage: parseInt(page),
        perPage: parseInt(limit)
      }
    });
    
  } catch (error) {
    console.error("Error fetching user reports:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching user reports",
      error: error.message
    });
  }
};

// Download generated PDF report
export const downloadPDFReport = async (req, res) => {
  try {
    const { fileName } = req.params;
    const filePath = path.join(process.cwd(), 'uploads', 'reports', fileName);
    
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        success: false,
        message: "Report file not found"
      });
    }
    
    // Set appropriate headers
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=${fileName}`);
    
    // Stream the file
    const fileStream = fs.createReadStream(filePath);
    fileStream.pipe(res);
    
  } catch (error) {
    console.error("Error downloading PDF report:", error);
    res.status(500).json({
      success: false,
      message: "Error downloading PDF report",
      error: error.message
    });
  }
};


// Format currency helper
function formatCurrency(amount) {
  return new Intl.NumberFormat('en-AE', {
    style: 'currency',
    currency: 'AED'
  }).format(amount);
}

// Delete a user report
export const deleteUserReport = async (req, res) => {
    try {
      const { reportId } = req.params;
      const userId = req.user.id;
      
      const report = await Report.findOneAndDelete({ reportId, userId });
      
      if (!report) {
        return res.status(404).json({
          success: false,
          message: "Report not found or you don't have permission to delete it"
        });
      }
      
      // If report has a PDF file, delete it too
      if (report.pdfUrl) {
        const fileName = report.pdfUrl.split('/').pop();
        const filePath = path.join(process.cwd(), 'uploads', 'reports', fileName);
        
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      }
      
      res.status(200).json({
        success: true,
        message: "Report deleted successfully"
      });
      
    } catch (error) {
      console.error("Error deleting user report:", error);
      res.status(500).json({
        success: false,
        message: "Error deleting user report",
        error: error.message
      });
    }
  };

  export const getReportDetails = async (req, res) => {
    try {
      const { reportId } = req.params;
      const userId = req.user.id;
      
      const report = await Report.findOne({ reportId, userId });
      if (!report) {
        return res.status(404).json({
          success: false,
          message: "Report not found"
        });
      }
      
      res.status(200).json({
        success: true,
        data: report
      });
    } catch (error) {
      console.error("Error fetching report details:", error);
      res.status(500).json({
        success: false,
        message: "Error fetching report details",
        error: error.message
      });
    }
  };