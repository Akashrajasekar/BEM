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
import mongoose from "mongoose";

dotenv.config();
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);

// Add this to your manager controller file
export const getTeamMembers = async (req, res) => {
    try {
      const managerId = req.user.id;
      
      // First, verify that the requester is actually a manager
      const manager = await User.findById(managerId);
      if (!manager || manager.access !== 'manager') {
        return res.status(403).json({
          success: false,
          message: "Access denied. Only managers can access team members."
        });
      }
      
      // Get the manager's department ID directly from their user record
      if (!manager.department_id) {
        return res.status(404).json({
          success: false,
          message: "No department assigned to this manager"
        });
      }
      
      // Find all employees in this department directly using the department_id
      const teamMembers = await User.find({ 
        department_id: manager.department_id,
        access: 'employee'
      }).select('name email _id');
      
      res.status(200).json({
        success: true,
        data: teamMembers
      });
      
    } catch (error) {
      console.error("Error fetching team members:", error);
      res.status(500).json({
        success: false,
        message: "Error fetching team members",
        error: error.message
      });
    }
  };
  
  // Then add this route to your routes file:
  // router.get('/team-members', authMiddleware, getTeamMembers);
// Generate comprehensive AI report for all team expenses (manager view)
export const generateTeamExpenseReport = async (req, res) => {
  try {
    const managerId = req.user.id;
    const { dateFrom, dateTo, categories, employeeIds, title, reportPeriod } = req.query;
    
    // Generate a unique report ID
    const reportId = `MGRREP-${uuidv4().substring(0, 8)}-${Date.now().toString().substring(9)}`;
    
    // Find manager's department
    const manager = await User.findById(managerId);
    if (!manager || manager.access !== 'manager') {
      return res.status(403).json({
        success: false,
        message: "Access denied. Only managers can generate team reports."
      });
    }
    
    // Get the department managed by this manager
    const department = await Department.findOne({ manager_id: managerId });
    if (!department) {
      return res.status(404).json({
        success: false,
        message: "No department found for this manager"
      });
    }
    
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
          periodTitle = `Weekly Team Expense Report: ${department.name} (${weekStart} - ${weekEnd})`;
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
          periodTitle = `Monthly Team Expense Report: ${department.name} (${monthYear})`;
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
          periodTitle = `Annual Team Expense Report: ${department.name} (${year})`;
        }
      }
    }

    // Create initial report record
    const newReport = new Report({
      userId: managerId,
      reportId,
      title: title || `Team Expense Analysis: ${department.name} - ${new Date().toLocaleDateString()}`,
      dateRange: {
        from: periodFrom,
        to: periodTo
      },
      reportType: 'team', // Mark this as a team report
      reportPeriod: reportPeriod || 'custom',
      departmentId: department._id,
      filters: {
        categories: categories ? categories.split(',') : [],
        employeeIds: employeeIds ? employeeIds.split(',').map(id => mongoose.Types.ObjectId(id)) : [],
      },
      status: "GENERATING"
    });
    
    await newReport.save();
    
    // Get team members from the department
    const teamMembers = await User.find({ 
      department_id: department._id,
      access: 'employee' // Only include employees, not other managers
    });
    
    const teamMemberIds = teamMembers.map(member => member._id);
    
    // Filter specifically selected employees if provided
    const targetEmployeeIds = employeeIds 
      ? employeeIds.split(',').filter(id => teamMemberIds.includes(mongoose.Types.ObjectId(id)))
      : teamMemberIds;
    
    if (targetEmployeeIds.length === 0) {
      await Report.findByIdAndUpdate(newReport._id, {
        status: "FAILED",
        errorMessage: "No team members found matching the criteria"
      });
      
      return res.status(404).json({
        success: false,
        message: "No team members found matching the criteria",
        reportId
      });
    }
    
    // Build filter conditions for expenses
    const filter = { 
      userId: { $in: targetEmployeeIds },
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
    
    // Fetch all matching expenses
    const expenses = await Expense.find(filter)
      .sort({ expenseDate: -1 })
      .populate('userId', 'name email role'); // Include user details for team analysis
    
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
    
    // Prepare data for analysis
    const expensesByCategory = {};
    const expensesByEmployee = {};
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
      
      // Aggregate by employee
      const employeeId = expense.userId._id.toString();
      const employeeName = expense.userId.name;
      
      if (!expensesByEmployee[employeeId]) {
        expensesByEmployee[employeeId] = {
          name: employeeName,
          count: 0,
          totalAmount: 0,
          expenses: []
        };
      }
      expensesByEmployee[employeeId].count += 1;
      expensesByEmployee[employeeId].totalAmount += expense.amount;
      expensesByEmployee[employeeId].expenses.push(expense);
      
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
      employeeCount: Object.keys(expensesByEmployee).length,
      expensesByCategory: Object.keys(expensesByCategory).map(category => ({
        name: category,
        count: expensesByCategory[category].count,
        amount: expensesByCategory[category].totalAmount
      })),
      expensesByEmployee: Object.keys(expensesByEmployee).map(empId => ({
        employeeId: empId,
        name: expensesByEmployee[empId].name,
        count: expensesByEmployee[empId].count,
        amount: expensesByEmployee[empId].totalAmount
      })),
      expensesByMonth: Object.keys(expensesByMonth).sort().map(month => ({
        month,
        count: expensesByMonth[month].count,
        amount: expensesByMonth[month].totalAmount
      })),
      topMerchants: getTopMerchants(expenses, 5),
      spendingTrends: calculateSpendingTrends(expensesByMonth, department.total_budget)
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
      manager: {
        name: manager.name,
        department: department.name
      },
      department: {
        name: department.name,
        totalBudget: department.total_budget,
        categories: department.categories || ['Others']
      },
      teamExpenseSummary: {
        totalExpenses: expenses.length,
        totalAmount,
        employeeCount: Object.keys(expensesByEmployee).length,
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
        employees: Object.keys(expensesByEmployee).map(empId => ({
          name: expensesByEmployee[empId].name,
          count: expensesByEmployee[empId].count,
          totalAmount: expensesByEmployee[empId].totalAmount,
          percentageOfTotal: (expensesByEmployee[empId].totalAmount / totalAmount * 100).toFixed(2)
        })),
        monthlyTrends: Object.keys(expensesByMonth).sort().map(month => ({
          month,
          count: expensesByMonth[month].count,
          totalAmount: expensesByMonth[month].totalAmount
        })),
        topMerchants: newReport.summary.topMerchants,
        budgetUtilization: department.total_budget ? (totalAmount / department.total_budget * 100).toFixed(2) + '%' : 'Not available'
      }
    };
    
    const aiPrompt = `
      As an AI expense analysis system, generate a comprehensive team expense report for a manager.
      ${reportPeriod ? `This is a ${reportPeriod} report covering the period from ${periodFrom.toLocaleDateString()} to ${periodTo.toLocaleDateString()}.` : ''}
      Use JSON format for your response with the following structure:
      {
        "reportId": "${reportId}",
        "disclaimer": "This report has been generated by AI and may require human review. All insights and recommendations should be validated according to company policies.",
        "executiveSummary": {
          "title": "Team Expense Analysis for ${department.name}${reportPeriod ? ` - ${reportPeriod.charAt(0).toUpperCase() + reportPeriod.slice(1)} Report` : ''}",
          "overview": "3-4 sentence overview of the team's expense patterns",
          "keyFindings": ["list of 3-5 key insights"]
        },
        "teamAnalysis": {
          "budgetUtilization": {
            "current": "current budget usage percentage",
            "projected": "projected usage by end of period",
            "insights": "insights on budget utilization"
          },
          "employeeBreakdown": [
            {
              "highestSpender": "employee with highest spend",
              "amount": number,
              "percentage": number,
              "insights": "specific insights about spending patterns"
            },
            {
              "lowestSpender": "employee with lowest spend",
              "amount": number,
              "percentage": number,
              "insights": "specific insights about spending patterns"
            }
          ],
          "categoryAnalysis": {
            "topCategories": ["list of top spending categories"],
            "anomalies": ["any unusual category spending"],
            "recommendations": ["category budget recommendations"]
          }
        },
        "complianceAnalysis": {
          "overallCompliance": "percentage of compliant expenses",
          "policyDeviations": ["list of potential policy deviations"],
          "recommendations": ["list of compliance recommendations for the team"]
        },
        "spendingPatterns": {
          "seasonalTrends": "analysis of monthly/seasonal patterns",
          "employeeTrends": "analysis of spending patterns across employees",
          "merchantAnalysis": "analysis of top merchants and spending patterns",
          "unusualActivities": ["list of any unusual activities detected"]
        },
        "optimization": {
          "savingsOpportunities": ["list of potential savings areas"],
          "resourceAllocation": ["suggestions for better resource allocation"],
          "forecastedSpend": "projection for next period based on current patterns"${reportPeriod ? `,
          "periodComparison": "comparison with previous ${reportPeriod} periods if data is available"` : ''}
        }
      }

      Team Expense data: ${JSON.stringify(promptData)}

      Make your analysis data-driven, objective, and provide genuine business insights for the manager.
      Focus on identifying team patterns, employee expense behaviors, department budget utilization, and opportunities for o.
      ${reportPeriod === 'weekly' ? 'For this weekly report, focus on immediate actionable insights and week-over-week team spending patterns.' : ''}
      ${reportPeriod === 'monthly' ? 'For this monthly report, focus on month-over-month comparisons, employee spending comparisons, and mid-term budget planning.' : ''}
      ${reportPeriod === 'yearly' ? 'For this yearly report, focus on annual budget utilization, employee spending trends, seasonal patterns, and long-term strategic spending insights.' : ''}
      The report should help the manager understand team spending patterns, identify outliers, and find cost-saving opportunities across the department.
      IMPORTANT: 
      1. Include the disclaimer at the top of the report.
      2. All monetary values in the report MUST be in AED (Arab Emirates Dirham).
      3. When mentioning currency amounts, always use AED as the currency indicator.
      4. Format all numerical values consistently with commas for thousands and decimals where appropriate.
      5. All spending trends, forecasts, and thresholds should be expressed in AED.
      6. For employee spending analysis, focus on patterns rather than specific transactions.
      7. Note that this report only includes approved expenses, not pending or rejected ones.
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
        teamAnalysis: aiReport.teamAnalysis,
        complianceAnalysis: aiReport.complianceAnalysis,
        spendingPatterns: aiReport.spendingPatterns,
        o: aiReport.o
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
    generateTeamReportPDF(newReport._id);
    
    res.status(200).json({
      success: true,
      reportId: newReport.reportId,
      report: newReport.aiReport,
      summary: newReport.summary,
      dateRange: newReport.dateRange,
      generatedAt: newReport.generatedAt
    });
    
  } catch (error) {
    console.error("Error generating team expense report:", error);
    res.status(500).json({
      success: false,
      message: "Error generating team expense report",
      error: error.message
    });
  }
};

// Helper function to get top merchants (same as in employee controller)
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

// New helper function to calculate spending trends
function calculateSpendingTrends(expensesByMonth, departmentBudget) {
  // Sort months chronologically
  const sortedMonths = Object.keys(expensesByMonth).sort();
  
  if (sortedMonths.length < 2) {
    return {
      trend: "Not enough data",
      monthlyChange: "N/A",
      budgetStatus: departmentBudget ? "Insufficient data for projection" : "No budget defined"
    };
  }
  
  // Calculate month-over-month change
  const lastMonth = sortedMonths[sortedMonths.length - 1];
  const previousMonth = sortedMonths[sortedMonths.length - 2];
  
  const lastMonthAmount = expensesByMonth[lastMonth].totalAmount;
  const previousMonthAmount = expensesByMonth[previousMonth].totalAmount;
  
  const monthlyChange = ((lastMonthAmount - previousMonthAmount) / previousMonthAmount * 100).toFixed(2);
  
  // Determine trend
  let trend;
  if (monthlyChange > 10) {
    trend = "Significant increase";
  } else if (monthlyChange > 0) {
    trend = "Slight increase";
  } else if (monthlyChange === 0) {
    trend = "Stable";
  } else if (monthlyChange > -10) {
    trend = "Slight decrease";
  } else {
    trend = "Significant decrease";
  }
  
  // Calculate budget projection if budget is defined
  let budgetStatus = "No budget defined";
  
  if (departmentBudget) {
    // Calculate average monthly spend
    let totalSpend = 0;
    sortedMonths.forEach(month => {
      totalSpend += expensesByMonth[month].totalAmount;
    });
    
    const avgMonthlySpend = totalSpend / sortedMonths.length;
    const projectedAnnualSpend = avgMonthlySpend * 12;
    
    const budgetUtilizationPercent = (projectedAnnualSpend / departmentBudget * 100).toFixed(2);
    
    if (budgetUtilizationPercent > 110) {
      budgetStatus = `At risk: Projected to exceed annual budget by ${budgetUtilizationPercent - 100}%`;
    } else if (budgetUtilizationPercent > 90) {
      budgetStatus = `On track: Projected to use ${budgetUtilizationPercent}% of annual budget`;
    } else {
      budgetStatus = `Under budget: Projected to use ${budgetUtilizationPercent}% of annual budget`;
    }
  }
  
  return {
    trend,
    monthlyChange: `${monthlyChange}%`,
    budgetStatus
  };
}

// Background PDF generation for team reports
async function generateTeamReportPDF(reportId) {
  try {
    const report = await Report.findById(reportId)
      .populate('userId')
      .populate('departmentId');
    
    if (!report || report.status !== "COMPLETED") {
      console.error("Cannot generate PDF: Report not found or not completed");
      return;
    }
    
    // Create PDF document
    const doc = new PDFDocument({ margin: 50 });
    
    // Setup PDF file
    const fileName = `team_expense_report_${report.reportId}.pdf`;
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
    doc.fontSize(25).text('Team Expense Analytics Report', { align: 'center' });
    doc.moveDown();
    
    // Add report period badge if it's not custom
    if (report.reportPeriod && report.reportPeriod !== 'custom') {
      doc.fontSize(14).fillColor('#C05621').text(
        `${getReportPeriodLabel(report.reportPeriod)} Report`, 
        { align: 'center' }
      );
      doc.moveDown(0.5);
    }
    
    // Add department information
    doc.fontSize(16).fillColor('#000000').text(`Department: ${report.departmentId.name}`, { align: 'center' });
    doc.moveDown(0.5);
    
    doc.fontSize(12).text(`Generated for: ${report.userId.name} (Manager)`, { align: 'center' });
    doc.fontSize(10).text(`Report ID: ${report.reportId}`, { align: 'center' });
    doc.fontSize(10).text(`Generated on: ${report.generatedAt.toLocaleString()}`, { align: 'center' });
    
    // Add date range if available
    if (report.dateRange && report.dateRange.from && report.dateRange.to) {
      doc.fontSize(10).text(
        `Period: ${new Date(report.dateRange.from).toLocaleDateString()} - ${new Date(report.dateRange.to).toLocaleDateString()}`, 
        { align: 'center' }
      );
    }
    
    doc.fontSize(10).text(`Report type: Team Approved Expenses`, { align: 'center' });
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
    
    // Team Analysis Section
    doc.fontSize(18).text('Team Analysis');
    doc.moveDown(0.5);
    
    // Budget Utilization
    doc.fontSize(14).text('Budget Utilization:');
    doc.fontSize(12).text(`Current: ${report.aiReport.teamAnalysis.budgetUtilization.current}`);
    doc.fontSize(12).text(`Projected: ${report.aiReport.teamAnalysis.budgetUtilization.projected}`);
    doc.fontSize(12).text(`${report.aiReport.teamAnalysis.budgetUtilization.insights}`);
    doc.moveDown();
    
    // Employee Breakdown
    doc.fontSize(14).text('Employee Spending:');
    doc.moveDown(0.5);
    
    // Create a table-like structure for employee spending
    const initialX = doc.x;
    let currentY = doc.y;
    
    // Display highest spender
    const highestSpender = report.aiReport.teamAnalysis.employeeBreakdown[0];
    if (highestSpender) {
      doc.fontSize(12).text(`Highest Spender: ${highestSpender.highestSpender}`, initialX, currentY);
      currentY += 20;
      doc.fontSize(10).text(`Amount: ${formatCurrency(highestSpender.amount)}`, initialX + 20, currentY);
      currentY += 15;
      doc.fontSize(10).text(`Percentage: ${highestSpender.percentage}%`, initialX + 20, currentY);
      currentY += 15;
      doc.fontSize(10).text(`Insights: ${highestSpender.insights}`, initialX + 20, currentY);
      currentY += 30;
    }
    
    // Display lowest spender if available
    const lowestSpender = report.aiReport.teamAnalysis.employeeBreakdown[1];
    if (lowestSpender) {
      doc.fontSize(12).text(`Lowest Spender: ${lowestSpender.lowestSpender}`, initialX, currentY);
      currentY += 20;
      doc.fontSize(10).text(`Amount: ${formatCurrency(lowestSpender.amount)}`, initialX + 20, currentY);
      currentY += 15;
      doc.fontSize(10).text(`Percentage: ${lowestSpender.percentage}%`, initialX + 20, currentY);
      currentY += 15;
      doc.fontSize(10).text(`Insights: ${lowestSpender.insights}`, initialX + 20, currentY);
    }
    
    doc.moveDown(2);
    
    // Category Analysis
    doc.fontSize(14).text('Category Analysis:');
    doc.moveDown(0.5);
    doc.fontSize(12).text('Top Categories:');
    report.aiReport.teamAnalysis.categoryAnalysis.topCategories.forEach((category, index) => {
      doc.fontSize(10).text(`• ${category}`, { indent: 20 });
    });
    doc.moveDown();
    
    doc.fontSize(12).text('Anomalies:');
    report.aiReport.teamAnalysis.categoryAnalysis.anomalies.forEach((anomaly, index) => {
      doc.fontSize(10).text(`• ${anomaly}`, { indent: 20 });
    });
    doc.moveDown();
    
    doc.fontSize(12).text('Recommendations:');
    report.aiReport.teamAnalysis.categoryAnalysis.recommendations.forEach((rec, index) => {
      doc.fontSize(10).text(`• ${rec}`, { indent: 20 });
    });
    doc.moveDown();
    
    // Add new page for Compliance Analysis
    doc.addPage();
    
    // Compliance Analysis Section
    doc.fontSize(18).text('Compliance Analysis');
    doc.moveDown(0.5);
    doc.fontSize(12).text(`Overall Compliance: ${report.aiReport.complianceAnalysis.overallCompliance}`);
    doc.moveDown();
    
    doc.fontSize(14).text('Policy Deviations:');
    report.aiReport.complianceAnalysis.policyDeviations.forEach((deviation, index) => {
      doc.fontSize(10).text(`• ${deviation}`);
    });
    doc.moveDown();
    
    doc.fontSize(14).text('Recommendations:');
    report.aiReport.complianceAnalysis.recommendations.forEach((recommendation, index) => {
      doc.fontSize(10).text(`• ${recommendation}`);
    });
    doc.moveDown();
    
    // Spending Patterns Section
    doc.fontSize(18).text('Spending Patterns');
    doc.moveDown(0.5);
    doc.fontSize(12).text(`Seasonal Trends: ${report.aiReport.spendingPatterns.seasonalTrends}`);
    doc.moveDown();
    doc.fontSize(12).text(`Employee Trends: ${report.aiReport.spendingPatterns.employeeTrends}`);
    doc.moveDown();
    doc.fontSize(12).text(`Merchant Analysis: ${report.aiReport.spendingPatterns.merchantAnalysis}`);
    doc.moveDown();
    
    doc.fontSize(14).text('Unusual Activities:');
    report.aiReport.spendingPatterns.unusualActivities.forEach((activity, index) => {
      doc.fontSize(10).text(`• ${activity}`);
    });
    doc.moveDown();
    
    // Budget o Section
    doc.fontSize(18).text('Budget o');
    doc.moveDown(0.5);
    
    doc.fontSize(14).text('Savings Opportunities:');
    report.aiReport.o.savingsOpportunities.forEach((opportunity, index) => {
      doc.fontSize(10).text(`• ${opportunity}`);
    });
    doc.moveDown();
    
    doc.fontSize(14).text('Resource Allocation:');
    report.aiReport.o.resourceAllocation.forEach((allocation, index) => {
      doc.fontSize(10).text(`• ${allocation}`);
    });
    doc.moveDown();
    
    doc.fontSize(12).text(`Forecasted Spend: ${report.aiReport.o.forecastedSpend}`);
    
    // Add period comparison if available
    if (report.aiReport.o.periodComparison) {
      doc.moveDown();
      doc.fontSize(12).text(`Period Comparison: ${report.aiReport.o.periodComparison}`);
    }
    
    // Finalize the PDF
    doc.end();
    
    // Update report with PDF URL when stream is finished
    stream.on('finish', async () => {
      const pdfUrl = `/reports/download/${fileName}`;
      await Report.findByIdAndUpdate(reportId, { pdfUrl });
    });
    
  } catch (error) {
    console.error("Error generating team PDF report:", error);
    await Report.findByIdAndUpdate(reportId, {
      errorMessage: `PDF generation error: ${error.message}`
    });
  }
}

// Download generated PDF report
export const downloadTeamPDFReport = async (req, res) => {
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

// Get manager's team reports list
export const getManagerTeamReports = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      dateFrom, 
      dateTo,
      status
    } = req.query;
    
    const managerId = req.user.id;
    const skip = (page - 1) * limit;
    
    // Verify manager status
    const manager = await User.findById(managerId);
    if (!manager || manager.access !== 'manager') {
      return res.status(403).json({
        success: false,
        message: "Access denied. Only managers can access team reports."
      });
    }
    
    // Build filter
    const filter = { 
      userId: managerId,
      reportType: 'team' // Only get team reports
    };
    
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
      .limit(parseInt(limit))
      .populate('departmentId', 'name');
    
    // Get total count for pagination
    const totalReports = await Report.countDocuments(filter);
    
    // Format response
    const formattedReports = reports.map(report => ({
      id: report.reportId,
      title: report.title,
      department: report.departmentId?.name || 'Unknown',
      generatedAt: report.generatedAt,
      status: report.status,
      totalExpenses: report.summary?.totalExpenses || 0,
      totalAmount: report.summary?.totalAmount || 0,
      employeeCount: report.summary?.employeeCount || 0,
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
    console.error("Error fetching manager team reports:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching manager team reports",
      error: error.message
    });
  }
};

// Get team report details
export const getTeamReportDetails = async (req, res) => {
  try {
    const { reportId } = req.params;
    const managerId = req.user.id;
    
    // Verify manager status
    const manager = await User.findById(managerId);
    if (!manager || manager.access !== 'manager') {
      return res.status(403).json({
        success: false,
        message: "Access denied. Only managers can access team reports."
      });
    }
    
    const report = await Report.findOne({ 
      reportId, 
      userId: managerId,
      reportType: 'team'
    }).populate('departmentId');
    
    if (!report) {
      return res.status(404).json({
        success: false,
        message: "Team report not found"
      });
    }
    
    res.status(200).json({
      success: true,
      data: report
    });
  } catch (error) {
    console.error("Error fetching team report details:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching team report details",
      error: error.message
    });
  }
};

// Get team report PDF
export const getTeamReportPDF = async (req, res) => {
  try {
    const { reportId } = req.params;
    const managerId = req.user.id;
    
    // Verify manager status
    const manager = await User.findById(managerId);
    if (!manager || manager.access !== 'manager') {
      return res.status(403).json({
        success: false,
        message: "Access denied. Only managers can access team reports."
      });
    }
    
    const report = await Report.findOne({ 
      reportId, 
      userId: managerId,
      reportType: 'team'
    });
    
    if (!report) {
      return res.status(404).json({
        success: false,
        message: "Team report not found"
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
        totalExpenses: report.summary?.totalExpenses || 0,
        totalAmount: report.summary?.totalAmount || 0,
        employeeCount: report.summary?.employeeCount || 0
      }
    });
    
  } catch (error) {
    console.error("Error getting team report PDF:", error);
    res.status(500).json({
      success: false,
      message: "Error getting team report PDF",
      error: error.message
    });
  }
};

// Delete a team report
export const deleteTeamReport = async (req, res) => {
  try {
    const { reportId } = req.params;
    const managerId = req.user.id;
    
    // Verify manager status
    const manager = await User.findById(managerId);
    if (!manager || manager.access !== 'manager') {
      return res.status(403).json({
        success: false,
        message: "Access denied. Only managers can delete team reports."
      });
    }
    
    const report = await Report.findOneAndDelete({ 
      reportId, 
      userId: managerId,
      reportType: 'team'
    });
    
    if (!report) {
      return res.status(404).json({
        success: false,
        message: "Team report not found or you don't have permission to delete it"
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
      message: "Team report deleted successfully"
    });
    
  } catch (error) {
    console.error("Error deleting team report:", error);
    res.status(500).json({
      success: false,
      message: "Error deleting team report",
      error: error.message
    });
  }
};

// Format currency helper (same as in employee controller)
function formatCurrency(amount) {
  return new Intl.NumberFormat('en-AE', {
    style: 'currency',
    currency: 'AED'
  }).format(amount);
}