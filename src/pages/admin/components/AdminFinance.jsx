import React, { useState } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { getDailyAnalytics, getMonthlyAnalytics, getYearlyAnalytics } from "@/api/admin";

export function AdminFinance({
  overallStats,
  overallLoading = false,
}) {
  const [financialReportType, setFinancialReportType] = useState("daily");
  const [customReportData, setCustomReportData] = useState(null);
  const [financialLoading, setFinancialLoading] = useState(false);

  const fetchCustomFinancialReport = async (e) => {
    e.preventDefault();
    setFinancialLoading(true);
    setCustomReportData(null);
    const formData = new FormData(e.target);

    try {
      let data = null;
      if (financialReportType === "daily") {
        const dateVal = formData.get("date");
        data = await getDailyAnalytics(dateVal);
      } else if (financialReportType === "monthly") {
        const monthYear = formData.get("monthYear");
        if (monthYear) {
          const [year, month] = monthYear.split("-");
          data = await getMonthlyAnalytics(parseInt(month, 10), parseInt(year, 10));
        }
      } else if (financialReportType === "yearly") {
        const year = formData.get("year");
        data = await getYearlyAnalytics(parseInt(year, 10));
      }

      setCustomReportData(data);
    } catch (err) {
      setCustomReportData({ error: err.message || "Failed to load audit report" });
    } finally {
      setFinancialLoading(false);
    }
  };

  return (
    <div className="space-y-6 text-left animate-fade-up">
      {/* Financial Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-slate-900 text-white rounded-2xl p-6 shadow-md flex flex-col justify-between relative overflow-hidden border border-slate-800">
          <div className="absolute top-[-10%] right-[-10%] w-32 h-32 bg-[#00ABE4]/10 rounded-full blur-2xl"></div>
          <div>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Cumulative Value</p>
            <p className="text-[10px] text-slate-400 font-medium italic">(Since database initiation)</p>
          </div>
          {overallLoading ? (
            <p className="text-xl font-bold mt-4 animate-pulse">Running metrics...</p>
          ) : (
            <p className="text-3xl font-black text-[#00ABE4] mt-4">
              ₹{overallStats?.totalBusiness !== undefined ? parseFloat(overallStats.totalBusiness).toFixed(2) : "0.00"}
            </p>
          )}
        </Card>

        {/* Category Sales Breakdown */}
        <Card className="bg-white border border-slate-205 rounded-2xl p-5 shadow-xs md:col-span-2 text-left">
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Overall Category Sales Distribution</h3>
          {overallLoading ? (
            <p className="text-xs text-slate-400 italic">Calculating categories...</p>
          ) : overallStats?.categorySales && Object.keys(overallStats.categorySales).length > 0 ? (
            <div className="flex flex-wrap gap-2.5">
              {Object.entries(overallStats.categorySales).map(([cat, val]) => (
                <div key={cat} className="bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl text-xs flex items-center gap-2">
                  <span className="font-semibold text-slate-500">{cat}:</span>
                  <span className="font-black text-slate-800">{val} checkouts</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-400 italic">No checkout categories indexed.</p>
          )}
        </Card>
      </div>

      {/* Custom Financial Reports */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Report Form */}
        <Card className="bg-white border border-slate-205 rounded-2xl p-5 shadow-xs text-left space-y-4">
          <div>
            <h3 className="text-sm font-bold text-slate-800">Generate Audit Report</h3>
            <p className="text-xs text-slate-400">Select parameters to query billing database.</p>
          </div>

          <form onSubmit={fetchCustomFinancialReport} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 uppercase">Audit Interval</label>
              <div className="flex gap-2">
                {["daily", "monthly", "yearly"].map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => {
                      setFinancialReportType(type);
                      setCustomReportData(null);
                    }}
                    className={`flex-grow h-9 text-xs font-bold rounded-xl border transition-all cursor-pointer ${
                      financialReportType === type
                        ? "bg-slate-900 border-slate-900 text-white"
                        : "bg-white border-slate-250 text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {financialReportType === "daily" && (
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 uppercase">Select Target Date</label>
                <Input type="date" id="date" name="date" required className="text-xs h-10" />
              </div>
            )}

            {financialReportType === "monthly" && (
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 uppercase">Select Month & Year</label>
                <Input type="month" id="monthYear" name="monthYear" required className="text-xs h-10" />
              </div>
            )}

            {financialReportType === "yearly" && (
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 uppercase">Select Target Year</label>
                <select
                  id="year"
                  name="year"
                  required
                  className="flex h-10 w-full rounded-xl border border-slate-350 bg-white px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-[#00ABE4]"
                >
                  {Array.from({ length: 11 }, (_, i) => 2020 + i).map((y) => (
                    <option key={y} value={y}>
                      {y}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <Button type="submit" disabled={financialLoading} className="w-full text-xs font-bold h-10 cursor-pointer">
              {financialLoading ? "Running query..." : "Query Database"}
            </Button>
          </form>
        </Card>

        {/* Audit calculation results */}
        <Card className="bg-white border border-slate-205 rounded-2xl p-5 shadow-xs text-left lg:col-span-2 flex flex-col justify-between min-h-[300px]">
          <div>
            <h3 className="text-sm font-bold text-slate-800">Audit Calculation Results</h3>
            <p className="text-xs text-slate-400">Values generated from specific query parameters.</p>
          </div>

          <div className="flex-grow flex flex-col justify-center py-4">
            {financialLoading ? (
              <div className="text-center text-slate-400 animate-pulse text-xs italic">Auditing database records...</div>
            ) : !customReportData ? (
              <div className="text-center text-slate-400 text-xs italic">Select scope parameters and run query.</div>
            ) : customReportData.error ? (
              <div className="bg-red-50 text-red-700 text-xs p-3 rounded-xl border border-red-150 text-center font-medium">
                {customReportData.error}
              </div>
            ) : (
              <div className="space-y-6">
                <div className="bg-slate-50 rounded-2xl p-5 flex justify-between items-center border border-slate-150">
                  <span className="text-xs font-bold text-slate-600">Sum Business Value</span>
                  <span className="text-2xl font-black text-slate-900">
                    ₹{customReportData.totalBusiness !== undefined ? parseFloat(customReportData.totalBusiness).toFixed(2) : "0.00"}
                  </span>
                </div>

                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-slate-800 border-b border-slate-150 pb-2">Category Sales breakdown:</h4>
                  {customReportData.categorySales && Object.keys(customReportData.categorySales).length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-40 overflow-y-auto pr-1">
                      {Object.entries(customReportData.categorySales).map(([cat, val]) => (
                        <div key={cat} className="flex justify-between items-center text-xs py-2 px-3 bg-slate-50 border border-slate-150 rounded-xl">
                          <span className="text-slate-500 font-semibold">{cat}</span>
                          <span className="font-extrabold text-slate-800">{val} units</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-slate-400 italic">No sales recorded for this period.</p>
                  )}
                </div>
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
