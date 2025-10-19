import express from "express";
import { protect, adminOnly } from "../middleware/auth.js";
const router = express.Router();

router.post("/receipt", protect, async (req, res) => {
  const { receiptHtml, useServerPrint } = req.body;
  // If useServerPrint true, attempt network print via escpos (example).
  if (useServerPrint && process.env.PRINTER_IP) {
    try {
      // Basic network raw-print example using net.Socket
      const net = await import("net");
      const client = new net.Socket();
      client.connect(
        parseInt(process.env.PRINTER_PORT || "9100"),
        process.env.PRINTER_IP,
        () => {
          client.write(Buffer.from(receiptHtml + "\n\n\n"));
          client.end();
        }
      );
      client.on("close", () => res.json({ msg: "Sent to printer" }));
      client.on("error", (err) => {
        console.error("Printer error:", err);
        res.status(500).json({ msg: "Printer error", err: err.message });
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ msg: "Print failed" });
    }
  } else {
    // If not server printing, return success — frontend can do window.print()
    res.json({ msg: "Use client print (window.print())", ok: true });
  }
});

export default router;
