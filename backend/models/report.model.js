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
    reportType: {
      type: String,
      enum: ["USER_COMPREHENSIVE", "EXPENSE_SPECIFIC"],
      default: "USER_COMPREHENSIVE"
    },
    title: {
      type: String,
      required: true
    },
    dateRange: {
      from: Date,
      to: Date
    },
    filters: {
      categories: [String],
      departments: [mongoose.Schema.Types.ObjectId],
      merchants: [String]
    },
    summary: {
      totalExpenses: Number,
      totalAmount: Number,
      expensesByCategory: [
        {
          name: String,
          count: Number,
          amount: Number
        }
      ],
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
      ]
    },
    aiReport: {
      executiveSummary: {
        title: String,
        overview: String,
        keyFindings: [String]
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
          recommendations: [String]
        }
      },
      spendingPatterns: {
        seasonalTrends: String,
        merchantAnalysis: String,
        unusualActivities: [String]
      },
      optimization: {
        savingsOpportunities: [String],
        processImprovements: [String],
        forecastedSpend: String
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