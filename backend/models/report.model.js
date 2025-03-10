import mongoose from "mongoose";

const reportSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    },
    reportId: {
      type: String,
      required: true,
      unique: true
    },
    // Manager-specific fields
    reportType: { 
      type: String, 
      enum: ['personal', 'team'],
      default: 'personal'  // 'team' for manager-generated reports
    },
    departmentId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'Department'
      // Required for manager team reports
    },
    title: {
      type: String,
      required: true
    },
    dateRange: {
      from: Date,
      to: Date
    },
    // Add the report period field
    reportPeriod: {
      type: String,
      enum: ['custom', 'weekly', 'monthly', 'yearly'],
      default: 'custom'
    },
    filters: {
      categories: [String],
      departments: [mongoose.Schema.Types.ObjectId],
      employeeIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],  // Only in manager reports
      merchants: [String]
    },
    summary: {
      totalExpenses: Number,
      totalAmount: Number,
      employeeCount: Number,  // Only in manager reports
      expensesByCategory: [
        {
          name: String,
          count: Number,
          amount: Number
        }
      ],
      expensesByEmployee: [{  // Only in manager reports
        employeeId: String,
        name: String,
        count: Number,
        amount: Number
      }],
      expensesByMonth: [
        {
          month: String,
          count: Number,
          amount: Number
        }
      ],
      topMerchants: [
        {
          name: String,
          count: Number,
          totalAmount: Number
        }
      ],
      spendingTrends: {  // Only in manager reports
        trend: String,
        monthlyChange: String,
        budgetStatus: String
      }
    },
    
    aiReport: {
      disclaimer: String,
      executiveSummary: {
        title: String,
        overview: String,
        keyFindings: [String]
      },
      teamAnalysis: {  // Only in manager reports
        budgetUtilization: {
          current: String,
          projected: String,
          insights: String
        },
        employeeBreakdown: [{
          highestSpender: String,
          amount: Number,
          percentage: Number,
          insights: String
        }],
        categoryAnalysis: {
          topCategories: [String],
          anomalies: [String],
          recommendations: [String]
        }
      },
      financialAnalysis: {
        totalSpend: {
          amount: Number,
          trend: String,
          anomalies: [String]
        },
        categoryBreakdown: [
          {
            category: String,
            amount: Number,
            percentage: Number,
            trend: String,
            insights: String
          }
        ],
        complianceAnalysis: {
          overallCompliance: String,
          riskAreas: [String],
          policyDeviations: [String],  // In manager reports
          recommendations: [String]
        }
      },
      spendingPatterns: {
        seasonalTrends: String,
        employeeTrends: String,  // Only in manager reports
        merchantAnalysis: String,
        unusualActivities: [String]
      },
      optimization: {
        savingsOpportunities: [String],
        processImprovements: [String],
        resourceAllocation: [String],
        forecastedSpend: String,
        periodComparison: String
      }
    },
    pdfUrl: String,
    generatedAt: {
      type: Date,
      default: Date.now
    },
    expensesIncluded: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Expense"
      }
    ],
    status: {
      type: String,
      enum: ["GENERATING", "COMPLETED", "FAILED"],
      default: "GENERATING"
    },
    errorMessage: String
  },
  {
    timestamps: true
  }
);

const Report = mongoose.model("Report", reportSchema);

export default Report;