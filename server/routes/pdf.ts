import express from "express";
import puppeteer from "puppeteer";
import path from "path";
import fs from "fs";
import {
  authenticateToken,
  requirePermission,
  AuthRequest,
} from "../middleware/auth.js";
import { dbGet, dbAll } from "../database/config.js";

const router = express.Router();

// Helper to ensure PDF directory exists
async function ensurePdfDir() {
  const dir = path.join(process.cwd(), "tmp", "pdfs");
  await fs.promises.mkdir(dir, { recursive: true });
  return dir;
}

// GET /api/pdf/money-receipt?application_id=...
router.get(
  "/money-receipt",
  authenticateToken,
  requirePermission("applications:view"),
  async (req: AuthRequest, res) => {
    const { application_id } = req.query as any;
    if (!application_id) {
      return res
        .status(400)
        .json({ success: false, error: "application_id is required" });
    }

    try {
      const application = await dbGet(
        `SELECT * FROM applications WHERE id = ?`,
        [application_id],
      );
      if (!application) {
        return res
          .status(404)
          .json({ success: false, error: "Application not found" });
      }

      // Fetch fee details (assuming a fee structure or bill exists)
      // For demo purposes, we'll use mock data or simplified structure
      const feeDetails = await dbGet(
        `SELECT * FROM student_bills WHERE application_id = ? AND status = 'Paid' ORDER BY paid_at DESC LIMIT 1`,
        [application_id],
      );
      if (!feeDetails) {
        return res
          .status(404)
          .json({
            success: false,
            error: "No paid fee details found for this application",
          });
      }

      const browser = await puppeteer.launch({
        headless: true,
        args: ["--no-sandbox", "--disable-setuid-sandbox"],
      });
      const page = await browser.newPage();

      // Construct HTML content for the receipt
      // This is a simplified HTML structure for demo purposes
      const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Money Receipt</title>
        <style>
          body { font-family: 'Arial', sans-serif; margin: 40px; }
          .receipt { border: 1px solid #ccc; padding: 30px; border-radius: 8px; max-width: 700px; margin: auto; }
          .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #eee; padding-bottom: 20px; }
          .header h1 { margin: 0; color: #333; }
          .header p { margin: 5px 0; color: #555; font-size: 0.9em; }
          .details { display: flex; justify-content: space-between; margin-bottom: 30px; }
          .details div { width: 48%; }
          .details label { font-weight: bold; color: #444; display: block; margin-bottom: 5px; }
          .details span { color: #666; }
          .items-table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
          .items-table th, .items-table td { border: 1px solid #ddd; padding: 10px; text-align: left; }
          .items-table th { background-color: #f8f8f8; color: #333; }
          .items-table td.amount { text-align: right; }
          .footer { text-align: center; margin-top: 30px; border-top: 2px solid #eee; padding-top: 20px; font-size: 0.8em; color: #777; }
        </style>
      </head>
      <body>
        <div class="receipt">
          <div class="header">
            <h1>Northern University Bangladesh</h1>
            <p>Receipt for Admission Fee Payment</p>
            <p>Plot: 10, Road: 12, Sector: 06, Uttara, Dhaka-1230</p>
          </div>
          <div class="details">
            <div>
              <label>Application ID:</label> <span>${application.tracking_id || application.id}</span>
            </div>
            <div>
              <label>Payment Date:</label> <span>${new Date(feeDetails.paid_at || feeDetails.due_date).toLocaleDateString()}</span>
            </div>
          </div>
          <div class="details">
            <div>
              <label>Student Name:</label> <span>${application.first_name} ${application.last_name}</span>
            </div>
            <div>
              <label>Program:</label> <span>${application.program || "N/A"}</span>
            </div>
          </div>
          <table class="items-table">
            <thead>
              <tr>
                <th>Description</th>
                <th>Amount</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td class="amount">Admission Fee</td>
                <td class="amount">${feeDetails.amount.toFixed(2)}</td>
              </tr>
              <!-- Add more fee items if available -->
            </tbody>
          </table>
          <div class="details">
            <div>
              <label>Total Amount Paid:</label> <span style="font-size: 1.2em; font-weight: bold;">BDT ${feeDetails.amount.toFixed(2)}</span>
            </div>
            <div>
              <label>Payment Status:</label> <span style="font-weight: bold; color: green;">Paid</span>
            </div>
          </div>
          <div class="footer">
            <p>This is a computer-generated receipt and requires no signature.</p>
            <p>Thank you for choosing Northern University Bangladesh.</p>
          </div>
        </div>
      </body>
      </html>
    `;

      await page.setContent(htmlContent, { waitUntil: "networkidle0" });
      const pdfBuffer = await page.pdf({ format: "A4", printBackground: true });

      await browser.close();

      res.setHeader("Content-Type", "application/pdf");
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="money_receipt_${application.tracking_id || application.id}.pdf"`,
      );
      res.send(pdfBuffer);
    } catch (error) {
      console.error("Money receipt PDF generation failed:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  },
);

export default router;
